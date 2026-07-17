import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import mediaRepository from '../repositories/media.repository.js';
import walletRepository from '../repositories/wallet.repository.js';
import Image from '../models/Image.js';
import AppError from '../utils/AppError.js';
import pool from '../config/db.js';
import { SHARP_CONFIG } from '../config/sharp.js';
import cloudinary from '../config/cloudinary.js';

/**
 * Media Service
 * Handles business rules for uploading media, resizing/blurring previews, and managing listings.
 */
class MediaService {
  /**
   * Process uploaded original image, generate blurred preview, and save metadata
   * @param {Object} uploadData 
   * @returns {Promise<Image>}
   */
  async uploadMedia({ file, title, description, unlock_price, owner_id }) {
    if (!file) {
      throw new AppError('Image file is required.', 400);
    }

    const previewFilename = `preview-${file.filename}`;
    const previewPath = path.join(path.dirname(file.path), previewFilename);

    let originalUpload;
    let previewUpload;

    try {
      // 1. Process preview thumbnail image locally in temp directory
      await sharp(file.path)
        .resize(SHARP_CONFIG.preview.width, SHARP_CONFIG.preview.height, {
          fit: SHARP_CONFIG.preview.fit
        })
        .blur(SHARP_CONFIG.preview.blurSigma)
        .jpeg({ quality: SHARP_CONFIG.preview.quality })
        .toFile(previewPath);

      // 2. Upload original full-resolution image to Cloudinary as standard asset
      originalUpload = await cloudinary.uploader.upload(file.path, {
        folder: 'media_vault_originals',
        resource_type: 'image'
      });

      // 3. Upload processed blurred preview image to Cloudinary as public asset
      previewUpload = await cloudinary.uploader.upload(previewPath, {
        folder: 'media_vault_previews',
        resource_type: 'image'
      });
    } catch (err) {
      throw new AppError(`Failed to process or upload image: ${err.message}`, 500);
    } finally {
      // 4. Clean up / delete local temporary files
      try {
        if (fs.existsSync(file.path)) {
          await fs.promises.unlink(file.path);
        }
        if (fs.existsSync(previewPath)) {
          await fs.promises.unlink(previewPath);
        }
      } catch (cleanupErr) {
        console.warn('Temporary file cleanup failed:', cleanupErr.message);
      }
    }

    const originalPathData = JSON.stringify({
      public_id: originalUpload.public_id,
      secure_url: originalUpload.secure_url
    });

    const mediaRow = await mediaRepository.createMedia({
      owner_id,
      title,
      description,
      original_filename: file.originalname,
      mime_type: file.mimetype,
      file_size: file.size,
      original_path: originalPathData,
      preview_path: previewUpload.secure_url,
      unlock_price
    });

    return new Image(mediaRow);
  }

  /**
   * Retrieve feed with locked state check per requester context
   * @param {Object} feedParams 
   * @returns {Promise<Array<Object>>}
   */
  async getMediaFeed({ page, limit, user }) {
    const pageNum = parseInt(page || '1', 10);
    const limitNum = parseInt(limit || '10', 10);
    const offset = (pageNum - 1) * limitNum;

    // mediaRepository.getFeed filters by is_deleted = 0
    const rows = await mediaRepository.getFeed({ limit: limitNum, offset });

    const feedItems = [];
    for (const row of rows) {
      const isOwner = user && user.id.toString() === row.owner_id.toString();
      
      // Look up purchase status if the user is not the owner
      const purchaseRecord = isOwner ? null : await mediaRepository.findPurchase(user.id, row.id);
      const isUnlocked = isOwner || !!purchaseRecord;

      feedItems.push({
        id: row.id.toString(),
        owner_name: row.owner_name,
        title: row.title,
        description: row.description,
        preview_path: row.preview_path,
        unlock_price: row.unlock_price,
        created_at: row.created_at,
        locked: !isUnlocked
      });
    }

    return feedItems;
  }

  /**
   * Retrieve media details by ID with locked state check
   * @param {string|number} id 
   * @param {Object} user 
   * @returns {Promise<Object>}
   */
  async getMediaDetails(id, user) {
    // findMediaById already includes and checks that is_deleted = 0
    const row = await mediaRepository.findMediaById(id);
    if (!row) {
      throw new AppError('Media item not found.', 404);
    }

    const isOwner = user && user.id.toString() === row.owner_id.toString();
    const purchaseRecord = isOwner ? null : await mediaRepository.findPurchase(user.id, row.id);
    const isUnlocked = isOwner || !!purchaseRecord;

    return {
      id: row.id.toString(),
      owner_id: row.owner_id.toString(),
      owner_name: row.owner_name,
      title: row.title,
      description: row.description,
      preview_path: row.preview_path,
      original_path: row.original_path,
      unlock_price: row.unlock_price,
      created_at: row.created_at,
      locked: !isUnlocked
    };
  }

  /**
   * Retrieve every image the authenticated user has unlocked
   * @param {number|string} userId 
   * @returns {Promise<Array<Object>>}
   */
  async getPurchasedMedia(userId) {
    const rows = await mediaRepository.getPurchasedMedia(userId);
    return rows.map((row) => ({
      id: row.id.toString(),
      owner_name: row.owner_name,
      title: row.title,
      description: row.description,
      preview_path: row.preview_path,
      unlock_price: row.unlock_price,
      purchased_at: row.purchased_at
    }));
  }

  /**
   * Executes a database-transaction-wrapped coin deduction and seller credit to unlock media
   * @param {number|string} imageId 
   * @param {Object} user The authenticated buyer User model
   * @returns {Promise<Object>} Status result
   */
  async unlockMedia(imageId, user) {
    // 1. Fetch target image and verify exists
    const image = await mediaRepository.findMediaById(imageId);
    if (!image) {
      throw new AppError('Media item not found.', 404);
    }

    // 2. Owner bypass logic: owners access/stream without payments or transaction logs
    const isOwner = user.id.toString() === image.owner_id.toString();
    if (isOwner) {
      return { status: 'success', message: 'Image already unlocked.' };
    }

    // 3. Duplicate check: verify if already unlocked
    const existingPurchase = await mediaRepository.findPurchase(user.id, image.id);
    if (existingPurchase) {
      return { status: 'success', message: 'Image already unlocked.' };
    }

    // 4. Balance check: verify buyer has sufficient coins
    const walletBalance = await walletRepository.getWallet(user.id);
    if (walletBalance < image.unlock_price) {
      throw new AppError('Insufficient wallet balance.', 403);
    }

    // 5. Execute MySQL atomic transaction checking affected row counts
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Step A: Deduct price from buyer
      const [buyerResult] = await connection.query(
        'UPDATE users SET wallet_balance = wallet_balance - ? WHERE id = ?',
        [image.unlock_price, user.id]
      );
      if (buyerResult.affectedRows !== 1) {
        throw new Error('Buyer wallet deduction failed');
      }

      // Step B: Credit price to seller
      const [sellerResult] = await connection.query(
        'UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?',
        [image.unlock_price, image.owner_id]
      );
      if (sellerResult.affectedRows !== 1) {
        throw new Error('Seller wallet credit failed');
      }

      // Step C: Write purchase relation
      const [purchaseResult] = await connection.query(
        'INSERT INTO purchases (user_id, image_id) VALUES (?, ?)',
        [user.id, image.id]
      );
      if (purchaseResult.affectedRows !== 1) {
        throw new Error('Purchase record insertion failed');
      }

      // Step D: Log buyer DEBIT audit transaction
      const [buyerTxResult] = await connection.query(
        'INSERT INTO transactions (user_id, amount, type, description) VALUES (?, ?, "PURCHASE", ?)',
        [user.id, -image.unlock_price, `Purchased image: ${image.title}`]
      );
      if (buyerTxResult.affectedRows !== 1) {
        throw new Error('Buyer transaction logging failed');
      }

      // Step E: Log seller CREDIT audit transaction
      const [sellerTxResult] = await connection.query(
        'INSERT INTO transactions (user_id, amount, type, description) VALUES (?, ?, "EARNING", ?)',
        [image.owner_id, image.unlock_price, `Sold image: ${image.title}`]
      );
      if (sellerTxResult.affectedRows !== 1) {
        throw new Error('Seller transaction logging failed');
      }

      await connection.commit();
      return { status: 'success', message: 'Image unlocked successfully.' };
    } catch (error) {
      await connection.rollback();
      throw new AppError(`Unlock transaction rolled back: ${error.message}`, 500);
    } finally {
      connection.release();
    }
  }

  /**
   * Soft deletes a media listing, checking owner authorization
   * @param {number|string} id 
   * @param {Object} user Authenticated user model
   * @returns {Promise<boolean>}
   */
  async deleteMedia(id, user) {
    const image = await mediaRepository.findMediaById(id);
    if (!image) {
      throw new AppError('Media item not found.', 404);
    }

    const isOwner = user.id.toString() === image.owner_id.toString();
    if (!isOwner) {
      throw new AppError('Forbidden: only the owner can delete this media.', 403);
    }

    return await mediaRepository.softDeleteMedia(id);
  }
}

export default new MediaService();

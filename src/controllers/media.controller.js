import path from 'path';
import axios from 'axios';
import mediaService from '../services/media.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import { buildFileUrl } from '../utils/url.js';
import cloudinary from '../config/cloudinary.js';

/**
 * Media Controller
 * Intercepts incoming HTTP requests for uploading, fetching feed items, getting details, unlocking, and streaming originals.
 */
export const uploadMedia = asyncHandler(async (req, res) => {
  const { title, description, unlock_price } = req.body;

  if (!req.file) {
    throw new AppError('Image file is required.', 400);
  }

  const image = await mediaService.uploadMedia({
    file: req.file,
    title,
    description,
    unlock_price: parseInt(unlock_price, 10),
    owner_id: req.user.id
  });

  const previewUrl = buildFileUrl(req, image.preview_path);

  res.status(201).json({
    status: 'success',
    message: 'Media uploaded successfully',
    data: {
      id: image.id.toString(),
      title: image.title,
      description: image.description,
      preview_url: previewUrl,
      unlock_price: image.unlock_price,
      created_at: image.created_at
    }
  });
});

export const getMediaFeed = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;

  const items = await mediaService.getMediaFeed({
    page,
    limit,
    user: req.user
  });

  const feedData = items.map((item) => {
    const previewUrl = buildFileUrl(req, item.preview_path);
    return {
      id: item.id,
      owner_name: item.owner_name,
      title: item.title,
      description: item.description,
      preview_url: previewUrl,
      unlock_price: item.unlock_price,
      created_at: item.created_at,
      locked: item.locked
    };
  });

  res.status(200).json({
    status: 'success',
    results: feedData.length,
    data: feedData
  });
});

export const getMediaDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const details = await mediaService.getMediaDetails(id, req.user);
  const previewUrl = buildFileUrl(req, details.preview_path);

  res.status(200).json({
    status: 'success',
    data: {
      id: details.id,
      owner_id: details.owner_id,
      owner_name: details.owner_name,
      title: details.title,
      description: details.description,
      preview_url: previewUrl,
      unlock_price: details.unlock_price,
      created_at: details.created_at,
      locked: details.locked
    }
  });
});

/**
 * Handle unlock purchase request
 */
export const unlockMedia = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = req.user;

  const result = await mediaService.unlockMedia(id, user);

  res.status(200).json(result);
});

/**
 * Stream/Send original high-resolution file to authorized users
 */
export const getOriginalMedia = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = req.user;

  // Retrieve details including paths and locked resolution status
  const details = await mediaService.getMediaDetails(id, user);

  // If image is locked to this user, block access
  if (details.locked) {
    throw new AppError('Forbidden access.', 403);
  }

  // Check if original_path is stored as a Cloudinary JSON structure
  let isCloudinary = false;
  let originalData;
  try {
    originalData = JSON.parse(details.original_path);
    if (originalData && originalData.public_id && originalData.secure_url) {
      isCloudinary = true;
    }
  } catch (e) {
    // Treat as legacy local path
  }

  if (isCloudinary) {
    try {
      // Generate a secure, short-lived signed URL for private Cloudinary asset
      const signedUrl = cloudinary.url(originalData.public_id, {
        type: 'private',
        sign_url: true,
        expires_at: Math.floor(Date.now() / 1000) + 60 // 60 seconds expiration
      });

      // Stream the image from Cloudinary to Express response
      const response = await axios({
        url: signedUrl,
        method: 'GET',
        responseType: 'stream'
      });

      res.setHeader('Content-Type', details.mime_type || 'image/jpeg');
      response.data.pipe(res);
    } catch (err) {
      throw new AppError(`Failed to stream original media from Cloudinary: ${err.message}`, 500);
    }
  } else {
    // Stream high-res original image directly from the secure original folder (legacy fallback)
    const absolutePath = path.resolve(details.original_path);
    res.sendFile(absolutePath);
  }
});

/**
 * Get list of media purchased by current user
 */
export const getPurchasedMedia = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const items = await mediaService.getPurchasedMedia(userId);

  const purchasedData = items.map((item) => {
    const previewUrl = buildFileUrl(req, item.preview_path);
    return {
      id: item.id,
      owner_name: item.owner_name,
      title: item.title,
      description: item.description,
      preview_url: previewUrl,
      unlock_price: item.unlock_price,
      purchased_at: item.purchased_at
    };
  });

  res.status(200).json({
    status: 'success',
    results: purchasedData.length,
    data: purchasedData
  });
});

/**
 * Delete media listing (soft delete)
 */
export const deleteMedia = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = req.user;

  await mediaService.deleteMedia(id, user);

  res.status(200).json({
    status: 'success',
    message: 'Media deleted successfully'
  });
});

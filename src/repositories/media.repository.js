import pool from '../config/db.js';

/**
 * Media Repository
 * Direct MySQL data access operations for media uploads, listings, views, and unlock status checking.
 */
class MediaRepository {
  /**
   * Insert new image metadata into the database
   * @param {Object} mediaData 
   * @returns {Promise<Object>} The inserted image row
   */
  async createMedia({ owner_id, title, description, original_filename, mime_type, file_size, original_path, preview_path, unlock_price }) {
    const [result] = await pool.query(
      `INSERT INTO images (
        owner_id, title, description, original_filename, mime_type, file_size, original_path, preview_path, unlock_price
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [owner_id, title, description, original_filename, mime_type, file_size, original_path, preview_path, unlock_price]
    );

    const [rows] = await pool.query('SELECT * FROM images WHERE id = ?', [result.insertId]);
    return rows[0];
  }

  /**
   * Find an image by its ID, including the owner's name
   * @param {number|string} id 
   * @returns {Promise<Object|null>} The image row with owner details
   */
  async findMediaById(id) {
    const [rows] = await pool.query(
      `SELECT i.*, u.name as owner_name 
       FROM images i 
       JOIN users u ON i.owner_id = u.id 
       WHERE i.id = ? AND i.is_deleted = 0`,
      [id]
    );
    return rows[0] || null;
  }

  /**
   * Retrieve a paginated list of active images ordered by creation date (newest first)
   * @param {Object} paginationParams 
   * @returns {Promise<Array<Object>>} List of active images with owner names
   */
  async getFeed({ limit, offset }) {
    const [rows] = await pool.query(
      `SELECT i.id, i.owner_id, i.title, i.description, i.preview_path, i.unlock_price, i.created_at, u.name as owner_name 
       FROM images i 
       JOIN users u ON i.owner_id = u.id 
       WHERE i.is_deleted = 0 
       ORDER BY i.created_at DESC 
       LIMIT ? OFFSET ?`,
      [parseInt(limit, 10), parseInt(offset, 10)]
    );
    return rows;
  }

  /**
   * Find all active images uploaded by a specific owner
   * @param {number|string} ownerId 
   * @returns {Promise<Array<Object>>}
   */
  async findMediaByOwner(ownerId) {
    const [rows] = await pool.query(
      'SELECT * FROM images WHERE owner_id = ? AND is_deleted = 0 ORDER BY created_at DESC',
      [ownerId]
    );
    return rows;
  }

  /**
   * Find an unlock purchase record
   * @param {number|string} userId 
   * @param {number|string} imageId 
   * @returns {Promise<Object|null>}
   */
  async findPurchase(userId, imageId) {
    const [rows] = await pool.query(
      'SELECT * FROM purchases WHERE user_id = ? AND image_id = ?',
      [userId, imageId]
    );
    return rows[0] || null;
  }

  /**
   * Create an unlock purchase record (supports transaction connections)
   * @param {number|string} userId 
   * @param {number|string} imageId 
   * @param {Object} [connection] Optional transaction connection
   * @returns {Promise<Object>}
   */
  async createPurchase(userId, imageId, connection = pool) {
    const [result] = await connection.query(
      'INSERT INTO purchases (user_id, image_id) VALUES (?, ?)',
      [userId, imageId]
    );
    const [rows] = await connection.query('SELECT * FROM purchases WHERE id = ?', [result.insertId]);
    return rows[0];
  }

  /**
   * Deduct coins from a user's wallet balance
   * @param {number|string} userId 
   * @param {number} amount 
   * @param {Object} [connection] Optional transaction connection
   */
  async deductWallet(userId, amount, connection = pool) {
    await connection.query(
      'UPDATE users SET wallet_balance = wallet_balance - ? WHERE id = ?',
      [amount, userId]
    );
  }

  /**
   * Credit coins to a user's wallet balance
   * @param {number|string} userId 
   * @param {number} amount 
   * @param {Object} [connection] Optional transaction connection
   */
  async creditWallet(userId, amount, connection = pool) {
    await connection.query(
      'UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?',
      [amount, userId]
    );
  }

  /**
   * Log a new transaction audit record
   * @param {Object} txData 
   * @param {Object} [connection] Optional transaction connection
   */
  async createTransaction({ user_id, amount, type, description }, connection = pool) {
    await connection.query(
      'INSERT INTO transactions (user_id, amount, type, description) VALUES (?, ?, ?, ?)',
      [user_id, amount, type, description]
    );
  }

  /**
   * Retrieve every image the user has purchased
   * @param {number|string} userId 
   * @returns {Promise<Array<Object>>}
   */
  async getPurchasedMedia(userId) {
    const [rows] = await pool.query(
      `SELECT i.id, i.owner_id, i.title, i.description, i.preview_path, i.unlock_price, i.created_at, u.name as owner_name, p.created_at as purchased_at 
       FROM purchases p 
       JOIN images i ON p.image_id = i.id 
       JOIN users u ON i.owner_id = u.id 
       WHERE p.user_id = ? AND i.is_deleted = 0 
       ORDER BY p.created_at DESC`,
      [userId]
    );
    return rows;
  }

  /**
   * Soft delete an image by setting is_deleted = 1
   * @param {number|string} id 
   * @returns {Promise<boolean>} True if updated successfully
   */
  async softDeleteMedia(id) {
    const [result] = await pool.query(
      'UPDATE images SET is_deleted = 1 WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
}

export default new MediaRepository();

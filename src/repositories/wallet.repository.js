import pool from '../config/db.js';

/**
 * Wallet Repository
 * Direct MySQL database operations for checking balance and retrieving transaction history.
 */
class WalletRepository {
  /**
   * Fetch current wallet balance directly from the users table
   * @param {number|string} userId 
   * @returns {Promise<number>} Current wallet balance
   */
  async getWallet(userId) {
    const [rows] = await pool.query('SELECT wallet_balance FROM users WHERE id = ?', [userId]);
    if (!rows[0]) {
      return 0;
    }
    return rows[0].wallet_balance;
  }

  /**
   * Retrieve a user's transaction history ordered newest first
   * @param {number|string} userId 
   * @returns {Promise<Array<Object>>} Transaction audit history
   */
  async getTransactions(userId) {
    const [rows] = await pool.query(
      `SELECT amount, type, description, created_at 
       FROM transactions 
       WHERE user_id = ? 
       ORDER BY created_at DESC`,
      [userId]
    );
    return rows;
  }
}

export default new WalletRepository();

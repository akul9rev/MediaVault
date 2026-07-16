import pool from '../config/db.js';

/**
 * Authentication Repository
 * Direct MySQL data access operations for auth flow (creation, fetching credentials).
 */
class AuthRepository {
  /**
   * Find a user by email
   * @param {string} email 
   * @returns {Promise<Object|null>}
   */
  async findByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null;
  }

  /**
   * Find a user by ID
   * @param {number|string} id 
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0] || null;
  }

  /**
   * Creates a new user and logs their signup transaction atomically
   * @param {Object} userData 
   * @returns {Promise<Object>} The created user row
   */
  async createUser({ name, email, password_hash }) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // 1. Insert new user with default balance (100 coins)
      const [userResult] = await connection.query(
        'INSERT INTO users (name, email, password_hash, wallet_balance) VALUES (?, ?, ?, 100)',
        [name, email, password_hash]
      );
      const userId = userResult.insertId;

      // 2. Log initial wallet signup transaction
      await connection.query(
        'INSERT INTO transactions (user_id, amount, type, description) VALUES (?, 100, "SIGNUP", ?)',
        [userId, 'Initial sign-up balance credit']
      );

      await connection.commit();

      // Retrieve and return the created user details
      const [rows] = await connection.query('SELECT * FROM users WHERE id = ?', [userId]);
      return rows[0];
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

export default new AuthRepository();

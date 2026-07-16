import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import authRepository from '../repositories/auth.repository.js';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Authentication Service
 * Decouples business rules for registration and authentication from Express controllers.
 */
class AuthService {
  /**
   * Register a new user
   * @param {Object} registerData 
   * @returns {Promise<User>} The registered User model instance
   */
  async register({ name, email, password }) {
    // 1. Check if user already exists
    const existingUser = await authRepository.findByEmail(email);
    if (existingUser) {
      throw new AppError('Email is already registered.', 409);
    }

    // 2. Hash password using bcrypt (12 salt rounds)
    const password_hash = await bcrypt.hash(password, 12);

    // 3. Persist new user in database
    const userRow = await authRepository.createUser({
      name,
      email,
      password_hash
    });

    return new User(userRow);
  }

  /**
   * Log in user and generate token
   * @param {Object} credentials 
   * @returns {Promise<{token: string, user: User}>} Auth token and user details
   */
  async login({ email, password }) {
    // 1. Fetch user by email
    const userRow = await authRepository.findByEmail(email);
    if (!userRow) {
      throw new AppError('Invalid email or password.', 401);
    }

    // 2. Verify password hash matches
    const isPasswordCorrect = await bcrypt.compare(password, userRow.password_hash);
    if (!isPasswordCorrect) {
      throw new AppError('Invalid email or password.', 401);
    }

    // 3. Generate JWT bearer token
    const token = this.generateToken(userRow);

    return {
      token,
      user: new User(userRow)
    };
  }

  /**
   * Sign JWT payload
   * @param {Object} userRow 
   * @returns {string} Signed JWT token
   */
  generateToken(userRow) {
    const payload = {
      id: userRow.id.toString(), // Convert BigInt to string safe for JWT
      email: userRow.email
    };

    const secret = process.env.JWT_SECRET || 'fallback_secret_key_12345';
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

    return jwt.sign(payload, secret, { expiresIn });
  }
}

export default new AuthService();

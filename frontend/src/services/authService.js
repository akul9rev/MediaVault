import api from './api';

/**
 * Authentication API Service
 * Wraps network requests for login and registration.
 */
export const authService = {
  /**
   * Send login credentials to backend
   * @param {string} email 
   * @param {string} password 
   * @returns {Promise<Object>} Response containing JWT token and user profile
   */
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  /**
   * Send registration details to backend
   * @param {string} name 
   * @param {string} email 
   * @param {string} password 
   * @returns {Promise<Object>}
   */
  register: async (name, email, password) => {
    const response = await api.post('/auth/register', { name, email, password });
    return response.data;
  }
};

export default authService;

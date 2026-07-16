import api from './api';

/**
 * Wallet API Service
 * Coordinates network requests for user coin balances and ledger details.
 */
export const walletService = {
  /**
   * Fetch logged in user's latest coin balance
   * @returns {Promise<Object>} Response containing wallet balance value
   */
  getBalance: async () => {
    const response = await api.get('/wallet');
    return response.data;
  },

  /**
   * Fetch transaction audit logs
   * @returns {Promise<Object>} Response containing results and transaction rows array
   */
  getTransactions: async () => {
    const response = await api.get('/wallet/transactions');
    return response.data;
  }
};

export default walletService;

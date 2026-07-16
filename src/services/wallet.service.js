import walletRepository from '../repositories/wallet.repository.js';

/**
 * Wallet Service
 * Coordinates user balance retrievals and transaction histories.
 */
class WalletService {
  /**
   * Fetch a user's current wallet balance
   * @param {number|string} userId 
   * @returns {Promise<number>}
   */
  async getWalletBalance(userId) {
    return await walletRepository.getWallet(userId);
  }

  /**
   * Retrieve a user's wallet transactions history
   * @param {number|string} userId 
   * @returns {Promise<Array<Object>>}
   */
  async getTransactionHistory(userId) {
    return await walletRepository.getTransactions(userId);
  }
}

export default new WalletService();

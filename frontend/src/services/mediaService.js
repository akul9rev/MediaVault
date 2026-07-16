import api from './api';

/**
 * Media API Service
 * Wraps backend calls for media feeds, details, unlocks, and file uploads.
 */
export const mediaService = {
  /**
   * Retrieve paginated list of media items
   * @param {number} page 
   * @param {number} limit 
   * @returns {Promise<Object>} Response containing page data feed
   */
  getFeed: async (page = 1, limit = 10) => {
    const response = await api.get('/media', {
      params: { page, limit }
    });
    return response.data;
  },

  /**
   * Fetch single media detailed metadata
   * @param {string|number} id 
   * @returns {Promise<Object>}
   */
  getDetails: async (id) => {
    const response = await api.get(`/media/${id}`);
    return response.data;
  },

  /**
   * Unlock target locked media item
   * @param {string|number} id 
   * @returns {Promise<Object>}
   */
  unlockMedia: async (id) => {
    const response = await api.post(`/media/${id}/unlock`);
    return response.data;
  },

  /**
   * Upload image file and pricing metadata as multipart/form-data
   * @param {FormData} formData 
   * @param {Function} onUploadProgress Axios progress callback
   * @returns {Promise<Object>}
   */
  uploadMedia: async (formData, onUploadProgress) => {
    const response = await api.post('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress
    });
    return response.data;
  },

  /**
   * Fetch list of media purchased/unlocked by the user
   * @returns {Promise<Object>}
   */
  getPurchasedMedia: async () => {
    const response = await api.get('/media/purchased');
    return response.data;
  },

  /**
   * Delete media listing
   * @param {string|number} id 
   * @returns {Promise<Object>}
   */
  deleteMedia: async (id) => {
    const response = await api.delete(`/media/${id}`);
    return response.data;
  }
};

export default mediaService;

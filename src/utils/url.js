import path from 'path';

/**
 * Reusable Helper to Dynamically Generate File URLs
 * Uses request context to construct fully qualified URLs automatically supporting localhost, LAN IP, and production.
 * @param {Object} req Express request object
 * @param {string} filePath Absolute or relative path to the file
 * @returns {string} Fully qualified URL
 */
export const buildFileUrl = (req, filePath) => {
  if (!filePath) return '';
  // If the path is already a full Cloudinary HTTP/HTTPS URL, return it directly
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath;
  }
  const filename = path.basename(filePath);
  return `${req.protocol}://${req.get('host')}/uploads/previews/${filename}`;
};

export default buildFileUrl;

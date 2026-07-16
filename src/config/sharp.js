// Sharp Image Processing Configuration Options
export const SHARP_CONFIG = {
  preview: {
    width: 600,            // Resized width for preview image
    height: 600,           // Resized height for preview image
    fit: 'inside',         // Maintain aspect ratio without cropping
    blurSigma: 15,         // High blur amount to protect original content
    quality: 60,           // Compressed quality for faster network delivery
    format: 'jpeg'         // Standard format for preview delivery
  },
  optimizedOriginal: {
    quality: 85,           // Standard optimization quality
    format: 'jpeg'
  }
};

/**
 * Image processing utilities configuration placeholder.
 * Specific processing logic using these configurations will be implemented in services/controllers.
 */
export default SHARP_CONFIG;

import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Validate and debug Cloudinary environment variables on startup
const requiredEnv = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
console.log('--- Cloudinary Startup Check ---');
requiredEnv.forEach(envVar => {
  if (!process.env[envVar]) {
    console.warn(`⚠️  WARNING: ${envVar} is not defined in the environment/dotenv!`);
  } else {
    const val = process.env[envVar].trim();
    // Expose length and masked string to verify copy-paste issues
    const masked = val.length > 5 
      ? `${val.substring(0, 3)}...${val.substring(val.length - 3)}` 
      : '***';
    console.log(`✅ ${envVar} is loaded: Length = ${val.length}, Value = ${masked}`);
  }
});
console.log('--------------------------------');

// Configure Cloudinary with standard environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? process.env.CLOUDINARY_CLOUD_NAME.trim() : '',
  api_key: process.env.CLOUDINARY_API_KEY ? process.env.CLOUDINARY_API_KEY.trim() : '',
  api_secret: process.env.CLOUDINARY_API_SECRET ? process.env.CLOUDINARY_API_SECRET.trim() : ''
});

export default cloudinary;

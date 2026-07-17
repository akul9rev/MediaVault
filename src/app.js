import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import sharp from 'sharp';
import cloudinary from './config/cloudinary.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import Route Handlers
import authRouter from './routes/auth.js';
import mediaRouter from './routes/media.js';
import walletRouter from './routes/wallet.js';
import usersRouter from './routes/users.js';

// Import Custom Middlewares & Utils
import errorHandler from './middleware/error/errorHandler.js';
import AppError from './utils/AppError.js';

dotenv.config();

const app = express();

app.get('/health', (req, res) => {
  console.log('Health endpoint hit');
  res.json({
    status: 'ok'
  });
});

app.get('/cloudinary-test', async (req, res) => {
  const testPath = path.join(__dirname, 'test.jpg');
  try {
    // Generate a 1x1 pixel image using sharp
    await sharp({
      create: {
        width: 1,
        height: 1,
        channels: 3,
        background: { r: 255, g: 0, b: 0 }
      }
    })
    .jpeg()
    .toFile(testPath);

    console.log('Generated test 1x1 image at:', testPath);

    // Upload to Cloudinary using official SDK (no extra parameters)
    const result = await cloudinary.uploader.upload(testPath);

    console.log('Cloudinary test upload successful:', result.secure_url);

    // Delete temp file
    if (fs.existsSync(testPath)) {
      fs.unlinkSync(testPath);
    }

    res.json({
      status: 'success',
      result
    });
  } catch (error) {
    // Clean up if it exists
    if (fs.existsSync(testPath)) {
      try {
        fs.unlinkSync(testPath);
      } catch (err) {
        // Ignore unlink errors
      }
    }
    console.error('Cloudinary Test Failed:', error);
    res.status(500).json({
      status: 'error',
      message: error.message,
      name: error.name,
      http_code: error.http_code,
      full_error: error
    });
  }
});

// 1. Configure Global Middlewares
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || '*'
}));

// HTTP Request Logger
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. Configure API Routes under /api/v1/
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/media', mediaRouter);
app.use('/api/v1/wallet', walletRouter);
app.use('/api/v1/users', usersRouter);

// 3. Fallback Route Not Found Handler
app.all('*', (req, res, next) => {
  next(new AppError(`Cannot find endpoint ${req.originalUrl} on this server.`, 404));
});

// 4. Centralized Global Error Handler Middleware
app.use(errorHandler);

export default app;

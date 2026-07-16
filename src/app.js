import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

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

// Serve static preview files (so blurred versions can be accessed publicly)
app.use('/uploads/previews', express.static('src/uploads/previews'));

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

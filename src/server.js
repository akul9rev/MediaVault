import app from './app.js';
import pool from './config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Test Database Connection Pool Health on Startup
const connectDatabase = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL Database Connection established successfully.');
    connection.release();
  } catch (error) {
    console.error('❌ Failed to connect to MySQL database:', error.message);
    console.log('⚠️  Please ensure your MySQL service is running and configured correctly in .env.');
  }
};

// Start Express Server
const server = app.listen(PORT, '0.0.0.0', async () => {
  console.log(
    `🚀 Server is running at http://0.0.0.0:${PORT} in ${process.env.NODE_ENV || 'development'} mode.`
  );

  await connectDatabase();
});

// Handle Graceful Shutdowns
const shutdown = async (signal) => {
  console.log(`\nReceived ${signal}. Starting graceful shutdown...`);

  server.close(async () => {
    console.log('HTTP Server closed.');
    try {
      await pool.end();
      console.log('MySQL connection pool closed.');
      process.exit(0);
    } catch (err) {
      console.error('Error closing MySQL pool:', err);
      process.exit(1);
    }
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

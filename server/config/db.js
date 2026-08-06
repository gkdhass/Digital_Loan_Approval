const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  // If already connected in this instance, skip
  if (isConnected && mongoose.connection.readyState === 1) {
    console.log('✅ MongoDB already connected (reusing connection)');
    return;
  }

  try {
    // Serverless-friendly options with longer timeout for cold starts
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000, // 30s for Vercel cold starts
      socketTimeoutMS: 45000,
      family: 4, // Force IPv4 (Vercel sometimes has IPv6 issues)
    });
    
    isConnected = true;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error(`❌ Connection String Host: ${process.env.MONGODB_URI?.split('@')[1]?.split('/')[0] || 'unknown'}`);
    isConnected = false;
    
    // In serverless, DO NOT call process.exit(1) - it crashes the entire function
    // Instead, throw the error to be handled by the caller or global error handler
    throw new Error(`Database connection failed: ${error.message}`);
  }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB disconnected');
  isConnected = false;
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err.message);
  isConnected = false;
});

module.exports = connectDB;

const mongoose = require('mongoose');

// Serverless-safe connection caching
// Using a cached connection variable that persists across function invocations
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

// Disable buffering - fail fast instead of waiting 10s
mongoose.set('bufferCommands', false);

const connectDB = async () => {
  // If we already have a connection, reuse it
  if (cached.conn) {
    console.log('✅ MongoDB reusing cached connection');
    return cached.conn;
  }

  // If a connection promise is in progress, wait for it
  if (!cached.promise) {
    const opts = {
      serverSelectionTimeoutMS: 30000, // 30s for Vercel cold starts
      socketTimeoutMS: 45000,
      family: 4, // Force IPv4 (Vercel IPv6 issues)
      bufferCommands: false, // Disable buffering globally
    };

    console.log('🔌 Initiating new MongoDB connection...');
    
    cached.promise = mongoose.connect(process.env.MONGODB_URI, opts)
      .then((mongoose) => {
        console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);
        return mongoose;
      })
      .catch((error) => {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        console.error(`❌ Connection String Host: ${process.env.MONGODB_URI?.split('@')[1]?.split('/')[0] || 'unknown'}`);
        
        // Clear the failed promise so next request can retry
        cached.promise = null;
        
        throw new Error(`Database connection failed: ${error.message}`);
      });
  }

  // Wait for the connection promise to resolve
  cached.conn = await cached.promise;
  return cached.conn;
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB disconnected');
  // Clear cache on disconnect so next request reconnects
  cached.conn = null;
  cached.promise = null;
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err.message);
  // Clear cache on error
  cached.conn = null;
  cached.promise = null;
});

module.exports = connectDB;

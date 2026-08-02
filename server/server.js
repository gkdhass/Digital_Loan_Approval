require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Global error handlers for uncaught errors (CRITICAL for serverless stability)
process.on('uncaughtException', (error) => {
  console.error('💥 UNCAUGHT EXCEPTION:', error);
  console.error('Stack:', error.stack);
  // In serverless, log but don't exit - the function will terminate naturally
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 UNHANDLED REJECTION at:', promise);
  console.error('Reason:', reason);
  // In serverless, log but don't exit
});

// Connect to MongoDB (async, non-blocking, with error handling)
let dbConnectionAttempted = false;

const initializeDB = async () => {
  if (dbConnectionAttempted) return;
  dbConnectionAttempted = true;

  try {
    await connectDB();
  } catch (error) {
    console.error('⚠️ Database connection failed at startup:', error.message);
    // Don't crash - let requests come in and try to reconnect on first DB operation
  }
};

// Initialize DB connection
initializeDB();

// CORS Configuration - Allow multiple origins + Vercel preview URLs
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  ...(process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',').map(url => url.trim()) : []),
];

// Vercel preview URL pattern (optional - allows all *.vercel.app preview URLs)
const isVercelPreviewURL = (origin) => {
  return origin && origin.match(/^https:\/\/.*\.vercel\.app$/);
};

// Auto-allow Vercel preview URLs if running on Vercel
const isRunningOnVercel = process.env.VERCEL === '1';

console.log('🔒 CORS Allowed Origins:', allowedOrigins);
console.log('🚀 Running on Vercel:', isRunningOnVercel);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, curl)
    if (!origin) return callback(null, true);
    
    // Check explicit allowed origins
    if (allowedOrigins.includes(origin)) {
      console.log('✅ CORS allowed (explicit):', origin);
      return callback(null, true);
    }
    
    // Allow Vercel preview URLs if running on Vercel or explicitly enabled
    if ((isRunningOnVercel || process.env.ALLOW_VERCEL_PREVIEWS === 'true') && isVercelPreviewURL(origin)) {
      console.log('✅ CORS allowed (Vercel preview):', origin);
      return callback(null, true);
    }
    
    console.warn('❌ CORS blocked:', origin);
    callback(null, false);
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', async (req, res) => {
  try {
    const dbStatus = require('mongoose').connection.readyState;
    const dbStatusText = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    }[dbStatus] || 'unknown';

    res.json({
      success: true,
      message: 'Digital Loan Approval API is running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: dbStatusText,
    });
  } catch (error) {
    console.error('❌ Health check error:', error);
    res.status(500).json({
      success: false,
      message: 'Health check failed',
      error: error.message,
    });
  }
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/loan-types', require('./routes/loanTypeRoutes'));
app.use('/api/applications', require('./routes/applicationRoutes'));
app.use('/api/documents', require('./routes/documentRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// Error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Only start server if not in production (Vercel runs as serverless)
if (process.env.NODE_ENV !== 'production') {
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use — stop the other process or change PORT in .env`);
      process.exit(1);
    } else {
      console.error(`❌ Server error: ${error.message}`);
      process.exit(1);
    }
  });
}

// Export for Vercel serverless
module.exports = app;

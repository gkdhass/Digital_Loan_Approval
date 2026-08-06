require('dotenv').config();
const mongoose = require('mongoose');

console.log('Testing MongoDB Connection...\n');
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('MongoDB URI exists:', !!process.env.MONGODB_URI);

// Log connection string with password masked
if (process.env.MONGODB_URI) {
  const maskedUri = process.env.MONGODB_URI.replace(/:([^:@]+)@/, ':****@');
  console.log('Connection String (masked):', maskedUri);
  
  // Extract details
  const match = process.env.MONGODB_URI.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@([^/]+)\/([^?]+)/);
  if (match) {
    console.log('\nConnection Details:');
    console.log('  Username:', match[1]);
    console.log('  Password:', '****' + match[2].slice(-2));
    console.log('  Cluster:', match[3]);
    console.log('  Database:', match[4]);
  }
}

console.log('\nAttempting connection with 30s timeout...\n');

mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  family: 4,
})
.then((conn) => {
  console.log('✅ SUCCESS: MongoDB Connected!');
  console.log('   Host:', conn.connection.host);
  console.log('   Database:', conn.connection.name);
  console.log('   Port:', conn.connection.port);
  console.log('   ReadyState:', conn.connection.readyState);
  process.exit(0);
})
.catch((error) => {
  console.error('❌ FAILED: MongoDB Connection Error');
  console.error('   Error Name:', error.name);
  console.error('   Error Message:', error.message);
  
  if (error.reason) {
    console.error('   Reason:', error.reason);
  }
  
  if (error.code) {
    console.error('   Error Code:', error.code);
  }
  
  console.error('\nFull Error:', error);
  process.exit(1);
});

// Timeout fallback
setTimeout(() => {
  console.error('\n⏱️ Connection test timed out after 35 seconds');
  process.exit(1);
}, 35000);

const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');

const verifyAdmin = async () => {
  try {
    console.log('🔍 Verifying admin user in database...\n');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');

    const adminEmail = 'dhassgkd@gmail.com';
    const user = await User.findOne({ email: adminEmail });

    if (!user) {
      console.log('❌ User NOT found with email:', adminEmail);
      console.log('\nAvailable users:');
      const allUsers = await User.find({}, { email: 1, role: 1, fullName: 1 });
      allUsers.forEach(u => {
        console.log(`  - ${u.email} | Role: ${u.role} | Name: ${u.fullName}`);
      });
    } else {
      console.log('✓ User found with email:', adminEmail);
      console.log('  - ID:', user._id);
      console.log('  - Full Name:', user.fullName);
      console.log('  - Role:', user.role);
      console.log('  - isActive:', user.isActive);
      console.log('  - Created At:', user.createdAt);
      
      if (user.role !== 'admin') {
        console.log('\n❌ ERROR: User role is NOT "admin" - it is:', user.role);
      } else {
        console.log('\n✓ User role is correctly set to "admin"');
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Verification error:', error);
    process.exit(1);
  }
};

verifyAdmin();

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const createAdmin = async () => {
  try {
    console.log('🔍 Checking database for admin users...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check ALL users with role 'admin'
    const adminUsers = await User.find({ role: 'admin' });
    
    console.log(`📊 Found ${adminUsers.length} admin user(s) in database:\n`);
    
    if (adminUsers.length > 0) {
      adminUsers.forEach((admin, index) => {
        console.log(`${index + 1}. Admin User:`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   Name: ${admin.fullName}`);
        console.log(`   Phone: ${admin.phone}`);
        console.log(`   Active: ${admin.isActive}`);
        console.log(`   ID: ${admin._id}\n`);
      });
      
      console.log('❌ Admin user(s) already exist. To create a new admin or replace existing:');
      console.log('   1. Delete existing admin(s) from database first');
      console.log('   2. Or update this script to handle replacement\n');
      
      process.exit(0);
    }

    // No admin found - create new one
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    if (!adminEmail || !adminPassword) {
      console.error('❌ ERROR: ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env file');
      console.log('\nAdd these lines to your server/.env file:');
      console.log('ADMIN_EMAIL=dhassgkd@gmail.com');
      console.log('ADMIN_PASSWORD=your_password_here\n');
      process.exit(1);
    }

    console.log('❌ No admin user found. Creating one now...\n');
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`👤 Name: Mohan Dhass G`);
    console.log(`📱 Phone: 8610326514`);
    console.log(`🔑 Password: [from .env]\n`);

    // Create admin user (password will be hashed by the User model's pre-save hook)
    const admin = await User.create({
      fullName: 'Mohan Dhass G',
      email: adminEmail,
      password: adminPassword,
      phone: '8610326514',
      role: 'admin',
      address: {
        street: '123 Admin Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001'
      },
      isActive: true
    });

    console.log('✅ Admin user created successfully!');
    console.log(`   ID: ${admin._id}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Name: ${admin.fullName}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   Active: ${admin.isActive}\n`);
    
    console.log('💡 You can now login with:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: (from your .env file)\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
};

createAdmin();

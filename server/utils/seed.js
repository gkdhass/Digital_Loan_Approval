const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const LoanType = require('../models/LoanType');

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    // Get admin credentials from env or use defaults
    const adminEmail = process.env.ADMIN_EMAIL || 'dhassgkd@gmail.com';
    const adminPasswordPlain = process.env.ADMIN_PASSWORD || 'dhassgkd';

    // Clear existing data
    await User.deleteMany({ role: 'admin' });
    await User.deleteMany({ email: adminEmail });
    await LoanType.deleteMany({});
    console.log('✓ Cleared existing seed data');

    // Create admin user
    const adminPassword = await bcrypt.hash(adminPasswordPlain, 10);
    const admin = await User.create({
      fullName: 'System Administrator',
      email: adminEmail,
      password: adminPassword,
      phone: '+91-9876543210',
      role: 'admin',
      address: {
        street: '123 Admin Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001'
      },
      isActive: true
    });
    console.log(`✓ Created admin user: ${adminEmail} / ${adminPasswordPlain}`);

    // Create 8 loan types
    const loanTypes = [
      {
        name: 'Personal Loan',
        description: 'Quick and easy personal loans for any purpose - medical, travel, wedding, or emergencies.',
        interestRate: 10.5,
        maxAmount: 1000000,
        minIncome: 25000,
        maxDurationMonths: 60,
        requiredDocuments: ['identity_proof', 'address_proof', 'income_proof', 'bank_statement'],
        processingFeePercent: 1.5,
        icon: 'user',
        isActive: true
      },
      {
        name: 'Home Loan',
        description: 'Affordable housing loans for purchasing or constructing your dream home.',
        interestRate: 8.5,
        maxAmount: 10000000,
        minIncome: 50000,
        maxDurationMonths: 300,
        requiredDocuments: ['identity_proof', 'address_proof', 'income_proof', 'property_documents', 'bank_statement'],
        processingFeePercent: 0.5,
        icon: 'home',
        isActive: true
      },
      {
        name: 'Education Loan',
        description: 'Invest in your future with education loans for domestic and international studies.',
        interestRate: 9.0,
        maxAmount: 2000000,
        minIncome: 30000,
        maxDurationMonths: 120,
        requiredDocuments: ['identity_proof', 'address_proof', 'admission_letter', 'income_proof', 'bank_statement'],
        processingFeePercent: 1.0,
        icon: 'graduation-cap',
        isActive: true
      },
      {
        name: 'Vehicle Loan',
        description: 'Drive your dream car or bike home with flexible vehicle financing options.',
        interestRate: 9.5,
        maxAmount: 2000000,
        minIncome: 20000,
        maxDurationMonths: 84,
        requiredDocuments: ['identity_proof', 'address_proof', 'income_proof', 'vehicle_quotation', 'bank_statement'],
        processingFeePercent: 2.0,
        icon: 'car',
        isActive: true
      },
      {
        name: 'Business Loan',
        description: 'Fuel your entrepreneurial dreams with customized business financing solutions.',
        interestRate: 11.5,
        maxAmount: 5000000,
        minIncome: 40000,
        maxDurationMonths: 120,
        requiredDocuments: ['identity_proof', 'address_proof', 'business_proof', 'itr', 'bank_statement', 'business_plan'],
        processingFeePercent: 2.5,
        icon: 'briefcase',
        isActive: true
      },
      {
        name: 'Gold Loan',
        description: 'Instant liquidity against your gold ornaments with minimal documentation.',
        interestRate: 7.5,
        maxAmount: 1000000,
        minIncome: 15000,
        maxDurationMonths: 36,
        requiredDocuments: ['identity_proof', 'address_proof', 'gold_appraisal'],
        processingFeePercent: 0.5,
        icon: 'coins',
        isActive: true
      },
      {
        name: 'Agriculture Loan',
        description: 'Support farmers with loans for seeds, equipment, and agricultural development.',
        interestRate: 8.0,
        maxAmount: 3000000,
        minIncome: 20000,
        maxDurationMonths: 60,
        requiredDocuments: ['identity_proof', 'address_proof', 'land_documents', 'income_proof'],
        processingFeePercent: 1.0,
        icon: 'wheat',
        isActive: true
      },
      {
        name: 'Mortgage Loan',
        description: 'Leverage your property to access funds for business or personal needs.',
        interestRate: 9.25,
        maxAmount: 15000000,
        minIncome: 60000,
        maxDurationMonths: 180,
        requiredDocuments: ['identity_proof', 'address_proof', 'property_documents', 'income_proof', 'bank_statement', 'property_valuation'],
        processingFeePercent: 1.0,
        icon: 'building',
        isActive: true
      }
    ];

    const createdLoanTypes = await LoanType.insertMany(loanTypes);
    console.log(`✓ Created ${createdLoanTypes.length} loan types`);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   Admin Email: admin@loanapproval.com`);
    console.log(`   Admin Password: admin123`);
    console.log(`   Loan Types: ${createdLoanTypes.length}`);
    console.log('\n⚠️  Remember to change the admin password after first login!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();

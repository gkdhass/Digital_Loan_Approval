require('dotenv').config();
const mongoose = require('mongoose');
const LoanType = require('../models/LoanType');

const loanTypesData = [
  {
    name: 'Personal Loan',
    description: 'Quick and easy personal loans for your immediate financial needs. No collateral required.',
    interestRate: 10.5,
    maxAmount: 1000000,
    minIncome: 25000,
    maxDurationMonths: 60,
    processingFeePercent: 1.5,
    icon: 'user',
    requiredDocuments: [
      'Aadhar Card',
      'PAN Card',
      'Salary Slips (Last 3 months)',
      'Bank Statements (Last 6 months)',
      'Passport Photo'
    ],
    isActive: true,
  },
  {
    name: 'Home Loan',
    description: 'Fulfill your dream of owning a home with our affordable home loans at competitive interest rates.',
    interestRate: 8.5,
    maxAmount: 10000000,
    minIncome: 50000,
    maxDurationMonths: 360,
    processingFeePercent: 0.5,
    icon: 'home',
    requiredDocuments: [
      'Aadhar Card',
      'PAN Card',
      'Income Proof',
      'Property Documents',
      'Bank Statements (Last 6 months)',
      'Employment Proof'
    ],
    isActive: true,
  },
  {
    name: 'Education Loan',
    description: 'Invest in your future with our education loans covering tuition, books, and living expenses.',
    interestRate: 9.0,
    maxAmount: 2000000,
    minIncome: 30000,
    maxDurationMonths: 180,
    processingFeePercent: 1.0,
    icon: 'graduation-cap',
    requiredDocuments: [
      'Aadhar Card',
      'PAN Card',
      'Admission Letter',
      'Fee Structure',
      'Parent/Guardian Income Proof',
      'Bank Statements (Last 6 months)',
      'Academic Records'
    ],
    isActive: true,
  },
  {
    name: 'Vehicle Loan',
    description: 'Drive your dream car or bike with our flexible vehicle loans and easy repayment options.',
    interestRate: 11.0,
    maxAmount: 2000000,
    minIncome: 30000,
    maxDurationMonths: 84,
    processingFeePercent: 1.0,
    icon: 'car',
    requiredDocuments: [
      'Aadhar Card',
      'PAN Card',
      'Salary Slips (Last 3 months)',
      'Bank Statements (Last 6 months)',
      'Driving License',
      'Vehicle Quotation',
      'Address Proof'
    ],
    isActive: true,
  },
  {
    name: 'Business Loan',
    description: 'Grow your business with working capital loans, equipment financing, and business expansion funds.',
    interestRate: 12.0,
    maxAmount: 5000000,
    minIncome: 50000,
    maxDurationMonths: 120,
    processingFeePercent: 2.0,
    icon: 'briefcase',
    requiredDocuments: [
      'Aadhar Card',
      'PAN Card',
      'Business Registration Certificate',
      'GST Registration',
      'ITR (Last 2 years)',
      'Bank Statements (Last 12 months)',
      'Business Plan',
      'Financial Statements'
    ],
    isActive: true,
  },
  {
    name: 'Gold Loan',
    description: 'Instant loans against your gold ornaments at attractive interest rates with flexible repayment.',
    interestRate: 9.5,
    maxAmount: 5000000,
    minIncome: 15000,
    maxDurationMonths: 36,
    processingFeePercent: 0.5,
    icon: 'coins',
    requiredDocuments: [
      'Aadhar Card',
      'PAN Card',
      'Gold Ornaments',
      'Purity Certificate',
      'Address Proof',
      'Passport Photo'
    ],
    isActive: true,
  },
  {
    name: 'Agriculture Loan',
    description: 'Support your farming activities with loans for seeds, fertilizers, equipment, and land development.',
    interestRate: 7.0,
    maxAmount: 3000000,
    minIncome: 20000,
    maxDurationMonths: 120,
    processingFeePercent: 0.5,
    icon: 'wheat',
    requiredDocuments: [
      'Aadhar Card',
      'PAN Card',
      'Land Ownership Documents',
      'Crop Details',
      'Income Proof',
      'Bank Statements (Last 6 months)',
      'Village Revenue Records'
    ],
    isActive: true,
  },
  {
    name: 'Mortgage Loan',
    description: 'Get loans against your property for any purpose - business, education, medical, or personal needs.',
    interestRate: 9.0,
    maxAmount: 15000000,
    minIncome: 40000,
    maxDurationMonths: 240,
    processingFeePercent: 1.0,
    icon: 'building',
    requiredDocuments: [
      'Aadhar Card',
      'PAN Card',
      'Property Documents',
      'Property Valuation Report',
      'Income Proof',
      'Bank Statements (Last 6 months)',
      'Title Deed',
      'Tax Receipts'
    ],
    isActive: true,
  },
];

const seedLoanTypes = async () => {
  try {
    console.log('🌱 Starting Loan Types Seeding...\n');

    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    console.log('   URI:', process.env.MONGODB_URI?.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@'));
    
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ Connected to MongoDB\n');

    // Check existing loan types
    const existingCount = await LoanType.countDocuments();
    console.log(`📊 Current loan types in database: ${existingCount}`);

    if (existingCount > 0) {
      console.log('\n⚠️  Database already contains loan types.');
      console.log('   Options:');
      console.log('   1. Keep existing data (default)');
      console.log('   2. Add to existing data');
      console.log('   3. Replace all data\n');

      // For now, we'll add only missing loan types
      console.log('🔄 Checking for missing loan types...\n');

      let addedCount = 0;
      let skippedCount = 0;

      for (const loanTypeData of loanTypesData) {
        const exists = await LoanType.findOne({ name: loanTypeData.name });
        
        if (exists) {
          console.log(`⏭️  Skipped: ${loanTypeData.name} (already exists)`);
          skippedCount++;
        } else {
          await LoanType.create(loanTypeData);
          console.log(`✅ Added: ${loanTypeData.name}`);
          addedCount++;
        }
      }

      console.log(`\n📈 Summary:`);
      console.log(`   ✅ Added: ${addedCount}`);
      console.log(`   ⏭️  Skipped: ${skippedCount}`);
      console.log(`   📊 Total in DB: ${existingCount + addedCount}`);

    } else {
      // Fresh seed - delete all and insert
      console.log('🗑️  Clearing existing loan types...');
      await LoanType.deleteMany({});
      console.log('✅ Cleared\n');

      console.log('📝 Inserting loan types...\n');
      
      for (const loanTypeData of loanTypesData) {
        await LoanType.create(loanTypeData);
        console.log(`✅ Created: ${loanTypeData.name}`);
        console.log(`   Interest Rate: ${loanTypeData.interestRate}%`);
        console.log(`   Max Amount: ₹${loanTypeData.maxAmount.toLocaleString()}`);
        console.log(`   Max Duration: ${loanTypeData.maxDurationMonths} months\n`);
      }

      const totalCount = await LoanType.countDocuments();
      console.log(`\n🎉 Successfully seeded ${totalCount} loan types!`);
    }

    // Verify the data
    console.log('\n🔍 Verifying seeded data...');
    const allLoanTypes = await LoanType.find({});
    console.log(`✅ Total loan types in database: ${allLoanTypes.length}\n`);

    allLoanTypes.forEach((lt, index) => {
      console.log(`${index + 1}. ${lt.name}`);
      console.log(`   ID: ${lt._id}`);
      console.log(`   Active: ${lt.isActive}`);
      console.log(`   Interest Rate: ${lt.interestRate}%`);
      console.log(`   Required Documents: ${lt.requiredDocuments.length}`);
    });

    console.log('\n✅ Seeding completed successfully!');
    console.log('\n💡 You can now access loan types at:');
    console.log('   GET /api/loan-types\n');

  } catch (error) {
    console.error('\n❌ Error seeding loan types:');
    console.error('   Error:', error.message);
    console.error('   Stack:', error.stack);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Database connection closed');
    process.exit(0);
  }
};

// Run the seed function
seedLoanTypes();

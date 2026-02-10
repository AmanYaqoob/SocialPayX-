import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';
import Settings from './models/Settings.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data (comment out to preserve existing users)
    // await User.deleteMany({});
    // await Settings.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user (only if doesn't exist)
    const existingAdmin = await User.findOne({ email: 'admin@spxminer.com' });
    if (!existingAdmin) {
      const adminUser = new User({
        email: 'admin@spxminer.com',
        password: 'admin123',
        username: 'admin',
        isAdmin: true,
        isActive: true,
        spxBalance: 1000,
        miningRate: 0.5,
        lastMiningClaim: new Date(),
        isMining: false,
        totalMined: 500,
        kycStatus: 'approved',
        kycSubmissionDate: new Date(),
        referralCode: 'ADMIN001',
        referralEarnings: 50
      });
      await adminUser.save();
      console.log('Admin user created');
    }

    // Create test users
    const testUsers = [
      {
        email: 'aman@gmail.com',
        password: 'zx@123ASDF',
        username: 'aman',
        spxBalance: 100000.50,
        miningRate: 0.1,
        isMining: false,
        totalMined: 89.25,
        kycStatus: 'approved',
        kycSubmissionDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        kycTID: 'TXN123456789',
        referralCode: 'AMAN001',
        referralEarnings: 15.75,
        withdrawalRequests: [
          {
            amount: 50,
            address: 'TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE',
            status: 'approved',
            requestDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            processedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
          }
        ]
      },
      {
        email: 'john@example.com',
        password: 'password123',
        username: 'john_miner',
        spxBalance: 75.25,
        miningRate: 0.1,
        isMining: true,
        miningStartTime: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
        totalMined: 45.80,
        kycStatus: 'pending',
        kycSubmissionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        kycTID: 'TXN987654321',
        referralCode: 'JOHN002',
        referralEarnings: 8.50
      },
      {
        email: 'sarah@example.com',
        password: 'sarah2024',
        username: 'sarah_crypto',
        spxBalance: 200.75,
        miningRate: 0.15,
        isMining: false,
        totalMined: 156.30,
        kycStatus: 'approved',
        kycSubmissionDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        kycTID: 'TXN456789123',
        referralCode: 'SARAH003',
        referralEarnings: 32.40,
        withdrawalRequests: [
          {
            amount: 100,
            address: 'TLsV52sRDL79HXGGm9yzwDeZ9ejNda7HgM',
            status: 'pending',
            requestDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
          }
        ]
      },
      {
        email: 'mike@example.com',
        password: 'mike123',
        username: 'mike_trader',
        spxBalance: 25.00,
        miningRate: 0.1,
        isMining: true,
        miningStartTime: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
        totalMined: 18.90,
        kycStatus: 'rejected',
        kycSubmissionDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        kycTID: 'TXN789123456',
        kycRejectionReason: 'Invalid transaction ID provided',
        referralCode: 'MIKE004',
        referralEarnings: 2.10
      },
      {
        email: 'lisa@example.com',
        password: 'lisa2024',
        username: 'lisa_hodler',
        spxBalance: 350.80,
        miningRate: 0.2,
        isMining: false,
        totalMined: 298.45,
        kycStatus: 'approved',
        kycSubmissionDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        kycTID: 'TXN321654987',
        referralCode: 'LISA005',
        referralEarnings: 67.20,
        withdrawalRequests: [
          {
            amount: 150,
            address: 'TMuA6YqfCeX8EhbfYEg5y7S4DqzSJireye',
            status: 'approved',
            requestDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
            processedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          },
          {
            amount: 75,
            address: 'TMuA6YqfCeX8EhbfYEg5y7S4DqzSJireye',
            status: 'rejected',
            requestDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
            processedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
          }
        ]
      }
    ];

    // Create test users with referral relationships
    const savedUsers = [];
    for (const userData of testUsers) {
      const user = new User(userData);
      await user.save();
      savedUsers.push(user);
    }

    // Set referral relationships using updateOne to avoid password re-hashing
    await User.updateOne({ _id: savedUsers[1]._id }, { referredBy: savedUsers[0]._id });
    await User.updateOne({ _id: savedUsers[2]._id }, { referredBy: savedUsers[1]._id });
    await User.updateOne({ _id: savedUsers[3]._id }, { referredBy: savedUsers[0]._id });
    await User.updateOne({ _id: savedUsers[4]._id }, { referredBy: savedUsers[2]._id });

    // Create platform settings (only if none exist)
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings({
        kycEnabled: true,
        miningEnabled: true,
        withdrawalsEnabled: true,
        referralEnabled: true,
        minClaimAmount: 1,
        dailyMiningLimit: 24,
        kycUsdtAmount: 10,
        usdtWalletAddress: 'TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE',
        minWithdrawalAmount: 10,
        withdrawalFee: 0.05, // 5%
        referralCommission: 0.1, // 10%
        maintenanceMode: false
      });
      await settings.save();
    }

    console.log('✅ Database seeded successfully!');
    console.log('\n📊 Test Data Summary:');
    console.log('👤 Admin User: admin@spxminer.com / admin123');
    console.log('👤 Test Users:');
    console.log('   - aman@gmail.com / zx@123ASDF (KYC: approved, Mining: stopped)');
    console.log('   - john@example.com / password123 (KYC: pending, Mining: active)');
    console.log('   - sarah@example.com / sarah2024 (KYC: approved, Mining: stopped)');
    console.log('   - mike@example.com / mike123 (KYC: rejected, Mining: active)');
    console.log('   - lisa@example.com / lisa2024 (KYC: approved, Mining: stopped)');
    console.log('\n💰 Balances: 125.50, 75.25, 200.75, 25.00, 350.80 SPX');
    console.log('🔗 Referral Chain: aman -> john -> sarah, aman -> mike, sarah -> lisa');
    console.log('📋 KYC Status: 4 approved, 1 pending, 1 rejected');
    console.log('⛏️  Mining Status: 2 active, 4 stopped');
    console.log('💸 Withdrawal Requests: 4 total (2 approved, 1 pending, 1 rejected)');

    process.exit(0);
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
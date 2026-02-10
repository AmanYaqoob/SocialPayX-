import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';
import Settings from './models/Settings.js';

dotenv.config();

const initializeDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create default admin user
    const adminExists = await User.findOne({ isAdmin: true });
    if (!adminExists) {
      const adminUser = new User({
        email: process.env.ADMIN_EMAIL || 'admin@spxminer.com',
        password: process.env.ADMIN_PASSWORD || 'admin123',
        username: 'admin',
        isAdmin: true,
        referralCode: 'ADMIN001',
        kycStatus: 'approved'
      });
      await adminUser.save();
      console.log('Admin user created');
    }

    // Create default settings
    const settingsExists = await Settings.findOne();
    if (!settingsExists) {
      const settings = new Settings({
        kycEnabled: true,
        miningEnabled: true,
        withdrawalsEnabled: true,
        referralEnabled: true,
        kycUsdtAmount: 10,
        usdtWalletAddress: 'TYourUSDTWalletAddressHere'
      });
      await settings.save();
      console.log('Default settings created');
    }

    console.log('Database initialization completed');
    process.exit(0);
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
};

initializeDatabase();
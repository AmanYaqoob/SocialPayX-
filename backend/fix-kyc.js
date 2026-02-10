import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Settings from './models/Settings.js';

dotenv.config();

const fixKYC = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Update or create settings with KYC enabled
    const settings = await Settings.findOneAndUpdate(
      {},
      {
        kycEnabled: true,
        miningEnabled: true,
        withdrawalsEnabled: true,
        referralEnabled: true,
        kycUsdtAmount: 10,
        usdtWalletAddress: 'TRx7NvKMc8NLLd5YXg6VPzYkF7p5PUv9bZ',
        minWithdrawalAmount: 10,
        withdrawalFee: 0.05,
        referralCommission: 0.1,
        maintenanceMode: false
      },
      { 
        new: true, 
        upsert: true 
      }
    );

    console.log('✅ KYC Settings updated:', settings);
    console.log('KYC Enabled:', settings.kycEnabled);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to fix KYC:', error);
    process.exit(1);
  }
};

fixKYC();
import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  kycEnabled: { type: Boolean, default: true },
  miningEnabled: { type: Boolean, default: true },
  withdrawalsEnabled: { type: Boolean, default: true },
  referralEnabled: { type: Boolean, default: true },
  
  // Mining settings
  minClaimAmount: { type: Number, default: 1 },
  dailyMiningLimit: { type: Number, default: 24 }, // hours
  
  // KYC settings
  kycUsdtAmount: { type: Number, default: 10 },
  usdtWalletAddress: { type: String, default: 'TYourUSDTWalletAddressHere' },
  
  // Withdrawal settings
  minWithdrawalAmount: { type: Number, default: 10 },
  withdrawalFee: { type: Number, default: 0.1 }, // percentage
  
  // Referral settings
  referralCommission: { type: Number, default: 0.1 }, // 10%
  
  maintenanceMode: { type: Boolean, default: false }
}, {
  timestamps: true
});

export default mongoose.model('Settings', settingsSchema);
import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  kycEnabled: { type: Boolean, default: true },
  miningEnabled: { type: Boolean, default: true },
  withdrawalsEnabled: { type: Boolean, default: false },   // locked by default
  depositsEnabled: { type: Boolean, default: false },      // locked by default
  referralEnabled: { type: Boolean, default: true },

  // SPX coin settings
  spxPrice: { type: Number, default: 0.20 },              // $0.20 per SPX
  signupBonusSpx: { type: Number, default: 25 },          // 25 SPX on signup

  // Mining settings
  minClaimAmount: { type: Number, default: 1 },
  dailyMiningLimit: { type: Number, default: 24 },

  // KYC settings
  kycUsdtAmount: { type: Number, default: 10 },
  usdtWalletAddress: { type: String, default: 'TYourUSDTWalletAddressHere' },

  // Withdrawal settings
  minWithdrawalAmount: { type: Number, default: 10 },
  withdrawalFee: { type: Number, default: 0.1 },

  // Deposit settings
  depositAddress: { type: String, default: '' },
  minDepositAmount: { type: Number, default: 10 },

  // Referral settings
  referralCommission: { type: Number, default: 0.1 },

  maintenanceMode: { type: Boolean, default: false }
}, {
  timestamps: true
});

export default mongoose.model('Settings', settingsSchema);

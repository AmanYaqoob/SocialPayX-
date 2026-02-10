import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  // User model fields
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  plainPassword: { type: String }, // Store plain password for admin view
  username: { type: String, required: true, unique: true },
  isActive: { type: Boolean, default: true },
  isAdmin: { type: Boolean, default: false },
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationCode: { type: String },
  emailVerificationExpires: { type: Date },
  emailVerificationToken: { type: String },
  
  // Mining data
  spxBalance: { type: Number, default: 0 },
  miningRate: { type: Number, default: 0.1 }, // SPX per hour
  lastMiningClaim: { type: Date, default: Date.now },
  isMining: { type: Boolean, default: false },
  miningStartTime: { type: Date },
  totalMined: { type: Number, default: 0 },
  
  // KYC data
  kycStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  kycSubmissionDate: { type: Date },
  kycTID: { type: String },
  kycRejectionReason: { type: String },
  kycDocuments: {
    idDocument: { type: String }, // file path or URL
    proofOfAddress: { type: String }, // file path or URL
    selfie: { type: String } // file path or URL
  },
  kycPersonalInfo: {
    fullName: { type: String },
    dateOfBirth: { type: Date },
    nationality: { type: String },
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      zipCode: { type: String },
      country: { type: String }
    },
    phoneNumber: { type: String }
  },
  
  // Referral data
  referralCode: { type: String, unique: true },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  referralEarnings: { type: Number, default: 0 },
  
  // Wallet data
  withdrawalRequests: [{
    amount: Number,
    address: String,
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    requestDate: { type: Date, default: Date.now },
    processedDate: Date
  }]
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

// Calculate mining rate based on referrals
userSchema.methods.calculateMiningRate = async function() {
  const baseRate = 0.1; // Base mining rate
  const referralBonus = 0.005; // Bonus per referral
  
  const referralCount = await mongoose.model('User').countDocuments({ referredBy: this._id });
  return baseRate + (referralCount * referralBonus);
};

export default mongoose.model('User', userSchema);
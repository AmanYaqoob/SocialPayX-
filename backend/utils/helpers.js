import crypto from 'crypto';

export const generateReferralCode = () => {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
};

export const calculateMiningEarnings = (startTime, rate) => {
  const now = new Date();
  const duration = (now - startTime) / (1000 * 60 * 60); // hours
  return duration * rate;
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString();
};

export const validateWalletAddress = (address) => {
  // Basic validation for crypto wallet addresses
  return address && address.length >= 26 && address.length <= 62;
};
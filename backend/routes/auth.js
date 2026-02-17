import express from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { generateReferralCode } from '../utils/helpers.js';

const router = express.Router();

// Register
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('username').isLength({ min: 3 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, username, referralCode } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Handle referral
    let referredBy = null;
    if (referralCode) {
      referredBy = await User.findOne({ referralCode });
    }

    // Generate unique referral code
    let newReferralCode;
    let isUnique = false;
    while (!isUnique) {
      newReferralCode = generateReferralCode();
      const existing = await User.findOne({ referralCode: newReferralCode });
      if (!existing) isUnique = true;
    }

    // Create user
    const user = new User({
      email,
      password,
      plainPassword: password,
      username,
      referralCode: newReferralCode,
      referredBy: referredBy?._id
    });

    await user.save();

    // Update referrer's mining rate if referred
    if (referredBy) {
      await User.findByIdAndUpdate(referredBy._id, {
        $inc: { miningRate: 0.005 }
      });
      console.log(`🎉 Referral bonus: ${referredBy.username} mining rate increased by 0.005x`);
    }

    // Auto-verify user (email verification disabled)
    user.isEmailVerified = true;
    await user.save();

    res.status(201).json({
      requiresVerification: false,
      email: user.email,
      message: 'Registration successful! You can now login.',
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        isEmailVerified: true
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').exists()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        spxBalance: user.spxBalance,
        kycStatus: user.kycStatus,
        isAdmin: user.isAdmin,
        referralCode: user.referralCode,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Verify email
router.post('/verify-email', [
  body('email').isEmail().normalizeEmail(),
  body('code').isLength({ min: 6, max: 6 }).withMessage('Verification code must be 6 digits')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, code } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if code matches and hasn't expired
    if (user.emailVerificationCode !== code) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }
    
    if (user.emailVerificationExpires < new Date()) {
      return res.status(400).json({ message: 'Verification code has expired' });
    }
    
    // Verify the email
    user.isEmailVerified = true;
    user.emailVerificationCode = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();
    
    console.log(`✅ Email verified successfully for ${email}`);
    
    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
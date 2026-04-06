import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import Settings from '../models/Settings.js';
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

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
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

    // Get signup bonus from settings
    const settings = await Settings.findOne() || new Settings();
    const signupBonus = settings.signupBonusSpx ?? 25;

    // Create user with signup bonus
    const user = new User({
      email,
      password,
      plainPassword: password,
      username,
      referralCode: newReferralCode,
      referredBy: referredBy?._id,
      spxBalance: signupBonus,   // 25 SPX signup bonus
      totalMined: signupBonus,
    });

    await user.save();

    // Update referrer's mining rate if referred
    if (referredBy) {
      await User.findByIdAndUpdate(referredBy._id, {
        $inc: { miningRate: 0.005 }
      });
      console.log(`🎉 Referral bonus: ${referredBy.username} mining rate increased by 0.005x`);
    }

    // Auto-verify user
    user.isEmailVerified = true;
    await user.save();

    res.status(201).json({
      requiresVerification: false,
      email: user.email,
      message: `Registration successful! You received ${signupBonus} SPX welcome bonus.`,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        isEmailVerified: true,
        spxBalance: signupBonus,
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

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

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
        isSubAdmin: user.isSubAdmin || false,
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
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.emailVerificationCode !== code) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }
    if (user.emailVerificationExpires < new Date()) {
      return res.status(400).json({ message: 'Verification code has expired' });
    }

    user.isEmailVerified = true;
    user.emailVerificationCode = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Forgot Password
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ message: 'If that email is registered, a reset token has been generated.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    console.log(`🔑 Password reset token for ${email}: ${resetToken}`);

    res.json({
      message: 'Password reset token generated.',
      resetToken,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Reset Password
router.post('/reset-password', [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { token, password } = req.body;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token.' });
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful. You can now log in.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

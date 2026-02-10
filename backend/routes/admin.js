import express from 'express';
import { body, validationResult } from 'express-validator';
import { adminAuth } from '../middleware/auth.js';
import User from '../models/User.js';
import Settings from '../models/Settings.js';

const router = express.Router();

// Dashboard stats
router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeMiners = await User.countDocuments({ isMining: true });
    const pendingKYC = await User.countDocuments({ kycStatus: 'pending' });
    const approvedKYC = await User.countDocuments({ kycStatus: 'approved' });
    
    const totalMined = await User.aggregate([
      { $group: { _id: null, total: { $sum: '$totalMined' } } }
    ]);

    const pendingWithdrawals = await User.aggregate([
      { $unwind: '$withdrawalRequests' },
      { $match: { 'withdrawalRequests.status': 'pending' } },
      { $count: 'total' }
    ]);

    res.json({
      totalUsers,
      activeMiners,
      pendingKYC,
      approvedKYC,
      totalMined: totalMined[0]?.total || 0,
      pendingWithdrawals: pendingWithdrawals[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all users
router.get('/users', adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select('-password')
      .populate('referredBy', 'username referralCode')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get referral count for each user
    const usersWithReferralCount = await Promise.all(
      users.map(async (user) => {
        const referralCount = await User.countDocuments({ referredBy: user._id });
        return {
          ...user.toObject(),
          referralCount
        };
      })
    );

    const total = await User.countDocuments();

    res.json({
      users: usersWithReferralCount,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user status
router.put('/users/:id/status', adminAuth, async (req, res) => {
  try {
    const { isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password');

    res.json({ message: 'User status updated', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get KYC submissions
router.get('/kyc', adminAuth, async (req, res) => {
  try {
    const status = req.query.status;
    
    let query = {
      kycTID: { $exists: true, $ne: null, $ne: '' }
    };
    
    if (status && status !== 'all') {
      query.kycStatus = status;
    }
    
    const submissions = await User.find(query)
    .select('username email kycTID kycSubmissionDate kycStatus kycRejectionReason')
    .sort({ kycSubmissionDate: -1 });

    res.json({ submissions });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Review KYC submission
router.put('/kyc/:id/review', [
  adminAuth,
  body('status').isIn(['approved', 'rejected']),
  body('rejectionReason').optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, rejectionReason } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.kycStatus = status;
    if (status === 'rejected') {
      user.kycRejectionReason = rejectionReason;
    } else {
      user.kycRejectionReason = null;
    }

    await user.save();

    res.json({ message: `KYC ${status} successfully` });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get withdrawal requests
router.get('/withdrawals', adminAuth, async (req, res) => {
  try {
    const status = req.query.status || 'pending';
    
    const users = await User.find({
      'withdrawalRequests.status': status
    }).select('username email withdrawalRequests');

    const withdrawals = [];
    users.forEach(user => {
      user.withdrawalRequests
        .filter(req => req.status === status)
        .forEach(req => {
          withdrawals.push({
            _id: req._id,
            userId: user._id,
            username: user.username,
            email: user.email,
            amount: req.amount,
            address: req.address,
            status: req.status,
            requestDate: req.requestDate
          });
        });
    });

    withdrawals.sort((a, b) => b.requestDate - a.requestDate);

    res.json({ withdrawals });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Process withdrawal
router.put('/withdrawals/:userId/:withdrawalId', [
  adminAuth,
  body('status').isIn(['approved', 'rejected'])
], async (req, res) => {
  try {
    const { status } = req.body;
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const withdrawal = user.withdrawalRequests.id(req.params.withdrawalId);
    if (!withdrawal) {
      return res.status(404).json({ message: 'Withdrawal request not found' });
    }

    withdrawal.status = status;
    withdrawal.processedDate = new Date();

    // If rejected, return the amount to user balance
    if (status === 'rejected') {
      user.spxBalance += withdrawal.amount;
    }

    await user.save();

    res.json({ message: `Withdrawal ${status} successfully` });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get settings (public endpoint)
router.get('/settings/public', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
      await settings.save();
    }
    
    // Return public settings including USDT wallet
    res.json({
      kycEnabled: settings.kycEnabled,
      miningEnabled: settings.miningEnabled,
      referralEnabled: settings.referralEnabled,
      withdrawalsEnabled: settings.withdrawalsEnabled,
      usdtWalletAddress: settings.usdtWalletAddress,
      kycUsdtAmount: settings.kycUsdtAmount
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all settings (admin only)
router.get('/settings', adminAuth, async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
      await settings.save();
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update settings
router.put('/settings', adminAuth, async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }

    Object.keys(req.body).forEach(key => {
      if (settings.schema.paths[key]) {
        settings[key] = req.body[key];
      }
    });

    await settings.save();
    res.json({ message: 'Settings updated successfully', settings });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
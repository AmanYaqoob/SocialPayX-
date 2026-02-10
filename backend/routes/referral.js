import express from 'express';
import { auth } from '../middleware/auth.js';
import User from '../models/User.js';
import Settings from '../models/Settings.js';

const router = express.Router();

// Get referral info
router.get('/info', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const settings = await Settings.findOne() || new Settings();
    
    // Get referral count
    const referralCount = await User.countDocuments({ referredBy: user._id });
    
    // Get referred users
    const referredUsers = await User.find({ referredBy: user._id })
      .select('username createdAt totalMined')
      .sort({ createdAt: -1 });

    res.json({
      referralCode: user.referralCode,
      referralCount,
      referralEarnings: user.referralEarnings,
      referralCommission: settings.referralCommission,
      referralEnabled: settings.referralEnabled,
      referredUsers
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get referral stats
router.get('/stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    const totalReferrals = await User.countDocuments({ referredBy: user._id });
    const activeReferrals = await User.countDocuments({ 
      referredBy: user._id, 
      isMining: true 
    });

    res.json({
      totalReferrals,
      activeReferrals,
      totalEarnings: user.referralEarnings
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
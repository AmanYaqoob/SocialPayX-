import express from 'express';
import { auth } from '../middleware/auth.js';
import User from '../models/User.js';
import Settings from '../models/Settings.js';

const router = express.Router();

// Start mining
router.post('/start', auth, async (req, res) => {
  try {
    const settings = await Settings.findOne() || new Settings();
    
    if (!settings.miningEnabled) {
      return res.status(400).json({ message: 'Mining is currently disabled' });
    }

    const user = await User.findById(req.user.id);

    if (user.isMining) {
      return res.status(400).json({ message: 'Mining already active' });
    }

    // Calculate mining rate based on referrals
    const miningRate = await user.calculateMiningRate();

    // Update user mining status
    await User.findByIdAndUpdate(req.user.id, {
      isMining: true,
      miningStartTime: new Date(),
      miningRate: miningRate
    });

    const updatedUser = await User.findById(req.user.id);
    
    res.json({ 
      message: 'Mining started successfully', 
      miningStartTime: updatedUser.miningStartTime,
      miningRate: updatedUser.miningRate,
      isMining: true
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Stop mining
router.post('/stop', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user.isMining) {
      return res.status(400).json({ message: 'Mining is not active' });
    }

    // Calculate earnings
    const miningDuration = (new Date() - user.miningStartTime) / (1000 * 60 * 60); // hours
    const earnings = miningDuration * user.miningRate;

    // Update user with earnings
    await User.findByIdAndUpdate(req.user.id, {
      $inc: {
        spxBalance: earnings,
        totalMined: earnings
      },
      isMining: false,
      miningStartTime: null,
      lastMiningClaim: new Date()
    });

    const updatedUser = await User.findById(req.user.id);

    res.json({ 
      message: 'Mining stopped successfully', 
      earnings,
      newBalance: updatedUser.spxBalance,
      totalMined: updatedUser.totalMined
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get mining status
router.get('/status', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const settings = await Settings.findOne() || new Settings();
    
    // Calculate current mining rate based on referrals
    const miningRate = await user.calculateMiningRate();
    
    // Update mining rate if changed
    if (user.miningRate !== miningRate) {
      user.miningRate = miningRate;
      await user.save();
    }
    
    let currentEarnings = 0;
    if (user.isMining && user.miningStartTime) {
      const miningDuration = (new Date() - user.miningStartTime) / (1000 * 60 * 60);
      currentEarnings = miningDuration * miningRate;
    }

    res.json({
      isMining: user.isMining,
      miningStartTime: user.miningStartTime,
      currentEarnings,
      miningRate: miningRate,
      spxBalance: user.spxBalance,
      totalMined: user.totalMined,
      miningEnabled: settings.miningEnabled
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
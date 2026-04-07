import express from 'express';
import { auth } from '../middleware/auth.js';
import User from '../models/User.js';
import Settings from '../models/Settings.js';

const router = express.Router();

const MINING_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

// Auto-stop and credit earnings if 24h has passed
async function autoStopIfExpired(user) {
  if (!user.isMining || !user.miningStartTime) return user;

  const elapsed = Date.now() - new Date(user.miningStartTime).getTime();
  if (elapsed < MINING_DURATION_MS) return user;

  // Cap earnings at exactly 24h
  const cappedHours = MINING_DURATION_MS / (1000 * 60 * 60);
  const earnings = cappedHours * user.miningRate;

  await User.findByIdAndUpdate(user._id, {
    $inc: { tokenBalance: earnings, spxBalance: earnings, totalMined: earnings },
    isMining: false,
    miningStartTime: null,
    lastMiningClaim: new Date(),
  });

  return await User.findById(user._id);
}

// Start mining
router.post('/start', auth, async (req, res) => {
  try {
    const settings = await Settings.findOne() || new Settings();

    if (!settings.miningEnabled) {
      return res.status(400).json({ message: 'Mining is currently disabled' });
    }

    let user = await User.findById(req.user.id);

    // Auto-stop expired session before starting new one
    user = await autoStopIfExpired(user);

    if (user.isMining) {
      return res.status(400).json({ message: 'Mining already active' });
    }

    const miningRate = await user.calculateMiningRate();

    await User.findByIdAndUpdate(req.user.id, {
      isMining: true,
      miningStartTime: new Date(),
      miningRate: miningRate,
    });

    const updatedUser = await User.findById(req.user.id);

    res.json({
      message: 'Mining started successfully',
      miningStartTime: updatedUser.miningStartTime,
      miningRate: parseFloat(updatedUser.miningRate.toFixed(4)),
      isMining: true,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Stop mining
router.post('/stop', auth, async (req, res) => {
  try {
    let user = await User.findById(req.user.id);

    if (!user.isMining) {
      return res.status(400).json({ message: 'Mining is not active' });
    }

    // Cap earnings at 24h max
    const elapsed = Date.now() - new Date(user.miningStartTime).getTime();
    const miningHours = Math.min(elapsed, MINING_DURATION_MS) / (1000 * 60 * 60);
    const earnings = miningHours * user.miningRate;

    await User.findByIdAndUpdate(req.user.id, {
      $inc: { tokenBalance: earnings, spxBalance: earnings, totalMined: earnings },
      isMining: false,
      miningStartTime: null,
      lastMiningClaim: new Date(),
    });

    const updatedUser = await User.findById(req.user.id);

    res.json({
      message: 'Mining stopped successfully',
      earnings,
      newBalance: updatedUser.tokenBalance ?? updatedUser.spxBalance,
      tokenBalance: updatedUser.tokenBalance ?? updatedUser.spxBalance,
      totalMined: updatedUser.totalMined,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get mining status
router.get('/status', auth, async (req, res) => {
  try {
    let user = await User.findById(req.user.id);
    const settings = await Settings.findOne() || new Settings();

    // Auto-stop and credit if 24h has passed
    user = await autoStopIfExpired(user);

    // Recalculate rate in case referrals changed
    const miningRate = await user.calculateMiningRate();
    if (user.miningRate !== miningRate) {
      user.miningRate = miningRate;
      await user.save();
    }

    let currentEarnings = 0;
    let timeRemainingMs = 0;

    if (user.isMining && user.miningStartTime) {
      const elapsed = Date.now() - new Date(user.miningStartTime).getTime();
      const cappedElapsed = Math.min(elapsed, MINING_DURATION_MS);
      const miningHours = cappedElapsed / (1000 * 60 * 60);
      currentEarnings = miningHours * miningRate;
      timeRemainingMs = Math.max(0, MINING_DURATION_MS - elapsed);
    }

    res.json({
      isMining: user.isMining,
      miningStartTime: user.miningStartTime,
      currentEarnings,
      timeRemainingMs,
      miningRate: parseFloat(miningRate.toFixed(4)),
      tokenBalance: user.tokenBalance ?? user.spxBalance,
      spxBalance: user.spxBalance,
      totalMined: user.totalMined,
      miningEnabled: settings.miningEnabled,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

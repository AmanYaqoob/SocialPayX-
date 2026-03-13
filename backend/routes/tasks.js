import express from 'express';
import { auth } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

const TASKS = {
  // Social tasks
  twitter:   { reward: 10, name: 'Follow on X (Twitter)' },
  telegram:  { reward: 15, name: 'Join Telegram' },
  instagram: { reward: 10, name: 'Follow on Instagram' },
  youtube:   { reward: 20, name: 'Subscribe on YouTube' },

  // Quiz tasks
  quiz_what_is_spx:        { reward: 20, name: 'Quiz: What is SocialPayX?' },
  quiz_what_is_blockchain: { reward: 15, name: 'Quiz: What is a blockchain?' },
  quiz_spx_earn:           { reward: 20, name: 'Quiz: How do you earn SPX?' },
  quiz_what_is_bitcoin:    { reward: 15, name: 'Quiz: Who created Bitcoin?' },
  quiz_spx_referral:       { reward: 20, name: 'Quiz: SocialPayX referrals' },
  quiz_what_is_wallet:     { reward: 15, name: 'Quiz: What is a crypto wallet?' },
};

const DAILY_BONUS_REWARD = 50;

// GET /api/tasks/status
router.get('/status', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('completedTasks lastDailyBonus');
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dailyBonusClaimed = user.lastDailyBonus && user.lastDailyBonus >= startOfToday;
    res.json({ completedTasks: user.completedTasks || [], dailyBonusClaimed });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/tasks/complete
router.post('/complete', auth, async (req, res) => {
  try {
    const { taskId } = req.body;
    const task = TASKS[taskId];
    if (!task) return res.status(400).json({ message: 'Invalid task ID' });

    const user = await User.findById(req.user.id);
    if (user.completedTasks && user.completedTasks.includes(taskId)) {
      return res.status(400).json({ message: 'Task already completed' });
    }

    user.spxBalance += task.reward;
    user.totalMined += task.reward;
    user.completedTasks = [...(user.completedTasks || []), taskId];
    await user.save();

    res.json({ message: `+${task.reward} SPX added to your wallet.`, reward: task.reward, newBalance: user.spxBalance });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/tasks/daily-bonus
router.post('/daily-bonus', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (user.lastDailyBonus && user.lastDailyBonus >= startOfToday) {
      return res.status(400).json({ message: 'Daily bonus already claimed today' });
    }

    user.spxBalance += DAILY_BONUS_REWARD;
    user.totalMined += DAILY_BONUS_REWARD;
    user.lastDailyBonus = now;
    await user.save();

    res.json({ message: `+${DAILY_BONUS_REWARD} SPX added to your wallet.`, reward: DAILY_BONUS_REWARD, newBalance: user.spxBalance });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

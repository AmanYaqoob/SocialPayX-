import express from 'express';
import { auth } from '../middleware/auth.js';
import User from '../models/User.js';
import QuizTask from '../models/QuizTask.js';

const router = express.Router();

const DAILY_BONUS_REWARD = 5;

// GET /api/tasks/status — returns completed task IDs + all active tasks from DB
router.get('/status', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('completedTasks lastDailyBonus');
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dailyBonusClaimed = user.lastDailyBonus && user.lastDailyBonus >= startOfToday;

    // Fetch all active tasks from DB
    const tasks = await QuizTask.find({ isActive: true }).sort({ createdAt: 1 });

    res.json({
      completedTasks: user.completedTasks || [],
      dailyBonusClaimed,
      tasks,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/tasks/complete
router.post('/complete', auth, async (req, res) => {
  try {
    const { taskId } = req.body;

    // Look up task in DB
    const task = await QuizTask.findOne({ taskId, isActive: true });
    if (!task) return res.status(400).json({ message: 'Invalid or inactive task ID' });

    const user = await User.findById(req.user.id);
    if (user.completedTasks && user.completedTasks.includes(taskId)) {
      return res.status(400).json({ message: 'Task already completed' });
    }

    user.spxBalance += task.reward;
    user.totalMined += task.reward;
    user.completedTasks = [...(user.completedTasks || []), taskId];
    await user.save();

    res.json({
      message: `+${task.reward} SPX added to your wallet.`,
      reward: task.reward,
      newBalance: user.spxBalance,
    });
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

    res.json({
      message: `+${DAILY_BONUS_REWARD} SPX added to your wallet.`,
      reward: DAILY_BONUS_REWARD,
      newBalance: user.spxBalance,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

import express from 'express';
import { body, validationResult } from 'express-validator';
import { subAdminAuth } from '../middleware/auth.js';
import QuizTask from '../models/QuizTask.js';

const router = express.Router();

// GET all tasks (admin + subadmin)
router.get('/', subAdminAuth, async (req, res) => {
  try {
    const tasks = await QuizTask.find().sort({ createdAt: -1 });
    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST create new task
router.post('/', [
  subAdminAuth,
  body('taskId').notEmpty().trim(),
  body('name').notEmpty().trim(),
  body('reward').isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { taskId, name, question, options, correctAnswer, reward, isActive, category, url } = req.body;
    const existing = await QuizTask.findOne({ taskId });
    if (existing) return res.status(400).json({ message: 'Task ID already exists. Choose a unique task ID.' });

    const task = new QuizTask({ taskId, name, question, options: options || [], correctAnswer, reward, isActive, category, url });
    await task.save();
    res.status(201).json({ message: 'Task created successfully', task });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT update task
router.put('/:id', [
  subAdminAuth,
  body('name').optional().trim(),
  body('reward').optional().isInt({ min: 1 })
], async (req, res) => {
  try {
    const task = await QuizTask.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const { name, question, options, correctAnswer, reward, isActive, category, url } = req.body;
    if (name !== undefined) task.name = name;
    if (question !== undefined) task.question = question;
    if (options !== undefined) task.options = options;
    if (correctAnswer !== undefined) task.correctAnswer = correctAnswer;
    if (reward !== undefined) task.reward = reward;
    if (isActive !== undefined) task.isActive = isActive;
    if (category !== undefined) task.category = category;
    if (url !== undefined) task.url = url;

    await task.save();
    res.json({ message: 'Task updated successfully', task });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE task
router.delete('/:id', subAdminAuth, async (req, res) => {
  try {
    const task = await QuizTask.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

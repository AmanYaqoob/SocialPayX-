import express from 'express';
import { body, validationResult } from 'express-validator';
import { auth, adminAuth } from '../middleware/auth.js';
import News from '../models/News.js';

const router = express.Router();

// Public: Get all published news
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const category = req.query.category;
    const skip = (page - 1) * limit;

    const query = { isPublished: true };
    if (category) query.category = category;

    const news = await News.find(query)
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'username');

    const total = await News.countDocuments(query);

    res.json({
      news,
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

// Public: Get single news by ID
router.get('/:id', async (req, res) => {
  try {
    const news = await News.findById(req.params.id).populate('author', 'username');
    
    if (!news || !news.isPublished) {
      return res.status(404).json({ message: 'News not found' });
    }

    // Increment views
    news.views += 1;
    await news.save();

    res.json(news);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin: Get all news (including unpublished)
router.get('/admin/all', adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const news = await News.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'username');

    const total = await News.countDocuments();

    res.json({
      news,
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

// Admin: Create news
router.post('/', [
  adminAuth,
  body('title').notEmpty().trim(),
  body('content').notEmpty().trim(),
  body('category').optional().isIn(['announcement', 'update', 'maintenance', 'promotion', 'general']),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, content, category, priority, isPublished, imageUrl } = req.body;

    const news = new News({
      title,
      content,
      category,
      priority,
      isPublished: isPublished !== false,
      author: req.user._id,
      imageUrl
    });

    await news.save();
    res.status(201).json({ message: 'News created successfully', news });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin: Update news
router.put('/:id', [
  adminAuth,
  body('title').optional().trim(),
  body('content').optional().trim()
], async (req, res) => {
  try {
    const { title, content, category, priority, isPublished, imageUrl } = req.body;
    
    const news = await News.findById(req.params.id);
    if (!news) {
      return res.status(404).json({ message: 'News not found' });
    }

    if (title) news.title = title;
    if (content) news.content = content;
    if (category) news.category = category;
    if (priority) news.priority = priority;
    if (typeof isPublished === 'boolean') news.isPublished = isPublished;
    if (imageUrl !== undefined) news.imageUrl = imageUrl;

    await news.save();
    res.json({ message: 'News updated successfully', news });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin: Delete news
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const news = await News.findByIdAndDelete(req.params.id);
    
    if (!news) {
      return res.status(404).json({ message: 'News not found' });
    }

    res.json({ message: 'News deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

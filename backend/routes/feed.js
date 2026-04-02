import express from 'express';
import { body, validationResult } from 'express-validator';
import { auth } from '../middleware/auth.js';
import SocialPost from '../models/SocialPost.js';

const router = express.Router();

function formatPost(post, userId) {
  const obj = post.toObject ? post.toObject() : post;
  return {
    ...obj,
    likeCount:    obj.likes?.length ?? 0,
    commentCount: obj.comments?.length ?? 0,
    liked:        userId ? obj.likes?.some(id => id.toString() === userId.toString()) : false,
  };
}

// GET /api/feed
router.get('/', auth, async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(20, parseInt(req.query.limit) || 10);
    const skip  = (page - 1) * limit;

    const posts = await SocialPost.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const userId = req.user._id.toString();
    const formatted = posts.map(p => ({
      ...p,
      likeCount:    p.likes?.length ?? 0,
      commentCount: p.comments?.length ?? 0,
      liked:        p.likes?.some(id => id.toString() === userId) ?? false,
    }));

    const total = await SocialPost.countDocuments();
    res.json({
      posts: formatted,
      pagination: { page, limit, total, pages: Math.ceil(total / limit), hasMore: page * limit < total },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/feed
router.post('/',
  [auth, body('content').optional().isString().isLength({ max: 1000 }), body('imageUrl').optional({ nullable: true }).isString()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
      const { content = '', imageUrl = null } = req.body;
      if (!content.trim() && !imageUrl) return res.status(400).json({ message: 'Post must have text or an image.' });
      if (imageUrl && imageUrl.startsWith('data:video')) return res.status(400).json({ message: 'Videos are not allowed. Images only.' });

      const post = new SocialPost({ userId: req.user._id, username: req.user.username, content: content.trim(), imageUrl });
      await post.save();
      res.status(201).json({ message: 'Post created!', post: formatPost(post, req.user._id) });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// POST /api/feed/:id/like
router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await SocialPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    const userId = req.user._id.toString();
    const idx = post.likes.findIndex(id => id.toString() === userId);
    let liked;
    if (idx === -1) { post.likes.push(req.user._id); liked = true; }
    else { post.likes.splice(idx, 1); liked = false; }
    await post.save();
    res.json({ liked, likeCount: post.likes.length });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/feed/:id/comment
router.post('/:id/comment',
  [auth, body('text').notEmpty().isLength({ max: 500 })],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
      const post = await SocialPost.findById(req.params.id);
      if (!post) return res.status(404).json({ message: 'Post not found' });
      const comment = { userId: req.user._id, username: req.user.username, text: req.body.text.trim() };
      post.comments.push(comment);
      await post.save();
      const saved = post.comments[post.comments.length - 1];
      res.status(201).json({ comment: saved, commentCount: post.comments.length });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// GET /api/feed/:id/comments
router.get('/:id/comments', auth, async (req, res) => {
  try {
    const post = await SocialPost.findById(req.params.id).select('comments');
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json({ comments: post.comments });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/feed/:id/share
router.post('/:id/share', auth, async (req, res) => {
  try {
    const post = await SocialPost.findByIdAndUpdate(req.params.id, { $inc: { shares: 1 } }, { new: true });
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json({ shares: post.shares });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE /api/feed/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await SocialPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    const isOwner = post.userId.toString() === req.user._id.toString();
    if (!isOwner && !req.user.isAdmin) return res.status(403).json({ message: 'Not authorized to delete this post' });
    await post.deleteOne();
    res.json({ message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

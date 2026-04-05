import express from 'express';
import { body, validationResult } from 'express-validator';
import { auth } from '../middleware/auth.js';
import SocialPost from '../models/SocialPost.js';

const router = express.Router();

function formatPost(post, userId) {
  const obj = post.toObject ? post.toObject() : post;
  const mediaUrl  = obj.mediaUrl  || obj.imageUrl  || null;
  const mediaType = obj.mediaType || (obj.imageUrl ? 'image' : null);
  return {
    ...obj,
    mediaUrl,
    mediaType,
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
    const formatted = posts.map(p => {
      const mediaUrl  = p.mediaUrl  || p.imageUrl  || null;
      const mediaType = p.mediaType || (p.imageUrl ? 'image' : null);
      return {
        ...p,
        mediaUrl,
        mediaType,
        likeCount:    p.likes?.length ?? 0,
        commentCount: p.comments?.length ?? 0,
        liked:        p.likes?.some(id => id.toString() === userId) ?? false,
      };
    });

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
  [
    auth,
    body('content').optional().isString().isLength({ max: 1000 }),
    body('mediaUrl').optional({ nullable: true }).isString(),
    body('mediaType').optional({ nullable: true }).isIn(['image', 'video', null]),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
      const { content = '', mediaUrl = null, mediaType = null } = req.body;
      if (!content.trim() && !mediaUrl)
        return res.status(400).json({ message: 'Post must have text or media.' });

      const post = new SocialPost({
        userId:   req.user._id,
        username: req.user.username,
        content:  content.trim(),
        mediaUrl,
        mediaType,
      });
      await post.save();
      res.status(201).json({ message: 'Post created!', post: formatPost(post, req.user._id) });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// POST /api/feed/:id/view — increment view count (fires when video plays or post is opened)
router.post('/:id/view', auth, async (req, res) => {
  try {
    const post = await SocialPost.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json({ views: post.views });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/feed/:id/like
router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await SocialPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    const userId = req.user._id.toString();
    const idx = post.likes.findIndex(id => id.toString() === userId);
    let liked;
    if (idx === -1) { post.likes.push(req.user._id); liked = true; }
    else            { post.likes.splice(idx, 1);      liked = false; }
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
    const post = await SocialPost.findByIdAndUpdate(
      req.params.id,
      { $inc: { shares: 1 } },
      { new: true }
    );
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
    if (!isOwner && !req.user.isAdmin) return res.status(403).json({ message: 'Not authorized' });
    await post.deleteOne();
    res.json({ message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

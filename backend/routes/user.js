import express from 'express';
import { auth } from '../middleware/auth.js';
import User from '../models/User.js';
import SocialPost from '../models/SocialPost.js';

const router = express.Router();

// GET /api/user/profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/user/social-stats — returns video/image views, likes, followers, posts
router.get('/social-stats', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all posts by this user
    const posts = await SocialPost.find({ userId }).lean();

    const totalPosts    = posts.length;
    const totalLikes    = posts.reduce((sum, p) => sum + (p.likes?.length ?? 0), 0);
    const totalComments = posts.reduce((sum, p) => sum + (p.comments?.length ?? 0), 0);
    const totalShares   = posts.reduce((sum, p) => sum + (p.shares ?? 0), 0);
    const totalViews    = posts.reduce((sum, p) => sum + (p.views ?? 0), 0);

    const videoPosts = posts.filter(p => p.mediaType === 'video');
    const imagePosts = posts.filter(p => p.mediaType === 'image' || p.imageUrl);

    const totalVideoLikes = videoPosts.reduce((sum, p) => sum + (p.likes?.length ?? 0), 0);
    const totalVideoViews = videoPosts.reduce((sum, p) => sum + (p.views ?? 0), 0);

    // Followers = users who follow this user (referral count for now)
    const followers = await User.countDocuments({ referredBy: userId });

    // Recent posts with stats
    const recentPosts = posts
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 6)
      .map(p => ({
        _id:        p._id,
        content:    p.content,
        mediaUrl:   p.mediaUrl || p.imageUrl || null,
        mediaType:  p.mediaType || (p.imageUrl ? 'image' : null),
        likes:      p.likes?.length ?? 0,
        comments:   p.comments?.length ?? 0,
        shares:     p.shares ?? 0,
        views:      p.views ?? 0,
        createdAt:  p.createdAt,
      }));

    res.json({
      totalPosts,
      totalLikes,
      totalComments,
      totalShares,
      totalViews,
      totalVideoLikes,
      totalVideoViews,
      videoPosts:  videoPosts.length,
      imagePosts:  imagePosts.length,
      followers,
      recentPosts,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT /api/user/profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { username } = req.body;
    const user = await User.findById(req.user.id);

    if (user.isAdmin) {
      return res.status(403).json({ message: 'Admin username cannot be changed' });
    }

    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: 'Username already taken' });
      }
      user.username = username;
    }

    await user.save();
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

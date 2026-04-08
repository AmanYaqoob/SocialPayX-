import express from 'express';
import mongoose from 'mongoose';
import { auth } from '../middleware/auth.js';
import User from '../models/User.js';
import SocialPost from '../models/SocialPost.js';

const router = express.Router();

// GET /api/user/profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/user/social-stats — aggregated post + social metrics for the current user
router.get('/social-stats', auth, async (req, res) => {
  try {
    const userId = req.user._id; // ObjectId — safe for both .find() and $in

    // All posts by this user
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

    // Real followers count from the followers array on the User document
    const userDoc = await User.findById(userId).select('followers following').lean();
    const followersCount = userDoc?.followers?.length ?? 0;
    const followingCount = userDoc?.following?.length ?? 0;

    // Recent posts with stats (latest 6)
    const recentPosts = posts
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 6)
      .map(p => ({
        _id:       p._id,
        content:   p.content,
        mediaUrl:  p.mediaUrl || p.imageUrl || null,
        mediaType: p.mediaType || (p.imageUrl ? 'image' : null),
        likes:     p.likes?.length ?? 0,
        comments:  p.comments?.length ?? 0,
        shares:    p.shares ?? 0,
        views:     p.views ?? 0,
        createdAt: p.createdAt,
      }));

    res.json({
      totalPosts,
      totalLikes,
      totalComments,
      totalShares,
      totalViews,
      totalVideoLikes,
      totalVideoViews,
      videoPosts:     videoPosts.length,
      imagePosts:     imagePosts.length,
      followers:      followersCount,
      following:      followingCount,
      recentPosts,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/user/:id/public — public profile for any user
router.get('/:id/public', auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid user id.' });
    }

    const target = await User.findById(req.params.id)
      .select('username _id followers following createdAt')
      .lean();
    if (!target) return res.status(404).json({ message: 'User not found.' });

    const posts = await SocialPost.find({ userId: req.params.id }).lean();

    const recentPosts = posts
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 6)
      .map(p => ({
        _id:       p._id,
        content:   p.content,
        mediaUrl:  p.mediaUrl || p.imageUrl || null,
        mediaType: p.mediaType || (p.imageUrl ? 'image' : null),
        likes:     p.likes?.length ?? 0,
        comments:  p.comments?.length ?? 0,
        shares:    p.shares ?? 0,
        views:     p.views ?? 0,
        createdAt: p.createdAt,
      }));

    res.json({
      _id:            target._id,
      username:       target.username,
      followersCount: target.followers?.length ?? 0,
      followingCount: target.following?.length ?? 0,
      totalPosts:     posts.length,
      totalLikes:     posts.reduce((s, p) => s + (p.likes?.length ?? 0), 0),
      totalViews:     posts.reduce((s, p) => s + (p.views ?? 0), 0),
      recentPosts,
      createdAt:      target.createdAt,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/user/:id/follow — follow or unfollow a user (toggle)
router.post('/:id/follow', auth, async (req, res) => {
  try {
    const targetId = req.params.id;
    const meId     = req.user._id;

    if (targetId === meId.toString()) {
      return res.status(400).json({ message: "You can't follow yourself." });
    }

    if (!mongoose.Types.ObjectId.isValid(targetId)) {
      return res.status(400).json({ message: 'Invalid user id.' });
    }

    const [me, target] = await Promise.all([
      User.findById(meId),
      User.findById(targetId),
    ]);

    if (!target) return res.status(404).json({ message: 'User not found.' });

    const alreadyFollowing = me.following.some(id => id.toString() === targetId);

    if (alreadyFollowing) {
      // Unfollow
      me.following     = me.following.filter(id => id.toString() !== targetId);
      target.followers = target.followers.filter(id => id.toString() !== meId.toString());
    } else {
      // Follow
      me.following.push(targetId);
      target.followers.push(meId);
    }

    await Promise.all([me.save(), target.save()]);

    res.json({
      following:      !alreadyFollowing,
      followersCount: target.followers.length,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/user/:id/follow-status — check if current user follows target
router.get('/:id/follow-status', auth, async (req, res) => {
  try {
    const targetId = req.params.id;
    const me = await User.findById(req.user._id).select('following').lean();
    const following = me.following.some(id => id.toString() === targetId);

    const target = await User.findById(targetId).select('followers following username').lean();
    if (!target) return res.status(404).json({ message: 'User not found.' });

    res.json({
      following,
      followersCount: target.followers?.length ?? 0,
      followingCount: target.following?.length ?? 0,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/user/:id/followers — list followers of a user
router.get('/:id/followers', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('followers')
      .populate('followers', 'username _id');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({ followers: user.followers });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/user/:id/following — list users a user is following
router.get('/:id/following', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('following')
      .populate('following', 'username _id');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({ following: user.following });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT /api/user/profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { username } = req.body;
    const user = await User.findById(req.user._id);

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

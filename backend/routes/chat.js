import express from 'express';
import { auth } from '../middleware/auth.js';
import ChatMessage from '../models/ChatMessage.js';
import User from '../models/User.js';

const router = express.Router();

// In-memory rate limiter: userId -> [timestamps]
const rateLimitMap = new Map();
const RATE_LIMIT = 5;       // max messages
const RATE_WINDOW = 60000;  // per 60 seconds

// In-memory online users: userId -> lastSeen timestamp
const onlineUsers = new Map();
const ONLINE_TIMEOUT = 30000; // 30 seconds

function isRateLimited(userId) {
  const now = Date.now();
  const key = userId.toString();
  if (!rateLimitMap.has(key)) rateLimitMap.set(key, []);
  const timestamps = rateLimitMap.get(key).filter(t => now - t < RATE_WINDOW);
  rateLimitMap.set(key, timestamps);
  if (timestamps.length >= RATE_LIMIT) return true;
  timestamps.push(now);
  return false;
}

function cleanOnlineUsers() {
  const now = Date.now();
  for (const [uid, ts] of onlineUsers.entries()) {
    if (now - ts > ONLINE_TIMEOUT) onlineUsers.delete(uid);
  }
}

// GET /api/chat/messages?since=<timestamp>&limit=50
// Returns latest messages (or messages after `since`)
router.get('/messages', auth, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const since = req.query.since ? new Date(parseInt(req.query.since)) : null;

    const query = since ? { createdAt: { $gt: since } } : {};

    const messages = await ChatMessage.find(query)
      .sort({ createdAt: since ? 1 : -1 })
      .limit(limit)
      .lean();

    // If no `since`, reverse so oldest-first
    const ordered = since ? messages : messages.reverse();

    res.json({ messages: ordered });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/chat/send
router.post('/send', auth, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message cannot be empty' });
    }

    const trimmed = message.trim().slice(0, 300);

    if (isRateLimited(req.user._id)) {
      return res.status(429).json({
        message: `Slow down! Max ${RATE_LIMIT} messages per minute.`
      });
    }

    const user = await User.findById(req.user._id).select('username').lean();

    const chatMsg = new ChatMessage({
      userId: req.user._id,
      username: user.username,
      message: trimmed,
    });

    await chatMsg.save();

    res.status(201).json({ message: chatMsg });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/chat/heartbeat - update online presence
router.post('/heartbeat', auth, async (req, res) => {
  onlineUsers.set(req.user._id.toString(), Date.now());
  cleanOnlineUsers();
  res.json({ onlineCount: onlineUsers.size });
});

// GET /api/chat/online - get online user count
router.get('/online', auth, async (req, res) => {
  // Update this user's presence
  onlineUsers.set(req.user._id.toString(), Date.now());
  cleanOnlineUsers();
  res.json({ onlineCount: onlineUsers.size });
});

export default router;

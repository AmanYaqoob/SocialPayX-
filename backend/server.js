import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import morgan from 'morgan';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import miningRoutes from './routes/mining.js';
import kycRoutes from './routes/kyc.js';
import walletRoutes from './routes/wallet.js';
import referralRoutes from './routes/referral.js';
import adminRoutes from './routes/admin.js';
import newsRoutes from './routes/news.js';
import tasksRoutes from './routes/tasks.js';
import feedRoutes from './routes/feed.js';
import adminTasksRoutes from './routes/adminTasks.js';

dotenv.config();

const app = express();

app.use(morgan('combined'));
app.use(helmet());
app.use(cors({
  origin: ['https://socialpayx.com', 'https://www1.socialpayx.com'],
  credentials: true
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/mining', miningRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/referral', referralRoutes);
app.use('/api/admin/tasks', adminTasksRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/feed', feedRoutes);

app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const PORT = process.env.PORT || 5001;
app.listen(PORT, '127.0.0.1', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Proxying through Nginx at https://socialpayx.com/api`);
});

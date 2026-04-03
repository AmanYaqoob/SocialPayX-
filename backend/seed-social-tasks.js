import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const quizTaskSchema = new mongoose.Schema({
  taskId:        { type: String, required: true, unique: true, trim: true },
  name:          { type: String, required: true, trim: true },
  question:      { type: String, trim: true },
  options:       [{ type: String, trim: true }],
  correctAnswer: { type: String, trim: true },
  reward:        { type: Number, required: true, min: 1, default: 2 },
  isActive:      { type: Boolean, default: true },
  category:      { type: String, enum: ['quiz', 'social'], default: 'social' },
  url:           { type: String, trim: true },
}, { timestamps: true });

const QuizTask = mongoose.model('QuizTask', quizTaskSchema);

const SOCIAL_TASKS = [
  {
    taskId:   'social_instagram',
    name:     'Follow us on Instagram',
    question: '',
    options:  [],
    correctAnswer: '',
    reward:   2,
    isActive: true,
    category: 'social',
    url:      'https://www.instagram.com/socialpayx',
  },
  {
    taskId:   'social_twitter',
    name:     'Follow us on X (Twitter)',
    question: '',
    options:  [],
    correctAnswer: '',
    reward:   2,
    isActive: true,
    category: 'social',
    url:      'https://x.com/SocialPayX',
  },
  {
    taskId:   'social_telegram',
    name:     'Join our Telegram',
    question: '',
    options:  [],
    correctAnswer: '',
    reward:   2,
    isActive: true,
    category: 'social',
    url:      'https://t.me/socialpayx',
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  for (const task of SOCIAL_TASKS) {
    const exists = await QuizTask.findOne({ taskId: task.taskId });
    if (exists) {
      console.log(`⏭️  Skipped (already exists): ${task.taskId}`);
    } else {
      await QuizTask.create(task);
      console.log(`✅ Created: ${task.taskId}`);
    }
  }

  await mongoose.disconnect();
  console.log('Done!');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });

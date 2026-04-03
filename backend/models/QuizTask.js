import mongoose from 'mongoose';

const quizTaskSchema = new mongoose.Schema({
  taskId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  question: {
    type: String,
    required: true,
    trim: true
  },
  options: [{
    type: String,
    trim: true
  }],
  correctAnswer: {
    type: String,
    required: true,
    trim: true
  },
  reward: {
    type: Number,
    required: true,
    min: 1,
    default: 10
  },
  isActive: {
    type: Boolean,
    default: true
  },
  category: {
    type: String,
    enum: ['quiz', 'social'],
    default: 'quiz'
  }
}, {
  timestamps: true
});

const QuizTask = mongoose.model('QuizTask', quizTaskSchema);
export default QuizTask;

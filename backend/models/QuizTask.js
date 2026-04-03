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
    trim: true,
    default: ''
  },
  options: [{
    type: String,
    trim: true
  }],
  correctAnswer: {
    type: String,
    trim: true,
    default: ''
  },
  reward: {
    type: Number,
    required: true,
    min: 1,
    default: 2
  },
  isActive: {
    type: Boolean,
    default: true
  },
  category: {
    type: String,
    enum: ['quiz', 'social'],
    default: 'quiz'
  },
  url: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: true
});

const QuizTask = mongoose.model('QuizTask', quizTaskSchema);
export default QuizTask;

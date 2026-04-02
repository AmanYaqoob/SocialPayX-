import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema({
  username: { type: String, required: true, maxlength: 30 },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true, maxlength: 300 },
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: false
});

// TTL index: auto-delete messages after 24 hours
chatMessageSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

// Index for fast reads (latest messages)
chatMessageSchema.index({ createdAt: -1 });

export default mongoose.model('ChatMessage', chatMessageSchema);

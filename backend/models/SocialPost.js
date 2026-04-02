import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String, required: true },
  text:     { type: String, required: true, maxlength: 500 },
}, { timestamps: true });

const socialPostSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String, required: true },
  content:  { type: String, maxlength: 1000, default: '' },
  imageUrl: { type: String, default: null },
  likes:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [commentSchema],
  shares:   { type: Number, default: 0 },
}, { timestamps: true });

socialPostSchema.index({ createdAt: -1 });

export default mongoose.model('SocialPost', socialPostSchema);

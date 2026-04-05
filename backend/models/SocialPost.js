import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String, required: true },
  text:     { type: String, required: true, maxlength: 500 },
}, { timestamps: true });

const socialPostSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username:  { type: String, required: true },
  content:   { type: String, maxlength: 1000, default: '' },

  // Cloudinary media
  mediaUrl:  { type: String, default: null },
  mediaType: { type: String, enum: ['image', 'video', null], default: null },

  // Keep imageUrl for backwards compat with old posts
  imageUrl:  { type: String, default: null },

  likes:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [commentSchema],
  shares:   { type: Number, default: 0 },
  views:    { type: Number, default: 0 },   // ← NEW: view count
}, { timestamps: true });

socialPostSchema.index({ createdAt: -1 });
socialPostSchema.index({ userId: 1 });

export default mongoose.model('SocialPost', socialPostSchema);

import mongoose from 'mongoose';

const newsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['announcement', 'update', 'maintenance', 'promotion', 'general'],
    default: 'general'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  isPublished: { type: Boolean, default: true },
  publishedAt: { type: Date, default: Date.now },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  imageUrl: { type: String },
  views: { type: Number, default: 0 }
}, {
  timestamps: true
});

newsSchema.index({ publishedAt: -1 });
newsSchema.index({ isPublished: 1 });

export default mongoose.model('News', newsSchema);

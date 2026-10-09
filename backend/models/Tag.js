import mongoose from 'mongoose';

const tagSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true 
  },
  slug: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true 
  }, // e.g., "node-js"
  category: { 
    type: String, 
    enum: ['language', 'framework', 'concept', 'soft-skill'],
    required: true 
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Tag = mongoose.model('Tag', tagSchema);
export default Tag;

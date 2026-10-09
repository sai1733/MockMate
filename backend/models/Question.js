import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    trim: true 
  },
  track: { 
    type: String, 
    required: true,
    trim: true 
  }, // e.g., "Frontend", "Backend", "Fullstack", "HR"
  difficulty: { 
    type: String, 
    enum: ['Junior', 'Mid', 'Senior'], 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['TECHNICAL', 'HR_BEHAVIORAL'], 
    required: true 
  },
  tags: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Tag' 
  }], 
  idealAnswerFormat: { 
    type: String, 
    required: true 
  }, // Used to anchor Gemini's grading
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Question = mongoose.model('Question', questionSchema);
export default Question;

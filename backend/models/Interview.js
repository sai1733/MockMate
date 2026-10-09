import mongoose from 'mongoose';

const interviewQuestionSchema = new mongoose.Schema({
  questionId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Question', 
    required: true 
  },
  tags: [{ 
    type: String 
  }], // DENORMALIZED tag slugs (e.g., ["javascript", "async"])
  userTranscript: { 
    type: String, 
    default: null 
  },
  aiFeedback: { 
    type: Object, 
    default: null 
  }, // Parsed Gemini JSON
  score: { 
    type: Number, 
    default: null 
  },
  visualScore: {
    type: Number,
    default: null
  },
  status: { 
    type: String, 
    enum: ['pending_evaluation', 'graded'], 
    default: 'pending_evaluation' 
  }
}, { _id: true });

const interviewSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true 
  },
  track: { 
    type: String, 
    required: true 
  },
  difficulty: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['in-progress', 'completed', 'abandoned'], 
    default: 'in-progress', 
    index: true 
  },
  currentQuestionIndex: { 
    type: Number, 
    default: 0 
  },
  currentQuestionStartedAt: { 
    type: Date,
    default: Date.now 
  }, // Security anchor for the 120s timer
  startedAt: { 
    type: Date, 
    default: Date.now 
  },
  completedAt: { 
    type: Date 
  },
  questions: [interviewQuestionSchema]
});

const Interview = mongoose.model('Interview', interviewSchema);
export default Interview;

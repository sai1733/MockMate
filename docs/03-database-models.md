# 03 - Database Models & Analytics Aggregations

## 1. User & Identity Schema
The `User` model supports both local (email/password) and OAuth (Google) authentication.

```javascript
// User Schema
{
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  password: { type: String, required: function() { return this.authProvider === 'local'; } },
  role: { type: String, enum: ['candidate', 'admin'], default: 'candidate' },
  authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
  googleId: { type: String, sparse: true },
  refreshToken: { type: String }, // Hashed
  createdAt: { type: Date, default: Date.now }
}


// Tag Schema
{
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true }, // e.g., "node-js"
  category: { type: String, enum: ['language', 'framework', 'concept', 'soft-skill'] }
}

// Question Schema
{
  title: { type: String, required: true },
  track: { type: String, required: true }, // e.g., "Frontend"
  difficulty: { type: String, enum: ['Junior', 'Mid', 'Senior'], required: true },
  type: { type: String, enum: ['TECHNICAL', 'HR_BEHAVIORAL'], required: true },
  tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }], 
  idealAnswerFormat: { type: String, required: true } // Used to anchor Gemini's grading
}


// Interview Schema
{
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  track: { type: String, required: true },
  difficulty: { type: String, required: true },
  status: { type: String, enum: ['in-progress', 'completed', 'abandoned'], default: 'in-progress', index: true },
  currentQuestionIndex: { type: Number, default: 0 },
  currentQuestionStartedAt: { type: Date }, // Security anchor for the 120s timer
  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
  
  questions: [{ 
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    tags: [{ type: String }], // DENORMALIZED tag slugs (e.g., ["javascript", "async"])
    userTranscript: { type: String, default: null },
    aiFeedback: { type: Object, default: null }, // Parsed Gemini JSON
    score: { type: Number, default: null },
    status: { type: String, enum: ['pending_evaluation', 'graded'], default: 'pending_evaluation' }
  }]
}


// GET /api/users/me/stats - Aggregation Pipeline
[
  // 1. Match only completed interviews for this user
  { $match: { userId: ObjectId(userId), status: 'completed' } },
  
  // 2. Flatten the questions array
  { $unwind: "$questions" },
  
  // 3. Flatten the tags array inside each question
  { $unwind: "$questions.tags" },
  
  // 4. Group by tag slug and compute the average score
  { $group: {
      _id: "$questions.tags",
      averageScore: { $avg: "$questions.score" },
      timesTested: { $sum: 1 }
  }},
  
  // 5. Project into the exact object shape required by Recharts <RadarChart>
  { $project: {
      _id: 0,
      subject: "$_id",
      A: { $round: ["$averageScore", 0] },
      fullMark: { $literal: 100 }
  }}
]
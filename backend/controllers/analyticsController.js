import mongoose from 'mongoose';
import Interview from '../models/Interview.js';

/**
 * @desc    Get tag-level skill proficiency stats for candidate
 * @route   GET /api/users/me/stats OR GET /api/analytics/user-stats
 * @access  Private (Candidate/User)
 */
export const getUserStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Exact Aggregation Pipeline defined in docs/03-database-models.md
    const stats = await Interview.aggregate([
      // 1. Match only completed interviews for this user
      { 
        $match: { 
          userId: new mongoose.Types.ObjectId(userId), 
          status: 'completed' 
        } 
      },
      
      // 2. Flatten the questions array
      { $unwind: "$questions" },
      
      // 3. Flatten the tags array inside each question
      { $unwind: "$questions.tags" },
      
      // 4. Group by tag slug and compute the average score
      { 
        $group: {
          _id: "$questions.tags",
          averageScore: { $avg: "$questions.score" },
          timesTested: { $sum: 1 }
        }
      },
      
      // 5. Project into the exact object shape required by Recharts <RadarChart>
      { 
        $project: {
          _id: 0,
          subject: "$_id",
          A: { $round: [{ $ifNull: ["$averageScore", 0] }, 0] },
          fullMark: { $literal: 100 },
          timesTested: 1
        }
      },

      // Sort by subject for deterministic ordering
      { $sort: { subject: 1 } }
    ]);

    return res.status(200).json(stats);
  } catch (error) {
    console.error('Error executing tag proficiency aggregation pipeline:', error);
    return res.status(500).json({ message: 'Server error computing skill analytics' });
  }
};

/**
 * @desc    Get chronological history of completed interviews for candidate
 * @route   GET /api/interviews/history OR GET /api/analytics/history
 * @access  Private (Candidate/User)
 */
export const getInterviewHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    const interviews = await Interview.find({
      userId,
      status: 'completed'
    })
      .sort({ completedAt: -1, startedAt: -1 })
      .populate('questions.questionId', 'title track difficulty')
      .lean();

    const formattedHistory = interviews.map((session) => {
      const scoredQuestions = (session.questions || []).filter(
        (q) => typeof q.score === 'number' && !isNaN(q.score)
      );

      const compositeScore = scoredQuestions.length > 0
        ? Math.round(
            scoredQuestions.reduce((acc, curr) => acc + curr.score, 0) / scoredQuestions.length
          )
        : null;

      return {
        _id: session._id,
        track: session.track,
        difficulty: session.difficulty,
        status: session.status,
        startedAt: session.startedAt,
        completedAt: session.completedAt || session.updatedAt || session.startedAt,
        totalQuestions: session.questions?.length || 0,
        gradedQuestions: scoredQuestions.length,
        compositeScore,
        questions: session.questions
      };
    });

    return res.status(200).json(formattedHistory);
  } catch (error) {
    console.error('Error fetching candidate interview history:', error);
    return res.status(500).json({ message: 'Server error fetching interview history' });
  }
};

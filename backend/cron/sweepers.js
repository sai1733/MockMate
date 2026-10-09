import cron from 'node-cron';
import Interview from '../models/Interview.js';
import Question from '../models/Question.js';
import { evaluateAnswer } from '../services/aiEvaluator.js';

/**
 * Background sweepers per 04-interview-engine.md
 */
export const initSweepers = () => {
  console.log('[Cron Sweepers] Initializing background resiliency sweepers...');

  /**
   * 1. The Grader: Runs every 5 minutes
   * Finds any question marked 'pending_evaluation' with a recorded user transcript
   * and pushes it to Gemini for resilient asynchronous evaluation.
   */
  cron.schedule('*/5 * * * *', async () => {
    console.log('[The Grader] Running 5-minute sweeper for pending evaluations...');
    try {
      const interviewsWithPending = await Interview.find({
        'questions.status': 'pending_evaluation',
        'questions.userTranscript': { $ne: null }
      });

      let gradedCount = 0;

      for (const interview of interviewsWithPending) {
        for (let i = 0; i < interview.questions.length; i++) {
          const qEntry = interview.questions[i];
          if (qEntry.status === 'pending_evaluation' && qEntry.userTranscript) {
            try {
              const questionDoc = await Question.findById(qEntry.questionId);
              const questionText = questionDoc?.title || 'Technical Question';
              const idealAnswerFormat = questionDoc?.idealAnswerFormat || '';
              const questionType = questionDoc?.type || 'TECHNICAL';

              const result = await evaluateAnswer(
                qEntry.userTranscript,
                questionText,
                idealAnswerFormat,
                questionType,
                qEntry.visualScore
              );

              await Interview.updateOne(
                { _id: interview._id, 'questions._id': qEntry._id },
                {
                  $set: {
                    'questions.$.aiFeedback': result.aiFeedback,
                    'questions.$.score': result.score,
                    'questions.$.status': 'graded'
                  }
                }
              );
              gradedCount++;
              console.log(`[The Grader] Successfully graded question ${i + 1} for session ${interview._id}.`);
            } catch (err) {
              console.warn(`[The Grader] Could not grade question ${i + 1} for session ${interview._id}:`, err.message);
            }
          }
        }
      }

      if (gradedCount > 0) {
        console.log(`[The Grader] Successfully swept and graded ${gradedCount} questions.`);
      }
    } catch (error) {
      console.error('[The Grader] Error executing sweeper:', error.message);
    }
  });

  /**
   * 2. The Cleaner: Runs every 1 hour (0 * * * *)
   * Finds interview sessions marked 'in-progress' older than 2 hours
   * and converts them to 'abandoned' to maintain analytics integrity.
   */
  cron.schedule('0 * * * *', async () => {
    console.log('[The Cleaner] Running hourly sweeper for abandoned sessions...');
    try {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      const result = await Interview.updateMany(
        {
          status: 'in-progress',
          startedAt: { $lt: twoHoursAgo }
        },
        {
          $set: { status: 'abandoned' }
        }
      );

      if (result.modifiedCount > 0) {
        console.log(`[The Cleaner] Converted ${result.modifiedCount} abandoned sessions to 'abandoned'.`);
      }
    } catch (error) {
      console.error('[The Cleaner] Error executing cleaner:', error.message);
    }
  });

  console.log('[Cron Sweepers] The Grader (every 5m) and The Cleaner (hourly) initialized.');
};

import Interview from '../models/Interview.js';
import Question from '../models/Question.js';
import Tag from '../models/Tag.js';
import { evaluateAnswer } from '../services/aiEvaluator.js';

/**
 * @desc    Start a new interview session
 * @route   POST /api/interviews/start
 * @access  Private (Candidate)
 */
export const startInterview = async (req, res) => {
  try {
    const { track, difficulty } = req.body;

    if (!track || !difficulty) {
      return res.status(400).json({ message: 'Track and difficulty are required' });
    }

    // 1. Build query filters based on track
    let trackFilter = {};
    const normTrack = track.trim().toLowerCase();
    if (normTrack.includes('hr') || normTrack.includes('behavioral')) {
      trackFilter = { track: { $in: ['HR', 'HR / Behavioral'] } };
    } else if (normTrack === 'devops') {
      const devopsTags = await Tag.find({ slug: { $in: ['devops', 'docker'] } });
      const tagIds = devopsTags.map((t) => t._id);
      trackFilter = tagIds.length > 0 ? { tags: { $in: tagIds } } : { track: new RegExp(`^${track}$`, 'i') };
    } else if (normTrack.includes('system') || normTrack.includes('design')) {
      const sysTags = await Tag.find({ slug: { $in: ['system-design', 'microservices', 'redis-caching', 'sql-databases'] } });
      const tagIds = sysTags.map((t) => t._id);
      trackFilter = tagIds.length > 0 ? { tags: { $in: tagIds } } : { track: new RegExp(`^${track}$`, 'i') };
    } else {
      trackFilter = { track: new RegExp(`^${track}$`, 'i') };
    }

    let matchingQuestions = await Question.find({
      ...trackFilter,
      difficulty
    }).populate('tags');

    // Fallback: If fewer than 5 match exact track + difficulty, fetch by trackFilter alone
    if (matchingQuestions.length < 5) {
      const fallbackQuestions = await Question.find(trackFilter).populate('tags');

      if (fallbackQuestions.length > 0) {
        matchingQuestions = fallbackQuestions;
      } else {
        // Broadest fallback: any question
        matchingQuestions = await Question.find().populate('tags');
      }
    }

    if (matchingQuestions.length === 0) {
      return res.status(404).json({
        message: 'No questions found in question bank. Please add questions via Admin CMS.'
      });
    }

    // 2. Shuffle and pick up to 5 questions
    const shuffled = [...matchingQuestions].sort(() => 0.5 - Math.random());
    const selectedQuestions = shuffled.slice(0, 5);

    // 3. Denormalize tag slugs for aggregation performance per 03-database-models.md
    const denormalizedQuestions = selectedQuestions.map((q) => {
      const tagSlugs = (q.tags || []).map((t) => t.slug || t.name || String(t));
      return {
        questionId: q._id,
        tags: tagSlugs,
        userTranscript: null,
        aiFeedback: null,
        score: null,
        status: 'pending_evaluation'
      };
    });

    // 4. Create Interview Session Document
    const now = new Date();
    const interview = await Interview.create({
      userId: req.user._id,
      track,
      difficulty,
      status: 'in-progress',
      currentQuestionIndex: 0,
      currentQuestionStartedAt: now,
      startedAt: now,
      questions: denormalizedQuestions
    });

    const populatedInterview = await Interview.findById(interview._id)
      .populate('questions.questionId');

    return res.status(201).json(populatedInterview);
  } catch (error) {
    console.error('Error starting interview:', error);
    return res.status(500).json({ message: 'Server error starting interview' });
  }
};

/**
 * @desc    Transition to next question & reset server-side timer anchor
 * @route   POST /api/interviews/:id/next-question
 * @access  Private (Candidate)
 */
export const nextQuestion = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    if (!interview.userId.equals(req.user._id)) {
      return res.status(403).json({ message: 'Unauthorized access to interview session' });
    }

    if (interview.status !== 'in-progress') {
      return res.status(400).json({ message: `Interview is already ${interview.status}` });
    }

    const nextIndex = interview.currentQuestionIndex + 1;

    if (nextIndex >= interview.questions.length) {
      // Completed interview session
      interview.currentQuestionIndex = nextIndex;
      interview.status = 'completed';
      interview.completedAt = new Date();
    } else {
      // Advance question index and reset server timer anchor
      interview.currentQuestionIndex = nextIndex;
      interview.currentQuestionStartedAt = new Date();
    }

    await interview.save();

    const populated = await Interview.findById(interview._id)
      .populate('questions.questionId');

    return res.status(200).json(populated);
  } catch (error) {
    console.error('Error transitioning to next question:', error);
    return res.status(500).json({ message: 'Server error advancing question' });
  }
};

/**
 * @desc    Fire-and-forget answer submission with 125s timer validation
 * @route   POST /api/interviews/:id/answer
 * @access  Private (Candidate)
 */
export const submitAnswer = async (req, res) => {
  try {
    const { userTranscript, questionIndex, visualScore } = req.body;
    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    if (!interview.userId.equals(req.user._id)) {
      return res.status(403).json({ message: 'Unauthorized access to interview session' });
    }

    if (interview.status !== 'in-progress') {
      return res.status(400).json({ message: `Interview is already ${interview.status}` });
    }

    const qIdx = typeof questionIndex === 'number' ? questionIndex : interview.currentQuestionIndex;
    const questionEntry = interview.questions[qIdx];

    if (!questionEntry) {
      return res.status(404).json({ message: 'Question not found at specified index' });
    }

    // 1. Strict Server-Side Timer Validation (120s + 5s grace = 125,000ms) per 04-interview-engine.md
    const startedAtTime = new Date(interview.currentQuestionStartedAt).getTime();
    const elapsedMs = Date.now() - startedAtTime;

    if (elapsedMs > 125000) {
      return res.status(400).json({
        message: 'Time limit exceeded (>125s). Answer forfeited.',
        elapsedMs
      });
    }

    // 2. Fire-and-Forget Persistence: save raw transcript and visualScore, set pending_evaluation
    const numVisual = typeof visualScore === 'number' && !isNaN(visualScore) ? visualScore : null;
    questionEntry.userTranscript = userTranscript || '';
    questionEntry.visualScore = numVisual;
    questionEntry.status = 'pending_evaluation';
    await interview.save();

    // 3. Immediately respond with 202 Accepted to release the client UI instantly
    res.status(202).json({
      message: 'Answer accepted for asynchronous grading',
      questionIndex: qIdx,
      visualScore: numVisual,
      status: 'pending_evaluation'
    });

    // 4. Background Asynchronous IIFE Trigger (non-blocking)
    (async () => {
      try {
        const questionDoc = await Question.findById(questionEntry.questionId);
        const questionText = questionDoc?.title || 'Technical Question';
        const idealAnswerFormat = questionDoc?.idealAnswerFormat || '';
        const questionType = questionDoc?.type || 'TECHNICAL';

        const result = await evaluateAnswer(
          userTranscript,
          questionText,
          idealAnswerFormat,
          questionType,
          numVisual
        );

        // Update database with parsed feedback, composite score, and visual score
        await Interview.updateOne(
          { _id: interview._id, 'questions._id': questionEntry._id },
          {
            $set: {
              'questions.$.aiFeedback': result.aiFeedback,
              'questions.$.score': result.score,
              'questions.$.visualScore': numVisual,
              'questions.$.status': 'graded'
            }
          }
        );
        console.log(`[Interview Engine] Question ${qIdx + 1} for session ${interview._id} graded successfully. Score: ${result.score}`);
      } catch (bgErr) {
        console.error(`[Interview Engine] Background evaluation deferred to cron sweeper for question ${qIdx + 1}:`, bgErr.message);
        // Left as 'pending_evaluation' for The Grader cron sweeper
      }
    })();
  } catch (error) {
    console.error('Error submitting answer:', error);
    return res.status(500).json({ message: 'Server error processing answer' });
  }
};

/**
 * @desc    Get interview session by ID
 * @route   GET /api/interviews/:id
 * @access  Private (Candidate)
 */
export const getInterviewById = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id)
      .populate('questions.questionId');

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    if (!interview.userId.equals(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    return res.status(200).json(interview);
  } catch (error) {
    console.error('Error getting interview:', error);
    return res.status(500).json({ message: 'Server error fetching interview' });
  }
};

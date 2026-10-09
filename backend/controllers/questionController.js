import { GoogleGenerativeAI } from '@google/generative-ai';
import Question from '../models/Question.js';
import Tag from '../models/Tag.js';

// Strict schema for AI-assisted rubric generation per 05-ai-evaluator.md
const aiRubricSchema = {
  type: "object",
  properties: {
    idealAnswerFormat: { 
      type: "string", 
      description: "A flawless, highly technical 3-4 sentence answer to the question." 
    },
    suggestedTags: { 
      type: "array", 
      items: { type: "string" },
      description: "3 to 5 lowercase hyphenated tag slugs (e.g., 'react-hooks', 'system-design')."
    }
  },
  required: ["idealAnswerFormat", "suggestedTags"]
};

/**
 * @desc    Get all questions with optional track/difficulty/type filtering
 * @route   GET /api/questions
 * @access  Private (Admin)
 */
export const getQuestions = async (req, res) => {
  try {
    const { track, difficulty, type } = req.query;
    const filter = {};

    if (track) filter.track = track;
    if (difficulty) filter.difficulty = difficulty;
    if (type) filter.type = type;

    const questions = await Question.find(filter)
      .populate('tags')
      .sort({ createdAt: -1 });

    return res.status(200).json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    return res.status(500).json({ message: 'Server error fetching questions' });
  }
};

/**
 * @desc    Get question by ID
 * @route   GET /api/questions/:id
 * @access  Private (Admin)
 */
export const getQuestionById = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id).populate('tags');
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    return res.status(200).json(question);
  } catch (error) {
    console.error('Error fetching question by ID:', error);
    return res.status(500).json({ message: 'Server error fetching question' });
  }
};

/**
 * @desc    Create a new question
 * @route   POST /api/questions
 * @access  Private (Admin)
 */
export const createQuestion = async (req, res) => {
  try {
    const { title, track, difficulty, type, tags, idealAnswerFormat } = req.body;

    if (!title || !track || !difficulty || !type || !idealAnswerFormat) {
      return res.status(400).json({
        message: 'Please provide title, track, difficulty, type, and idealAnswerFormat'
      });
    }

    // Validate tag IDs if provided
    if (tags && Array.isArray(tags) && tags.length > 0) {
      const validTags = await Tag.find({ _id: { $in: tags } });
      if (validTags.length !== tags.length) {
        return res.status(400).json({ message: 'One or more provided tag IDs are invalid' });
      }
    }

    const question = await Question.create({
      title: title.trim(),
      track: track.trim(),
      difficulty,
      type,
      tags: tags || [],
      idealAnswerFormat: idealAnswerFormat.trim()
    });

    const populatedQuestion = await question.populate('tags');
    return res.status(201).json(populatedQuestion);
  } catch (error) {
    console.error('Error creating question:', error);
    return res.status(500).json({ message: 'Server error creating question' });
  }
};

/**
 * @desc    Update a question
 * @route   PUT /api/questions/:id
 * @access  Private (Admin)
 */
export const updateQuestion = async (req, res) => {
  try {
    const { title, track, difficulty, type, tags, idealAnswerFormat } = req.body;

    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    if (title) question.title = title.trim();
    if (track) question.track = track.trim();
    if (difficulty) question.difficulty = difficulty;
    if (type) question.type = type;
    if (idealAnswerFormat) question.idealAnswerFormat = idealAnswerFormat.trim();

    if (tags && Array.isArray(tags)) {
      const validTags = await Tag.find({ _id: { $in: tags } });
      if (validTags.length !== tags.length) {
        return res.status(400).json({ message: 'One or more provided tag IDs are invalid' });
      }
      question.tags = tags;
    }

    const updated = await question.save();
    const populated = await updated.populate('tags');
    return res.status(200).json(populated);
  } catch (error) {
    console.error('Error updating question:', error);
    return res.status(500).json({ message: 'Server error updating question' });
  }
};

/**
 * @desc    Delete a question
 * @route   DELETE /api/questions/:id
 * @access  Private (Admin)
 */
export const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    await Question.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Error deleting question:', error);
    return res.status(500).json({ message: 'Server error deleting question' });
  }
};

/**
 * @desc    AI-assisted rubric & tag generation using Gemini 1.5 Flash
 * @route   POST /api/questions/generate-rubric
 * @access  Private (Admin)
 */
export const generateRubric = async (req, res) => {
  try {
    const { title, track, difficulty } = req.body;

    if (!title || !track || !difficulty) {
      return res.status(400).json({
        message: 'title, track, and difficulty are required to generate rubric'
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        message: 'GEMINI_API_KEY is not configured in backend environment'
      });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const modelName = process.env.GEMINI_MODEL || 'gemini-3.5-flash';
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: aiRubricSchema
      }
    });

    const prompt = `
  You are an expert Principal Engineer helping an interviewer design a mock interview question.
  Question Title: "${title}"
  Track: "${track}"
  Difficulty: "${difficulty}"

  Task 1: Write the 'idealAnswerFormat'. This must be a concise, highly accurate 3-4 sentence answer. It will be used as the absolute standard to grade candidate answers later. Do not include introductory filler.
  Task 2: Provide an array of 'suggestedTags' relevant to this question.
    `;

    // Resilient generation with exponential backoff on 429 / 503 per ARCHITECTURE.md Protocol 2
    let attempts = 0;
    const maxAttempts = 3;
    let result;

    while (attempts < maxAttempts) {
      try {
        attempts++;
        result = await model.generateContent(prompt);
        break;
      } catch (geminiErr) {
        const isRetryable = geminiErr.status === 429 || geminiErr.status === 503 || geminiErr.message?.includes('503') || geminiErr.message?.includes('429');
        if (isRetryable && attempts < maxAttempts) {
          const jitter = Math.random() * 500;
          const delay = Math.pow(2, attempts) * 1000 + jitter;
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          throw geminiErr;
        }
      }
    }

    const responseText = result.response.text();
    const parsedData = JSON.parse(responseText);

    return res.status(200).json(parsedData);
  } catch (error) {
    console.error('Gemini rubric generation error:', error);
    return res.status(500).json({
      message: 'Failed to generate rubric via Gemini AI',
      error: error.message
    });
  }
};

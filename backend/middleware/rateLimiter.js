import rateLimit from 'express-rate-limit';

/**
 * Auth Limiter: 5 requests per 15 minutes per IP (/api/auth/*)
 * Prevents credential stuffing, brute force, and token flood attacks.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: process.env.NODE_ENV === 'production' ? 5 : 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many authentication attempts from this IP, please try again after 15 minutes'
  }
});

/**
 * Global Limiter: 100 requests per 15 minutes per IP (Standard routes)
 */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: process.env.NODE_ENV === 'production' ? 100 : 2000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many requests from this IP, please try again after 15 minutes'
  }
});

/**
 * AI Engine Limiter: 3 requests per 1 minute per IP (POST /api/interviews/:id/answer)
 * Protects Gemini API rate limits and prevents quota exhaustion.
 */
export const aiEngineLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: process.env.NODE_ENV === 'production' ? 3 : 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many answer submissions. Please wait 1 minute before submitting again.'
  }
});

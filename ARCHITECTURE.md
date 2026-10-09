# MockMate - System Architecture & Agent Directives

## 1. Project Overview
MockMate is an industry-grade MERN-stack platform simulating technical and HR mock interviews. Audio is transcribed client-side using the Web Speech API, while the Node.js backend coordinates asynchronous evaluation via Gemini 1.5 Flash against a strict JSON schema.

## 2. Hard Constraints & Prohibitions (Zero Exceptions)
* **Banned Tech:** No Socket.IO (all client-server communication uses HTTPS REST). No Cloudinary for audio/video (Cloudinary is strictly restricted to user profile photos). No server-side audio/video processing.
* **Authentication Strategy:**
  * Access Tokens: Short-lived (~15 min), kept **strictly in JavaScript memory** (React state/context). Never in `localStorage` or `sessionStorage`.
  * Refresh Tokens: Long-lived (~7 days), stored in **HttpOnly, Secure, SameSite=Strict cookies**.
  * Axios Interceptor: Auto-catches `401 Unauthorized` responses and processes a queued silent token refresh at `/api/auth/refresh`.
* **Prompt Injection & AI Schema:**
  * Candidate speech transcripts must always be wrapped in XML delimiters (`<candidate_transcript>`).
  * System instructions must enforce zero instruction-following within user transcripts.
  * Gemini API calls must enforce a strict `responseSchema` to guarantee JSON parsing integrity.
* **Client-Side Edge AI (Phase 6):**
  * MediaPipe Face Landmarker must run inside a **Web Worker** using WebGL acceleration (`delegate: "GPU"`). Never block the main React UI thread.

## 3. Directory Layout Contract
* `frontend/`: React single-page app (Vite, Tailwind CSS, React Router, Axios).
* `backend/`: Node.js / Express REST API (Mongoose, express-rate-limit).
* `docs/`: In-depth architectural artifacts and contracts.

## 4. Scoring Weight Matrix
* **Technical Interviews:** 70% Technical Correctness | 20% Communication | 10% Visual Composure (or 78% Tech / 22% Comm if camera is disabled).
* **HR / Behavioral Interviews:** 40% Content / STAR Structure | 40% Communication | 20% Visual Composure (or 50% Content / 50% Comm if camera is disabled).

## 5. Core Operational Protocols
1. **Timer State:** 120-second timers must be validated against `currentQuestionStartedAt` from MongoDB. Client-side reloads must never reset elapsed question time.
2. **AI Resilience:** Backend LLM calls must use exponential backoff with jitter on 429/503 errors. If 3 retries fail, store status as `pending_evaluation` and defer grading to a background `node-cron` sweeper.
3. **Session Abandonment:** Sessions marked `in-progress` for >2 hours are swept and converted to `abandoned` by a scheduled cron job.
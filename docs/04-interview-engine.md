# 04 - Interview Engine & State Management

## 1. Pre-Flight Hardware Hook (`useDeviceCheck`)
Never request media permissions inside the live interview room. Doing so ruins the session state if the user denies permissions. 

**Flow:** Setup Screen -> Green Room (Hardware Check) -> Live Interview Room.

**Error Mapping:**
* `NotAllowedError`: User blocked permissions. (Action: Block start, show browser unlock guide).
* `NotReadableError`: Camera/Mic locked by another app like Zoom. (Action: Block start, prompt to close apps).
* `NotFoundError` (No Camera): (Action: Degrade gracefully. Disable MediaPipe, re-weight scoring, proceed with audio only).
* `NotFoundError` (No Mic): (Action: Fatal for voice. Fallback to "Timed Text Mode" or block).

## 2. Interview Room State Machine
A single question cycle in React cycles through these precise states:
1. `PREPARING`: (10 seconds) Question is shown. Audio not recording. Timer visually counting down to start.
2. `RECORDING`: (120 seconds max) Audio recording active. Web Audio API visualizer active. MediaPipe (if enabled) tracking eyes.
3. `SUBMITTING`: Audio recording stops. Payload dispatched to Express.
4. `TRANSITION`: Awaiting `202 Accepted` from backend to instantly load the next question.

## 3. Server-Side Timer Integrity
To prevent users from refreshing the page to get infinite time on a question:
* `POST /api/interviews/:id/next-question` records `currentQuestionStartedAt: Date.now()` in MongoDB.
* React calculates remaining time based on `(Date.now() - backendTimestamp)`.
* When the answer is submitted, Express strictly validates that `Date.now() - currentQuestionStartedAt` does not exceed `125,000ms` (120s + 5s network grace). If it does, the score is forfeited.

## 4. Asynchronous "Fire-and-Forget" Pipeline
Forcing a user to wait 5 seconds between questions while Gemini grades ruins the UX.
* React sends the transcript via `POST /api/interviews/:id/answer`.
* Express saves the raw transcript to MongoDB, sets status to `pending_evaluation`, and immediately returns `202 Accepted` to React.
* Node triggers the Gemini API call in a background asynchronous IIFE (Immediately Invoked Function Expression).
* When the background call finishes, it updates the database with the AI feedback and score.

## 5. AI Resilience (Exponential Backoff)
Gemini 1.5 Flash free tier limits requests to 15 RPM. 
* If Express receives a `429 Too Many Requests` or `503 Service Unavailable`, it triggers an automated retry loop.
* **Wait times:** Attempt 1 (2s), Attempt 2 (4s + random jitter), Attempt 3 (8s + random jitter).
* **Hard Fallback:** If all 3 attempts fail, the API gracefully abandons grading but leaves the transcript in the database as `pending_evaluation`. 

## 6. Background Sweepers (`node-cron`)
* **The Grader:** Runs every 5 minutes. Finds any question marked `pending_evaluation` and pushes it to Gemini.
* **The Cleaner:** Runs every 1 hour. Finds any interview session marked `in-progress` where `startedAt` is older than 2 hours and converts it to `abandoned`, preventing corrupted analytics.
# 01 - System Overview & Execution Roadmap

## 1. Architecture Scope (v1 MVP)
* **Frontend:** React (Vite, Tailwind CSS, Web Speech API for transcription, HTML5 Canvas/Video for camera preview).
* **Backend:** Node.js / Express.js (RESTful API architecture).
* **Database:** MongoDB Atlas via Mongoose.
* **Authentication:** Stateless Access Tokens (in-memory) + Stateful Refresh Tokens (HttpOnly cookies) + RBAC.
* **Storage:** Cloudinary strictly for candidate avatar images. No raw audio/video binary storage.
* **Communication:** HTTPS REST endpoints only. (Socket.IO excluded from v1 MVP).

## 2. Evaluation & Scoring Matrix
Composite score per question is derived from specific signals based on interview track:

### Technical Interviews
* **70% Technical Correctness & Depth:** Evaluated by Gemini 1.5 Flash against the question's rubric and ideal answer format.
* **20% Communication & Structure:** Evaluated via spoken pace (WPM), conciseness, and filler word detection.
* **10% Visual Presence / Composure:** Client-side MediaPipe tracking (Eye contact % and composure).
* *Note:* If webcam is unavailable/blocked, weights dynamically normalize to **78% Technical / 22% Communication**.

### HR & Behavioral Interviews
* **40% Content & Situation Analysis:** Evaluated by Gemini 1.5 Flash for STAR method execution (Situation, Task, Action, Result).
* **40% Communication & Fluency:** Spoken clarity, absence of crutch words, tone, and pacing.
* **20% Visual Presence / Composure:** Eye contact and head pose engagement.
* *Note:* If webcam is unavailable/blocked, weights dynamically normalize to **50% Content / 50% Communication**.

## 3. Master Execution Roadmap

### Phase 1: Foundation & Identity (The Perimeter)
* Express server bootstrap & MongoDB connection.
* User schema with roles (`candidate`, `admin`) and auth providers (`local`, `google`).
* Dual-token issuance, `/api/auth` endpoints, and rate-limiting middleware.
* React client setup (Vite + Tailwind), Axios interceptor queue, AuthContext, and RBAC route guards.

### Phase 2: Content Pipeline (Admin CMS)
* Tag schema (controlled registry) & Question schema.
* Admin CRUD endpoints for questions and tags.
* Admin CMS interface with AI-assisted rubric generation endpoint (`POST /api/admin/generate-rubric`).
* Database pre-population with 15–20 benchmark questions.

### Phase 3: Core Engine (Backend Async Pipeline)
* Interview session schema with denormalized question tags.
* Session initialization (`POST /api/interviews/start`).
* Asynchronous "fire-and-forget" answer submission (`POST /api/interviews/:id/answer`).
* Gemini 1.5 Flash integration with XML-delimited prompt injection defenses and strict JSON schema.
* Server-side timer validation (`currentQuestionStartedAt`).
* Resiliency worker & cron sweepers for abandoned sessions (`status: 'abandoned'`) and pending evaluations.

### Phase 4: Candidate Experience (Frontend Execution)
* Pre-flight hardware check ("Green Room") hook (`useDeviceCheck`).
* Interview room state machine (`PREPARING`, `RECORDING`, `SUBMITTING`, `TRANSITION`).
* Web Speech API integration with auto-restart on silent drops.
* Real-time audio waveform/volume meter via Web Audio API.
* 120-second client-server synchronized countdown timer.

### Phase 5: Analytics & Aggregation
* MongoDB aggregation pipelines (`$unwind`, `$group`, `$project`) calculating tag-level skill proficiencies.
* Analytics API endpoints (`GET /api/users/me/stats`, `GET /api/interviews/history`).
* Candidate dashboard with Recharts:
  * Skill Proficiency Spider/Radar chart.
  * Performance Timeline historical line chart.
* Granular interview session breakdown view.

### Phase 6: Polish & v2 Visual Telemetry
* Public-facing landing page and theme styling.
* Cloudinary avatar upload pipeline via memory-storage multer.
* Client-side MediaPipe Face Landmarker integrated inside a dedicated Web Worker using WebGL (`delegate: "GPU"`).
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const tagsFilePath = path.join(__dirname, '../data/tags.json');
const questionsFilePath = path.join(__dirname, '../data/questions.json');

const validTags = new Set(JSON.parse(fs.readFileSync(tagsFilePath, 'utf8')).map(t => t.slug));
const questions = JSON.parse(fs.readFileSync(questionsFilePath, 'utf8'));

// Replacements map: key = oldTitle, value = newQuestionObject
const replacements = new Map();

// 1. Frontend Mid - Error Boundaries
replacements.set(
  'Explain the React Context API versus external state management libraries (Zustand, Redux Toolkit): when should you use each, and how do you prevent unnecessary re-renders?',
  {
    title: "How do React Error Boundaries work, why can they not catch asynchronous errors or event handler exceptions, and how do you capture those?",
    track: "Frontend",
    difficulty: "Mid",
    type: "TECHNICAL",
    idealAnswerFormat: "Candidates should explain that Error Boundaries are React components implementing componentDidCatch or static getDerivedStateFromError to catch JavaScript errors in child component rendering, lifecycle methods, and constructors. Crucially, they do not catch errors inside asynchronous callbacks (like setTimeout or fetch), event handlers (onClick), or server-side rendering; candidates should explain using try/catch inside handlers, or custom hooks using state setters to throw asynchronously into the nearest boundary, alongside tools like Sentry for automated logging.",
    tags: ["react", "javascript", "testing"]
  }
);

// 2. Frontend Mid - CSS Container Queries
replacements.set(
  'How do you implement and test accessibility (WCAG 2.1 AA) in modern web applications, focusing on ARIA roles, focus management, and keyboard traps?',
  {
    title: "What are CSS Container Queries (@container), how do they differ from viewport Media Queries, and how do they enable truly modular responsive components?",
    track: "Frontend",
    difficulty: "Mid",
    type: "TECHNICAL",
    idealAnswerFormat: "A strong answer explains that viewport media queries (@media) only adapt layouts based on global screen dimensions, breaking responsive component encapsulation when placed inside varying parent layouts (e.g., sidebars vs main content feeds). Container queries (@container) allow a component to query the exact width or inline-size of its direct parent container declared with container-type: inline-size, enabling truly modular, portable design system components that adapt to available local space regardless of screen width.",
    tags: ["html-css", "react"]
  }
);

// 3. Frontend Senior - React Server Actions
replacements.set(
  'Explain Micro-Frontend architectures using Webpack 5 Module Federation: evaluate deployment independence versus shared dependency overhead and runtime isolation.',
  {
    title: "How do React Server Actions work under the hood in Next.js App Router, and how do they ensure secure form mutations with CSRF protection and progressive enhancement?",
    track: "Frontend",
    difficulty: "Senior",
    type: "TECHNICAL",
    idealAnswerFormat: "The candidate should explain that Server Actions are asynchronous functions declared with 'use server' executed on the server via an automated POST request dispatched by React. They support progressive enhancement by functioning with native HTML <form action={action}> even before client JavaScript hydrates. Under the hood, Next.js generates cryptographic action IDs, enforces same-origin CSRF checks via Origin/Host verification, and orchestrates seamless server revalidation using revalidatePath and revalidateTag without manual fetch boilerplate.",
    tags: ["next-js", "react", "web-security"]
  }
);

// 4. Frontend Senior - CSS Houdini
replacements.set(
  'What are Web Components (Custom Elements, Shadow DOM, HTML Templates), and how do they integrate with or compare to modern framework component models?',
  {
    title: "What is CSS Houdini, how does the CSS Paint API work in a separate worklet thread, and how does Typed Object Model (Typed OM) improve CSS performance?",
    track: "Frontend",
    difficulty: "Senior",
    type: "TECHNICAL",
    idealAnswerFormat: "A comprehensive senior answer explains that CSS Houdini exposes low-level browser layout, painting, and compositing hooks directly to developers. The CSS Paint API executes in an isolated PaintWorklet thread off the main thread, generating dynamic procedural graphics directly into the rendering engine's painting stage without generating DOM elements. Candidates should explain that Typed OM replaces clunky string parsing (e.g. el.style.opacity = '0.5') with typed numeric objects (CSS.percent(50)), eliminating string conversion overhead and drastically accelerating DOM style manipulations.",
    tags: ["html-css", "performance", "javascript"]
  }
);

// 5. Frontend Junior - 'this' and Arrow Functions
replacements.set(
  'How do you manage form inputs in React: compare Controlled Components versus Uncontrolled Components using useRef.',
  {
    title: "How does the 'this' keyword behave in traditional JavaScript functions versus arrow functions, and how do call(), apply(), and bind() alter context?",
    track: "Frontend",
    difficulty: "Junior",
    type: "TECHNICAL",
    idealAnswerFormat: "The candidate should explain that in traditional functions, 'this' is dynamically scoped and determined by how the function is invoked (global object in non-strict mode, undefined in strict mode, or the calling object instance). In contrast, arrow functions do not have their own 'this' binding; they lexically inherit 'this' from their enclosing lexical context, making them immune to call(), apply(), or bind() rebinding. Candidates should explain using bind() to fix context in event callbacks or object methods.",
    tags: ["javascript"]
  }
);

// 6. Backend Mid - PostgreSQL Index Types (GIN, GiST, B-Tree)
replacements.set(
  'Explain database connection pool exhaustion, query timeouts, and how circuit breakers protect backend services under heavy load.',
  {
    title: "Compare database index types in PostgreSQL (B-Tree, Hash, GIN, and GiST): when would you choose GIN or GiST over a standard B-Tree index?",
    track: "Backend",
    difficulty: "Mid",
    type: "TECHNICAL",
    idealAnswerFormat: "Candidates should explain that B-Tree is the default, balanced-tree index ideal for equality, range queries (<, >), and sorting on scalar columns. Hash indexes only support fast equality lookups (=). GIN (Generalized Inverted Index) indexes multi-value data types like JSONB documents, full-text search tsvectors, and arrays, where an index entry maps each element to multiple rows. GiST (Generalized Search Tree) handles geometric, spatial (PostGIS coordinates), and hierarchical range data where data points overlap in multidimensional space.",
    tags: ["sql-databases", "performance", "system-design"]
  }
);

// 7. Backend Mid - Express Centralized Error Handling
replacements.set(
  'What are Server-Sent Events (SSE), how do they compare to WebSockets, and how do you handle client reconnections and lost messages?',
  {
    title: "How does centralized error handling middleware work in Express, and how do you ensure unhandled Promise rejections are properly caught and routed to it?",
    track: "Backend",
    difficulty: "Mid",
    type: "TECHNICAL",
    idealAnswerFormat: "A strong answer explains that Express recognizes error-handling middleware by its 4-parameter signature (err, req, res, next) placed at the very end of the middleware chain. In Express 4, unhandled promise rejections inside async route handlers bypass this middleware and crash the process unless explicitly wrapped with try/catch calling next(err) or using express-async-errors. In Express 5, async promise rejections are automatically forwarded to next(err). The handler formats standardized JSON error responses while stripping stack traces in production.",
    tags: ["express", "node-js", "async-programming"]
  }
);

// 8. Backend Mid - Database Deadlocks
replacements.set(
  'Explain the performance differences between Offset/Limit pagination and Keyset (Cursor-based) pagination on large database tables.',
  {
    title: "What causes a database deadlock in concurrent transactional systems, how do database engines detect them, and how do you design queries to prevent them?",
    track: "Backend",
    difficulty: "Mid",
    type: "TECHNICAL",
    idealAnswerFormat: "The candidate should explain that a deadlock occurs when two or more transactions simultaneously hold locks that the other transactions need to proceed, resulting in a circular wait (e.g. Transaction A locks Row 1 and waits for Row 2; Transaction B locks Row 2 and waits for Row 1). Database engines use wait-for graphs and deadlock detection algorithms to terminate the lowest-cost transaction (deadlock victim) with a serialization failure. Prevention strategies include enforcing a strictly consistent global ordering of row locks across all application queries, keeping transactions short, and implementing exponential backoff retries.",
    tags: ["sql-databases", "system-design", "performance"]
  }
);

// 9. Backend Junior - HTTP Cookies & Security Flags
replacements.set(
  'Why should passwords never be stored in plain text, and how does bcrypt hashing with a salt protect user credentials?',
  {
    title: "Explain how HTTP Set-Cookie works, and what the HttpOnly, Secure, and SameSite (Strict vs Lax) flags do to protect web applications.",
    track: "Backend",
    difficulty: "Junior",
    type: "TECHNICAL",
    idealAnswerFormat: "The candidate should explain that the server sends a Set-Cookie response header instructing the browser to persist key-value pairs and attach them to subsequent requests. The HttpOnly flag forbids client-side JavaScript from accessing document.cookie, mitigating session theft via XSS. The Secure flag ensures cookies are only transmitted over encrypted HTTPS connections. The SameSite attribute controls cross-site transmission: Strict blocks the cookie from being sent on any third-party link, while Lax allows top-level GET navigations, preventing CSRF attacks.",
    tags: ["web-security", "rest-apis", "express"]
  }
);

// 10. Fullstack Junior - Git Stash & Cherry-Pick
replacements.set(
  'What is Git version control, how do branching, merging, and Pull Requests enable team collaboration, and how do you resolve merge conflicts?',
  {
    title: "How does the 'git stash' command work, and when would you use 'git cherry-pick' in a fullstack development workflow?",
    track: "Fullstack",
    difficulty: "Junior",
    type: "TECHNICAL",
    idealAnswerFormat: "Candidates should explain that git stash temporarily shelves uncommitted local modifications (both staged and unstaged) into a dirty working directory stack, reverting the working tree to HEAD so developers can switch branches or pull updates without losing work. git stash pop restores and clears the stashed changes. git cherry-pick <commit-hash> applies the exact changes from a specific commit on another branch onto the currently active branch, commonly used to backport urgent bug fixes into production branches without merging entire feature branches.",
    tags: ["devops"]
  }
);

// 11. Fullstack Junior - Mock Service Worker (MSW)
replacements.set(
  'Explain Unit Testing versus Integration Testing across a fullstack application, giving practical examples of each.',
  {
    title: "What is Mock Service Worker (MSW), and how does intercepting network requests at the network level improve frontend and fullstack test reliability?",
    track: "Fullstack",
    difficulty: "Junior",
    type: "TECHNICAL",
    idealAnswerFormat: "A clear answer explains that traditional mock approaches (mocking fetch or axios directly) alter runtime JavaScript implementations and fail to test real HTTP client configuration, headers, or serialization. Mock Service Worker (MSW) uses native Service Workers in the browser (or class-interception in Node.js) to intercept actual HTTP requests at the network level, returning mock JSON responses without modifying production application code. This provides seamless, realistic integration testing for React components and E2E suites.",
    tags: ["testing", "react", "rest-apis"]
  }
);

// 12. Fullstack Junior - Local Dev Proxy (Vite server.proxy)
replacements.set(
  'What is Semantic Versioning (SemVer: MAJOR.MINOR.PATCH) and how do package managers use caret (^) and tilde (~) to manage fullstack dependencies?',
  {
    title: "How do you configure a Vite or Webpack development proxy (server.proxy), and why is it often preferred over enabling broad CORS in local development?",
    track: "Fullstack",
    difficulty: "Junior",
    type: "TECHNICAL",
    idealAnswerFormat: "The candidate should explain that running React on localhost:5173 and Express on localhost:5000 triggers browser CORS restrictions because ports differ. While configuring cors() in Express allows cross-origin requests, configuring a local development proxy in Vite (server.proxy: { '/api': 'http://localhost:5000' }) rewrites client requests so they appear same-origin to the browser. This eliminates CORS preflight OPTIONS requests, matches production same-origin deployment topology, and avoids polluting backend security configurations with localhost rules.",
    tags: ["react", "express", "web-security"]
  }
);

// 13. Fullstack Mid - Feature Flags & Remote Configuration
replacements.set(
  'How do you design and execute automated End-to-End (E2E) testing with Playwright or Cypress in a CI/CD pipeline?',
  {
    title: "How do you architect a Feature Flagging system across a fullstack application to decouple code deployment from feature release?",
    track: "Fullstack",
    difficulty: "Mid",
    type: "TECHNICAL",
    idealAnswerFormat: "Candidates should explain that feature flags wrap new code blocks in conditional checks evaluated at runtime based on user attributes (userId, role, beta-tester group, percentage rollout). The backend retrieves or caches flag rules (via Redis or tools like Unleash/LaunchDarkly) and sends targeting evaluations to the React frontend. This allows developers to continuously merge trunk-based code into production while keeping features dark, enabling instant kill-switches during incidents and progressive canary rollouts without re-deploying code.",
    tags: ["system-design", "devops", "react"]
  }
);

// 14. HR Mid - Managing Project Estimates & Delays
replacements.set(
  'Describe a situation where you strongly disagreed with a senior engineer or architect\'s proposed technical approach: how did you present your counter-case?',
  {
    title: "Tell me about a time when an engineering estimate you gave was significantly off: how did you manage the delay and prevent similar misjudgments?",
    track: "HR",
    difficulty: "Mid",
    type: "HR_BEHAVIORAL",
    idealAnswerFormat: "A strong STAR-method response demonstrates accountability and learning. The candidate should describe recognizing that unforeseen technical complexities or external dependency blockers were expanding the timeline, communicating the delay proactively to project managers with revised milestones, and breaking down the remaining work into smaller, verifiable chunks. They should describe incorporating spikes, buffer margins, and iterative estimation into future sprint planning.",
    tags: ["problem-solving", "communication", "behavioral-leadership"]
  }
);

// 15. HR Mid - Contradictory Requirements from Multiple Clients
replacements.set(
  'How do you navigate cross-functional collaboration when working with Product Managers, UX Designers, and QA engineers who have conflicting priorities?',
  {
    title: "Describe a situation where two enterprise clients or internal stakeholders requested contradictory features in the same product: how did you resolve the conflict?",
    track: "HR",
    difficulty: "Mid",
    type: "HR_BEHAVIORAL",
    idealAnswerFormat: "Candidates should explain focusing on core user needs rather than superficial feature requests. They should describe conducting discovery to uncover the underlying business problems both parties were trying to solve, facilitating a collaborative discussion to find a generalized, configurable platform capability that satisfied both use cases, and maintaining clear communication so neither stakeholder felt ignored.",
    tags: ["conflict-resolution", "communication", "system-design"]
  }
);

// 16. HR Senior - Deprecating Legacy Platforms
replacements.set(
  'Describe a situation where an executive or VP proposed an unrealistic deadline or flawed architectural direction: how did you influence them?',
  {
    title: "Tell me about a time you led the deprecation and sunsetting of a critical legacy platform or internal tool: how did you manage stakeholder resistance and data migration?",
    track: "HR",
    difficulty: "Senior",
    type: "HR_BEHAVIORAL",
    idealAnswerFormat: "The candidate should outline managing technical and human change. They should describe publishing clear migration timelines, deprecation notices, and automated migration tooling to lower switching costs for dependent teams. They should recount actively listening to resistant teams' concerns, resolving edge-case blockers, celebrating milestone milestones, and finally turning off legacy servers while ensuring zero data loss.",
    tags: ["behavioral-leadership", "system-design", "communication"]
  }
);

// 17. HR Senior - Introducing SLOs & Error Budgets
replacements.set(
  'Tell me about an internal developer productivity or developer experience (DevEx) initiative you championed that measurably improved engineering velocity.',
  {
    title: "Describe how you introduced Service Level Objectives (SLOs) and Error Budgets to an engineering organization, and how you enforced accountability when error budgets were burned.",
    track: "HR",
    difficulty: "Senior",
    type: "HR_BEHAVIORAL",
    idealAnswerFormat: "A seasoned senior leader should describe aligning engineering and product around reliability targets (e.g., 99.9% availability measured by SLIs). They should explain establishing the policy: when a service burns its monthly error budget, all feature deployments halt and team velocity pivots 100% to stability, testing, and infrastructure fixes. They should detail coaching product managers to embrace error budgets as an agreed-upon contract for balancing feature velocity with customer trust.",
    tags: ["behavioral-leadership", "devops", "system-design"]
  }
);

// 18. HR Junior - Technical Demo / Sprint Review Presentation
replacements.set(
  'Describe a situation where you had to learn an unfamiliar programming language, framework, or tool under a tight deadline.',
  {
    title: "Tell me about a time you had to present a technical demo or sprint review of your work to teammates or business stakeholders: how did you prepare?",
    track: "HR",
    difficulty: "Junior",
    type: "HR_BEHAVIORAL",
    idealAnswerFormat: "Candidates should demonstrate empathy for their audience by tailoring technical depth: focusing on user impact and working functionality for business stakeholders while being ready to dive into code architecture for engineering peers. They should describe anticipating edge-case questions, practicing a live demonstration with realistic seed data, and handling constructive suggestions with enthusiasm.",
    tags: ["communication", "behavioral-leadership"]
  }
);

// 19. HR Junior - Triaging Multiple Production Bugs
replacements.set(
  'How do you handle receiving critical or challenging feedback on your pull request during a code review?',
  {
    title: "Describe a situation where you were assigned several urgent bug tickets at once: how did you triage them and decide which to tackle first?",
    track: "HR",
    difficulty: "Junior",
    type: "HR_BEHAVIORAL",
    idealAnswerFormat: "The candidate should articulate a clear triage methodology: assessing severity (critical customer blocker vs minor UI defect) and scope of impact (all users vs edge-case subset). They should describe communicating their intended sequence to the team lead to ensure alignment, writing reproducible regression test cases for each fix, and delivering solutions systematically without panic.",
    tags: ["problem-solving", "communication"]
  }
);

// 20. HR Junior - Pair Programming Experience
replacements.set(
  'What motivates your continuous learning in software engineering, and what specific habits or resources do you use to stay current?',
  {
    title: "Tell me about an experience with pair programming: how did you navigate sharing the driver and navigator roles effectively?",
    track: "HR",
    difficulty: "Junior",
    type: "HR_BEHAVIORAL",
    idealAnswerFormat: "A solid answer demonstrates active collaboration and humility. The candidate should describe alternating between typing code (driver) and focusing on the bigger picture, edge cases, and code style (navigator). They should highlight communicating thought processes aloud, being receptive to real-time suggestions, and achieving a higher-quality result faster than working in isolation.",
    tags: ["communication", "behavioral-leadership"]
  }
);

// 21. HR Junior - Handling Repetitive Tasks with Automation
replacements.set(
  'Why are you interested in joining our engineering team, and how do your technical and personal values align with our culture?',
  {
    title: "Describe a situation where you were assigned a repetitive, mundane, or tedious engineering task: how did you maintain motivation and quality?",
    track: "HR",
    difficulty: "Junior",
    type: "HR_BEHAVIORAL",
    idealAnswerFormat: "Candidates should showcase an engineering mindset by seeking automation opportunities (e.g., writing a script to automate repetitive data entry, creating reusable templates, or adding linting rules). They should emphasize maintaining professional pride and thoroughness in execution, recognizing how even mundane tasks contribute to overall system stability and team success.",
    tags: ["problem-solving", "behavioral-leadership"]
  }
);

// Perform replacements
let replacedCount = 0;
const updatedQuestions = questions.map(q => {
  const normTitle = q.title.trim();
  for (const [oldTitle, newQ] of replacements.entries()) {
    if (normTitle.toLowerCase() === oldTitle.trim().toLowerCase()) {
      // Validate tags
      newQ.tags.forEach(t => {
        if (!validTags.has(t)) {
          throw new Error(`Invalid tag "${t}" in new question: ${newQ.title}`);
        }
      });
      replacedCount++;
      return newQ;
    }
  }
  return q;
});

console.log(`Successfully replaced ${replacedCount} / ${replacements.size} questions!`);

if (replacedCount !== replacements.size) {
  console.error(`Warning: Expected to replace ${replacements.size}, but replaced ${replacedCount}`);
  process.exit(1);
}

// Write back to questions.json
fs.writeFileSync(questionsFilePath, JSON.stringify(updatedQuestions, null, 2), 'utf8');
console.log(`Saved updated 240 questions to ${questionsFilePath}! ✅`);

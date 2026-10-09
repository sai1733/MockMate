import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const tagsFilePath = path.join(__dirname, '../data/tags.json');
const questionsFilePath = path.join(__dirname, '../data/questions.json');

const validTags = JSON.parse(fs.readFileSync(tagsFilePath, 'utf8')).map(t => t.slug);
const validTagSet = new Set(validTags);

const existingQuestions = JSON.parse(fs.readFileSync(questionsFilePath, 'utf8'));

// 132 New Questions to bring each cell to exactly 20 (Total 240 questions)
const newQuestions = [
  // ==========================================
  // BACKEND - JUNIOR (14 questions)
  // ==========================================
  {
    title: "Explain standard HTTP status codes (200, 201, 204, 400, 401, 403, 404, 500) and how they should be chosen in REST APIs.",
    track: "Backend",
    difficulty: "Junior",
    type: "TECHNICAL",
    idealAnswerFormat: "The candidate should categorize status codes into 2xx success, 4xx client errors, and 5xx server errors. Key distinctions include 200 OK for successful reads/updates versus 201 Created for new resources and 204 No Content for successful deletes. For errors, they must contrast 401 Unauthorized (missing or invalid credentials) with 403 Forbidden (authenticated but lacking permissions), and differentiate client bad input (400) from unhandled server exceptions (500).",
    tags: ["rest-apis", "web-security", "express"]
  },
  {
    title: "What is an Express routing handler, and what is the difference between path parameters (req.params) and query parameters (req.query)?",
    track: "Backend",
    difficulty: "Junior",
    type: "TECHNICAL",
    idealAnswerFormat: "A solid response defines route handlers as functions bound to specific HTTP verbs and URL paths in Express. Candidates should explain that req.params captures variable path segments defined in route templates (e.g., /users/:id for resource identification), whereas req.query captures optional key-value pairs after the question mark in the URL (e.g., ?page=2&sort=asc for filtering or pagination). Mentioning type conversion from strings is a strong plus.",
    tags: ["express", "node-js", "rest-apis"]
  },
  {
    title: "How does middleware work in Express, and what happens if you forget to call next() inside custom middleware?",
    track: "Backend",
    difficulty: "Junior",
    type: "TECHNICAL",
    idealAnswerFormat: "The candidate should explain that middleware functions have access to the request, response, and the next middleware in the pipeline. They intercept, validate, or mutate requests before reaching the final route controller. If next() is not called and a response is not sent (e.g. res.send or res.json), the client request will hang indefinitely until timing out, blocking socket resources.",
    tags: ["express", "node-js", "async-programming"]
  },
  {
    title: "What is the difference between synchronous file operations (fs.readFileSync) and asynchronous ones (fs.promises.readFile) in Node.js?",
    track: "Backend",
    difficulty: "Junior",
    type: "TECHNICAL",
    idealAnswerFormat: "Candidates should clearly state that fs.readFileSync executes synchronously on the main thread, blocking the Node.js event loop from processing any incoming HTTP requests or timers until disk I/O completes. In contrast, asynchronous operations like fs.promises.readFile offload disk I/O to libuv thread pool workers, returning a Promise and allowing the event loop to keep serving concurrent requests. High-traffic servers must never use sync operations in route handlers.",
    tags: ["node-js", "async-programming", "performance"]
  },
  {
    title: "How does environment variable management with dotenv work, and why should .env files never be committed to Git repositories?",
    track: "Backend",
    difficulty: "Junior",
    type: "TECHNICAL",
    idealAnswerFormat: "A strong answer explains that dotenv parses key-value pairs from a local .env file into process.env at server startup. Committing .env files exposes sensitive credentials (database passwords, API secret keys, JWT salts) to anyone with repository access, risking complete system compromise. Candidates should advocate using .env.example with placeholder keys and injecting actual values via CI/CD pipelines or cloud secret managers.",
    tags: ["node-js", "web-security", "devops"]
  },
  {
    title: "What is JSON, how do JSON.stringify() and JSON.parse() work, and what runtime errors can occur when parsing untrusted input?",
    track: "Backend",
    difficulty: "Junior",
    type: "TECHNICAL",
    idealAnswerFormat: "The candidate should explain JSON as a lightweight, text-based data interchange format based on JavaScript object syntax. JSON.stringify serializes objects to strings while discarding undefined values, functions, and circular references. JSON.parse deserializes valid strings into objects; if the string is malformed or invalid syntax, it throws a fatal SyntaxError, requiring try-catch wrapping or schema validation (like Zod) to prevent server crashes.",
    tags: ["javascript", "node-js", "web-security"]
  },
  {
    title: "Explain the difference between Primary Keys and Foreign Keys in relational databases and how referential integrity is preserved.",
    track: "Backend",
    difficulty: "Junior",
    type: "TECHNICAL",
    idealAnswerFormat: "Candidates should state that a Primary Key uniquely identifies each row in a table, guaranteeing uniqueness and non-null values. A Foreign Key is a field in one table that references the Primary Key of another table, establishing a formal relationship. They should explain how relational databases enforce referential integrity by preventing orphaned records and supporting cascading actions (ON DELETE CASCADE or RESTRICT).",
    tags: ["sql-databases", "system-design"]
  },
  {
    title: "What is database connection pooling, and why is it superior to opening a new database connection on every incoming HTTP request?",
    track: "Backend",
    difficulty: "Junior",
    type: "TECHNICAL",
    idealAnswerFormat: "The candidate should explain that opening a database connection involves TCP handshakes, TLS negotiation, authentication, and backend process allocation, which adds severe latency (100ms+). A connection pool maintains a set of pre-warmed, reusable connections that incoming requests borrow and immediately return. This prevents database server exhaustion, controls concurrency, and dramatically boosts request throughput.",
    tags: ["sql-databases", "mongodb", "performance"]
  },
  {
    title: "What is an ORM or ODM (such as Prisma or Mongoose), and what are the main benefits and drawbacks compared to raw database queries?",
    track: "Backend",
    difficulty: "Junior",
    type: "TECHNICAL",
    idealAnswerFormat: "A great answer explains that an ORM/ODM maps database tables or document collections into programming language objects, offering schema validation, type safety, migrations, and readable syntax. Benefits include faster prototyping, built-in sanitization against basic injection, and consistent developer ergonomics. Drawbacks include hidden query overhead (such as N+1 issues), lack of fine-tuned control over complex joins, and potential performance penalties for massive aggregations.",
    tags: ["mongodb", "sql-databases", "node-js"]
  },
  {
    title: "Why should passwords never be stored in plain text, and how does bcrypt hashing with a salt protect user credentials?",
    track: "Backend",
    difficulty: "Junior",
    type: "TECHNICAL",
    idealAnswerFormat: "The candidate must emphasize that plain text passwords leak instantly during database breaches, and simple hashes like MD5/SHA-256 are vulnerable to rainbow table precomputation and GPU brute-forcing. Bcrypt uses a cryptographically secure random salt to ensure identical passwords produce distinct hashes, and incorporates a configurable work factor (cost/rounds) that deliberately slows down calculation, rendering offline dictionary attacks computationally unfeasible.",
    tags: ["web-security", "node-js"]
  },
  {
    title: "What is API rate limiting, why is it critical for public backend services, and how can it be implemented using IP addresses or user tokens?",
    track: "Backend",
    difficulty: "Junior",
    type: "TECHNICAL",
    idealAnswerFormat: "Candidates should define rate limiting as restricting the number of requests a client can make within a specified time window. It protects backend infrastructure from denial-of-service (DoS) attacks, brute-force password cracking, and scraping. Implementation approaches range from memory-based sliding windows using client IP addresses for public routes, to distributed Redis stores tracking authenticated user IDs or API keys, returning HTTP 429 Too Many Requests upon limit violation.",
    tags: ["web-security", "express", "redis-caching"]
  },
  {
    title: "What is the purpose of a health check endpoint (/health or /live) in backend web applications and containerized environments?",
    track: "Backend",
    difficulty: "Junior",
    type: "TECHNICAL",
    idealAnswerFormat: "The candidate should explain that health check endpoints allow load balancers, orchestrators (like Kubernetes), and uptime monitors to verify whether an application instance is healthy and ready to accept traffic. They should differentiate between liveness probes (checking if the Node.js process is alive or deadlocked) and readiness probes (checking if downstream dependencies like databases and Redis caches are reachable before routing requests).",
    tags: ["devops", "docker", "microservices"]
  },
  {
    title: "What is the difference between stateful session-based authentication and stateless JWT-based authentication in backend applications?",
    track: "Backend",
    difficulty: "Junior",
    type: "TECHNICAL",
    idealAnswerFormat: "Candidates should contrast session-based auth (where server creates a session record in memory/Redis and gives the client a cookie with a session ID) with stateless JWTs (where all user metadata and signatures are encoded into a client-held token). Session auth allows instant server-side revocation but requires shared state across multi-server clusters. JWT auth scales effortlessly horizontally without shared session lookups, but makes instant revocation difficult without token blacklists.",
    tags: ["web-security", "node-js", "rest-apis"]
  },
  {
    title: "What are WebSockets, and when would you choose WebSockets over traditional HTTP request-response polling?",
    track: "Backend",
    difficulty: "Junior",
    type: "TECHNICAL",
    idealAnswerFormat: "A strong response explains that WebSockets establish a persistent, full-duplex TCP connection over a single socket initiated via an HTTP Upgrade handshake. Unlike HTTP polling, which incurs repeated TCP/TLS handshakes and HTTP header overhead, WebSockets transmit lightweight binary or text frames in real time with sub-millisecond latency. They are ideal for chat apps, live collaborative dashboards, real-time gaming, and stock tickers.",
    tags: ["async-programming", "node-js", "performance"]
  },

  // ==========================================
  // BACKEND - MID (8 questions)
  // ==========================================
  {
    title: "How do multi-document transactions work in MongoDB replica sets, and what are their performance trade-offs?",
    track: "Backend",
    difficulty: "Mid",
    type: "TECHNICAL",
    idealAnswerFormat: "Candidates should explain that MongoDB supports ACID transactions across multiple documents and collections using client sessions (session.startTransaction). Transactions enforce snapshot isolation and two-phase commits across replica set nodes. They should highlight trade-offs: multi-document transactions consume significant wiredTiger cache memory, acquire document write locks for the transaction duration, and can cause write conflicts if operations touch hot documents, necessitating short-lived execution and retry logic.",
    tags: ["mongodb", "sql-databases", "system-design"]
  },
  {
    title: "Explain database connection pool exhaustion, query timeouts, and how circuit breakers protect backend services under heavy load.",
    track: "Backend",
    difficulty: "Mid",
    type: "TECHNICAL",
    idealAnswerFormat: "The candidate should explain that when queries execute slowly or traffic spikes, all connections in the pool become occupied, forcing new requests into a growing wait queue that eventually times out and cascades failures. Mitigations include enforcing strict query timeouts, tuning pool sizes based on database CPU cores, and implementing circuit breakers (like opossum). When failure thresholds are exceeded, the circuit opens immediately to fast-fail requests, allowing the database to recover.",
    tags: ["system-design", "performance", "sql-databases"]
  },
  {
    title: "How do you design an Idempotency Key mechanism for payment or financial POST endpoints in a distributed system?",
    track: "Backend",
    difficulty: "Mid",
    type: "TECHNICAL",
    idealAnswerFormat: "A comprehensive answer explains that clients generate a unique UUID Idempotency-Key header on critical requests. The server checks a distributed store (like Redis or an SQL unique constraint table): if the key is currently being processed, it locks or rejects concurrent duplicates; if finished, it returns the cached response payload directly without re-executing business logic. If novel, the operation completes atomically, and the result is stored with a fixed TTL.",
    tags: ["system-design", "redis-caching", "rest-apis"]
  },
  {
    title: "Explain zero-downtime database schema migration strategies when renaming or deleting columns in production systems.",
    track: "Backend",
    difficulty: "Mid",
    type: "TECHNICAL",
    idealAnswerFormat: "Candidates should articulate the expand-and-contract (parallel run) migration pattern. Directly renaming a column in production breaks active application instances. Instead: 1) Expand: add the new column and deploy code that writes to both old and new columns while reading from the old; 2) Backfill: asynchronously copy historical data to the new column; 3) Switch: deploy code that reads and writes solely from the new column; 4) Contract: remove old column and cleanup triggers.",
    tags: ["sql-databases", "devops", "system-design"]
  },
  {
    title: "Compare Redis data structures (Strings, Hashes, Sets, Sorted Sets, Streams) and provide a real-world backend use case for each.",
    track: "Backend",
    difficulty: "Mid",
    type: "TECHNICAL",
    idealAnswerFormat: "The candidate should detail: Strings for key-value caching and distributed locks; Hashes for structured entity representation (user profile fields without serializing whole JSON); Sets for unique tags or online user tracking with fast set operations; Sorted Sets (ZSET) with score indexing for live leaderboards and rate-limiting sliding windows; and Redis Streams for consumer groups and append-only event logging with acknowledgment semantics.",
    tags: ["redis-caching", "system-design", "performance"]
  },
  {
    title: "What are Server-Sent Events (SSE), how do they compare to WebSockets, and how do you handle client reconnections and lost messages?",
    track: "Backend",
    difficulty: "Mid",
    type: "TECHNICAL",
    idealAnswerFormat: "Candidates should explain that SSE is an HTTP-based, unidirectional communication channel where the server pushes text/event-stream chunks to the browser over standard HTTP/2. Unlike WebSockets, it has native browser reconnection, built-in event IDs (Last-Event-ID header), and bypasses complex firewall rules. To prevent lost messages on reconnect, the server inspects Last-Event-ID and replays missed events from a message log or Redis buffer.",
    tags: ["async-programming", "rest-apis", "node-js"]
  },
  {
    title: "Explain the performance differences between Offset/Limit pagination and Keyset (Cursor-based) pagination on large database tables.",
    track: "Backend",
    difficulty: "Mid",
    type: "TECHNICAL",
    idealAnswerFormat: "The candidate should explain that OFFSET 100000 LIMIT 20 forces the database engine to scan and discard 100,000 index rows before returning 20 records, causing O(N) performance degradation as pages advance. In contrast, Keyset/Cursor pagination uses an indexed filter (e.g. WHERE id > :last_seen_id ORDER BY id ASC LIMIT 20), achieving O(1) indexed lookups regardless of depth. Keyset pagination also avoids missing or duplicated records when new rows are inserted concurrently.",
    tags: ["sql-databases", "performance", "rest-apis"]
  },
  {
    title: "How do you design a tamper-proof audit logging system in a microservices backend for regulatory and security compliance?",
    track: "Backend",
    difficulty: "Mid",
    type: "TECHNICAL",
    idealAnswerFormat: "A strong response outlines an append-only audit log capturing actorId, action, targetEntity, before/after diffs, timestamp, IP, and user-agent. The logs should be emitted asynchronously via message queues (e.g. Kafka or SQS) to prevent blocking primary business transactions. For tamper-proofing, audit records should be written to write-once-read-many (WORM) storage, cryptographically chained with cryptographic hashes, or stored in dedicated immutable log stores (like Elasticsearch or AWS CloudTrail/QLDB).",
    tags: ["web-security", "system-design", "microservices"]
  },

  // ==========================================
  // BACKEND - SENIOR (3 questions)
  // ==========================================
  {
    title: "How do you architect a multi-tenant backend database model, and what are the trade-offs between shared database, schema-per-tenant, and database-per-tenant?",
    track: "Backend",
    difficulty: "Senior",
    type: "TECHNICAL",
    idealAnswerFormat: "The candidate should dissect the three architectural patterns: Shared database with tenant_id discriminator is the most cost-effective and easiest to manage, but requires ironclad query-level row security (RLS) to prevent data leakage and suffers from noisy neighbor risks. Schema-per-tenant offers moderate isolation within one DB instance with slightly more complex migrations. Database-per-tenant provides absolute cryptographic/physical data isolation, custom backups, and zero noisy neighbors, but incurs highest infrastructure costs and migration complexity.",
    tags: ["system-design", "sql-databases", "web-security"]
  },
  {
    title: "Explain the Saga Pattern for managing distributed transactions across microservices: compare Choreography versus Orchestration.",
    track: "Backend",
    difficulty: "Senior",
    type: "TECHNICAL",
    idealAnswerFormat: "Candidates should explain that the Saga pattern replaces two-phase commit (2PC) in distributed microservices with a sequence of local transactions where each step publishes an event, with compensating transactions defined to rollback changes if any step fails. In Choreography, services react to domain events peer-to-peer without a central coordinator, which works well for simple workflows but becomes cyclic and hard to track. In Orchestration, a dedicated orchestrator service explicitly directs participants, simplifying monitoring, timeouts, and compensation logic.",
    tags: ["microservices", "system-design", "async-programming"]
  },
  {
    title: "How do you prevent cache stampedes (thundering herd problem) and cache penetration in high-throughput Redis caching layers?",
    track: "Backend",
    difficulty: "Senior",
    type: "TECHNICAL",
    idealAnswerFormat: "A comprehensive answer covers both failure modes. Cache stampede occurs when a hot cache key expires and thousands of concurrent requests miss and hammer the primary database simultaneously; solutions include distributed mutex locking (Redlock) so only one worker regenerates the cache, background probabilistic early recomputation (XFetch), or serving stale cache while updating asynchronously. Cache penetration occurs when queries for non-existent IDs bypass cache; solutions include caching null results with short TTLs and employing Bloom Filters in front of Redis.",
    tags: ["redis-caching", "performance", "system-design"]
  },

  // ==========================================
  // FRONTEND - JUNIOR (10 questions)
  // ==========================================
  {
    title: "What are the core differences between let, const, and var in modern JavaScript, focusing on scoping, hoisting, and re-assignment?",
    track: "Frontend",
    difficulty: "Junior",
    type: "TECHNICAL",
    idealAnswerFormat: "The candidate should explain that var is function-scoped (or globally scoped) and hoisted with an initial value of undefined, allowing duplicate declarations. In contrast, let and const are block-scoped (confined within {}) and hoisted into a Temporal Dead Zone (TDZ), throwing a ReferenceError if accessed prior to declaration. const requires immediate initialization and forbids re-assignment to its identifier, though internal properties of mutated objects can still change unless frozen.",
    tags: ["javascript"]
  },
  {
    title: "Explain the difference between Props and State in React and how unidirectional data flow operates.",
    track: "Frontend",
    difficulty: "Junior",
    type: "TECHNICAL",
    idealAnswerFormat: "Candidates should define Props as read-only, immutable configuration passed from parent components down to child components, enabling component reusability. State is internal, mutable data owned and managed directly within a component (via useState) that triggers re-renders when updated. Unidirectional data flow means data only moves down the component tree; child components communicate changes upward by invoking callback functions passed down as props.",
    tags: ["react", "javascript"]
  },
  {
    title: "How do the JavaScript array methods map(), filter(), and reduce() work, and why is immutability essential in React state updates?",
    track: "Frontend",
    difficulty: "Junior",
    type: "TECHNICAL",
    idealAnswerFormat: "A strong answer explains that map transforms each element into a new array, filter returns a subset meeting a boolean predicate, and reduce accumulates elements into a single value. Crucially, none of these methods mutate the source array. Immutability is vital in React because React performs shallow reference equality checks (===) on state to determine if re-rendering is needed; mutating an existing array in place keeps the same object reference, preventing React from detecting the change.",
    tags: ["javascript", "react", "state-management"]
  },
  {
    title: "Explain the difference between == and === in JavaScript, and provide an example of unexpected type coercion.",
    track: "Frontend",
    difficulty: "Junior",
    type: "TECHNICAL",
    idealAnswerFormat: "The candidate must state that === is strict equality, which compares both value and type without converting types, whereas == is loose equality, which performs implicit type coercion according to abstract equality comparison rules before comparing. Examples of surprising coercion include false == 0 (true), '' == 0 (true), or null == undefined (true). Strict equality is universally recommended to eliminate silent bugs and unexpected coercion behavior.",
    tags: ["javascript"]
  },
  {
    title: "How does event bubbling and event capturing work in the DOM, and what is the difference between event.stopPropagation() and event.preventDefault()?",
    track: "Frontend",
    difficulty: "Junior",
    type: "TECHNICAL",
    idealAnswerFormat: "Candidates should explain the DOM event propagation phases: capture phase (traveling from window down to target element) and bubbling phase (traveling from target back up to window). event.stopPropagation() stops the event from propagating further along the DOM hierarchy to ancestor listeners. In contrast, event.preventDefault() stops the browser's default native action (such as submitting a form or navigating an anchor tag) without halting DOM propagation.",
    tags: ["javascript", "html-css"]
  },
  {
    title: "Explain how the React useEffect hook works, what the dependency array controls, and why cleanup functions are necessary.",
    track: "Frontend",
    difficulty: "Junior",
    type: "TECHNICAL",
    idealAnswerFormat: "A solid answer clarifies that useEffect runs side effects (data fetching, DOM subscriptions, timers) after render and paint. If omitted, the effect runs after every single render; an empty array [] runs once on mount; specifying dependencies runs the effect only when specified values change by reference. The cleanup function returned from useEffect runs prior to re-execution and on component unmount, preventing memory leaks from uncleared intervals, WebSocket connections, or event listeners.",
    tags: ["react", "javascript"]
  },
  {
    title: "What is semantic HTML, why is it critical for accessibility (a11y) and SEO, and what are examples of semantic elements?",
    track: "Frontend",
    difficulty: "Junior",
    type: "TECHNICAL",
    idealAnswerFormat: "The candidate should define semantic HTML as using elements that convey the meaning and structure of content rather than purely visual presentation (e.g. using <nav>, <main>, <article>, <section>, <header>, <button> instead of generic <div> and <span>). Semantic tags enable assistive technologies like screen readers to construct accessibility trees and navigate landmarks, while search engine crawlers accurately parse hierarchy and content relevance for ranking.",
    tags: ["html-css"]
  },
  {
    title: "Explain the CSS Box Model: content, padding, border, margin, and how box-sizing: border-box simplifies layouts.",
    track: "Frontend",
    difficulty: "Junior",
    type: "TECHNICAL",
    idealAnswerFormat: "Candidates should explain that the box model represents the layout rectangular container: inner content, padding surrounding content, border enclosing padding, and margin spacing outside the border. Under default content-box, width applies solely to content, meaning adding padding and borders expands the rendered element dimension beyond the declared width. border-box incorporates padding and border into the specified width/height, eliminating arithmetic headaches and unexpected layout overflow.",
    tags: ["html-css"]
  },
  {
    title: "What is responsive web design, and how do CSS media queries, viewport meta tags, and relative units (rem, em, %) achieve it?",
    track: "Frontend",
    difficulty: "Junior",
    type: "TECHNICAL",
    idealAnswerFormat: "The candidate should explain that responsive design allows web pages to adapt fluidly across devices and screen resolutions. The <meta name='viewport' content='width=device-width, initial-scale=1.0'> tag sets mobile rendering scales correctly. CSS media queries apply custom style rules based on viewport breakpoints (@media (min-width: 768px)). Relative units like rem (relative to root font size), em, and percentages allow proportional scaling and user browser zoom accessibility.",
    tags: ["html-css", "performance"]
  },
  {
    title: "How do you manage form inputs in React: compare Controlled Components versus Uncontrolled Components using useRef.",
    track: "Frontend",
    difficulty: "Junior",
    type: "TECHNICAL",
    idealAnswerFormat: "A great answer explains that Controlled Components have their input values bound directly to React state (value={state} and onChange={setState}), making React the single source of truth for validation and conditional rendering, at the cost of re-rendering on every keystroke. Uncontrolled Components leave input state to the native DOM and read values on submission via a useRef reference, which reduces re-rendering overhead and integrates smoothly with non-React libraries.",
    tags: ["react", "javascript"]
  },

  // ==========================================
  // FRONTEND - MID (9 questions)
  // ==========================================
  {
    title: "Explain the React Context API versus external state management libraries (Zustand, Redux Toolkit): when should you use each, and how do you prevent unnecessary re-renders?",
    track: "Frontend",
    difficulty: "Mid",
    type: "TECHNICAL",
    idealAnswerFormat: "Candidates should explain that React Context is designed for low-frequency global data (current user, theme, locale). Because any consumer component re-renders whenever context value reference changes, Context causes widespread re-renders unless split into distinct granular providers or memoized. External libraries like Zustand or Redux use selector subscriptions outside the React render tree, ensuring only components subscribed to specific mutated slice properties re-render, making them ideal for high-velocity global state.",
    tags: ["react", "state-management", "performance"]
  },
  {
    title: "How do modern CSS methodologies (Tailwind CSS, CSS Modules, Styled Components) compare in terms of build performance, runtime overhead, and CSS bundle size?",
    track: "Frontend",
    difficulty: "Mid",
    type: "TECHNICAL",
    idealAnswerFormat: "A strong response compares: Tailwind CSS utilizes an ahead-of-time scanner generating an atomic utility stylesheet with zero runtime JS overhead and small capped bundle sizes through purge/JIT. CSS Modules provide scoped class names at build time with zero runtime cost. Styled Components and runtime CSS-in-JS libraries generate styles dynamically at client runtime via style tags, introducing JS bundle bloat, parsing overhead, and potential rendering delays on complex trees.",
    tags: ["html-css", "react", "performance"]
  },
  {
    title: "How does code splitting in React work using React.lazy and Suspense, and how does dynamic route-based chunking improve performance?",
    track: "Frontend",
    difficulty: "Mid",
    type: "TECHNICAL",
    idealAnswerFormat: "The candidate should explain that bundling an entire SPA into a single JS file forces clients to download unused pages before interactive rendering. React.lazy utilizes dynamic ES import() statements to split components into distinct script chunks generated by bundlers. When wrapped in <Suspense fallback={<Spinner />} />, the browser only downloads the specific code chunk when the user navigates to that route, dramatically reducing Initial JS execution time and improving Largest Contentful Paint (LCP).",
    tags: ["react", "performance", "javascript"]
  },
  {
    title: "Explain the differences between useMemo and useCallback, what specific problems they solve, and when their overhead outweighs their benefits.",
    track: "Frontend",
    difficulty: "Mid",
    type: "TECHNICAL",
    idealAnswerFormat: "Candidates should clarify that useMemo memoizes the computed result of an expensive function, whereas useCallback memoizes a function definition itself between renders to maintain referential identity when passed to memoized child components (React.memo). Premature usage adds memory allocations for dependency arrays and function closures; their overhead outweighs benefits when applied to cheap arithmetic operations or when passed to components that re-render regardless.",
    tags: ["react", "performance", "javascript"]
  },
  {
    title: "How do TanStack Query (React Query) and SWR manage client-side server state, caching, deduplication, and stale-while-revalidate data fetching?",
    track: "Frontend",
    difficulty: "Mid",
    type: "TECHNICAL",
    idealAnswerFormat: "A solid answer explains that server state is fundamentally different from client UI state because it is asynchronously owned, shared, and out-of-date. TanStack Query uses query keys to manage in-memory caches, deduplicates identical simultaneous requests across components, and serves cached data instantly (stale) while fetching fresh data in the background (revalidate). It automates garbage collection, retry backoff, window focus refetching, and pagination prefetching.",
    tags: ["react", "state-management", "performance"]
  },
  {
    title: "Compare browser storage mechanisms: localStorage, sessionStorage, IndexedDB, and Cookies, highlighting storage quotas, lifecycle, and security risks.",
    track: "Frontend",
    difficulty: "Mid",
    type: "TECHNICAL",
    idealAnswerFormat: "Candidates should contrast: localStorage persists indefinitely with ~5MB limit and synchronous API; sessionStorage clears on tab close; IndexedDB offers asynchronous, transactional storage for gigabytes of structured binary and object data. Cookies (~4KB) travel with every HTTP request. For security, localStorage and IndexedDB are fully readable by JavaScript, making them vulnerable to XSS; sensitive session tokens belong in HttpOnly, SameSite cookies inaccessible to client scripts.",
    tags: ["web-security", "javascript", "performance"]
  },
  {
    title: "How do you implement and test accessibility (WCAG 2.1 AA) in modern web applications, focusing on ARIA roles, focus management, and keyboard traps?",
    track: "Frontend",
    difficulty: "Mid",
    type: "TECHNICAL",
    idealAnswerFormat: "The candidate should advocate the 'first rule of ARIA': use native semantic HTML before custom ARIA roles. For complex interactive widgets (modals, dropdowns), developers must manage keyboard navigation (Tab, Shift+Tab, Escape, Arrows) and trap focus inside open dialogs while restoring focus to triggering elements on close. Automated testing with axe-core, ESLint jsx-a11y, and manual screen reader testing (NVDA, VoiceOver) verify accessibility compliance.",
    tags: ["html-css", "react", "testing"]
  },
  {
    title: "What is the Critical Rendering Path (DOM, CSSOM, Render Tree, Layout, Paint, Composite), and how do you optimize it to improve First Contentful Paint (FCP)?",
    track: "Frontend",
    difficulty: "Mid",
    type: "TECHNICAL",
    idealAnswerFormat: "A strong response outlines the pipeline: browser parses HTML to construct DOM, parses CSS to construct CSSOM, merges them into a Render Tree, calculates geometry in Layout/Reflow, paints pixels into layers, and composites layers on the GPU. To optimize FCP, developers must eliminate render-blocking resources by deferring non-critical scripts (defer/async), inlining critical path CSS, minimizing font flash (font-display: swap), and compressing HTML payloads.",
    tags: ["performance", "html-css", "javascript"]
  },
  {
    title: "How do you implement optimistic UI updates in frontend applications, and how do you handle rollback when backend mutations fail?",
    track: "Frontend",
    difficulty: "Mid",
    type: "TECHNICAL",
    idealAnswerFormat: "Candidates should explain that optimistic updates immediately render expected success states in the UI before network requests finish, eliminating perceived latency. Using state managers or TanStack Query onMutate: 1) cancel outgoing refetches for that query; 2) snapshot current cache state; 3) optimistically update cache with new data. If the backend mutation errors, onError restores the previous snapshot to rollback UI state, and triggers an error toast notification to the user.",
    tags: ["react", "state-management", "async-programming"]
  },

  // ==========================================
  // FRONTEND - SENIOR (11 questions)
  // ==========================================
  {
    title: "How do you design an Enterprise Design System with headless UI primitives (Radix UI / React Aria) and token-based styling across multiple frameworks?",
    track: "Frontend",
    difficulty: "Senior",
    type: "TECHNICAL",
    idealAnswerFormat: "The candidate should detail separating behavior and accessibility from visual aesthetics. Headless primitives provide fully tested WAI-ARIA compliant state machines, focus management, and keyboard navigation without opinions on styling. Design tokens (colors, spacing, typography) are defined in centralized JSON/Figma and compiled via Style Dictionary into CSS custom properties. Component wrappers bind tokens to primitives, providing type-safe compound components and effortless theme switching across teams.",
    tags: ["react", "system-design", "html-css"]
  },
  {
    title: "Explain Micro-Frontend architectures using Webpack 5 Module Federation: evaluate deployment independence versus shared dependency overhead and runtime isolation.",
    track: "Frontend",
    difficulty: "Senior",
    type: "TECHNICAL",
    idealAnswerFormat: "A comprehensive answer explains Module Federation, which allows independent builds to dynamically load remote container modules at runtime over HTTP. Teams achieve independent deployment pipelines and decoupled codebases. However, seniors must highlight engineering trade-offs: shared dependency version mismatches (e.g. two distinct React runtime instances breaking context), CSS styling bleed across remotes, routing coordination complexities, and degraded initial page load if shared singletons fail.",
    tags: ["system-design", "javascript", "performance"]
  },
  {
    title: "How do you diagnose, profile, and fix memory leaks in complex Single Page Applications using Chrome DevTools Memory Profiler?",
    track: "Frontend",
    difficulty: "Senior",
    type: "TECHNICAL",
    idealAnswerFormat: "Candidates should explain using the Memory Panel to capture Heap Snapshots and Allocation Timelines before and after interacting with components. Looking for detached DOM trees (nodes removed from document but retained by JS references) and inspecting retaining paths reveals culprits: uncleared setInterval timers, lingering event listeners on window, uncleared RxJS/WebSocket subscriptions, or closures holding large objects in module-level scopes. Fixes involve strict lifecycle cleanups and WeakMap/WeakRef usage.",
    tags: ["performance", "javascript", "react"]
  },
  {
    title: "What are Web Components (Custom Elements, Shadow DOM, HTML Templates), and how do they integrate with or compare to modern framework component models?",
    track: "Frontend",
    difficulty: "Senior",
    type: "TECHNICAL",
    idealAnswerFormat: "The candidate should explain the W3C standards: Custom Elements define new HTML tags with lifecycle callbacks; Shadow DOM provides scoped DOM encapsulation and isolated CSS styling; and <template> holds inert client markup. Web Components offer true framework-agnostic portability across any stack. However, challenges include server-side rendering complexity (Declarative Shadow DOM required), complex event retargeting, and friction with React's synthetic event system and declarative prop passing.",
    tags: ["javascript", "html-css", "system-design"]
  },
  {
    title: "How do you architect an offline-first Progressive Web App (PWA) using Service Workers, Cache Storage API, and Background Sync?",
    track: "Frontend",
    difficulty: "Senior",
    type: "TECHNICAL",
    idealAnswerFormat: "A strong response explains that a Service Worker acts as a client-side programmable network proxy running in a separate worker thread. It intercepts fetch events to serve assets via caching strategies (Cache-First for static hashed assets, Network-First or Stale-While-Revalidate for API responses). Mutations performed while offline are persisted in IndexedDB, and the Service Worker's Background Sync API replays them reliably once network connectivity is restored.",
    tags: ["performance", "async-programming", "javascript"]
  },
  {
    title: "Explain browser rendering composite layers, hardware acceleration with CSS transform / opacity, and how to avoid layout thrashing and reflows.",
    track: "Frontend",
    difficulty: "Senior",
    type: "TECHNICAL",
    idealAnswerFormat: "Candidates should detail how the browser promotes elements to separate GPU composite layers when animated with transform or opacity (or will-change: transform). Animating these properties bypasses the CPU Layout and Paint phases entirely, running at 60/120 FPS on the compositor thread. Layout thrashing happens when alternating reads (e.g. offsetHeight) and writes to DOM styles in a loop, forcing synchronous reflows; developers must batch reads and writes using requestAnimationFrame or FastDOM.",
    tags: ["performance", "html-css", "javascript"]
  },
  {
    title: "How do you build an end-to-end Real User Monitoring (RUM) frontend telemetry pipeline tracking Core Web Vitals (LCP, INP, CLS) and unhandled errors?",
    track: "Frontend",
    difficulty: "Senior",
    type: "TECHNICAL",
    idealAnswerFormat: "The candidate should describe capturing Google's web-vitals library metrics using PerformanceObserver APIs to measure Largest Contentful Paint, Interaction to Next Paint, and Cumulative Layout Shift. Unhandled exceptions are captured via window.onerror and unhandledrejection listeners alongside React Error Boundaries. Telemetry payloads are batched and dispatched asynchronously using navigator.sendBeacon to ensure data is transmitted reliably even during page unload without blocking navigation.",
    tags: ["performance", "testing", "javascript"]
  },
  {
    title: "Compare frontend rendering and hydration paradigms: Full Client Hydration, Island Architecture (Astro), Streaming SSR with React Suspense, and Resumability (Qwik).",
    track: "Frontend",
    difficulty: "Senior",
    type: "TECHNICAL",
    idealAnswerFormat: "A senior-level answer compares: Traditional SSR downloads HTML but executes all JS to hydrate the entire DOM before interactivity, causing an 'uncanny valley'. React 18 Streaming SSR uses selective hydration to prioritize visible interactive components. Island Architecture renders static HTML by default and only hydrates isolated interactive islands. Resumability (Qwik) serializes application state into HTML, executing zero client JS on page load and loading micro-handlers on-demand upon user interaction.",
    tags: ["react", "next-js", "performance"]
  },
  {
    title: "How do you configure strict Content Security Policy (CSP) headers, Subresource Integrity (SRI), and CORS to safeguard single-page apps against XSS and injection attacks?",
    track: "Frontend",
    difficulty: "Senior",
    type: "TECHNICAL",
    idealAnswerFormat: "Candidates should explain that Content Security Policy (CSP) headers (default-src, script-src 'self', object-src 'none') instruct browsers to only execute scripts from trusted whitelisted domains or matching cryptographic nonces/hashes, neutralizing injected malicious inline scripts. Subresource Integrity (SRI) validates SHA cryptographic hashes of CDN scripts to protect against CDN tampering. CORS restricts cross-origin resource access, and secure cookie flags prevent credential hijacking.",
    tags: ["web-security", "system-design", "performance"]
  },
  {
    title: "Explain the internal architecture of modern frontend bundlers (Vite, Rollup, Turbopack, Webpack 5), contrasting native ESM dev servers with bundle-based tools.",
    track: "Frontend",
    difficulty: "Senior",
    type: "TECHNICAL",
    idealAnswerFormat: "The candidate should explain that legacy bundlers (Webpack) bundle the entire dependency graph into disk/memory bundles before dev servers can launch, resulting in slow startup on large apps. Modern dev servers (Vite) leverage native browser ES Modules (ESM) to serve unbundled source code on-demand, transforming individual files on request while pre-bundling node_modules with esbuild (Go). For production, Vite uses Rollup or Rolldown to generate highly optimized, chunked, and tree-shaken assets.",
    tags: ["performance", "javascript", "devops"]
  },
  {
    title: "How do you architect high-frequency data visualization pipelines in React (e.g. 60 FPS live charting) using HTML5 Canvas or WebGL without stalling the React render cycle?",
    track: "Frontend",
    difficulty: "Senior",
    type: "TECHNICAL",
    idealAnswerFormat: "A master-level answer emphasizes that feeding high-frequency telemetry (100Hz+) into React component state will overwhelm the reconciler and cause severe frame drops. Instead, the React component should simply mount an unmanaged <canvas> ref. A dedicated rendering loop (via requestAnimationFrame) or Web Worker running an OffscreenCanvas updates canvas buffers directly using direct array buffers and WebGL draw calls, completely decoupled from React's reconciliation cycle.",
    tags: ["performance", "react", "javascript"]
  },

  // ==========================================
  // FULLSTACK - JUNIOR (14 questions)
  // ==========================================
  {
    title: "Explain the Client-Server architecture model: trace how an HTTP GET request travels from a browser address bar to a backend server and renders HTML/JSON.",
    track: "Fullstack",
    difficulty: "Junior",
    type: "TECHNICAL",
    idealAnswerFormat: "The candidate should trace the full request lifecycle: DNS lookup resolves the domain name to an IP address; the browser initiates a TCP three-way handshake and TLS negotiation; an HTTP GET request is transmitted over the wire; the backend server receives the request, parses headers, executes route middleware and database queries, and formats a response payload (HTML or JSON) with appropriate status headers; the browser parses the response and renders the UI.",
    tags: ["rest-apis", "node-js", "html-css"]
  },
  {
    title: "What is the difference between client-side routing (React Router) and server-side routing (Express), and what happens when you refresh an SPA on a sub-route?",
    track: "Fullstack",
    difficulty: "Junior",
    type: "TECHNICAL",
    idealAnswerFormat: "Candidates should explain that client-side routing intercepts browser URL changes using the HTML5 History API, rendering matching React component views without reloading the page. Server-side routing directly responds to incoming HTTP requests with new documents or data. If a user refreshes an SPA on /dashboard, the browser asks the backend for /dashboard; if the server does not have a catch-all route (app.get('*')) serving index.html, it returns a 404 error.",
    tags: ["react", "express", "rest-apis"]
  },
  {
    title: "How do you connect a React frontend to an Express backend API using fetch or axios, and how do you handle loading and error states?",
    track: "Fullstack",
    difficulty: "Junior",
    type: "TECHNICAL",
    idealAnswerFormat: "A solid response demonstrates setting up an HTTP client (like axios or fetch) inside a React useEffect or custom hook. Candidates should describe maintaining three state variables: data, loading (boolean), and error (null or message). While the asynchronous request is pending, a loading indicator renders; upon successful resolution, data state updates; upon network failure or 4xx/5xx responses, error state catches the exception and renders an alert.",
    tags: ["react", "express", "rest-apis"]
  },
  {
    title: "Explain Cross-Origin Resource Sharing (CORS) from both the frontend browser perspective and the backend Express configuration perspective.",
    track: "Fullstack",
    difficulty: "Junior",
    type: "TECHNICAL",
    idealAnswerFormat: "The candidate should clarify that CORS is a browser security mechanism that restricts web pages from making AJAX requests to a different domain, port, or protocol than the page origin. For non-simple requests, browsers dispatch an OPTIONS preflight request. The backend Express server must respond with Access-Control-Allow-Origin, Allow-Methods, and Allow-Headers headers (configured via the cors package) to authorize the frontend origin to read responses.",
    tags: ["web-security", "express", "rest-apis"]
  },
  {
    title: "What is Git version control, how do branching, merging, and Pull Requests enable team collaboration, and how do you resolve merge conflicts?",
    track: "Fullstack",
    difficulty: "Junior",
    type: "TECHNICAL",
    idealAnswerFormat: "Candidates should explain Git as a distributed version control system tracking file history via snapshots and commits. Feature branches isolate ongoing work from the main/production branch. Pull Requests allow peers to review code, run CI tests, and approve changes before merging. When two branches modify identical file lines concurrently, Git flags a merge conflict, requiring developers to inspect diff markers (<<<<<<<, =======, >>>>>>>), reconcile changes, and commit the resolved files.",
    tags: ["devops", "testing"]
  },
  {
    title: "What are npm, yarn, and pnpm, and what is the difference between dependencies and devDependencies in package.json?",
    track: "Fullstack",
    difficulty: "Junior",
    type: "TECHNICAL",
    idealAnswerFormat: "A clear answer explains package managers that download and resolve open-source JavaScript libraries into node_modules. dependencies are runtime packages required for the production application to function (e.g. express, react, mongoose). devDependencies are development and build tools only needed during local development and CI testing (e.g. vitest, eslint, tailwindcss), which are pruned during production deployment builds to minimize image sizes.",
    tags: ["node-js", "devops"]
  },
  {
    title: "What is an environment variable, why are they used across fullstack apps, and how do frontend build tools (Vite/Webpack) expose them differently than Node.js?",
    track: "Fullstack",
    difficulty: "Junior",
    type: "TECHNICAL",
    idealAnswerFormat: "The candidate should explain environment variables as external dynamic values passed into processes to configure database URLs, port numbers, and secret keys without hardcoding them. In Node.js, all variables reside in process.env. In frontend build tools (like Vite with VITE_ or Next.js with NEXT_PUBLIC_), only variables explicitly prefixed with the public identifier are statically replaced during build time into client bundles; private server secrets must never be prefixed or exposed to the client.",
    tags: ["web-security", "node-js", "react"]
  },
  {
    title: "How do you structure a fullstack CRUD application across frontend components, HTTP API routes, and database collections?",
    track: "Fullstack",
    difficulty: "Junior",
    type: "TECHNICAL",
    idealAnswerFormat: "Candidates should map the 4 operations: Create (POST /api/items -> database insert -> UI optimistic list prepend), Read (GET /api/items -> database find -> UI list render), Update (PUT/PATCH /api/items/:id -> database updateOne -> UI item edit modal), and Delete (DELETE /api/items/:id -> database deleteOne -> UI item removal). They should emphasize maintaining consistent data schemas, validation middleware on the server, and feedback notifications on the frontend.",
    tags: ["rest-apis", "express", "mongodb"]
  },
  {
    title: "What is a 404 Not Found error, and how should a fullstack application handle missing routes differently on the backend API versus the frontend SPA?",
    track: "Fullstack",
    difficulty: "Junior",
    type: "TECHNICAL",
    idealAnswerFormat: "A strong response clarifies that a backend API route that receives an unmatched path or non-existent resource ID should return HTTP status 404 with a structured JSON error payload ({ success: false, message: 'Resource not found' }). On the frontend SPA, client-side routers match unmatched paths using a wildcard route (<Route path='*' element={<NotFoundPage />} />) to render a helpful navigation UI without crashing the application.",
    tags: ["express", "react", "rest-apis"]
  },
  {
    title: "Explain Unit Testing versus Integration Testing across a fullstack application, giving practical examples of each.",
    track: "Fullstack",
    difficulty: "Junior",
    type: "TECHNICAL",
    idealAnswerFormat: "The candidate should define Unit Testing as testing isolated individual functions or components in isolation from dependencies (e.g. testing a pricing calculation utility or rendering a React button with Vitest/Jest). Integration Testing tests how multiple modules collaborate together (e.g. testing that an Express route handler correctly parses a request, runs middleware, queries an in-memory database, and returns the expected status and JSON response using Supertest).",
    tags: ["testing", "react", "express"]
  },
  {
    title: "What is a Pull Request (PR) code review process, and what key aspects should an engineer inspect before approving a teammate's PR?",
    track: "Fullstack",
    difficulty: "Junior",
    type: "TECHNICAL",
    idealAnswerFormat: "Candidates should explain code review as a collaborative quality gate. Key aspects to verify include: correctness and edge case handling, adherence to team architectural conventions, security vulnerabilities (SQL/NoSQL injection, exposed secrets, missing auth guards), performance traps (N+1 queries, unmemoized expensive loops), automated test coverage, and clear variable naming and documentation.",
    tags: ["testing", "devops", "web-security"]
  },
  {
    title: "Explain the end-to-end fullstack authentication flow: from submitting an HTML login form to token verification and protected route access.",
    track: "Fullstack",
    difficulty: "Junior",
    type: "TECHNICAL",
    idealAnswerFormat: "A solid response details: 1) User enters email and password into a React form; 2) Frontend sends POST /api/auth/login; 3) Express controller verifies user existence, compares passwords using bcrypt; 4) Backend generates signed JWT access token (and refresh token in HttpOnly cookie) and returns user info; 5) Frontend stores access token in memory and redirects to protected dashboard; 6) Subsequent API calls attach token in Authorization: Bearer header; 7) Protect middleware verifies signature.",
    tags: ["web-security", "express", "react"]
  },
  {
    title: "What is Semantic Versioning (SemVer: MAJOR.MINOR.PATCH) and how do package managers use caret (^) and tilde (~) to manage fullstack dependencies?",
    track: "Fullstack",
    difficulty: "Junior",
    type: "TECHNICAL",
    idealAnswerFormat: "The candidate should define SemVer: MAJOR version increments for breaking API changes, MINOR for backwards-compatible new features, and PATCH for backwards-compatible bug fixes. In package.json, tilde (~1.2.3) allows updates to the latest patch version (up to <1.3.0), whereas caret (^1.2.3) allows updates to the latest minor and patch version (up to <2.0.0). Lockfiles (package-lock.json) pin exact tree dependencies to ensure identical builds across environments.",
    tags: ["devops", "node-js"]
  },
  {
    title: "How do you handle client-side form validation versus backend server-side validation in fullstack web applications?",
    track: "Fullstack",
    difficulty: "Junior",
    type: "TECHNICAL",
    idealAnswerFormat: "Candidates should stress that client-side validation (using React Hook Form, HTML5 constraints, or Zod) exists purely for user experience (providing instantaneous feedback before network submission). Backend server validation is mandatory and non-negotiable for system security and data integrity, because any malicious actor can bypass the frontend and fire raw HTTP requests using cURL or Postman. Validations should ideally share common schema definitions.",
    tags: ["web-security", "react", "express"]
  },

  // ==========================================
  // FULLSTACK - MID (9 questions)
  // ==========================================
  {
    title: "How do you architect a fullstack Monorepo using pnpm workspaces and Turborepo for shared TypeScript types and UI packages?",
    track: "Fullstack",
    difficulty: "Mid",
    type: "TECHNICAL",
    idealAnswerFormat: "A strong answer outlines structuring /apps (web, admin, api) and /packages (ui, database, config, types) in a monorepo. pnpm workspaces symlinks internal packages without publishing to npm. Turborepo provides intelligent dependency graph pipelines, caching build artifacts locally and remotely, executing linting, tests, and builds in parallel while caching unchanged tasks. Shared TypeScript types ensure compile-time contract synchronization across client and server.",
    tags: ["typescript", "system-design", "devops"]
  },
  {
    title: "Explain End-to-End Type Safety across the stack: compare tRPC, GraphQL Code Generator, and shared Zod validation schemas.",
    track: "Fullstack",
    difficulty: "Mid",
    type: "TECHNICAL",
    idealAnswerFormat: "Candidates should explain how end-to-end type safety eliminates runtime data mismatches between backend APIs and frontend consumers. tRPC leverages TypeScript inference directly from backend router definitions without code generation or schemas, providing automatic autocomplete on the client. GraphQL Code Generator inspects GraphQL schemas to emit typed client hooks. Shared Zod schemas allow both Express controllers and React forms to infer common TypeScript types (z.infer<typeof Schema>) from a single source of truth.",
    tags: ["typescript", "graphql", "rest-apis"]
  },
  {
    title: "How do you architect secure file uploads in a fullstack application: compare streaming through backend with Multer versus generating S3 Pre-Signed URLs.",
    track: "Fullstack",
    difficulty: "Mid",
    type: "TECHNICAL",
    idealAnswerFormat: "The candidate should compare: Uploading files directly through backend servers via Multer consumes server bandwidth, fills memory buffers or local disk, and bottlenecks Node.js event loops during large multi-megabyte transfers. In contrast, Pre-Signed URLs offload uploads: the client requests a signed PUT URL from the backend, and uploads the binary file directly to AWS S3/Cloudinary. This bypasses backend compute entirely, scales infinitely, and secures uploads with time-limited cryptographic signatures.",
    tags: ["system-design", "performance", "web-security"]
  },
  {
    title: "Compare polling, long-polling, WebSockets, and Server-Sent Events (SSE) across fullstack applications: evaluate latency, overhead, and architectural complexity.",
    track: "Fullstack",
    difficulty: "Mid",
    type: "TECHNICAL",
    idealAnswerFormat: "A comprehensive answer compares: Regular polling creates excessive HTTP overhead and high latency; Long-polling holds connections open until data is available, reducing empty polls but sustaining reconnection overhead. Server-Sent Events (SSE) offers lightweight, unidirectional HTTP streaming perfect for AI token streaming or stock tickers with native browser reconnection. WebSockets provide low-latency full-duplex TCP communication ideal for collaborative editors and chat, but requires specialized load balancers and sticky sessions.",
    tags: ["async-programming", "performance", "system-design"]
  },
  {
    title: "How do you implement fullstack Role-Based Access Control (RBAC) that is strictly synchronized between React route guards and backend API controllers?",
    track: "Fullstack",
    difficulty: "Mid",
    type: "TECHNICAL",
    idealAnswerFormat: "Candidates should explain that the frontend uses higher-order components or route wrappers (<RequireRole allowedRoles={['admin']}>) to conditionally render views and prevent unauthorized navigation. However, frontend guards are purely visual UX affordances. The backend must enforce an authorize(...roles) middleware on every protected API endpoint that inspects the cryptographically verified JWT payload, returning HTTP 403 Forbidden if the user's role does not match, ensuring total security regardless of client state.",
    tags: ["web-security", "react", "express"]
  },
  {
    title: "How do you architect search functionality in a fullstack app: compare SQL LIKE / MongoDB regex with database full-text search indexes and dedicated engines like Elasticsearch?",
    track: "Fullstack",
    difficulty: "Mid",
    type: "TECHNICAL",
    idealAnswerFormat: "A strong response explains: SQL LIKE '%query%' and Mongo $regex perform full table scans (O(N)), completely bypassing B-tree indexes and stalling production databases at scale. Database full-text search (PostgreSQL tsvector / MongoDB $text) creates inverted indexes that support stemming and stop words for moderate datasets. Dedicated search engines like Elasticsearch or Meilisearch provide distributed inverted indexes, typo tolerance, fuzzy matching, and faceting, synchronizing via change-data-capture (CDC).",
    tags: ["sql-databases", "mongodb", "system-design"]
  },
  {
    title: "How do you design and execute automated End-to-End (E2E) testing with Playwright or Cypress in a CI/CD pipeline?",
    track: "Fullstack",
    difficulty: "Mid",
    type: "TECHNICAL",
    idealAnswerFormat: "The candidate should describe running containerized browsers in GitHub Actions to test realistic user journeys (e.g. login, adding an item to cart, checkout). Tests use deterministic test database fixtures (spun up via Docker Compose) and reset state before each suite. Key practices include using user-facing locators (getByRole, getByLabel), waiting on network idle or API responses rather than hardcoded timeouts (sleep), and capturing video artifacts and trace logs on test failures.",
    tags: ["testing", "devops", "docker"]
  },
  {
    title: "Analyze the security and architectural trade-offs of storing authentication tokens in localStorage versus HttpOnly SameSite=Strict cookies.",
    track: "Fullstack",
    difficulty: "Mid",
    type: "TECHNICAL",
    idealAnswerFormat: "Candidates must explain that localStorage is directly accessible to any JavaScript running in the origin, meaning any Cross-Site Scripting (XSS) vulnerability allows attackers to extract tokens instantly. HttpOnly cookies cannot be read by client-side scripts, neutralizing token theft via XSS. However, cookies are automatically sent with browser requests, introducing Cross-Site Request Forgery (CSRF) vulnerabilities, which are mitigated by setting SameSite=Strict/Lax and implementing anti-CSRF tokens.",
    tags: ["web-security", "react", "express"]
  },
  {
    title: "How do you implement internationalization (i18n) across a fullstack application, synchronizing backend localized emails/templates with frontend UI translations?",
    track: "Fullstack",
    difficulty: "Mid",
    type: "TECHNICAL",
    idealAnswerFormat: "A clear answer explains establishing a standardized locale identifier (e.g. en-US, es-ES) derived from user profile settings or Accept-Language headers. The frontend utilizes libraries like react-i18next with lazy-loaded translation JSON namespaces to avoid bundle bloat. The backend uses libraries like i18n-node to translate email notifications and dynamic server error messages, sharing a centralized translation repository or TMS (Translation Management System) to synchronize keys.",
    tags: ["react", "node-js", "rest-apis"]
  },

  // ==========================================
  // FULLSTACK - SENIOR (12 questions)
  // ==========================================
  {
    title: "How do you architect a disaster recovery and high-availability strategy for a fullstack application across Active-Passive and Active-Active multi-region deployments?",
    track: "Fullstack",
    difficulty: "Senior",
    type: "TECHNICAL",
    idealAnswerFormat: "The candidate should define Recovery Time Objective (RTO) and Recovery Point Objective (RPO). In Active-Passive, primary traffic serves from Region A while Region B maintains asynchronous database read replicas and standby containers; DNS failover (Route 53) shifts traffic on outage with low cost but non-zero RTO/RPO. In Active-Active, both regions handle live traffic simultaneously using multi-master databases (e.g. CockroachDB, DynamoDB Global Tables) and geo-DNS, requiring conflict-resolution strategies and managing cross-region replication latency.",
    tags: ["system-design", "devops", "sql-databases"]
  },
  {
    title: "Explain how to architect an Event-Driven Microservices system using Apache Kafka or RabbitMQ, handling event versioning, idempotent consumers, and consumer lag.",
    track: "Fullstack",
    difficulty: "Senior",
    type: "TECHNICAL",
    idealAnswerFormat: "A senior-level answer compares Kafka (distributed append-only commit log with partitioned consumer groups for high-throughput streaming) with RabbitMQ (smart broker with flexible exchange routing). Key architectural pillars include: using Schema Registries (Avro/Protobuf) for backward/forward event compatibility; implementing transactional outbox patterns to guarantee at-least-once publishing without distributed transactions; and ensuring consumers are idempotent via unique event ID deduplication stores.",
    tags: ["microservices", "system-design", "async-programming"]
  },
  {
    title: "How do you design a zero-downtime Blue/Green and Canary deployment pipeline with automated rollback based on error budget and latency telemetry?",
    track: "Fullstack",
    difficulty: "Senior",
    type: "TECHNICAL",
    idealAnswerFormat: "Candidates should explain deploying the new release (Green) alongside active production (Blue). In Canary deployments, service meshes (Istio) or ingress controllers route a small percentage (e.g. 5%) of production traffic to Canary pods. Telemetry agents monitor Prometheus metrics (HTTP 5xx error rate, p99 latency). If metrics breach Service Level Objectives (SLOs), automated rollbacks trigger immediately, killing canary pods without customer disruption; if healthy, traffic scales incrementally to 100%.",
    tags: ["devops", "docker", "system-design"]
  },
  {
    title: "How does Distributed Tracing with OpenTelemetry and Jaeger work across a fullstack request, from frontend user interaction through microservice hops?",
    track: "Fullstack",
    difficulty: "Senior",
    type: "TECHNICAL",
    idealAnswerFormat: "The candidate should explain the W3C Trace Context standard: when a user initiates an action, a unique Trace ID and Span ID are generated and injected into outgoing HTTP headers (traceparent: 00-traceId-spanId-01). As the request traverses backend API gateways, microservices, and message queues, each service propagates the Trace ID while generating new child Span IDs. Collectors stream these spans to Jaeger or Datadog, rendering an end-to-end flamegraph displaying exact latency bottlenecks across hops.",
    tags: ["system-design", "microservices", "performance"]
  },
  {
    title: "How do you architect database sharding, read replicas, and eventual consistency in a globally distributed fullstack application?",
    track: "Fullstack",
    difficulty: "Senior",
    type: "TECHNICAL",
    idealAnswerFormat: "A comprehensive answer explains horizontal partitioning (sharding) large tables across database nodes using hash-based or range-based shard keys to overcome single-instance storage and write throughput limits. Read replicas offload read-heavy traffic from the primary write node; however, replication lag introduces eventual consistency issues (read-your-own-writes inconsistency). Solutions include routing users to the primary database for a brief window immediately following writes or using sticky consistency tokens.",
    tags: ["sql-databases", "mongodb", "system-design"]
  },
  {
    title: "Describe the architecture and responsibilities of an API Gateway (Kong, Envoy, AWS API Gateway) in an enterprise fullstack ecosystem.",
    track: "Fullstack",
    difficulty: "Senior",
    type: "TECHNICAL",
    idealAnswerFormat: "Candidates should define the API Gateway as the single reverse-proxy entry point for client requests. It offloads cross-cutting concerns from downstream microservices: SSL/TLS termination, centralized JWT authentication and RBAC validation, distributed rate limiting and DDoS mitigation, request routing and URL rewriting, response caching, request/response payload transformation, and distributed telemetry collection, allowing backend developers to focus purely on domain logic.",
    tags: ["system-design", "microservices", "web-security"]
  },
  {
    title: "How do you protect fullstack applications against Distributed Denial of Service (DDoS) and bot attacks at the DNS, Edge CDN, and Application layers?",
    track: "Fullstack",
    difficulty: "Senior",
    type: "TECHNICAL",
    idealAnswerFormat: "A great answer presents defense-in-depth across the OSI model: At Layer 3/4 (Network/Transport), using Anycast DNS and cloud edge scrubbing centers (Cloudflare, AWS Shield) to absorb multi-gigabit SYN floods. At Layer 7 (Application), implementing Web Application Firewalls (WAF) to inspect malicious payloads, enforcing managed CAPTCHAs, bot fingerprinting (JA3 TLS fingerprinting), strict IP/token rate limits, and caching static assets and API responses aggressively on edge CDNs.",
    tags: ["web-security", "system-design", "devops"]
  },
  {
    title: "Explain the architectural pattern and trade-offs of CQRS (Command Query Responsibility Segregation) combined with Event Sourcing.",
    track: "Fullstack",
    difficulty: "Senior",
    type: "TECHNICAL",
    idealAnswerFormat: "The candidate should explain that CQRS separates write models (Commands that mutate business state) from read models (Queries optimized for fast UI presentation). In Event Sourcing, application state is not stored as mutable rows, but as an append-only sequence of immutable domain events. Read models are projected asynchronously by consuming the event stream. Benefits include perfect auditability, time-travel debugging, and highly scalable read models, but at the cost of eventual consistency, projection lag, and high architectural complexity.",
    tags: ["system-design", "microservices", "async-programming"]
  },
  {
    title: "How do you implement Zero-Trust Architecture, secret rotation, and mutual TLS (mTLS) across internal microservice communications?",
    track: "Fullstack",
    difficulty: "Senior",
    type: "TECHNICAL",
    idealAnswerFormat: "Candidates should explain the Zero-Trust principle: 'never trust, always verify', assuming perimeter networks are already compromised. Secrets are never hardcoded or stored in environment config files; they are retrieved at runtime from HashiCorp Vault or AWS Secrets Manager with automated dynamic rotation. All service-to-service communication requires mutual TLS (mTLS) orchestrated via service meshes (Istio/Linkerd), where both client and server cryptographically verify X.509 certificates to authenticate identity and encrypt traffic.",
    tags: ["web-security", "microservices", "devops"]
  },
  {
    title: "How do you design an elastic auto-scaling infrastructure on Kubernetes using Horizontal Pod Autoscalers (HPA), Vertical Pod Autoscalers (VPA), and Cluster Autoscalers?",
    track: "Fullstack",
    difficulty: "Senior",
    type: "TECHNICAL",
    idealAnswerFormat: "A senior response explains the triad: HPA scales pod replica count horizontally based on observed CPU/memory utilization or custom Prometheus metrics (e.g. SQS queue depth or HTTP requests per second). VPA adjusts CPU/memory resource requests and limits for individual containers to prevent over-provisioning or OOM crashes. Cluster Autoscaler adjusts underlying cloud VM node count when unscheduled pods exceed cluster capacity or when nodes are underutilized, balancing resilience with infrastructure costs.",
    tags: ["docker", "devops", "system-design"]
  },
  {
    title: "How do you architect a real-time collaborative editing application (similar to Google Docs or Figma) using Conflict-Free Replicated Data Types (CRDTs) versus Operational Transformation (OT)?",
    track: "Fullstack",
    difficulty: "Senior",
    type: "TECHNICAL",
    idealAnswerFormat: "The candidate should contrast the two distributed consensus models: Operational Transformation (OT) relies on a centralized server to sequence and transform concurrent user operations (insert/delete) against incoming revisions, requiring strict server coordination. In contrast, CRDTs (like Yjs or Automerge) are mathematically designed data structures that deterministically merge concurrent edits peer-to-peer without central coordination, making them ideal for decentralized, offline-first collaborative systems at the cost of higher memory metadata overhead.",
    tags: ["system-design", "async-programming", "javascript"]
  },
  {
    title: "Describe the governance, API contract versioning, and backwards compatibility strategy for public developer APIs (such as Stripe's date-based version headers).",
    track: "Fullstack",
    difficulty: "Senior",
    type: "TECHNICAL",
    idealAnswerFormat: "Candidates should analyze API evolution strategies: URL path versioning (/v1 vs /v2) creates fragmented codebases and forces hard migrations. Stripe-style date-based versioning pins each account to an API version date; internal backend services always execute the newest canonical schema, and a middleware transformation pipeline applies a series of backward-compatible request/response mutations depending on the client's version header. Deprecations should follow explicit timelines, Sunset HTTP headers, and active developer notifications.",
    tags: ["system-design", "rest-apis", "web-security"]
  },

  // ==========================================
  // HR / BEHAVIORAL - JUNIOR (14 questions)
  // ==========================================
  {
    title: "Tell me about a time you made a coding mistake or broke functionality in a project: how did you communicate it and what did you do to fix it?",
    track: "HR",
    difficulty: "Junior",
    type: "HR_BEHAVIORAL",
    idealAnswerFormat: "A strong behavioral response follows the STAR method (Situation, Task, Action, Result). The candidate should demonstrate radical accountability: owning the mistake without blaming others or hiding the failure. They should articulate clear, immediate communication to teammates or stakeholders, a systematic approach to debugging and rolling back or patching the issue, and proactive implementation of regression tests or linting rules to prevent recurrence.",
    tags: ["behavioral-leadership", "problem-solving", "communication"]
  },
  {
    title: "How do you handle receiving critical or challenging feedback on your pull request during a code review?",
    track: "HR",
    difficulty: "Junior",
    type: "HR_BEHAVIORAL",
    idealAnswerFormat: "Candidates should emphasize that code reviews evaluate the code, not their personal worth. They should describe listening actively, asking clarifying questions to understand the reviewer's underlying architectural reasoning, and viewing feedback as an accelerated learning opportunity. A strong candidate provides a concrete past example of implementing suggested improvements and expressing genuine appreciation to the reviewer.",
    tags: ["communication", "conflict-resolution", "behavioral-leadership"]
  },
  {
    title: "Describe a situation where you had to learn an unfamiliar programming language, framework, or tool under a tight deadline.",
    track: "HR",
    difficulty: "Junior",
    type: "HR_BEHAVIORAL",
    idealAnswerFormat: "The candidate should showcase a structured learning strategy rather than unstructured cramming. They should explain how they broke down the technology into fundamentals (reading official documentation, building proof-of-concept sandboxes, studying production examples), prioritized the subset of features needed for the immediate milestone, and successfully delivered the project on time while documenting insights for teammates.",
    tags: ["problem-solving", "behavioral-leadership"]
  },
  {
    title: "Tell me about a time you worked on a team project with a teammate whose communication style or technical opinion differed significantly from yours.",
    track: "HR",
    difficulty: "Junior",
    type: "HR_BEHAVIORAL",
    idealAnswerFormat: "A mature response demonstrates emotional intelligence and empathy. The candidate should describe adapting their communication approach (e.g. switching from long asynchronous messages to a short collaborative video call), seeking common ground anchored in shared project goals, and establishing explicit team agreements. They should highlight a successful project outcome and an improved working relationship.",
    tags: ["conflict-resolution", "communication", "behavioral-leadership"]
  },
  {
    title: "How do you balance doing independent troubleshooting with knowing when to ask for help from senior engineers when you are stuck?",
    track: "HR",
    difficulty: "Junior",
    type: "HR_BEHAVIORAL",
    idealAnswerFormat: "The candidate should describe a disciplined 'timebox' rule (e.g. attempting focused independent debugging, searching documentation, and inspecting logs for 45-60 minutes). When reaching the time limit without progress, they escalate to a senior engineer, presenting a clear summary: what the expected behavior is, what is actually happening, what hypotheses they already tested, and specific code pointers, respecting the senior engineer's focus time.",
    tags: ["problem-solving", "communication"]
  },
  {
    title: "Describe a project where you demonstrated strong attention to detail and thoroughness in code quality, documentation, or testing.",
    track: "HR",
    difficulty: "Junior",
    type: "HR_BEHAVIORAL",
    idealAnswerFormat: "Candidates should highlight specific actions that elevated project reliability beyond the bare minimum: writing comprehensive unit and edge-case tests, adding clear OpenAPI/Swagger documentation, establishing descriptive README setup guides, or handling obscure error states. They should quantify the positive impact (e.g. zero regressions post-launch, smooth onboarding for another peer).",
    tags: ["problem-solving", "behavioral-leadership", "testing"]
  },
  {
    title: "Tell me about a time you had to juggle multiple competing academic or professional deadlines simultaneously: how did you organize your priorities?",
    track: "HR",
    difficulty: "Junior",
    type: "HR_BEHAVIORAL",
    idealAnswerFormat: "The candidate should describe using a deliberate prioritization framework (such as Eisenhower Matrix or MoSCoW) to evaluate tasks based on business urgency and impact. They should detail communicating proactively with mentors or managers when workload threatened timelines, negotiating realistic scope adjustments early rather than failing silently, and delivering all high-priority commitments successfully.",
    tags: ["problem-solving", "behavioral-leadership", "communication"]
  },
  {
    title: "How do you approach documenting your code, commit messages, and project workflows so that future engineers can easily onboard?",
    track: "HR",
    difficulty: "Junior",
    type: "HR_BEHAVIORAL",
    idealAnswerFormat: "A strong response emphasizes that code is read far more often than it is written. The candidate should advocate self-documenting code with meaningful naming, concise architectural comments explaining 'why' rather than 'what', conventional commit messages (feat:, fix:, chore:), and maintaining living documentation in Markdown wikis or READMEs with reproducible local development steps.",
    tags: ["communication", "devops"]
  },
  {
    title: "Describe an instance where project requirements or specifications provided to you were ambiguous, and explain how you sought clarity.",
    track: "HR",
    difficulty: "Junior",
    type: "HR_BEHAVIORAL",
    idealAnswerFormat: "The candidate should explain that making assumptions on vague requirements leads to rework. They should describe reviewing the ambiguity, formulating specific multiple-choice questions or user stories, scheduling a brief alignment session with the product owner or tech lead, and documenting the agreed-upon criteria in ticket acceptance criteria before writing code.",
    tags: ["communication", "problem-solving"]
  },
  {
    title: "Tell me about a team project where a peer was missing deadlines or underperforming: how did you handle the situation constructively?",
    track: "HR",
    difficulty: "Junior",
    type: "HR_BEHAVIORAL",
    idealAnswerFormat: "A great answer avoids complaining or throwing the peer under the bus. The candidate should describe approaching the teammate privately with empathy to understand if they were blocked or facing challenges. They should detail offering collaborative pair-programming support or re-distributing workload where appropriate, while keeping project timelines transparent and delivering the overall team commitment.",
    tags: ["conflict-resolution", "behavioral-leadership", "communication"]
  },
  {
    title: "What motivates your continuous learning in software engineering, and what specific habits or resources do you use to stay current?",
    track: "HR",
    difficulty: "Junior",
    type: "HR_BEHAVIORAL",
    idealAnswerFormat: "The candidate should demonstrate genuine curiosity and passion for technology. They should cite specific learning habits: following engineering blogs (e.g. Netflix Tech Blog, Cloudflare Blog), reading RFCs and official release notes, contributing to open-source or building personal side projects, and sharing new learnings with peers or study groups.",
    tags: ["behavioral-leadership", "problem-solving"]
  },
  {
    title: "Tell me about a time you received recognition or praise for going above and beyond expectations on an engineering task.",
    track: "HR",
    difficulty: "Junior",
    type: "HR_BEHAVIORAL",
    idealAnswerFormat: "Candidates should describe a situation where they identified an unaddressed issue (e.g. optimizing a sluggish build pipeline, fixing confusing error messages for end users, or creating a shared test utility) outside their immediate assignment scope. They should describe executing the improvement without neglecting primary duties and explain the measurable benefit realized by the team.",
    tags: ["behavioral-leadership", "problem-solving"]
  },
  {
    title: "Describe an experience where a sudden change in project scope, tools, or priorities forced you to pivot your work quickly.",
    track: "HR",
    difficulty: "Junior",
    type: "HR_BEHAVIORAL",
    idealAnswerFormat: "A strong response illustrates adaptability and resilience. The candidate should describe accepting the business rationale for the pivot without frustration, salvaging reusable modular code or learnings from the prior work, and rapidly aligning with the new priorities to deliver results without missing project milestones.",
    tags: ["problem-solving", "behavioral-leadership"]
  },
  {
    title: "Why are you interested in joining our engineering team, and how do your technical and personal values align with our culture?",
    track: "HR",
    difficulty: "Junior",
    type: "HR_BEHAVIORAL",
    idealAnswerFormat: "The candidate should demonstrate clear research into the company's product, engineering mission, and cultural values. They should connect specific company practices (e.g. commitment to open source, collaborative mentorship culture, product impact) to their own career aspirations, articulating what unique energy and perspective they will contribute to the team.",
    tags: ["communication", "behavioral-leadership"]
  },

  // ==========================================
  // HR / BEHAVIORAL - MID (14 questions)
  // ==========================================
  {
    title: "Tell me about a time you had to advocate for code quality or technical debt remediation when product managers were pushing exclusively for new features.",
    track: "HR",
    difficulty: "Mid",
    type: "HR_BEHAVIORAL",
    idealAnswerFormat: "Candidates should frame technical debt in terms of business impact: velocity reduction, incident frequency, and customer churn. A great answer describes quantifying the risk, presenting data to product partners, and proposing a pragmatic compromise (e.g. allocating 20% of sprint capacity to tech debt or bundling refactoring into related feature deliverables) rather than creating an adversarial relationship.",
    tags: ["behavioral-leadership", "communication", "conflict-resolution"]
  },
  {
    title: "Describe a situation where you strongly disagreed with a senior engineer or architect's proposed technical approach: how did you present your counter-case?",
    track: "HR",
    difficulty: "Mid",
    type: "HR_BEHAVIORAL",
    idealAnswerFormat: "A mature response demonstrates respectful, evidence-based debate. The candidate should describe constructing a data-driven proposal (benchmarks, complexity analysis, maintenance overhead), presenting it in a private or collaborative RFC review, and focusing on user and business outcomes rather than ego. Crucially, they should mention embracing the final decision wholeheartedly (disagree and commit) regardless of outcome.",
    tags: ["conflict-resolution", "communication", "problem-solving"]
  },
  {
    title: "How do you navigate cross-functional collaboration when working with Product Managers, UX Designers, and QA engineers who have conflicting priorities?",
    track: "HR",
    difficulty: "Mid",
    type: "HR_BEHAVIORAL",
    idealAnswerFormat: "The candidate should describe acting as a bridge between technical feasibility, user experience, and business requirements. They should detail involving QA and UX early during refinement, identifying technical edge cases before designs are finalized, and facilitating trade-off discussions where scope, timeline, and design fidelity are balanced collaboratively.",
    tags: ["communication", "behavioral-leadership", "conflict-resolution"]
  },
  {
    title: "Tell me about a high-severity production incident you responded to: how did you maintain composure and execute systematic debugging under pressure?",
    track: "HR",
    difficulty: "Mid",
    type: "HR_BEHAVIORAL",
    idealAnswerFormat: "Candidates should recount an incident with calm focus: immediately stabilizing the situation (rollback, traffic rerouting, or feature flag toggle) before investigating root cause. They should detail effective incident communication (status page updates, clear roles in incident response), followed by a blameless post-mortem analyzing contributing factors and creating permanent preventive tickets.",
    tags: ["problem-solving", "communication", "behavioral-leadership"]
  },
  {
    title: "Describe a situation where you had to ship a Minimum Viable Product (MVP) under an aggressive deadline and had to make conscious architectural trade-offs.",
    track: "HR",
    difficulty: "Mid",
    type: "HR_BEHAVIORAL",
    idealAnswerFormat: "A strong answer shows pragmatism. The candidate should detail intentionally choosing simpler, well-understood patterns (e.g. monolithic endpoint or relational table over microservices/event-driven complexity) to meet deadline commitments. They must demonstrate that trade-offs were explicitly documented as future technical debt tickets with clear triggers for when refactoring would become necessary.",
    tags: ["system-design", "behavioral-leadership", "problem-solving"]
  },
  {
    title: "Tell me about an experience mentoring an intern or junior engineer: how did you structure their growth without micromanaging them?",
    track: "HR",
    difficulty: "Mid",
    type: "HR_BEHAVIORAL",
    idealAnswerFormat: "The candidate should describe setting up clear 30-60-90 day expectations, breaking down starter tasks of increasing complexity, and holding regular 1-on-1s. They should demonstrate coaching through Socratic questioning—guiding the mentee to uncover answers independently rather than dictating solutions—and celebrating their milestones to foster autonomy and confidence.",
    tags: ["behavioral-leadership", "communication"]
  },
  {
    title: "How do you ensure that team agile retrospectives result in concrete, measurable process improvements rather than recurring complaint sessions?",
    track: "HR",
    difficulty: "Mid",
    type: "HR_BEHAVIORAL",
    idealAnswerFormat: "Candidates should describe framing retrospectives around blameless continuous improvement. Effective strategies include grouping feedback into themes, dot-voting on the highest-impact friction points, formulating SMART action items with a single assigned owner, and reviewing previous retrospective action items at the start of every retro to ensure accountability.",
    tags: ["behavioral-leadership", "conflict-resolution", "communication"]
  },
  {
    title: "Describe an instance where a feature you built performed poorly in production or failed to meet user engagement expectations: what lessons did you take away?",
    track: "HR",
    difficulty: "Mid",
    type: "HR_BEHAVIORAL",
    idealAnswerFormat: "A great answer demonstrates intellectual honesty and data-driven reflection. The candidate should explain analyzing telemetry, user session recordings, or customer interviews to diagnose the gap (e.g. unintuitive UX, incorrect problem validation). They should articulate iterating on the feature based on findings and establishing closer validation feedback loops with product users on future releases.",
    tags: ["problem-solving", "communication", "behavioral-leadership"]
  },
  {
    title: "Tell me about a time you took ownership of an ambiguous, unassigned problem in the engineering organization and drove it to a successful resolution.",
    track: "HR",
    difficulty: "Mid",
    type: "HR_BEHAVIORAL",
    idealAnswerFormat: "The candidate should showcase bias for action. They should describe identifying an unowned problem (e.g. flaky CI test suites, obsolete deployment scripts, or recurring customer support tickets), gathering stakeholders to define requirements, scoping an incremental solution, and successfully executing it without dropping core feature commitments.",
    tags: ["behavioral-leadership", "problem-solving"]
  },
  {
    title: "How do you communicate complex technical constraints, risks, or project delays to non-technical business stakeholders effectively?",
    track: "HR",
    difficulty: "Mid",
    type: "HR_BEHAVIORAL",
    idealAnswerFormat: "Candidates should emphasize translating technical jargon into business concepts: user experience, financial cost, system reliability, and revenue risk. A strong response includes communicating delays proactively as soon as identified, offering concrete options (e.g. Option A: launch with core scope on time; Option B: delay 1 week for full scope), allowing stakeholders to make informed business decisions.",
    tags: ["communication", "behavioral-leadership"]
  },
  {
    title: "Describe a time when you had to say 'no' to a stakeholder or product manager's feature request to protect system stability or security.",
    track: "HR",
    difficulty: "Mid",
    type: "HR_BEHAVIORAL",
    idealAnswerFormat: "The candidate should explain that saying 'no' must be accompanied by business rationale and viable alternatives. They should detail explaining the risk (e.g. regulatory non-compliance, severe performance degradation) with concrete evidence, and collaborating on an alternative approach that satisfied the underlying customer need without compromising security or architectural integrity.",
    tags: ["communication", "conflict-resolution", "web-security"]
  },
  {
    title: "Tell me about a time you discovered a critical security vulnerability or data risk in existing code prior to release: how did you handle it?",
    track: "HR",
    difficulty: "Mid",
    type: "HR_BEHAVIORAL",
    idealAnswerFormat: "A strong answer demonstrates security consciousness and urgency. The candidate should describe discretely flagging the vulnerability to the security team and tech lead, halting the release pipeline, authoring a secure patch with automated test verification, and conducting a scan across the codebase to ensure the vulnerability pattern did not exist elsewhere.",
    tags: ["web-security", "problem-solving", "behavioral-leadership"]
  },
  {
    title: "How do you manage your workload and maintain sustainable pacing during high-velocity development sprints to prevent developer burnout?",
    track: "HR",
    difficulty: "Mid",
    type: "HR_BEHAVIORAL",
    idealAnswerFormat: "Candidates should discuss healthy boundary setting, realistic sprint estimation based on historical team velocity, and avoiding heroic 80-hour workweeks that generate low-quality code. They should mention communicating early when sprint scope exceeds realistic capacity, and practicing regular decompression habits to sustain long-term engineering excellence.",
    tags: ["behavioral-leadership", "communication"]
  },
  {
    title: "Describe a situation where two engineers on your team had opposing opinions on a design choice, and how you helped mediate a consensus.",
    track: "HR",
    difficulty: "Mid",
    type: "HR_BEHAVIORAL",
    idealAnswerFormat: "The candidate should describe acting as an objective facilitator. They should detail listing the pros, cons, and trade-offs of both options against clear evaluation criteria (maintainability, scalability, timeline), encouraging each engineer to articulate the merits of the opposing view, and proposing a lightweight prototype or spike to let empirical data decide the winner.",
    tags: ["conflict-resolution", "communication", "behavioral-leadership"]
  },

  // ==========================================
  // HR / BEHAVIORAL - SENIOR (14 questions)
  // ==========================================
  {
    title: "Tell me about a time you led a multi-quarter, multi-team technical migration without disrupting ongoing 24/7 business operations.",
    track: "HR",
    difficulty: "Senior",
    type: "HR_BEHAVIORAL",
    idealAnswerFormat: "A senior leader should outline comprehensive program management: building cross-functional alignment with an RFC, establishing phased milestones, and implementing zero-downtime migration patterns (expand/contract, dual-writing, feature flag gating). They should describe monitoring real-time telemetry, setting up automated rollback triggers, and successfully sunsetting legacy systems while keeping team morale high.",
    tags: ["behavioral-leadership", "system-design", "communication"]
  },
  {
    title: "How do you cultivate an engineering culture of psychological safety, blameless postmortems, and continuous organizational learning?",
    track: "HR",
    difficulty: "Senior",
    type: "HR_BEHAVIORAL",
    idealAnswerFormat: "The candidate should explain that blameless culture starts with leadership modeling vulnerability: openly discussing their own mistakes and framing failures as systemic process deficiencies rather than individual incompetence. They should describe institutionalizing blameless post-mortem templates, celebrating engineers who identify near-misses, and encouraging calculated experimentation.",
    tags: ["behavioral-leadership", "communication", "conflict-resolution"]
  },
  {
    title: "Describe a situation where an executive or VP proposed an unrealistic deadline or flawed architectural direction: how did you influence them?",
    track: "HR",
    difficulty: "Senior",
    type: "HR_BEHAVIORAL",
    idealAnswerFormat: "Candidates should demonstrate executive presence. Instead of emotional pushback, they should detail preparing an objective risk assessment highlighting trade-offs in customer downtime, future technical debt, and revenue risk. They should present viable alternatives (e.g. phased rollout or delivering 80% core value on time) that align with executive business goals while protecting architectural integrity.",
    tags: ["communication", "behavioral-leadership", "conflict-resolution"]
  },
  {
    title: "Tell me about a major architectural decision you made that you later realized was wrong: how did you navigate the pivot?",
    track: "HR",
    difficulty: "Senior",
    type: "HR_BEHAVIORAL",
    idealAnswerFormat: "A master-level answer demonstrates humility and decisiveness. The candidate should avoid sunk-cost fallacy: when metrics or developer friction proved the chosen architecture was suboptimal, they acknowledged the mistake openly to stakeholders, formulated a clear migration roadmap, and executed the pivot cleanly while documenting post-mortem learnings for the organization.",
    tags: ["behavioral-leadership", "system-design", "problem-solving"]
  },
  {
    title: "How do you evaluate technical talent during interviews to balance technical competence, problem-solving agility, and cultural addition?",
    track: "HR",
    difficulty: "Senior",
    type: "HR_BEHAVIORAL",
    idealAnswerFormat: "The candidate should describe designing structured, objective interview rubrics that minimize unconscious bias. They should assess how candidates think aloud, respond to hints, navigate trade-offs, and handle feedback on their designs. Cultural addition focuses on intellectual curiosity, collaborative empathy, and diverse perspectives rather than superficial homogeneity.",
    tags: ["behavioral-leadership", "communication"]
  },
  {
    title: "Describe a time you managed an underperforming senior engineer: how did you balance empathy with high expectations and accountability?",
    track: "HR",
    difficulty: "Senior",
    type: "HR_BEHAVIORAL",
    idealAnswerFormat: "Candidates should explain having a direct, compassionate 1-on-1 to understand underlying blockers (personal issues, unclear expectations, lack of motivation). They should describe establishing a clear, timebound performance improvement plan with concrete, measurable engineering deliverables, providing frequent constructive feedback, and either celebrating their turnaround or facilitating a professional transition.",
    tags: ["behavioral-leadership", "communication", "conflict-resolution"]
  },
  {
    title: "How do you design career development roadmaps and mentorship structures to elevate mid-level engineers into staff and lead roles?",
    track: "HR",
    difficulty: "Senior",
    type: "HR_BEHAVIORAL",
    idealAnswerFormat: "A strong response outlines shifting focus from pure coding output to organizational leverage: technical design leadership, cross-team communication, mentorship, and business acumen. The candidate should describe delegating high-visibility architectural initiatives, sponsoring mentees in executive meetings, and coaching them through complex stakeholder negotiations.",
    tags: ["behavioral-leadership", "communication"]
  },
  {
    title: "How do you resolve architectural gridlock when multiple autonomous engineering pods disagree on shared platform standards?",
    track: "HR",
    difficulty: "Senior",
    type: "HR_BEHAVIORAL",
    idealAnswerFormat: "The candidate should describe establishing an Architecture Review Board (ARB) or RFC process with defined evaluation criteria. They should separate emotional attachments from technical requirements, conduct time-boxed proof-of-concept bake-offs, and if consensus remains elusive, exercise decisive technical leadership to make the call while ensuring all parties feel heard and committed.",
    tags: ["conflict-resolution", "behavioral-leadership", "system-design"]
  },
  {
    title: "Tell me about a high-stakes cross-departmental crisis (involving engineering, legal, security, and PR) you helped navigate to resolution.",
    track: "HR",
    difficulty: "Senior",
    type: "HR_BEHAVIORAL",
    idealAnswerFormat: "Candidates should describe establishing clear command hierarchy and disciplined communication channels during the crisis. They should articulate translating technical forensics into clear statements for legal counsel and PR, prioritizing customer data protection and compliance, and leading remediation efforts to restore public and partner trust.",
    tags: ["behavioral-leadership", "communication", "web-security"]
  },
  {
    title: "Tell me about an internal developer productivity or developer experience (DevEx) initiative you championed that measurably improved engineering velocity.",
    track: "HR",
    difficulty: "Senior",
    type: "HR_BEHAVIORAL",
    idealAnswerFormat: "A great answer demonstrates focus on engineering leverage. The candidate should describe identifying systemic friction (e.g. 45-minute CI test runs, painful local environment setup), championing investment in automated tooling or preview environments, and measuring the concrete ROI (e.g. cutting CI run times by 70%, saving 1,000 engineering hours annually).",
    tags: ["behavioral-leadership", "devops", "performance"]
  },
  {
    title: "How do you balance technological innovation (adopting modern frameworks and tools) with operational maturity ('Choose Boring Technology')?",
    track: "HR",
    difficulty: "Senior",
    type: "HR_BEHAVIORAL",
    idealAnswerFormat: "The candidate should explain the concept of innovation tokens: organizations have a limited budget for novel, unproven technologies. Mature technologies (PostgreSQL, standard Linux, proven runtimes) provide predictable failure modes, deep ecosystem tooling, and wide talent pools. Novel technologies should only be adopted when they provide a massive, 10x competitive business advantage.",
    tags: ["system-design", "behavioral-leadership", "problem-solving"]
  },
  {
    title: "Describe your strategy for prioritizing and managing technical debt across a legacy codebase while maintaining sustained feature delivery velocity.",
    track: "HR",
    difficulty: "Senior",
    type: "HR_BEHAVIORAL",
    idealAnswerFormat: "Candidates should outline categorizing technical debt into prudently incurred vs reckless debt, and assessing interest rate (how much daily velocity it drains). They should advocate for continuous maintenance (the Boy Scout rule: leave code cleaner than you found it), alongside dedicated quarterly tech sprints, presenting tech debt payoff in terms of reduced outage costs and faster feature time-to-market.",
    tags: ["behavioral-leadership", "system-design", "communication"]
  },
  {
    title: "How do you foster alignment and strong engineering team cohesion across globally distributed, asynchronous remote teams in multiple time zones?",
    track: "HR",
    difficulty: "Senior",
    type: "HR_BEHAVIORAL",
    idealAnswerFormat: "The candidate should emphasize an asynchronous-first culture: comprehensive RFCs, detailed meeting summaries, recorded walkthroughs, and clear ticket definitions that empower engineers to make progress without real-time synchronous meetings. They should also schedule deliberate, periodic social syncs and team offsites to build interpersonal empathy and trust.",
    tags: ["communication", "behavioral-leadership", "conflict-resolution"]
  },
  {
    title: "How do you define and measure engineering excellence and business impact beyond raw metrics like lines of code or ticket story points?",
    track: "HR",
    difficulty: "Senior",
    type: "HR_BEHAVIORAL",
    idealAnswerFormat: "A senior leader should reject vanity metrics like lines of code or story points, which incentivize perverse behavior. Instead, they should advocate DORA metrics (Deployment Frequency, Lead Time for Changes, Change Failure Rate, Time to Restore Service) to measure delivery velocity and stability, combined with user outcomes, customer satisfaction, system uptime, and team retention.",
    tags: ["behavioral-leadership", "devops", "system-design"]
  }
];

// Validation checks
console.log(`Starting validation for ${newQuestions.length} new questions...`);

const existingTitles = new Set(existingQuestions.map(q => q.title.trim().toLowerCase()));

let errors = 0;
newQuestions.forEach((q, idx) => {
  if (!q.title || !q.track || !q.difficulty || !q.type || !q.idealAnswerFormat || !q.tags) {
    console.error(`Error in new question #${idx}: missing required fields`, q);
    errors++;
  }
  if (!['Junior', 'Mid', 'Senior'].includes(q.difficulty)) {
    console.error(`Invalid difficulty in new question #${idx}: ${q.difficulty}`);
    errors++;
  }
  if (!['TECHNICAL', 'HR_BEHAVIORAL'].includes(q.type)) {
    console.error(`Invalid type in new question #${idx}: ${q.type}`);
    errors++;
  }
  if (!['Frontend', 'Backend', 'Fullstack', 'HR'].includes(q.track)) {
    console.error(`Invalid track in new question #${idx}: ${q.track}`);
    errors++;
  }
  q.tags.forEach(tag => {
    if (!validTagSet.has(tag)) {
      console.error(`Invalid tag slug "${tag}" in new question #${idx}: ${q.title}`);
      errors++;
    }
  });

  const normalizedTitle = q.title.trim().toLowerCase();
  if (existingTitles.has(normalizedTitle)) {
    console.error(`Duplicate title with existing questions in new question #${idx}: ${q.title}`);
    errors++;
  }
});

if (errors > 0) {
  console.error(`Validation failed with ${errors} errors!`);
  process.exit(1);
}

console.log('All new questions passed validation successfully! ✅');

// Merge
const combinedQuestions = [...existingQuestions, ...newQuestions];
console.log(`Total questions after merge: ${combinedQuestions.length}`);

// Breakdown calculation
const matrix = {};
const tracks = ['Backend', 'Frontend', 'Fullstack', 'HR'];
const diffs = ['Junior', 'Mid', 'Senior'];

tracks.forEach(t => {
  matrix[t] = { Junior: 0, Mid: 0, Senior: 0, Total: 0 };
});

combinedQuestions.forEach(q => {
  if (matrix[q.track] && matrix[q.track][q.difficulty] !== undefined) {
    matrix[q.track][q.difficulty]++;
    matrix[q.track].Total++;
  }
});

console.log('\n--- NEW QUESTION DISTRIBUTION MATRIX ---');
console.table(matrix);

// Write to questions.json
fs.writeFileSync(questionsFilePath, JSON.stringify(combinedQuestions, null, 2), 'utf8');
console.log(`\nSuccessfully wrote ${combinedQuestions.length} questions to ${questionsFilePath}! 🎉`);

import dotenv from 'dotenv';
dotenv.config();

const BASE_URL = 'http://localhost:5000/api';

async function runFullSystemTest() {
  console.log('====================================================');
  console.log('      MOCKMATE END-TO-END SYSTEM INTEGRATION TEST   ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // 1. Health Check
    console.log('[1/6] Testing System Health Check...');
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200 && healthData.status === 'ok', `GET /api/health returned 200 OK (uptime: ${healthData.uptime.toFixed(1)}s)`);

    // 2. Authentication Flow
    console.log('\n[2/6] Testing Authentication & Perimeter...');
    const testEmail = `candidate_test_${Date.now()}@mockmate.test`;
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'E2E Candidate', email: testEmail, password: 'Password123!' })
    });
    const regData = await regRes.json();
    assert(regRes.status === 201 && regData.accessToken, 'Candidate Registration POST /api/auth/register issued Access Token');
    const candidateToken = regData.accessToken;

    const cookieHeader = regRes.headers.get('set-cookie');
    assert(cookieHeader && cookieHeader.includes('refreshToken') && cookieHeader.includes('HttpOnly'), 'Refresh Token issued in secure HttpOnly cookie');

    // Admin Auth
    const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@mockmate.com', password: 'admin123' })
    });
    const adminData = await adminLoginRes.json();
    assert(adminLoginRes.status === 200 && adminData.user.role === 'admin', 'Admin Login POST /api/auth/login verified with role: admin');
    const adminToken = adminData.accessToken;

    // RBAC Security Check: Candidate blocked from admin endpoint
    const rbacRes = await fetch(`${BASE_URL}/questions`, {
      headers: { 'Authorization': `Bearer ${candidateToken}` }
    });
    assert(rbacRes.status === 403, 'Candidate blocked from admin /api/questions with 403 Forbidden');

    // 3. Question & Tag CMS
    console.log('\n[3/6] Testing CMS Content Operations...');
    const tagsRes = await fetch(`${BASE_URL}/tags`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const tagsData = await tagsRes.json();
    assert(tagsRes.status === 200 && tagsData.length >= 26, `GET /api/tags returned ${tagsData.length} controlled tags`);

    const questionsRes = await fetch(`${BASE_URL}/questions?track=Backend&difficulty=Mid`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const questionsData = await questionsRes.json();
    assert(questionsRes.status === 200 && questionsData.length === 20, `GET /api/questions?track=Backend&difficulty=Mid returned exactly 20 questions`);

    // Test Question Get by ID & Update
    const sampleQ = questionsData[0];
    const singleQRes = await fetch(`${BASE_URL}/questions/${sampleQ._id}`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const singleQ = await singleQRes.json();
    assert(singleQRes.status === 200 && singleQ._id === sampleQ._id, `GET /api/questions/:id successfully retrieved question`);

    const originalTitle = singleQ.title;
    const updateRes = await fetch(`${BASE_URL}/questions/${sampleQ._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        title: originalTitle + ' [VERIFIED]',
        track: singleQ.track,
        difficulty: singleQ.difficulty,
        type: singleQ.type,
        idealAnswerFormat: singleQ.idealAnswerFormat
      })
    });
    const updatedQ = await updateRes.json();
    assert(updateRes.status === 200 && updatedQ.title.includes('[VERIFIED]'), `PUT /api/questions/:id updated question title`);

    // Revert update
    await fetch(`${BASE_URL}/questions/${sampleQ._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        title: originalTitle,
        track: singleQ.track,
        difficulty: singleQ.difficulty,
        type: singleQ.type,
        idealAnswerFormat: singleQ.idealAnswerFormat
      })
    });

    // 4. Interview Lifecycle Across All Tracks
    console.log('\n[4/6] Testing Interview Session Engine Across Tracks...');
    const tracksToTest = [
      { track: 'Frontend', difficulty: 'Junior' },
      { track: 'Backend', difficulty: 'Senior' },
      { track: 'Fullstack', difficulty: 'Mid' },
      { track: 'HR / Behavioral', difficulty: 'Mid' },
      { track: 'DevOps', difficulty: 'Mid' },
      { track: 'System Design', difficulty: 'Senior' }
    ];

    for (const testCase of tracksToTest) {
      const sessionRes = await fetch(`${BASE_URL}/interviews/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${candidateToken}`
        },
        body: JSON.stringify(testCase)
      });
      const sessionData = await sessionRes.json();
      assert(
        sessionRes.status === 201 && sessionData.questions.length === 5,
        `Started interview for [${testCase.track} | ${testCase.difficulty}] with 5 randomized questions`
      );
    }

    // 5. Answer Submission & Advancing Question
    console.log('\n[5/6] Testing Answer Submission with Visual Telemetry...');
    const activeSessionRes = await fetch(`${BASE_URL}/interviews/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${candidateToken}`
      },
      body: JSON.stringify({ track: 'Frontend', difficulty: 'Mid' })
    });
    const activeSession = await activeSessionRes.json();
    const sessionId = activeSession._id;

    // Submit answer with Edge AI visualScore = 88
    const answerRes = await fetch(`${BASE_URL}/interviews/${sessionId}/answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${candidateToken}`
      },
      body: JSON.stringify({
        userTranscript: 'React uses heuristic O(n) diffing algorithms and keys to reconcile the virtual DOM tree with minimal mutations to real DOM elements.',
        questionIndex: 0,
        visualScore: 88
      })
    });
    const answerData = await answerRes.json();
    assert(answerRes.status === 200 || answerRes.status === 202, `POST /api/interviews/:id/answer submitted transcript & visualScore: 88 (status ${answerRes.status} Accepted)`);

    // Advance Question
    const nextQRes = await fetch(`${BASE_URL}/interviews/${sessionId}/next-question`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${candidateToken}`
      }
    });
    const nextQData = await nextQRes.json();
    assert(nextQRes.status === 200 && nextQData.currentQuestionIndex === 1, `POST /api/interviews/:id/next-question advanced to question index 1`);

    // 6. Candidate Analytics & History
    console.log('\n[6/6] Testing Candidate Analytics & Performance Telemetry...');
    const statsRes = await fetch(`${BASE_URL}/users/me/stats`, {
      headers: { 'Authorization': `Bearer ${candidateToken}` }
    });
    const statsData = await statsRes.json();
    assert(statsRes.status === 200 && Array.isArray(statsData), `GET /api/users/me/stats returned radar analytics array`);

    const historyRes = await fetch(`${BASE_URL}/interviews/history`, {
      headers: { 'Authorization': `Bearer ${candidateToken}` }
    });
    const historyData = await historyRes.json();
    assert(historyRes.status === 200 && Array.isArray(historyData), `GET /api/interviews/history returned interview timeline records`);

    console.log('\n====================================================');
    console.log(`TEST SUMMARY: ${passed} PASSED | ${failed} FAILED`);
    console.log('====================================================');

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('\n❌ Unhandled Test Failure:', err);
    process.exit(1);
  }
}

runFullSystemTest();

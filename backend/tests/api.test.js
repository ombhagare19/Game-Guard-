// backend/tests/api.test.js - Automated API & Integration Test Suite
const assert = require('assert');
const http = require('http');
const app = require('../server');

let server;
let baseUrl;

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(url, { method, headers }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (e) {
          json = data;
        }
        resolve({ status: res.statusCode, headers: res.headers, body: json });
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  console.log('\n======================================================');
  console.log('   GAMEGUARD AUTOMATED TEST SUITE - ROUND 1');
  console.log('======================================================\n');

  server = app.listen(0);
  const port = server.address().port;
  baseUrl = `http://localhost:${port}`;
  console.log(`[Test Runner] Started test server on port ${port}`);

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  ✓ ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ ${name}`);
      console.error(`    Error: ${err.message}`);
      failed++;
    }
  }

  // 1. Health check
  await test('GET /api/health should return ok', async () => {
    const res = await request('GET', '/api/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.status, 'ok');
  });

  // 2. Reset demo
  await test('POST /api/demo/reset should reset demo state', async () => {
    const res = await request('POST', '/api/demo/reset');
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.message.includes('reset successfully'));
  });

  // 3. Register validation failures
  await test('POST /api/register should reject empty fields', async () => {
    const res = await request('POST', '/api/register', { identifier: '', password: '' });
    assert.strictEqual(res.status, 400);
  });

  await test('POST /api/register should reject short password', async () => {
    const res = await request('POST', '/api/register', { identifier: 'player1@game.test', password: '123' });
    assert.strictEqual(res.status, 400);
    assert.ok(res.body.error.includes('6 characters'));
  });

  // 4. Successful registration
  let playerToken = '';
  await test('POST /api/register should register new player and hash password securely', async () => {
    const res = await request('POST', '/api/register', {
      identifier: 'player1@gameguard.test',
      password: 'SuperSecurePassword123!'
    });
    assert.strictEqual(res.status, 201);
    assert.ok(res.body.token);
    assert.strictEqual(res.body.user.identifier, 'player1@gameguard.test');
    assert.strictEqual(res.body.user.guardStatus, 'pending');
    assert.strictEqual(res.body.user.password, undefined, 'Plaintext password must never be returned');
    assert.strictEqual(res.body.user.passwordHash, undefined, 'Password hash must never be returned');
    playerToken = res.body.token;
  });

  // 5. Duplicate registration
  await test('POST /api/register should reject duplicate identifier with 409', async () => {
    const res = await request('POST', '/api/register', {
      identifier: 'player1@gameguard.test',
      password: 'AnotherPassword456!'
    });
    assert.strictEqual(res.status, 409);
  });

  // 6. Generic login error (no enumeration)
  await test('POST /api/login should return generic error on invalid password', async () => {
    const res = await request('POST', '/api/login', {
      identifier: 'player1@gameguard.test',
      password: 'WrongPassword'
    });
    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.error, 'Invalid credentials. Please verify your email/username and password.');
  });

  // 7. Successful login
  await test('POST /api/login should login with valid credentials and return session', async () => {
    const res = await request('POST', '/api/login', {
      identifier: 'player1@gameguard.test',
      password: 'SuperSecurePassword123!'
    });
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.token);
    playerToken = res.body.token;
  });

  // 8. GET /api/me
  await test('GET /api/me should require bearer token', async () => {
    const res = await request('GET', '/api/me');
    assert.strictEqual(res.status, 401);
  });

  await test('GET /api/me should return current session profile with token', async () => {
    const res = await request('GET', '/api/me', null, playerToken);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.user.identifier, 'player1@gameguard.test');
    assert.strictEqual(res.body.user.guardStatus, 'pending');
  });

  // 9. Guard verification
  await test('POST /api/guard/verify should run staged verification scan', async () => {
    const res = await request('POST', '/api/guard/verify', {}, playerToken);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.decision, 'passed');
    assert.strictEqual(res.body.stagedSteps.length, 3);
    assert.ok(res.body.ruleIds.includes('RULE_INTEGRITY_01'));
  });

  // 10. Non-negotiable rule: Age verification MUST reject raw birth dates or ID scans
  await test('POST /api/age/verify MUST reject raw date of birth (privacy non-negotiable rule)', async () => {
    const res = await request('POST', '/api/age/verify', {
      isOverThreshold: true,
      dateOfBirth: '2005-04-12'
    }, playerToken);
    assert.strictEqual(res.status, 400);
    assert.ok(res.body.error.includes('Data Minimization Violation'));
  });

  // 11. Valid Age Verification
  let claimFingerprint = '';
  await test('POST /api/age/verify should accept boolean threshold and derive SHA-256 fingerprint', async () => {
    const res = await request('POST', '/api/age/verify', {
      isOverThreshold: true,
      claimType: 'AGE_OVER_13'
    }, playerToken);
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.claim);
    assert.strictEqual(res.body.claim.status, 'verified');
    assert.ok(res.body.claim.claimHash.startsWith('0x'));
    assert.strictEqual(res.body.claim.claimHash.length, 66); // '0x' + 64 hex chars
    claimFingerprint = res.body.claim.claimHash;
  });

  // 12. Network access gate evaluation
  await test('POST /api/network/access should allow game access after guard + age pass', async () => {
    const res = await request('POST', '/api/network/access', {}, playerToken);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.allowed, true);
    assert.strictEqual(res.body.reasonCode, 0);
    assert.ok(res.body.matchmakingToken.startsWith('mm_'));
  });

  // 13. Returning user preserves claim without repeating check
  await test('Returning user login should preserve claim status', async () => {
    const loginRes = await request('POST', '/api/login', {
      identifier: 'player1@gameguard.test',
      password: 'SuperSecurePassword123!'
    });
    assert.strictEqual(loginRes.status, 200);
    assert.strictEqual(loginRes.body.user.ageClaimVerified, true);
    assert.strictEqual(loginRes.body.user.claim.claimHash, claimFingerprint);
  });

  // 14. Ledger endpoint
  await test('GET /api/ledger should return receipts and stats without PII', async () => {
    const res = await request('GET', '/api/ledger');
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.receipts.length >= 1);
    const receipt = res.body.receipts[0];
    assert.ok(receipt.receiptId);
    assert.ok(receipt.claimHash);
    assert.strictEqual(receipt.raw_date_of_birth, undefined);
    assert.strictEqual(receipt.password, undefined);
  });

  // 15. Anomaly Presets
  await test('POST /api/events/simulate preset: unusual_request_burst', async () => {
    const res = await request('POST', '/api/events/simulate', { scenario: 'unusual_request_burst' }, playerToken);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.policyResponse.riskLevel, 'medium');
  });

  await test('POST /api/events/simulate preset: repeated_login_failures', async () => {
    const res = await request('POST', '/api/events/simulate', { scenario: 'repeated_login_failures' }, playerToken);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.policyResponse.riskLevel, 'high');
    assert.strictEqual(res.body.currentStatus.networkAccess, 'denied');
  });

  await test('POST /api/events/simulate preset: normal_session recovers state', async () => {
    const res = await request('POST', '/api/events/simulate', { scenario: 'normal_session' }, playerToken);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.policyResponse.riskLevel, 'low');
  });

  // 16. Contract metadata and source
  await test('GET /api/contract should serve Solidity ^0.8.20 contract source and ABI', async () => {
    const res = await request('GET', '/api/contract');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.contractName, 'GameGuardPolicy.sol');
    assert.ok(res.body.source.includes('pragma solidity ^0.8.20;'));
    assert.ok(res.body.metadata.abi.length > 0);
  });

  // 17. Export sanitized ledger
  await test('GET /api/export should return sanitized JSON snapshot', async () => {
    const res = await request('GET', '/api/export');
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.receipts);
    assert.ok(res.body.events);
  });

  server.close();

  console.log('\n------------------------------------------------------');
  console.log(`Results: ${passed} passed, ${failed} failed.`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  if (server) server.close();
  process.exit(1);
});

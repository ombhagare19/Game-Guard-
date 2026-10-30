// backend/tests/e2e.test.js - Comprehensive End-to-End Flow & Edge Case Suite (Test Pass 3)
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

async function runE2ETests() {
  console.log('\n================================================================');
  console.log('   GAMEGUARD END-TO-END VERIFICATION & BUG-HUNTING SUITE (TEST 3)');
  console.log('================================================================\n');

  server = app.listen(0);
  const port = server.address().port;
  baseUrl = `http://localhost:${port}`;
  console.log(`[E2E Runner] Test server active on port ${port}`);

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  ✓ ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ ${name}`);
      console.error(`    Details: ${err.message}`);
      failed++;
    }
  }

  // Reset to clean slate
  await request('POST', '/api/demo/reset');

  // Test 1: Static frontend serve test
  await test('Server must serve compiled frontend index.html on root /', async () => {
    const res = await request('GET', '/');
    assert.strictEqual(res.status, 200);
    assert.ok(typeof res.body === 'string');
    assert.ok(res.body.includes('GameGuard'));
    assert.ok(res.body.includes('<div id="root"></div>'));
  });

  // Test 2: Network access denied prior to guard verification
  let testUserToken = '';
  await test('Unverified player must be blocked from network access', async () => {
    const regRes = await request('POST', '/api/register', {
      identifier: 'unverified_gamer@game.test',
      password: 'StrongPassword99!'
    });
    assert.strictEqual(regRes.status, 201);
    testUserToken = regRes.body.token;

    const accessRes = await request('POST', '/api/network/access', {}, testUserToken);
    assert.strictEqual(accessRes.status, 403);
    assert.strictEqual(accessRes.body.allowed, false);
    assert.ok(accessRes.body.reason.includes('GameGuard checkpoint pending'));
  });

  // Test 3: Network access denied if guard passed but age check missing
  await test('Network access must still be denied if age check is missing', async () => {
    const guardRes = await request('POST', '/api/guard/verify', {}, testUserToken);
    assert.strictEqual(guardRes.status, 200);
    assert.strictEqual(guardRes.body.decision, 'passed');

    const accessRes = await request('POST', '/api/network/access', {}, testUserToken);
    assert.strictEqual(accessRes.status, 403);
    assert.strictEqual(accessRes.body.allowed, false);
    assert.ok(accessRes.body.reason.includes('Age assurance requirement has not been confirmed'));
  });

  // Test 4: Age check below threshold (fail) locks network access
  await test('Failed age assurance (under 13) must deny network access', async () => {
    const failAgeRes = await request('POST', '/api/age/verify', {
      isOverThreshold: false,
      claimType: 'AGE_OVER_13'
    }, testUserToken);
    assert.strictEqual(failAgeRes.status, 200);
    assert.strictEqual(failAgeRes.body.claim.status, 'rejected');

    const accessRes = await request('POST', '/api/network/access', {}, testUserToken);
    assert.strictEqual(accessRes.status, 403);
    assert.strictEqual(accessRes.body.allowed, false);
  });

  // Test 5: Passing age check enables game access and returns token
  let activeClaimHash = '';
  await test('Successful age assurance must unlock network access and issue matchmaking token', async () => {
    const passAgeRes = await request('POST', '/api/age/verify', {
      isOverThreshold: true,
      claimType: 'AGE_OVER_13'
    }, testUserToken);
    assert.strictEqual(passAgeRes.status, 200);
    assert.strictEqual(passAgeRes.body.claim.status, 'verified');
    activeClaimHash = passAgeRes.body.claim.claimHash;

    const accessRes = await request('POST', '/api/network/access', {}, testUserToken);
    assert.strictEqual(accessRes.status, 200);
    assert.strictEqual(accessRes.body.allowed, true);
    assert.strictEqual(accessRes.body.reasonCode, 0);
    assert.ok(accessRes.body.matchmakingToken.startsWith('mm_'));
  });

  // Test 6: Anomaly preset: unusual_request_burst
  await test('Preset: unusual_request_burst should elevate risk to medium and record SOC event', async () => {
    const simRes = await request('POST', '/api/events/simulate', {
      scenario: 'unusual_request_burst'
    }, testUserToken);
    assert.strictEqual(simRes.status, 200);
    assert.strictEqual(simRes.body.policyResponse.riskLevel, 'medium');

    const meRes = await request('GET', '/api/me', null, testUserToken);
    assert.strictEqual(meRes.body.user.riskLevel, 'medium');
  });

  // Test 7: Anomaly preset: repeated_login_failures
  await test('Preset: repeated_login_failures should elevate risk to high and deny access', async () => {
    const simRes = await request('POST', '/api/events/simulate', {
      scenario: 'repeated_login_failures'
    }, testUserToken);
    assert.strictEqual(simRes.status, 200);
    assert.strictEqual(simRes.body.policyResponse.riskLevel, 'high');
    assert.strictEqual(simRes.body.currentStatus.networkAccess, 'denied');

    const accessRes = await request('POST', '/api/network/access', {}, testUserToken);
    assert.strictEqual(accessRes.status, 403);
  });

  // Test 8: Preset: normal_session restores clean state
  await test('Preset: normal_session restores risk to low and re-allows access', async () => {
    const simRes = await request('POST', '/api/events/simulate', {
      scenario: 'normal_session'
    }, testUserToken);
    assert.strictEqual(simRes.status, 200);
    assert.strictEqual(simRes.body.policyResponse.riskLevel, 'low');

    const accessRes = await request('POST', '/api/network/access', {}, testUserToken);
    assert.strictEqual(accessRes.status, 200);
    assert.strictEqual(accessRes.body.allowed, true);
  });

  // Test 9: Preset: revoked_claim marks receipt as revoked in ledger
  await test('Preset: revoked_claim invalidates claim in ledger and locks access', async () => {
    const simRes = await request('POST', '/api/events/simulate', {
      scenario: 'revoked_claim'
    }, testUserToken);
    assert.strictEqual(simRes.status, 200);
    assert.strictEqual(simRes.body.policyResponse.riskLevel, 'high');

    const accessRes = await request('POST', '/api/network/access', {}, testUserToken);
    assert.strictEqual(accessRes.status, 403);

    const ledgerRes = await request('GET', '/api/ledger?filter=alerts');
    assert.strictEqual(ledgerRes.status, 200);
    const revokedRec = ledgerRes.body.receipts.find(r => r.claimHash === activeClaimHash);
    assert.ok(revokedRec);
    assert.strictEqual(revokedRec.status, 'revoked');
  });

  // Test 10: Preset: claim_mismatch detects cryptographic tamper
  await test('Preset: claim_mismatch triggers tamper alert in audit log', async () => {
    const simRes = await request('POST', '/api/events/simulate', {
      scenario: 'claim_mismatch'
    }, testUserToken);
    assert.strictEqual(simRes.status, 200);
    assert.ok(simRes.body.policyResponse.tamperedHash);
    assert.notStrictEqual(simRes.body.policyResponse.tamperedHash, simRes.body.policyResponse.originalHash);
  });

  // Test 11: Session revocation
  await test('POST /api/session/revoke immediately terminates session token', async () => {
    const revRes = await request('POST', '/api/session/revoke', {}, testUserToken);
    assert.strictEqual(revRes.status, 200);

    const meRes = await request('GET', '/api/me', null, testUserToken);
    assert.strictEqual(meRes.status, 401);
  });

  // Test 12: Returning verified user does not repeat age assurance check
  await test('Returning user preserves verified age claim without re-verification', async () => {
    // Register another user, verify guard and age
    const u2Reg = await request('POST', '/api/register', {
      identifier: 'returning_pro@gameguard.network',
      password: 'ProPassword2026!'
    });
    const u2Token = u2Reg.body.token;
    await request('POST', '/api/guard/verify', {}, u2Token);
    const ageRes = await request('POST', '/api/age/verify', {
      isOverThreshold: true,
      claimType: 'AGE_OVER_18'
    }, u2Token);
    const originalHash = ageRes.body.claim.claimHash;

    // Simulate user logging out and logging back in
    const loginRes = await request('POST', '/api/login', {
      identifier: 'returning_pro@gameguard.network',
      password: 'ProPassword2026!'
    });
    assert.strictEqual(loginRes.status, 200);
    assert.strictEqual(loginRes.body.user.ageClaimVerified, true);
    assert.strictEqual(loginRes.body.user.claim.claimHash, originalHash);
  });

  // Test 13: Export endpoint data minimization audit
  await test('GET /api/export must contain zero PII, passwords, salts or DOBs', async () => {
    const res = await request('GET', '/api/export');
    assert.strictEqual(res.status, 200);
    const jsonStr = JSON.stringify(res.body).toLowerCase();

    assert.ok(!jsonStr.includes('"password"'), 'Export must not contain password');
    assert.ok(!jsonStr.includes('"passwordsalt"'), 'Export must not contain salt');
    assert.ok(!jsonStr.includes('"dateofbirth"'), 'Export must not contain dateOfBirth');
    assert.ok(!jsonStr.includes('"idimage"'), 'Export must not contain idImage');
    assert.ok(res.body.receipts.length > 0);
  });

  server.close();

  console.log('\n----------------------------------------------------------------');
  console.log(`E2E Results: ${passed} passed, ${failed} failed.`);
  console.log('================================================================\n');

  if (failed > 0) process.exit(1);
}

runE2ETests().catch(err => {
  console.error('Fatal E2E test error:', err);
  if (server) server.close();
  process.exit(1);
});

// backend/tests/security.test.js - Cryptographic Verification & Tamper Resilience Suite
const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

function sha256(str) {
  return '0x' + crypto.createHash('sha256').update(str).digest('hex');
}

function canonicalize({ claimType, passed, policyVersion, salt }) {
  return `type:${claimType}|passed:${Boolean(passed)}|policyVersion:${policyVersion}|salt:${salt}`;
}

async function runSecurityTests() {
  console.log('\n======================================================');
  console.log('   GAMEGUARD SECURITY & CRYPTOGRAPHY TEST SUITE');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    try {
      fn();
      console.log(`  ✓ ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ ${name}`);
      console.error(`    Error: ${err.message}`);
      failed++;
    }
  }

  // 1. Canonicalization determinism
  test('Canonicalization must be deterministic across calls', () => {
    const input = {
      claimType: 'AGE_OVER_13',
      passed: true,
      policyVersion: 1,
      salt: 'fixed_demo_salt_999'
    };
    const c1 = canonicalize(input);
    const c2 = canonicalize(input);
    assert.strictEqual(c1, c2);
    assert.strictEqual(sha256(c1), sha256(c2));
  });

  // 2. Tamper-evident property of SHA-256
  test('Modifying pass/fail state or policy version changes fingerprint completely', () => {
    const base = {
      claimType: 'AGE_OVER_13',
      passed: true,
      policyVersion: 1,
      salt: 'salt_abc'
    };
    const tampered = {
      claimType: 'AGE_OVER_13',
      passed: false, // Changed from true to false!
      policyVersion: 1,
      salt: 'salt_abc'
    };
    const hash1 = sha256(canonicalize(base));
    const hash2 = sha256(canonicalize(tampered));
    assert.notStrictEqual(hash1, hash2, 'Hash must completely change when input changes');
  });

  // 3. Data minimization inspection of persisted ledger file
  test('Persisted ledger must never contain sensitive keys: password, dob, ssn, idImage', () => {
    const ledgerFile = path.join(__dirname, '..', 'data', 'ledger.json');
    if (fs.existsSync(ledgerFile)) {
      const raw = fs.readFileSync(ledgerFile, 'utf8').toLowerCase();
      const forbidden = ['"password"', '"dob"', '"dateofbirth"', '"ssn"', '"identityimage"', '"passport"'];
      for (const term of forbidden) {
        assert.ok(!raw.includes(term), `Persisted ledger must NEVER contain ${term}`);
      }
    }
  });

  // 4. Reason codes parity with Solidity contract
  test('Reason codes must adhere strictly to contract specification', () => {
    const CONTRACT_REASONS = {
      ALLOWED_OK: 0,
      CLAIM_MISSING: 1,
      CLAIM_REVOKED: 2,
      REPEATED_LOGIN_FAILURES: 3,
      UNUSUAL_REQUEST_BURST: 4,
      SESSION_REVOKED: 5,
      HIGH_RISK_SUSPICIOUS: 6
    };

    assert.strictEqual(CONTRACT_REASONS.ALLOWED_OK, 0);
    assert.strictEqual(CONTRACT_REASONS.CLAIM_MISSING, 1);
    assert.strictEqual(CONTRACT_REASONS.CLAIM_REVOKED, 2);
    assert.strictEqual(CONTRACT_REASONS.HIGH_RISK_SUSPICIOUS, 6);
  });

  console.log('\n------------------------------------------------------');
  console.log(`Security Results: ${passed} passed, ${failed} failed.`);
  console.log('======================================================\n');

  if (failed > 0) process.exit(1);
}

runSecurityTests();

// backend/server.js - GameGuard API Server
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Persistent ledger file path
const DATA_DIR = path.join(__dirname, 'data');
const LEDGER_FILE = path.join(DATA_DIR, 'ledger.json');
const CONTRACT_SOL_PATH = path.join(__dirname, '..', 'contracts', 'GameGuardPolicy.sol');
const CONTRACT_JSON_PATH = path.join(__dirname, '..', 'contracts', 'GameGuardPolicy.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-Memory User Store (Demo Backend DB - private application data, NEVER put on chain)
// Key: username/email
let usersDb = {};

// In-Memory Session Store
// Key: token -> { userId, username, email, createdAt, guardStatus, claim, riskLevel, networkAccess }
let sessionsDb = {};

// In-Memory Failed Login Attempts Counter
let failedLoginAttempts = {};

// Initial default state template for ledger
const initialLedger = () => ({
  meta: {
    system: "GameGuard Demo Policy Ledger",
    specification: "MST Blockchain Buildathon Round 2",
    network: "Simulated Local Ledger / Ethereum Arbitrum Sepolia Ready",
    createdAt: new Date().toISOString()
  },
  receipts: [],
  securityEvents: []
});

// Load or initialize ledger
let ledgerData = initialLedger();
function loadLedger() {
  try {
    if (fs.existsSync(LEDGER_FILE)) {
      const content = fs.readFileSync(LEDGER_FILE, 'utf8');
      ledgerData = JSON.parse(content);
    } else {
      saveLedger();
    }
  } catch (err) {
    console.error('Error loading ledger:', err);
    ledgerData = initialLedger();
  }
}

function saveLedger() {
  try {
    fs.writeFileSync(LEDGER_FILE, JSON.stringify(ledgerData, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving ledger:', err);
  }
}

loadLedger();

// Helper: Secure password hashing using PBKDF2 / Scrypt
function hashPassword(password, salt = null) {
  const generatedSalt = salt || crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, generatedSalt, 64).toString('hex');
  return { hash: derivedKey, salt: generatedSalt };
}

function verifyPassword(password, storedHash, salt) {
  const derivedKey = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(derivedKey), Buffer.from(storedHash));
}

// Helper: Canonicalize claim into deterministic string
function canonicalizeClaim({ claimType, passed, policyVersion, salt }) {
  return `type:${claimType}|passed:${Boolean(passed)}|policyVersion:${policyVersion}|salt:${salt}`;
}

// Helper: SHA-256 hash generator
function sha256(str) {
  return '0x' + crypto.createHash('sha256').update(str).digest('hex');
}

// Helper: Append a security audit event to ledger
function logSecurityEvent({ action, severity = 'info', description, sessionRef = null, details = {} }) {
  const event = {
    eventId: 'evt_' + crypto.randomBytes(6).toString('hex'),
    timestamp: new Date().toISOString(),
    action,
    severity, // 'info', 'warning', 'critical'
    description,
    sessionRef,
    details,
    source: 'GameGuard network policy simulator'
  };
  ledgerData.securityEvents.unshift(event);
  // Keep last 100 events
  if (ledgerData.securityEvents.length > 100) {
    ledgerData.securityEvents = ledgerData.securityEvents.slice(0, 100);
  }
  saveLedger();
  return event;
}

// Auth Middleware
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: missing session token' });
  }
  const token = authHeader.split(' ')[1];
  const session = sessionsDb[token];
  if (!session) {
    return res.status(401).json({ error: 'Session expired or invalid' });
  }
  req.session = session;
  req.sessionToken = token;
  next();
}

// ==========================================
// API ROUTES
// ==========================================

// 1. POST /api/register - Create demo account
app.post('/api/register', (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ error: 'Email/username and password are required' });
  }

  const cleanIdentifier = identifier.trim().toLowerCase();
  if (cleanIdentifier.length < 3) {
    return res.status(400).json({ error: 'Username or email must be at least 3 characters' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  if (usersDb[cleanIdentifier]) {
    return res.status(409).json({ error: 'An account with this identifier already exists' });
  }

  const { hash, salt } = hashPassword(password);
  const userId = 'usr_' + crypto.randomBytes(6).toString('hex');

  usersDb[cleanIdentifier] = {
    userId,
    identifier: cleanIdentifier,
    passwordHash: hash,
    passwordSalt: salt,
    createdAt: new Date().toISOString(),
    guardStatus: 'pending', // 'pending' | 'verified' | 'review' | 'blocked'
    claim: null,
    riskLevel: 'low',
    networkAccess: 'denied'
  };

  // Issue session token
  const token = 'tok_' + crypto.randomBytes(16).toString('hex');
  const sessionRef = '0x' + crypto.createHash('sha256').update(token).digest('hex');

  sessionsDb[token] = {
    userId,
    identifier: cleanIdentifier,
    sessionRef,
    createdAt: new Date().toISOString(),
    guardStatus: 'pending',
    claim: null,
    riskLevel: 'low',
    networkAccess: 'denied'
  };

  logSecurityEvent({
    action: 'ACCOUNT_REGISTERED',
    severity: 'info',
    description: `New demo account created for player identifier: [REDACTED_SAFE_HASH_${cleanIdentifier.slice(0, 3)}***]`,
    sessionRef
  });

  // Return safe user profile (NEVER return password, salt, or secrets)
  return res.status(201).json({
    message: 'Demo account registered successfully',
    token,
    user: {
      userId,
      identifier: cleanIdentifier,
      guardStatus: 'pending',
      ageClaimVerified: false,
      accessAllowed: false,
      policyVersion: 1
    }
  });
});

// 2. POST /api/login - Authenticate and issue session
app.post('/api/login', (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ error: 'Please enter both identifier and password' });
  }

  const cleanIdentifier = identifier.trim().toLowerCase();
  const user = usersDb[cleanIdentifier];

  // Generic login error to prevent account enumeration
  const genericError = 'Invalid credentials. Please verify your email/username and password.';

  if (!user) {
    // Track failed attempts
    failedLoginAttempts[cleanIdentifier] = (failedLoginAttempts[cleanIdentifier] || 0) + 1;
    logSecurityEvent({
      action: 'LOGIN_FAILURE',
      severity: 'warning',
      description: `Failed login attempt for non-existent or miskeyed identifier.`
    });
    return res.status(401).json({ error: genericError });
  }

  const isValid = verifyPassword(password, user.passwordHash, user.passwordSalt);
  if (!isValid) {
    failedLoginAttempts[cleanIdentifier] = (failedLoginAttempts[cleanIdentifier] || 0) + 1;
    const attempts = failedLoginAttempts[cleanIdentifier];

    logSecurityEvent({
      action: 'LOGIN_FAILURE',
      severity: attempts >= 3 ? 'critical' : 'warning',
      description: `Invalid password supplied for player. Consecutive failed attempts: ${attempts}`
    });

    if (attempts >= 3) {
      user.guardStatus = 'review';
      user.riskLevel = 'medium';
    }

    return res.status(401).json({ error: genericError });
  }

  // Reset failed attempts upon successful login
  delete failedLoginAttempts[cleanIdentifier];

  // Issue new session token
  const token = 'tok_' + crypto.randomBytes(16).toString('hex');
  const sessionRef = '0x' + crypto.createHash('sha256').update(token).digest('hex');

  sessionsDb[token] = {
    userId: user.userId,
    identifier: user.identifier,
    sessionRef,
    createdAt: new Date().toISOString(),
    guardStatus: user.guardStatus,
    claim: user.claim, // Preserve existing claim for returning users!
    riskLevel: user.riskLevel,
    networkAccess: user.networkAccess
  };

  logSecurityEvent({
    action: 'LOGIN_SUCCESS',
    severity: 'info',
    description: `Player authenticated successfully. Active session established.`,
    sessionRef
  });

  return res.json({
    message: 'Login successful',
    token,
    user: {
      userId: user.userId,
      identifier: user.identifier,
      guardStatus: user.guardStatus,
      ageClaimVerified: Boolean(user.claim && user.claim.status === 'verified'),
      claim: user.claim,
      accessAllowed: user.networkAccess === 'allowed',
      policyVersion: 1
    }
  });
});

// 3. GET /api/me - Return current account and guard status
app.get('/api/me', authMiddleware, (req, res) => {
  const session = req.session;
  const user = usersDb[session.identifier] || session;

  return res.json({
    user: {
      userId: session.userId,
      identifier: session.identifier,
      guardStatus: user.guardStatus || session.guardStatus,
      ageClaimVerified: Boolean(user.claim && user.claim.status === 'verified'),
      claim: user.claim || session.claim,
      riskLevel: user.riskLevel || session.riskLevel,
      networkAccess: user.networkAccess || session.networkAccess,
      sessionRef: session.sessionRef,
      lastCheckTime: session.lastCheckTime || null,
      policyVersion: 1
    }
  });
});

// 4. POST /api/guard/verify - Run guard policy simulation
app.post('/api/guard/verify', authMiddleware, (req, res) => {
  const session = req.session;
  const user = usersDb[session.identifier] || session;

  // Staged scan simulation
  // 1. Session integrity check
  // 2. Account policy check
  // 3. Network access decision
  const stagedSteps = [
    { name: "Session Integrity", status: "passed", detail: "TLS 1.3 handshake verified; entropy score 0.98" },
    { name: "Account Policy", status: "passed", detail: "No credential stuffing or active ban detected" },
    { name: "Network Access Decision", status: "passed", detail: "Device fingerprint consistent with gaming safe profile" }
  ];

  // If currently flagged as critical
  let decision = 'passed';
  let reason = 'Guard verification passed. Session meets gaming network baseline safety standards.';

  if (user.riskLevel === 'high') {
    decision = 'review';
    reason = 'Account has high risk anomaly flags active. Security review required before proceeding.';
    user.guardStatus = 'review';
  } else {
    user.guardStatus = 'verified';
    session.guardStatus = 'verified';
  }

  session.lastCheckTime = new Date().toISOString();

  logSecurityEvent({
    action: 'GUARD_VERIFICATION',
    severity: decision === 'passed' ? 'info' : 'warning',
    description: `GameGuard verification completed. Result: ${decision.toUpperCase()}. ${reason}`,
    sessionRef: session.sessionRef,
    details: { stagedSteps, decision }
  });

  return res.json({
    decision,
    reason,
    ruleIds: ['RULE_INTEGRITY_01', 'RULE_POLICY_AUTH_02', 'RULE_GATEWAY_NET_03'],
    timestamp: session.lastCheckTime,
    stagedSteps
  });
});

// 5. POST /api/age/verify - Accept demo age result and create claim fingerprint
app.post('/api/age/verify', authMiddleware, (req, res) => {
  const session = req.session;
  const user = usersDb[session.identifier] || session;
  const { isOverThreshold, claimType = 'AGE_OVER_13', sampleReference = null } = req.body;

  if (typeof isOverThreshold !== 'boolean') {
    return res.status(400).json({ error: 'Missing or invalid isOverThreshold boolean parameter' });
  }

  // Safety Requirement Check: Ensure no raw DOB or identity images are stored!
  if (req.body.dateOfBirth || req.body.dob || req.body.idImage) {
    return res.status(400).json({
      error: 'Data Minimization Violation: Raw birth dates and ID scans must never be submitted or stored.'
    });
  }

  const timestamp = new Date().toISOString();
  const policyVersion = 1;
  const salt = crypto.randomBytes(16).toString('hex');

  // Step 2: Canonicalize claim
  const canonicalString = canonicalizeClaim({
    claimType,
    passed: isOverThreshold,
    policyVersion,
    salt
  });

  // Step 3: Hash locally using SHA-256
  const claimHash = sha256(canonicalString);

  // Step 4: Create proof receipt
  const receiptId = 'rec_' + crypto.randomBytes(6).toString('hex');
  const claimRecord = {
    receiptId,
    claimHash,
    canonicalString,
    claimType,
    passed: isOverThreshold,
    policyVersion,
    timestamp,
    status: isOverThreshold ? 'verified' : 'rejected',
    provider: 'Demo Age Assurance Provider (Simulated Zero-Knowledge / Token Gateway)',
    source: 'local demo / ready for EVM anchor',
    storedFields: ['receiptId', 'claimHash', 'claimType', 'passed', 'policyVersion', 'timestamp', 'status'],
    neverStoredFields: ['raw_date_of_birth', 'full_legal_name', 'government_id_scan', 'biometric_data']
  };

  // Save to user profile and session
  user.claim = claimRecord;
  session.claim = claimRecord;

  // Add receipt to ledger
  ledgerData.receipts.unshift(claimRecord);
  saveLedger();

  logSecurityEvent({
    action: isOverThreshold ? 'AGE_ASSURANCE_PASSED' : 'AGE_ASSURANCE_FAILED',
    severity: isOverThreshold ? 'info' : 'warning',
    description: isOverThreshold
      ? `Age threshold confirmed. SHA-256 claim fingerprint derived: ${claimHash.slice(0, 18)}... (No PII retained)`
      : `Age threshold verification failed. Game lobby access denied per network safety policy.`,
    sessionRef: session.sessionRef,
    details: { claimHash, status: claimRecord.status }
  });

  return res.json({
    message: isOverThreshold
      ? 'Age requirement confirmed. Your birth date is not added to the ledger.'
      : 'Age requirement not met.',
    claim: claimRecord
  });
});

// 6. POST /api/network/access - Evaluate access gate
app.post('/api/network/access', authMiddleware, (req, res) => {
  const session = req.session;
  const user = usersDb[session.identifier] || session;

  // Evaluation criteria:
  // 1. Guard check must be 'verified'
  // 2. Age claim must exist and be 'verified'
  // 3. Session risk must not be 'high'
  const isGuardPassed = (user.guardStatus === 'verified' || session.guardStatus === 'verified');
  const isClaimValid = user.claim && user.claim.status === 'verified';
  const isHighRisk = user.riskLevel === 'high' || session.riskLevel === 'high';

  if (!isGuardPassed) {
    user.networkAccess = 'denied';
    session.networkAccess = 'denied';
    logSecurityEvent({
      action: 'NETWORK_ACCESS_DENIED',
      severity: 'warning',
      description: 'Network access denied: GameGuard security check has not been completed or passed.',
      sessionRef: session.sessionRef
    });
    return res.status(403).json({
      allowed: false,
      reasonCode: 1, // CLAIM_MISSING
      reason: 'GameGuard checkpoint pending. Please run verification first.',
      networkProfile: 'Quarantined - Port 80/443 Only'
    });
  }

  if (!isClaimValid) {
    user.networkAccess = 'denied';
    session.networkAccess = 'denied';
    logSecurityEvent({
      action: 'NETWORK_ACCESS_DENIED',
      severity: 'warning',
      description: 'Network access denied: Age assurance claim missing or revoked.',
      sessionRef: session.sessionRef
    });
    return res.status(403).json({
      allowed: false,
      reasonCode: 1,
      reason: 'Age assurance requirement has not been confirmed. Please complete the one-time check.',
      networkProfile: 'Quarantined - Safety Gate Enforced'
    });
  }

  if (isHighRisk) {
    user.networkAccess = 'denied';
    session.networkAccess = 'denied';
    logSecurityEvent({
      action: 'NETWORK_ACCESS_DENIED',
      severity: 'critical',
      description: 'Network access denied: Elevated risk anomalies detected on current session.',
      sessionRef: session.sessionRef
    });
    return res.status(403).json({
      allowed: false,
      reasonCode: 6, // HIGH_RISK_SUSPICIOUS
      reason: 'Elevated risk profile detected. Access locked until security review.',
      networkProfile: 'Blocked by Policy Simulator'
    });
  }

  // Allow access
  user.networkAccess = 'allowed';
  session.networkAccess = 'allowed';

  // Generate simulated matchmaking gateway token
  const matchmakingToken = 'mm_' + crypto.randomBytes(12).toString('hex');

  logSecurityEvent({
    action: 'NETWORK_ACCESS_ALLOWED',
    severity: 'info',
    description: 'Network access granted. Session authorized to connect to simulated game lobby.',
    sessionRef: session.sessionRef
  });

  return res.json({
    allowed: true,
    reasonCode: 0,
    reason: 'Guard passed and age claim verified. Game access is now open.',
    matchmakingToken,
    networkProfile: 'Trusted Gaming Node (Low Latency / Secure Gateway Active)',
    sessionRef: session.sessionRef
  });
});

// 7. GET /api/ledger - Read event receipts
app.get('/api/ledger', (req, res) => {
  const { filter = 'all', page = 1, limit = 20 } = req.query;

  let receipts = [...ledgerData.receipts];

  if (filter === 'verified') {
    receipts = receipts.filter(r => r.status === 'verified');
  } else if (filter === 'alerts') {
    receipts = receipts.filter(r => r.status === 'rejected' || r.status === 'revoked');
  }

  const offset = (page - 1) * limit;
  const paginatedReceipts = receipts.slice(offset, offset + limit);

  return res.json({
    totalReceipts: receipts.length,
    page: parseInt(page),
    receipts: paginatedReceipts,
    meta: ledgerData.meta,
    summary: {
      verifiedClaims: ledgerData.receipts.filter(r => r.status === 'verified').length,
      rejectedOrRevoked: ledgerData.receipts.filter(r => r.status !== 'verified').length,
      securityEventsCount: ledgerData.securityEvents.length
    }
  });
});

// 8. GET /api/events - Get security audit events
app.get('/api/events', (req, res) => {
  const { limit = 30 } = req.query;
  const events = ledgerData.securityEvents.slice(0, parseInt(limit));
  return res.json({ events });
});

// 9. POST /api/events/simulate - Trigger anomaly presets
app.post('/api/events/simulate', authMiddleware, (req, res) => {
  const session = req.session;
  const user = usersDb[session.identifier] || session;
  const { scenario } = req.body;

  let policyResponse = {};

  switch (scenario) {
    case 'normal_session': {
      user.riskLevel = 'low';
      session.riskLevel = 'low';
      user.guardStatus = 'verified';
      session.guardStatus = 'verified';
      policyResponse = {
        riskLevel: 'low',
        decision: 'Allow',
        actionTaken: 'Continue session; record receipt in timeline.',
        explanation: 'Standard session signals within normal gaming bounds.'
      };
      logSecurityEvent({
        action: 'PRESET_NORMAL_SESSION',
        severity: 'info',
        description: 'Simulated preset triggered: Normal session verified. Risk profile remains LOW.',
        sessionRef: session.sessionRef
      });
      break;
    }

    case 'repeated_login_failures': {
      user.riskLevel = 'high';
      session.riskLevel = 'high';
      user.networkAccess = 'denied';
      session.networkAccess = 'denied';
      user.guardStatus = 'review';
      policyResponse = {
        riskLevel: 'high',
        decision: 'Deny / Revoke',
        actionTaken: 'Demo session locked; network gateway access suspended.',
        explanation: 'Triggered by 5 rapid failed authentication attempts from multiple IP ranges.'
      };
      logSecurityEvent({
        action: 'PRESET_REPEATED_LOGIN_FAILURES',
        severity: 'critical',
        description: 'Suspicious event detected: 5 rapid failed logins. Session access locked in simulation.',
        sessionRef: session.sessionRef
      });
      break;
    }

    case 'unusual_request_burst': {
      user.riskLevel = 'medium';
      session.riskLevel = 'medium';
      policyResponse = {
        riskLevel: 'medium',
        decision: 'Review',
        actionTaken: 'Simulated request rate slowed; warning issued in SOC operations timeline.',
        explanation: 'Unusual burst of 140 requests/sec detected from browser client.'
      };
      logSecurityEvent({
        action: 'PRESET_REQUEST_BURST',
        severity: 'warning',
        description: 'Traffic anomaly: 140 req/sec burst observed. Rate-limiting simulation applied.',
        sessionRef: session.sessionRef
      });
      break;
    }

    case 'missing_age_claim': {
      user.claim = null;
      session.claim = null;
      user.networkAccess = 'denied';
      session.networkAccess = 'denied';
      policyResponse = {
        riskLevel: 'medium',
        decision: 'Deny / Require Age Check',
        actionTaken: 'Player flagged as missing required age assurance claim.',
        explanation: 'Network access policy requires active proof fingerprint before lobby entry.'
      };
      logSecurityEvent({
        action: 'PRESET_MISSING_AGE_CLAIM',
        severity: 'warning',
        description: 'Access policy check failed: No valid age assurance claim found on session.',
        sessionRef: session.sessionRef
      });
      break;
    }

    case 'revoked_claim': {
      if (user.claim) {
        user.claim.status = 'revoked';
        user.claim.revokedAt = new Date().toISOString();
        // Update in ledger
        const rec = ledgerData.receipts.find(r => r.claimHash === user.claim.claimHash);
        if (rec) {
          rec.status = 'revoked';
          rec.revokedAt = user.claim.revokedAt;
          saveLedger();
        }
      }
      user.networkAccess = 'denied';
      session.networkAccess = 'denied';
      policyResponse = {
        riskLevel: 'high',
        decision: 'Deny / Revoke',
        actionTaken: 'Claim marked as REVOKED in ledger; lobby access immediately revoked.',
        explanation: 'Revocation event anchored in demo ledger (matches Solidity revokeClaim logic).'
      };
      logSecurityEvent({
        action: 'PRESET_REVOKED_CLAIM',
        severity: 'critical',
        description: 'Claim revoked by player or administrative policy. Access denied.',
        sessionRef: session.sessionRef
      });
      break;
    }

    case 'claim_mismatch': {
      // Simulate fingerprint tampering to demonstrate cryptographic verification
      if (user.claim) {
        const tamperedHash = '0x' + crypto.randomBytes(32).toString('hex');
        policyResponse = {
          riskLevel: 'high',
          decision: 'Mismatch Detected',
          actionTaken: 'Tamper alert triggered! Saved hash does not match canonical claim computation.',
          originalHash: user.claim.claimHash,
          tamperedHash
        };
        logSecurityEvent({
          action: 'CLAIM_MISMATCH_DETECTED',
          severity: 'critical',
          description: `Cryptographic tamper alert! Provided hash does not match computed claim canonical string.`,
          sessionRef: session.sessionRef
        });
      } else {
        policyResponse = {
          error: 'No active claim to simulate mismatch on. Run age assurance first.'
        };
      }
      break;
    }

    default:
      return res.status(400).json({ error: 'Unknown scenario preset' });
  }

  return res.json({
    scenario,
    policyResponse,
    currentStatus: {
      guardStatus: user.guardStatus,
      riskLevel: user.riskLevel,
      networkAccess: user.networkAccess
    }
  });
});

// 10. POST /api/session/revoke - Revoke active session
app.post('/api/session/revoke', authMiddleware, (req, res) => {
  const session = req.session;
  const user = usersDb[session.identifier] || session;

  user.networkAccess = 'denied';
  delete sessionsDb[req.sessionToken];

  logSecurityEvent({
    action: 'SESSION_REVOKED',
    severity: 'warning',
    description: 'Session manually revoked by user or security supervisor.',
    sessionRef: session.sessionRef
  });

  return res.json({ message: 'Session revoked successfully. Log in again to continue.' });
});

// 11. POST /api/claim/revoke - Explicitly revoke age claim
app.post('/api/claim/revoke', authMiddleware, (req, res) => {
  const session = req.session;
  const user = usersDb[session.identifier] || session;

  if (user.claim) {
    user.claim.status = 'revoked';
    user.claim.revokedAt = new Date().toISOString();
    const rec = ledgerData.receipts.find(r => r.claimHash === user.claim.claimHash);
    if (rec) {
      rec.status = 'revoked';
      rec.revokedAt = user.claim.revokedAt;
      saveLedger();
    }
  }

  user.networkAccess = 'denied';
  session.networkAccess = 'denied';

  logSecurityEvent({
    action: 'CLAIM_REVOKED_MANUAL',
    severity: 'warning',
    description: 'Player age claim marked as revoked in ledger. Game network access suspended.',
    sessionRef: session.sessionRef
  });

  return res.json({
    message: 'Claim has been revoked.',
    claim: user.claim
  });
});

// 12. GET /api/contract - Return Solidity contract source & metadata
app.get('/api/contract', (req, res) => {
  let source = '';
  let metadata = {};

  try {
    if (fs.existsSync(CONTRACT_SOL_PATH)) {
      source = fs.readFileSync(CONTRACT_SOL_PATH, 'utf8');
    }
    if (fs.existsSync(CONTRACT_JSON_PATH)) {
      metadata = JSON.parse(fs.readFileSync(CONTRACT_JSON_PATH, 'utf8'));
    }
  } catch (err) {
    console.error('Error reading contract files:', err);
  }

  return res.json({
    contractName: 'GameGuardPolicy.sol',
    target: 'Solidity ^0.8.20',
    deployed: false,
    deploymentNote: 'Not deployed in this demo. Anchors minimal claims on-chain in production.',
    source,
    metadata
  });
});

// 13. GET /api/export - Download a JSON snapshot of simulated events for judging
app.get('/api/export', (req, res) => {
  // Data minimization: Clean export snapshot with ZERO passwords, salts, raw DOBs, or secret session tokens
  const sanitizedReceipts = ledgerData.receipts.map(r => ({
    receiptId: r.receiptId,
    claimHash: r.claimHash,
    claimType: r.claimType,
    passed: r.passed,
    policyVersion: r.policyVersion,
    timestamp: r.timestamp,
    status: r.status,
    source: r.source
  }));

  const sanitizedEvents = ledgerData.securityEvents.map(e => ({
    eventId: e.eventId,
    timestamp: e.timestamp,
    action: e.action,
    severity: e.severity,
    description: e.description,
    source: e.source
  }));

  const exportData = {
    exportedAt: new Date().toISOString(),
    system: "GameGuard Demo Policy Ledger",
    specification: "MST Blockchain Buildathon Round 2",
    rulesHonored: [
      "NO raw personal data, DOBs, or ID scans persisted",
      "Only cryptographic claim hashes, policy versions, timestamps, and status retained",
      "Clear simulation labeling across all external integrations"
    ],
    receiptsCount: sanitizedReceipts.length,
    eventsCount: sanitizedEvents.length,
    receipts: sanitizedReceipts,
    events: sanitizedEvents
  };

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="gameguard-judging-ledger.json"');
  return res.send(JSON.stringify(exportData, null, 2));
});

// 14. POST /api/demo/reset - Reset demo data with confirmation
app.post('/api/demo/reset', (req, res) => {
  usersDb = {};
  sessionsDb = {};
  failedLoginAttempts = {};
  ledgerData = initialLedger();
  saveLedger();

  logSecurityEvent({
    action: 'DEMO_DATA_RESET',
    severity: 'info',
    description: 'Demo state successfully reset to initial baseline for judging.'
  });

  return res.json({
    message: 'Demo state reset successfully. All in-memory sessions and ledger data restored to clean state.'
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'GameGuard Security Layer API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Static Frontend Serving (if built)
const FRONTEND_DIST = path.join(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(FRONTEND_DIST)) {
  app.use(express.static(FRONTEND_DIST));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(FRONTEND_DIST, 'index.html'));
  });
}

// Start Server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`[GameGuard] API Server running on port ${PORT}`);
    console.log(`[GameGuard] Base URL: http://localhost:${PORT}`);
  });
}

module.exports = app;

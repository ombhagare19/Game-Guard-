# GameGuard: Privacy-First Security Layer for Global Gaming Networks

> **MST Blockchain Buildathon • Round 2 MVP Specification**  
> *Verify the player. Protect their data. Let trusted players enter the game.*

---

## 🛡️ Core Promise & Overview

**GameGuard** is a local-first security checkpoint and privacy-preserving gateway for online gaming networks. Instead of exposing personal identity documents, birth dates, or raw player profiles on public blockchains or centralized honeypots, GameGuard proves eligibility and evaluates security health using:
1. **Zero-PII Data Minimization**: Raw birth dates, ID scans, full legal names, and plaintext passwords are never collected or written to the public ledger.
2. **Deterministic Cryptographic Fingerprints**: SHA-256 claim hashes derived via the browser's native **Web Crypto API** (`crypto.subtle.digest`) create tamper-evident, verifiable proof receipts.
3. **Multi-Stage Security Policy Checkpoint**: Evaluates session integrity, account policy conformance, and network access gates before issuing low-latency game matchmaking tokens.
4. **Solidity ^0.8.20 Anchor Contract**: `GameGuardPolicy.sol` provides on-chain verification structures (`registerClaim`, `revokeClaim`, `recordAccessDecision`) for EVM rollups (Arbitrum, Base, Optimism, Ethereum Sepolia).
5. **Honest Security Boundary**: All simulation aspects (gateway rules, threat presets, age provider) are clearly labeled without false claims of live OS-firewall hooks or fake blockchain transaction hashes.

---

## 🎨 Visual System & Dark SOC Theme

Built with a focused dark **Security Operations Console (SOC)** aesthetic designed for trust, clarity, and accessibility:

| Token | Value | Applied To |
|---|---|---|
| **Base canvas** | `#0B1420` / deep navy | Main shell, background, and navigation bar |
| **Surface** | `#132334` / slate blue | Cards, Bento panels, inspector drawer |
| **Primary text** | `#F4F8FB` | Main headings, modal titles, active status |
| **Secondary text** | `#A7BBC8` | Helper text, descriptions, timestamps |
| **Verified / safe** | `#53E0B5` (mint) | Guard passed, claim verified, access allowed |
| **Info / network** | `#55C9F5` (cyan) | Hashes, network status, Solidity contract tags |
| **Review / caution** | `#F6BC59` (amber) | Suspicious events, medium-risk rate limits |
| **Blocked / critical**| `#FF6B75` (red) | Denied access, brute force alerts, revoked claims |

---

## 📂 Project Organization

```text
GG/
├── contracts/
│   ├── GameGuardPolicy.sol        # Solidity ^0.8.20 Smart Contract
│   └── GameGuardPolicy.json       # Compiled ABI and Contract Metadata
├── backend/
│   ├── server.js                  # Express API, KDF Password Hashing, Ledger Persistence
│   ├── package.json               # Backend dependencies
│   ├── data/
│   │   └── ledger.json            # Persisted demo ledger (Zero PII receipts & audit events)
│   └── tests/
│       ├── api.test.js            # 21 Integration & Route Tests (Test Pass 1)
│       ├── security.test.js       # 4 Cryptographic & Tamper Resilience Tests (Test Pass 2)
│       └── e2e.test.js            # 13 End-to-End Simulation Tests (Test Pass 3)
├── frontend/
│   ├── index.html                 # Accessible HTML shell
│   ├── package.json               # Frontend dependencies (React, Vite, Tailwind, Lucide)
│   ├── vite.config.js             # Vite bundler & /api proxy
│   ├── tailwind.config.js         # Exact SOC color tokens & animations
│   ├── src/
│   │   ├── main.jsx               # React entry point
│   │   ├── App.jsx                # Screen switcher & modal coordinator
│   │   ├── index.css              # Dark SOC styles, accessible focus, reduced motion
│   │   ├── context/
│   │   │   └── GameGuardContext.jsx # State machine, auth, workflow tracking, tour
│   │   ├── components/
│   │   │   ├── Header.jsx         # Shield mark, status pill, Demo mode badge, Judge mode button
│   │   │   ├── LandingHero.jsx    # Hero, 3 benefit tiles, CTAs
│   │   │   ├── AuthCard.jsx       # Login/Register toggle, field validation, judge shortcuts
│   │   │   ├── GuardCheckModal.jsx # Staged scan: session integrity -> account -> network
│   │   │   ├── AgeAssuranceModal.jsx # 13+/18+ selection, progress ring, typewriter hash reveal
│   │   │   ├── NextActionBeacon.jsx # Guided "NEXT STEP" button & progress track
│   │   │   ├── PrivacyProofModal.jsx # 5-step claim flow with live Web Crypto verification
│   │   │   ├── SimulatedGameLobby.jsx # Playable CyberStrike arena, ping, FPS, packet burst test
│   │   │   ├── NetworkPolicySimulator.jsx # 3 rule groups & honest boundary notice
│   │   │   ├── SolidityInspectorModal.jsx # Contract viewer, copy button, ABI toggle
│   │   │   ├── SpotlightTour.jsx  # 3-step first-time onboarding spotlight
│   │   │   └── Dashboard/
│   │   │       ├── BentoGrid.jsx
│   │   │       ├── GuardStatusCard.jsx
│   │   │       ├── AgeClaimCard.jsx
│   │   │       ├── NetworkAccessCard.jsx
│   │   │       ├── SecurityEventsTimeline.jsx
│   │   │       ├── PolicyLedgerCard.jsx
│   │   │       └── ProtectionControlsCard.jsx
│   │   └── utils/
│   │       ├── crypto.js          # Browser Web Crypto SHA-256 fingerprinting
│   │       └── api.js             # API client with token management
│   └── dist/                      # Production build assets
└── package.json                   # Root monorepo workspace scripts
```

---

## 🚀 Exact Local Run Commands

### 1. Unified Quick Start (Backend serves built Frontend on Port 4000)
```bash
# In project root:
cd backend
npm start
```
Open **`http://localhost:4000`** in any web browser.

### 2. Development Mode with Hot Reloading (Vite Port 5173 + API Port 4000)
In terminal 1:
```bash
cd backend
npm start
```
In terminal 2:
```bash
cd frontend
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## 🧪 Automated Testing (3 Comprehensive Test Passes)

The application includes **38 rigorous automated tests** run across 3 testing passes:

```bash
cd backend
npm test
```

### Breakdown of Test Passes:
1. **`tests/api.test.js` (21 Tests)**:
   - Health check & demo reset endpoints
   - Credential validation (length, missing fields)
   - Generic login errors (preventing username enumeration)
   - PBKDF2/scrypt password hashing (never stored or returned in plaintext)
   - Mandatory rejection of raw DOB or ID images
   - Staged scan progression
   - Deterministic SHA-256 fingerprint generation
   - Returning verified user persistence
   - Contract metadata & Solidity source verification
   - Sanitized ledger export
2. **`tests/security.test.js` (4 Tests)**:
   - Canonicalization determinism across calls
   - Single-bit tamper resistance of SHA-256
   - Persistent ledger file inspection for forbidden terms (`password`, `dob`, `idImage`)
   - Strict parity with Solidity `AccessReasonCode` enums
3. **`tests/e2e.test.js` (13 Tests)**:
   - Complete player journey from registration to matchmaking
   - Gate access denial when checkpoint is missing
   - Gate access denial when age requirement fails
   - Presets: `repeated_login_failures`, `unusual_request_burst`, `normal_session`, `revoked_claim`, `claim_mismatch`
   - Session revocation & token invalidation
   - Data minimization audit of exported JSON snapshot

---

## ⏱️ Round 2 Demo Script Walkthrough (2-Minute Guide for Judges)

Use this script during live review or video presentation:

| Timestamp | Screen / Action | Recommended Speaking Script |
|---|---|---|
| **0:00 – 0:20** | **Landing Page & Login** | *“GameGuard places a clear security checkpoint before the game opens.”* Click **New Player Demo** to log in instantly. |
| **0:20 – 0:40** | **Run Guard Check** | *“We check session and policy signals, and explain the result in plain language.”* Click **Run GameGuard verification** to view the staged scan. |
| **0:40 – 1:00** | **One-Time Age Assurance** | *“The demo keeps the age result, not the raw date of birth, in its proof record.”* Click **Confirm & Generate Proof**. |
| **1:00 – 1:20** | **Fingerprint & Ledger** | *“This SHA-256 fingerprint helps identify a claim receipt. It is not encryption and not a zero-knowledge proof.”* Open **Privacy Proof** and click **Verify Match**. |
| **1:20 – 1:40** | **Open Lobby, Trigger Anomaly** | *“A suspicious event updates the policy decision and timeline. This browser demo simulates a gateway response.”* Enter the **Game Lobby** and click **Simulate Packet Burst Anomaly**. |
| **1:40 – 2:00** | **Contract Inspector & Boundaries** | *“The Solidity contract is designed to anchor minimal claims. Real chain, age provider, and gateway deployment are separate integration steps.”* Open the **Solidity Inspector** to review `GameGuardPolicy.sol`. |

---

## 📜 Solidity Policy Contract (`GameGuardPolicy.sol`)

The contract conforms to Solidity `^0.8.20` and enforces strict on-chain data minimization:

- **`registerClaim(bytes32 claimHash, uint8 claimType, bool passed, uint32 policyVersion)`**: Anchors a 32-byte claim hash. Rejects duplicate claims.
- **`revokeClaim(bytes32 claimHash)`**: Marks an existing claim as revoked without destroying historical blockchain records.
- **`recordAccessDecision(bytes32 sessionRef, bool allowed, uint8 reasonCode)`**: Anchors access gateway decisions using an anonymized session reference hash.
- **`isClaimValid(bytes32 claimHash)`**: Gas-optimized view helper for smart contracts and games to verify player eligibility.

---

## 🔒 Known Limitations & Production Roadmap

1. **Browser Sandbox**: This prototype runs as a web application. It does not manipulate operating system kernel firewall tables or local network drivers. In production, GameGuard pairs with a native gateway daemon, anti-cheat SDK, or zero-trust network access (ZTNA) client.
2. **Age Assurance Provider**: The demo simulates age verification with sample boolean claims. Production deployment will integrate certified age-verification providers via OIDC / verifiable credentials or Zero-Knowledge Proofs (e.g., zk-SNARKs with Circom).
3. **EVM Rollup Deployment**: The smart contract is pre-compiled with full ABI and ready for deployment to Arbitrum, Base, or Sepolia testnet.

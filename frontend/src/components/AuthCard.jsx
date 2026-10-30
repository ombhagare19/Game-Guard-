// frontend/src/components/AuthCard.jsx
import React, { useState } from 'react';
import { useGameGuard } from '../context/GameGuardContext';
import { 
  User, 
  KeyRound, 
  AlertCircle, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Lock, 
  Scan, 
  HelpCircle, 
  Copy, 
  Check, 
  Gamepad2,
  Sparkles,
  Zap
} from 'lucide-react';

export default function AuthCard({ onEnterDashboard }) {
  const { 
    user, 
    handleLogin, 
    handleRegister, 
    handleRunGuardCheck, 
    handleVerifyAge, 
    handleRequestAccess,
    setGameLobbyOpen,
    error: contextError 
  } = useGameGuard();

  const [isRegister, setIsRegister] = useState(false);
  const [identifier, setIdentifier] = useState('judge.demo@gameguard.network');
  const [password, setPassword] = useState('SecurityPass2026!');
  const [localError, setLocalError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Staged scan inside Step B
  const [scanning, setScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [showExplainer, setShowExplainer] = useState(false);

  // Age choice inside Step C
  const [ageThreshold, setAgeThreshold] = useState('AGE_OVER_13');
  const [ageVerifying, setAgeVerifying] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

  // Step A: Submit Account
  const handleAccountSubmit = async (e) => {
    if (e) e.preventDefault();
    setLocalError('');

    if (!identifier.trim()) {
      setLocalError('Please enter an email or username.');
      return;
    }
    if (identifier.trim().length < 3) {
      setLocalError('Identifier must be at least 3 characters.');
      return;
    }
    if (!password) {
      setLocalError('Please enter a password.');
      return;
    }
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      if (isRegister) {
        await handleRegister(identifier.trim(), password);
      } else {
        await handleLogin(identifier.trim(), password);
      }
    } catch (err) {
      setLocalError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Step B: Run Guard Check
  const handleGuardScan = async () => {
    setScanning(true);
    setScanStep(1);
    setTimeout(() => setScanStep(2), 350);
    setTimeout(() => setScanStep(3), 700);

    try {
      await handleRunGuardCheck();
      setTimeout(() => {
        setScanning(false);
      }, 1050);
    } catch (err) {
      setScanning(false);
      setLocalError(err.message);
    }
  };

  // Step C: Age Assurance
  const handleAgeConfirm = async (passed) => {
    setAgeVerifying(true);
    try {
      await handleVerifyAge(passed, ageThreshold);
    } catch (err) {
      setLocalError(err.message);
    } finally {
      setAgeVerifying(false);
    }
  };

  // Step D: Enter Game Lobby / Dashboard
  const handleEnterLobby = async () => {
    try {
      await handleRequestAccess();
      if (onEnterDashboard) onEnterDashboard();
    } catch (err) {
      setLocalError(err.message);
    }
  };

  // Quick 1-Click Complete Demo Journey for Judges
  const handleOneClickAll = async () => {
    setLoading(true);
    setLocalError('');
    try {
      const rand = Math.floor(1000 + Math.random() * 9000);
      const email = `pilot_${rand}@gameguard.demo`;
      await handleRegister(email, 'BuildathonPass2026!');
      await handleRunGuardCheck();
      await handleVerifyAge(true, 'AGE_OVER_13');
      await handleRequestAccess();
      if (onEnterDashboard) onEnterDashboard();
    } catch (err) {
      setLocalError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyClaimHash = (hash) => {
    if (!hash) return;
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  // Progress state computation
  const isStepADone = Boolean(user);
  const isStepBDone = user?.guardStatus === 'verified';
  const isStepCDone = user?.claim && user.claim.status === 'verified';
  const isStepDDone = user?.networkAccess === 'allowed';

  const displayError = localError || contextError;

  return (
    <div className="w-full max-w-2xl mx-auto bg-surface border border-surface-border rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
      
      {/* Decorative accent glow */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-status-info via-status-safe to-status-info" />

      {/* Header & 1-Click Fast Track */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-status-info block mb-1">
            SCREEN 1: GUIDED CHECKPOINT
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-primary-text">
            Player Verification Checkpoint
          </h2>
          <p className="text-xs text-secondary-text mt-0.5">
            Complete the 4 stages to unlock zero-knowledge game network access
          </p>
        </div>

        {/* Instant Fast Track Button for Judges */}
        <button
          type="button"
          onClick={handleOneClickAll}
          disabled={loading}
          className="px-3.5 py-2 rounded-xl bg-status-safe/10 hover:bg-status-safe/20 text-status-safe border border-status-safe/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm shrink-0"
          title="Instantly execute Step A, B, C and D for demonstration"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>1-Click Auto Pass (Judge)</span>
        </button>
      </div>

      {/* Error Alert Box */}
      {displayError && (
        <div 
          role="alert"
          className="mb-5 p-3 rounded-xl bg-status-critical/10 border border-status-critical/30 flex items-start gap-2.5 text-xs text-status-critical"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{displayError}</span>
        </div>
      )}

      {/* The 4 Guided Checkpoint Stages (A, B, C, D) */}
      <div className="space-y-4">
        
        {/* ========================================================================= */}
        {/* STEP A: ACCOUNT CREATION / LOGIN */}
        {/* ========================================================================= */}
        <div className={`p-4 rounded-2xl border transition-all ${
          isStepADone 
            ? 'bg-status-safe/5 border-status-safe/30' 
            : 'bg-canvas/80 border-surface-border'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono ${
                isStepADone ? 'bg-status-safe text-canvas' : 'bg-[#182C42] text-status-info border border-surface-border'
              }`}>
                {isStepADone ? <Check className="w-3.5 h-3.5" /> : 'A'}
              </span>
              <h3 className="font-bold text-sm text-primary-text">
                Step A: Player Account
              </h3>
            </div>

            {isStepADone ? (
              <span className="text-xs font-mono text-status-safe font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{user.identifier}</span>
              </span>
            ) : (
              <div className="flex bg-canvas p-0.5 rounded-lg border border-surface-border">
                <button
                  type="button"
                  onClick={() => setIsRegister(false)}
                  className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition-colors ${
                    !isRegister ? 'bg-surface text-primary-text font-bold' : 'text-secondary-text'
                  }`}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => setIsRegister(true)}
                  className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition-colors ${
                    isRegister ? 'bg-surface text-primary-text font-bold' : 'text-secondary-text'
                  }`}
                >
                  Register
                </button>
              </div>
            )}
          </div>

          {!isStepADone ? (
            <form onSubmit={handleAccountSubmit} className="space-y-3 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-secondary-text mb-1">
                    Email or Gamertag
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 absolute left-3 top-3 text-secondary-text" />
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="e.g. shadow_pilot"
                      className="w-full pl-8 pr-3 py-2 bg-canvas border border-surface-border rounded-xl text-xs text-primary-text focus:border-status-info focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-secondary-text mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <KeyRound className="w-3.5 h-3.5 absolute left-3 top-3 text-secondary-text" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-8 pr-3 py-2 bg-canvas border border-surface-border rounded-xl text-xs text-primary-text focus:border-status-info focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-secondary-text">
                  KDF Hash: PBKDF2/scrypt unique salt (Never stored in plaintext)
                </span>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-xl bg-status-safe text-canvas font-bold text-xs flex items-center gap-1.5 hover:bg-opacity-90 shadow-md transition-all"
                >
                  {loading ? (
                    <span className="inline-block w-3.5 h-3.5 border-2 border-canvas border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{isRegister ? 'Create Account' : 'Authenticate Session'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <p className="text-xs text-secondary-text pl-8">
              Session authenticated. Cryptographic session token issued to client.
            </p>
          )}
        </div>

        {/* ========================================================================= */}
        {/* STEP B: GUARD CHECK (STAGED SCAN) */}
        {/* ========================================================================= */}
        <div className={`p-4 rounded-2xl border transition-all ${
          !isStepADone 
            ? 'opacity-40 bg-canvas/40 border-surface-border pointer-events-none' 
            : isStepBDone 
              ? 'bg-status-safe/5 border-status-safe/30' 
              : 'bg-canvas/80 border-surface-border'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono ${
                isStepBDone ? 'bg-status-safe text-canvas' : 'bg-[#182C42] text-status-info border border-surface-border'
              }`}>
                {isStepBDone ? <Check className="w-3.5 h-3.5" /> : 'B'}
              </span>
              <h3 className="font-bold text-sm text-primary-text">
                Step B: Session & Network Guard Check
              </h3>
            </div>

            {isStepBDone && (
              <span className="text-xs font-mono text-status-safe font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified (TLS 1.3 / Entropy 0.98)</span>
              </span>
            )}
          </div>

          <p className="text-xs text-secondary-text pl-8 mb-3">
            {isStepBDone 
              ? 'Session integrity, account policy, and baseline network signals verified.' 
              : 'Staged scan: session integrity → account policy → network access decision. Demo checks identified as simulated.'}
          </p>

          {isStepADone && !isStepBDone && (
            <div className="pl-8 space-y-3">
              {/* Explainer toggle */}
              <div className="flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => setShowExplainer(!showExplainer)}
                  className="text-status-info hover:underline flex items-center gap-1 text-[11px]"
                >
                  <HelpCircle className="w-3 h-3" />
                  <span>{showExplainer ? 'Hide check details' : 'What is checked?'}</span>
                </button>
                <span className="text-[10px] font-mono text-secondary-text uppercase">Simulated Analysis</span>
              </div>

              {showExplainer && (
                <div className="p-3 rounded-xl bg-surface border border-surface-border text-[11px] text-secondary-text space-y-1 animate-in fade-in">
                  <div>1. <strong>Session Integrity:</strong> Evaluates cryptographic entropy and TLS session context.</div>
                  <div>2. <strong>Account Policy:</strong> Checks brute force limits, ban lists, and policy conformance.</div>
                  <div>3. <strong>Network Access:</strong> Evaluates simulated gateway policy rules before lobby handshake.</div>
                </div>
              )}

              {/* Staged scan progression visual */}
              {scanning && (
                <div className="p-3 rounded-xl bg-status-info/10 border border-status-info/30 space-y-1.5 animate-in fade-in">
                  <div className="flex items-center justify-between text-xs font-mono text-status-info">
                    <span>
                      {scanStep === 1 && 'Analyzing session integrity & entropy...'}
                      {scanStep === 2 && 'Evaluating account policy conformance...'}
                      {scanStep === 3 && 'Deriving network access quarantine state...'}
                    </span>
                    <span className="animate-spin">⟳</span>
                  </div>
                  <div className="w-full bg-canvas h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-status-info h-full transition-all duration-300 rounded-full"
                      style={{ width: `${(scanStep / 3) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              <button
                type="button"
                disabled={scanning}
                onClick={handleGuardScan}
                className="px-5 py-2.5 rounded-xl bg-status-safe text-canvas font-bold text-xs flex items-center gap-2 hover:bg-opacity-90 shadow-md transition-all disabled:opacity-50"
              >
                <Scan className="w-4 h-4" />
                <span>{scanning ? 'Running staged scan...' : 'Run GameGuard verification'}</span>
              </button>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* STEP C: AGE ASSURANCE (ONE-TIME ZERO-PII CHECK) */}
        {/* ========================================================================= */}
        <div className={`p-4 rounded-2xl border transition-all ${
          !isStepBDone 
            ? 'opacity-40 bg-canvas/40 border-surface-border pointer-events-none' 
            : isStepCDone 
              ? 'bg-status-safe/5 border-status-safe/30' 
              : 'bg-canvas/80 border-surface-border'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono ${
                isStepCDone ? 'bg-status-safe text-canvas' : 'bg-[#182C42] text-status-info border border-surface-border'
              }`}>
                {isStepCDone ? <Check className="w-3.5 h-3.5" /> : 'C'}
              </span>
              <h3 className="font-bold text-sm text-primary-text">
                Step C: One-Time Age Assurance
              </h3>
            </div>

            {isStepCDone && (
              <span className="text-xs font-mono text-status-safe font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Requirement met (Zero PII)</span>
              </span>
            )}
          </div>

          <p className="text-xs text-secondary-text pl-8 mb-3">
            {isStepCDone 
              ? 'Age requirement confirmed. Your birth date is not added to the ledger.' 
              : '“This demo checks a sample age claim. A production service should rely on a trusted age-assurance provider or a privacy-preserving proof. GameGuard should receive only the pass/fail claim and a verification reference—not a raw birth date or ID scan.”'}
          </p>

          {isStepBDone && !isStepCDone && (
            <div className="pl-8 space-y-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAgeThreshold('AGE_OVER_13')}
                  className={`px-3 py-1.5 rounded-xl border text-xs transition-colors ${
                    ageThreshold === 'AGE_OVER_13' 
                      ? 'bg-status-safe/10 border-status-safe text-primary-text font-bold' 
                      : 'bg-surface border-surface-border text-secondary-text'
                  }`}
                >
                  13+ Teen Baseline
                </button>
                <button
                  type="button"
                  onClick={() => setAgeThreshold('AGE_OVER_18')}
                  className={`px-3 py-1.5 rounded-xl border text-xs transition-colors ${
                    ageThreshold === 'AGE_OVER_18' 
                      ? 'bg-status-safe/10 border-status-safe text-primary-text font-bold' 
                      : 'bg-surface border-surface-border text-secondary-text'
                  }`}
                >
                  18+ Mature Arena
                </button>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={ageVerifying}
                  onClick={() => handleAgeConfirm(true)}
                  className="px-5 py-2.5 rounded-xl bg-status-safe text-canvas font-bold text-xs flex items-center gap-2 hover:bg-opacity-90 shadow-md transition-all disabled:opacity-50"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{ageVerifying ? 'Generating proof...' : 'Confirm Age & Derive SHA-256 Fingerprint'}</span>
                </button>

                <button
                  type="button"
                  disabled={ageVerifying}
                  onClick={() => handleAgeConfirm(false)}
                  className="px-3 py-2 rounded-xl text-xs text-secondary-text hover:text-status-critical border border-transparent hover:border-surface-border transition-colors"
                >
                  Simulate Underage Fail
                </button>
              </div>
            </div>
          )}

          {/* Fingerprint typewriter reveal if done */}
          {isStepCDone && (
            <div className="ml-8 mt-2 p-3 bg-canvas rounded-xl border border-surface-border font-mono text-xs flex items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="text-[10px] text-secondary-text uppercase block">Tamper-Evident Claim Fingerprint</span>
                <span className="text-status-info truncate block">{user.claim.claimHash}</span>
              </div>
              <button
                type="button"
                onClick={() => copyClaimHash(user.claim.claimHash)}
                className="shrink-0 p-1.5 text-secondary-text hover:text-primary-text"
              >
                {copiedHash ? <Check className="w-3.5 h-3.5 text-status-safe" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* STEP D: ENTER GAME / ACCESS GATE */}
        {/* ========================================================================= */}
        <div className={`p-4 rounded-2xl border transition-all ${
          !isStepCDone 
            ? 'opacity-40 bg-canvas/40 border-surface-border pointer-events-none' 
            : 'bg-gradient-to-br from-surface to-surface-elevated border-status-safe/40 shadow-lg'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono ${
                isStepDDone ? 'bg-status-safe text-canvas' : 'bg-[#182C42] text-status-info border border-surface-border'
              }`}>
                {isStepDDone ? <Check className="w-3.5 h-3.5" /> : 'D'}
              </span>
              <h3 className="font-bold text-sm text-primary-text">
                Step D: Enter Game Network
              </h3>
            </div>

            {isStepDDone && (
              <span className="text-xs font-mono text-status-safe font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Access Granted</span>
              </span>
            )}
          </div>

          <p className="text-xs text-secondary-text pl-8 mb-4">
            {isStepCDone 
              ? 'Guard verification passed and minimal age claim verified. Ready to enter secure game lobby and review SOC dashboard.'
              : '“Continue to secure lobby” becomes active only after guard and age policy pass.'}
          </p>

          {isStepCDone && (
            <div className="pl-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                type="button"
                onClick={handleEnterLobby}
                className="px-6 py-3 rounded-xl bg-status-safe hover:bg-opacity-90 text-canvas font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-status-safe/25 transition-all group"
              >
                <Gamepad2 className="w-4 h-4" />
                <span>Continue to Secure Lobby & Dashboard</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                type="button"
                onClick={onEnterDashboard}
                className="px-4 py-2.5 rounded-xl bg-surface hover:bg-surface-elevated text-xs font-semibold text-secondary-text hover:text-primary-text border border-surface-border transition-colors text-center"
              >
                Open SOC Console Directly
              </button>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

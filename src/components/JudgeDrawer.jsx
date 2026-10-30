// frontend/src/components/JudgeDrawer.jsx
import React, { useState } from 'react';
import { useGameGuard } from '../context/GameGuardContext';
import { api } from '../utils/api';
import { 
  X, 
  Sliders, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Code2, 
  Database, 
  PlayCircle, 
  Download, 
  RotateCcw, 
  Copy, 
  Check, 
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

export default function JudgeDrawer({ isOpen, onClose, onOpenContractModal }) {
  const { 
    workflowStages, 
    ledgerReceipts, 
    handleSimulateScenario, 
    handleResetDemo, 
    handleLogin,
    handleRunGuardCheck,
    handleVerifyAge,
    handleRequestAccess,
    setGameLobbyOpen,
    user
  } = useGameGuard();

  const [activeTab, setActiveTab] = useState('scenarios'); 
  // 'scenarios' | 'workflow' | 'ledger' | 'minimization' | 'script'
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [resetting, setResetting] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [scenarioRunning, setScenarioRunning] = useState(false);
  const [scenarioFeedback, setScenarioFeedback] = useState('');

  if (!isOpen) return null;

  // 1-Click Scenario Execution
  const runScenario = async (key) => {
    setScenarioRunning(true);
    setScenarioFeedback('');
    try {
      if (key === 'happy_path') {
        setScenarioFeedback('Executing Full Happy Path...');
        // 1. Login/Create Demo Account
        const rand = Math.floor(100 + Math.random() * 900);
        await handleLogin(`judge_player_${rand}@gameguard.demo`, 'DemoPassword2026!');
        // 2. Run Guard Check
        await handleRunGuardCheck();
        // 3. Age Assurance Over 13
        await handleVerifyAge(true, 'AGE_OVER_13');
        // 4. Request Access
        await handleRequestAccess();
        // 5. Open Lobby
        setGameLobbyOpen(true);
        setScenarioFeedback('Happy Path Completed! Guard passed, age verified, game lobby open.');
      } else if (key === 'age_check_fails') {
        if (!user) {
          await handleLogin('test_player@gameguard.demo', 'DemoPassword2026!');
          await handleRunGuardCheck();
        }
        await handleVerifyAge(false, 'AGE_OVER_13');
        setScenarioFeedback('Age Check Failed scenario executed. Claim rejected, access gate locked.');
      } else {
        const res = await handleSimulateScenario(key);
        setScenarioFeedback(`Scenario executed: ${key}. ${res.policyResponse?.actionTaken || ''}`);
      }
    } catch (err) {
      setScenarioFeedback(`Scenario failed: ${err.message}`);
    } finally {
      setScenarioRunning(false);
    }
  };

  const confirmReset = async () => {
    setResetting(true);
    await handleResetDemo();
    setResetting(false);
    setResetConfirm(false);
    setScenarioFeedback('Demo data reset to baseline.');
  };

  const handleCopyReceipt = (rec) => {
    navigator.clipboard.writeText(JSON.stringify(rec, null, 2));
    setCopiedId(rec.receiptId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportJson = () => {
    window.open(api.getExportUrl(), '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-canvas/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-surface border-l border-surface-border h-full flex flex-col shadow-2xl relative animate-in slide-in-from-right duration-300">
        
        {/* Drawer Header */}
        <div className="p-5 border-b border-surface-border flex items-center justify-between bg-canvas/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-status-info/10 border border-status-info/30 flex items-center justify-center text-status-info">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-primary-text flex items-center gap-2">
                <span>Judge Mode & Inspector Drawer</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface border border-surface-border text-status-info">
                  Round 2
                </span>
              </h3>
              <p className="text-xs text-secondary-text">
                Live verification, scenario replay, and data minimization audit
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-secondary-text hover:text-primary-text hover:bg-canvas transition-colors"
            aria-label="Close Judge Drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 p-2 bg-canvas border-b border-surface-border overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('scenarios')}
            className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-colors ${
              activeTab === 'scenarios' ? 'bg-surface text-status-info shadow-sm' : 'text-secondary-text hover:text-primary-text'
            }`}
          >
            Scenario Simulator
          </button>
          <button
            onClick={() => setActiveTab('workflow')}
            className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-colors ${
              activeTab === 'workflow' ? 'bg-surface text-status-safe shadow-sm' : 'text-secondary-text hover:text-primary-text'
            }`}
          >
            Live Workflow
          </button>
          <button
            onClick={() => setActiveTab('ledger')}
            className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-colors ${
              activeTab === 'ledger' ? 'bg-surface text-primary-text shadow-sm' : 'text-secondary-text hover:text-primary-text'
            }`}
          >
            Receipt Viewer
          </button>
          <button
            onClick={() => setActiveTab('minimization')}
            className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-colors ${
              activeTab === 'minimization' ? 'bg-surface text-status-caution shadow-sm' : 'text-secondary-text hover:text-primary-text'
            }`}
          >
            Data Minimization
          </button>
          <button
            onClick={() => setActiveTab('script')}
            className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-colors ${
              activeTab === 'script' ? 'bg-surface text-primary-text shadow-sm' : 'text-secondary-text hover:text-primary-text'
            }`}
          >
            2-Min Demo Script
          </button>
        </div>

        {/* Feedback Banner */}
        {scenarioFeedback && (
          <div className="p-3 bg-status-info/10 border-b border-status-info/20 text-xs text-status-info flex items-center justify-between animate-in fade-in">
            <span>{scenarioFeedback}</span>
            <button onClick={() => setScenarioFeedback('')} className="p-1 hover:text-primary-text">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB 1: SCENARIO SIMULATOR (1-Click Buttons) */}
          {activeTab === 'scenarios' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-canvas border border-surface-border">
                <span className="text-xs font-bold text-primary-text block mb-1">
                  1-Click Test Scenarios for Judges
                </span>
                <p className="text-xs text-secondary-text leading-relaxed">
                  Test every critical flow specified in the prompt without needing manual setup.
                </p>
              </div>

              <div className="space-y-2.5">
                
                {/* 1. Happy Path */}
                <button
                  type="button"
                  disabled={scenarioRunning}
                  onClick={() => runScenario('happy_path')}
                  className="w-full p-3.5 rounded-xl bg-surface hover:bg-surface-elevated border border-status-safe/40 text-left flex items-center justify-between group transition-all"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-status-safe" />
                      <span className="text-xs font-bold text-primary-text">Happy Path Flow</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-status-safe/10 text-status-safe">E2E</span>
                    </div>
                    <p className="text-[11px] text-secondary-text mt-1">
                      Login → Guard pass → Age assurance pass → Hash derived → Lobby unlocked
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-secondary-text group-hover:text-status-safe group-hover:translate-x-1 transition-all" />
                </button>

                {/* 2. Age Check Fails */}
                <button
                  type="button"
                  disabled={scenarioRunning}
                  onClick={() => runScenario('age_check_fails')}
                  className="w-full p-3.5 rounded-xl bg-surface hover:bg-surface-elevated border border-surface-border text-left flex items-center justify-between group transition-all"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-status-caution" />
                      <span className="text-xs font-bold text-primary-text">Age Check Fails</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-status-caution/10 text-status-caution">Under 13</span>
                    </div>
                    <p className="text-[11px] text-secondary-text mt-1">
                      Simulate under-threshold failure; verifies that game access is denied
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-secondary-text group-hover:text-status-caution group-hover:translate-x-1 transition-all" />
                </button>

                {/* 3. Repeated Login Failures */}
                <button
                  type="button"
                  disabled={scenarioRunning}
                  onClick={() => runScenario('repeated_login_failures')}
                  className="w-full p-3.5 rounded-xl bg-surface hover:bg-surface-elevated border border-surface-border text-left flex items-center justify-between group transition-all"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-status-critical" />
                      <span className="text-xs font-bold text-primary-text">Repeated Login Failures</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-status-critical/10 text-status-critical">Brute Force</span>
                    </div>
                    <p className="text-[11px] text-secondary-text mt-1">
                      Simulate 5 bad password attempts; triggers high-risk alert & locks demo access
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-secondary-text group-hover:text-status-critical group-hover:translate-x-1 transition-all" />
                </button>

                {/* 4. Unusual Request Burst */}
                <button
                  type="button"
                  disabled={scenarioRunning}
                  onClick={() => runScenario('unusual_request_burst')}
                  className="w-full p-3.5 rounded-xl bg-surface hover:bg-surface-elevated border border-surface-border text-left flex items-center justify-between group transition-all"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-status-caution" />
                      <span className="text-xs font-bold text-primary-text">Unusual Request Burst</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-status-caution/10 text-status-caution">Rate Anomaly</span>
                    </div>
                    <p className="text-[11px] text-secondary-text mt-1">
                      Simulates 140 rps burst; verifies warning & rate throttle in timeline
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-secondary-text group-hover:text-status-caution group-hover:translate-x-1 transition-all" />
                </button>

                {/* 5. Revoked Claim */}
                <button
                  type="button"
                  disabled={scenarioRunning}
                  onClick={() => runScenario('revoked_claim')}
                  className="w-full p-3.5 rounded-xl bg-surface hover:bg-surface-elevated border border-surface-border text-left flex items-center justify-between group transition-all"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-status-critical" />
                      <span className="text-xs font-bold text-primary-text">Revoked Claim</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-status-critical/10 text-status-critical">On-Chain Policy</span>
                    </div>
                    <p className="text-[11px] text-secondary-text mt-1">
                      Marks claim as revoked in ledger; instantly terminates network access
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-secondary-text group-hover:text-status-critical group-hover:translate-x-1 transition-all" />
                </button>

                {/* 6. Claim Fingerprint Mismatch */}
                <button
                  type="button"
                  disabled={scenarioRunning}
                  onClick={() => runScenario('claim_mismatch')}
                  className="w-full p-3.5 rounded-xl bg-surface hover:bg-surface-elevated border border-surface-border text-left flex items-center justify-between group transition-all"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-status-critical" />
                      <span className="text-xs font-bold text-primary-text">Claim Fingerprint Mismatch</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-status-critical/10 text-status-critical">Tamper Test</span>
                    </div>
                    <p className="text-[11px] text-secondary-text mt-1">
                      Alters hash bits; verifies cryptographic mismatch detection in audit log
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-secondary-text group-hover:text-status-critical group-hover:translate-x-1 transition-all" />
                </button>

              </div>
            </div>
          )}

          {/* TAB 2: LIVE WORKFLOW STATUS */}
          {activeTab === 'workflow' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-canvas border border-surface-border">
                <span className="text-xs font-bold text-primary-text block mb-1">
                  Live Workflow State Monitor
                </span>
                <p className="text-xs text-secondary-text">
                  Shows each step as Pending / Passed / Failed with timestamps and reason.
                </p>
              </div>

              <div className="space-y-3">
                {Object.entries(workflowStages).map(([key, st]) => {
                  const isPassed = st.status === 'passed';
                  const isFailed = st.status === 'failed';
                  return (
                    <div
                      key={key}
                      className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 ${
                        isPassed 
                          ? 'bg-status-safe/5 border-status-safe/25' 
                          : isFailed 
                            ? 'bg-status-critical/5 border-status-critical/30' 
                            : 'bg-canvas/50 border-surface-border opacity-70'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-primary-text">{st.name}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase border ${
                            isPassed 
                              ? 'bg-status-safe/10 text-status-safe border-status-safe/30' 
                              : isFailed 
                                ? 'bg-status-critical/10 text-status-critical border-status-critical/30' 
                                : 'bg-surface text-secondary-text border-surface-border'
                          }`}>
                            {st.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-secondary-text mt-1">
                          {st.reason}
                        </p>
                      </div>

                      {st.timestamp && (
                        <span className="text-[10px] font-mono text-secondary-text shrink-0 mt-0.5">
                          {st.timestamp}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: RECEIPT VIEWER */}
          {activeTab === 'ledger' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-primary-text">Ledger Proof Receipts</h4>
                  <p className="text-[11px] text-secondary-text">Inspect raw cryptographic receipts</p>
                </div>
                <button
                  type="button"
                  onClick={handleExportJson}
                  className="px-3 py-1.5 rounded-lg bg-surface-elevated hover:bg-surface-border text-xs font-semibold text-status-info border border-surface-border flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Snapshot</span>
                </button>
              </div>

              {ledgerReceipts.length === 0 ? (
                <div className="p-8 text-center text-xs text-secondary-text bg-canvas rounded-xl border border-surface-border">
                  No receipts registered yet. Run age assurance to create proof receipts.
                </div>
              ) : (
                <div className="space-y-3">
                  {ledgerReceipts.map((rec) => (
                    <div
                      key={rec.receiptId}
                      className="p-3.5 rounded-xl bg-canvas border border-surface-border font-mono text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-primary-text">{rec.receiptId}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] px-2 py-0.5 rounded bg-surface border border-surface-border text-status-info">
                            {rec.source || 'local demo / chain ready'}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyReceipt(rec)}
                            className="text-secondary-text hover:text-primary-text"
                          >
                            {copiedId === rec.receiptId ? <Check className="w-3.5 h-3.5 text-status-safe" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div className="text-[11px] text-secondary-text space-y-1">
                        <div><span className="text-primary-text">claimHash:</span> {rec.claimHash}</div>
                        <div><span className="text-primary-text">policyVersion:</span> v{rec.policyVersion}</div>
                        <div><span className="text-primary-text">status:</span> {rec.status}</div>
                        <div><span className="text-primary-text">timestamp:</span> {rec.timestamp}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: DATA MINIMIZATION AUDIT */}
          {activeTab === 'minimization' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-canvas border border-surface-border">
                <span className="text-xs font-bold text-primary-text block mb-1">
                  Data Minimization Guarantee
                </span>
                <p className="text-xs text-secondary-text">
                  Non-negotiable product rule: sensitive data is NEVER written to the public ledger or blockchain.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Stored Fields */}
                <div className="p-4 rounded-xl bg-status-safe/5 border border-status-safe/20">
                  <div className="flex items-center gap-2 mb-3 text-status-safe font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Stored in Public Ledger</span>
                  </div>
                  <ul className="text-xs space-y-2 text-primary-text font-mono">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-status-safe" />
                      receiptId (Random UUID)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-status-safe" />
                      claimHash (SHA-256)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-status-safe" />
                      policyVersion (uint32)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-status-safe" />
                      status (verified/revoked)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-status-safe" />
                      timestamp (ISO 8601)
                    </li>
                  </ul>
                </div>

                {/* Never Stored Fields */}
                <div className="p-4 rounded-xl bg-status-critical/5 border border-status-critical/20">
                  <div className="flex items-center gap-2 mb-3 text-status-critical font-bold text-xs">
                    <X className="w-4 h-4" />
                    <span>NEVER Stored Anywhere</span>
                  </div>
                  <ul className="text-xs space-y-2 text-primary-text font-mono">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-status-critical" />
                      Raw Date of Birth (DOB)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-status-critical" />
                      Government ID Images / Scans
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-status-critical" />
                      Plaintext Passwords
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-status-critical" />
                      Real Legal Names
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-status-critical" />
                      Raw Private Keys
                    </li>
                  </ul>
                </div>

              </div>

              {/* Reset Demo Data Control */}
              <div className="p-4 rounded-xl bg-canvas border border-surface-border">
                <span className="text-xs font-bold text-primary-text block mb-1">
                  Reset Demo Data
                </span>
                <p className="text-xs text-secondary-text mb-3">
                  Restores in-memory player sessions, resets the ledger file, and clears local tour storage.
                </p>

                {resetConfirm ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={resetting}
                      onClick={confirmReset}
                      className="px-4 py-2 rounded-xl bg-status-critical text-canvas font-bold text-xs flex items-center gap-1.5"
                    >
                      <span>Yes, Confirm Reset</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setResetConfirm(false)}
                      className="px-4 py-2 rounded-xl bg-surface-elevated text-secondary-text hover:text-primary-text text-xs font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setResetConfirm(true)}
                    className="px-4 py-2 rounded-xl bg-surface-elevated hover:bg-surface-border text-status-critical border border-status-critical/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset All Demo Data</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: 2-MINUTE JUDGE DEMO SCRIPT */}
          {activeTab === 'script' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-canvas border border-surface-border">
                <span className="text-xs font-bold text-primary-text block mb-1">
                  Round 2 Demo Script — About 2 Minutes
                </span>
                <p className="text-xs text-secondary-text">
                  Follow this structured presentation flow matching Page 7 of the specification.
                </p>
              </div>

              <div className="space-y-3 text-xs">
                
                <div className="p-3 rounded-xl bg-canvas/70 border border-surface-border">
                  <div className="flex items-center justify-between text-[11px] font-mono text-status-info mb-1">
                    <span>0:00 – 0:20</span>
                    <span>Landing page and login</span>
                  </div>
                  <p className="text-primary-text italic font-medium">
                    “GameGuard places a clear security checkpoint before the game opens.”
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-canvas/70 border border-surface-border">
                  <div className="flex items-center justify-between text-[11px] font-mono text-status-info mb-1">
                    <span>0:20 – 0:40</span>
                    <span>Run guard check</span>
                  </div>
                  <p className="text-primary-text italic font-medium">
                    “We check session and policy signals, and explain the result in plain language.”
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-canvas/70 border border-surface-border">
                  <div className="flex items-center justify-between text-[11px] font-mono text-status-info mb-1">
                    <span>0:40 – 1:00</span>
                    <span>One-time age assurance</span>
                  </div>
                  <p className="text-primary-text italic font-medium">
                    “The demo keeps the age result, not the raw date of birth, in its proof record.”
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-canvas/70 border border-surface-border">
                  <div className="flex items-center justify-between text-[11px] font-mono text-status-info mb-1">
                    <span>1:00 – 1:20</span>
                    <span>Fingerprint and ledger</span>
                  </div>
                  <p className="text-primary-text italic font-medium">
                    “This SHA-256 fingerprint helps identify a claim receipt. It is not encryption and not a zero-knowledge proof.”
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-canvas/70 border border-surface-border">
                  <div className="flex items-center justify-between text-[11px] font-mono text-status-info mb-1">
                    <span>1:20 – 1:40</span>
                    <span>Open lobby, trigger anomaly</span>
                  </div>
                  <p className="text-primary-text italic font-medium">
                    “A suspicious event updates the policy decision and timeline. This browser demo simulates a gateway response.”
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-canvas/70 border border-surface-border">
                  <div className="flex items-center justify-between text-[11px] font-mono text-status-info mb-1">
                    <span>1:40 – 2:00</span>
                    <span>Contract inspector and boundaries</span>
                  </div>
                  <p className="text-primary-text italic font-medium">
                    “The Solidity contract is designed to anchor minimal claims. Real chain, age provider, and gateway deployment are separate integration steps.”
                  </p>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* Drawer Footer Controls */}
        <div className="p-4 border-t border-surface-border bg-canvas/50 flex items-center justify-between">
          <button
            type="button"
            onClick={onOpenContractModal}
            className="px-3.5 py-2 rounded-xl bg-surface-elevated hover:bg-surface-border text-xs font-semibold text-status-info border border-surface-border flex items-center gap-1.5 transition-colors"
          >
            <Code2 className="w-4 h-4" />
            <span>Open Solidity Inspector</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-surface-elevated hover:bg-surface-border text-xs font-semibold text-primary-text"
          >
            Close Drawer
          </button>
        </div>

      </div>
    </div>
  );
}

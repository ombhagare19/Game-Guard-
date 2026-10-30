// frontend/src/components/GuardCheckModal.jsx
import React, { useState, useEffect } from 'react';
import { useGameGuard } from '../context/GameGuardContext';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Scan, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  X, 
  ArrowRight,
  Activity
} from 'lucide-react';

export default function GuardCheckModal({ isOpen, onClose }) {
  const { handleRunGuardCheck, user } = useGameGuard();

  const [scanning, setScanning] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [scanResult, setScanResult] = useState(null);
  const [showExplainer, setShowExplainer] = useState(false);

  const steps = [
    { id: 1, label: 'Session Integrity', desc: 'Validating cryptographic session entropy and TLS context' },
    { id: 2, label: 'Account Policy Conformance', desc: 'Checking rate limits, active bans, and credential flags' },
    { id: 3, label: 'Network Access Decision', desc: 'Deriving risk score and network quarantine state' }
  ];

  const handleStartScan = async () => {
    setScanning(true);
    setCurrentStepIndex(0);
    setScanResult(null);

    // Staged progression animation (160ms - 320ms per stage)
    setTimeout(() => setCurrentStepIndex(1), 350);
    setTimeout(() => setCurrentStepIndex(2), 700);

    try {
      const res = await handleRunGuardCheck();
      setTimeout(() => {
        setScanning(false);
        setScanResult(res);
      }, 1050);
    } catch (err) {
      setTimeout(() => {
        setScanning(false);
        setScanResult({
          decision: 'review',
          reason: err.message || 'Security review required.',
          stagedSteps: []
        });
      }, 1050);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setScanResult(null);
      setCurrentStepIndex(0);
      setScanning(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-canvas/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-surface border border-surface-border rounded-2xl p-6 sm:p-8 shadow-2xl relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-secondary-text hover:text-primary-text hover:bg-canvas transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#182C42] border border-surface-border flex items-center justify-center">
            <Scan className="w-5 h-5 text-status-info" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-primary-text">
              GameGuard Verification Checkpoint
            </h3>
            <p className="text-xs text-secondary-text">
              Staged session & policy integrity evaluation
            </p>
          </div>
        </div>

        {/* Explainer Accordion / Flyout */}
        <div className="mb-6 bg-canvas/60 border border-surface-border rounded-xl p-3">
          <button
            type="button"
            onClick={() => setShowExplainer(!showExplainer)}
            className="w-full flex items-center justify-between text-xs text-status-info font-medium hover:underline"
          >
            <span className="flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5" />
              What is checked during this scan?
            </span>
            <span className="text-[10px] uppercase font-mono">{showExplainer ? 'Hide' : 'Explain'}</span>
          </button>
          
          {showExplainer && (
            <div className="mt-3 pt-3 border-t border-surface-border text-xs text-secondary-text space-y-2 animate-in fade-in">
              <p>
                <strong className="text-primary-text">1. Session Integrity:</strong> Verifies token randomness, entropy, and cryptographic signature to prevent session hijacking.
              </p>
              <p>
                <strong className="text-primary-text">2. Account Policy:</strong> Evaluates recent anomaly events, login velocity, and administrative security thresholds.
              </p>
              <p>
                <strong className="text-primary-text">3. Network Access Decision:</strong> Assigns quarantine or trusted gaming node status for multiplayer gateway entry.
              </p>
              <p className="text-[11px] text-secondary-text italic pt-1">
                Notice: All checks in this prototype run against the GameGuard network policy simulator without invoking OS-level firewall hooks.
              </p>
            </div>
          )}
        </div>

        {/* Active Scan or Idle State */}
        {!scanResult && (
          <div className="space-y-4 mb-6">
            {steps.map((st, idx) => {
              const isCurrent = scanning && currentStepIndex === idx;
              const isDone = scanning && currentStepIndex > idx;
              return (
                <div 
                  key={st.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isCurrent 
                      ? 'bg-status-info/10 border-status-info/40 shadow-sm' 
                      : isDone 
                        ? 'bg-status-safe/10 border-status-safe/30' 
                        : 'bg-canvas/50 border-surface-border opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-primary-text flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#182C42] border border-surface-border flex items-center justify-center text-[10px] font-mono">
                        {st.id}
                      </span>
                      {st.label}
                    </span>
                    {isDone && <CheckCircle2 className="w-4 h-4 text-status-safe" />}
                    {isCurrent && (
                      <span className="text-[11px] font-mono text-status-info animate-pulse">
                        Analyzing...
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-secondary-text mt-1 pl-7">
                    {st.desc}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* Scan Result State */}
        {scanResult && (
          <div className="mb-6 p-4 rounded-xl bg-canvas border border-surface-border">
            <div className="flex items-start gap-3">
              {scanResult.decision === 'passed' ? (
                <div className="w-9 h-9 rounded-xl bg-status-safe/10 border border-status-safe/30 flex items-center justify-center text-status-safe shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-xl bg-status-caution/10 border border-status-caution/30 flex items-center justify-center text-status-caution shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
              )}
              <div>
                <h4 className="font-bold text-sm text-primary-text flex items-center gap-2">
                  <span>Result: {scanResult.decision.toUpperCase()}</span>
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-surface border border-surface-border text-secondary-text">
                    Simulated
                  </span>
                </h4>
                <p className="text-xs text-secondary-text mt-1">
                  {scanResult.reason}
                </p>
                {scanResult.ruleIds && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {scanResult.ruleIds.map(r => (
                      <span key={r} className="text-[10px] font-mono px-2 py-0.5 bg-surface rounded text-status-info border border-surface-border">
                        {r}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface-border">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-secondary-text hover:text-primary-text hover:bg-canvas transition-colors"
          >
            {scanResult ? 'Done' : 'Cancel'}
          </button>

          {!scanResult ? (
            <button
              type="button"
              disabled={scanning}
              onClick={handleStartScan}
              className="px-5 py-2.5 rounded-xl bg-status-safe text-canvas font-bold text-xs flex items-center gap-2 hover:bg-opacity-90 shadow-lg shadow-status-safe/20 transition-all disabled:opacity-50"
            >
              {scanning ? (
                <>
                  <span className="inline-block w-3.5 h-3.5 border-2 border-canvas border-t-transparent rounded-full animate-spin" />
                  <span>Checking session & device…</span>
                </>
              ) : (
                <>
                  <span>Run GameGuard verification</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-status-safe text-canvas font-bold text-xs hover:bg-opacity-90 transition-all"
            >
              Continue Workflow
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

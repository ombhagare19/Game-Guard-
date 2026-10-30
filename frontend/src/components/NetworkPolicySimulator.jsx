// frontend/src/components/NetworkPolicySimulator.jsx
import React, { useState } from 'react';
import { useGameGuard } from '../context/GameGuardContext';
import { 
  ShieldAlert, 
  SlidersHorizontal, 
  Flame, 
  Zap, 
  Ban, 
  Check, 
  AlertOctagon, 
  ShieldCheck, 
  X,
  Info,
  Server
} from 'lucide-react';

export default function NetworkPolicySimulator({ isOpen, onClose }) {
  const { user, handleSimulateScenario } = useGameGuard();

  const [activeScenario, setActiveScenario] = useState(null);
  const [responseDetails, setResponseDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleRunPreset = async (scenarioKey) => {
    setLoading(true);
    setActiveScenario(scenarioKey);
    try {
      const res = await handleSimulateScenario(scenarioKey);
      setResponseDetails(res.policyResponse);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-canvas/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-surface border border-surface-border rounded-2xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-secondary-text hover:text-primary-text hover:bg-canvas transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-status-caution/10 border border-status-caution/30 flex items-center justify-center text-status-caution">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-primary-text">
              GameGuard Network Policy Simulator
            </h3>
            <p className="text-xs text-secondary-text">
              Policy Rule Evaluation & Threat Simulation Engine
            </p>
          </div>
        </div>

        {/* Mandatory Honest Security Boundary Callout */}
        <div className="mb-6 p-4 rounded-xl bg-status-caution/10 border border-status-caution/20 text-xs text-primary-text flex items-start gap-3">
          <Info className="w-4 h-4 text-status-caution shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block mb-1 text-status-caution">
              HONEST SECURITY BOUNDARY
            </span>
            <p className="text-secondary-text leading-relaxed">
              A web prototype can demonstrate policy decisions and log events, but it cannot reliably block all device or operating-system network traffic on its own. This panel is labeled “GameGuard network policy simulator” until a real gateway, anti-cheat SDK, or platform-level integration is implemented.
            </p>
          </div>
        </div>

        {/* Three Rule Groups */}
        <div className="space-y-4 mb-6">
          
          {/* Rule Group 1: Account Integrity */}
          <div className="p-4 rounded-xl bg-canvas border border-surface-border">
            <h4 className="text-xs font-bold text-primary-text uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Rule Group 1: Account Integrity</span>
              <span className="text-[10px] font-mono text-secondary-text">New device • Failed logins</span>
            </h4>
            <p className="text-[11px] text-secondary-text mb-3">
              Detects brute-force credential attacks, stolen session keys, and anomalous IP migrations.
            </p>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleRunPreset('repeated_login_failures')}
              className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-colors ${
                activeScenario === 'repeated_login_failures'
                  ? 'bg-status-critical/10 border-status-critical text-status-critical font-bold'
                  : 'bg-surface hover:bg-surface-elevated border-surface-border text-primary-text'
              }`}
            >
              <span className="flex items-center gap-2 text-xs">
                <Flame className="w-4 h-4 text-status-critical" />
                <span>Simulate: Repeated Login Failures (5 consecutive bad passwords)</span>
              </span>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-status-critical/10 text-status-critical border border-status-critical/30">
                High Risk → Deny
              </span>
            </button>
          </div>

          {/* Rule Group 2: Session Risk */}
          <div className="p-4 rounded-xl bg-canvas border border-surface-border">
            <h4 className="text-xs font-bold text-primary-text uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Rule Group 2: Session Risk</span>
              <span className="text-[10px] font-mono text-secondary-text">Rapid changes • Request bursts</span>
            </h4>
            <p className="text-[11px] text-secondary-text mb-3">
              Monitors websocket ping spikes, packet flood anomalies, and automated bot queries.
            </p>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleRunPreset('unusual_request_burst')}
              className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-colors ${
                activeScenario === 'unusual_request_burst'
                  ? 'bg-status-caution/10 border-status-caution text-status-caution font-bold'
                  : 'bg-surface hover:bg-surface-elevated border-surface-border text-primary-text'
              }`}
            >
              <span className="flex items-center gap-2 text-xs">
                <Zap className="w-4 h-4 text-status-caution" />
                <span>Simulate: Unusual Request Burst (140 req/sec rate anomaly)</span>
              </span>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-status-caution/10 text-status-caution border border-status-caution/30">
                Medium Risk → Review
              </span>
            </button>
          </div>

          {/* Rule Group 3: Access Policy */}
          <div className="p-4 rounded-xl bg-canvas border border-surface-border">
            <h4 className="text-xs font-bold text-primary-text uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Rule Group 3: Access Policy</span>
              <span className="text-[10px] font-mono text-secondary-text">Age claim missing • Revoked session</span>
            </h4>
            <p className="text-[11px] text-secondary-text mb-3">
              Enforces privacy compliance and zero-knowledge claim validation before game server handshake.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                disabled={loading}
                onClick={() => handleRunPreset('missing_age_claim')}
                className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-colors ${
                  activeScenario === 'missing_age_claim'
                    ? 'bg-status-caution/10 border-status-caution text-status-caution font-bold'
                    : 'bg-surface hover:bg-surface-elevated border-surface-border text-primary-text'
                }`}
              >
                <span className="flex items-center gap-2 text-xs">
                  <Ban className="w-4 h-4 text-secondary-text" />
                  <span>Missing Age Claim</span>
                </span>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-status-caution/10 text-status-caution">
                  Deny
                </span>
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => handleRunPreset('normal_session')}
                className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-colors ${
                  activeScenario === 'normal_session'
                    ? 'bg-status-safe/10 border-status-safe text-status-safe font-bold'
                    : 'bg-surface hover:bg-surface-elevated border-surface-border text-primary-text'
                }`}
              >
                <span className="flex items-center gap-2 text-xs">
                  <Check className="w-4 h-4 text-status-safe" />
                  <span>Normal Session (Clean)</span>
                </span>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-status-safe/10 text-status-safe">
                  Low / Allow
                </span>
              </button>
            </div>
          </div>

        </div>

        {/* Simulation Response Feedback Box */}
        {responseDetails && (
          <div className="mb-6 p-4 rounded-xl bg-canvas border border-surface-border animate-in fade-in">
            <h4 className="text-xs font-bold text-primary-text flex items-center gap-2 mb-2">
              <span>Policy Evaluation Response:</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                responseDetails.riskLevel === 'high' 
                  ? 'bg-status-critical/10 text-status-critical border border-status-critical/30' 
                  : responseDetails.riskLevel === 'medium' 
                    ? 'bg-status-caution/10 text-status-caution border border-status-caution/30' 
                    : 'bg-status-safe/10 text-status-safe border border-status-safe/30'
              }`}>
                {responseDetails.decision}
              </span>
            </h4>
            <div className="text-xs text-secondary-text space-y-1">
              <p><strong className="text-primary-text">Action Taken:</strong> {responseDetails.actionTaken}</p>
              <p><strong className="text-primary-text">Explanation:</strong> {responseDetails.explanation}</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end pt-2 border-t border-surface-border">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-surface-elevated hover:bg-surface-border text-xs font-semibold text-primary-text transition-colors"
          >
            Close Simulator
          </button>
        </div>

      </div>
    </div>
  );
}

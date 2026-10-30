// frontend/src/components/Dashboard/ProtectionControlsCard.jsx
import React, { useState } from 'react';
import { useGameGuard } from '../../context/GameGuardContext';
import { 
  ShieldAlert, 
  Flame, 
  LogOut, 
  Ban, 
  Activity, 
  Zap, 
  Check, 
  RotateCcw,
  SlidersHorizontal
} from 'lucide-react';

export default function ProtectionControlsCard({ onOpenSimulator }) {
  const { 
    user, 
    handleSimulateScenario, 
    handleRevokeSession, 
    handleRevokeClaim,
    handleResetDemo 
  } = useGameGuard();

  const [simulating, setSimulating] = useState(false);
  const [successFeedback, setSuccessFeedback] = useState('');

  const triggerPreset = async (scenario, label) => {
    setSimulating(true);
    setSuccessFeedback('');
    try {
      await handleSimulateScenario(scenario);
      setSuccessFeedback(`Triggered: ${label}`);
      setTimeout(() => setSuccessFeedback(''), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="bg-surface border border-surface-border rounded-2xl p-5 shadow-md flex flex-col justify-between">
      <div>
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#182C42] border border-surface-border flex items-center justify-center text-status-caution">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-primary-text">Protection Controls</h3>
              <p className="text-[11px] text-secondary-text">Threat Injection & Revocation</p>
            </div>
          </div>

          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-status-caution/10 text-status-caution border border-status-caution/30">
            Local Sim
          </span>
        </div>

        {/* Quick Simulation Presets */}
        <div className="space-y-2 mb-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={simulating}
              onClick={() => triggerPreset('repeated_login_failures', 'Failed Logins')}
              className="p-2 rounded-xl bg-canvas hover:bg-surface-elevated border border-surface-border text-left transition-colors flex items-center gap-2 group"
            >
              <Flame className="w-3.5 h-3.5 text-status-critical shrink-0" />
              <div className="min-w-0">
                <div className="text-xs font-semibold text-primary-text truncate">Failed Logins</div>
                <div className="text-[10px] text-secondary-text truncate">Repeated failures</div>
              </div>
            </button>

            <button
              type="button"
              disabled={simulating}
              onClick={() => triggerPreset('unusual_request_burst', 'Request Burst')}
              className="p-2 rounded-xl bg-canvas hover:bg-surface-elevated border border-surface-border text-left transition-colors flex items-center gap-2 group"
            >
              <Zap className="w-3.5 h-3.5 text-status-caution shrink-0" />
              <div className="min-w-0">
                <div className="text-xs font-semibold text-primary-text truncate">Request Burst</div>
                <div className="text-[10px] text-secondary-text truncate">Rate anomaly (140 rps)</div>
              </div>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={simulating}
              onClick={() => triggerPreset('missing_age_claim', 'Missing Claim')}
              className="p-2 rounded-xl bg-canvas hover:bg-surface-elevated border border-surface-border text-left transition-colors flex items-center gap-2 group"
            >
              <Ban className="w-3.5 h-3.5 text-secondary-text shrink-0" />
              <div className="min-w-0">
                <div className="text-xs font-semibold text-primary-text truncate">Missing Claim</div>
                <div className="text-[10px] text-secondary-text truncate">Simulate no proof</div>
              </div>
            </button>

            <button
              type="button"
              disabled={simulating}
              onClick={() => triggerPreset('normal_session', 'Normal Session')}
              className="p-2 rounded-xl bg-canvas hover:bg-surface-elevated border border-surface-border text-left transition-colors flex items-center gap-2 group"
            >
              <Check className="w-3.5 h-3.5 text-status-safe shrink-0" />
              <div className="min-w-0">
                <div className="text-xs font-semibold text-primary-text truncate">Normal Session</div>
                <div className="text-[10px] text-secondary-text truncate">Reset baseline low risk</div>
              </div>
            </button>
          </div>
        </div>

        {/* Feedback message */}
        {successFeedback && (
          <div className="p-2 rounded-lg bg-status-info/10 border border-status-info/30 text-[11px] text-status-info font-mono mb-3 text-center animate-in fade-in">
            {successFeedback}
          </div>
        )}

      </div>

      {/* Session Actions: Revoke Session & Full Threat Panel */}
      <div className="flex items-center gap-2 pt-3 border-t border-surface-border">
        <button
          type="button"
          onClick={handleRevokeSession}
          className="w-1/2 py-2 px-3 rounded-xl bg-status-critical/10 hover:bg-status-critical/20 text-status-critical border border-status-critical/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Revoke Session</span>
        </button>

        <button
          type="button"
          onClick={onOpenSimulator}
          className="w-1/2 py-2 px-3 rounded-xl bg-surface-elevated hover:bg-surface-border text-primary-text border border-surface-border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-status-info" />
          <span>Full Simulator</span>
        </button>
      </div>

    </div>
  );
}

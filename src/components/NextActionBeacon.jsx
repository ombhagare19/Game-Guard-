// frontend/src/components/NextActionBeacon.jsx
import React from 'react';
import { useGameGuard } from '../context/GameGuardContext';
import { 
  CheckCircle2, 
  ArrowRight, 
  Lock, 
  ShieldCheck, 
  Key, 
  Gamepad2,
  Sparkles
} from 'lucide-react';

export default function NextActionBeacon({ 
  onRunGuard, 
  onOpenAge, 
  onRequestAccess, 
  onOpenLobby,
  onOpenAuth 
}) {
  const { user, nextStep } = useGameGuard();

  const handleAction = () => {
    switch (nextStep.action) {
      case 'auth':
        if (onOpenAuth) onOpenAuth();
        break;
      case 'guard':
        if (onRunGuard) onRunGuard();
        break;
      case 'age':
        if (onOpenAge) onOpenAge();
        break;
      case 'access':
        if (onRequestAccess) onRequestAccess();
        break;
      case 'lobby':
        if (onOpenLobby) onOpenLobby();
        break;
      default:
        break;
    }
  };

  const stages = [
    { id: 'auth', label: '1. Account Sign-in', done: Boolean(user), unlock: 'Enter credentials or register' },
    { id: 'guard', label: '2. Guard Verification', done: user?.guardStatus === 'verified', unlock: 'Run staged session analysis' },
    { id: 'age', label: '3. Age Assurance', done: user?.claim && user.claim.status === 'verified', unlock: 'Complete one-time zero-PII check' },
    { id: 'access', label: '4. Network Policy Gate', done: user?.networkAccess === 'allowed', unlock: 'Evaluate gateway rules' }
  ];

  return (
    <div className="w-full bg-surface border border-surface-border rounded-2xl p-4 sm:p-5 shadow-lg mb-6 relative overflow-hidden">
      
      {/* Top Banner Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Left: Next Action Context */}
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-status-safe/10 border border-status-safe/30 flex items-center justify-center text-status-safe shrink-0">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-status-safe text-canvas font-bold">
                NEXT STEP
              </span>
              <h3 className="font-bold text-sm sm:text-base text-primary-text">
                {nextStep.label}
              </h3>
            </div>
            <p className="text-xs text-secondary-text mt-0.5">
              {nextStep.description}
            </p>
          </div>
        </div>

        {/* Right: Primary Action Button */}
        <div className="shrink-0 flex items-center gap-3">
          <button
            type="button"
            onClick={handleAction}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-status-safe hover:bg-opacity-90 text-canvas font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-status-safe/25 transition-all group"
          >
            <span>{nextStep.label}</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

      </div>

      {/* Progress Track / Checklist */}
      <div className="mt-4 pt-4 border-t border-surface-border/70 grid grid-cols-2 sm:grid-cols-4 gap-2">
        {stages.map((st) => (
          <div 
            key={st.id} 
            className={`p-2 rounded-lg border text-[11px] transition-colors ${
              st.done 
                ? 'bg-status-safe/5 border-status-safe/20 text-status-safe' 
                : 'bg-canvas/40 border-surface-border text-secondary-text'
            }`}
          >
            <div className="flex items-center gap-1.5 font-medium">
              {st.done ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-status-safe shrink-0" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-secondary-text/60 shrink-0" />
              )}
              <span className="truncate">{st.label}</span>
            </div>
            {!st.done && (
              <p className="text-[10px] text-secondary-text/70 mt-0.5 truncate pl-5">
                {st.unlock}
              </p>
            )}
          </div>
        ))}
      </div>

    </div>
  );
}

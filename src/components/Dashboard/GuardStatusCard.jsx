// frontend/src/components/Dashboard/GuardStatusCard.jsx
import React from 'react';
import { useGameGuard } from '../../context/GameGuardContext';
import { ShieldCheck, ShieldAlert, Shield, RefreshCw, Clock } from 'lucide-react';

export default function GuardStatusCard({ onRunCheckAgain }) {
  const { user } = useGameGuard();

  const isVerified = user?.guardStatus === 'verified';
  const isReview = user?.guardStatus === 'review';

  return (
    <div className="bg-surface border border-surface-border rounded-2xl p-5 shadow-md flex flex-col justify-between relative overflow-hidden">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
              isVerified 
                ? 'bg-status-safe/10 border-status-safe/30 text-status-safe' 
                : isReview 
                  ? 'bg-status-caution/10 border-status-caution/30 text-status-caution' 
                  : 'bg-surface-elevated border-surface-border text-secondary-text'
            }`}>
              {isVerified ? (
                <ShieldCheck className="w-4 h-4" />
              ) : isReview ? (
                <ShieldAlert className="w-4 h-4" />
              ) : (
                <Shield className="w-4 h-4" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-sm text-primary-text">Guard Status</h3>
              <p className="text-[11px] text-secondary-text">Session Policy Policy v{user?.policyVersion || 1}</p>
            </div>
          </div>

          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${
            isVerified 
              ? 'bg-status-safe/10 text-status-safe border-status-safe/30' 
              : isReview 
                ? 'bg-status-caution/10 text-status-caution border-status-caution/30 animate-pulse' 
                : 'bg-canvas text-secondary-text border-surface-border'
          }`}>
            {user?.guardStatus || 'Pending'}
          </span>
        </div>

        <div className="space-y-2 mb-4 bg-canvas/60 p-3 rounded-xl border border-surface-border text-xs">
          <div className="flex items-center justify-between text-secondary-text">
            <span>Session Integrity:</span>
            <span className={isVerified ? 'text-status-safe font-mono font-medium' : 'text-secondary-text'}>
              {isVerified ? 'TLS 1.3 / Entropy 0.98' : 'Pending Scan'}
            </span>
          </div>
          <div className="flex items-center justify-between text-secondary-text">
            <span>Risk Score:</span>
            <span className={user?.riskLevel === 'high' ? 'text-status-critical font-bold' : user?.riskLevel === 'medium' ? 'text-status-caution font-bold' : 'text-status-safe font-bold'}>
              {user?.riskLevel ? user.riskLevel.toUpperCase() : 'LOW'}
            </span>
          </div>
          <div className="flex items-center justify-between text-secondary-text">
            <span>Last Evaluated:</span>
            <span className="font-mono text-[11px] flex items-center gap-1">
              <Clock className="w-3 h-3 text-secondary-text" />
              {user?.lastCheckTime ? new Date(user.lastCheckTime).toLocaleTimeString() : 'Not yet run'}
            </span>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onRunCheckAgain}
        className="w-full py-2 px-3 rounded-xl bg-surface-elevated hover:bg-surface-border text-xs font-semibold text-primary-text border border-surface-border flex items-center justify-center gap-1.5 transition-colors"
      >
        <RefreshCw className="w-3.5 h-3.5 text-status-info" />
        <span>Run check again</span>
      </button>
    </div>
  );
}

// frontend/src/components/Dashboard/NetworkAccessCard.jsx
import React from 'react';
import { useGameGuard } from '../../context/GameGuardContext';
import { Wifi, WifiOff, Gamepad2, ArrowRight, ShieldCheck } from 'lucide-react';

export default function NetworkAccessCard({ onRequestAccess, onOpenLobby }) {
  const { user } = useGameGuard();

  const isAllowed = user?.networkAccess === 'allowed';
  const isGuardPassed = user?.guardStatus === 'verified';
  const isClaimVerified = user?.claim && user.claim.status === 'verified';

  // Determine why disabled if not ready
  const getLockReason = () => {
    if (!isGuardPassed) return 'Requires Guard Verification scan';
    if (!isClaimVerified) return 'Requires Age Assurance proof';
    if (user?.riskLevel === 'high') return 'Locked: Suspicious anomalies detected';
    return null;
  };

  const lockReason = getLockReason();

  return (
    <div className="bg-surface border border-surface-border rounded-2xl p-5 shadow-md flex flex-col justify-between relative overflow-hidden">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
              isAllowed 
                ? 'bg-status-safe/10 border-status-safe/30 text-status-safe' 
                : 'bg-surface-elevated border-surface-border text-secondary-text'
            }`}>
              {isAllowed ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="font-bold text-sm text-primary-text">Network Access Gate</h3>
              <p className="text-[11px] text-secondary-text">Multiplayer Gateway Policy</p>
            </div>
          </div>

          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${
            isAllowed 
              ? 'bg-status-safe/10 text-status-safe border-status-safe/30' 
              : 'bg-status-critical/10 text-status-critical border-status-critical/30'
          }`}>
            {isAllowed ? 'Allowed' : 'Denied'}
          </span>
        </div>

        <div className="space-y-2 mb-4 bg-canvas/60 p-3 rounded-xl border border-surface-border text-xs">
          <div className="flex items-center justify-between text-secondary-text">
            <span>Profile:</span>
            <span className={isAllowed ? 'text-status-safe font-medium truncate max-w-[170px]' : 'text-secondary-text/80 truncate max-w-[170px]'}>
              {isAllowed ? 'Trusted Gaming Node (Low Latency)' : 'Quarantined - Port 80/443 Only'}
            </span>
          </div>
          <div className="flex items-center justify-between text-secondary-text">
            <span>Status:</span>
            <span className={isAllowed ? 'text-status-safe' : 'text-status-critical'}>
              {isAllowed ? 'Lobby Access Granted' : 'Checkpoint Unfulfilled'}
            </span>
          </div>
          <div className="flex items-center justify-between text-secondary-text">
            <span>Policy Rule:</span>
            <span className="font-mono text-[11px] text-status-info">
              {isAllowed ? 'RULE_GATEWAY_NET_03' : 'GATE_RESTRICTED'}
            </span>
          </div>
        </div>
      </div>

      <div>
        {isAllowed ? (
          <button
            type="button"
            onClick={onOpenLobby}
            className="w-full py-2.5 px-3 rounded-xl bg-status-safe hover:bg-opacity-90 text-canvas text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-status-safe/20 transition-all"
          >
            <Gamepad2 className="w-4 h-4" />
            <span>Open Secure Game Lobby</span>
          </button>
        ) : (
          <div>
            <button
              type="button"
              disabled={Boolean(lockReason)}
              onClick={onRequestAccess}
              className="w-full py-2 px-3 rounded-xl bg-surface-elevated hover:bg-surface-border text-xs font-semibold text-status-safe border border-surface-border flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>Request network access</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            {lockReason && (
              <p className="text-[10px] text-secondary-text/80 text-center mt-1.5 italic">
                Disabled: {lockReason}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

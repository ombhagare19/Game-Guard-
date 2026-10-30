// frontend/src/components/Dashboard/AgeClaimCard.jsx
import React from 'react';
import { useGameGuard } from '../../context/GameGuardContext';
import { Lock, FileCheck, Eye, AlertCircle, Copy, Check } from 'lucide-react';

export default function AgeClaimCard({ onViewProofDetails, onOpenAgeModal }) {
  const { user } = useGameGuard();
  const [copied, setCopied] = React.useState(false);

  const claim = user?.claim;
  const isVerified = claim && claim.status === 'verified';
  const isRevoked = claim && claim.status === 'revoked';

  const shortenHash = (hash) => {
    if (!hash) return 'None';
    return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
  };

  const handleCopy = (e, text) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="tour-privacy-proof" className="bg-surface border border-surface-border rounded-2xl p-5 shadow-md flex flex-col justify-between relative overflow-hidden">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
              isVerified 
                ? 'bg-status-safe/10 border-status-safe/30 text-status-safe' 
                : isRevoked 
                  ? 'bg-status-critical/10 border-status-critical/30 text-status-critical'
                  : 'bg-surface-elevated border-surface-border text-secondary-text'
            }`}>
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-primary-text">Age Claim Fingerprint</h3>
              <p className="text-[11px] text-secondary-text">Zero-Knowledge / SHA-256 Record</p>
            </div>
          </div>

          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${
            isVerified 
              ? 'bg-status-safe/10 text-status-safe border-status-safe/30' 
              : isRevoked 
                ? 'bg-status-critical/10 text-status-critical border-status-critical/30'
                : 'bg-canvas text-secondary-text border-surface-border'
          }`}>
            {isVerified ? 'Requirement met' : isRevoked ? 'Revoked' : 'Not verified'}
          </span>
        </div>

        <div className="space-y-2 mb-4 bg-canvas/60 p-3 rounded-xl border border-surface-border text-xs">
          <div className="flex items-center justify-between text-secondary-text">
            <span>Fingerprint:</span>
            {claim?.claimHash ? (
              <button 
                onClick={(e) => handleCopy(e, claim.claimHash)}
                className="font-mono text-status-info hover:underline flex items-center gap-1 text-[11px]"
                title="Click to copy full SHA-256 fingerprint"
              >
                <span>{shortenHash(claim.claimHash)}</span>
                {copied ? <Check className="w-3 h-3 text-status-safe" /> : <Copy className="w-3 h-3" />}
              </button>
            ) : (
              <span className="text-secondary-text/60 italic">No claim created</span>
            )}
          </div>
          <div className="flex items-center justify-between text-secondary-text">
            <span>Claim Type:</span>
            <span className="font-mono text-[11px] text-primary-text">
              {claim?.claimType || 'AGE_OVER_13 (Default)'}
            </span>
          </div>
          <div className="flex items-center justify-between text-secondary-text">
            <span>PII Retained:</span>
            <span className="text-status-safe font-semibold">
              0 Bytes (Zero PII)
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isVerified ? (
          <button
            type="button"
            onClick={onViewProofDetails}
            className="w-full py-2 px-3 rounded-xl bg-surface-elevated hover:bg-surface-border text-xs font-semibold text-status-info border border-surface-border flex items-center justify-center gap-1.5 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View proof details</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onOpenAgeModal}
            className="w-full py-2 px-3 rounded-xl bg-status-safe text-canvas text-xs font-bold hover:bg-opacity-90 flex items-center justify-center gap-1.5 transition-colors shadow-sm"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Complete Age Assurance</span>
          </button>
        )}
      </div>
    </div>
  );
}

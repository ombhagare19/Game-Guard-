// frontend/src/components/AgeAssuranceModal.jsx
import React, { useState } from 'react';
import { useGameGuard } from '../context/GameGuardContext';
import { 
  Lock, 
  CheckCircle2, 
  Copy, 
  Check, 
  X, 
  ShieldCheck, 
  AlertTriangle,
  Info
} from 'lucide-react';

export default function AgeAssuranceModal({ isOpen, onClose }) {
  const { handleVerifyAge } = useGameGuard();

  const [thresholdType, setThresholdType] = useState('AGE_OVER_13');
  const [submitting, setSubmitting] = useState(false);
  const [claimResult, setClaimResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (isOver) => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await handleVerifyAge(isOver, thresholdType);
      setClaimResult(res.claim);
    } catch (err) {
      setError(err.message || 'Verification failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyHash = (hash) => {
    if (!hash) return;
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-status-safe/10 border border-status-safe/30 flex items-center justify-center text-status-safe">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-primary-text">
              One-Time Age Assurance Gate
            </h3>
            <p className="text-xs text-secondary-text">
              Zero-PII verification for gaming network access
            </p>
          </div>
        </div>

        {/* Mandatory Age Assurance Notice */}
        <div className="mb-6 p-3.5 rounded-xl bg-status-info/10 border border-status-info/20 text-xs text-primary-text flex items-start gap-2.5">
          <Info className="w-4 h-4 text-status-info shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            “This demo checks a sample age claim. A production service should rely on a trusted age-assurance provider or a privacy-preserving proof. GameGuard should receive only the pass/fail claim and a verification reference—not a raw birth date or ID scan.”
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-status-critical/10 border border-status-critical/30 text-xs text-status-critical flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Step 1: Input selection (if claim not yet generated) */}
        {!claimResult ? (
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-xs font-semibold text-secondary-text mb-2">
                Select Network Safety Requirement
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setThresholdType('AGE_OVER_13')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    thresholdType === 'AGE_OVER_13'
                      ? 'bg-status-safe/10 border-status-safe text-primary-text font-bold'
                      : 'bg-canvas border-surface-border text-secondary-text hover:border-surface-border'
                  }`}
                >
                  <div className="text-xs font-semibold">13+ Teen Baseline</div>
                  <div className="text-[11px] text-secondary-text font-normal mt-0.5">COPPA compliant policy</div>
                </button>

                <button
                  type="button"
                  onClick={() => setThresholdType('AGE_OVER_18')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    thresholdType === 'AGE_OVER_18'
                      ? 'bg-status-safe/10 border-status-safe text-primary-text font-bold'
                      : 'bg-canvas border-surface-border text-secondary-text hover:border-surface-border'
                  }`}
                >
                  <div className="text-xs font-semibold">18+ Mature Arena</div>
                  <div className="text-[11px] text-secondary-text font-normal mt-0.5">Competitive mature rating</div>
                </button>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-canvas border border-surface-border">
              <span className="text-xs font-semibold text-primary-text block mb-1">
                Data Minimization Guarantee
              </span>
              <ul className="text-[11px] text-secondary-text space-y-1 list-disc list-inside">
                <li>No date of birth is collected or sent to the backend.</li>
                <li>No passports, drivers licenses, or photo scans are stored.</li>
                <li>Only a boolean pass token is canonicalized and hashed.</li>
              </ul>
            </div>

            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleSubmit(false)}
                className="w-1/2 py-2.5 rounded-xl border border-surface-border text-secondary-text hover:text-status-critical hover:bg-canvas text-xs font-medium transition-colors"
              >
                Simulate: Below Threshold
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={() => handleSubmit(true)}
                className="w-1/2 py-2.5 rounded-xl bg-status-safe text-canvas font-bold text-xs flex items-center justify-center gap-2 hover:bg-opacity-90 shadow-lg shadow-status-safe/20 transition-all disabled:opacity-50"
              >
                {submitting ? (
                  <span className="inline-block w-3.5 h-3.5 border-2 border-canvas border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm & Generate Proof</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Step 2: Proof Badge and Fingerprint Reveal */
          <div className="space-y-4 mb-6 animate-in zoom-in-95 duration-200">
            <div className={`p-4 rounded-xl border ${
              claimResult.status === 'verified' 
                ? 'bg-status-safe/10 border-status-safe/30 text-status-safe' 
                : 'bg-status-critical/10 border-status-critical/30 text-status-critical'
            }`}>
              <div className="flex items-center gap-2.5 mb-1">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-bold text-sm text-primary-text">
                  {claimResult.status === 'verified' ? 'Age requirement confirmed.' : 'Age requirement not met.'}
                </span>
              </div>
              <p className="text-xs text-secondary-text">
                Your birth date is not added to the ledger. Only a minimal cryptographic proof was retained.
              </p>
            </div>

            {/* SHA-256 Claim Fingerprint Box with Typewriter reveal */}
            <div className="p-4 rounded-xl bg-canvas border border-surface-border">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-mono uppercase tracking-wider text-secondary-text">
                  Tamper-Evident SHA-256 Claim Fingerprint
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyHash(claimResult.claimHash)}
                  className="flex items-center gap-1 text-[11px] text-status-info hover:underline"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-status-safe" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Hash'}</span>
                </button>
              </div>

              <div className="font-mono text-xs text-status-info break-all bg-surface p-2.5 rounded-lg border border-surface-border">
                {claimResult.claimHash}
              </div>

              <p className="text-[11px] text-secondary-text mt-2 leading-relaxed">
                “A digital fingerprint is ready. It represents the claim, not your identity details.”
              </p>
            </div>

            {/* Close / Proceed */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-status-safe text-canvas font-bold text-xs hover:bg-opacity-90 shadow-md transition-all"
              >
                Proceed to Secure Lobby
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

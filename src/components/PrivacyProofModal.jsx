// frontend/src/components/PrivacyProofModal.jsx
import React, { useState } from 'react';
import { useGameGuard } from '../context/GameGuardContext';
import { verifyFingerprint } from '../utils/crypto';
import { 
  ShieldCheck, 
  Lock, 
  Hash, 
  CheckCircle2, 
  XCircle, 
  Copy, 
  Check, 
  X, 
  FileCheck,
  RefreshCw
} from 'lucide-react';

export default function PrivacyProofModal({ isOpen, onClose }) {
  const { user } = useGameGuard();
  const claim = user?.claim;

  const [copied, setCopied] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [verifying, setVerifying] = useState(false);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerifyNow = async () => {
    if (!claim) return;
    setVerifying(true);
    try {
      const canonical = claim.canonicalString || `type:${claim.claimType}|passed:${claim.passed}|policyVersion:${claim.policyVersion}|salt:demo`;
      const res = await verifyFingerprint(canonical, claim.claimHash);
      setVerificationResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setVerifying(false);
    }
  };

  if (!isOpen) return null;

  const steps = [
    {
      num: 1,
      title: 'Receive Provider Result',
      detail: 'Provider returns boolean pass/fail + session reference. Raw DOB is never received or stored.',
      quote: '“We only need the result of the check—not your full identity.”'
    },
    {
      num: 2,
      title: 'Canonicalize Claim',
      detail: claim?.canonicalString || 'type:AGE_OVER_13|passed:true|policyVersion:1|salt:deterministic_entropy',
      quote: '“Preparing a proof record…”'
    },
    {
      num: 3,
      title: 'Hash Locally (Web Crypto SHA-256)',
      detail: claim?.claimHash || '0x pending calculation',
      quote: '“Fingerprint created. It is a tamper-evident identifier, not secret data encryption.”'
    },
    {
      num: 4,
      title: 'Save Minimal Receipt',
      detail: `Receipt ${claim?.receiptId || 'rec_sample'} stored in local demo ledger without raw PII.`,
      quote: '“Only the minimum proof record was saved.”'
    },
    {
      num: 5,
      title: 'Verify Receipt Integrity',
      detail: 'Deterministic recomputation compares hash with canonical claim structure.',
      quote: '“The saved receipt matches this claim.”'
    }
  ];

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

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-status-info/10 border border-status-info/30 flex items-center justify-center text-status-info">
            <Hash className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-primary-text">
              Privacy-Preserving Claim Verification
            </h3>
            <p className="text-xs text-secondary-text">
              Deterministic SHA-256 Fingerprint & Receipt Audit
            </p>
          </div>
        </div>

        {/* Five Stage Step-by-Step Breakdown */}
        <div className="space-y-4 mb-6">
          {steps.map((st) => (
            <div 
              key={st.num}
              className="p-3.5 rounded-xl bg-canvas/60 border border-surface-border text-xs"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-primary-text flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#182C42] border border-surface-border flex items-center justify-center text-[10px] font-mono text-status-info">
                    {st.num}
                  </span>
                  {st.title}
                </span>
                <span className="text-[10px] font-mono text-status-safe">
                  {st.num === 5 && verificationResult?.match ? 'MATCH' : 'SECURE'}
                </span>
              </div>
              <p className="font-mono text-[11px] text-secondary-text pl-7 break-all">
                {st.detail}
              </p>
              <p className="text-[11px] text-status-info/90 italic pl-7 mt-1">
                {st.quote}
              </p>
            </div>
          ))}
        </div>

        {/* Live Client-Side Web Crypto Verification Card */}
        <div className="p-4 rounded-xl bg-canvas border border-surface-border mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-primary-text flex items-center gap-2">
                <span>Cryptographic Verification Engine</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface border border-surface-border text-status-info">
                  Web Crypto Subtledigest
                </span>
              </h4>
              <p className="text-[11px] text-secondary-text mt-0.5">
                Recompute SHA-256 in browser memory and compare with stored claim hash
              </p>
            </div>

            <button
              type="button"
              disabled={verifying || !claim}
              onClick={handleVerifyNow}
              className="px-4 py-2 rounded-xl bg-status-safe text-canvas font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-opacity-90 shadow-md transition-all disabled:opacity-50"
            >
              {verifying ? (
                <span className="inline-block w-3.5 h-3.5 border-2 border-canvas border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Verify Match</span>
                </>
              )}
            </button>
          </div>

          {verificationResult && (
            <div className={`mt-3 p-3 rounded-xl border flex items-start gap-2.5 text-xs animate-in fade-in ${
              verificationResult.match 
                ? 'bg-status-safe/10 border-status-safe/30 text-status-safe' 
                : 'bg-status-critical/10 border-status-critical/30 text-status-critical'
            }`}>
              {verificationResult.match ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
              )}
              <div>
                <span className="font-bold">
                  {verificationResult.match ? 'Match Confirmed: The saved receipt matches this claim.' : 'Mismatch: Hash does not match canonical claim!'}
                </span>
                <p className="text-[11px] text-secondary-text mt-0.5 break-all">
                  Computed: {verificationResult.computedHash}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-surface-border">
          <span className="text-[11px] text-secondary-text">
            Tamper-evident verification • Excludes raw DOB, passwords & ID docs
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-surface-elevated hover:bg-surface-border text-xs font-semibold text-primary-text"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}

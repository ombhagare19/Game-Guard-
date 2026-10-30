// frontend/src/components/SolidityInspectorModal.jsx
import React, { useState } from 'react';
import { useGameGuard } from '../context/GameGuardContext';
import { Code2, Copy, Check, X, Shield, FileText, CheckCircle2 } from 'lucide-react';

export default function SolidityInspectorModal({ isOpen, onClose }) {
  const { contractData } = useGameGuard();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('source'); // 'source' | 'abi'

  if (!isOpen) return null;

  const sourceCode = contractData?.source || `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract GameGuardPolicy {
    // Contract source loaded from backend
}`;

  const abiText = JSON.stringify(contractData?.metadata?.abi || [], null, 2);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-canvas/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-surface border border-surface-border rounded-2xl p-6 sm:p-8 shadow-2xl relative max-h-[92vh] flex flex-col">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-secondary-text hover:text-primary-text hover:bg-canvas transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-status-info/10 border border-status-info/30 flex items-center justify-center text-status-info shrink-0">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-primary-text">
                  GameGuardPolicy.sol
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#182C42] border border-surface-border text-status-info">
                  Solidity ^0.8.20
                </span>
              </div>
              <p className="text-xs text-secondary-text">
                On-Chain Verification Claim & Access Policy Anchor
              </p>
            </div>
          </div>

          {/* Deployment Status Pill */}
          <div className="px-3 py-1.5 rounded-xl bg-canvas border border-surface-border text-left sm:text-right">
            <span className="text-[10px] uppercase font-mono tracking-wider text-secondary-text block">
              Deployment Status
            </span>
            <span className="text-xs font-semibold text-status-caution flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-status-caution animate-pulse" />
              Not deployed in this demo (Ready for EVM Rollup)
            </span>
          </div>
        </div>

        {/* Tab Controls & Copy Button */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-1 bg-canvas p-1 rounded-lg border border-surface-border">
            <button
              onClick={() => setActiveTab('source')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                activeTab === 'source' ? 'bg-surface text-primary-text font-bold' : 'text-secondary-text hover:text-primary-text'
              }`}
            >
              Solidity Source
            </button>
            <button
              onClick={() => setActiveTab('abi')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                activeTab === 'abi' ? 'bg-surface text-status-info font-bold' : 'text-secondary-text hover:text-primary-text'
              }`}
            >
              Contract ABI
            </button>
          </div>

          <button
            onClick={() => handleCopy(activeTab === 'source' ? sourceCode : abiText)}
            className="px-3 py-1.5 rounded-lg bg-surface-elevated hover:bg-surface-border text-xs font-semibold text-secondary-text hover:text-primary-text border border-surface-border flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-status-safe" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Code'}</span>
          </button>
        </div>

        {/* Code View with Scrollbar */}
        <div className="flex-1 min-h-[300px] overflow-y-auto bg-canvas p-4 rounded-xl border border-surface-border font-mono text-xs text-primary-text selection:bg-status-info/20">
          <pre className="whitespace-pre">
            {activeTab === 'source' ? sourceCode : abiText}
          </pre>
        </div>

        {/* Footer Notes */}
        <div className="mt-4 pt-3 border-t border-surface-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-secondary-text">
          <p>
            Anchor functions: <code className="text-status-safe">registerClaim()</code>, <code className="text-status-critical">revokeClaim()</code>, <code className="text-status-info">recordAccessDecision()</code>. Zero PII stored on-chain.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-surface-elevated hover:bg-surface-border text-xs font-semibold text-primary-text"
          >
            Close Inspector
          </button>
        </div>

      </div>
    </div>
  );
}

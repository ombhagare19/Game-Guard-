// frontend/src/components/Dashboard/PolicyLedgerCard.jsx
import React, { useState } from 'react';
import { useGameGuard } from '../../context/GameGuardContext';
import { api } from '../../utils/api';
import { 
  FileText, 
  Filter, 
  Download, 
  Copy, 
  Check, 
  ExternalLink,
  Code2
} from 'lucide-react';

export default function PolicyLedgerCard({ onViewReceipt, onOpenContract }) {
  const { ledgerReceipts, refreshLedger } = useGameGuard();
  const [filter, setFilter] = useState('all');
  const [copiedId, setCopiedId] = useState(null);

  const handleFilterChange = async (newFilter) => {
    setFilter(newFilter);
    await refreshLedger(newFilter);
  };

  const handleCopyReceipt = (e, receipt) => {
    e.stopPropagation();
    navigator.clipboard.writeText(JSON.stringify(receipt, null, 2));
    setCopiedId(receipt.receiptId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportJson = () => {
    window.open(api.getExportUrl(), '_blank');
  };

  return (
    <div className="bg-surface border border-surface-border rounded-2xl p-5 shadow-md flex flex-col justify-between">
      <div>
        
        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#182C42] border border-surface-border flex items-center justify-center text-status-safe">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-primary-text">Policy Ledger Receipts</h3>
              <p className="text-[11px] text-secondary-text">Immutable Proof Receipts (Zero PII)</p>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-canvas p-1 rounded-lg border border-surface-border self-start sm:self-auto">
            <button
              onClick={() => handleFilterChange('all')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                filter === 'all' ? 'bg-surface text-primary-text font-semibold' : 'text-secondary-text hover:text-primary-text'
              }`}
            >
              All
            </button>
            <button
              onClick={() => handleFilterChange('verified')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                filter === 'verified' ? 'bg-surface text-status-safe font-semibold' : 'text-secondary-text hover:text-primary-text'
              }`}
            >
              Verified
            </button>
            <button
              onClick={() => handleFilterChange('alerts')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                filter === 'alerts' ? 'bg-surface text-status-caution font-semibold' : 'text-secondary-text hover:text-primary-text'
              }`}
            >
              Alerts
            </button>
          </div>
        </div>

        {/* Receipt List */}
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {ledgerReceipts.length === 0 ? (
            <div className="text-center py-8 text-xs text-secondary-text italic">
              No proof receipts found for filter: {filter}. Complete age assurance to write a receipt.
            </div>
          ) : (
            ledgerReceipts.map((rec) => (
              <div
                key={rec.receiptId}
                onClick={() => onViewReceipt && onViewReceipt(rec)}
                className="p-2.5 rounded-xl bg-canvas/60 hover:bg-canvas border border-surface-border cursor-pointer transition-colors flex items-center justify-between gap-3 group"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-primary-text truncate">
                      {rec.receiptId}
                    </span>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono uppercase border ${
                      rec.status === 'verified' 
                        ? 'bg-status-safe/10 text-status-safe border-status-safe/30' 
                        : 'bg-status-critical/10 text-status-critical border-status-critical/30'
                    }`}>
                      {rec.status}
                    </span>
                  </div>
                  <p className="font-mono text-[11px] text-status-info truncate mt-0.5">
                    {rec.claimHash}
                  </p>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => handleCopyReceipt(e, rec)}
                    className="p-1 rounded text-secondary-text hover:text-primary-text hover:bg-surface border border-transparent hover:border-surface-border"
                    title="Copy full JSON receipt"
                  >
                    {copiedId === rec.receiptId ? (
                      <Check className="w-3.5 h-3.5 text-status-safe" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* Footer Controls: Export JSON & View Contract */}
      <div className="mt-3 pt-3 border-t border-surface-border flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={handleExportJson}
          className="px-3 py-1.5 rounded-lg bg-surface-elevated hover:bg-surface-border text-[11px] font-semibold text-secondary-text hover:text-primary-text border border-surface-border flex items-center gap-1.5 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Demo JSON</span>
        </button>

        <button
          type="button"
          onClick={onOpenContract}
          className="px-3 py-1.5 rounded-lg bg-surface-elevated hover:bg-surface-border text-[11px] font-semibold text-status-info border border-surface-border flex items-center gap-1.5 transition-colors"
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Solidity Contract</span>
        </button>
      </div>
    </div>
  );
}

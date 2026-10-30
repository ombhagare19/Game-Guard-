// frontend/src/components/Dashboard/SecurityEventsTimeline.jsx
import React, { useState } from 'react';
import { useGameGuard } from '../../context/GameGuardContext';
import { 
  Activity, 
  AlertTriangle, 
  Info, 
  ShieldAlert, 
  X, 
  Clock, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export default function SecurityEventsTimeline() {
  const { securityEvents } = useGameGuard();
  const [selectedEvent, setSelectedEvent] = useState(null);

  const getSeverityBadge = (sev) => {
    switch (sev) {
      case 'critical':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase bg-status-critical/10 text-status-critical border border-status-critical/30">CRITICAL</span>;
      case 'warning':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase bg-status-caution/10 text-status-caution border border-status-caution/30">CAUTION</span>;
      default:
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase bg-status-info/10 text-status-info border border-status-info/20">INFO</span>;
    }
  };

  const getSuggestedResponse = (action, severity) => {
    if (action.includes('LOGIN_FAILURE')) return 'Investigate potential credential stuffing; enforce temporary rate limit.';
    if (action.includes('BURST')) return 'Apply packet token bucket filter; monitor bandwidth utilization.';
    if (action.includes('REVOKED')) return 'Session/claim terminated per policy. Re-authentication necessary.';
    if (action.includes('MISMATCH')) return 'Cryptographic tamper alarm. Isolate node and inspect client hash implementation.';
    if (severity === 'critical') return 'Lock network gateway port; elevate alert to gaming SOC incident queue.';
    return 'No action needed. Normal operation recorded in tamper-evident ledger.';
  };

  return (
    <div id="tour-activity-timeline" className="bg-surface border border-surface-border rounded-2xl p-5 shadow-md flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#182C42] border border-surface-border flex items-center justify-center text-status-info">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-primary-text">Security Events Timeline</h3>
              <p className="text-[11px] text-secondary-text">Audit Decisions & Gateway Signals</p>
            </div>
          </div>

          <span className="text-[11px] font-mono text-secondary-text">
            {securityEvents.length} events logged
          </span>
        </div>

        {/* Timeline list */}
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {securityEvents.length === 0 ? (
            <div className="text-center py-8 text-xs text-secondary-text italic">
              No events recorded yet. Run guard or auth to initiate events.
            </div>
          ) : (
            securityEvents.map((evt) => (
              <div
                key={evt.eventId}
                onClick={() => setSelectedEvent(evt)}
                className="p-2.5 rounded-xl bg-canvas/60 hover:bg-canvas border border-surface-border cursor-pointer transition-colors flex items-center justify-between gap-3 group"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="mt-0.5 shrink-0">
                    {evt.severity === 'critical' ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-status-critical" />
                    ) : evt.severity === 'warning' ? (
                      <ShieldAlert className="w-3.5 h-3.5 text-status-caution" />
                    ) : (
                      <Info className="w-3.5 h-3.5 text-status-info" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-primary-text truncate">
                        {evt.action}
                      </span>
                      {getSeverityBadge(evt.severity)}
                    </div>
                    <p className="text-[11px] text-secondary-text truncate mt-0.5">
                      {evt.description}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-1.5 text-secondary-text group-hover:text-primary-text">
                  <span className="text-[10px] font-mono">
                    {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-3 pt-3 border-t border-surface-border text-[11px] text-secondary-text flex items-center justify-between">
        <span>Click any row for incident response details</span>
        <span className="font-mono text-status-info">Simulated SOC</span>
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-canvas/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-surface border border-surface-border rounded-2xl p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-secondary-text hover:text-primary-text hover:bg-canvas"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-surface-elevated border border-surface-border flex items-center justify-center">
                {selectedEvent.severity === 'critical' ? (
                  <AlertTriangle className="w-4 h-4 text-status-critical" />
                ) : (
                  <Activity className="w-4 h-4 text-status-info" />
                )}
              </div>
              <div>
                <h4 className="font-bold text-sm text-primary-text">{selectedEvent.action}</h4>
                <div className="flex items-center gap-2 mt-0.5">
                  {getSeverityBadge(selectedEvent.severity)}
                  <span className="text-[10px] font-mono text-secondary-text">{selectedEvent.eventId}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 bg-canvas p-3.5 rounded-xl border border-surface-border text-xs mb-4">
              <div>
                <span className="text-secondary-text block mb-0.5">Description:</span>
                <p className="text-primary-text leading-relaxed">{selectedEvent.description}</p>
              </div>

              <div>
                <span className="text-secondary-text block mb-0.5">Timestamp:</span>
                <span className="font-mono text-status-info">{new Date(selectedEvent.timestamp).toLocaleString()}</span>
              </div>

              <div>
                <span className="text-secondary-text block mb-0.5">Recommended Response:</span>
                <p className="text-status-safe font-medium leading-relaxed">
                  {getSuggestedResponse(selectedEvent.action, selectedEvent.severity)}
                </p>
              </div>

              <div>
                <span className="text-secondary-text block mb-0.5">Boundary Notice:</span>
                <p className="text-[11px] text-secondary-text/80 italic">
                  “This event needs a closer look. No real network traffic was blocked by this demo.”
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedEvent(null)}
              className="w-full py-2 rounded-xl bg-surface-elevated hover:bg-surface-border text-xs font-semibold text-primary-text border border-surface-border"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

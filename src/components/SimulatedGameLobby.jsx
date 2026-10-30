// frontend/src/components/SimulatedGameLobby.jsx
import React, { useState, useEffect } from 'react';
import { useGameGuard } from '../context/GameGuardContext';
import { 
  Gamepad2, 
  Wifi, 
  ShieldCheck, 
  Users, 
  Zap, 
  Activity, 
  LogOut, 
  Sparkles,
  Server,
  Play
} from 'lucide-react';

export default function SimulatedGameLobby({ onReturnToConsole }) {
  const { user, handleSimulateScenario } = useGameGuard();

  const [ping, setPing] = useState(18);
  const [inQueue, setInQueue] = useState(false);
  const [queueTime, setQueueTime] = useState(0);
  const [burstAlert, setBurstAlert] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate subtle ping fluctuation 17-21ms
      setPing(17 + Math.floor(Math.random() * 5));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let timer;
    if (inQueue) {
      timer = setInterval(() => setQueueTime(t => t + 1), 1000);
    } else {
      setQueueTime(0);
    }
    return () => clearInterval(timer);
  }, [inQueue]);

  const handleSimulateBurst = async () => {
    setBurstAlert(true);
    await handleSimulateScenario('unusual_request_burst');
    setTimeout(() => setBurstAlert(false), 4000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 animate-in fade-in duration-300">
      
      {/* Top Banner Alert */}
      <div className="mb-6 p-4 rounded-2xl bg-status-safe/10 border border-status-safe/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-status-safe text-canvas flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-primary-text">
              Guard passed. Demo game access is now open.
            </h3>
            <p className="text-xs text-secondary-text">
              Session verified with zero PII disclosure. Secure multiplayer tunnel established.
            </p>
          </div>
        </div>

        <button
          onClick={onReturnToConsole}
          className="px-4 py-2 rounded-xl bg-surface hover:bg-surface-elevated text-xs font-semibold text-primary-text border border-surface-border transition-colors self-start sm:self-auto"
        >
          Return to SOC Console
        </button>
      </div>

      {/* Main Game Interface Card */}
      <div className="bg-surface border border-surface-border rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        
        {/* Background Visual Grid / Cyber Aesthetic */}
        <div className="absolute inset-0 bg-gradient-to-br from-status-info/5 via-transparent to-status-safe/5 pointer-events-none" />

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-status-safe animate-pulse" />
              <span className="text-[11px] font-mono uppercase tracking-widest text-status-safe font-bold">
                GLOBAL MATCHMAKING ARENA
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-primary-text tracking-tight">
              CYBERSTRIKE: ZERO HOUR
            </h2>
            <p className="text-xs text-secondary-text mt-0.5">
              Multiplayer Realm #EU-CENTRAL-09 • GameGuard Policy Enforced
            </p>
          </div>

          {/* Quick Session Stats */}
          <div className="flex items-center gap-3 bg-canvas p-2.5 rounded-2xl border border-surface-border">
            <div className="px-3 py-1 text-center">
              <span className="text-[10px] text-secondary-text block font-mono">LATENCY</span>
              <span className="text-xs font-bold text-status-safe font-mono">{ping} ms</span>
            </div>
            <div className="w-px h-6 bg-surface-border" />
            <div className="px-3 py-1 text-center">
              <span className="text-[10px] text-secondary-text block font-mono">TICKRATE</span>
              <span className="text-xs font-bold text-status-info font-mono">128 Hz</span>
            </div>
            <div className="w-px h-6 bg-surface-border" />
            <div className="px-3 py-1 text-center">
              <span className="text-[10px] text-secondary-text block font-mono">PACKET LOSS</span>
              <span className="text-xs font-bold text-status-safe font-mono">0.0%</span>
            </div>
          </div>
        </div>

        {/* Matchmaking Lobby Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10 mb-8">
          
          {/* Player Card */}
          <div className="bg-canvas/80 border border-surface-border rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-surface-elevated border border-surface-border flex items-center justify-center font-mono font-bold text-lg text-status-safe">
                {user?.identifier?.slice(0, 2).toUpperCase() || 'GP'}
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-sm text-primary-text truncate">
                  {user?.identifier}
                </h4>
                <span className="text-[11px] font-mono text-status-info">
                  Rank: Master Guardian II
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs border-t border-surface-border/60 pt-3">
              <div className="flex justify-between text-secondary-text">
                <span>Proof Fingerprint:</span>
                <span className="font-mono text-status-safe text-[11px]">
                  {user?.claim?.claimHash?.slice(0, 10)}... (Verified)
                </span>
              </div>
              <div className="flex justify-between text-secondary-text">
                <span>Gateway Token:</span>
                <span className="font-mono text-primary-text text-[11px]">
                  mm_active_gateway
                </span>
              </div>
              <div className="flex justify-between text-secondary-text">
                <span>Anti-Cheat State:</span>
                <span className="text-status-safe font-medium">
                  Secured & Monitored
                </span>
              </div>
            </div>
          </div>

          {/* Matchmaking Action Card */}
          <div className="bg-canvas/80 border border-surface-border rounded-2xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-primary-text">Ranked Matchmaking</span>
                <span className="text-[10px] font-mono text-secondary-text">5v5 Bomb Defusal</span>
              </div>
              <p className="text-xs text-secondary-text mb-4">
                Join queue with verified fair-play players who passed GameGuard age assurance & session integrity checks.
              </p>
            </div>

            <div>
              {inQueue ? (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-status-info/10 border border-status-info/30 text-center animate-pulse">
                    <span className="text-xs font-mono text-status-info font-bold">
                      Searching for balanced match... ({queueTime}s)
                    </span>
                  </div>
                  <button
                    onClick={() => setInQueue(false)}
                    className="w-full py-2.5 rounded-xl bg-surface-elevated hover:bg-surface-border text-xs font-bold text-secondary-text transition-colors"
                  >
                    Cancel Matchmaking
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setInQueue(true)}
                  className="w-full py-3 rounded-xl bg-status-safe hover:bg-opacity-90 text-canvas font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-status-safe/25 transition-all"
                >
                  <Play className="w-4 h-4 fill-canvas" />
                  <span>Find Competitive Match</span>
                </button>
              )}
            </div>
          </div>

          {/* In-Game Security Simulation Controls */}
          <div className="bg-canvas/80 border border-surface-border rounded-2xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2 text-status-caution">
                <Zap className="w-4 h-4" />
                <h4 className="text-xs font-bold text-primary-text">In-Game Threat Trigger</h4>
              </div>
              <p className="text-xs text-secondary-text mb-4">
                Simulate client packet flooding to verify how GameGuard network gateway detects anomalies without disconnecting gameplay.
              </p>
            </div>

            <div>
              <button
                onClick={handleSimulateBurst}
                className="w-full py-2.5 px-3 rounded-xl bg-status-caution/10 hover:bg-status-caution/20 text-status-caution border border-status-caution/30 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Simulate Packet Burst Anomaly</span>
              </button>

              {burstAlert && (
                <p className="text-[10px] text-status-caution font-mono text-center mt-2 animate-in fade-in">
                  Burst logged to SOC console timeline!
                </p>
              )}
            </div>
          </div>

        </div>

        {/* Footer Note */}
        <div className="pt-4 border-t border-surface-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-secondary-text">
          <span>GameGuard Gateway Node: v1.0.0-demo • Simulation Environment</span>
          <button
            onClick={onReturnToConsole}
            className="text-status-info hover:underline text-left sm:text-right"
          >
            Switch to Security Console View →
          </button>
        </div>

      </div>

    </div>
  );
}

// frontend/src/components/Header.jsx
import React from 'react';
import { useGameGuard } from '../context/GameGuardContext';
import { 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  ShieldX, 
  Sliders, 
  LogOut, 
  Terminal,
  Gamepad2
} from 'lucide-react';

export default function Header() {
  const { 
    user, 
    handleLogout, 
    setJudgeDrawerOpen, 
    gameLobbyOpen, 
    setGameLobbyOpen 
  } = useGameGuard();

  const getGuardPill = () => {
    if (!user) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#182C42] text-secondary-text border border-surface-border">
          <Shield className="w-3.5 h-3.5 text-secondary-text" />
          Guard Inactive
        </span>
      );
    }
    if (user.guardStatus === 'verified') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-status-safe/10 text-status-safe border border-status-safe/30">
          <ShieldCheck className="w-3.5 h-3.5" />
          Guard Verified
        </span>
      );
    }
    if (user.guardStatus === 'review') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-status-caution/10 text-status-caution border border-status-caution/30 animate-pulse">
          <ShieldAlert className="w-3.5 h-3.5" />
          Review Required
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-status-info/10 text-status-info border border-status-info/30">
        <Shield className="w-3.5 h-3.5" />
        Guard Pending
      </span>
    );
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-canvas/90 backdrop-blur border-b border-surface-border px-4 lg:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand & Mark */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-surface border border-surface-border flex items-center justify-center shadow-inner group">
            <ShieldCheck className="w-5 h-5 text-status-safe transition-transform group-hover:scale-110" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-primary-text">GameGuard</span>
              <span className="text-[10px] uppercase font-mono tracking-wider px-1.5 py-0.5 rounded bg-status-info/10 text-status-info border border-status-info/20">
                Demo Mode
              </span>
            </div>
            <p className="text-[11px] text-secondary-text hidden sm:block">
              Privacy-First Security Layer for Global Gaming Networks
            </p>
          </div>
        </div>

        {/* Status, Account, & Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Guard Status Pill */}
          <div id="tour-guard-status" className="hidden sm:block">
            {getGuardPill()}
          </div>

          {/* User Account Pill if logged in */}
          {user && (
            <div className="flex items-center gap-2 bg-surface px-3 py-1.5 rounded-lg border border-surface-border">
              <div className="w-2 h-2 rounded-full bg-status-safe animate-ping" />
              <span className="text-xs font-mono text-primary-text max-w-[120px] sm:max-w-[160px] truncate">
                {user.identifier}
              </span>
            </div>
          )}

          {/* Lobby Toggle when unlocked */}
          {user && user.networkAccess === 'allowed' && (
            <button
              onClick={() => setGameLobbyOpen(!gameLobbyOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                gameLobbyOpen 
                  ? 'bg-status-safe text-canvas shadow-lg shadow-status-safe/20' 
                  : 'bg-surface hover:bg-surface-elevated text-status-safe border border-status-safe/40'
              }`}
            >
              <Gamepad2 className="w-4 h-4" />
              <span className="hidden sm:inline">{gameLobbyOpen ? 'Console View' : 'Game Lobby'}</span>
            </button>
          )}

          {/* Judge / Inspector Drawer Button */}
          <button
            onClick={() => setJudgeDrawerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#182C42] hover:bg-surface-border text-status-info border border-status-info/30 transition-all hover:shadow-md"
            title="Open Judge Mode & Inspector Drawer"
          >
            <Sliders className="w-4 h-4" />
            <span className="hidden md:inline font-mono">Judge Mode</span>
          </button>

          {/* Logout if authenticated */}
          {user && (
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-secondary-text hover:text-status-critical hover:bg-surface border border-transparent hover:border-surface-border transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>
    </header>
  );
}

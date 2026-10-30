// frontend/src/components/AuthCard.jsx
import React, { useState } from 'react';
import { useGameGuard } from '../context/GameGuardContext';
import { User, KeyRound, AlertCircle, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';

export default function AuthCard({ onAuthenticated }) {
  const { handleLogin, handleRegister, error: contextError } = useGameGuard();
  
  const [isRegister, setIsRegister] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    // Field validations
    if (!identifier.trim()) {
      setLocalError('Please enter an email or username.');
      return;
    }
    if (identifier.trim().length < 3) {
      setLocalError('Identifier must be at least 3 characters.');
      return;
    }
    if (!password) {
      setLocalError('Please enter a password.');
      return;
    }
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      if (isRegister) {
        await handleRegister(identifier.trim(), password);
      } else {
        await handleLogin(identifier.trim(), password);
      }
      if (onAuthenticated) onAuthenticated();
    } catch (err) {
      setLocalError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (type) => {
    if (type === 'returning') {
      setIdentifier('judge.demo@gameguard.network');
      setPassword('SecurityPass2026!');
      setIsRegister(false);
    } else {
      const rand = Math.floor(1000 + Math.random() * 9000);
      setIdentifier(`pilot_${rand}@gameguard.demo`);
      setPassword('BuildathonPass2026!');
      setIsRegister(true);
    }
    setLocalError('');
  };

  const displayError = localError || contextError;

  return (
    <div className="w-full max-w-md mx-auto bg-surface border border-surface-border rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
      
      {/* Decorative accent glow */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-status-info via-status-safe to-status-info" />

      {/* Card Header & Toggle */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-primary-text">
            {isRegister ? 'Create Player Account' : 'Player Security Checkpoint'}
          </h2>
          <p className="text-xs text-secondary-text mt-0.5">
            {isRegister ? 'Set up local demo identity' : 'Authenticate to verify session policy'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-canvas p-1 rounded-lg border border-surface-border">
          <button
            type="button"
            onClick={() => { setIsRegister(false); setLocalError(''); }}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              !isRegister ? 'bg-surface text-primary-text font-semibold shadow-sm' : 'text-secondary-text hover:text-primary-text'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); setLocalError(''); }}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              isRegister ? 'bg-surface text-primary-text font-semibold shadow-sm' : 'text-secondary-text hover:text-primary-text'
            }`}
          >
            Register
          </button>
        </div>
      </div>

      {/* Error Alert Box */}
      {displayError && (
        <div 
          role="alert"
          className="mb-5 p-3 rounded-xl bg-status-critical/10 border border-status-critical/30 flex items-start gap-2.5 text-xs text-status-critical"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{displayError}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Identifier Input */}
        <div>
          <label 
            htmlFor="player-identifier"
            className="block text-xs font-medium text-secondary-text mb-1.5"
          >
            Email or Gamertag
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-secondary-text">
              <User className="w-4 h-4" />
            </div>
            <input
              id="player-identifier"
              type="text"
              autoComplete="username"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="e.g. shadow_pilot or player@domain.com"
              className="w-full pl-9 pr-3 py-2.5 bg-canvas border border-surface-border rounded-xl text-sm text-primary-text placeholder-secondary-text/50 focus:border-status-info focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Password Input */}
        <div>
          <label 
            htmlFor="player-password"
            className="block text-xs font-medium text-secondary-text mb-1.5"
          >
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-secondary-text">
              <KeyRound className="w-4 h-4" />
            </div>
            <input
              id="player-password"
              type="password"
              autoComplete={isRegister ? "new-password" : "current-password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full pl-9 pr-3 py-2.5 bg-canvas border border-surface-border rounded-xl text-sm text-primary-text placeholder-secondary-text/50 focus:border-status-info focus:outline-none transition-colors"
            />
          </div>
          <p className="text-[11px] text-secondary-text mt-1">
            Hashed locally via PBKDF2/scrypt. Never published or stored in plaintext.
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl bg-status-safe hover:bg-opacity-90 text-canvas font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-status-safe/20 transition-all disabled:opacity-50"
        >
          {loading ? (
            <span className="inline-block w-4 h-4 border-2 border-canvas border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>{isRegister ? 'Create Account & Begin Scan' : 'Authenticate Session'}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

      </form>

      {/* Demo Quick Fills for Judges */}
      <div className="mt-6 pt-5 border-t border-surface-border">
        <p className="text-[11px] font-mono uppercase tracking-wider text-secondary-text mb-2.5 text-center">
          Judge Quick-Start Shortcuts
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleDemoFill('new')}
            className="px-2.5 py-1.5 rounded-lg bg-surface-elevated hover:bg-surface-border text-[11px] font-medium text-status-info border border-surface-border flex items-center justify-center gap-1.5 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>New Player Demo</span>
          </button>

          <button
            type="button"
            onClick={() => handleDemoFill('returning')}
            className="px-2.5 py-1.5 rounded-lg bg-surface-elevated hover:bg-surface-border text-[11px] font-medium text-status-safe border border-surface-border flex items-center justify-center gap-1.5 transition-colors"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Returning Demo</span>
          </button>
        </div>
      </div>

    </div>
  );
}

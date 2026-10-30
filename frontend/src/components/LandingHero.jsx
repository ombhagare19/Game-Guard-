// frontend/src/components/LandingHero.jsx
import React from 'react';
import { ShieldCheck, Lock, Radio, ArrowRight, Sparkles } from 'lucide-react';

export default function LandingHero({ onStartSession, onExploreDemo }) {
  return (
    <div className="w-full pt-8 pb-12 text-center max-w-4xl mx-auto px-4">
      
      {/* Top Banner Tag */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-surface-border mb-6">
        <Sparkles className="w-3.5 h-3.5 text-status-safe" />
        <span className="text-xs font-mono text-secondary-text">
          MST Blockchain Buildathon • Round 2 MVP
        </span>
      </div>

      {/* Main Headline */}
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-primary-text mb-4 leading-tight">
        Play with protection <span className="text-status-safe">built in.</span>
      </h1>

      {/* Subheading */}
      <p className="text-base sm:text-lg text-secondary-text max-w-2xl mx-auto mb-8 leading-relaxed">
        GameGuard checks whether a session meets the game’s safety rules while keeping sensitive player information off the public ledger.
      </p>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
        <button
          onClick={onStartSession}
          className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-status-safe text-canvas font-bold text-sm flex items-center justify-center gap-2 hover:bg-opacity-90 transition-all shadow-lg shadow-status-safe/20 group"
        >
          <span>Start secure session</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>

        <button
          onClick={onExploreDemo}
          className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-surface hover:bg-surface-elevated text-primary-text font-semibold text-sm border border-surface-border transition-all"
        >
          Explore the demo
        </button>
      </div>

      {/* Three Compact Benefit Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
        
        {/* Tile 1: One-time age assurance */}
        <div className="bg-surface/80 border border-surface-border p-4 rounded-xl hover:border-status-safe/30 transition-colors">
          <div className="w-8 h-8 rounded-lg bg-[#182C42] border border-surface-border flex items-center justify-center mb-3">
            <Lock className="w-4 h-4 text-status-safe" />
          </div>
          <h3 className="font-semibold text-sm text-primary-text mb-1">
            One-time age assurance
          </h3>
          <p className="text-xs text-secondary-text leading-relaxed">
            Verify minimum age eligibility once without publishing birth dates, passport scans, or private documents.
          </p>
        </div>

        {/* Tile 2: Privacy-safe proof */}
        <div className="bg-surface/80 border border-surface-border p-4 rounded-xl hover:border-status-info/30 transition-colors">
          <div className="w-8 h-8 rounded-lg bg-[#182C42] border border-surface-border flex items-center justify-center mb-3">
            <ShieldCheck className="w-4 h-4 text-status-info" />
          </div>
          <h3 className="font-semibold text-sm text-primary-text mb-1">
            Privacy-safe proof
          </h3>
          <p className="text-xs text-secondary-text leading-relaxed">
            Deterministic SHA-256 fingerprinting creates tamper-evident receipts without exposing raw personal data on-chain.
          </p>
        </div>

        {/* Tile 3: Network guard checks */}
        <div className="bg-surface/80 border border-surface-border p-4 rounded-xl hover:border-status-caution/30 transition-colors">
          <div className="w-8 h-8 rounded-lg bg-[#182C42] border border-surface-border flex items-center justify-center mb-3">
            <Radio className="w-4 h-4 text-status-caution" />
          </div>
          <h3 className="font-semibold text-sm text-primary-text mb-1">
            Network guard checks
          </h3>
          <p className="text-xs text-secondary-text leading-relaxed">
            Evaluate session risk, rate-limit anomalies, and policy conformance before granting multiplayer lobby tokens.
          </p>
        </div>

      </div>

    </div>
  );
}

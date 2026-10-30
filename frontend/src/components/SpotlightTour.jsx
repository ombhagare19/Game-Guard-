// frontend/src/components/SpotlightTour.jsx
import React from 'react';
import { useGameGuard } from '../context/GameGuardContext';
import { Sparkles, ArrowRight, ArrowLeft, X, Check } from 'lucide-react';

export default function SpotlightTour() {
  const { spotlightStep, setSpotlightStep, finishTour } = useGameGuard();

  if (!spotlightStep) return null;

  const tourData = {
    1: {
      targetId: 'tour-guard-status',
      title: 'Spotlight 1: Guard Status',
      copy: 'This tells you whether your session meets the current security policy.',
      total: 3
    },
    2: {
      targetId: 'tour-privacy-proof',
      title: 'Spotlight 2: Privacy Proof',
      copy: 'This fingerprint proves a claim was checked without displaying your personal details.',
      total: 3
    },
    3: {
      targetId: 'tour-activity-timeline',
      title: 'Spotlight 3: Activity Timeline',
      copy: 'Every demo decision is listed here so a player or reviewer can understand what happened.',
      total: 3
    }
  };

  const current = tourData[spotlightStep];
  if (!current) return null;

  const handleNext = () => {
    if (spotlightStep < 3) {
      setSpotlightStep(spotlightStep + 1);
    } else {
      finishTour();
    }
  };

  const handleBack = () => {
    if (spotlightStep > 1) {
      setSpotlightStep(spotlightStep - 1);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-surface border border-status-info/40 rounded-2xl p-5 shadow-2xl animate-in slide-in-from-bottom duration-300">
      
      {/* Glow border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-status-info via-status-safe to-status-info rounded-t-2xl" />

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-status-info animate-pulse" />
          <span className="text-xs font-bold text-primary-text">{current.title}</span>
        </div>
        <span className="text-[10px] font-mono text-secondary-text">
          {spotlightStep} of {current.total}
        </span>
      </div>

      {/* Body Copy */}
      <p className="text-xs text-secondary-text leading-relaxed mb-4">
        “{current.copy}”
      </p>

      {/* Controls */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-surface-border">
        <button
          type="button"
          onClick={finishTour}
          className="text-[11px] text-secondary-text hover:text-primary-text transition-colors"
        >
          Skip tour
        </button>

        <div className="flex items-center gap-2">
          {spotlightStep > 1 && (
            <button
              type="button"
              onClick={handleBack}
              className="px-2.5 py-1.5 rounded-lg bg-surface-elevated text-xs font-medium text-secondary-text hover:text-primary-text flex items-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Back</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleNext}
            className="px-3.5 py-1.5 rounded-lg bg-status-info text-canvas text-xs font-bold hover:bg-opacity-90 flex items-center gap-1.5 shadow-sm transition-all"
          >
            <span>{spotlightStep === 3 ? 'Got it' : 'Next'}</span>
            {spotlightStep === 3 ? <Check className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

    </div>
  );
}

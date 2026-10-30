// frontend/src/App.jsx
import React, { useState } from 'react';
import { useGameGuard } from './context/GameGuardContext';
import Header from './components/Header';
import LandingHero from './components/LandingHero';
import AuthCard from './components/AuthCard';
import NextActionBeacon from './components/NextActionBeacon';
import BentoGrid from './components/Dashboard/BentoGrid';
import SimulatedGameLobby from './components/SimulatedGameLobby';
import GuardCheckModal from './components/GuardCheckModal';
import AgeAssuranceModal from './components/AgeAssuranceModal';
import PrivacyProofModal from './components/PrivacyProofModal';
import SolidityInspectorModal from './components/SolidityInspectorModal';
import NetworkPolicySimulator from './components/NetworkPolicySimulator';
import JudgeDrawer from './components/JudgeDrawer';
import SpotlightTour from './components/SpotlightTour';

export default function App() {
  const {
    user,
    loading,
    guardScanModalOpen,
    setGuardScanModalOpen,
    ageModalOpen,
    setAgeModalOpen,
    privacyProofModalOpen,
    setPrivacyProofModalOpen,
    solidityModalOpen,
    setSolidityModalOpen,
    judgeDrawerOpen,
    setJudgeDrawerOpen,
    gameLobbyOpen,
    setGameLobbyOpen,
    handleRequestAccess
  } = useGameGuard();

  const [simulatorOpen, setSimulatorOpen] = useState(false);
  const [selectedReceiptDetail, setSelectedReceiptDetail] = useState(null);

  // If initial auth check is loading
  if (loading) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-status-safe border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono text-secondary-text">Initializing GameGuard Security Layer...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas flex flex-col selection:bg-status-safe/20 selection:text-status-safe">
      
      {/* Top Header */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 lg:px-8 py-6">
        
        {!user ? (
          /* SCREEN 1: Signed Out State (Hero & Checkpoint Auth) */
          <div className="space-y-6">
            <LandingHero 
              onStartSession={() => {
                const el = document.getElementById('auth-card-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              onExploreDemo={() => setJudgeDrawerOpen(true)}
            />
            
            <div id="auth-card-section" className="pt-2">
              <AuthCard />
            </div>
          </div>
        ) : gameLobbyOpen ? (
          /* SCREEN 2 (LOBBY VIEW): Simulated Multiplayer Game Session */
          <SimulatedGameLobby 
            onReturnToConsole={() => setGameLobbyOpen(false)} 
          />
        ) : (
          /* SCREEN 2 (SOC VIEW): Security Operations Console Dashboard */
          <div className="space-y-6">
            
            {/* Guided Next-Action Beacon */}
            <NextActionBeacon 
              onRunGuard={() => setGuardScanModalOpen(true)}
              onOpenAge={() => setAgeModalOpen(true)}
              onRequestAccess={handleRequestAccess}
              onOpenLobby={() => setGameLobbyOpen(true)}
            />

            {/* Bento Grid (6 core security cards) */}
            <BentoGrid 
              onRunGuard={() => setGuardScanModalOpen(true)}
              onOpenAge={() => setAgeModalOpen(true)}
              onViewProofDetails={() => setPrivacyProofModalOpen(true)}
              onRequestAccess={handleRequestAccess}
              onOpenLobby={() => setGameLobbyOpen(true)}
              onViewReceipt={(rec) => {
                setSelectedReceiptDetail(rec);
                setPrivacyProofModalOpen(true);
              }}
              onOpenContract={() => setSolidityModalOpen(true)}
              onOpenSimulator={() => setSimulatorOpen(true)}
            />

          </div>
        )}

      </main>

      {/* Footer / Honest Boundary Notice */}
      <footer className="w-full border-t border-surface-border/60 py-4 px-4 text-center text-xs text-secondary-text bg-canvas">
        <p>
          GameGuard Prototype • MST Blockchain Buildathon Round 2 • Honest Boundary: Local demo simulator without live OS firewall hooks or public chain fees.
        </p>
      </footer>

      {/* Modals & Slide-out Drawers */}
      <GuardCheckModal 
        isOpen={guardScanModalOpen} 
        onClose={() => setGuardScanModalOpen(false)} 
      />

      <AgeAssuranceModal 
        isOpen={ageModalOpen} 
        onClose={() => setAgeModalOpen(false)} 
      />

      <PrivacyProofModal 
        isOpen={privacyProofModalOpen} 
        onClose={() => setPrivacyProofModalOpen(false)} 
      />

      <SolidityInspectorModal 
        isOpen={solidityModalOpen} 
        onClose={() => setSolidityModalOpen(false)} 
      />

      <NetworkPolicySimulator 
        isOpen={simulatorOpen} 
        onClose={() => setSimulatorOpen(false)} 
      />

      <JudgeDrawer 
        isOpen={judgeDrawerOpen} 
        onClose={() => setJudgeDrawerOpen(false)} 
        onOpenContractModal={() => {
          setJudgeDrawerOpen(false);
          setSolidityModalOpen(true);
        }}
      />

      {/* Spotlight Tour for first-time session onboarding */}
      <SpotlightTour />

    </div>
  );
}

// frontend/src/components/Dashboard/BentoGrid.jsx
import React from 'react';
import GuardStatusCard from './GuardStatusCard';
import AgeClaimCard from './AgeClaimCard';
import NetworkAccessCard from './NetworkAccessCard';
import SecurityEventsTimeline from './SecurityEventsTimeline';
import PolicyLedgerCard from './PolicyLedgerCard';
import ProtectionControlsCard from './ProtectionControlsCard';

export default function BentoGrid({
  onRunGuard,
  onOpenAge,
  onViewProofDetails,
  onRequestAccess,
  onOpenLobby,
  onViewReceipt,
  onOpenContract,
  onOpenSimulator
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      
      {/* 1. Guard Status Card */}
      <GuardStatusCard onRunCheckAgain={onRunGuard} />

      {/* 2. Age Claim Card */}
      <AgeClaimCard 
        onViewProofDetails={onViewProofDetails} 
        onOpenAgeModal={onOpenAge} 
      />

      {/* 3. Network Access Card */}
      <NetworkAccessCard 
        onRequestAccess={onRequestAccess} 
        onOpenLobby={onOpenLobby} 
      />

      {/* 4. Security Events Timeline (Spans 2 cols on tablet/desktop if desired or standard grid) */}
      <SecurityEventsTimeline />

      {/* 5. Policy Ledger Receipts Card */}
      <PolicyLedgerCard 
        onViewReceipt={onViewReceipt} 
        onOpenContract={onOpenContract} 
      />

      {/* 6. Protection Controls Card */}
      <ProtectionControlsCard 
        onOpenSimulator={onOpenSimulator} 
      />

    </div>
  );
}

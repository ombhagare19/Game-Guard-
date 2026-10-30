// frontend/src/context/GameGuardContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, getStoredToken, setStoredToken } from '../utils/api';
import confetti from 'canvas-confetti';

const GameGuardContext = createContext(null);

export function GameGuardProvider({ children }) {
  const [token, setToken] = useState(getStoredToken());
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals & Drawers
  const [judgeDrawerOpen, setJudgeDrawerOpen] = useState(false);
  const [privacyProofModalOpen, setPrivacyProofModalOpen] = useState(false);
  const [solidityModalOpen, setSolidityModalOpen] = useState(false);
  const [guardScanModalOpen, setGuardScanModalOpen] = useState(false);
  const [ageModalOpen, setAgeModalOpen] = useState(false);
  const [gameLobbyOpen, setGameLobbyOpen] = useState(false);

  // Tour Spotlight state (1 = Guard Status, 2 = Privacy Proof, 3 = Activity Timeline, null = closed)
  const [spotlightStep, setSpotlightStep] = useState(() => {
    return localStorage.getItem('gameguard_tour_completed') ? null : null; // Start tour when appropriate
  });

  // Security & Ledger Data
  const [ledgerReceipts, setLedgerReceipts] = useState([]);
  const [ledgerMeta, setLedgerMeta] = useState(null);
  const [ledgerSummary, setLedgerSummary] = useState(null);
  const [securityEvents, setSecurityEvents] = useState([]);
  const [contractData, setContractData] = useState(null);

  // Live Workflow Status
  const [workflowStages, setWorkflowStages] = useState({
    auth: { name: 'Account Authentication', status: 'pending', timestamp: null, reason: 'Waiting for sign-in' },
    guard: { name: 'Session & Guard Policy', status: 'pending', timestamp: null, reason: 'Pending guard scan' },
    age: { name: 'Privacy Age Assurance', status: 'pending', timestamp: null, reason: 'Pending zero-PII check' },
    claimHash: { name: 'Tamper-Evident SHA-256', status: 'pending', timestamp: null, reason: 'Waiting for claim canonicalization' },
    network: { name: 'Network Policy Gate', status: 'pending', timestamp: null, reason: 'Requires guard & age verification' },
    lobby: { name: 'Secure Game Access', status: 'pending', timestamp: null, reason: 'Lobby access locked until approved' }
  });

  // Fetch current session profile
  const fetchSession = useCallback(async () => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await api.getMe();
      setUser(res.user);
      updateWorkflowFromUser(res.user);
    } catch (err) {
      console.warn('Session expired or invalid:', err.message);
      setStoredToken(null);
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Fetch Ledger & Events
  const refreshLedger = useCallback(async (filter = 'all') => {
    try {
      const res = await api.getLedger(filter);
      setLedgerReceipts(res.receipts || []);
      setLedgerMeta(res.meta || null);
      setLedgerSummary(res.summary || null);
    } catch (err) {
      console.error('Failed to fetch ledger:', err);
    }
  }, []);

  const refreshEvents = useCallback(async () => {
    try {
      const res = await api.getEvents(30);
      setSecurityEvents(res.events || []);
    } catch (err) {
      console.error('Failed to fetch security events:', err);
    }
  }, []);

  const fetchContract = useCallback(async () => {
    try {
      const res = await api.getContract();
      setContractData(res);
    } catch (err) {
      console.error('Failed to fetch contract:', err);
    }
  }, []);

  // Update Workflow Stages based on user state
  const updateWorkflowFromUser = (userData) => {
    const now = new Date().toLocaleTimeString();
    setWorkflowStages(prev => {
      const updated = { ...prev };
      
      // Auth
      if (userData) {
        updated.auth = {
          name: 'Account Authentication',
          status: 'passed',
          timestamp: prev.auth.timestamp || now,
          reason: `Authenticated as ${userData.identifier}`
        };
      } else {
        updated.auth = { name: 'Account Authentication', status: 'pending', timestamp: null, reason: 'Waiting for sign-in' };
      }

      // Guard
      if (userData?.guardStatus === 'verified') {
        updated.guard = {
          name: 'Session & Guard Policy',
          status: 'passed',
          timestamp: userData.lastCheckTime ? new Date(userData.lastCheckTime).toLocaleTimeString() : now,
          reason: 'Session integrity and network policy checks passed'
        };
      } else if (userData?.guardStatus === 'review') {
        updated.guard = {
          name: 'Session & Guard Policy',
          status: 'failed',
          timestamp: now,
          reason: 'Review required due to elevated risk anomalies'
        };
      } else {
        updated.guard = { name: 'Session & Guard Policy', status: 'pending', timestamp: null, reason: 'Pending guard scan' };
      }

      // Age & Claim
      if (userData?.claim && userData.claim.status === 'verified') {
        updated.age = {
          name: 'Privacy Age Assurance',
          status: 'passed',
          timestamp: new Date(userData.claim.timestamp).toLocaleTimeString(),
          reason: 'Age threshold confirmed (No PII stored)'
        };
        updated.claimHash = {
          name: 'Tamper-Evident SHA-256',
          status: 'passed',
          timestamp: new Date(userData.claim.timestamp).toLocaleTimeString(),
          reason: `Fingerprint ${userData.claim.claimHash.slice(0, 10)}... anchored`
        };
      } else if (userData?.claim && userData.claim.status === 'revoked') {
        updated.age = { name: 'Privacy Age Assurance', status: 'failed', timestamp: now, reason: 'Claim marked as revoked' };
        updated.claimHash = { name: 'Tamper-Evident SHA-256', status: 'failed', timestamp: now, reason: 'Claim revoked' };
      } else {
        updated.age = { name: 'Privacy Age Assurance', status: 'pending', timestamp: null, reason: 'Pending zero-PII check' };
        updated.claimHash = { name: 'Tamper-Evident SHA-256', status: 'pending', timestamp: null, reason: 'Waiting for claim canonicalization' };
      }

      // Network Access
      if (userData?.networkAccess === 'allowed') {
        updated.network = {
          name: 'Network Policy Gate',
          status: 'passed',
          timestamp: now,
          reason: 'All safety gates cleared. Access granted'
        };
        updated.lobby = {
          name: 'Secure Game Access',
          status: 'passed',
          timestamp: now,
          reason: 'Session active in game lobby'
        };
      } else {
        updated.network = {
          name: 'Network Policy Gate',
          status: userData?.guardStatus === 'review' || userData?.riskLevel === 'high' ? 'failed' : 'pending',
          timestamp: null,
          reason: 'Access denied or pending checkpoint approval'
        };
        updated.lobby = {
          name: 'Secure Game Access',
          status: 'pending',
          timestamp: null,
          reason: 'Lobby access locked until approved'
        };
      }

      return updated;
    });
  };

  useEffect(() => {
    fetchSession();
    refreshLedger();
    refreshEvents();
    fetchContract();
  }, [fetchSession, refreshLedger, refreshEvents, fetchContract]);

  // Compute Current Guided Next Step
  const getNextStep = () => {
    if (!user) {
      return {
        label: 'Sign In or Create Account',
        description: 'Establish authenticated session to begin security verification.',
        action: 'auth',
        completed: false
      };
    }
    if (user.guardStatus !== 'verified') {
      return {
        label: 'Run GameGuard Verification',
        description: 'Verify session integrity, account policy, and baseline network signals.',
        action: 'guard',
        completed: false
      };
    }
    if (!user.claim || user.claim.status !== 'verified') {
      return {
        label: 'Complete One-Time Age Assurance',
        description: 'Verify age threshold once without publishing birth date or ID scan.',
        action: 'age',
        completed: false
      };
    }
    if (user.networkAccess !== 'allowed') {
      return {
        label: 'Request Network Access',
        description: 'Evaluate final network policy gate and receive matchmaking token.',
        action: 'access',
        completed: false
      };
    }
    return {
      label: 'Enter Secure Game Lobby',
      description: 'Session verified. All safety gates passed.',
      action: 'lobby',
      completed: true
    };
  };

  // Auth Handlers
  const handleLogin = async (identifier, password) => {
    setError(null);
    try {
      const res = await api.login(identifier, password);
      setStoredToken(res.token);
      setToken(res.token);
      setUser(res.user);
      updateWorkflowFromUser(res.user);
      await refreshLedger();
      await refreshEvents();
      
      // Start spotlight tour for new session if not completed
      if (!localStorage.getItem('gameguard_tour_completed')) {
        setSpotlightStep(1);
      }
      return res;
    } catch (err) {
      setError(err.message);
      await refreshEvents();
      throw err;
    }
  };

  const handleRegister = async (identifier, password) => {
    setError(null);
    try {
      const res = await api.register(identifier, password);
      setStoredToken(res.token);
      setToken(res.token);
      setUser(res.user);
      updateWorkflowFromUser(res.user);
      await refreshLedger();
      await refreshEvents();
      
      if (!localStorage.getItem('gameguard_tour_completed')) {
        setSpotlightStep(1);
      }
      return res;
    } catch (err) {
      setError(err.message);
      await refreshEvents();
      throw err;
    }
  };

  const handleLogout = () => {
    setStoredToken(null);
    setToken(null);
    setUser(null);
    setGameLobbyOpen(false);
    updateWorkflowFromUser(null);
  };

  // Verification Handlers
  const handleRunGuardCheck = async () => {
    try {
      const res = await api.verifyGuard();
      await fetchSession();
      await refreshEvents();
      return res;
    } catch (err) {
      setError(err.message);
      await refreshEvents();
      throw err;
    }
  };

  const handleVerifyAge = async (isOverThreshold, claimType = 'AGE_OVER_13') => {
    try {
      const res = await api.verifyAge(isOverThreshold, claimType);
      await fetchSession();
      await refreshLedger();
      await refreshEvents();

      if (isOverThreshold) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 }
        });
      }
      return res;
    } catch (err) {
      setError(err.message);
      await refreshEvents();
      throw err;
    }
  };

  const handleRequestAccess = async () => {
    try {
      const res = await api.evaluateAccess();
      await fetchSession();
      await refreshEvents();
      if (res.allowed) {
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.6 }
        });
      }
      return res;
    } catch (err) {
      setError(err.message);
      await refreshEvents();
      throw err;
    }
  };

  // Scenario Simulator
  const handleSimulateScenario = async (scenario) => {
    try {
      const res = await api.simulateAnomaly(scenario);
      await fetchSession();
      await refreshLedger();
      await refreshEvents();
      return res;
    } catch (err) {
      setError(err.message);
      await refreshEvents();
      throw err;
    }
  };

  // Reset Demo Data
  const handleResetDemo = async () => {
    try {
      await api.resetDemo();
      setStoredToken(null);
      setToken(null);
      setUser(null);
      setGameLobbyOpen(false);
      localStorage.removeItem('gameguard_tour_completed');
      setSpotlightStep(null);
      await refreshLedger();
      await refreshEvents();
      updateWorkflowFromUser(null);
    } catch (err) {
      console.error('Reset failed:', err);
    }
  };

  // Revocation Handlers
  const handleRevokeSession = async () => {
    try {
      await api.revokeSession();
      handleLogout();
      await refreshEvents();
    } catch (err) {
      console.error('Revoke session failed:', err);
    }
  };

  const handleRevokeClaim = async () => {
    try {
      await api.revokeClaim();
      await fetchSession();
      await refreshLedger();
      await refreshEvents();
    } catch (err) {
      console.error('Revoke claim failed:', err);
    }
  };

  const finishTour = () => {
    localStorage.setItem('gameguard_tour_completed', 'true');
    setSpotlightStep(null);
  };

  const value = {
    token,
    user,
    loading,
    error,
    setError,
    workflowStages,
    nextStep: getNextStep(),
    ledgerReceipts,
    ledgerMeta,
    ledgerSummary,
    securityEvents,
    contractData,
    
    // Modals
    judgeDrawerOpen,
    setJudgeDrawerOpen,
    privacyProofModalOpen,
    setPrivacyProofModalOpen,
    solidityModalOpen,
    setSolidityModalOpen,
    guardScanModalOpen,
    setGuardScanModalOpen,
    ageModalOpen,
    setAgeModalOpen,
    gameLobbyOpen,
    setGameLobbyOpen,

    // Tour
    spotlightStep,
    setSpotlightStep,
    finishTour,

    // Actions
    handleLogin,
    handleRegister,
    handleLogout,
    handleRunGuardCheck,
    handleVerifyAge,
    handleRequestAccess,
    handleSimulateScenario,
    handleResetDemo,
    handleRevokeSession,
    handleRevokeClaim,
    refreshLedger,
    refreshEvents
  };

  return (
    <GameGuardContext.Provider value={value}>
      {children}
    </GameGuardContext.Provider>
  );
}

export function useGameGuard() {
  const context = useContext(GameGuardContext);
  if (!context) {
    throw new Error('useGameGuard must be used within a GameGuardProvider');
  }
  return context;
}

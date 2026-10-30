// frontend/src/utils/api.js
const API_BASE = '/api';

export function getStoredToken() {
  return localStorage.getItem('gameguard_token') || null;
}

export function setStoredToken(token) {
  if (token) {
    localStorage.setItem('gameguard_token', token);
  } else {
    localStorage.removeItem('gameguard_token');
  }
}

async function apiRequest(endpoint, method = 'GET', data = null) {
  const headers = {
    'Content-Type': 'application/json',
  };

  const token = getStoredToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = { method, headers };
  if (data && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(data);
  }

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, options);
    const result = await res.json().catch(() => ({}));

    if (!res.ok) {
      const err = new Error(result.error || `Request failed with status ${res.status}`);
      err.status = res.status;
      err.data = result;
      throw err;
    }

    return result;
  } catch (error) {
    throw error;
  }
}

export const api = {
  // Auth
  register: (identifier, password) => apiRequest('/register', 'POST', { identifier, password }),
  login: (identifier, password) => apiRequest('/login', 'POST', { identifier, password }),
  getMe: () => apiRequest('/me', 'GET'),
  
  // Guard Check
  verifyGuard: () => apiRequest('/guard/verify', 'POST'),

  // Age Assurance
  verifyAge: (isOverThreshold, claimType = 'AGE_OVER_13') =>
    apiRequest('/age/verify', 'POST', { isOverThreshold, claimType }),

  // Network Access
  evaluateAccess: () => apiRequest('/network/access', 'POST'),

  // Ledger & Security Events
  getLedger: (filter = 'all', page = 1) => apiRequest(`/ledger?filter=${filter}&page=${page}`, 'GET'),
  getEvents: (limit = 20) => apiRequest(`/events?limit=${limit}`, 'GET'),

  // Threat & Anomaly Simulation
  simulateAnomaly: (scenario) => apiRequest('/events/simulate', 'POST', { scenario }),

  // Session & Claim Revocation
  revokeSession: () => apiRequest('/session/revoke', 'POST'),
  revokeClaim: () => apiRequest('/claim/revoke', 'POST'),

  // Solidity Contract & Demo Controls
  getContract: () => apiRequest('/contract', 'GET'),
  resetDemo: () => apiRequest('/demo/reset', 'POST'),
  getExportUrl: () => `${API_BASE}/export`
};

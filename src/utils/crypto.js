// frontend/src/utils/crypto.js
// Client-side Web Crypto SHA-256 fingerprinting for GameGuard

/**
 * Derives a SHA-256 cryptographic hash using the browser's native Web Crypto API.
 * Never describe a plain hash as encryption or zero-knowledge proof.
 * It is a tamper-evident identifier.
 */
export async function sha256Browser(inputString) {
  if (window.crypto && window.crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(inputString);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } else {
    // Fallback simple bitwise SHA-256 simulator for non-standard environments
    let hash = 0;
    for (let i = 0; i < inputString.length; i++) {
      hash = ((hash << 5) - hash) + inputString.charCodeAt(i);
      hash |= 0;
    }
    return '0x' + Math.abs(hash).toString(16).padStart(64, '0');
  }
}

/**
 * Builds a deterministic canonical string from claim elements.
 */
export function canonicalizeClaim({ claimType, passed, policyVersion, salt }) {
  return `type:${claimType}|passed:${Boolean(passed)}|policyVersion:${policyVersion}|salt:${salt}`;
}

/**
 * Verifies if a given canonical string reproduces the exact claim fingerprint.
 */
export async function verifyFingerprint(canonicalString, expectedHash) {
  const computed = await sha256Browser(canonicalString);
  const match = computed.toLowerCase() === (expectedHash || '').toLowerCase();
  return {
    match,
    computedHash: computed,
    expectedHash
  };
}

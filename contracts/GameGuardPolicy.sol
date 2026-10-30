// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title GameGuardPolicy
 * @author GameGuard Engineering Team
 * @notice Privacy-first smart contract for anchoring zero-PII claim fingerprints
 *         and access decisions for gaming network sessions.
 * 
 * NON-NEGOTIABLE PRIVACY RULES:
 * - NO personal identifiable information (PII) is ever written to this contract.
 * - NO player names, emails, dates of birth, or identity images are accepted.
 * - Only 32-byte cryptographic claim hashes (SHA-256 / poseidon / keccak),
 *   minimal status enums, policy versions, and timestamps are recorded.
 *
 * MST BLOCKCHAIN BUILDATHON - ROUND 2 - MVP SPECIFICATION
 */
contract GameGuardPolicy {
    // --- Custom Errors ---
    error ClaimAlreadyExists(bytes32 claimHash);
    error ClaimNotFound(bytes32 claimHash);
    error ClaimAlreadyRevoked(bytes32 claimHash);
    error InvalidClaimHash();
    error InvalidSessionRef();
    error Unauthorized();

    // --- State Variables ---
    address public owner;
    uint32 public currentPolicyVersion = 1;

    // Claim Types: 1 = AGE_ASSURANCE_OVER_13, 2 = AGE_ASSURANCE_OVER_18, 3 = GUARDIAN_CONSENT
    enum ClaimType {
        UNKNOWN,
        AGE_OVER_13,
        AGE_OVER_18,
        GUARDIAN_CONSENT
    }

    // Reason Codes for Access Decision
    // 0 = OK, 1 = CLAIM_MISSING, 2 = CLAIM_REVOKED, 3 = REPEATED_LOGIN_FAILURES,
    // 4 = UNUSUAL_REQUEST_BURST, 5 = SESSION_REVOKED, 6 = HIGH_RISK_SUSPICIOUS
    enum AccessReasonCode {
        ALLOWED_OK,
        CLAIM_MISSING,
        CLAIM_REVOKED,
        REPEATED_LOGIN_FAILURES,
        UNUSUAL_REQUEST_BURST,
        SESSION_REVOKED,
        HIGH_RISK_SUSPICIOUS
    }

    struct ClaimRecord {
        bool exists;
        uint8 claimType;
        bool passed;
        uint32 policyVersion;
        uint256 registeredAt;
        bool revoked;
        uint256 revokedAt;
    }

    struct AccessDecisionRecord {
        bool recorded;
        bool allowed;
        uint8 reasonCode;
        uint256 timestamp;
    }

    // Mapping of claim hash -> verification record
    mapping(bytes32 => ClaimRecord) private _claims;

    // Mapping of session reference (anonymized hash) -> access decision
    mapping(bytes32 => AccessDecisionRecord) private _accessDecisions;

    // Count of claims registered
    uint256 public totalClaimsRegistered;
    uint256 public totalDecisionsRecorded;

    // --- Events ---
    event ClaimRecorded(
        bytes32 indexed claimHash,
        uint8 indexed claimType,
        bool passed,
        uint32 policyVersion,
        uint256 timestamp
    );

    event ClaimRevoked(
        bytes32 indexed claimHash,
        uint256 timestamp
    );

    event AccessDecisionRecorded(
        bytes32 indexed sessionRef,
        bool allowed,
        uint8 reasonCode,
        uint256 timestamp
    );

    event PolicyVersionUpdated(
        uint32 previousVersion,
        uint32 newVersion,
        uint256 timestamp
    );

    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    constructor() {
        owner = msg.sender;
        emit OwnershipTransferred(address(0), msg.sender);
    }

    /**
     * @notice Registers a minimal privacy-preserving claim fingerprint.
     * @param claimHash 32-byte cryptographic hash of canonicalized claim.
     * @param claimType Claim category (e.g., 1 for age over 13, 2 for age over 18).
     * @param passed Whether the provider confirmed verification passed.
     * @param policyVersion The version of the verification policy applied.
     */
    function registerClaim(
        bytes32 claimHash,
        uint8 claimType,
        bool passed,
        uint32 policyVersion
    ) external {
        if (claimHash == bytes32(0)) revert InvalidClaimHash();
        if (_claims[claimHash].exists) revert ClaimAlreadyExists(claimHash);

        _claims[claimHash] = ClaimRecord({
            exists: true,
            claimType: claimType,
            passed: passed,
            policyVersion: policyVersion,
            registeredAt: block.timestamp,
            revoked: false,
            revokedAt: 0
        });

        unchecked {
            totalClaimsRegistered++;
        }

        emit ClaimRecorded(
            claimHash,
            claimType,
            passed,
            policyVersion,
            block.timestamp
        );
    }

    /**
     * @notice Revokes a previously registered claim without deleting historical data.
     * @param claimHash 32-byte hash identifying the claim to invalidate.
     */
    function revokeClaim(bytes32 claimHash) external {
        if (!_claims[claimHash].exists) revert ClaimNotFound(claimHash);
        if (_claims[claimHash].revoked) revert ClaimAlreadyRevoked(claimHash);

        _claims[claimHash].revoked = true;
        _claims[claimHash].revokedAt = block.timestamp;

        emit ClaimRevoked(claimHash, block.timestamp);
    }

    /**
     * @notice Records an access decision evaluated by the network guard.
     * @param sessionRef Anonymized 32-byte token/hash representing the player session.
     * @param allowed True if access granted, false if rejected.
     * @param reasonCode Standardized reason code (e.g., 0 = ALLOWED_OK).
     */
    function recordAccessDecision(
        bytes32 sessionRef,
        bool allowed,
        uint8 reasonCode
    ) external {
        if (sessionRef == bytes32(0)) revert InvalidSessionRef();

        _accessDecisions[sessionRef] = AccessDecisionRecord({
            recorded: true,
            allowed: allowed,
            reasonCode: reasonCode,
            timestamp: block.timestamp
        });

        unchecked {
            totalDecisionsRecorded++;
        }

        emit AccessDecisionRecorded(sessionRef, allowed, reasonCode, block.timestamp);
    }

    /**
     * @notice Checks whether a given claim fingerprint is active and valid.
     * @param claimHash 32-byte hash to inspect.
     */
    function isClaimValid(bytes32 claimHash) external view returns (bool) {
        ClaimRecord memory record = _claims[claimHash];
        return record.exists && record.passed && !record.revoked;
    }

    /**
     * @notice Retrieves full record details for an existing claim.
     */
    function getClaim(bytes32 claimHash)
        external
        view
        returns (
            bool exists,
            uint8 claimType,
            bool passed,
            uint32 policyVersion,
            uint256 registeredAt,
            bool revoked,
            uint256 revokedAt
        )
    {
        ClaimRecord memory rec = _claims[claimHash];
        return (
            rec.exists,
            rec.claimType,
            rec.passed,
            rec.policyVersion,
            rec.registeredAt,
            rec.revoked,
            rec.revokedAt
        );
    }

    /**
     * @notice Retrieves access decision record for a session reference.
     */
    function getAccessDecision(bytes32 sessionRef)
        external
        view
        returns (
            bool recorded,
            bool allowed,
            uint8 reasonCode,
            uint256 timestamp
        )
    {
        AccessDecisionRecord memory dec = _accessDecisions[sessionRef];
        return (dec.recorded, dec.allowed, dec.reasonCode, dec.timestamp);
    }

    /**
     * @notice Updates the current policy version for the gaming network.
     */
    function updatePolicyVersion(uint32 newVersion) external onlyOwner {
        uint32 oldVersion = currentPolicyVersion;
        currentPolicyVersion = newVersion;
        emit PolicyVersionUpdated(oldVersion, newVersion, block.timestamp);
    }

    /**
     * @notice Transfer contract administration.
     */
    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert Unauthorized();
        address oldOwner = owner;
        owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}

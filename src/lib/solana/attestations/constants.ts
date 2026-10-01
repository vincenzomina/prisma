/**
 * PRISMA's Solana Attestation Service (SAS) layout.
 *
 * Each organizer wallet owns one Credential named PRISMA (the wallet is the
 * credential authority and its only authorized signer). Under it, one Schema
 * describes an award. Each award is one Attestation whose nonce is derived
 * from the PRISMA Award ID, so its address can be recomputed by anyone.
 *
 * Only non-personal fields go on-chain: no recipient name, no description.
 */
export const SAS_CREDENTIAL_NAME = "PRISMA";
export const SAS_SCHEMA_NAME = "PRISMA_AWARD";
export const SAS_SCHEMA_VERSION = 1;
export const SAS_SCHEMA_DESCRIPTION = "PRISMA verifiable award v1";

/** SAS compact layout: 12 = String. */
export const SAS_SCHEMA_FIELDS = [
  "award_id",
  "program",
  "award",
  "issuer",
  "recipient_wallet",
] as const;
export const SAS_SCHEMA_LAYOUT = new Uint8Array([12, 12, 12, 12, 12]);

/** 0 = never expires (per SAS program). */
export const SAS_ATTESTATION_EXPIRY = 0;

/** Minimum Devnet balance before we ask the wallet to sign (rent + fees). */
export const MIN_ISSUER_LAMPORTS = 20_000_000n; // 0.02 SOL

export type AwardAttestationData = Record<(typeof SAS_SCHEMA_FIELDS)[number], string>;

import {
  deserializeAttestationData,
  fetchMaybeAttestation,
  fetchMaybeCredential,
  fetchMaybeSchema,
} from "sas-lib";
import type { Award } from "@/lib/awards/types";
import { getSolanaClient } from "../wallet";
import { SAS_SCHEMA_FIELDS, type AwardAttestationData } from "./constants";
import { awardToAttestationData, deriveAwardAddresses } from "./pdas";

export type VerificationResult =
  | { state: "not_issued" }
  | {
      state: "verified";
      attestation: string;
      credential: string;
      schema: string;
      signer: string;
      expiry: bigint;
      data: AwardAttestationData;
    }
  | { state: "not_found"; attestation: string }
  | { state: "invalid"; attestation: string; reason: string };

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- sas-lib is typed against an older @solana/kit major
const rpc = () => getSolanaClient().rpc as any;

/**
 * Reads the attestation from Solana Devnet and checks it against the award.
 * This — not a stored flag — is what decides "Verified on Solana".
 */
export async function verifyAwardAttestation(award: Award): Promise<VerificationResult> {
  if (!award.attestationAddress || !award.attestationAuthority) return { state: "not_issued" };
  const addr = await deriveAwardAddresses(award.attestationAuthority, award.id);
  const attestation = addr.attestation;
  if (attestation !== award.attestationAddress)
    return {
      state: "invalid",
      attestation: award.attestationAddress,
      reason: "Attestation address does not match this Award ID and issuer.",
    };
  return verifyAt(award, addr);
}

export async function verifyAt(
  award: Award,
  addr: Awaited<ReturnType<typeof deriveAwardAddresses>>,
): Promise<VerificationResult> {
  const r = rpc();
  const attestation = addr.attestation;
  const [att, cred, schema] = await Promise.all([
    fetchMaybeAttestation(r, addr.attestation, { commitment: "confirmed" }),
    fetchMaybeCredential(r, addr.credential, { commitment: "confirmed" }),
    fetchMaybeSchema(r, addr.schema, { commitment: "confirmed" }),
  ]);
  if (!att.exists) return { state: "not_found", attestation };
  if (!cred.exists || !schema.exists)
    return { state: "invalid", attestation, reason: "Credential or schema missing on-chain." };
  const a = att.data;
  if (a.credential !== addr.credential || a.schema !== addr.schema || a.nonce !== addr.nonce)
    return {
      state: "invalid",
      attestation,
      reason: "Attestation is not linked to this award's credential/schema.",
    };
  if (!cred.data.authorizedSigners.includes(a.signer))
    return {
      state: "invalid",
      attestation,
      reason: "Attestation signer is not authorized by the credential.",
    };
  if (a.expiry !== 0n && a.expiry < BigInt(Math.floor(Date.now() / 1000)))
    return { state: "invalid", attestation, reason: "Attestation has expired." };

  let data: AwardAttestationData;
  try {
    data = deserializeAttestationData<AwardAttestationData>(schema.data, new Uint8Array(a.data));
  } catch {
    return { state: "invalid", attestation, reason: "Attestation data could not be decoded." };
  }
  const expected = awardToAttestationData(award);
  const mismatch = SAS_SCHEMA_FIELDS.find((f) => data[f] !== expected[f]);
  if (mismatch)
    return {
      state: "invalid",
      attestation,
      reason: `On-chain "${mismatch}" does not match this award.`,
    };

  return {
    state: "verified",
    attestation,
    credential: addr.credential,
    schema: addr.schema,
    signer: a.signer,
    expiry: a.expiry,
    data,
  };
}

import { getAddressDecoder, type Address } from "@solana/kit";
import { deriveAttestationPda, deriveCredentialPda, deriveSchemaPda } from "sas-lib";
import { SAS_CREDENTIAL_NAME, SAS_SCHEMA_NAME, SAS_SCHEMA_VERSION } from "./constants";
import type { Award } from "@/lib/awards/types";
import type { AwardAttestationData } from "./constants";

/** Deterministic 32-byte nonce: sha256("PRISMA:" + awardId) read as an address. */
export async function awardNonce(awardId: string): Promise<Address> {
  const bytes = new Uint8Array(
    await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`PRISMA:${awardId}`)),
  );
  return getAddressDecoder().decode(bytes);
}

export async function deriveAwardAddresses(authority: string, awardId: string) {
  const [credential] = await deriveCredentialPda({
    authority: authority as Address,
    name: SAS_CREDENTIAL_NAME,
  });
  const [schema] = await deriveSchemaPda({
    credential,
    name: SAS_SCHEMA_NAME,
    version: SAS_SCHEMA_VERSION,
  });
  const nonce = await awardNonce(awardId);
  const [attestation] = await deriveAttestationPda({ credential, schema, nonce });
  return {
    credential: credential as Address,
    schema: schema as Address,
    nonce,
    attestation: attestation as Address,
  };
}

/** The exact fields written on-chain for an award. */
export function awardToAttestationData(a: Award): AwardAttestationData {
  return {
    award_id: a.id,
    program: a.programName,
    award: a.title,
    issuer: a.organizationName,
    recipient_wallet: a.recipientWallet,
  };
}

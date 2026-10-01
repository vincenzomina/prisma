import type { Address, Instruction, Signature, TransactionSigner } from "@solana/kit";
import {
  fetchMaybeAttestation,
  fetchMaybeCredential,
  fetchMaybeSchema,
  getCreateAttestationInstruction,
  getCreateCredentialInstruction,
  getCreateSchemaInstruction,
  serializeAttestationData,
} from "sas-lib";
import type { Award } from "@/lib/awards/types";
import { getSolanaClient } from "../wallet";
import {
  MIN_ISSUER_LAMPORTS,
  SAS_ATTESTATION_EXPIRY,
  SAS_CREDENTIAL_NAME,
  SAS_SCHEMA_DESCRIPTION,
  SAS_SCHEMA_FIELDS,
  SAS_SCHEMA_LAYOUT,
  SAS_SCHEMA_NAME,
} from "./constants";
import { awardToAttestationData, deriveAwardAddresses } from "./pdas";
import { verifyAt, type VerificationResult } from "./verify";

export type IssueStep =
  "checking" | "credential" | "schema" | "attestation" | "confirming" | "verifying";

export interface IssueResult {
  attestationAddress: string;
  attestationAuthority: string;
  signature: string | null; // null when the attestation already existed on-chain
  verification: Extract<VerificationResult, { state: "verified" }>;
}

/* eslint-disable @typescript-eslint/no-explicit-any -- sas-lib is typed against an older @solana/kit major */
async function send(ix: unknown): Promise<Signature> {
  const client = getSolanaClient();
  const result: any = await client.sendTransaction([ix as Instruction]);
  const sig = result?.context?.signature as Signature | undefined;
  if (!sig) throw new Error("Transaction was not sent.");
  await waitForConfirmation(sig);
  return sig;
}

async function waitForConfirmation(sig: Signature) {
  const rpc = getSolanaClient().rpc;
  for (let i = 0; i < 60; i++) {
    const { value } = await rpc.getSignatureStatuses([sig]).send();
    const s = value[0];
    if (s?.err) throw new Error("Transaction failed on Solana.");
    if (s && (s.confirmationStatus === "confirmed" || s.confirmationStatus === "finalized")) return;
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error("Timed out waiting for Solana confirmation.");
}

/**
 * Issues a real SAS attestation for an award, signed by the connected
 * organizer wallet (authority + payer). First run for a wallet also creates
 * its PRISMA credential and schema (one extra signature each).
 */
export async function issueAwardAttestation(
  award: Award,
  onStep: (s: IssueStep) => void = () => {},
): Promise<IssueResult> {
  if (award.isDemo) throw new Error("Demo awards cannot be issued.");
  const client = getSolanaClient();
  const signer = client.wallet.getState().connected?.signer as TransactionSigner | null | undefined;
  if (!signer) throw new Error("Connect a wallet that can sign transactions.");
  const authority = signer.address as Address;
  const rpc: any = client.rpc;

  onStep("checking");
  const { value: balance } = await client.rpc
    .getBalance(authority, { commitment: "confirmed" })
    .send();
  if (balance < MIN_ISSUER_LAMPORTS)
    throw new Error(
      "Your wallet needs a little Devnet SOL to pay network fees. Get free Devnet SOL at faucet.solana.com, then try again.",
    );

  const addr = await deriveAwardAddresses(authority, award.id);

  const cred = await fetchMaybeCredential(rpc, addr.credential, { commitment: "confirmed" });
  if (!cred.exists) {
    onStep("credential");
    await send(
      getCreateCredentialInstruction({
        payer: signer as any,
        credential: addr.credential,
        authority: signer as any,
        name: SAS_CREDENTIAL_NAME,
        signers: [authority],
      }),
    );
  } else if (!cred.data.authorizedSigners.includes(authority)) {
    throw new Error("This wallet is not an authorized signer of its PRISMA credential.");
  }

  let schema = await fetchMaybeSchema(rpc, addr.schema, { commitment: "confirmed" });
  if (!schema.exists) {
    onStep("schema");
    await send(
      getCreateSchemaInstruction({
        authority: signer as any,
        payer: signer as any,
        name: SAS_SCHEMA_NAME,
        credential: addr.credential,
        description: SAS_SCHEMA_DESCRIPTION,
        fieldNames: [...SAS_SCHEMA_FIELDS],
        schema: addr.schema,
        layout: SAS_SCHEMA_LAYOUT,
      }),
    );
    schema = await fetchMaybeSchema(rpc, addr.schema, { commitment: "confirmed" });
    if (!schema.exists) throw new Error("Schema not found after creation.");
  }

  let signature: string | null = null;
  const existing = await fetchMaybeAttestation(rpc, addr.attestation, { commitment: "confirmed" });
  if (!existing.exists) {
    onStep("attestation");
    signature = await send(
      getCreateAttestationInstruction({
        payer: signer as any,
        authority: signer as any,
        credential: addr.credential,
        schema: addr.schema,
        attestation: addr.attestation,
        nonce: addr.nonce,
        expiry: SAS_ATTESTATION_EXPIRY,
        data: serializeAttestationData(schema.data, awardToAttestationData(award)),
      }),
    );
  }

  onStep("verifying");
  const verification = await verifyAt(award, addr);
  if (verification.state !== "verified")
    throw new Error(
      verification.state === "invalid"
        ? verification.reason
        : "Attestation not found on Solana after confirmation.",
    );

  return {
    attestationAddress: addr.attestation,
    attestationAuthority: authority,
    signature,
    verification,
  };
}

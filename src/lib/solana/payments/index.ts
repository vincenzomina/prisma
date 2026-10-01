import type { Address, Signature, TransactionSigner } from "@solana/kit";
import { address, lamports } from "@solana/kit";
import { getTransferSolInstruction } from "@solana-program/system";
import { getAddMemoInstruction } from "@solana-program/memo";
import type { Award } from "@/lib/awards/types";
import { isValidSolanaAddress } from "../address";
import { getSolanaClient } from "../wallet";

/**
 * Reward settlement (Phase 4).
 * Asset: native Devnet SOL. Solana's docs offer no official Devnet stablecoin
 * that works without third-party faucets and token-account setup, so PRISMA
 * never mints a look-alike "USDC".
 * Each payment is one transaction: System Program transfer + SPL Memo
 * "PRISMA:<AWARD_ID>" as the on-chain reference.
 */
export const REWARD_ASSET = "SOL";
export const REWARD_ASSET_LABEL = "SOL (Devnet)";
const FEE_BUFFER = 10_000n;

export type PaymentStep = "preparing" | "awaiting_signature" | "submitting" | "confirming";

export function paymentMemo(awardId: string) {
  return `PRISMA:${awardId}`;
}

/** Decimal SOL string -> lamports, exact (no float math). */
export function solToLamports(amount: string): bigint {
  const m = /^(\d+)(?:\.(\d{1,9}))?$/.exec(amount.trim());
  if (!m) throw new Error("Reward amount must be a number with up to 9 decimals.");
  return BigInt(m[1]!) * 1_000_000_000n + BigInt((m[2] ?? "").padEnd(9, "0"));
}

export function canPayAward(a: Award): string | null {
  if (a.isDemo) return "Demo awards can't be paid.";
  if (a.rewardType !== "monetary") return "This award has no monetary reward.";
  if (a.paymentStatus === "paid") return "Reward already paid.";
  if ((a.rewardAsset ?? "").toUpperCase() !== REWARD_ASSET)
    return `Only ${REWARD_ASSET_LABEL} rewards can be paid on Devnet.`;
  if (!isValidSolanaAddress(a.recipientWallet)) return "Recipient wallet is not valid.";
  return null;
}

export interface PaymentResult {
  signature: string;
  lamports: string;
}

/** Sends the reward, waits for confirmation, then re-reads the tx to check it. */
export async function sendAwardReward(
  award: Award,
  onStep: (s: PaymentStep) => void = () => {},
): Promise<PaymentResult> {
  const blocked = canPayAward(award);
  if (blocked) throw new Error(blocked);
  const client = getSolanaClient();
  const signer = client.wallet.getState().connected?.signer as TransactionSigner | null | undefined;
  if (!signer) throw new Error("Connect a wallet that can sign transactions.");
  if (award.attestationAuthority && signer.address !== award.attestationAuthority)
    throw new Error("Pay from the same wallet that issued this award.");

  onStep("preparing");
  const amount = solToLamports(award.rewardAmount ?? "");
  if (amount <= 0n) throw new Error("Reward amount must be greater than 0.");
  const recipient = address(award.recipientWallet) as Address;
  const { value: balance } = await client.rpc
    .getBalance(signer.address, { commitment: "confirmed" })
    .send();
  if (balance < amount + FEE_BUFFER)
    throw new Error("Not enough Devnet SOL in your wallet. Get some at faucet.solana.com.");

  onStep("awaiting_signature");
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const ixs = [
    getTransferSolInstruction({ source: signer, destination: recipient, amount: lamports(amount) }),
    getAddMemoInstruction({ memo: paymentMemo(award.id) }),
  ];
  const sendPromise: Promise<any> = (client as any).sendTransaction(ixs);
  // Wallet approval happens inside sendTransaction; once it resolves past signing we're submitting.
  const res = await sendPromise;
  onStep("submitting");
  const sig = res?.context?.signature as Signature | undefined;
  if (!sig) throw new Error("Transaction was not sent.");

  onStep("confirming");
  await waitConfirmed(sig);
  await assertPayment(sig, recipient, amount, award.id);
  return { signature: sig, lamports: amount.toString() };
}

async function waitConfirmed(sig: Signature) {
  const rpc = getSolanaClient().rpc;
  for (let i = 0; i < 60; i++) {
    const { value } = await rpc.getSignatureStatuses([sig]).send();
    const s = value[0];
    if (s?.err) throw new Error("Payment failed on Solana.");
    if (s && (s.confirmationStatus === "confirmed" || s.confirmationStatus === "finalized")) return;
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error("Timed out waiting for Solana confirmation.");
}

/** Re-reads the confirmed tx: recipient balance delta and memo must match. */
async function assertPayment(sig: Signature, recipient: Address, amount: bigint, awardId: string) {
  const rpc: any = getSolanaClient().rpc;
  const tx: any = await rpc
    .getTransaction(sig, {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 0,
      encoding: "json",
    })
    .send();
  if (!tx || tx.meta?.err) throw new Error("Confirmed transaction could not be read back.");
  const keys: string[] = tx.transaction.message.accountKeys.map(String);
  const i = keys.indexOf(recipient);
  if (i < 0) throw new Error("Recipient not found in the payment transaction.");
  const delta = BigInt(tx.meta.postBalances[i]) - BigInt(tx.meta.preBalances[i]);
  if (delta !== amount) throw new Error("Paid amount does not match the reward.");
  const logs: string[] = tx.meta.logMessages ?? [];
  if (!logs.some((l) => l.includes(paymentMemo(awardId))))
    throw new Error("Payment reference memo not found.");
}

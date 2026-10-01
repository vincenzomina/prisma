import { useState } from "react";
import { Check, ExternalLink, Loader2, Send } from "lucide-react";
import type { Award } from "@/lib/awards/types";
import { formatReward } from "@/lib/awards/logic";
import { recordConfirmedPayment } from "@/lib/awards/store";
import { useAttestationVerification } from "@/lib/solana/attestations";
import { canPayAward, paymentMemo, sendAwardReward, type PaymentStep } from "@/lib/solana/payments";
import { useWallet } from "@/lib/solana/wallet";
import { shortAddress } from "@/lib/solana/address";
import { explorerTxUrl } from "@/lib/solana/config";
import { TxProgress } from "./TxProgress";

const STEPS: { key: PaymentStep; label: string }[] = [
  { key: "preparing", label: "Preparing" },
  { key: "awaiting_signature", label: "Awaiting signature" },
  { key: "submitting", label: "Submitting" },
  { key: "confirming", label: "Confirming" },
];

type UiState = "not_sent" | PaymentStep | "paid" | "failed";
const LABEL: Record<UiState, string> = {
  not_sent: "Not sent",
  preparing: "Preparing",
  awaiting_signature: "Awaiting signature",
  submitting: "Submitting",
  confirming: "Confirming",
  paid: "Paid",
  failed: "Failed",
};

export function RewardPaymentPanel({ award }: { award: Award }) {
  const wallet = useWallet();
  const { result } = useAttestationVerification(award);
  const [step, setStep] = useState<PaymentStep | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const paid = award.paymentStatus === "paid" && !!award.paymentTransactionSignature;
  const state: UiState = paid ? "paid" : (step ?? (error ? "failed" : "not_sent"));
  const verified = result.state === "verified";
  const blocked = canPayAward(award);

  async function pay() {
    setError(null);
    setConfirming(false);
    try {
      const r = await sendAwardReward(award, setStep);
      recordConfirmedPayment(award.id, r.signature);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(
        /reject|declin|cancel/i.test(msg) ? "You cancelled the request in your wallet." : msg,
      );
    } finally {
      setStep(null);
    }
  }

  return (
    <div className="surface p-6">
      <div className="flex items-center justify-between">
        <p className="eyebrow">Reward</p>
        <span
          className={
            paid
              ? "chip chip-success"
              : state === "failed"
                ? "chip chip-danger"
                : step
                  ? "chip chip-action"
                  : "chip"
          }
        >
          {paid && <Check className="size-3" />}
          {step && <Loader2 className="size-3 animate-spin" />}
          {LABEL[state]}
        </span>
      </div>
      <p className="mt-4 text-2xl font-semibold tracking-tight">{formatReward(award)}</p>

      {paid ? (
        <a
          className="mt-4 flex items-center justify-between gap-2 text-sm hover:text-accent"
          href={explorerTxUrl(award.paymentTransactionSignature!)}
          target="_blank"
          rel="noreferrer"
        >
          <span className="text-muted-foreground">View on Solana Explorer</span>
          <span className="flex items-center gap-1 font-mono text-xs">
            {shortAddress(award.paymentTransactionSignature!)} <ExternalLink className="size-3" />
          </span>
        </a>
      ) : confirming ? (
        <div className="mt-5 space-y-3 rounded-lg border border-primary/40 bg-primary/5 p-4 text-sm">
          <p className="font-medium">Confirm reward payment</p>
          <dl className="space-y-2 text-xs">
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Amount</dt>
              <dd className="font-medium">{formatReward(award)} · Devnet</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Recipient</dt>
              <dd className="break-all text-right font-mono">{award.recipientWallet}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Award reference</dt>
              <dd className="break-all text-right font-mono">{paymentMemo(award.id)}</dd>
            </div>
          </dl>
          <div className="flex gap-2">
            <button className="btn btn-ghost h-9 flex-1" onClick={() => setConfirming(false)}>
              Cancel
            </button>
            <button className="btn btn-primary h-9 flex-1" onClick={pay}>
              Confirm & sign
            </button>
          </div>
        </div>
      ) : (
        <>
          {step && <TxProgress steps={STEPS} current={step} />}
          <button
            className="btn btn-primary mt-5 w-full"
            disabled={!!step || !verified || !!blocked || wallet.status !== "connected"}
            onClick={() => setConfirming(true)}
          >
            {step ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            {step ? `${LABEL[step]}…` : "Send Reward"}
          </button>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            {blocked ??
              (!verified
                ? "Unlocks once the award is verified on Solana."
                : wallet.status !== "connected"
                  ? "Connect the issuing wallet to pay."
                  : "Paid in Devnet SOL from your wallet, referenced by the award ID.")}
          </p>
          {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        </>
      )}
    </div>
  );
}

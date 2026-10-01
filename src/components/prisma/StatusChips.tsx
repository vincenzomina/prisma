import { AlertCircle, Check, Circle, Loader2 } from "lucide-react";
import type { Award } from "@/lib/awards/types";
import { paymentLabel } from "@/lib/awards/logic";
import {
  liveLabel,
  useAttestationVerification,
  type LiveVerification,
} from "@/lib/solana/attestations";

/**
 * Global status semantics:
 * green = confirmed on Solana · purple = in progress / action
 * gray = not issued / inactive · red = failure · amber = demo / caution
 */
export function LiveVerificationChip({ result }: { result: LiveVerification }) {
  const s = result.state;
  const cls =
    s === "verified"
      ? "chip chip-success"
      : s === "checking"
        ? "chip chip-action"
        : s === "invalid" || s === "not_found" || s === "error"
          ? "chip chip-danger"
          : "chip";
  return (
    <span className={cls}>
      {s === "verified" ? (
        <Check className="size-3" />
      ) : s === "checking" ? (
        <Loader2 className="size-3 animate-spin" />
      ) : s === "not_issued" ? (
        <Circle className="size-2" />
      ) : (
        <AlertCircle className="size-3" />
      )}
      {liveLabel(result)}
    </span>
  );
}

/** Status is read live from Solana, never from a stored flag. */
export function VerificationChip({ award }: { award: Award }) {
  const { result } = useAttestationVerification(award);
  return <LiveVerificationChip result={result} />;
}

export function PaymentChip({ award }: { award: Award }) {
  const s = award.paymentStatus;
  const cls =
    s === "paid"
      ? "chip chip-success"
      : s === "pending"
        ? "chip chip-action"
        : s === "failed"
          ? "chip chip-danger"
          : "chip";
  return (
    <span className={cls}>
      {s === "paid" ? (
        <Check className="size-3" />
      ) : s === "failed" ? (
        <AlertCircle className="size-3" />
      ) : (
        <Circle className="size-2" />
      )}
      {paymentLabel(award)}
    </span>
  );
}

export function DemoChip() {
  return <span className="chip chip-warning">Demo</span>;
}

export function DevnetPill() {
  return (
    <span className="chip" title="This MVP runs on Solana Devnet">
      Devnet
    </span>
  );
}

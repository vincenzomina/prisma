import { Check, Circle } from "lucide-react";
import type { Award } from "@/lib/awards/types";
import { paymentLabel, verificationLabel } from "@/lib/awards/logic";

export function VerificationChip({ award }: { award: Award }) {
  const ok = award.verificationStatus === "verified";
  return (
    <span className={ok ? "chip chip-success" : "chip"}>
      {ok ? <Check className="size-3" /> : <Circle className="size-2" />}
      {verificationLabel(award)}
    </span>
  );
}

export function PaymentChip({ award }: { award: Award }) {
  const ok = award.paymentStatus === "paid";
  return (
    <span className={ok ? "chip chip-success" : "chip"}>
      {ok ? <Check className="size-3" /> : <Circle className="size-2" />}
      {paymentLabel(award)}
    </span>
  );
}

export function DemoChip() {
  return <span className="chip chip-warning">Demo data</span>;
}

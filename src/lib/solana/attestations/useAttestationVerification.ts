import { useCallback, useEffect, useState } from "react";
import type { Award } from "@/lib/awards/types";
import { verifyAwardAttestation, type VerificationResult } from "./verify";

export type LiveVerification =
  VerificationResult | { state: "checking" } | { state: "error"; message: string };

/** Live on-chain verification of an award (re-reads Solana Devnet). */
export function useAttestationVerification(award: Award | undefined) {
  const [result, setResult] = useState<LiveVerification>({ state: "checking" });
  const key = award
    ? `${award.id}|${award.attestationAddress ?? ""}|${award.attestationAuthority ?? ""}`
    : "";

  const run = useCallback(() => {
    if (!award) return () => {};
    if (!award.attestationAddress) {
      setResult({ state: "not_issued" });
      return () => {};
    }
    let alive = true;
    setResult({ state: "checking" });
    verifyAwardAttestation(award)
      .then((r) => alive && setResult(r))
      .catch(
        (e: unknown) =>
          alive &&
          setResult({
            state: "error",
            message: e instanceof Error ? e.message : "Could not reach Solana",
          }),
      );
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => run(), [run]);
  return { result, recheck: run };
}

export function liveLabel(r: LiveVerification): string {
  switch (r.state) {
    case "verified":
      return "Verified on Solana";
    case "checking":
      return "Checking Solana…";
    case "not_issued":
      return "Not issued";
    case "not_found":
      return "Attestation not found";
    case "invalid":
      return "Verification failed";
    default:
      return "Could not reach Solana";
  }
}

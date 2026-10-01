import { useState } from "react";
import { ExternalLink, Loader2, RefreshCw, ShieldCheck } from "lucide-react";
import type { Award } from "@/lib/awards/types";
import { recordConfirmedAttestation } from "@/lib/awards/store";
import {
  issueAwardAttestation,
  useAttestationVerification,
  type IssueStep,
} from "@/lib/solana/attestations";
import { useWallet } from "@/lib/solana/wallet";
import { shortAddress } from "@/lib/solana/address";
import { explorerAddressUrl, explorerTxUrl } from "@/lib/solana/config";
import { LiveVerificationChip } from "./StatusChips";

const STEP_LABEL: Record<IssueStep, string> = {
  checking: "Checking wallet…",
  credential: "One-time setup: approve PRISMA credential…",
  schema: "One-time setup: approve award schema…",
  attestation: "Approve the award in your wallet…",
  confirming: "Waiting for Solana confirmation…",
  verifying: "Reading the attestation back from Solana…",
};

export function IssueAttestationPanel({ award }: { award: Award }) {
  const wallet = useWallet();
  const { result, recheck } = useAttestationVerification(award);
  const [step, setStep] = useState<IssueStep | null>(null);
  const [error, setError] = useState<string | null>(null);

  const issued = !!award.attestationAddress;
  const canIssue = !award.isDemo && !issued && wallet.status === "connected" && !step;

  async function issue() {
    setError(null);
    try {
      const r = await issueAwardAttestation(award, setStep);
      recordConfirmedAttestation(award.id, r);
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
    <div className="surface relative overflow-hidden p-6">
      <div className="spectrum-line absolute inset-x-0 top-0 opacity-60" />
      <div className="flex items-center justify-between">
        <p className="eyebrow">Verification</p>
        <LiveVerificationChip result={result} />
      </div>

      {issued ? (
        <div className="mt-4 space-y-3 text-sm">
          {result.state === "invalid" && <p className="text-destructive">{result.reason}</p>}
          {result.state === "error" && <p className="text-destructive">{result.message}</p>}
          <a
            className="flex items-center justify-between gap-2 hover:text-accent"
            href={explorerAddressUrl(award.attestationAddress!)}
            target="_blank"
            rel="noreferrer"
          >
            <span className="text-muted-foreground">Attestation</span>
            <span className="flex items-center gap-1 font-mono text-xs">
              {shortAddress(award.attestationAddress!)} <ExternalLink className="size-3" />
            </span>
          </a>
          {award.attestationTransactionSignature && (
            <a
              className="flex items-center justify-between gap-2 hover:text-accent"
              href={explorerTxUrl(award.attestationTransactionSignature)}
              target="_blank"
              rel="noreferrer"
            >
              <span className="text-muted-foreground">Transaction</span>
              <span className="flex items-center gap-1 font-mono text-xs">
                {shortAddress(award.attestationTransactionSignature)}{" "}
                <ExternalLink className="size-3" />
              </span>
            </a>
          )}
          <button className="btn btn-ghost h-8 w-full" onClick={() => recheck()}>
            <RefreshCw className="size-4" /> Re-check on Solana
          </button>
        </div>
      ) : (
        <>
          <p className="mt-4 text-sm text-muted-foreground">
            Issuing records this award on Solana Devnet with your wallet as the issuer. Only the
            award ID, program, award title, issuer name and recipient wallet are recorded — never
            the recipient's name.
          </p>
          <button className="btn btn-primary mt-5 w-full" disabled={!canIssue} onClick={issue}>
            {step ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ShieldCheck className="size-4" />
            )}
            {step ? STEP_LABEL[step] : "Issue Verified Award"}
          </button>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            {award.isDemo
              ? "Demo awards can't be issued. Create your own award to try it."
              : wallet.status !== "connected"
                ? "Connect your organizer wallet (Devnet) to issue."
                : `Issuing as ${shortAddress(wallet.address!)} · first time needs 3 approvals, then 1.`}
          </p>
          {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        </>
      )}
    </div>
  );
}

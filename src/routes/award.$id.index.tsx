import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Circle, Copy } from "lucide-react";
import { useState } from "react";
import { PrismaMark } from "@/components/prisma/PrismaMark";
import { AwardMissing } from "@/components/prisma/AwardMissing";
import { AWARD_TYPE_LABELS } from "@/lib/awards/types";
import { formatReward, paymentLabel } from "@/lib/awards/logic";
import { liveLabel, useAttestationVerification } from "@/lib/solana/attestations";
import { explorerAddressUrl, explorerTxUrl } from "@/lib/solana/config";
import { shortAddress } from "@/lib/solana/address";
import { useAward } from "@/lib/awards/store";

export const Route = createFileRoute("/award/$id/")({
  head: ({ params }) => ({
    meta: [
      { title: `Award ${params.id} — PRISMA` },
      {
        name: "description",
        content:
          "A PRISMA award: who issued it, what was achieved, who received it and whether it is authentic.",
      },
      { property: "og:title", content: `Award ${params.id} — PRISMA` },
      {
        property: "og:description",
        content: "View this award and its verification status on PRISMA.",
      },
    ],
  }),
  component: PublicAward,
});

function PublicAward() {
  const { id } = Route.useParams();
  const award = useAward(id);
  const [copied, setCopied] = useState(false);
  const { result } = useAttestationVerification(award);
  if (!award) return <AwardMissing id={id} />;

  // Derived from the live on-chain attestation, not a stored flag.
  const verified = result.state === "verified";
  const paid = award.paymentStatus === "paid";

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="prism-glow absolute inset-0" />
      <div className="grid-faint absolute inset-0" />
      <div className="relative mx-auto max-w-3xl px-5 py-10 md:py-16">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <PrismaMark />
            <span className="text-sm font-semibold tracking-[0.18em]">PRISMA</span>
          </Link>
          {award.isDemo && <span className="chip chip-warning">Demo data</span>}
        </div>

        <article className="surface surface-lift animate-fade-up relative mt-8 overflow-hidden">
          <div className="spectrum-line absolute inset-x-0 top-0 h-[2px]" />
          <div className="px-7 pb-10 pt-12 text-center md:px-14 md:pt-16">
            <span className={verified ? "chip chip-success" : "chip"}>
              {verified ? <Check className="size-3" /> : <Circle className="size-2" />}
              {verified ? "Verified award" : "Unverified award"}
            </span>
            <p className="mt-8 eyebrow">{AWARD_TYPE_LABELS[award.awardType]}</p>
            <h1 className="mx-auto mt-3 max-w-xl font-display text-5xl leading-[1.05] md:text-6xl">
              {award.title}
            </h1>
            <p className="mt-4 text-muted-foreground">{award.programName}</p>

            <div className="mx-auto mt-12 max-w-md">
              <p className="eyebrow">Awarded to</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight">{award.recipientName}</p>
            </div>

            {award.description && (
              <p className="mx-auto mt-8 max-w-lg text-sm leading-relaxed text-muted-foreground">
                {award.description}
              </p>
            )}

            <div className="mx-auto mt-12 grid max-w-md grid-cols-2 gap-6 border-t pt-8 text-left">
              <div>
                <p className="eyebrow">Issued by</p>
                <p className="mt-1.5 font-medium">{award.organizationName}</p>
              </div>
              {award.sponsorName && (
                <div>
                  <p className="eyebrow">Sponsored by</p>
                  <p className="mt-1.5 font-medium">{award.sponsorName}</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid border-t md:grid-cols-2">
            <div className="border-b p-7 md:border-b-0 md:border-r">
              <p className="eyebrow">Verification</p>
              <p
                className={`mt-2 flex items-center gap-2 font-medium ${verified ? "text-success" : ""}`}
              >
                {verified && <Check className="size-4" />}
                {liveLabel(result)}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {verified
                  ? "This award's attestation was read from Solana Devnet just now and matches every field."
                  : result.state === "checking"
                    ? "Reading the attestation from Solana…"
                    : result.state === "invalid"
                      ? result.reason
                      : result.state === "error"
                        ? "Solana could not be reached. Try again shortly."
                        : result.state === "not_found"
                          ? "No attestation exists on Solana for this award."
                          : "This award has not been issued yet, so its authenticity cannot be confirmed."}
              </p>
            </div>
            <div className="p-7">
              <p className="eyebrow">Reward</p>
              <p className="mt-2 text-xl font-semibold tracking-tight">{formatReward(award)}</p>
              {award.rewardType === "monetary" && (
                <p className={`mt-1 text-sm ${paid ? "text-success" : "text-muted-foreground"}`}>
                  {paymentLabel(award)}
                </p>
              )}
            </div>
          </div>

          {award.attestationAddress && (
            <dl className="grid gap-3 border-t p-7 text-sm sm:grid-cols-2">
              <div>
                <dt className="eyebrow">Attestation · Devnet</dt>
                <dd className="mt-1 break-all font-mono text-xs">{award.attestationAddress}</dd>
              </div>
              <div>
                <dt className="eyebrow">Transaction signature</dt>
                <dd className="mt-1 break-all font-mono text-xs">
                  {award.attestationTransactionSignature ?? "—"}
                </dd>
              </div>
              {result.state === "verified" && (
                <div className="sm:col-span-2">
                  <dt className="eyebrow">Signed by issuer wallet</dt>
                  <dd className="mt-1 font-mono text-xs">{shortAddress(result.signer)}</dd>
                </div>
              )}
            </dl>
          )}

          <div className="flex flex-col gap-4 border-t bg-secondary/50 p-7 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="eyebrow">Award ID</p>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(award.id);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
                className="mt-1 flex items-center gap-2 font-mono text-sm hover:text-accent"
              >
                {award.id} {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              </button>
            </div>
            <div className="flex gap-2">
              {award.attestationAddress ? (
                <a
                  className="btn btn-secondary h-9"
                  href={explorerAddressUrl(award.attestationAddress)}
                  target="_blank"
                  rel="noreferrer"
                >
                  View attestation
                </a>
              ) : (
                <button className="btn btn-secondary h-9" disabled>
                  View attestation
                </button>
              )}
              {award.attestationTransactionSignature ? (
                <a
                  className="btn btn-secondary h-9"
                  href={explorerTxUrl(award.attestationTransactionSignature)}
                  target="_blank"
                  rel="noreferrer"
                >
                  View transaction
                </a>
              ) : (
                <button className="btn btn-secondary h-9" disabled>
                  View transaction
                </button>
              )}
            </div>
          </div>
        </article>

        <p className="mt-8 text-center eyebrow">Verifiable awards · Built on Solana</p>
      </div>
    </div>
  );
}

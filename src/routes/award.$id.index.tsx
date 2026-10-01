import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertCircle,
  Check,
  ChevronDown,
  Circle,
  Copy,
  ExternalLink,
  Link2,
  Share2,
} from "lucide-react";
import { useState } from "react";
import { PrismaMark } from "@/components/prisma/PrismaMark";
import { AwardMissing } from "@/components/prisma/AwardMissing";
import { DemoChip, DevnetPill } from "@/components/prisma/StatusChips";
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
          "A PRISMA Award: who issued it, what was achieved, who received it and whether it is verified on Solana.",
      },
      { property: "og:title", content: `Award ${params.id} — PRISMA` },
      {
        property: "og:description",
        content: "View this Award and its live Solana verification on PRISMA.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PublicAward,
});

function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  return {
    copied,
    copy: (key: string, text: string) => {
      navigator.clipboard?.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    },
  };
}

function PublicAward() {
  const { id } = Route.useParams();
  const award = useAward(id);
  const { copied, copy } = useCopy();
  const { result } = useAttestationVerification(award);
  if (!award) return <AwardMissing id={id} />;

  // Derived from the live on-chain attestation, never from a stored flag.
  const verified = result.state === "verified";
  const failed =
    result.state === "invalid" || result.state === "not_found" || result.state === "error";
  const paid = award.paymentStatus === "paid" && !!award.paymentTransactionSignature;
  const canShare = typeof navigator !== "undefined" && "share" in navigator;

  const verifyCopy = verified
    ? "This Award was independently verified against its Solana attestation."
    : result.state === "checking"
      ? "Reading the attestation from Solana…"
      : result.state === "invalid"
        ? result.reason
        : result.state === "error"
          ? "Solana could not be reached. Try again shortly."
          : result.state === "not_found"
            ? "No attestation exists on Solana for this Award."
            : "This Award has not been issued on Solana yet, so it cannot be verified.";

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="prism-glow absolute inset-0" />
      <div className="relative mx-auto max-w-3xl px-5 py-8 md:py-14">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <PrismaMark />
            <span className="text-sm font-semibold tracking-[0.2em]">PRISMA</span>
          </Link>
          <div className="flex items-center gap-2">
            {award.isDemo && <DemoChip />}
            <DevnetPill />
          </div>
        </div>

        {/* Credential — the achievement comes first */}
        <article className="credential animate-fade-up mt-8 px-6 pb-12 pt-12 text-center sm:px-14 md:pt-16">
          <p className={`eyebrow inline-flex items-center gap-2 ${verified ? "text-success" : ""}`}>
            {verified ? <Check className="size-3.5" /> : <PrismaMark className="size-3.5" />}
            {verified ? "Verified Award" : "Award"}
          </p>
          <h1 className="mx-auto mt-6 max-w-xl text-4xl font-semibold leading-[1.05] tracking-[-0.03em] sm:text-5xl md:text-6xl">
            {award.title}
          </h1>
          <p className="mt-4 text-muted-foreground">
            {award.programName} · {AWARD_TYPE_LABELS[award.awardType]}
          </p>

          <div className="mx-auto mt-12 max-w-md">
            <p className="eyebrow">Awarded to</p>
            <p className="mt-3 font-display text-4xl leading-tight sm:text-5xl">
              {award.recipientName}
            </p>
          </div>

          {award.description && (
            <p className="mx-auto mt-8 max-w-lg text-sm leading-relaxed text-muted-foreground">
              {award.description}
            </p>
          )}

          <div className="hairline mx-auto mt-12 max-w-md" />
          <div className="mx-auto mt-8 grid max-w-md grid-cols-2 gap-6 text-left">
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
        </article>

        {/* Share */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <button className="btn btn-ghost h-8 px-3 text-xs" onClick={() => copy("id", award.id)}>
            {copied === "id" ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            <span className="font-mono">{award.id}</span>
          </button>
          <button
            className="btn btn-ghost h-8 px-3 text-xs"
            onClick={() => copy("url", window.location.href)}
          >
            {copied === "url" ? <Check className="size-3.5" /> : <Link2 className="size-3.5" />}
            {copied === "url" ? "Link copied" : "Copy link"}
          </button>
          {canShare && (
            <button
              className="btn btn-ghost h-8 px-3 text-xs"
              onClick={() =>
                navigator
                  .share({ title: `${award.title} — PRISMA`, url: window.location.href })
                  .catch(() => {})
              }
            >
              <Share2 className="size-3.5" /> Share
            </button>
          )}
        </div>
        {!award.isDemo && (
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Award details are stored in this browser for now; the proof itself lives on Solana.
          </p>
        )}

        <div className="mt-8 grid gap-4 md:grid-cols-[1.4fr_1fr]">
          {/* Verification */}
          <section className="surface p-6" aria-labelledby="v-h">
            <p id="v-h" className="eyebrow">
              Verification
            </p>
            <p
              className={`mt-3 flex items-center gap-2 font-mono text-sm uppercase tracking-wider ${
                verified ? "text-success" : failed ? "text-destructive" : "text-muted-foreground"
              }`}
            >
              {verified ? (
                <span className="dot" />
              ) : failed ? (
                <AlertCircle className="size-4" />
              ) : (
                <Circle className="size-2.5" />
              )}
              {liveLabel(result)}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{verifyCopy}</p>
            {award.attestationAddress && (
              <a
                className="btn btn-secondary mt-5 h-9"
                href={explorerAddressUrl(award.attestationAddress)}
                target="_blank"
                rel="noreferrer"
              >
                View proof <ExternalLink className="size-3.5" />
              </a>
            )}

            {award.attestationAddress && (
              <details className="group mt-5 border-t pt-4">
                <summary className="flex cursor-pointer list-none items-center justify-between text-sm text-muted-foreground hover:text-foreground">
                  Verification details
                  <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
                </summary>
                <dl className="mt-4 space-y-3 text-sm">
                  <Detail label="Network" value="Solana Devnet" />
                  <Detail label="Attestation" value={award.attestationAddress} mono />
                  {award.attestationTransactionSignature && (
                    <Detail
                      label="Transaction"
                      value={award.attestationTransactionSignature}
                      mono
                      href={explorerTxUrl(award.attestationTransactionSignature)}
                    />
                  )}
                  {result.state === "verified" && (
                    <Detail label="Issuer wallet" value={shortAddress(result.signer)} mono />
                  )}
                </dl>
              </details>
            )}
          </section>

          {/* Reward */}
          <section className="surface p-6" aria-labelledby="r-h">
            <p id="r-h" className="eyebrow">
              Reward
            </p>
            <p className="mt-3 text-2xl font-semibold tracking-tight">{formatReward(award)}</p>
            {award.rewardType === "monetary" ? (
              <>
                <p
                  className={`mt-3 flex items-center gap-2 font-mono text-xs uppercase tracking-wider ${paid ? "text-success" : "text-muted-foreground"}`}
                >
                  {paid ? <span className="dot" /> : <Circle className="size-2.5" />}
                  {paid ? "Paid" : paymentLabel(award)}
                </p>
                {paid && (
                  <a
                    className="btn btn-secondary mt-5 h-9"
                    href={explorerTxUrl(award.paymentTransactionSignature!)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View transaction <ExternalLink className="size-3.5" />
                  </a>
                )}
              </>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">No payout attached.</p>
            )}
          </section>
        </div>

        <p className="mt-10 text-center eyebrow">Verifiable awards · Built on Solana</p>
      </div>
    </div>
  );
}

function Detail({
  label,
  value,
  mono,
  href,
}: {
  label: string;
  value: string;
  mono?: boolean;
  href?: string;
}) {
  return (
    <div>
      <dt className="eyebrow">{label}</dt>
      <dd className={`mt-1 break-all ${mono ? "font-mono text-xs" : ""}`}>
        {href ? (
          <a href={href} target="_blank" rel="noreferrer" className="hover:text-accent">
            {value}
          </a>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}

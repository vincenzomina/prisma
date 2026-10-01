import { createFileRoute, Link } from "@tanstack/react-router";
import { ExternalLink, Send } from "lucide-react";
import { AppShell } from "@/components/prisma/AppShell";
import { DemoChip, PaymentChip } from "@/components/prisma/StatusChips";
import { IssueAttestationPanel } from "@/components/prisma/IssueAttestationPanel";
import { AWARD_TYPE_LABELS } from "@/lib/awards/types";
import { formatReward } from "@/lib/awards/logic";
import { useAward } from "@/lib/awards/store";
import { AwardMissing } from "@/components/prisma/AwardMissing";

export const Route = createFileRoute("/award/$id/manage")({
  head: ({ params }) => ({
    meta: [
      { title: `Manage ${params.id} — PRISMA` },
      { name: "description", content: "Manage award verification and reward delivery." },
      { property: "og:title", content: `Manage ${params.id} — PRISMA` },
      { property: "og:description", content: "Award management in PRISMA." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Manage,
});

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 py-3 sm:flex-row sm:justify-between sm:gap-6">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium sm:text-right">{children}</span>
    </div>
  );
}

function Manage() {
  const { id } = Route.useParams();
  const award = useAward(id);
  if (!award) return <AwardMissing id={id} />;

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-5 py-12">
        <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
          ← Dashboard
        </Link>
        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs text-muted-foreground">{award.id}</span>
              {award.isDemo && <DemoChip />}
            </div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">{award.title}</h1>
            <p className="mt-1 text-muted-foreground">{award.programName}</p>
          </div>
          <Link to="/award/$id" params={{ id: award.id }} className="btn btn-secondary">
            Public page <ExternalLink className="size-4" />
          </Link>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-6">
            <div className="surface divide-y px-6">
              <p className="eyebrow py-4">Award</p>
              <Row label="Type">{AWARD_TYPE_LABELS[award.awardType]}</Row>
              {award.description && (
                <Row label="Description">
                  <span className="font-normal">{award.description}</span>
                </Row>
              )}
              <Row label="Created">
                {new Date(award.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" })}
              </Row>
            </div>
            <div className="surface divide-y px-6">
              <p className="eyebrow py-4">Recipient</p>
              <Row label="Name">{award.recipientName}</Row>
              <Row label="Wallet">
                <span className="break-all font-mono text-xs">{award.recipientWallet}</span>
              </Row>
            </div>
            <div className="surface divide-y px-6">
              <p className="eyebrow py-4">Program & issuer</p>
              <Row label="Program">{award.programName}</Row>
              <Row label="Organization">{award.organizationName}</Row>
              {award.sponsorName && <Row label="Sponsor">{award.sponsorName}</Row>}
            </div>
          </div>

          <div className="space-y-6">
            <IssueAttestationPanel award={award} />

            <div className="surface p-6">
              <div className="flex items-center justify-between">
                <p className="eyebrow">Reward</p>
                {award.rewardType === "monetary" && <PaymentChip award={award} />}
              </div>
              <p className="mt-4 text-2xl font-semibold tracking-tight">{formatReward(award)}</p>
              {award.rewardType === "monetary" ? (
                <>
                  <button
                    className="btn btn-secondary mt-5 w-full"
                    disabled
                    title="Available after verification"
                  >
                    <Send className="size-4" /> Send Reward
                  </button>
                  <p className="mt-2 text-center text-xs text-muted-foreground">
                    Unlocks once the award is verified.
                  </p>
                </>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">
                  No payout attached to this award.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

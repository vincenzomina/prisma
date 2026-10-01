import { createFileRoute, Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { AppShell } from "@/components/prisma/AppShell";
import { DemoChip } from "@/components/prisma/StatusChips";
import { IssueAttestationPanel } from "@/components/prisma/IssueAttestationPanel";
import { RewardPaymentPanel } from "@/components/prisma/RewardPaymentPanel";
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

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="py-2">
      <p className="eyebrow pb-1 pt-4">{title}</p>
      {children}
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

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div className="surface divide-y px-6">
            <Group title="Award">
              <Row label="Title">{award.title}</Row>
              <Row label="Type">{AWARD_TYPE_LABELS[award.awardType]}</Row>
              {award.description && (
                <Row label="Description">
                  <span className="font-normal">{award.description}</span>
                </Row>
              )}
              <Row label="Created">
                {new Date(award.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" })}
              </Row>
            </Group>
            <Group title="Recipient">
              <Row label="Name">{award.recipientName}</Row>
              <Row label="Wallet">
                <span className="break-all font-mono text-xs">{award.recipientWallet}</span>
              </Row>
            </Group>
            <Group title="Issuer">
              <Row label="Program">{award.programName}</Row>
              <Row label="Organization">{award.organizationName}</Row>
              {award.sponsorName && <Row label="Sponsor">{award.sponsorName}</Row>}
            </Group>
          </div>

          <div className="space-y-4">
            <p className="eyebrow">Solana · Devnet execution</p>
            <IssueAttestationPanel award={award} />

            {award.rewardType === "monetary" ? (
              <RewardPaymentPanel award={award} />
            ) : (
              <div className="surface p-6">
                <p className="eyebrow">Reward</p>
                <p className="mt-4 text-2xl font-semibold tracking-tight">{formatReward(award)}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  No payout attached to this award.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

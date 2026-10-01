import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowUpRight, Plus, Trash2 } from "lucide-react";
import { AppShell } from "@/components/prisma/AppShell";
import { DemoChip, PaymentChip, VerificationChip } from "@/components/prisma/StatusChips";
import { DEMO_PROGRAMS } from "@/lib/awards/demo";
import { formatReward } from "@/lib/awards/logic";
import { deleteAward, useAwards } from "@/lib/awards/store";
import type { Award } from "@/lib/awards/types";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — PRISMA" },
      {
        name: "description",
        content: "Manage Programs, Awards and rewards in your PRISMA organizer dashboard.",
      },
      { property: "og:title", content: "Dashboard — PRISMA" },
      {
        property: "og:description",
        content: "Organizer dashboard for Programs, Awards and rewards.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const awards = useAwards();
  const programNames = Array.from(new Set(awards.map((a) => a.programName)));

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Organizer</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Programs</h1>
          </div>
          <Link to="/award/create" className="btn btn-primary">
            <Plus className="size-4" /> Create Award
          </Link>
        </div>

        <div className="mt-10 space-y-14">
          {programNames.map((name) => (
            <ProgramBlock
              key={name}
              name={name}
              awards={awards.filter((a) => a.programName === name)}
            />
          ))}
        </div>
      </div>
    </AppShell>
  );
}

function ProgramBlock({ name, awards }: { name: string; awards: Award[] }) {
  const meta = DEMO_PROGRAMS.find((p) => p.name === name);
  const org = meta?.organization ?? awards[0]?.organizationName;
  const issued = awards.filter((a) => !!a.attestationAddress).length;
  const paid = awards.filter((a) => a.paymentStatus === "paid").length;
  const allDemo = awards.every((a) => a.isDemo);

  return (
    <section aria-label={name}>
      <div className="credential p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Program</p>
            <h2 className="mt-2 text-2xl font-semibold uppercase tracking-tight">{name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {org}
              {meta?.period ? ` · ${meta.period}` : ""}
            </p>
          </div>
          {allDemo && <DemoChip />}
        </div>
        <dl className="mt-8 flex flex-wrap gap-x-12 gap-y-4">
          <Metric label="Awards" value={awards.length} />
          <Metric label="Issued" value={issued} hint="Re-checked live on Solana" />
          <Metric label="Rewards delivered" value={paid} hint="Confirmed payments" />
        </dl>
      </div>

      <div className="mt-2">
        <div className="hidden grid-cols-[2fr_1.3fr_1fr_1fr_auto] gap-4 px-4 py-3 md:grid">
          {["Award", "Recipient", "Verification", "Reward", ""].map((h) => (
            <span key={h} className="eyebrow">
              {h}
            </span>
          ))}
        </div>
        <ul>
          {awards.map((a) => (
            <li key={a.id} className="border-b last:border-0">
              <div className="flex items-center">
                <Link
                  to="/award/$id/manage"
                  params={{ id: a.id }}
                  className="grid min-w-0 flex-1 gap-3 rounded-md px-4 py-4 transition-colors hover:bg-secondary/60 md:grid-cols-[2fr_1.3fr_1fr_1fr_auto] md:items-center md:gap-4"
                >
                  <div className="min-w-0">
                    <p className="font-medium">{a.title}</p>
                    <p className="truncate font-mono text-[11px] text-muted-foreground">{a.id}</p>
                  </div>
                  <p className="text-sm">
                    <span className="text-muted-foreground md:hidden">To </span>
                    {a.recipientName}
                  </p>
                  <div>
                    <VerificationChip award={a} />
                  </div>
                  <div className="flex flex-wrap items-center gap-2 md:flex-col md:items-start md:gap-1">
                    <span className="text-sm">{formatReward(a)}</span>
                    {a.rewardType === "monetary" && <PaymentChip award={a} />}
                  </div>
                  <ArrowUpRight className="hidden size-4 text-muted-foreground md:block" />
                </Link>
                <DeleteAwardButton award={a} />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/**
 * Two-step delete for awards the organizer created. Demo awards are sample
 * content, not the organizer's records, so they cannot be deleted here.
 */
function DeleteAwardButton({ award }: { award: Award }) {
  const [confirming, setConfirming] = useState(false);

  if (award.isDemo) return null;

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        aria-label={`Delete ${award.title}`}
        title="Delete award"
        className="btn btn-ghost ml-1 size-9 shrink-0 justify-center p-0"
      >
        <Trash2 className="size-4" />
      </button>
    );
  }

  const touchedOnChain =
    !!award.attestationAddress || award.paymentStatus === "paid";

  return (
    <div className="ml-1 flex shrink-0 items-center gap-2 pr-1">
      {touchedOnChain && (
        <span
          className="hidden max-w-64 text-right text-[11px] leading-tight text-warning lg:block"
          role="note"
        >
          The on-chain proof stays on Solana — this only removes your local record.
        </span>
      )}
      <button
        type="button"
        onClick={() => {
          deleteAward(award.id);
        }}
        className="btn justify-center border border-destructive/50 px-3 text-destructive hover:bg-destructive/10"
      >
        Delete
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="btn btn-ghost px-2"
      >
        Cancel
      </button>
    </div>
  );
}

function Metric({ label, value, hint }: { label: string; value: number; hint?: string }) {
  return (
    <div>
      <dt className="eyebrow">{label}</dt>
      <dd className="mt-1 text-3xl font-semibold tabular-nums tracking-tight">{value}</dd>
      {hint && <dd className="text-xs text-muted-foreground">{hint}</dd>}
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Plus } from "lucide-react";
import { AppShell } from "@/components/prisma/AppShell";
import { DemoChip, PaymentChip, VerificationChip } from "@/components/prisma/StatusChips";
import { DEMO_PROGRAMS } from "@/lib/awards/demo";
import { formatReward } from "@/lib/awards/logic";
import { useAwards } from "@/lib/awards/store";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — PRISMA" },
      {
        name: "description",
        content: "Manage programs, awards and rewards in your PRISMA organizer dashboard.",
      },
      { property: "og:title", content: "Dashboard — PRISMA" },
      {
        property: "og:description",
        content: "Organizer dashboard for programs, awards and rewards.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const awards = useAwards();
  const issued = awards.filter((a) => !!a.attestationAddress).length;
  const paid = awards.filter((a) => a.paymentStatus === "paid").length;

  const metrics = [
    { label: "Awards", value: awards.length, note: "Created" },
    { label: "Issued awards", value: issued, note: "Each row is re-checked on Solana" },
    { label: "Rewards delivered", value: paid, note: "Confirmed payments" },
  ];

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Organizer</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">PRISMA Dashboard</h1>
          </div>
          <Link to="/award/create" className="btn btn-primary">
            <Plus className="size-4" /> Create Award
          </Link>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {metrics.map((m) => (
            <div key={m.label} className="surface p-6">
              <p className="eyebrow">{m.label}</p>
              <p className="mt-4 text-4xl font-semibold tabular-nums tracking-tight">{m.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{m.note}</p>
            </div>
          ))}
        </div>

        <section className="mt-12">
          <h2 className="text-sm font-semibold">Programs</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {DEMO_PROGRAMS.map((p) => {
              const count = awards.filter((a) => a.programName === p.name).length;
              return (
                <div key={p.name} className="surface relative overflow-hidden p-6">
                  <div className="spectrum-line absolute inset-x-0 top-0 opacity-70" />
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold">{p.name}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {p.organization} · {p.period}
                      </p>
                    </div>
                    <DemoChip />
                  </div>
                  <p className="mt-6 text-sm text-muted-foreground">
                    {count} award{count === 1 ? "" : "s"}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-sm font-semibold">Recent awards</h2>
          <div className="surface mt-4 overflow-hidden">
            <div className="hidden grid-cols-[2fr_1.2fr_1.4fr_1fr_1fr_auto] gap-4 border-b px-6 py-3 md:grid">
              {["Award", "Recipient", "Program", "Verification", "Reward", ""].map((h) => (
                <span key={h} className="eyebrow">
                  {h}
                </span>
              ))}
            </div>
            {awards.map((a) => (
              <Link
                key={a.id}
                to="/award/$id/manage"
                params={{ id: a.id }}
                className="grid gap-2 border-b px-6 py-4 transition-colors last:border-0 hover:bg-secondary/60 md:grid-cols-[2fr_1.2fr_1.4fr_1fr_1fr_auto] md:items-center md:gap-4"
              >
                <div>
                  <p className="font-medium">{a.title}</p>
                  <p className="font-mono text-xs text-muted-foreground">{a.id}</p>
                </div>
                <p className="text-sm">{a.recipientName}</p>
                <p className="text-sm text-muted-foreground">{a.programName}</p>
                <div>
                  <VerificationChip award={a} />
                </div>
                <div className="flex flex-col items-start gap-1">
                  <span className="text-sm">{formatReward(a)}</span>
                  {a.rewardType === "monetary" && <PaymentChip award={a} />}
                </div>
                <ArrowUpRight className="hidden size-4 text-muted-foreground md:block" />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

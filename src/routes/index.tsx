import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Award as AwardIcon, Circle, Coins, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/prisma/AppShell";
import { PrismaMark } from "@/components/prisma/PrismaMark";
import { DEMO_AWARDS } from "@/lib/awards/demo";
import { formatReward } from "@/lib/awards/logic";

const TITLE = "PRISMA — Verifiable awards. Programmable rewards.";
const DESC =
  "Infrastructure for trusted recognition, verifiable achievements and programmable rewards.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const steps = [
  { k: "01", tag: "Create", body: "Create structured recognition." },
  { k: "02", tag: "Verify", body: "Issue verifiable proof using Solana attestations." },
  { k: "03", tag: "Reward", body: "Deliver the optional associated reward." },
  { k: "04", tag: "Prove", body: "Share portable evidence of the achievement." },
];
const stepColor = ["#9945FF", "#6F6BFF", "#45C8FF", "#14F195"];

const pillars = [
  { tag: "Recognize", body: "Turn achievements into structured digital Awards.", Icon: AwardIcon },
  {
    tag: "Verify",
    body: "Create issuer-backed proof, independently verifiable on Solana.",
    Icon: ShieldCheck,
  },
  {
    tag: "Reward",
    body: "Link recognition directly to transparent, programmable settlement.",
    Icon: Coins,
  },
];

const useCases = [
  "Hackathons",
  "Corporate innovation",
  "Universities",
  "Accelerators",
  "Research awards",
  "Developer programs",
  "Communities",
  "Sponsor challenges",
];

function Landing() {
  const demo = DEMO_AWARDS[0]!;
  return (
    <AppShell>
      <section id="product" className="relative scroll-mt-20 overflow-hidden">
        <div className="grid-faint absolute inset-0" />
        <div className="prism-glow absolute inset-0" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 pb-24 pt-16 md:pt-24 lg:grid-cols-[1.15fr_1fr]">
          <div className="animate-fade-up">
            <span className="eyebrow inline-flex items-center gap-2">
              <span className="spectrum-line inline-block w-6" /> Built on Solana
            </span>
            <h1 className="mt-6 text-[2.75rem] font-semibold leading-[1.02] tracking-[-0.04em] sm:text-6xl md:text-7xl">
              Verifiable awards.
              <br />
              <span className="spectrum-text">Programmable rewards.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              PRISMA connects recognition, verification and rewards in one infrastructure layer.
            </p>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground/80">
              Built for competitions, innovation programs, universities and incentive initiatives.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link to="/award/create" className="btn btn-primary h-11 px-5">
                Create an Award <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/award/$id"
                params={{ id: demo.id }}
                className="btn btn-secondary h-11 px-5"
              >
                View Live Demo
              </Link>
            </div>
          </div>

          {/* Workflow visualization built from real PRISMA UI styles */}
          <Link
            to="/award/$id"
            params={{ id: demo.id }}
            className="group animate-fade-up block [animation-delay:150ms]"
            aria-label="Open the demo Award"
          >
            <div className="credential p-6 transition-transform duration-300 group-hover:-translate-y-1 sm:p-7">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <PrismaMark className="size-4" />
                  <span className="eyebrow">Award</span>
                </span>
                <span className="chip chip-warning">Demo</span>
              </div>
              <p className="mt-8 eyebrow">{demo.programName}</p>
              <h3 className="mt-2 text-3xl font-semibold tracking-tight">{demo.title}</h3>
              <p className="mt-5 text-sm text-muted-foreground">Awarded to</p>
              <p className="text-lg font-medium">{demo.recipientName}</p>

              <div className="mt-6 space-y-0 border-t pt-5">
                <FlowRow
                  color="#6F6BFF"
                  label="Verification"
                  value="Solana attestation"
                  status={
                    <span className="chip">
                      <Circle className="size-2" /> Not issued
                    </span>
                  }
                />
                <FlowRow
                  color="#14F195"
                  label="Reward"
                  value={formatReward(demo)}
                  status={
                    <span className="chip">
                      <Circle className="size-2" /> Not sent
                    </span>
                  }
                  last
                />
              </div>
              <p className="mt-5 font-mono text-[11px] text-muted-foreground">{demo.id}</p>
            </div>
          </Link>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-20">
        <p className="eyebrow">How PRISMA works</p>
        <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight md:text-4xl">
          Recognition, proof and reward — one connected workflow.
        </h2>
        <ol className="relative mt-14 grid gap-10 md:grid-cols-4 md:gap-6">
          <div
            className="spectrum-line absolute left-0 right-0 top-[7px] hidden opacity-60 md:block"
            aria-hidden
          />
          {steps.map((s, i) => (
            <li key={s.k} className="relative">
              <span
                className="relative block size-[15px] rounded-full border-2 bg-background"
                style={{ borderColor: stepColor[i] }}
                aria-hidden
              />
              <p className="mt-6 font-mono text-xs text-muted-foreground">{s.k}</p>
              <h3 className="mt-1 text-lg font-semibold tracking-tight uppercase">{s.tag}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12">
        <div className="hairline" />
        <div className="grid gap-10 py-14 md:grid-cols-3">
          {pillars.map(({ tag, body, Icon }) => (
            <div key={tag}>
              <Icon className="size-5 text-accent" />
              <h3 className="mt-5 eyebrow text-foreground">{tag}</h3>
              <p className="mt-2 text-lg leading-snug">{body}</p>
            </div>
          ))}
        </div>
        <div className="hairline" />
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <p className="eyebrow">Use cases</p>
            <p className="mt-3 text-lg">
              Hackathons are the first use case. PRISMA works anywhere an organization recognizes
              achievement.
            </p>
          </div>
          <ul className="flex max-w-xl flex-wrap gap-2">
            {useCases.map((a) => (
              <li
                key={a}
                className="rounded-full border px-3.5 py-1.5 text-sm text-muted-foreground transition-colors hover:border-white/20 hover:text-foreground"
              >
                {a}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </AppShell>
  );
}

function FlowRow({
  color,
  label,
  value,
  status,
  last,
}: {
  color: string;
  label: string;
  value: string;
  status: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div className="relative flex items-center gap-4 py-2.5">
      {!last && (
        <span className="absolute left-[4px] top-[26px] h-[calc(100%-10px)] w-px bg-border" aria-hidden />
      )}
      <span className="size-[9px] shrink-0 rounded-full" style={{ background: color }} aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="eyebrow">{label}</p>
        <p className="truncate text-sm font-medium">{value}</p>
      </div>
      {status}
    </div>
  );
}

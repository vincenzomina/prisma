import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BadgeCheck, FilePlus2, HandCoins } from "lucide-react";
import { AppShell } from "@/components/prisma/AppShell";
import { DEMO_AWARDS } from "@/lib/awards/demo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PRISMA — Verifiable awards. Programmable rewards." },
      {
        name: "description",
        content:
          "Issue trusted recognition, verify achievements and deliver rewards through one seamless infrastructure layer.",
      },
      { property: "og:title", content: "PRISMA — Verifiable awards. Programmable rewards." },
      {
        property: "og:description",
        content:
          "Trust and reward infrastructure for organizations running programs, competitions and incentive initiatives.",
      },
    ],
  }),
  component: Landing,
});

const steps = [
  {
    k: "01",
    tag: "Create",
    title: "Create an Award",
    body: "Define the program, the achievement, the recipient and an optional reward in one structured record.",
    Icon: FilePlus2,
  },
  {
    k: "02",
    tag: "Verify",
    title: "Verify the achievement",
    body: "Issue the award as a tamper-proof attestation anyone can check — no account, no crypto knowledge required.",
    Icon: BadgeCheck,
  },
  {
    k: "03",
    tag: "Reward",
    title: "Deliver the reward",
    body: "Send the associated prize directly to the recipient, linked to the award by its unique ID.",
    Icon: HandCoins,
  },
];

const audiences = [
  "Technology events",
  "Universities",
  "Startup competitions",
  "Accelerators",
  "Grants & scholarships",
  "Developer programs",
  "Corporate innovation",
  "Employee recognition",
];

function Landing() {
  const demo = DEMO_AWARDS[0]!;
  return (
    <AppShell>
      <section id="product" className="relative overflow-hidden">
        <div className="grid-faint absolute inset-0" />
        <div className="prism-glow absolute inset-0" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 pb-24 pt-20 md:pt-28 lg:grid-cols-[1.15fr_1fr]">
          <div className="animate-fade-up">
            <span className="chip">Trust & reward infrastructure</span>
            <h1 className="mt-6 text-5xl font-semibold leading-[1.02] tracking-[-0.035em] sm:text-6xl md:text-7xl">
              Verifiable awards.
              <br />
              <span className="font-display font-normal italic tracking-[-0.01em]">
                Programmable rewards.
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              Issue trusted recognition, verify achievements and deliver rewards through one
              seamless infrastructure layer.
            </p>
            <p className="mt-3 max-w-xl text-sm text-muted-foreground">
              Built for organizations running programs, competitions and incentive initiatives.
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
                View Demo Award
              </Link>
            </div>
          </div>

          <Link
            to="/award/$id"
            params={{ id: demo.id }}
            className="group animate-fade-up block [animation-delay:150ms]"
          >
            <div className="surface surface-lift relative overflow-hidden p-7 transition-transform duration-300 group-hover:-translate-y-1">
              <div className="spectrum-line absolute inset-x-0 top-0" />
              <div className="flex items-center justify-between">
                <span className="eyebrow">PRISMA · Award</span>
                <span className="chip chip-warning">Demo</span>
              </div>
              <p className="mt-10 eyebrow">{demo.programName}</p>
              <h3 className="mt-2 font-display text-4xl leading-tight">{demo.title}</h3>
              <div className="mt-8 grid grid-cols-2 gap-4 border-t pt-5 text-sm">
                <div>
                  <p className="eyebrow">Awarded to</p>
                  <p className="mt-1 font-medium">{demo.recipientName}</p>
                </div>
                <div>
                  <p className="eyebrow">Sponsored by</p>
                  <p className="mt-1 font-medium">{demo.sponsorName}</p>
                </div>
              </div>
              <p className="mt-6 font-mono text-xs text-muted-foreground">{demo.id}</p>
            </div>
          </Link>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-20">
        <p className="eyebrow">How it works</p>
        <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight md:text-4xl">
          Recognition, proof and reward — connected in one workflow.
        </h2>
        <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border bg-border md:grid-cols-3">
          {steps.map(({ k, tag, title, body, Icon }) => (
            <div key={k} className="bg-card p-8">
              <div className="flex items-center justify-between">
                <span className="eyebrow">
                  {k} · {tag}
                </span>
                <Icon className="size-5 text-muted-foreground" />
              </div>
              <h3 className="mt-10 text-xl font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5">
        <div className="surface flex flex-col gap-8 p-8 md:flex-row md:items-center md:justify-between md:p-10">
          <div className="max-w-md">
            <p className="eyebrow">Made for structured programs</p>
            <p className="mt-3 text-lg">
              Hackathons are just the start. PRISMA works anywhere an organization recognizes
              achievement.
            </p>
          </div>
          <div className="flex max-w-lg flex-wrap gap-2">
            {audiences.map((a) => (
              <span key={a} className="rounded-full border px-3 py-1 text-sm text-muted-foreground">
                {a}
              </span>
            ))}
          </div>
        </div>
      </section>
    </AppShell>
  );
}

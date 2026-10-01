import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Circle } from "lucide-react";
import { AppShell } from "@/components/prisma/AppShell";
import { PrismaMark } from "@/components/prisma/PrismaMark";
import { createDraftAward, isValidSolanaAddress } from "@/lib/awards/logic";
import { saveAward } from "@/lib/awards/store";
import {
  AWARD_TYPE_LABELS,
  REWARD_TYPE_LABELS,
  type AwardType,
  type RewardType,
  REWARD_ASSETS,
} from "@/lib/awards/types";

export const Route = createFileRoute("/award/create")({
  head: () => ({
    meta: [
      { title: "Create Award — PRISMA" },
      {
        name: "description",
        content: "Create a new award with recipient, issuer and optional reward.",
      },
      { property: "og:title", content: "Create Award — PRISMA" },
      {
        property: "og:description",
        content: "Define an award, its recipient and an optional reward.",
      },
    ],
  }),
  component: CreateAward,
});

const awardTypes = Object.keys(AWARD_TYPE_LABELS) as AwardType[];
const rewardTypes: RewardType[] = ["recognition_only", "monetary", "non_monetary"];

function Section({ n, title, children }: { n: string; title: string; children: ReactNode }) {
  return (
    <section className="group/step relative grid gap-5 pb-10 pl-10 last:pb-2 md:grid-cols-[150px_1fr] md:gap-6">
      <span
        className="absolute left-[11px] top-7 h-[calc(100%-28px)] w-px bg-border group-last/step:hidden"
        aria-hidden
      />
      <span
        className="absolute left-0 top-0 grid size-6 place-items-center rounded-full border bg-background font-mono text-[10px] text-muted-foreground transition-colors group-focus-within/step:border-primary group-focus-within/step:text-accent"
        aria-hidden
      >
        {n}
      </span>
      <div className="pt-0.5">
        <h2 className="text-sm font-semibold uppercase tracking-wider">{title}</h2>
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

function Field({
  label,
  optional,
  error,
  children,
}: {
  label: string;
  optional?: boolean | undefined;
  error?: string | undefined;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="field-label">
        {label} {optional && <span className="font-normal text-muted-foreground">· optional</span>}
      </span>
      {children}
      {error && <span className="mt-1.5 block text-xs text-destructive">{error}</span>}
    </label>
  );
}

function CreateAward() {
  const navigate = useNavigate();
  const [f, setF] = useState({
    programName: "Business Meets Tech 2026",
    title: "",
    awardType: "winner" as AwardType,
    description: "",
    organizationName: "Business Meets Tech",
    sponsorName: "",
    recipientName: "",
    recipientWallet: "",
    rewardType: "recognition_only" as RewardType,
    rewardAmount: "",
    rewardAsset: "USDC",
    rewardDescription: "",
  });
  const [errors, setErrors] = useState<
    Partial<
      Record<
        | "programName"
        | "title"
        | "organizationName"
        | "recipientName"
        | "recipientWallet"
        | "rewardAmount",
        string
      >
    >
  >({});
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((p) => ({ ...p, [k]: v }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const err: typeof errors = {};
    if (!f.programName.trim()) err.programName = "Program name is required";
    if (!f.title.trim()) err.title = "Award title is required";
    if (!f.organizationName.trim()) err.organizationName = "Organization is required";
    if (!f.recipientName.trim()) err.recipientName = "Recipient name is required";
    if (!f.recipientWallet.trim()) err.recipientWallet = "Recipient wallet is required";
    else if (!isValidSolanaAddress(f.recipientWallet))
      err.recipientWallet = "Not a valid Solana address (must be a 32-byte base58 public key)";
    if (
      f.rewardType === "monetary" &&
      (!(Number(f.rewardAmount) > 0) || !/^\d+(\.\d{1,9})?$/.test(f.rewardAmount.trim()))
    )
      err.rewardAmount = "Enter an amount greater than 0 (up to 9 decimals)";
    setErrors(err);
    if (Object.keys(err).length) return;

    const award = createDraftAward({
      programName: f.programName.trim(),
      title: f.title.trim(),
      awardType: f.awardType,
      description: f.description.trim() || undefined,
      organizationName: f.organizationName.trim(),
      sponsorName: f.sponsorName.trim() || undefined,
      recipientName: f.recipientName.trim(),
      recipientWallet: f.recipientWallet.trim(),
      rewardType: f.rewardType,
      rewardAmount: f.rewardType === "monetary" ? f.rewardAmount : undefined,
      rewardAsset: f.rewardType === "monetary" ? f.rewardAsset.trim() || undefined : undefined,
      rewardDescription:
        f.rewardType === "non_monetary" ? f.rewardDescription.trim() || undefined : undefined,
    });
    saveAward(award);
    navigate({ to: "/award/$id/manage", params: { id: award.id } });
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-5 py-12">
        <p className="eyebrow">New Award</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Create Award</h1>
        <p className="mt-2 text-muted-foreground">
          This creates a draft. Nothing is issued or sent until you choose to.
        </p>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_340px]">
          <form onSubmit={submit} noValidate className="min-w-0">
            <Section n="01" title="Program">
              <Field label="Program name" error={errors.programName}>
                <input
                  className="field-input"
                  aria-invalid={!!errors.programName}
                  value={f.programName}
                  onChange={(e) => set("programName", e.target.value)}
                />
              </Field>
            </Section>

            <Section n="02" title="Award">
              <Field label="Award title" error={errors.title}>
                <input
                  className="field-input"
                  aria-invalid={!!errors.title}
                  placeholder="e.g. Tesla Challenge Winner"
                  value={f.title}
                  onChange={(e) => set("title", e.target.value)}
                />
              </Field>
              <div>
                <span className="field-label">Award type</span>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {awardTypes.map((t) => (
                    <button
                      type="button"
                      key={t}
                      className="option-tile"
                      data-active={f.awardType === t}
                      onClick={() => set("awardType", t)}
                    >
                      {AWARD_TYPE_LABELS[t]}
                    </button>
                  ))}
                </div>
              </div>
              <Field label="Description" optional>
                <textarea
                  rows={3}
                  className="field-input"
                  value={f.description}
                  onChange={(e) => set("description", e.target.value)}
                />
              </Field>
            </Section>

            <Section n="03" title="Issuer">
              <Field label="Organization" error={errors.organizationName}>
                <input
                  className="field-input"
                  aria-invalid={!!errors.organizationName}
                  value={f.organizationName}
                  onChange={(e) => set("organizationName", e.target.value)}
                />
              </Field>
              <Field label="Sponsor" optional>
                <input
                  className="field-input"
                  placeholder="e.g. Tesla"
                  value={f.sponsorName}
                  onChange={(e) => set("sponsorName", e.target.value)}
                />
              </Field>
            </Section>

            <Section n="04" title="Recipient">
              <Field label="Recipient name" error={errors.recipientName}>
                <input
                  className="field-input"
                  aria-invalid={!!errors.recipientName}
                  value={f.recipientName}
                  onChange={(e) => set("recipientName", e.target.value)}
                />
              </Field>
              <Field label="Recipient Solana wallet" error={errors.recipientWallet}>
                <input
                  className="field-input font-mono text-[13px]"
                  aria-invalid={!!errors.recipientWallet}
                  placeholder="Base58 address"
                  value={f.recipientWallet}
                  onChange={(e) => set("recipientWallet", e.target.value)}
                />
              </Field>
            </Section>

            <Section n="05" title="Reward">
              <div className="grid gap-2 sm:grid-cols-3">
                {rewardTypes.map((t) => (
                  <button
                    type="button"
                    key={t}
                    className="option-tile"
                    data-active={f.rewardType === t}
                    onClick={() => set("rewardType", t)}
                  >
                    {REWARD_TYPE_LABELS[t]}
                  </button>
                ))}
              </div>
              {f.rewardType === "monetary" && (
                <div className="grid gap-4 sm:grid-cols-[1fr_160px]">
                  <Field label="Reward amount" error={errors.rewardAmount}>
                    <input
                      inputMode="decimal"
                      className="field-input"
                      aria-invalid={!!errors.rewardAmount}
                      placeholder="500"
                      value={f.rewardAmount}
                      onChange={(e) => set("rewardAmount", e.target.value)}
                    />
                  </Field>
                  <Field label="Reward asset">
                    <select
                      className="field-input"
                      value={f.rewardAsset}
                      onChange={(e) => set("rewardAsset", e.target.value)}
                    >
                      {REWARD_ASSETS.map((a) => (
                        <option key={a.symbol} value={a.symbol}>
                          {a.symbol} · {a.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                  {f.rewardAsset !== "SOL" && (
                    <p className="text-xs text-muted-foreground sm:col-span-2">
                      Only SOL rewards can be sent from PRISMA on Devnet right now. A {f.rewardAsset}{" "}
                      reward is recorded on the award but must be paid outside PRISMA.
                    </p>
                  )}
                </div>
              )}
              {f.rewardType === "non_monetary" && (
                <Field label="Benefit" optional>
                  <input
                    className="field-input"
                    placeholder="e.g. Accelerator interview"
                    value={f.rewardDescription}
                    onChange={(e) => set("rewardDescription", e.target.value)}
                  />
                </Field>
              )}
            </Section>

            <div className="flex items-center justify-end gap-3 border-t py-6">
              <button type="submit" className="btn btn-primary h-11 px-6">
                Create Award
              </button>
            </div>
          </form>
          <aside className="hidden lg:block" aria-label="Award preview">
            <div className="sticky top-24">
              <p className="eyebrow mb-3">Live preview</p>
              <div className="credential p-6">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <PrismaMark className="size-4" />
                    <span className="eyebrow">Draft Award</span>
                  </span>
                  <span className="chip">
                    <Circle className="size-2" /> Not issued
                  </span>
                </div>
                <p className="mt-8 eyebrow truncate">{f.programName || "Program"}</p>
                <h3 className="mt-2 break-words text-2xl font-semibold tracking-tight">
                  {f.title || <span className="text-muted-foreground/60">Award title</span>}
                </h3>
                <p className="mt-6 text-xs text-muted-foreground">Awarded to</p>
                <p className="break-words font-display text-2xl">
                  {f.recipientName || <span className="text-muted-foreground/60">Recipient</span>}
                </p>
                <div className="hairline mt-6" />
                <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
                  <div className="min-w-0">
                    <dt className="eyebrow">Issued by</dt>
                    <dd className="mt-1 truncate">{f.organizationName || "—"}</dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="eyebrow">Sponsor</dt>
                    <dd className="mt-1 truncate">{f.sponsorName || "—"}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="eyebrow">Reward</dt>
                    <dd className="mt-1">
                      {f.rewardType === "monetary"
                        ? `${f.rewardAmount || "—"} ${f.rewardAsset}`
                        : f.rewardType === "non_monetary"
                          ? f.rewardDescription || "Other benefit"
                          : "Recognition only"}
                    </dd>
                  </div>
                </dl>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Verification appears only after the Award is issued on Solana.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}

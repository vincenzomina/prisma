import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { AppShell } from "@/components/prisma/AppShell";
import { createDraftAward, isValidSolanaAddress } from "@/lib/awards/logic";
import { saveAward } from "@/lib/awards/store";
import { AWARD_TYPE_LABELS, REWARD_TYPE_LABELS, type AwardType, type RewardType } from "@/lib/awards/types";

export const Route = createFileRoute("/award/create")({
  head: () => ({
    meta: [
      { title: "Create Award — PRISMA" },
      { name: "description", content: "Create a new award with recipient, issuer and optional reward." },
      { property: "og:title", content: "Create Award — PRISMA" },
      { property: "og:description", content: "Define an award, its recipient and an optional reward." },
    ],
  }),
  component: CreateAward,
});

const awardTypes = Object.keys(AWARD_TYPE_LABELS) as AwardType[];
const rewardTypes: RewardType[] = ["recognition_only", "monetary", "non_monetary"];

function Section({ n, title, children }: { n: string; title: string; children: ReactNode }) {
  return (
    <section className="grid gap-6 border-b py-10 last:border-0 md:grid-cols-[200px_1fr]">
      <div>
        <p className="eyebrow">{n}</p>
        <h2 className="mt-1 font-semibold">{title}</h2>
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

function Field({ label, optional, error, children }: { label: string; optional?: boolean | undefined; error?: string | undefined; children: ReactNode }) {
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
  const [errors, setErrors] = useState<Partial<Record<"programName" | "title" | "organizationName" | "recipientName" | "recipientWallet" | "rewardAmount", string>>>({});
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((p) => ({ ...p, [k]: v }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const err: typeof errors = {};
    if (!f.programName.trim()) err.programName = "Program name is required";
    if (!f.title.trim()) err.title = "Award title is required";
    if (!f.organizationName.trim()) err.organizationName = "Organization is required";
    if (!f.recipientName.trim()) err.recipientName = "Recipient name is required";
    if (!f.recipientWallet.trim()) err.recipientWallet = "Recipient wallet is required";
    else if (!isValidSolanaAddress(f.recipientWallet)) err.recipientWallet = "Not a valid Solana address (must be a 32-byte base58 public key)";
    if (f.rewardType === "monetary" && !(Number(f.rewardAmount) > 0)) err.rewardAmount = "Enter an amount greater than 0";
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
      rewardDescription: f.rewardType === "non_monetary" ? f.rewardDescription.trim() || undefined : undefined,
    });
    saveAward(award);
    navigate({ to: "/award/$id/manage", params: { id: award.id } });
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl px-5 py-12">
        <p className="eyebrow">New award</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Create Award</h1>
        <p className="mt-2 text-muted-foreground">This creates a draft. Nothing is issued or sent until you choose to.</p>

        <form onSubmit={submit} noValidate className="surface mt-10 px-6 md:px-10">
          <Section n="01" title="Program">
            <Field label="Program name" error={errors.programName}>
              <input className="field-input" aria-invalid={!!errors.programName} value={f.programName} onChange={(e) => set("programName", e.target.value)} />
            </Field>
          </Section>

          <Section n="02" title="Award">
            <Field label="Award title" error={errors.title}>
              <input className="field-input" aria-invalid={!!errors.title} placeholder="e.g. Tesla Challenge Winner" value={f.title} onChange={(e) => set("title", e.target.value)} />
            </Field>
            <div>
              <span className="field-label">Award type</span>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {awardTypes.map((t) => (
                  <button type="button" key={t} className="option-tile" data-active={f.awardType === t} onClick={() => set("awardType", t)}>
                    {AWARD_TYPE_LABELS[t]}
                  </button>
                ))}
              </div>
            </div>
            <Field label="Description" optional>
              <textarea rows={3} className="field-input" value={f.description} onChange={(e) => set("description", e.target.value)} />
            </Field>
          </Section>

          <Section n="03" title="Issuer">
            <Field label="Organization" error={errors.organizationName}>
              <input className="field-input" aria-invalid={!!errors.organizationName} value={f.organizationName} onChange={(e) => set("organizationName", e.target.value)} />
            </Field>
            <Field label="Sponsor" optional>
              <input className="field-input" placeholder="e.g. Tesla" value={f.sponsorName} onChange={(e) => set("sponsorName", e.target.value)} />
            </Field>
          </Section>

          <Section n="04" title="Recipient">
            <Field label="Recipient name" error={errors.recipientName}>
              <input className="field-input" aria-invalid={!!errors.recipientName} value={f.recipientName} onChange={(e) => set("recipientName", e.target.value)} />
            </Field>
            <Field label="Recipient Solana wallet" error={errors.recipientWallet}>
              <input className="field-input font-mono text-[13px]" aria-invalid={!!errors.recipientWallet} placeholder="Base58 address" value={f.recipientWallet} onChange={(e) => set("recipientWallet", e.target.value)} />
            </Field>
          </Section>

          <Section n="05" title="Reward">
            <div className="grid gap-2 sm:grid-cols-3">
              {rewardTypes.map((t) => (
                <button type="button" key={t} className="option-tile" data-active={f.rewardType === t} onClick={() => set("rewardType", t)}>
                  {REWARD_TYPE_LABELS[t]}
                </button>
              ))}
            </div>
            {f.rewardType === "monetary" && (
              <div className="grid gap-4 sm:grid-cols-[1fr_160px]">
                <Field label="Reward amount" error={errors.rewardAmount}>
                  <input inputMode="decimal" className="field-input" aria-invalid={!!errors.rewardAmount} placeholder="500" value={f.rewardAmount} onChange={(e) => set("rewardAmount", e.target.value)} />
                </Field>
                <Field label="Reward asset">
                  <input className="field-input" value={f.rewardAsset} onChange={(e) => set("rewardAsset", e.target.value)} />
                </Field>
              </div>
            )}
            {f.rewardType === "non_monetary" && (
              <Field label="Benefit" optional>
                <input className="field-input" placeholder="e.g. Accelerator interview" value={f.rewardDescription} onChange={(e) => set("rewardDescription", e.target.value)} />
              </Field>
            )}
          </Section>

          <div className="flex items-center justify-end gap-3 border-t py-6">
            <button type="submit" className="btn btn-primary h-11 px-6">Create Award</button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}

import type { Award, AwardInput } from "./types";

/** e.g. "Business Meets Tech 2026" -> "BMT26" */
export function programCode(programName: string): string {
  const year = programName.match(/(19|20)(\d{2})/);
  const words = programName
    .replace(/(19|20)\d{2}/g, "")
    .split(/\s+/)
    .filter(Boolean);
  const initials = words.map((w) => w[0]!.toUpperCase()).join("").replace(/[^A-Z0-9]/g, "").slice(0, 4) || "PRG";
  return `${initials}${year ? year[2] : ""}`;
}

export function generateAwardId(programName: string): string {
  const bytes = new Uint8Array(3);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
  return `PRISMA-${programCode(programName)}-${hex}`;
}

/** Basic base58 shape check only. Real validation arrives in Phase 2. */
export function looksLikeSolanaAddress(value: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(value.trim());
}

export function createDraftAward(input: AwardInput): Award {
  return {
    ...input,
    id: generateAwardId(input.programName),
    createdAt: new Date().toISOString(),
    verificationStatus: "draft",
    paymentStatus: input.rewardType === "monetary" ? "not_sent" : "not_applicable",
  };
}

export function verificationLabel(a: Award): string {
  switch (a.verificationStatus) {
    case "verified":
      return "Verified on Solana";
    case "pending":
      return "Pending confirmation";
    case "failed":
      return "Verification failed";
    default:
      return "Not issued";
  }
}

export function paymentLabel(a: Award): string {
  switch (a.paymentStatus) {
    case "paid":
      return "Reward paid";
    case "pending":
      return "Payment pending";
    case "failed":
      return "Payment failed";
    case "not_sent":
      return "Not sent";
    default:
      return "No payout";
  }
}

export function formatReward(a: Award): string {
  if (a.rewardType === "monetary") return `${a.rewardAmount ?? "—"} ${a.rewardAsset ?? ""}`.trim();
  if (a.rewardType === "non_monetary") return a.rewardDescription || "Other benefit";
  return "Recognition only";
}

export function shortWallet(w: string): string {
  return w.length > 12 ? `${w.slice(0, 4)}…${w.slice(-4)}` : w;
}

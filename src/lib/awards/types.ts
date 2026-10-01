export type AwardType =
  "winner" | "finalist" | "achievement" | "recognition" | "contribution" | "milestone" | "other";

export type RewardType = "monetary" | "non_monetary" | "recognition_only";

/** Driven ONLY by confirmed Solana attestations (Phase 3). */
export type VerificationStatus = "draft" | "pending" | "verified" | "failed";

/** Driven ONLY by confirmed Solana payments (Phase 4). */
export type PaymentStatus = "not_applicable" | "not_sent" | "pending" | "paid" | "failed";

export interface Award {
  id: string;
  title: string;
  description?: string | undefined;
  organizationName: string;
  programName: string;
  sponsorName?: string | undefined;
  awardType: AwardType;
  recipientName: string;
  recipientWallet: string;
  rewardType: RewardType;
  rewardAmount?: string | undefined;
  rewardAsset?: string | undefined;
  rewardDescription?: string | undefined;
  createdAt: string;
  verificationStatus: VerificationStatus;
  attestationAddress?: string | undefined;
  attestationTransactionSignature?: string | undefined;
  paymentStatus: PaymentStatus;
  paymentTransactionSignature?: string | undefined;
  isDemo?: boolean;
}

export type AwardInput = Omit<
  Award,
  | "id"
  | "createdAt"
  | "verificationStatus"
  | "paymentStatus"
  | "attestationAddress"
  | "attestationTransactionSignature"
  | "paymentTransactionSignature"
  | "isDemo"
>;

export const AWARD_TYPE_LABELS: Record<AwardType, string> = {
  winner: "Winner",
  finalist: "Finalist",
  achievement: "Achievement",
  recognition: "Recognition",
  contribution: "Contribution",
  milestone: "Milestone",
  other: "Other",
};

export const REWARD_TYPE_LABELS: Record<RewardType, string> = {
  recognition_only: "Recognition only",
  monetary: "Monetary reward",
  non_monetary: "Other benefit",
};

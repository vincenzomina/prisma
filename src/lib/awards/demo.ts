import type { Award } from "./types";

/** Demo data only. No blockchain state — every award is unissued. */
export const DEMO_AWARDS: Award[] = [
  {
    id: "PRISMA-BMT26-A7F42C",
    title: "Tesla Challenge Winner",
    description:
      "Awarded for the winning solution to the Tesla sponsor challenge at Business Meets Tech 2026, selected by the jury from all submitted teams.",
    organizationName: "Business Meets Tech",
    programName: "Business Meets Tech 2026",
    sponsorName: "Tesla",
    awardType: "winner",
    recipientName: "Vincenzo Minano",
    recipientWallet: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    rewardType: "monetary",
    rewardAmount: "500",
    rewardAsset: "USDC",
    createdAt: "2026-09-18T10:00:00.000Z",
    verificationStatus: "draft",
    paymentStatus: "not_sent",
    isDemo: true,
  },
  {
    id: "PRISMA-BMT26-3C19E0",
    title: "Best Business Model — Finalist",
    organizationName: "Business Meets Tech",
    programName: "Business Meets Tech 2026",
    awardType: "finalist",
    recipientName: "Lena Hartmann",
    recipientWallet: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
    rewardType: "recognition_only",
    createdAt: "2026-09-18T10:05:00.000Z",
    verificationStatus: "draft",
    paymentStatus: "not_applicable",
    isDemo: true,
  },
];

export const DEMO_PROGRAMS = [
  { name: "Business Meets Tech 2026", organization: "Business Meets Tech", period: "Sep 2026" },
];

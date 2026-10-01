import { useSyncExternalStore } from "react";
import { DEMO_AWARDS } from "./demo";
import type { Award } from "./types";

/**
 * Local-only award store (Phase 1). Persists user-created drafts in
 * localStorage. Blockchain status fields are never mutated here — they will
 * be written only from confirmed Solana results in later phases.
 */
const KEY = "prisma.awards.v1";
const listeners = new Set<() => void>();
let cache: Award[] | null = null;

function readLocal(): Award[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Award[]) : [];
  } catch {
    return [];
  }
}

function snapshot(): Award[] {
  if (!cache) cache = [...readLocal(), ...DEMO_AWARDS];
  return cache;
}

export function saveAward(award: Award) {
  const local = readLocal().filter((a) => a.id !== award.id);
  window.localStorage.setItem(KEY, JSON.stringify([award, ...local]));
  cache = null;
  listeners.forEach((l) => l());
}

/**
 * Records a CONFIRMED and re-verified SAS attestation for a local award.
 * Callers must pass data returned by issueAwardAttestation only.
 */
export function recordConfirmedAttestation(
  id: string,
  r: { attestationAddress: string; attestationAuthority: string; signature: string | null },
) {
  const local = readLocal();
  const award = local.find((a) => a.id === id);
  if (!award) throw new Error("Only locally created awards can be issued.");
  saveAward({
    ...award,
    verificationStatus: "verified",
    attestationAddress: r.attestationAddress,
    attestationAuthority: r.attestationAuthority,
    attestationTransactionSignature: r.signature ?? award.attestationTransactionSignature,
  });
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

const serverSnapshot = () => DEMO_AWARDS;

export function useAwards(): Award[] {
  return useSyncExternalStore(subscribe, snapshot, serverSnapshot);
}

export function useAward(id: string): Award | undefined {
  return useAwards().find((a) => a.id === id);
}

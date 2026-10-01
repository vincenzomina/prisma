import { isAddress } from "@solana/kit";

/**
 * True only when the value base58-decodes to a 32-byte Solana public key.
 * Uses the official @solana/kit validator.
 */
export function isValidSolanaAddress(value: string): boolean {
  const v = value.trim();
  return v.length > 0 && isAddress(v);
}

export function shortAddress(address: string): string {
  return address.length > 12 ? `${address.slice(0, 4)}…${address.slice(-4)}` : address;
}

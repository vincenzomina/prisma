/** PRISMA runs on Solana Devnet only until a mainnet launch is explicitly approved. */
export const SOLANA_CLUSTER = "devnet" as const;
export const SOLANA_CHAIN = "solana:devnet" as const;
export const SOLANA_RPC_URL = "https://api.devnet.solana.com";
export const WALLET_STORAGE_KEY = "prisma:wallet";

export function explorerAddressUrl(address: string) {
  return `https://explorer.solana.com/address/${address}?cluster=${SOLANA_CLUSTER}`;
}

import { useCallback, useSyncExternalStore } from "react";
import { createClient } from "@solana/kit";
import { solanaRpc } from "@solana/kit-plugin-rpc";
import { walletSigner, type WalletState } from "@solana/kit-plugin-wallet";
import { SOLANA_CHAIN, SOLANA_RPC_URL, WALLET_STORAGE_KEY } from "./config";

/**
 * Wallet foundation (Phase 2).
 * - Browser wallets are discovered via Wallet Standard; the wallet extension
 *   holds the keys. PRISMA never sees, stores, or asks for private keys or
 *   seed phrases — only the public address is read.
 * - Only the last-used wallet name is remembered (for silent reconnect).
 * - The client is created lazily, never at module scope.
 */
function makeClient() {
  return createClient()
    .use(walletSigner({ chain: SOLANA_CHAIN, storageKey: WALLET_STORAGE_KEY }))
    .use(solanaRpc({ rpcUrl: SOLANA_RPC_URL }));
}

let client: ReturnType<typeof makeClient> | null = null;
export function getSolanaClient() {
  if (typeof window === "undefined") throw new Error("Solana client is browser-only");
  if (!client) client = makeClient();
  return client;
}

export type WalletUiStatus = "disconnected" | "connecting" | "connected";
export type DiscoveredWallet = WalletState["wallets"][number];

export interface WalletView {
  status: WalletUiStatus;
  address: string | null;
  walletName: string | null;
  walletIcon: string | null;
  wallets: readonly DiscoveredWallet[];
  ready: boolean;
}

const SERVER_VIEW: WalletView = {
  status: "disconnected",
  address: null,
  walletName: null,
  walletIcon: null,
  wallets: [],
  ready: false,
};

function toStatus(s: WalletState["status"]): WalletUiStatus {
  if (s === "connected") return "connected";
  if (s === "connecting" || s === "reconnecting" || s === "pending") return "connecting";
  return "disconnected";
}

let lastState: WalletState | null = null;
let lastView: WalletView = SERVER_VIEW;
function getView(): WalletView {
  const state = getSolanaClient().wallet.getState();
  if (state === lastState) return lastView;
  lastState = state;
  const c = state.connected;
  const status = toStatus(state.status);
  lastView = {
    status: status === "connecting" && c && state.status !== "connecting" ? "connected" : status,
    address: c ? String(c.account.address) : null,
    walletName: c?.wallet.name ?? null,
    walletIcon: c?.wallet.icon ?? null,
    wallets: state.wallets,
    ready: state.status !== "pending",
  };
  return lastView;
}

function subscribe(cb: () => void) {
  return getSolanaClient().wallet.subscribe(cb);
}

export function useWallet() {
  const view = useSyncExternalStore(subscribe, getView, () => SERVER_VIEW);
  const connect = useCallback(async (w: DiscoveredWallet) => {
    try {
      await getSolanaClient().wallet.connect(w);
    } catch (e) {
      if ((e as Error).name !== "AbortError") throw e;
    }
  }, []);
  const disconnect = useCallback(() => getSolanaClient().wallet.disconnect(), []);
  return { ...view, connect, disconnect };
}

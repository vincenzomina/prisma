import { useEffect, useRef, useState } from "react";
import { ExternalLink, Loader2, LogOut, Wallet } from "lucide-react";
import { useWallet } from "@/lib/solana/wallet";
import { shortAddress } from "@/lib/solana/address";
import { explorerAddressUrl } from "@/lib/solana/config";

export function WalletButton() {
  const w = useWallet();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  async function pick(wallet: (typeof w.wallets)[number]) {
    setError(null);
    try {
      await w.connect(wallet);
      setOpen(false);
    } catch {
      setError("Connection was cancelled or failed.");
    }
  }

  const label =
    w.status === "connected" && w.address
      ? shortAddress(w.address)
      : w.status === "connecting"
        ? "Connecting…"
        : "Connect wallet";

  return (
    <div ref={ref} className="relative">
      <button
        className="inline-flex h-8 items-center gap-2 rounded-md border px-2.5 text-xs text-muted-foreground transition-colors hover:border-white/20 hover:text-foreground"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={w.status === "connected" ? `Wallet ${label} on Devnet` : "Connect wallet"}
        data-status={w.status}
      >
        {w.status === "connecting" ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : w.status === "connected" && w.walletIcon ? (
          <img src={w.walletIcon} alt="" className="size-3.5 rounded-sm" />
        ) : (
          <Wallet className="size-3.5" />
        )}
        <span className="hidden font-mono uppercase tracking-wider sm:inline">Devnet</span>
        <span className="hidden text-border sm:inline" aria-hidden>
          ·
        </span>
        <span className={w.status === "connected" ? "font-mono text-foreground" : "hidden sm:inline"}>
          {label}
        </span>
      </button>

      {open && (
        <div role="menu" className="surface absolute right-0 top-11 z-50 w-72 p-2 shadow-lg">
          <div className="flex items-center justify-between px-2 py-1.5">
            <span className="eyebrow">Wallet</span>
            <span className="chip">Devnet</span>
          </div>
          {w.status === "connected" && w.address ? (
            <div className="space-y-1 p-2">
              <p className="text-xs text-muted-foreground">Connected via {w.walletName}</p>
              <p className="break-all font-mono text-xs">{w.address}</p>
              <a
                href={explorerAddressUrl(w.address)}
                target="_blank"
                rel="noreferrer"
                className="btn btn-ghost mt-2 h-8 w-full justify-start px-2"
              >
                <ExternalLink className="size-4" /> View on Explorer
              </a>
              <button
                className="btn btn-ghost h-8 w-full justify-start px-2"
                onClick={() => {
                  void w.disconnect();
                  setOpen(false);
                }}
              >
                <LogOut className="size-4" /> Disconnect
              </button>
            </div>
          ) : w.wallets.length === 0 ? (
            <p className="p-2 text-sm text-muted-foreground">
              No Solana wallet detected. Install a browser wallet such as Phantom, Solflare or
              Backpack, then reload.
            </p>
          ) : (
            <div className="space-y-1 p-1">
              {w.wallets.map((wallet) => (
                <button
                  key={wallet.name}
                  className="btn btn-ghost h-10 w-full justify-start px-2"
                  disabled={w.status === "connecting"}
                  onClick={() => pick(wallet)}
                >
                  <img src={wallet.icon} alt="" className="size-5 rounded" />
                  {wallet.name}
                </button>
              ))}
            </div>
          )}
          {error && <p className="px-2 pb-2 text-xs text-destructive">{error}</p>}
          <p className="border-t px-2 pt-2 text-[11px] text-muted-foreground">
            PRISMA only reads your public address. It will never ask for your seed phrase.
          </p>
        </div>
      )}
    </div>
  );
}

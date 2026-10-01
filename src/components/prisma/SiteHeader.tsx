import { Link } from "@tanstack/react-router";
import { WalletButton } from "./WalletButton";
import { PrismaMark } from "./PrismaMark";

export function SiteHeader() {
  return (
    <header className="glass sticky top-0 z-40 border-b">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-5">
        <Link to="/" className="flex items-center gap-2.5">
          <PrismaMark />
          <span className="text-[15px] font-semibold tracking-[0.18em]">PRISMA</span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          <Link to="/" hash="product" className="btn btn-ghost h-8 px-3">Product</Link>
          <Link to="/" hash="how-it-works" className="btn btn-ghost h-8 px-3">How it works</Link>
          <Link to="/dashboard" className="btn btn-ghost h-8 px-3" activeProps={{ className: "text-foreground" }}>Dashboard</Link>
          <Link to="/award/create" className="btn btn-ghost h-8 px-3" activeProps={{ className: "text-foreground" }}>Create Award</Link>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Link to="/dashboard" className="btn btn-ghost h-8 px-3 md:hidden">Dashboard</Link>
          <WalletButton />
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <PrismaMark className="size-4" />
          <span>PRISMA — Verifiable awards. Programmable rewards.</span>
        </div>
        <span className="eyebrow">Built on Solana</span>
      </div>
    </footer>
  );
}

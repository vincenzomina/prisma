import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { WalletButton } from "./WalletButton";
import { PrismaMark } from "./PrismaMark";

const navLink =
  "relative inline-flex h-8 items-center rounded-md px-3 text-sm text-muted-foreground transition-colors hover:text-foreground";
const activeNav = {
  className:
    "text-foreground after:absolute after:inset-x-3 after:-bottom-[17px] after:h-px after:bg-[image:var(--spectrum)]",
};

export function SiteHeader() {
  return (
    <header className="glass sticky top-0 z-40 border-b">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-5">
        <Link to="/" className="flex items-center gap-2.5" aria-label="PRISMA home">
          <PrismaMark />
          <span className="text-[14px] font-semibold tracking-[0.2em]">PRISMA</span>
        </Link>
        <nav className="hidden items-center gap-0.5 md:flex" aria-label="Main">
          <Link to="/" hash="product" className={navLink}>
            Product
          </Link>
          <Link to="/" hash="how-it-works" className={navLink}>
            How it works
          </Link>
          <Link to="/dashboard" className={navLink} activeProps={activeNav}>
            Dashboard
          </Link>
          <Link to="/award/create" className={navLink} activeProps={activeNav}>
            Create Award
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-1.5">
          <Link to="/dashboard" className={`${navLink} md:hidden`}>
            Dashboard
          </Link>
          <Link
            to="/award/create"
            className="btn btn-primary size-8 p-0 md:hidden"
            aria-label="Create Award"
          >
            <Plus className="size-4" />
          </Link>
          <WalletButton />
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-28 border-t">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <PrismaMark className="size-4 text-foreground" />
          <span>PRISMA — Verifiable awards. Programmable rewards.</span>
        </div>
        <span className="eyebrow">Built on Solana · Devnet</span>
      </div>
    </footer>
  );
}

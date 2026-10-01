import { Link } from "@tanstack/react-router";
import { AppShell } from "./AppShell";

export function AwardMissing({ id }: { id: string }) {
  return (
    <AppShell>
      <div className="mx-auto max-w-md px-5 py-28 text-center">
        <p className="eyebrow">Award not found</p>
        <h1 className="mt-3 font-display text-4xl">We couldn't find this award</h1>
        <p className="mt-3 break-all font-mono text-xs text-muted-foreground">{id}</p>
        <p className="mt-4 text-sm text-muted-foreground">
          Awards are stored on this device for now, so drafts created elsewhere won't appear here.
        </p>
        <Link to="/dashboard" className="btn btn-primary mt-8">
          Go to dashboard
        </Link>
      </div>
    </AppShell>
  );
}

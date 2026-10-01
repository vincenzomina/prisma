import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Visual timeline for a running Solana operation. It only mirrors the real
 * step reported by the service — it never advances on its own.
 */
export function TxProgress<K extends string>({
  steps,
  current,
}: {
  steps: { key: K; label: string }[];
  current: K;
}) {
  const idx = steps.findIndex((s) => s.key === current);
  return (
    <ol className="mt-5 space-y-0" aria-live="polite">
      {steps.map((s, i) => {
        const state = i < idx ? "done" : i === idx ? "active" : "todo";
        return (
          <li key={s.key} className="relative flex items-start gap-3 pb-3 last:pb-0">
            {i < steps.length - 1 && (
              <span
                className={cn(
                  "absolute left-[7px] top-4 h-[calc(100%-8px)] w-px",
                  state === "done" ? "bg-primary/60" : "bg-border",
                )}
                aria-hidden
              />
            )}
            <span
              className={cn(
                "relative mt-0.5 grid size-[15px] shrink-0 place-items-center rounded-full border",
                state === "done" && "border-primary bg-primary text-primary-foreground",
                state === "active" && "border-primary text-accent",
                state === "todo" && "border-border",
              )}
            >
              {state === "done" && <Check className="size-2.5" strokeWidth={3} />}
              {state === "active" && <span className="dot dot-pulse" />}
            </span>
            <span
              className={cn(
                "text-sm",
                state === "active" ? "font-medium text-foreground" : "text-muted-foreground",
              )}
            >
              {s.label}
              {state === "active" && <span className="sr-only"> (in progress)</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

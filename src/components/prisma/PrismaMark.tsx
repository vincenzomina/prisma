import { cn } from "@/lib/utils";

export function PrismaMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-5", className)} aria-hidden>
      <defs>
        <linearGradient id="pm-s" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="oklch(0.72 0.12 25)" />
          <stop offset="0.5" stopColor="oklch(0.75 0.11 160)" />
          <stop offset="1" stopColor="oklch(0.62 0.13 295)" />
        </linearGradient>
      </defs>
      <path
        d="M12 2 L22 20 H2 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M12 2 L14.5 20" stroke="url(#pm-s)" strokeWidth="1.6" />
    </svg>
  );
}

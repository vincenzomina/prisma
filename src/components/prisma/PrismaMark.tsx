import { useId } from "react";
import { cn } from "@/lib/utils";

/**
 * PRISMA mark: an incoming beam enters a thin prism and leaves as a
 * structured spectrum (purple -> green).
 */
export function PrismaMark({ className }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 24 24" className={cn("size-5", className)} aria-hidden>
      <defs>
        <linearGradient id={`pm-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9945FF" />
          <stop offset="0.4" stopColor="#6F6BFF" />
          <stop offset="0.7" stopColor="#45C8FF" />
          <stop offset="1" stopColor="#14F195" />
        </linearGradient>
      </defs>
      {/* incoming beam */}
      <path
        d="M1 13.2 L8.6 11.4"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        opacity="0.55"
      />
      {/* prism */}
      <path
        d="M12 3 L20 19 H4 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      {/* refracted spectrum inside & exiting */}
      <path d="M8.6 11.4 L23 9 L23 15.5 Z" fill={`url(#pm-${id})`} opacity="0.95" />
    </svg>
  );
}

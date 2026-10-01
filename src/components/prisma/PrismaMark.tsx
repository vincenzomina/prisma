import { cn } from "@/lib/utils";

/** Official PRISMA logo (3D neon prism), served from public/prisma-logo.png. */
export function PrismaMark({ className }: { className?: string }) {
  return (
    <img
      src="/prisma-logo.png"
      alt=""
      aria-hidden
      draggable={false}
      className={cn("size-5 shrink-0 object-contain", className)}
    />
  );
}

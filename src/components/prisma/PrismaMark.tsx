import { cn } from "@/lib/utils";
import logo from "@/assets/prisma-logo.png.asset.json";

/** Official PRISMA logo (3D neon prism). */
export function PrismaMark({ className }: { className?: string }) {
  return (
    <img
      src={logo.url}
      alt=""
      aria-hidden
      draggable={false}
      className={cn("size-5 shrink-0 object-contain", className)}
    />
  );
}

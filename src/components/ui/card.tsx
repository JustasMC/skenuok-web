import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[color-mix(in_oklab,var(--color-border)_80%,white_5%)] bg-[color-mix(in_oklab,var(--color-surface)_75%,transparent)] shadow-[0_8px_40px_color-mix(in_oklab,black_45%,transparent)] backdrop-blur-xl motion-safe:transition-[border-color,box-shadow,transform] motion-safe:duration-300 motion-safe:ease-out",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-1 px-6 pt-6", className)} {...props} />;
}

export function CardTitle({ className = "", ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-lg font-semibold tracking-tight text-white", className)} {...props} />;
}

export function CardDescription({ className = "", ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-zinc-400", className)} {...props} />;
}

export function CardContent({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-6 pb-6 pt-4", className)} {...props} />;
}

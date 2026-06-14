import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Centered, max-width content container with consistent vertical rhythm. */
export function Section({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={cn("mx-auto w-full max-w-5xl px-6 py-16 md:py-24", className)}
    >
      {children}
    </section>
  );
}

/** Monospace, amber-tinted section eyebrow label. */
export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-amber">
      {children}
    </p>
  );
}

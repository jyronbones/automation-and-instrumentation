import { cn } from "@/lib/utils";

/** Small pulsing amber "Available for co-op" indicator. */
export function StatusDot({
  label = "Available for co-op",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-amber/30 bg-amber/5 px-3 py-1 font-mono text-xs tracking-wide text-amber",
        className,
      )}
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-amber" />
      </span>
      {label}
    </span>
  );
}

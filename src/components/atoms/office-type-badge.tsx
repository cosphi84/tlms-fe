import { cn } from "@/lib/utils";

// ─── Office type → display config ────────────────────────────────────────────

const TYPE_MAP: Record<string, { label: string; className: string }> = {
  hq: {
    label: "HQ",
    className:
      "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800",
  },
  tc: {
    label: "TC",
    className:
      "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800",
  },
  cabang: {
    label: "Cabang",
    className:
      "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
  },
  area: {
    label: "Area",
    className:
      "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
  },
};

interface OfficeTypeBadgeProps {
  type: string;
  className?: string;
}

/**
 * Atom — small colored badge for an office type (hq, tc, cabang, area, …).
 * Falls back to uppercase type string if not in the map.
 */
export function OfficeTypeBadge({ type, className }: OfficeTypeBadgeProps) {
  const config = TYPE_MAP[type.toLowerCase()] ?? {
    label: type.toUpperCase(),
    className:
      "bg-muted text-muted-foreground border-border",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold tracking-wide",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}

import type { OverallSeverity, Severity } from "../types";

const STYLES: Record<OverallSeverity, string> = {
  critical: "bg-rose-500/15 text-rose-300 border-rose-500/40",
  high: "bg-orange-500/15 text-orange-300 border-orange-500/40",
  medium: "bg-amber-500/15 text-amber-300 border-amber-500/40",
  low: "bg-sky-500/15 text-sky-300 border-sky-500/40",
  normal: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
};

interface Props {
  level: Severity | OverallSeverity;
  compact?: boolean;
}

export default function SeverityBadge({ level, compact }: Props) {
  const cls = STYLES[level];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 ${
        compact ? "py-0.5 text-[11px]" : "py-1 text-xs"
      } font-medium uppercase tracking-wide ${cls}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {level}
    </span>
  );
}

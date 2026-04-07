type Confidence = "low" | "medium-low" | "medium" | "medium-high" | "high";

const confidenceConfig: Record<Confidence, { label: string; class: string; barWidth: string; score: number }> = {
  "low":          { label: "LOW",          class: "text-amber-600/80 dark:text-amber-500/70",  barWidth: "15%", score: 15 },
  "medium-low":   { label: "MEDIUM-LOW",   class: "text-amber-500/80 dark:text-amber-400/70",  barWidth: "32%", score: 32 },
  "medium":       { label: "MEDIUM",       class: "text-emerald-600/80 dark:text-emerald-500/70", barWidth: "55%", score: 55 },
  "medium-high":  { label: "MEDIUM-HIGH",  class: "text-emerald-600/90 dark:text-emerald-400/80", barWidth: "72%", score: 72 },
  "high":         { label: "HIGH",         class: "text-emerald-700 dark:text-emerald-400",    barWidth: "90%", score: 90 },
};

interface ConfidenceBadgeProps {
  confidence: string;
  showBar?: boolean;
  size?: "sm" | "md";
}

export default function ConfidenceBadge({ confidence, showBar = false, size = "sm" }: ConfidenceBadgeProps) {
  const config = confidenceConfig[confidence as Confidence] ?? confidenceConfig["medium"];

  return (
    <div className="flex items-center gap-2">
      <span
        className={`font-mono ${size === "md" ? "text-xs" : "text-[10px]"} tracking-widest-constitutional uppercase ${config.class}`}
        data-testid="confidence-label"
      >
        {config.label}
      </span>
      {showBar && (
        <div className="flex-1 h-px bg-border" style={{ maxWidth: 64 }}>
          <div
            className="h-full bg-current opacity-60 transition-all duration-300"
            style={{ width: config.barWidth }}
          />
        </div>
      )}
    </div>
  );
}

export function ConfidenceBar({ score }: { score: number }) {
  const pct = Math.min(100, Math.max(0, score));
  const color =
    pct >= 70 ? "bg-emerald-500/60 dark:bg-emerald-400/50"
    : pct >= 45 ? "bg-emerald-600/50 dark:bg-emerald-500/40"
    : pct >= 25 ? "bg-amber-500/60 dark:bg-amber-400/50"
    : "bg-amber-600/60 dark:bg-amber-500/50";

  return (
    <div className="w-full h-0.5 bg-border rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all duration-300 ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Axiom } from "@shared/schema";
import ConfidenceBadge from "@/components/ConfidenceBadge";
import SourceTags, { SourceLegend } from "@/components/SourceTags";

const CONFIDENCE_ORDER = ["high", "medium-high", "medium", "medium-low", "low"];

function AxiomRow({ axiom }: { axiom: Axiom }) {
  return (
    <Link href={`/axiom/${axiom.id}`}>
      <div
        className="group flex items-start gap-5 px-8 py-5 border-b border-border/50 hover:bg-accent/30 transition-colors duration-150 cursor-pointer"
        data-testid={`axiom-row-${axiom.id}`}
      >
        {/* Number */}
        <div className="flex-shrink-0 pt-0.5">
          <span className="font-mono text-xs text-muted-foreground/50 tabular-nums">
            #{String(axiom.number).padStart(2, "0")}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <h3 className="font-serif text-lg leading-snug text-foreground group-hover:text-foreground/90 transition-colors">
              {axiom.title}
            </h3>
            <div className="flex-shrink-0 pt-1">
              <ConfidenceBadge confidence={axiom.confidence} />
            </div>
          </div>
          <p className="mt-1.5 text-sm text-muted-foreground/80 leading-relaxed line-clamp-2">
            {axiom.truthClaim}
          </p>
          <div className="mt-2.5 flex items-center gap-4">
            <SourceTags
              liminal={axiom.liminalCount}
              parallax={axiom.parallaxCount}
              praxis={axiom.praxisCount}
            />
            <span className="text-[10px] font-mono text-muted-foreground/30">
              {new Date(axiom.updatedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex-shrink-0 pt-1 opacity-0 group-hover:opacity-40 transition-opacity">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 7h10M8 3l4 4-4 4"/>
          </svg>
        </div>
      </div>
    </Link>
  );
}

export default function TruthClaims() {
  const [filter, setFilter] = useState<string>("all");
  const { data: axioms, isLoading } = useQuery<Axiom[]>({
    queryKey: ["/api/axioms"],
  });

  const sorted = (axioms ?? []).slice().sort((a, b) => {
    const ai = CONFIDENCE_ORDER.indexOf(a.confidence);
    const bi = CONFIDENCE_ORDER.indexOf(b.confidence);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  const filtered = filter === "all"
    ? sorted
    : sorted.filter((a) => a.confidence === filter);

  const highCount = (axioms ?? []).filter((a) => a.confidence === "high").length;
  const mhCount = (axioms ?? []).filter((a) => a.confidence === "medium-high").length;
  const contradictions = (axioms ?? []).filter((a) => a.counterevidence && a.counterevidence.length > 30).length;

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <div className="px-8 pt-10 pb-6 border-b border-border">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="font-mono text-xs tracking-widest-constitutional uppercase text-muted-foreground mb-2">
              Truth Claims
            </h1>
            <div className="font-serif text-3xl text-foreground">
              {isLoading ? "—" : (axioms?.length ?? 0)} axioms
            </div>
            <div className="mt-1.5 flex items-center gap-4 text-xs text-muted-foreground/60 font-mono">
              <span>{highCount + mhCount} high confidence</span>
              <span className="text-muted-foreground/30">·</span>
              <span>{contradictions} with counterevidence</span>
            </div>
          </div>
          <Link href="/new">
            <button
              className="text-[11px] font-mono tracking-widest-constitutional uppercase px-4 py-2 border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors rounded-sm"
              data-testid="button-new-synthesis"
            >
              + New Synthesis
            </button>
          </Link>
        </div>

        {/* Filters */}
        <div className="mt-5 flex items-center gap-1">
          {["all", "high", "medium-high", "medium", "medium-low", "low"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-sm transition-colors ${
                filter === f
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground/50 hover:text-muted-foreground hover:bg-accent/50"
              }`}
              data-testid={`filter-${f}`}
            >
              {f === "all" ? "All" : f.toUpperCase()}
            </button>
          ))}
          <div className="ml-auto">
            <SourceLegend />
          </div>
        </div>
      </div>

      {/* Axiom List */}
      {isLoading ? (
        <div className="px-8 py-12 text-muted-foreground/40 font-mono text-sm">
          Loading…
        </div>
      ) : filtered.length === 0 ? (
        <div className="px-8 py-16 text-center">
          <div className="font-serif text-xl text-muted-foreground/40 mb-3">
            {filter === "all" ? "No axioms yet." : `No ${filter} confidence axioms.`}
          </div>
          {filter === "all" && (
            <Link href="/new">
              <button className="text-xs font-mono tracking-wider text-primary hover:text-primary/80 transition-colors">
                Begin synthesis →
              </button>
            </Link>
          )}
        </div>
      ) : (
        <div>
          {filtered.map((axiom) => (
            <AxiomRow key={axiom.id} axiom={axiom} />
          ))}
        </div>
      )}
    </div>
  );
}

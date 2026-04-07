import { Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Axiom } from "@shared/schema";
import ConfidenceBadge, { ConfidenceBar } from "@/components/ConfidenceBadge";
import SourceTags from "@/components/SourceTags";
import { useToast } from "@/hooks/use-toast";

function SynthesisSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="py-6 border-b border-border/50">
      <div className="font-mono text-[10px] tracking-widest-constitutional uppercase text-muted-foreground/50 mb-3">
        {label}
      </div>
      {children}
    </div>
  );
}

function RevisionHistoryItem({ entry }: { entry: { date: string; change: string; previousConfidence: string } }) {
  return (
    <div className="py-3 border-b border-border/30 last:border-0">
      <div className="flex items-center gap-3 mb-1.5">
        <span className="font-mono text-[10px] text-muted-foreground/50">{entry.date}</span>
        <span className="text-[10px] font-mono uppercase tracking-wider text-amber-600/70 dark:text-amber-500/60">
          {entry.previousConfidence} → revised
        </span>
      </div>
      <p className="text-sm text-foreground/70 leading-relaxed">{entry.change}</p>
    </div>
  );
}

export default function AxiomDetail({ params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: axiom, isLoading } = useQuery<Axiom>({
    queryKey: ["/api/axioms", id],
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiRequest("DELETE", `/api/axioms/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/axioms"] });
      toast({ description: "Axiom removed from the record." });
      navigate("/");
    },
  });

  if (isLoading) {
    return (
      <div className="px-10 py-12 font-mono text-sm text-muted-foreground/40">Loading…</div>
    );
  }

  if (!axiom) {
    return (
      <div className="px-10 py-12">
        <div className="font-serif text-xl text-muted-foreground/40 mb-3">Axiom not found.</div>
        <Link href="/">
          <button className="text-xs font-mono tracking-wider text-primary">← Back to Truth Claims</button>
        </Link>
      </div>
    );
  }

  const inputDescriptions: string[] = JSON.parse(axiom.inputDescriptions || "[]");
  const revisionHistory: { date: string; change: string; previousConfidence: string }[] =
    JSON.parse(axiom.revisionHistory || "[]");
  const totalInputs = axiom.liminalCount + axiom.parallaxCount + axiom.praxisCount;

  return (
    <div className="max-w-3xl mx-auto px-8 pt-10 pb-16">
      {/* Breadcrumb */}
      <div className="mb-8">
        <Link href="/">
          <button className="text-[10px] font-mono tracking-widest-constitutional uppercase text-muted-foreground/40 hover:text-muted-foreground transition-colors">
            ← Truth Claims
          </button>
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-6 mb-4">
          <div className="flex-shrink-0 font-mono text-xs text-muted-foreground/40 pt-1.5">
            #{String(axiom.number).padStart(2, "0")}
          </div>
          <div className="flex-1">
            <h1 className="font-serif text-2xl leading-tight text-foreground">
              {axiom.title}
            </h1>
          </div>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-6 pl-8">
          <ConfidenceBadge confidence={axiom.confidence} size="md" />
          <SourceTags
            liminal={axiom.liminalCount}
            parallax={axiom.parallaxCount}
            praxis={axiom.praxisCount}
            size="md"
          />
          <span className="text-[10px] font-mono text-muted-foreground/30">
            {totalInputs} inputs
          </span>
        </div>

        {/* Confidence bar */}
        <div className="mt-3 pl-8">
          <ConfidenceBar score={axiom.confidenceScore} />
          <div className="flex justify-between mt-1">
            <span className="font-mono text-[9px] text-muted-foreground/30">CONFIDENCE</span>
            <span className="font-mono text-[9px] text-muted-foreground/30">{axiom.confidenceScore}/100</span>
          </div>
        </div>
      </div>

      {/* Truth Claim — prominent */}
      <div className="bg-card border border-card-border rounded-sm px-6 py-5 mb-6">
        <div className="font-mono text-[10px] tracking-widest-constitutional uppercase text-muted-foreground/50 mb-3">
          Truth Claim
        </div>
        <blockquote className="font-serif text-xl leading-relaxed text-foreground italic">
          "{axiom.truthClaim}"
        </blockquote>
        {axiom.workingPrinciple && (
          <div className="mt-4 pt-4 border-t border-border/50">
            <div className="font-mono text-[10px] tracking-widest-constitutional uppercase text-muted-foreground/40 mb-2">
              Working Principle
            </div>
            <p className="text-sm text-foreground/80 leading-relaxed">{axiom.workingPrinciple}</p>
          </div>
        )}
      </div>

      {/* Synthesis Chain */}
      <div data-testid="synthesis-chain">
        {/* Inputs */}
        <SynthesisSection label="Signal Inputs">
          <div className="space-y-2">
            {inputDescriptions.map((desc, i) => (
              <p key={i} className="text-sm text-foreground/70 leading-relaxed pl-3 border-l-2 border-border">
                {desc}
              </p>
            ))}
            {inputDescriptions.length === 0 && (
              <p className="text-sm text-muted-foreground/50">No input descriptions recorded.</p>
            )}
          </div>
        </SynthesisSection>

        {axiom.signal && (
          <SynthesisSection label="Signal">
            <p className="text-sm text-foreground/80 leading-relaxed">{axiom.signal}</p>
          </SynthesisSection>
        )}

        {axiom.convergence && (
          <SynthesisSection label="Convergence">
            <p className="text-sm text-foreground/80 leading-relaxed">{axiom.convergence}</p>
          </SynthesisSection>
        )}

        {axiom.interpretation && (
          <SynthesisSection label="Interpretation">
            <p className="text-sm text-foreground/80 leading-relaxed">{axiom.interpretation}</p>
          </SynthesisSection>
        )}

        {axiom.counterevidence && (
          <SynthesisSection label="Counterevidence">
            <p className="text-sm text-foreground/70 leading-relaxed">{axiom.counterevidence}</p>
          </SynthesisSection>
        )}

        {axiom.revisionNote && (
          <SynthesisSection label="Revision Note">
            <p className="text-sm text-foreground/70 leading-relaxed italic">{axiom.revisionNote}</p>
          </SynthesisSection>
        )}

        {/* Revision History */}
        {revisionHistory.length > 0 && (
          <div className="py-6">
            <div className="font-mono text-[10px] tracking-widest-constitutional uppercase text-muted-foreground/50 mb-3">
              Revision History
            </div>
            {revisionHistory.map((entry, i) => (
              <RevisionHistoryItem key={i} entry={entry} />
            ))}
          </div>
        )}
      </div>

      {/* Timestamps */}
      <div className="flex items-center gap-6 mt-8 pt-6 border-t border-border/30">
        <div>
          <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground/30 block">Created</span>
          <span className="font-mono text-[10px] text-muted-foreground/50">
            {new Date(axiom.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
          </span>
        </div>
        <div>
          <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground/30 block">Last revised</span>
          <span className="font-mono text-[10px] text-muted-foreground/50">
            {new Date(axiom.updatedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
          </span>
        </div>
        <div className="ml-auto">
          <button
            onClick={() => {
              if (confirm("Remove this axiom from the record? This cannot be undone.")) {
                deleteMutation.mutate();
              }
            }}
            disabled={deleteMutation.isPending}
            className="text-[10px] font-mono uppercase tracking-widest-constitutional text-destructive/50 hover:text-destructive transition-colors"
            data-testid="button-delete-axiom"
          >
            {deleteMutation.isPending ? "Removing…" : "Remove"}
          </button>
        </div>
      </div>
    </div>
  );
}

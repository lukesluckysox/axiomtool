import { useQuery } from "@tanstack/react-query";
import type { Axiom, Tension, Revision } from "@shared/schema";
import ConfidenceBadge from "@/components/ConfidenceBadge";
import { Link } from "wouter";

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-12">
      <div className="flex items-center gap-4 mb-6">
        <h2 className="font-mono text-[10px] tracking-widest-constitutional uppercase text-muted-foreground/50">
          {label}
        </h2>
        <div className="flex-1 h-px bg-border/50" />
      </div>
      {children}
    </div>
  );
}

function GoverningPrinciple({ axiom, rank }: { axiom: Axiom; rank: number }) {
  return (
    <Link href={`/axiom/${axiom.id}`}>
      <div className="group py-5 border-b border-border/40 last:border-0 cursor-pointer hover:bg-accent/10 transition-colors px-1 -mx-1 rounded-sm">
        <div className="flex items-start gap-4">
          <span className="font-mono text-xs text-muted-foreground/30 pt-0.5 tabular-nums flex-shrink-0">
            {String(rank).padStart(2, "0")}.
          </span>
          <div className="flex-1 min-w-0">
            <p className="font-serif text-lg italic text-foreground/90 leading-snug mb-2 group-hover:text-foreground transition-colors">
              "{axiom.truthClaim}"
            </p>
            {axiom.workingPrinciple && (
              <p className="text-xs text-muted-foreground/60 leading-relaxed mb-2">
                → {axiom.workingPrinciple}
              </p>
            )}
            <ConfidenceBadge confidence={axiom.confidence} />
          </div>
        </div>
      </div>
    </Link>
  );
}

function TensionEntry({ tension }: { tension: Tension }) {
  return (
    <div className="py-4 border-b border-border/40 last:border-0">
      <div className="flex items-center gap-3 mb-2">
        <span className="font-mono text-xs tracking-widest-constitutional uppercase text-purple-500/70">
          {tension.poleA}
        </span>
        <span className="font-mono text-muted-foreground/30">↔</span>
        <span className="font-mono text-xs tracking-widest-constitutional uppercase text-blue-500/70">
          {tension.poleB}
        </span>
      </div>
      <p className="text-sm text-foreground/60 leading-relaxed">
        {tension.description}
      </p>
    </div>
  );
}

function ContradictionEntry({ axiom }: { axiom: Axiom }) {
  return (
    <Link href={`/axiom/${axiom.id}`}>
      <div className="group py-4 border-b border-border/40 last:border-0 cursor-pointer">
        <div className="flex items-start gap-4">
          <span className="font-mono text-[10px] text-muted-foreground/30 tabular-nums flex-shrink-0 pt-1">
            #{String(axiom.number).padStart(2, "0")}
          </span>
          <div>
            <p className="text-sm text-foreground/70 leading-relaxed mb-2 group-hover:text-foreground transition-colors">
              <em>{axiom.truthClaim}</em>
            </p>
            <p className="text-xs text-muted-foreground/50 leading-relaxed">
              {axiom.counterevidence}
            </p>
            <div className="mt-2">
              <ConfidenceBadge confidence={axiom.confidence} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function RevisionSummary({ revision }: { revision: Revision }) {
  return (
    <div className="py-4 border-b border-border/40 last:border-0">
      <div className="font-mono text-[10px] text-muted-foreground/40 mb-2">
        {new Date(revision.date).toLocaleDateString("en-US", {
          year: "numeric", month: "long", day: "numeric",
        })}
      </div>
      <p className="text-sm text-foreground/70 leading-relaxed">
        <span className="line-through decoration-muted-foreground/30">{revision.previousBelief}</span>
      </p>
      <p className="text-sm text-foreground/85 leading-relaxed mt-1 font-medium">
        → {revision.newBelief}
      </p>
    </div>
  );
}

export default function Constitution() {
  const { data: axioms = [], isLoading: loadingAxioms } = useQuery<Axiom[]>({
    queryKey: ["/api/axioms"],
  });
  const { data: tensions = [], isLoading: loadingTensions } = useQuery<Tension[]>({
    queryKey: ["/api/tensions"],
  });
  const { data: revisions = [], isLoading: loadingRevisions } = useQuery<Revision[]>({
    queryKey: ["/api/revisions"],
  });

  const isLoading = loadingAxioms || loadingTensions || loadingRevisions;

  // Governing principles: high + medium-high confidence, sorted by score
  const governingPrinciples = axioms
    .filter((a) => ["high", "medium-high"].includes(a.confidence))
    .sort((a, b) => b.confidenceScore - a.confidenceScore);

  // Acknowledged contradictions: axioms with substantial counterevidence
  const contradictions = axioms.filter(
    (a) => a.counterevidence && a.counterevidence.length > 30
  );

  // All working principles (from all axioms)
  const workingPrinciples = axioms.filter((a) => a.workingPrinciple && a.workingPrinciple.length > 5);

  // Major revisions only
  const majorRevisions = revisions.filter((r) => r.significance === "major");

  const lastUpdated = [...axioms, ...tensions, ...revisions]
    .map((item) => new Date("updatedAt" in item ? item.updatedAt : item.createdAt))
    .sort((a, b) => b.getTime() - a.getTime())[0];

  if (isLoading) {
    return <div className="px-8 py-12 font-mono text-sm text-muted-foreground/40">Loading…</div>;
  }

  const isEmpty = axioms.length === 0 && tensions.length === 0;

  return (
    <div className="max-w-2xl mx-auto px-8 pt-10 pb-20">
      {/* Document Header */}
      <div className="mb-12">
        <h1 className="font-mono text-[10px] tracking-widest-constitutional uppercase text-muted-foreground mb-2">
          Constitution
        </h1>
        <div className="font-serif text-3xl text-foreground mb-3">
          The Current Operating Structure
        </div>
        <p className="text-sm text-muted-foreground/60 leading-relaxed mb-4">
          Derived from {axioms.length} truth claims, {tensions.length} tensions, and {revisions.length} recorded revisions. This document is provisional and continuously revised.
        </p>
        {lastUpdated && (
          <div className="font-mono text-[10px] text-muted-foreground/30 uppercase tracking-wider">
            Last updated {lastUpdated.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </div>
        )}
        <div className="h-px bg-border mt-6" />
      </div>

      {isEmpty ? (
        <div className="text-center py-12">
          <div className="font-serif text-xl text-muted-foreground/40 mb-4">
            The constitution is empty.
          </div>
          <p className="text-sm text-muted-foreground/50 leading-relaxed mb-6 max-w-sm mx-auto">
            The constitution assembles itself from truth claims, tensions, and revisions. Begin with a synthesis.
          </p>
          <Link href="/new">
            <button className="text-xs font-mono tracking-wider text-primary hover:text-primary/80 transition-colors">
              Begin synthesis →
            </button>
          </Link>
        </div>
      ) : (
        <>
          {/* I. Governing Principles */}
          {governingPrinciples.length > 0 && (
            <Section label="I. Governing Principles">
              <p className="text-xs text-muted-foreground/50 leading-relaxed mb-5">
                Principles held with high or medium-high confidence. These are considered reliable enough to guide future action.
              </p>
              {governingPrinciples.map((axiom, i) => (
                <GoverningPrinciple key={axiom.id} axiom={axiom} rank={i + 1} />
              ))}
            </Section>
          )}

          {/* II. Working Principles */}
          {workingPrinciples.length > 0 && (
            <Section label="II. Working Principles">
              <p className="text-xs text-muted-foreground/50 leading-relaxed mb-5">
                Actionable doctrines derived from truth claims. These translate principle into conduct.
              </p>
              <div className="space-y-3">
                {workingPrinciples.map((axiom) => (
                  <Link key={axiom.id} href={`/axiom/${axiom.id}`}>
                    <div className="group flex items-start gap-3 py-3 border-b border-border/30 last:border-0 cursor-pointer">
                      <span className="font-mono text-[10px] text-muted-foreground/25 tabular-nums flex-shrink-0 pt-0.5">
                        #{String(axiom.number).padStart(2, "0")}
                      </span>
                      <p className="text-sm text-foreground/75 leading-relaxed group-hover:text-foreground transition-colors">
                        {axiom.workingPrinciple}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </Section>
          )}

          {/* III. Active Tensions */}
          {tensions.length > 0 && (
            <Section label="III. Active Tensions">
              <p className="text-xs text-muted-foreground/50 leading-relaxed mb-5">
                Unresolved polarities that continue to organize decisions and relationships. Not problems to eliminate — structures to understand.
              </p>
              {tensions.map((tension) => (
                <TensionEntry key={tension.id} tension={tension} />
              ))}
            </Section>
          )}

          {/* IV. Acknowledged Contradictions */}
          {contradictions.length > 0 && (
            <Section label="IV. Acknowledged Contradictions">
              <p className="text-xs text-muted-foreground/50 leading-relaxed mb-5">
                Areas where evidence is mixed or the self remains divided. These principles are held provisionally and require further examination.
              </p>
              {contradictions.map((axiom) => (
                <ContradictionEntry key={axiom.id} axiom={axiom} />
              ))}
            </Section>
          )}

          {/* V. Major Revisions */}
          {majorRevisions.length > 0 && (
            <Section label="V. Historical Revisions">
              <p className="text-xs text-muted-foreground/50 leading-relaxed mb-5">
                Major changes in worldview over time. The record of how the constitution has evolved.
              </p>
              {majorRevisions.map((revision) => (
                <RevisionSummary key={revision.id} revision={revision} />
              ))}
            </Section>
          )}

          {/* Footer */}
          <div className="pt-6 border-t border-border/30">
            <p className="text-xs text-muted-foreground/30 leading-relaxed font-mono">
              This constitution is a living document. It does not claim final certainty. Every principle here is provisional, traceable, and revisable by evidence.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

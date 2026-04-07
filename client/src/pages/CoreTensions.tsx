import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Tension } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

function TensionCard({ tension, onDelete }: { tension: Tension; onDelete: (id: number) => void }) {
  const [expanded, setExpanded] = useState(false);
  const evidence: string[] = JSON.parse(tension.evidence || "[]");

  return (
    <div
      className="border-b border-border/50 last:border-0"
      data-testid={`tension-card-${tension.id}`}
    >
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full text-left px-8 py-6 hover:bg-accent/20 transition-colors group"
      >
        {/* Polarity Display */}
        <div className="flex items-center gap-4 mb-3">
          <span className="font-mono text-sm tracking-widest-constitutional uppercase text-purple-500/80 dark:text-purple-400/70">
            {tension.poleA}
          </span>
          <span className="font-mono text-muted-foreground/30 text-sm">↔</span>
          <span className="font-mono text-sm tracking-widest-constitutional uppercase text-blue-500/80 dark:text-blue-400/70">
            {tension.poleB}
          </span>
          <span className="ml-auto text-muted-foreground/20 group-hover:text-muted-foreground/50 transition-colors font-mono text-xs">
            {expanded ? "▲" : "▼"}
          </span>
        </div>

        <p className="text-sm text-foreground/70 leading-relaxed line-clamp-2 text-left">
          {tension.description}
        </p>
      </button>

      {expanded && (
        <div className="px-8 pb-6">
          <p className="text-sm text-foreground/80 leading-relaxed mb-4">{tension.description}</p>

          {evidence.length > 0 && (
            <div className="mt-4">
              <div className="font-mono text-[10px] uppercase tracking-widest-constitutional text-muted-foreground/40 mb-2">
                Evidence
              </div>
              <div className="space-y-2">
                {evidence.map((e, i) => (
                  <p key={i} className="text-sm text-foreground/60 leading-relaxed pl-3 border-l border-border">
                    {e}
                  </p>
                ))}
              </div>
            </div>
          )}

          <div className="mt-5 flex items-center justify-between">
            <span className="font-mono text-[10px] text-muted-foreground/30">
              {new Date(tension.createdAt).toLocaleDateString("en-US", {
                year: "numeric", month: "short", day: "numeric",
              })}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(tension.id); }}
              className="text-[10px] font-mono uppercase tracking-widest-constitutional text-destructive/40 hover:text-destructive transition-colors"
            >
              Remove
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function NewTensionForm({ onClose }: { onClose: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    poleA: "", poleB: "", description: "", evidence: "",
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/tensions", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tensions"] });
      toast({ description: "Tension recorded." });
      onClose();
    },
  });

  function submit() {
    const evidence = form.evidence.trim()
      ? form.evidence.split("\n").filter((l) => l.trim()).map((l) => l.trim())
      : [];
    createMutation.mutate({
      poleA: form.poleA.toUpperCase(),
      poleB: form.poleB.toUpperCase(),
      description: form.description,
      evidence: JSON.stringify(evidence),
      relatedAxiomIds: "[]",
    });
  }

  return (
    <div className="px-8 py-6 border-b border-border bg-card/50">
      <div className="font-mono text-[10px] uppercase tracking-widest-constitutional text-muted-foreground/50 mb-4">
        New Tension
      </div>

      <div className="flex items-center gap-3 mb-4">
        <input
          type="text"
          value={form.poleA}
          onChange={(e) => setForm((f) => ({ ...f, poleA: e.target.value }))}
          placeholder="POLE A"
          className="flex-1 bg-background border border-border rounded-sm px-3 py-2 text-sm font-mono uppercase tracking-wider placeholder:text-muted-foreground/30 focus:outline-none focus:ring-1 focus:ring-ring"
          data-testid="input-pole-a"
        />
        <span className="font-mono text-muted-foreground/40">↔</span>
        <input
          type="text"
          value={form.poleB}
          onChange={(e) => setForm((f) => ({ ...f, poleB: e.target.value }))}
          placeholder="POLE B"
          className="flex-1 bg-background border border-border rounded-sm px-3 py-2 text-sm font-mono uppercase tracking-wider placeholder:text-muted-foreground/30 focus:outline-none focus:ring-1 focus:ring-ring"
          data-testid="input-pole-b"
        />
      </div>

      <textarea
        value={form.description}
        onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        placeholder="Describe the tension — why these poles are both necessary, and how they create friction…"
        rows={3}
        className="w-full bg-background border border-border rounded-sm px-3 py-2.5 text-sm placeholder:text-muted-foreground/30 focus:outline-none focus:ring-1 focus:ring-ring resize-none leading-relaxed mb-3"
        data-testid="input-tension-description"
      />

      <textarea
        value={form.evidence}
        onChange={(e) => setForm((f) => ({ ...f, evidence: e.target.value }))}
        placeholder="Evidence (one item per line, optional)…"
        rows={2}
        className="w-full bg-background border border-border rounded-sm px-3 py-2.5 text-sm placeholder:text-muted-foreground/30 focus:outline-none focus:ring-1 focus:ring-ring resize-none leading-relaxed mb-4"
        data-testid="input-tension-evidence"
      />

      <div className="flex items-center gap-3">
        <button
          onClick={submit}
          disabled={!form.poleA || !form.poleB || !form.description || createMutation.isPending}
          className="text-xs font-mono uppercase tracking-widest-constitutional px-4 py-2 bg-primary text-primary-foreground rounded-sm hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          data-testid="button-save-tension"
        >
          {createMutation.isPending ? "Recording…" : "Record Tension"}
        </button>
        <button
          onClick={onClose}
          className="text-xs font-mono uppercase tracking-widest-constitutional text-muted-foreground/50 hover:text-foreground transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function CoreTensions() {
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tensions, isLoading } = useQuery<Tension[]>({
    queryKey: ["/api/tensions"],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/tensions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tensions"] });
      toast({ description: "Tension removed." });
    },
  });

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="px-8 pt-10 pb-6 border-b border-border">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="font-mono text-xs tracking-widest-constitutional uppercase text-muted-foreground mb-2">
              Core Tensions
            </h1>
            <div className="font-serif text-3xl text-foreground">
              {isLoading ? "—" : (tensions?.length ?? 0)} unresolved polarities
            </div>
            <p className="mt-2 text-sm text-muted-foreground/60 leading-relaxed max-w-lg">
              Recurring polarities that continue to organize your life. These are not problems to solve — they are tensions to understand.
            </p>
          </div>
          <button
            onClick={() => setShowForm((s) => !s)}
            className="text-[11px] font-mono tracking-widest-constitutional uppercase px-4 py-2 border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors rounded-sm"
            data-testid="button-new-tension"
          >
            {showForm ? "Cancel" : "+ New Tension"}
          </button>
        </div>
      </div>

      {/* New Tension Form */}
      {showForm && <NewTensionForm onClose={() => setShowForm(false)} />}

      {/* Tensions List */}
      {isLoading ? (
        <div className="px-8 py-12 text-muted-foreground/40 font-mono text-sm">Loading…</div>
      ) : (tensions?.length ?? 0) === 0 ? (
        <div className="px-8 py-16 text-center">
          <div className="font-serif text-xl text-muted-foreground/40 mb-3">
            No tensions recorded yet.
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="text-xs font-mono tracking-wider text-primary hover:text-primary/80 transition-colors"
          >
            Record a tension →
          </button>
        </div>
      ) : (
        <div>
          {tensions?.map((tension) => (
            <TensionCard
              key={tension.id}
              tension={tension}
              onDelete={(id) => {
                if (confirm("Remove this tension from the record?")) deleteMutation.mutate(id);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

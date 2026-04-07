import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ─── Axioms (Truth Claims) ──────────────────────────────────────────────────
export const axioms = sqliteTable("axioms", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  number: integer("number").notNull(),
  title: text("title").notNull(),
  // Source input counts
  liminalCount: integer("liminal_count").notNull().default(0),
  parallaxCount: integer("parallax_count").notNull().default(0),
  praxisCount: integer("praxis_count").notNull().default(0),
  inputDescriptions: text("input_descriptions").notNull().default("[]"), // JSON: string[]
  // Synthesis chain
  signal: text("signal").notNull().default(""),
  convergence: text("convergence").notNull().default(""),
  interpretation: text("interpretation").notNull().default(""),
  // Output
  truthClaim: text("truth_claim").notNull(),
  workingPrinciple: text("working_principle").notNull().default(""),
  // Assessment
  confidence: text("confidence").notNull().default("medium"), // low | medium-low | medium | medium-high | high
  confidenceScore: integer("confidence_score").notNull().default(50),
  counterevidence: text("counterevidence").notNull().default(""),
  revisionNote: text("revision_note").notNull().default(""),
  revisionHistory: text("revision_history").notNull().default("[]"), // JSON: { date, change, previousConfidence }[]
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const insertAxiomSchema = createInsertSchema(axioms).omit({
  id: true,
  number: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertAxiom = z.infer<typeof insertAxiomSchema>;
export type Axiom = typeof axioms.$inferSelect;

// ─── Tensions (Core Tensions / Polarities) ──────────────────────────────────
export const tensions = sqliteTable("tensions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  poleA: text("pole_a").notNull(),
  poleB: text("pole_b").notNull(),
  description: text("description").notNull(),
  evidence: text("evidence").notNull().default("[]"), // JSON: string[]
  relatedAxiomIds: text("related_axiom_ids").notNull().default("[]"), // JSON: number[]
  createdAt: text("created_at").notNull(),
});

export const insertTensionSchema = createInsertSchema(tensions).omit({
  id: true,
  createdAt: true,
});

export type InsertTension = z.infer<typeof insertTensionSchema>;
export type Tension = typeof tensions.$inferSelect;

// ─── Revisions (Worldview Revisions) ────────────────────────────────────────
export const revisions = sqliteTable("revisions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  date: text("date").notNull(),
  previousBelief: text("previous_belief").notNull(),
  newBelief: text("new_belief").notNull(),
  triggeringEvidence: text("triggering_evidence").notNull().default(""),
  significance: text("significance").notNull().default("moderate"), // minor | moderate | major
  relatedAxiomId: integer("related_axiom_id"),
  createdAt: text("created_at").notNull(),
});

export const insertRevisionSchema = createInsertSchema(revisions).omit({
  id: true,
  createdAt: true,
});

export type InsertRevision = z.infer<typeof insertRevisionSchema>;
export type Revision = typeof revisions.$inferSelect;

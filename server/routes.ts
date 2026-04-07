import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { insertAxiomSchema, insertTensionSchema, insertRevisionSchema } from "@shared/schema";

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  // ─── Health ────────────────────────────────────────────────────────────────
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // ─── Axioms ────────────────────────────────────────────────────────────────
  app.get("/api/axioms", (_req, res) => {
    res.json(storage.getAxioms());
  });

  app.get("/api/axioms/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const axiom = storage.getAxiom(id);
    if (!axiom) return res.status(404).json({ error: "Axiom not found" });
    res.json(axiom);
  });

  app.post("/api/axioms", (req, res) => {
    const parsed = insertAxiomSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const axiom = storage.createAxiom(parsed.data);
    res.status(201).json(axiom);
  });

  app.patch("/api/axioms/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const parsed = insertAxiomSchema.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const axiom = storage.updateAxiom(id, parsed.data);
    if (!axiom) return res.status(404).json({ error: "Axiom not found" });
    res.json(axiom);
  });

  app.delete("/api/axioms/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const deleted = storage.deleteAxiom(id);
    if (!deleted) return res.status(404).json({ error: "Axiom not found" });
    res.status(204).send();
  });

  // ─── Tensions ──────────────────────────────────────────────────────────────
  app.get("/api/tensions", (_req, res) => {
    res.json(storage.getTensions());
  });

  app.get("/api/tensions/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const tension = storage.getTension(id);
    if (!tension) return res.status(404).json({ error: "Tension not found" });
    res.json(tension);
  });

  app.post("/api/tensions", (req, res) => {
    const parsed = insertTensionSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const tension = storage.createTension(parsed.data);
    res.status(201).json(tension);
  });

  app.patch("/api/tensions/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const parsed = insertTensionSchema.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const tension = storage.updateTension(id, parsed.data);
    if (!tension) return res.status(404).json({ error: "Tension not found" });
    res.json(tension);
  });

  app.delete("/api/tensions/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const deleted = storage.deleteTension(id);
    if (!deleted) return res.status(404).json({ error: "Tension not found" });
    res.status(204).send();
  });

  // ─── Revisions ─────────────────────────────────────────────────────────────
  app.get("/api/revisions", (_req, res) => {
    res.json(storage.getRevisions());
  });

  app.post("/api/revisions", (req, res) => {
    const parsed = insertRevisionSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const revision = storage.createRevision(parsed.data);
    res.status(201).json(revision);
  });

  app.delete("/api/revisions/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const deleted = storage.deleteRevision(id);
    if (!deleted) return res.status(404).json({ error: "Revision not found" });
    res.status(204).send();
  });

  // ─── Sensitivity proxy → Lumen ──────────────────────────────────────────────
  app.get('/api/settings/sensitivity', async (_req: any, res: any) => {
    const LUMEN_API_URL = process.env.LUMEN_API_URL;
    const TOKEN = process.env.LUMEN_INTERNAL_TOKEN;
    const USER_ID = process.env.LUMEN_USER_ID || '1';
    if (!LUMEN_API_URL || !TOKEN) return res.json({ sensitivity: 'medium' });
    try {
      const r = await fetch(`${LUMEN_API_URL}/api/epistemic/sensitivity/${USER_ID}`, {
        headers: { 'x-lumen-internal-token': TOKEN },
      });
      if (!r.ok) return res.json({ sensitivity: 'medium' });
      const data = await r.json() as { sensitivity: string };
      return res.json(data);
    } catch {
      return res.json({ sensitivity: 'medium' });
    }
  });

  app.post('/api/settings/sensitivity', async (req: any, res: any) => {
    const LUMEN_API_URL = process.env.LUMEN_API_URL;
    const TOKEN = process.env.LUMEN_INTERNAL_TOKEN;
    const USER_ID = process.env.LUMEN_USER_ID || '1';
    const { sensitivity } = req.body as { sensitivity: string };
    if (!LUMEN_API_URL || !TOKEN) return res.json({ sensitivity: sensitivity || 'medium' });
    try {
      const r = await fetch(`${LUMEN_API_URL}/api/epistemic/sensitivity/${USER_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-lumen-internal-token': TOKEN },
        body: JSON.stringify({ sensitivity }),
      });
      if (!r.ok) return res.json({ sensitivity: sensitivity || 'medium' });
      const data = await r.json() as { sensitivity: string };
      return res.json(data);
    } catch {
      return res.json({ sensitivity: sensitivity || 'medium' });
    }
  });

  return httpServer;
}

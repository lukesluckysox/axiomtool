import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { insertAxiomSchema, insertTensionSchema, insertRevisionSchema } from "@shared/schema";
import { requireAuth, getUserId, verifyLumenToken } from "./auth";

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  // ─── Health ────────────────────────────────────────────────────────────────
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // ─── SSO Auth ────────────────────────────────────────────────────────────────
  app.get('/api/auth/sso', async (req: any, res: any) => {
    const token = req.query.token as string;
    if (!token) return res.status(400).send('Missing token');
    try {
      const payload = verifyLumenToken(token);
      const lumenUserId = String(payload.userId);
      // Store in session
      req.session.userId = lumenUserId;
      req.session.username = payload.username;
      // Persist session before redirect
      req.session.save((err: unknown) => {
        if (err) console.error('[axiom/sso] session save error:', err);
        res.redirect('/#/');
      });
    } catch (err) {
      console.error('[axiom/sso] token error:', err);
      res.status(401).send('Invalid or expired token. Please re-enter from Lumen.');
    }
  });

  app.get('/api/auth/me', (req: any, res: any) => {
    if (!req.session?.userId) return res.status(401).json({ error: 'Not authenticated' });
    res.json({ userId: req.session.userId, username: req.session.username });
  });

  app.post('/api/auth/logout', (req: any, res: any) => {
    req.session.destroy(() => {
      res.json({ ok: true });
    });
  });

  // Auth guard for all /api/* except /api/auth/* and /api/health
  app.use('/api', (req: any, res: any, next: any) => {
    if (req.path.startsWith('/auth/') || req.path === '/health') return next();
    requireAuth(req, res, next);
  });

  // ─── Axioms ────────────────────────────────────────────────────────────────
  app.get("/api/axioms", (req: any, res: any) => {
    const userId = getUserId(req);
    res.json(storage.getAxioms(userId));
  });

  app.get("/api/axioms/:id", (req: any, res: any) => {
    const id = parseInt(req.params.id);
    const axiom = storage.getAxiom(id, getUserId(req));
    if (!axiom) return res.status(404).json({ error: "Axiom not found" });
    res.json(axiom);
  });

  app.post("/api/axioms", (req: any, res: any) => {
    const parsed = insertAxiomSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const axiom = storage.createAxiom(parsed.data, getUserId(req));
    res.status(201).json(axiom);
  });

  app.patch("/api/axioms/:id", (req: any, res: any) => {
    const id = parseInt(req.params.id);
    const parsed = insertAxiomSchema.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const axiom = storage.updateAxiom(id, parsed.data, getUserId(req));
    if (!axiom) return res.status(404).json({ error: "Axiom not found" });
    res.json(axiom);
  });

  app.delete("/api/axioms/:id", (req: any, res: any) => {
    const id = parseInt(req.params.id);
    const deleted = storage.deleteAxiom(id, getUserId(req));
    if (!deleted) return res.status(404).json({ error: "Axiom not found" });
    res.status(204).send();
  });

  // ─── Tensions ──────────────────────────────────────────────────────────────
  app.get("/api/tensions", (req: any, res: any) => {
    res.json(storage.getTensions(getUserId(req)));
  });

  app.get("/api/tensions/:id", (req: any, res: any) => {
    const id = parseInt(req.params.id);
    const tension = storage.getTension(id, getUserId(req));
    if (!tension) return res.status(404).json({ error: "Tension not found" });
    res.json(tension);
  });

  app.post("/api/tensions", (req: any, res: any) => {
    const parsed = insertTensionSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const tension = storage.createTension(parsed.data, getUserId(req));
    res.status(201).json(tension);
  });

  app.patch("/api/tensions/:id", (req: any, res: any) => {
    const id = parseInt(req.params.id);
    const parsed = insertTensionSchema.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const tension = storage.updateTension(id, parsed.data, getUserId(req));
    if (!tension) return res.status(404).json({ error: "Tension not found" });
    res.json(tension);
  });

  app.delete("/api/tensions/:id", (req: any, res: any) => {
    const id = parseInt(req.params.id);
    const deleted = storage.deleteTension(id, getUserId(req));
    if (!deleted) return res.status(404).json({ error: "Tension not found" });
    res.status(204).send();
  });

  // ─── Revisions ─────────────────────────────────────────────────────────────
  app.get("/api/revisions", (req: any, res: any) => {
    res.json(storage.getRevisions(getUserId(req)));
  });

  app.post("/api/revisions", (req: any, res: any) => {
    const parsed = insertRevisionSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const revision = storage.createRevision(parsed.data, getUserId(req));
    res.status(201).json(revision);
  });

  app.delete("/api/revisions/:id", (req: any, res: any) => {
    const id = parseInt(req.params.id);
    const deleted = storage.deleteRevision(id, getUserId(req));
    if (!deleted) return res.status(404).json({ error: "Revision not found" });
    res.status(204).send();
  });

  // ─── Sensitivity proxy → Lumen ──────────────────────────────────────────────
  app.get('/api/settings/sensitivity', async (req: any, res: any) => {
    const LUMEN_API_URL = process.env.LUMEN_API_URL;
    const TOKEN = process.env.LUMEN_INTERNAL_TOKEN;
    const USER_ID = req.session?.userId || process.env.LUMEN_USER_ID || '1';
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
    const USER_ID = req.session?.userId || process.env.LUMEN_USER_ID || '1';
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

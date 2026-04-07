import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "@shared/schema";
import path from "path";

const dbPath = process.env.RAILWAY_VOLUME_MOUNT_PATH
  ? `${process.env.RAILWAY_VOLUME_MOUNT_PATH}/axiom.db`
  : path.resolve(process.cwd(), "axiom.db");
const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite, { schema });

// Create tables if they don't exist
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS axioms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    number INTEGER NOT NULL,
    title TEXT NOT NULL,
    liminal_count INTEGER NOT NULL DEFAULT 0,
    parallax_count INTEGER NOT NULL DEFAULT 0,
    praxis_count INTEGER NOT NULL DEFAULT 0,
    input_descriptions TEXT NOT NULL DEFAULT '[]',
    signal TEXT NOT NULL DEFAULT '',
    convergence TEXT NOT NULL DEFAULT '',
    interpretation TEXT NOT NULL DEFAULT '',
    truth_claim TEXT NOT NULL,
    working_principle TEXT NOT NULL DEFAULT '',
    confidence TEXT NOT NULL DEFAULT 'medium',
    confidence_score INTEGER NOT NULL DEFAULT 50,
    counterevidence TEXT NOT NULL DEFAULT '',
    revision_note TEXT NOT NULL DEFAULT '',
    revision_history TEXT NOT NULL DEFAULT '[]',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS tensions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pole_a TEXT NOT NULL,
    pole_b TEXT NOT NULL,
    description TEXT NOT NULL,
    evidence TEXT NOT NULL DEFAULT '[]',
    related_axiom_ids TEXT NOT NULL DEFAULT '[]',
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS revisions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    previous_belief TEXT NOT NULL,
    new_belief TEXT NOT NULL,
    triggering_evidence TEXT NOT NULL DEFAULT '',
    significance TEXT NOT NULL DEFAULT 'moderate',
    related_axiom_id INTEGER,
    created_at TEXT NOT NULL
  );
`);

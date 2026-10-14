/**
 * CivicCare Municipal Command Engine - SQLite Database Service
 * Uses SQL.js (WASM SQLite) with persistent disk serialization.
 * Stores all tickets, user accounts, district scopes, audit logs, and duplicate clusters.
 */

import initSqlJs, { Database, SqlJsStatic } from 'sql.js';
import fs from 'node:fs';
import path from 'node:path';

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'civiccare.sqlite');

let SQL: SqlJsStatic | null = null;
let db: Database | null = null;

// Ensure database directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

export async function getDb(): Promise<Database> {
  if (db) return db;

  if (!SQL) {
    SQL = await initSqlJs();
  }

  if (fs.existsSync(DB_FILE)) {
    try {
      const fileBuffer = fs.readFileSync(DB_FILE);
      db = new SQL.Database(fileBuffer);
    } catch (err) {
      console.warn('Failed to load existing SQLite file, creating fresh database:', err);
      db = new SQL.Database();
    }
  } else {
    db = new SQL.Database();
  }

  initSchema(db);
  persistDb();
  return db;
}

export function persistDb() {
  if (!db) return;
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_FILE, buffer);
  } catch (err) {
    console.error('Failed to persist SQLite database to disk:', err);
  }
}

function initSchema(database: Database) {
  database.run(`
    CREATE TABLE IF NOT EXISTS complaints (
      id INTEGER PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      text TEXT NOT NULL,
      language TEXT NOT NULL DEFAULT 'en',
      category TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'submitted',
      priority_score REAL NOT NULL DEFAULT 50,
      priority_label TEXT NOT NULL DEFAULT 'medium',
      safety REAL NOT NULL DEFAULT 0.5,
      people REAL NOT NULL DEFAULT 0.5,
      age REAL NOT NULL DEFAULT 0.5,
      repeat REAL NOT NULL DEFAULT 0.5,
      report_count INTEGER NOT NULL DEFAULT 1,
      cluster_id INTEGER NOT NULL DEFAULT 0,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      area TEXT NOT NULL,
      city TEXT NOT NULL DEFAULT 'Karachi',
      district TEXT NOT NULL DEFAULT 'Karachi East',
      before_photo TEXT NOT NULL,
      after_photo TEXT,
      assigned_to TEXT,
      department TEXT,
      created_at TEXT NOT NULL,
      sla_due_at TEXT NOT NULL,
      overdue INTEGER NOT NULL DEFAULT 0,
      events_json TEXT NOT NULL DEFAULT '[]',
      closure_checks_json TEXT
    );

    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      cnic TEXT,
      department TEXT,
      designation TEXT,
      badge_number TEXT,
      district TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      role TEXT NOT NULL DEFAULT 'resident',
      is_super_admin INTEGER NOT NULL DEFAULT 0,
      secret_key TEXT,
      created_at TEXT NOT NULL,
      reviewed_at TEXT,
      reviewed_by TEXT,
      rejection_reason TEXT,
      complaints_count INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL,
      actor_name TEXT NOT NULL,
      actor_role TEXT NOT NULL,
      action TEXT NOT NULL,
      target_type TEXT NOT NULL,
      target_id TEXT NOT NULL,
      target_name TEXT NOT NULL,
      details TEXT NOT NULL,
      district TEXT
    );

    CREATE TABLE IF NOT EXISTS duplicate_clusters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cluster_code TEXT UNIQUE NOT NULL,
      primary_ticket_code TEXT NOT NULL,
      duplicate_ticket_code TEXT NOT NULL,
      similarity_score REAL NOT NULL,
      distance_meters REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'open',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS system_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
}

/**
 * Execute a query that returns rows as objects
 */
export async function queryAll<T = Record<string, any>>(sql: string, params: any[] = []): Promise<T[]> {
  const database = await getDb();
  const stmt = database.prepare(sql);
  if (params.length > 0) {
    stmt.bind(params);
  }

  const results: T[] = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject() as T);
  }
  stmt.free();
  return results;
}

/**
 * Execute an INSERT / UPDATE / DELETE statement and persist to disk
 */
export async function execute(sql: string, params: any[] = []): Promise<void> {
  const database = await getDb();
  database.run(sql, params);
  persistDb();
}

/**
 * Return summary statistics of the SQLite database
 */
export async function getDatabaseStats() {
  const database = await getDb();
  const complaintsCount = (await queryAll<{ count: number }>('SELECT count(*) as count FROM complaints'))[0]?.count || 0;
  const accountsCount = (await queryAll<{ count: number }>('SELECT count(*) as count FROM accounts'))[0]?.count || 0;
  const auditLogsCount = (await queryAll<{ count: number }>('SELECT count(*) as count FROM audit_logs'))[0]?.count || 0;
  const clustersCount = (await queryAll<{ count: number }>('SELECT count(*) as count FROM duplicate_clusters'))[0]?.count || 0;

  let fileSizeKb = 0;
  if (fs.existsSync(DB_FILE)) {
    fileSizeKb = Math.round(fs.statSync(DB_FILE).size / 1024);
  }

  return {
    engine: 'SQLite (sql.js WASM + Disk Persistence)',
    filePath: DB_FILE,
    fileSizeKb,
    tables: {
      complaints: complaintsCount,
      accounts: accountsCount,
      auditLogs: auditLogsCount,
      duplicateClusters: clustersCount
    },
    status: 'ONLINE_ACTIVE',
    lastSynced: new Date().toISOString()
  };
}

/**
 * CivicCare Municipal AI Operations Engine - Full-Stack Express Server
 * Powered by SQLite Database with Disk Persistence, Real Local ML Triage & Duplicate Models
 * Port: 3000
 */

import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createServer as createViteServer } from 'vite';

import { getDatabaseStats, getDb, persistDb } from './server/db/sqlite';
import { ComplaintModel } from './server/models/complaintModel';
import { UserModel } from './server/models/userModel';
import { AuditModel } from './server/models/auditModel';
import { INITIAL_TICKETS } from './src/mocks/tickets';
import { DEFAULT_ADMINS, DEFAULT_STAFF, DEFAULT_RESIDENTS, DEFAULT_AUDIT_LOGS } from './src/lib/accountStore';
import { DuplicateDetectionModel } from './src/models/duplicateDetectionModel';
import { TriageClassificationModel } from './src/models/triageClassificationModel';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProduction = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '15mb' }));

  // Initialize SQLite database and seed initial data if empty
  try {
    await getDb();
    await ComplaintModel.seedIfEmpty(INITIAL_TICKETS);
    await UserModel.seedIfEmpty(DEFAULT_ADMINS, DEFAULT_STAFF, DEFAULT_RESIDENTS);
    await AuditModel.seedIfEmpty(DEFAULT_AUDIT_LOGS);
    console.log('[SQLite] Local database initialized and synchronized successfully.');
  } catch (err) {
    console.error('[SQLite] Error during database initialization:', err);
  }

  // --- REST API ENDPOINTS ---

  // Health and System Diagnostics
  app.get('/api/health', async (_req, res) => {
    try {
      const stats = await getDatabaseStats();
      res.json({
        status: 'ok',
        system: 'CivicCare Municipal Command Server',
        database: stats,
        models: {
          duplicateDetection: '128-dim subword 3-gram + Cosine + Geodesic Haversine',
          triageClassification: 'Civic Multi-class NLP + Urgency Hazard Matrix',
          cvProofValidator: 'Laplacian kernel edge variance + Luminance histogram'
        },
        uptime: process.uptime()
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Database Statistics & Backup
  app.get('/api/db/stats', async (_req, res) => {
    try {
      const stats = await getDatabaseStats();
      res.json(stats);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Database SQL Dump / Export
  app.get('/api/db/export', async (_req, res) => {
    try {
      const dbPath = path.resolve(process.cwd(), 'data/civiccare.sqlite');
      if (fs.existsSync(dbPath)) {
        res.setHeader('Content-Type', 'application/x-sqlite3');
        res.setHeader('Content-Disposition', 'attachment; filename="civiccare_backup.sqlite"');
        const stream = fs.createReadStream(dbPath);
        stream.pipe(res);
      } else {
        res.status(404).json({ error: 'Database file not found' });
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Client-to-SQLite Bidirectional Sync
  app.post('/api/db/sync', async (req, res) => {
    try {
      const { tickets, auditLogs } = req.body;
      if (Array.isArray(tickets) && tickets.length > 0) {
        for (const t of tickets) {
          const existing = await ComplaintModel.getById(t.id);
          if (existing) {
            await ComplaintModel.update(t.id, t, 'Sync', 'System');
          }
        }
      }
      persistDb();
      const stats = await getDatabaseStats();
      res.json({ success: true, stats });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Complaints / Tickets CRUD
  app.get('/api/complaints', async (req, res) => {
    try {
      const filters = {
        status: req.query.status as string,
        category: req.query.category as string,
        area: req.query.area as string,
        district: req.query.district as string,
        priority: req.query.priority as string,
        search: req.query.search as string
      };
      const tickets = await ComplaintModel.list(filters);
      res.json(tickets);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/complaints/:id', async (req, res) => {
    try {
      const id = Number(req.params.id);
      const ticket = await ComplaintModel.getById(id);
      if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
      res.json(ticket);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/complaints', async (req, res) => {
    try {
      const input = req.body;
      const triage = TriageClassificationModel.classify(input.text, input.category);
      const priorityLabel = triage.priority === 'critical' || triage.priority === 'high' ? 'high' : triage.priority === 'medium' ? 'medium' : 'low';
      
      const newTicket = await ComplaintModel.create(input, {
        priorityScore: triage.urgencyScore,
        priorityLabel,
        department: triage.suggestedDepartment
      });

      await AuditModel.log({
        actorName: input.anonymous ? 'Anonymous Citizen' : (input.contact || 'Citizen'),
        actorRole: 'resident',
        action: 'TICKET_TRIAGED',
        targetType: 'ticket',
        targetId: String(newTicket.id),
        targetName: newTicket.code,
        summary: `Grievance registered: ${newTicket.code}`,
        details: `Logged complaint via SQLite: "${newTicket.text.slice(0, 60)}..." in ${newTicket.area}`,
        district: (newTicket as any).district || 'Karachi Citywide'
      });

      res.status(201).json(newTicket);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.patch('/api/complaints/:id', async (req, res) => {
    try {
      const id = Number(req.params.id);
      const updates = req.body;
      const actorName = (req.headers['x-actor-name'] as string) || 'Admin';
      const actorRole = (req.headers['x-actor-role'] as string) || 'Staff';

      const updated = await ComplaintModel.update(id, updates, actorName, actorRole);
      if (!updated) return res.status(404).json({ error: 'Ticket not found' });

      if (updates.status) {
        await AuditModel.log({
          actorName,
          actorRole: actorRole.toLowerCase() as any,
          action: updates.status === 'resolved' ? 'RESOLUTION_APPROVED' : 'STATUS_CHANGED',
          targetType: 'ticket',
          targetId: String(updated.id),
          targetName: updated.code,
          summary: `Ticket ${updated.code} status updated to ${updates.status}`,
          details: `Ticket status updated to ${updates.status} in SQLite`,
          district: (updated as any).district || 'Karachi Citywide'
        });
      }

      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Ticket Tracking by Code (Resident & Public)
  app.get('/api/track/:code', async (req, res) => {
    try {
      const code = req.params.code;
      const ticket = await ComplaintModel.getByCode(code);
      if (!ticket) return res.status(404).json({ error: 'Complaint not found with provided tracking code' });
      res.json(ticket);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Spatial Proximity Query
  app.get('/api/nearby', async (req, res) => {
    try {
      const lat = parseFloat(req.query.lat as string);
      const lng = parseFloat(req.query.lng as string);
      const category = req.query.category as string;

      if (isNaN(lat) || isNaN(lng)) {
        return res.status(400).json({ error: 'Invalid coordinates' });
      }

      const allTickets = await ComplaintModel.list();
      const duplicates = DuplicateDetectionModel.findDuplicates(
        { text: '', category, lat, lng },
        allTickets,
        { maxDistanceMeters: 600, minSimilarityThreshold: 0, maxResults: 10 }
      );

      const matchedIds = new Set(duplicates.map((d) => d.ticketId));
      const nearbyTickets = allTickets.filter((t) => matchedIds.has(t.id));
      res.json(nearbyTickets);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Accounts Management CRUD
  app.get('/api/accounts', async (req, res) => {
    try {
      const filters = {
        role: req.query.role as string,
        district: req.query.district as string,
        status: req.query.status as string
      };
      const accounts = await UserModel.list(filters);
      res.json(accounts);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/accounts/verify-admin', async (req, res) => {
    try {
      const { email, secretKey } = req.body;
      const result = await UserModel.verifyAdmin(email, secretKey);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.patch('/api/accounts/:id', async (req, res) => {
    try {
      const id = req.params.id;
      const updates = req.body;
      const updated = await UserModel.update(id, updates);
      if (!updated) return res.status(404).json({ error: 'Account not found' });
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/accounts/:id', async (req, res) => {
    try {
      const id = req.params.id;
      await UserModel.delete(id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Audit Logs
  app.get('/api/audit-logs', async (req, res) => {
    try {
      const district = req.query.district as string;
      const action = req.query.action as string;
      const limit = req.query.limit ? Number(req.query.limit) : 100;
      const logs = await AuditModel.list({ district, action, limit });
      res.json(logs);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/audit-logs', async (req, res) => {
    try {
      const log = await AuditModel.log(req.body);
      res.status(201).json(log);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ML Models Endpoints (Local Open-Source Execution)
  app.post('/api/models/duplicate-check', async (req, res) => {
    try {
      const { text, category, lat, lng } = req.body;
      const allTickets = await ComplaintModel.list();
      const matches = DuplicateDetectionModel.findDuplicates(
        { text: text || '', category, lat: Number(lat), lng: Number(lng) },
        allTickets
      );
      res.json({ matches });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/models/triage', async (req, res) => {
    try {
      const { text, category } = req.body;
      const prediction = TriageClassificationModel.classify(text || '', category);
      res.json(prediction);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- VITE MIDDLEWARE OR STATIC SERVING ---
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
    console.log('[Vite] Middleware mounted in development mode');
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n======================================================`);
    console.log(`  CivicCare Municipal Command Server`);
    console.log(`  Port: http://localhost:${PORT}`);
    console.log(`  Database: SQLite (sql.js WASM + Disk Persistence)`);
    console.log(`  Models: Open-Source NLP Triage + Geospatial Embeddings`);
    console.log(`======================================================\n`);
  });
}

startServer();

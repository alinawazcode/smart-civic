/**
 * Server-Side SQLite Complaint Model
 * Provides persistent SQLite operations for civic complaints.
 */

import { queryAll, execute, getDb, persistDb } from '../db/sqlite';
import { Ticket, CreateComplaintInput } from '../../src/types';

export const ComplaintModel = {
  /**
   * Seed complaints from initial dataset if empty
   */
  async seedIfEmpty(initialTickets: Ticket[]) {
    const existing = await queryAll<{ count: number }>('SELECT count(*) as count FROM complaints');
    if (existing[0]?.count > 0) return;

    console.log(`[SQLite] Seeding ${initialTickets.length} initial complaints into SQLite...`);
    const database = await getDb();

    for (const t of initialTickets) {
      database.run(
        `INSERT OR IGNORE INTO complaints (
          id, code, text, language, category, status, priority_score, priority_label,
          safety, people, age, repeat, report_count, cluster_id, lat, lng, area, city,
          district, before_photo, after_photo, assigned_to, department, created_at,
          sla_due_at, overdue, events_json, closure_checks_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          t.id,
          t.code,
          t.text,
          t.language || 'en',
          t.category,
          t.status,
          t.priorityScore,
          t.priorityLabel,
          t.factors?.safety || 0.5,
          t.factors?.people || 0.5,
          t.factors?.age || 0.5,
          t.factors?.repeat || 0.5,
          t.reportCount || 1,
          t.clusterId || 0,
          t.lat,
          t.lng,
          t.area,
          t.city || 'Karachi',
          t.area.includes('Gulshan') ? 'Karachi East' : t.area.includes('DHA') ? 'Karachi South' : 'Karachi Central',
          t.beforePhoto,
          t.afterPhoto || null,
          t.assignedTo || null,
          t.department || null,
          t.createdAt,
          t.slaDueAt,
          t.overdue ? 1 : 0,
          JSON.stringify(t.events || []),
          t.closureChecks ? JSON.stringify(t.closureChecks) : null
        ]
      );
    }
    persistDb();
  },

  /**
   * List complaints with optional filtering
   */
  async list(filters?: {
    status?: string;
    category?: string;
    area?: string;
    district?: string;
    priority?: string;
    search?: string;
  }): Promise<Ticket[]> {
    let sql = 'SELECT * FROM complaints WHERE 1=1';
    const params: any[] = [];

    if (filters?.status && filters.status !== 'all') {
      sql += ' AND status = ?';
      params.push(filters.status);
    }
    if (filters?.category && filters.category !== 'all') {
      sql += ' AND category = ?';
      params.push(filters.category);
    }
    if (filters?.district && filters.district !== 'all') {
      sql += ' AND (district LIKE ? OR area LIKE ?)';
      params.push(`%${filters.district}%`, `%${filters.district}%`);
    }
    if (filters?.priority && filters.priority !== 'all') {
      sql += ' AND priority_label = ?';
      params.push(filters.priority);
    }
    if (filters?.search) {
      sql += ' AND (code LIKE ? OR text LIKE ? OR area LIKE ? OR assigned_to LIKE ?)';
      const s = `%${filters.search}%`;
      params.push(s, s, s, s);
    }

    sql += ' ORDER BY priority_score DESC';

    const rows = await queryAll<any>(sql, params);
    return rows.map(this.rowToTicket);
  },

  /**
   * Get single complaint by ID
   */
  async getById(id: number): Promise<Ticket | null> {
    const rows = await queryAll<any>('SELECT * FROM complaints WHERE id = ? LIMIT 1', [id]);
    if (rows.length === 0) return null;
    return this.rowToTicket(rows[0]);
  },

  /**
   * Get single complaint by tracking Code
   */
  async getByCode(code: string): Promise<Ticket | null> {
    const cleanCode = code.trim().toUpperCase();
    const rows = await queryAll<any>('SELECT * FROM complaints WHERE UPPER(code) = ? LIMIT 1', [cleanCode]);
    if (rows.length === 0) return null;
    return this.rowToTicket(rows[0]);
  },

  /**
   * Create a new complaint in SQLite
   */
  async create(input: CreateComplaintInput, calculated: { priorityScore: number; priorityLabel: 'high' | 'medium' | 'low'; department?: string }): Promise<Ticket> {
    const now = new Date();
    const code = `CC-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const slaHours = calculated.priorityLabel === 'high' ? 24 : calculated.priorityLabel === 'medium' ? 48 : 72;
    const slaDueAt = new Date(now.getTime() + slaHours * 3600000).toISOString();

    const maxIdRow = await queryAll<{ maxId: number }>('SELECT MAX(id) as maxId FROM complaints');
    const newId = (maxIdRow[0]?.maxId || 0) + 1;

    const initialEvent = {
      at: now.toISOString(),
      actor: input.anonymous ? 'Anonymous Citizen' : (input.contact || 'Citizen App User'),
      role: 'Resident',
      to: 'submitted',
      note: 'Complaint officially submitted and logged in SQLite database'
    };

    const district = input.area.includes('Gulshan') || input.area.includes('Jauhar')
      ? 'Karachi East'
      : input.area.includes('DHA') || input.area.includes('Clifton')
      ? 'Karachi South'
      : 'Karachi Central';

    await execute(
      `INSERT INTO complaints (
        id, code, text, language, category, status, priority_score, priority_label,
        safety, people, age, repeat, report_count, cluster_id, lat, lng, area, city,
        district, before_photo, after_photo, assigned_to, department, created_at,
        sla_due_at, overdue, events_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newId,
        code,
        input.text,
        input.language || 'en',
        input.category,
        'submitted',
        calculated.priorityScore,
        calculated.priorityLabel,
        calculated.priorityLabel === 'high' ? 0.85 : 0.5,
        0.6,
        0.3,
        input.clusterWithId ? 0.9 : 0.2,
        input.clusterWithId ? 2 : 1,
        input.clusterWithId || 0,
        input.lat,
        input.lng,
        input.area,
        'Karachi',
        district,
        input.photoUrl,
        null,
        null,
        calculated.department || 'Works & Services Department',
        now.toISOString(),
        slaDueAt,
        0,
        JSON.stringify([initialEvent])
      ]
    );

    return (await this.getById(newId))!;
  },

  /**
   * Update complaint status, photos, or assignments
   */
  async update(id: number, updates: Partial<Ticket>, actorName = 'System', actorRole = 'System'): Promise<Ticket | null> {
    const existing = await this.getById(id);
    if (!existing) return null;

    const events = [...existing.events];
    if (updates.status && updates.status !== existing.status) {
      events.push({
        at: new Date().toISOString(),
        actor: actorName,
        role: actorRole,
        to: updates.status,
        note: `Status updated to ${updates.status} via SQLite store`
      });
    }

    const fields: string[] = [];
    const values: any[] = [];

    if (updates.status !== undefined) {
      fields.push('status = ?');
      values.push(updates.status);
    }
    if (updates.afterPhoto !== undefined) {
      fields.push('after_photo = ?');
      values.push(updates.afterPhoto);
    }
    if (updates.assignedTo !== undefined) {
      fields.push('assigned_to = ?');
      values.push(updates.assignedTo);
    }
    if (updates.department !== undefined) {
      fields.push('department = ?');
      values.push(updates.department);
    }
    if (updates.closureChecks !== undefined) {
      fields.push('closure_checks_json = ?');
      values.push(JSON.stringify(updates.closureChecks));
    }

    fields.push('events_json = ?');
    values.push(JSON.stringify(events));

    values.push(id);
    await execute(`UPDATE complaints SET ${fields.join(', ')} WHERE id = ?`, values);

    return this.getById(id);
  },

  rowToTicket(row: any): Ticket {
    let events = [];
    try {
      events = JSON.parse(row.events_json || '[]');
    } catch {
      events = [];
    }

    let closureChecks = undefined;
    if (row.closure_checks_json) {
      try {
        closureChecks = JSON.parse(row.closure_checks_json);
      } catch {
        closureChecks = undefined;
      }
    }

    return {
      id: Number(row.id),
      code: row.code,
      text: row.text,
      language: row.language,
      category: row.category,
      confidence: Number(row.confidence) || 0.92,
      needsReview: Boolean(row.needs_review),
      status: row.status,
      priorityScore: Number(row.priority_score),
      priorityLabel: row.priority_label,
      factors: {
        safety: Number(row.safety),
        people: Number(row.people),
        age: Number(row.age),
        repeat: Number(row.repeat)
      },
      reportCount: Number(row.report_count),
      clusterId: Number(row.cluster_id),
      lat: Number(row.lat),
      lng: Number(row.lng),
      area: row.area,
      city: row.city,
      beforePhoto: row.before_photo,
      afterPhoto: row.after_photo || undefined,
      assignedTo: row.assigned_to || undefined,
      department: row.department || undefined,
      createdAt: row.created_at,
      slaDueAt: row.sla_due_at,
      overdue: Boolean(row.overdue),
      events,
      closureChecks
    };
  }
};

/**
 * Server-Side SQLite Audit Model
 * Records and retrieves immutable municipal operational logs.
 */

import { queryAll, execute, getDb, persistDb } from '../db/sqlite';
import { AuditLogEntry } from '../../src/lib/accountStore';

export const AuditModel = {
  async seedIfEmpty(initialLogs: AuditLogEntry[]) {
    const existing = await queryAll<{ count: number }>('SELECT count(*) as count FROM audit_logs');
    if (existing[0]?.count > 0) return;

    console.log(`[SQLite] Seeding ${initialLogs.length} audit logs into SQLite...`);
    const database = await getDb();

    for (const log of initialLogs) {
      database.run(
        `INSERT OR IGNORE INTO audit_logs (
          id, timestamp, actor_name, actor_role, action, target_type, target_id, target_name, details, district
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          log.id,
          log.timestamp,
          log.actorName,
          log.actorRole,
          log.action,
          log.targetType,
          log.targetId,
          log.targetName,
          log.details,
          (log as any).district || 'Karachi Citywide'
        ]
      );
    }
    persistDb();
  },

  async log(entry: Omit<AuditLogEntry, 'id' | 'timestamp'> & { district?: string }) {
    const id = `audit-log-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const timestamp = new Date().toISOString();

    await execute(
      `INSERT INTO audit_logs (
        id, timestamp, actor_name, actor_role, action, target_type, target_id, target_name, details, district
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        timestamp,
        entry.actorName,
        entry.actorRole,
        entry.action,
        entry.targetType,
        entry.targetId,
        entry.targetName,
        entry.details,
        entry.district || 'Karachi Citywide'
      ]
    );

    return { id, timestamp, ...entry };
  },

  async list(filters?: { district?: string; action?: string; limit?: number }): Promise<AuditLogEntry[]> {
    let sql = 'SELECT * FROM audit_logs WHERE 1=1';
    const params: any[] = [];

    if (filters?.district && filters.district !== 'all') {
      sql += ' AND (district LIKE ? OR district = ?)';
      params.push(`%${filters.district}%`, 'Karachi Citywide');
    }
    if (filters?.action) {
      sql += ' AND action = ?';
      params.push(filters.action);
    }

    sql += ' ORDER BY timestamp DESC';
    if (filters?.limit) {
      sql += ` LIMIT ${Number(filters.limit)}`;
    }

    const rows = await queryAll<any>(sql, params);
    return rows.map((r) => ({
      id: r.id,
      timestamp: r.timestamp,
      actorName: r.actor_name,
      actorRole: r.actor_role,
      action: r.action,
      targetType: r.target_type,
      targetId: r.target_id,
      targetName: r.target_name,
      summary: r.details || r.action,
      details: r.details,
      district: r.district
    }));
  }
};

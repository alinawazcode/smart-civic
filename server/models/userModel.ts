/**
 * Server-Side SQLite User & Administrative Account Model
 * Manages Super Admins, District Admins, Field Staff, and Residents in SQLite.
 */

import { queryAll, execute, getDb, persistDb } from '../db/sqlite';
import { StaffAccount, ResidentAccount, AdminAccount } from '../../src/lib/accountStore';

export const UserModel = {
  /**
   * Seed default accounts if empty
   */
  async seedIfEmpty(admins: AdminAccount[], staff: StaffAccount[], residents: ResidentAccount[]) {
    const existing = await queryAll<{ count: number }>('SELECT count(*) as count FROM accounts');
    if (existing[0]?.count > 0) return;

    console.log(`[SQLite] Seeding initial administrative and field accounts into SQLite...`);
    const database = await getDb();

    // Seed Admins
    for (const a of admins) {
      database.run(
        `INSERT OR IGNORE INTO accounts (
          id, name, email, department, designation, district, status, role, is_super_admin, secret_key, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          a.id,
          a.name,
          a.email,
          a.department,
          a.title,
          a.district || (a.isSuperAdmin ? 'All Districts' : 'Karachi Central'),
          a.status,
          'admin',
          a.isSuperAdmin ? 1 : 0,
          a.secretKey,
          a.createdAt
        ]
      );
    }

    // Seed Staff
    for (const s of staff) {
      database.run(
        `INSERT OR IGNORE INTO accounts (
          id, name, email, phone, cnic, department, designation, badge_number, district, status, role, created_at, reviewed_at, reviewed_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          s.id,
          s.name,
          s.email,
          s.phone,
          s.cnic,
          s.department,
          s.designation,
          s.badgeNumber,
          s.district,
          s.status,
          'staff',
          s.createdAt,
          s.reviewedAt || null,
          s.reviewedBy || null
        ]
      );
    }

    // Seed Residents
    for (const r of residents) {
      database.run(
        `INSERT OR IGNORE INTO accounts (
          id, name, email, phone, cnic, district, status, role, created_at, complaints_count
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          r.id,
          r.name,
          r.email,
          r.phone,
          r.cnic,
          r.district,
          r.status,
          'resident',
          r.createdAt,
          r.complaintsCount || 0
        ]
      );
    }

    persistDb();
  },

  async list(filters?: { role?: string; district?: string; status?: string }) {
    let sql = 'SELECT * FROM accounts WHERE 1=1';
    const params: any[] = [];

    if (filters?.role) {
      sql += ' AND role = ?';
      params.push(filters.role);
    }
    if (filters?.district && filters.district !== 'all') {
      sql += ' AND district LIKE ?';
      params.push(`%${filters.district}%`);
    }
    if (filters?.status) {
      sql += ' AND status = ?';
      params.push(filters.status);
    }

    sql += ' ORDER BY created_at DESC';
    return queryAll<any>(sql, params);
  },

  async getById(id: string) {
    const rows = await queryAll<any>('SELECT * FROM accounts WHERE id = ? LIMIT 1', [id]);
    return rows[0] || null;
  },

  async getByEmail(email: string) {
    const rows = await queryAll<any>('SELECT * FROM accounts WHERE LOWER(email) = ? LIMIT 1', [email.trim().toLowerCase()]);
    return rows[0] || null;
  },

  async verifyAdmin(email: string, secretKey: string) {
    const rows = await queryAll<any>(
      'SELECT * FROM accounts WHERE role = ? AND LOWER(email) = ? AND secret_key = ? LIMIT 1',
      ['admin', email.trim().toLowerCase(), secretKey.trim()]
    );
    if (rows.length === 0) return { canLogin: false, message: 'Invalid administrative credentials' };
    const admin = rows[0];
    if (admin.status === 'suspended') {
      return { canLogin: false, message: 'This administrative account is suspended.' };
    }
    return {
      canLogin: true,
      account: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        department: admin.department,
        district: admin.district,
        isSuperAdmin: Boolean(admin.is_super_admin),
        role: 'admin'
      }
    };
  },

  async update(id: string, updates: Record<string, any>) {
    const allowed = [
      'name', 'email', 'phone', 'department', 'designation', 'badge_number',
      'district', 'status', 'rejection_reason', 'reviewed_at', 'reviewed_by'
    ];
    const fields: string[] = [];
    const values: any[] = [];

    for (const [k, v] of Object.entries(updates)) {
      if (allowed.includes(k)) {
        fields.push(`${k} = ?`);
        values.push(v);
      }
    }

    if (fields.length === 0) return null;
    values.push(id);

    await execute(`UPDATE accounts SET ${fields.join(', ')} WHERE id = ?`, values);
    return this.getById(id);
  },

  async delete(id: string) {
    await execute('DELETE FROM accounts WHERE id = ?', [id]);
    return true;
  }
};

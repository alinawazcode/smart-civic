export type AccountStatus = 'pending_approval' | 'active' | 'rejected' | 'suspended';

export interface StaffAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  cnic: string;
  department: string;
  designation: string;
  badgeNumber: string;
  district: string;
  status: AccountStatus;
  role: 'staff';
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}

export interface ResidentAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  cnic: string;
  district: string;
  address?: string;
  status: 'active' | 'suspended';
  role: 'resident';
  createdAt: string;
  complaintsCount: number;
}

export interface AdminAccount {
  id: string;
  name: string;
  email: string;
  role: 'admin';
  department: string;
  title: string;
  secretKey: string;
  isSuperAdmin: boolean;
  district?: string;
  status: 'active' | 'suspended';
  createdAt: string;
  createdBy?: string;
}

export type AuditAction =
  | 'USER_CREATED'
  | 'USER_UPDATED'
  | 'USER_DELETED'
  | 'STAFF_APPROVED'
  | 'STAFF_REJECTED'
  | 'STATUS_CHANGED'
  | 'DEPT_REASSIGNED'
  | 'CREDENTIALS_RESET'
  | 'TICKET_TRIAGED'
  | 'DUPLICATE_MERGED'
  | 'RESOLUTION_APPROVED';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: 'admin' | 'staff' | 'resident' | 'system';
  action: AuditAction;
  targetType: 'staff' | 'resident' | 'admin' | 'ticket' | 'system';
  targetId: string;
  targetName: string;
  summary: string;
  details?: string;
  ipAddress?: string;
}

const STORAGE_KEY_STAFF = 'smart_civic_staff_accounts_v1';
const STORAGE_KEY_RESIDENTS = 'smart_civic_resident_accounts_v1';
const STORAGE_KEY_ADMINS = 'smart_civic_admin_accounts_v1';
const STORAGE_KEY_AUDIT = 'smart_civic_audit_logs_v1';

// Seed authentic Pakistani civic command admins
const DEFAULT_ADMINS: AdminAccount[] = [
  {
    id: 'admin-super-01',
    name: 'Chief Secretary Mian Ali Nawaz',
    email: 'superadmin@civiccare.gov.pk',
    role: 'admin',
    department: 'Provincial Municipal Secretariat & Central Command',
    title: 'Chief Municipal Officer & Super Admin',
    secretKey: 'CIVIC-SUPER-9921',
    isSuperAdmin: true,
    district: 'All Municipal Districts (Sovereign Central Scope)',
    status: 'active',
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'admin-002',
    name: 'Director Tariq Jameel',
    email: 'admin.tariq@karachicity.gov.pk',
    role: 'admin',
    department: 'Karachi Municipal Corporation (KMC)',
    title: 'Director General Civic Dispatch',
    secretKey: 'ADMIN-KMC-2026',
    isSuperAdmin: false,
    district: 'Karachi Central',
    status: 'active',
    createdAt: '2026-01-15T00:00:00Z'
  },
  {
    id: 'admin-003',
    name: 'Engr. Sadia Parveen',
    email: 'sadia.kmc@sindh.gov.pk',
    role: 'admin',
    department: 'Karachi Water & Sewerage Board (KW&SB)',
    title: 'Executive Engineer Drainage & Triage',
    secretKey: 'ADMIN-SEC-412',
    isSuperAdmin: false,
    district: 'Karachi East',
    status: 'active',
    createdAt: '2026-02-01T00:00:00Z'
  }
];

// Seed authentic Pakistani civic workforce
const DEFAULT_STAFF: StaffAccount[] = [
  {
    id: 'staff-001',
    name: 'Rashid Minhas',
    email: 'rashid.field@kwsb.gov.pk',
    phone: '0301-8291044',
    cnic: '42101-7291024-3',
    department: 'KW&SB Water & Sanitation',
    designation: 'Senior Water Network Inspector',
    badgeNumber: 'KWSB-8821',
    district: 'Karachi Central',
    status: 'active',
    role: 'staff',
    createdAt: '2026-03-01T09:00:00Z',
    reviewedAt: '2026-03-01T11:30:00Z',
    reviewedBy: 'Director Tariq Jameel'
  },
  {
    id: 'staff-002',
    name: 'Farhan Ali Baloch',
    email: 'farhan.baloch@kmc.gos.pk',
    phone: '0333-2948172',
    cnic: '42201-1938472-7',
    department: 'KMC Solid Waste Management',
    designation: 'Sanitation Zonal Supervisor',
    badgeNumber: 'KMC-3042',
    district: 'Karachi East',
    status: 'active',
    role: 'staff',
    createdAt: '2026-03-04T10:15:00Z',
    reviewedAt: '2026-03-04T12:00:00Z',
    reviewedBy: 'Director Tariq Jameel'
  },
  {
    id: 'staff-003',
    name: 'Tariq Mehmood',
    email: 'tariq.elec@sindh.gov.pk',
    phone: '0312-9847162',
    cnic: '42301-8392019-1',
    department: 'Sindh Electrical Inspection / Streetlights',
    designation: 'Electrical Line Technician',
    badgeNumber: 'SEI-1194',
    district: 'Karachi South',
    status: 'active',
    role: 'staff',
    createdAt: '2026-03-08T08:30:00Z',
    reviewedAt: '2026-03-08T10:00:00Z',
    reviewedBy: 'Director Tariq Jameel'
  },
  {
    id: 'staff-004',
    name: 'Bilal Qureshi',
    email: 'bilal.drainage@kwsb.gov.pk',
    phone: '0345-8192736',
    cnic: '42101-5182930-5',
    department: 'KW&SB Water & Sanitation',
    designation: 'Clogged Sewer & Drainage Specialist',
    badgeNumber: 'KWSB-9204',
    district: 'Karachi Central',
    status: 'pending_approval',
    role: 'staff',
    createdAt: '2026-03-12T14:20:00Z'
  },
  {
    id: 'staff-005',
    name: 'Sanaullah Khan',
    email: 'sanaullah.epa@sindh.gov.pk',
    phone: '0300-3847192',
    cnic: '42501-9283741-3',
    department: 'Sindh Environmental Protection Agency (SEPA)',
    designation: 'Toxic & Commercial Waste Auditor',
    badgeNumber: 'SEPA-4019',
    district: 'Korangi Industrial Area',
    status: 'pending_approval',
    role: 'staff',
    createdAt: '2026-03-13T09:45:00Z'
  }
];

// Seed authentic registered Pakistani citizens
const DEFAULT_RESIDENTS: ResidentAccount[] = [
  {
    id: 'res-001',
    name: 'Ayesha Siddiqui',
    email: 'ayesha.resident@civiccare.org',
    phone: '0300-2918273',
    cnic: '42101-8392183-2',
    district: 'Karachi East (Gulshan-e-Iqbal)',
    address: 'Block 13-D, University Road',
    status: 'active',
    role: 'resident',
    createdAt: '2026-02-15T11:00:00Z',
    complaintsCount: 3
  },
  {
    id: 'res-002',
    name: 'Muhammad Usman',
    email: 'usman.resident@yahoo.com',
    phone: '0333-8172635',
    cnic: '42201-1928374-1',
    district: 'Karachi South (Clifton & DHA)',
    address: 'Phase 5, Badar Commercial Area',
    status: 'active',
    role: 'resident',
    createdAt: '2026-02-28T16:20:00Z',
    complaintsCount: 1
  },
  {
    id: 'res-003',
    name: 'Fatima Zahra',
    email: 'fatima.z@outlook.com',
    phone: '0312-7362514',
    cnic: '42301-7261524-8',
    district: 'Karachi Central (Nazimabad)',
    address: 'Sector 4-B, North Nazimabad',
    status: 'active',
    role: 'resident',
    createdAt: '2026-03-05T13:40:00Z',
    complaintsCount: 2
  },
  {
    id: 'res-004',
    name: 'Kamran Haider',
    email: 'kamran.h@gmail.com',
    phone: '0345-2198734',
    cnic: '42401-3829104-9',
    district: 'Korangi',
    address: 'Mehran Town, Sector 6-G',
    status: 'active',
    role: 'resident',
    createdAt: '2026-03-10T10:05:00Z',
    complaintsCount: 1
  }
];

// Seed initial audit trail
const DEFAULT_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'audit-001',
    timestamp: '2026-03-01T11:30:00Z',
    actorName: 'Director Tariq Jameel',
    actorRole: 'admin',
    action: 'STAFF_APPROVED',
    targetType: 'staff',
    targetId: 'staff-001',
    targetName: 'Rashid Minhas',
    summary: 'Approved staff account for Rashid Minhas (Badge: KWSB-8821)',
    details: 'Verified credentials against KW&SB field workforce database. Assigned to Karachi Central.',
    ipAddress: '10.24.11.82'
  },
  {
    id: 'audit-002',
    timestamp: '2026-03-04T12:00:00Z',
    actorName: 'Director Tariq Jameel',
    actorRole: 'admin',
    action: 'STAFF_APPROVED',
    targetType: 'staff',
    targetId: 'staff-002',
    targetName: 'Farhan Ali Baloch',
    summary: 'Approved staff account for Farhan Ali Baloch (Badge: KMC-3042)',
    details: 'Verified KMC Solid Waste contractor identification. Assigned to Karachi East.',
    ipAddress: '10.24.11.82'
  },
  {
    id: 'audit-003',
    timestamp: '2026-03-08T10:00:00Z',
    actorName: 'Director Tariq Jameel',
    actorRole: 'admin',
    action: 'STAFF_APPROVED',
    targetType: 'staff',
    targetId: 'staff-003',
    targetName: 'Tariq Mehmood',
    summary: 'Approved staff account for Tariq Mehmood (Badge: SEI-1194)',
    details: 'Assigned to Sindh Electrical Inspection Streetlights team (District South).',
    ipAddress: '10.24.11.82'
  },
  {
    id: 'audit-004',
    timestamp: '2026-03-10T14:15:00Z',
    actorName: 'Chief Secretary Mian Ali Nawaz',
    actorRole: 'admin',
    action: 'USER_CREATED',
    targetType: 'admin',
    targetId: 'admin-003',
    targetName: 'Engr. Sadia Parveen',
    summary: 'Provisioned Executive Admin account for Sadia Parveen',
    details: 'Assigned role: Executive Engineer Drainage & Triage (KW&SB).',
    ipAddress: '10.10.0.1'
  }
];

export const AccountStore = {
  // --- AUDIT LOGS ---
  getAuditLogs(): AuditLogEntry[] {
    if (typeof window === 'undefined') return DEFAULT_AUDIT_LOGS;
    try {
      const stored = localStorage.getItem(STORAGE_KEY_AUDIT);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY_AUDIT, JSON.stringify(DEFAULT_AUDIT_LOGS));
        return DEFAULT_AUDIT_LOGS;
      }
      return JSON.parse(stored);
    } catch {
      return DEFAULT_AUDIT_LOGS;
    }
  },

  addAuditLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): AuditLogEntry {
    const logs = this.getAuditLogs();
    const newEntry: AuditLogEntry = {
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      ipAddress: '10.24.11.' + Math.floor(Math.random() * 200 + 10),
      ...entry
    };
    logs.unshift(newEntry);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_AUDIT, JSON.stringify(logs.slice(0, 500))); // keep latest 500 logs
      window.dispatchEvent(new Event('audit_updated'));
    }
    return newEntry;
  },

  exportAuditLogsCSV(): string {
    const logs = this.getAuditLogs();
    const headers = ['ID', 'Timestamp', 'Actor Name', 'Actor Role', 'Action', 'Target Type', 'Target ID', 'Target Name', 'Summary', 'Details', 'IP Address'];
    const rows = logs.map((l) => [
      `"${l.id}"`,
      `"${l.timestamp}"`,
      `"${l.actorName.replace(/"/g, '""')}"`,
      `"${l.actorRole}"`,
      `"${l.action}"`,
      `"${l.targetType}"`,
      `"${l.targetId}"`,
      `"${l.targetName.replace(/"/g, '""')}"`,
      `"${l.summary.replace(/"/g, '""')}"`,
      `"${(l.details || '').replace(/"/g, '""')}"`,
      `"${l.ipAddress || ''}"`
    ]);
    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  },

  exportAuditLogsJSON(): string {
    return JSON.stringify(this.getAuditLogs(), null, 2);
  },

  // --- STAFF ACCOUNTS ---
  getStaffAccounts(): StaffAccount[] {
    if (typeof window === 'undefined') return DEFAULT_STAFF;
    try {
      const stored = localStorage.getItem(STORAGE_KEY_STAFF);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY_STAFF, JSON.stringify(DEFAULT_STAFF));
        return DEFAULT_STAFF;
      }
      return JSON.parse(stored);
    } catch {
      return DEFAULT_STAFF;
    }
  },

  saveStaffAccounts(accounts: StaffAccount[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY_STAFF, JSON.stringify(accounts));
    window.dispatchEvent(new Event('accounts_updated'));
  },

  getPendingStaff(): StaffAccount[] {
    return this.getStaffAccounts().filter((s) => s.status === 'pending_approval');
  },

  getActiveStaff(): StaffAccount[] {
    return this.getStaffAccounts().filter((s) => s.status === 'active');
  },

  approveStaff(id: string, adminName: string = 'Director Tariq Jameel'): boolean {
    const list = this.getStaffAccounts();
    const targetIndex = list.findIndex((s) => s.id === id);
    if (targetIndex === -1) return false;

    const staff = list[targetIndex];
    list[targetIndex] = {
      ...staff,
      status: 'active',
      reviewedAt: new Date().toISOString(),
      reviewedBy: adminName,
      rejectionReason: undefined
    };
    this.saveStaffAccounts(list);

    this.addAuditLog({
      actorName: adminName,
      actorRole: 'admin',
      action: 'STAFF_APPROVED',
      targetType: 'staff',
      targetId: staff.id,
      targetName: staff.name,
      summary: `Approved registration for ${staff.name} (${staff.badgeNumber})`,
      details: `Department: ${staff.department}, Designation: ${staff.designation}, District: ${staff.district}`
    });

    return true;
  },

  rejectStaff(id: string, reason: string, adminName: string = 'Director Tariq Jameel'): boolean {
    const list = this.getStaffAccounts();
    const targetIndex = list.findIndex((s) => s.id === id);
    if (targetIndex === -1) return false;

    const staff = list[targetIndex];
    list[targetIndex] = {
      ...staff,
      status: 'rejected',
      reviewedAt: new Date().toISOString(),
      reviewedBy: adminName,
      rejectionReason: reason || 'Credentials could not be verified by Municipal Authority'
    };
    this.saveStaffAccounts(list);

    this.addAuditLog({
      actorName: adminName,
      actorRole: 'admin',
      action: 'STAFF_REJECTED',
      targetType: 'staff',
      targetId: staff.id,
      targetName: staff.name,
      summary: `Rejected staff application for ${staff.name} (${staff.badgeNumber})`,
      details: `Rejection reason: ${reason || 'Unverified credentials'}`
    });

    return true;
  },

  setStaffStatus(id: string, status: AccountStatus, actorName: string = 'Director Tariq Jameel'): boolean {
    const list = this.getStaffAccounts();
    const targetIndex = list.findIndex((s) => s.id === id);
    if (targetIndex === -1) return false;

    const oldStatus = list[targetIndex].status;
    list[targetIndex] = {
      ...list[targetIndex],
      status
    };
    this.saveStaffAccounts(list);

    this.addAuditLog({
      actorName,
      actorRole: 'admin',
      action: 'STATUS_CHANGED',
      targetType: 'staff',
      targetId: list[targetIndex].id,
      targetName: list[targetIndex].name,
      summary: `Changed staff status from ${oldStatus} to ${status}`,
      details: `Officer: ${list[targetIndex].name} (${list[targetIndex].badgeNumber})`
    });

    return true;
  },

  updateStaffAccount(
    id: string,
    updates: Partial<Omit<StaffAccount, 'id' | 'role' | 'createdAt'>>,
    actorName: string = 'Director Tariq Jameel'
  ): boolean {
    const list = this.getStaffAccounts();
    const idx = list.findIndex((s) => s.id === id);
    if (idx === -1) return false;

    const original = list[idx];
    const changedFields = Object.keys(updates).filter((k) => (updates as any)[k] !== (original as any)[k]);
    list[idx] = { ...original, ...updates };
    this.saveStaffAccounts(list);

    this.addAuditLog({
      actorName,
      actorRole: 'admin',
      action: 'USER_UPDATED',
      targetType: 'staff',
      targetId: id,
      targetName: list[idx].name,
      summary: `Updated profile details for staff member ${list[idx].name}`,
      details: `Modified fields: ${changedFields.join(', ')}`
    });

    return true;
  },

  reassignStaffDepartment(
    id: string,
    newDepartment: string,
    newDistrict?: string,
    actorName: string = 'Director Tariq Jameel'
  ): boolean {
    const list = this.getStaffAccounts();
    const idx = list.findIndex((s) => s.id === id);
    if (idx === -1) return false;

    const oldDept = list[idx].department;
    list[idx].department = newDepartment;
    if (newDistrict) list[idx].district = newDistrict;
    this.saveStaffAccounts(list);

    this.addAuditLog({
      actorName,
      actorRole: 'admin',
      action: 'DEPT_REASSIGNED',
      targetType: 'staff',
      targetId: id,
      targetName: list[idx].name,
      summary: `Reassigned ${list[idx].name} from ${oldDept} to ${newDepartment}`,
      details: `Updated district: ${list[idx].district}`
    });

    return true;
  },

  registerStaffSelf(data: {
    name: string;
    email: string;
    phone: string;
    cnic: string;
    department: string;
    badgeNumber: string;
    district: string;
    designation?: string;
  }): StaffAccount {
    const list = this.getStaffAccounts();
    const newStaff: StaffAccount = {
      id: `staff-${Date.now().toString().slice(-6)}`,
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone.trim(),
      cnic: data.cnic.trim(),
      department: data.department.trim(),
      designation: data.designation?.trim() || 'Field Officer',
      badgeNumber: data.badgeNumber.trim().toUpperCase(),
      district: data.district.trim(),
      status: 'pending_approval', // MANDATORY: requires Admin approval!
      role: 'staff',
      createdAt: new Date().toISOString()
    };
    list.unshift(newStaff);
    this.saveStaffAccounts(list);

    this.addAuditLog({
      actorName: newStaff.name,
      actorRole: 'staff',
      action: 'USER_CREATED',
      targetType: 'staff',
      targetId: newStaff.id,
      targetName: newStaff.name,
      summary: `Self-registered staff application queued for approval`,
      details: `Badge: ${newStaff.badgeNumber}, Department: ${newStaff.department}`
    });

    return newStaff;
  },

  adminCreateStaff(
    data: {
      name: string;
      email: string;
      phone: string;
      cnic: string;
      department: string;
      badgeNumber: string;
      district: string;
      designation?: string;
    },
    adminName: string = 'Director Tariq Jameel'
  ): StaffAccount {
    const list = this.getStaffAccounts();
    const newStaff: StaffAccount = {
      id: `staff-${Date.now().toString().slice(-6)}`,
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone.trim(),
      cnic: data.cnic.trim(),
      department: data.department.trim(),
      designation: data.designation?.trim() || 'Field Inspector',
      badgeNumber: data.badgeNumber.trim().toUpperCase(),
      district: data.district.trim(),
      status: 'active', // Admin-created accounts are immediately active
      role: 'staff',
      createdAt: new Date().toISOString(),
      reviewedAt: new Date().toISOString(),
      reviewedBy: adminName
    };
    list.unshift(newStaff);
    this.saveStaffAccounts(list);

    this.addAuditLog({
      actorName: adminName,
      actorRole: 'admin',
      action: 'USER_CREATED',
      targetType: 'staff',
      targetId: newStaff.id,
      targetName: newStaff.name,
      summary: `Provisioned active staff account for ${newStaff.name} (${newStaff.badgeNumber})`,
      details: `Department: ${newStaff.department}, Assigned to ${newStaff.district}`
    });

    return newStaff;
  },

  deleteStaff(id: string, actorName: string = 'Director Tariq Jameel') {
    const list = this.getStaffAccounts();
    const target = list.find((s) => s.id === id);
    const filtered = list.filter((s) => s.id !== id);
    this.saveStaffAccounts(filtered);

    if (target) {
      this.addAuditLog({
        actorName,
        actorRole: 'admin',
        action: 'USER_DELETED',
        targetType: 'staff',
        targetId: id,
        targetName: target.name,
        summary: `Deleted staff profile for ${target.name} (${target.badgeNumber})`,
        details: `Department was ${target.department}`
      });
    }
  },

  // --- RESIDENT ACCOUNTS ---
  getResidentAccounts(): ResidentAccount[] {
    if (typeof window === 'undefined') return DEFAULT_RESIDENTS;
    try {
      const stored = localStorage.getItem(STORAGE_KEY_RESIDENTS);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY_RESIDENTS, JSON.stringify(DEFAULT_RESIDENTS));
        return DEFAULT_RESIDENTS;
      }
      return JSON.parse(stored);
    } catch {
      return DEFAULT_RESIDENTS;
    }
  },

  saveResidentAccounts(accounts: ResidentAccount[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY_RESIDENTS, JSON.stringify(accounts));
    window.dispatchEvent(new Event('accounts_updated'));
  },

  registerResident(data: {
    name: string;
    email: string;
    phone: string;
    cnic: string;
    district: string;
    address?: string;
  }): ResidentAccount {
    const list = this.getResidentAccounts();
    const cleanEmail = data.email.trim().toLowerCase();
    const cleanPhone = data.phone.trim().replace(/\D/g, '');

    const existing = list.find(
      (r) =>
        r.email.toLowerCase() === cleanEmail ||
        (cleanPhone.length > 5 && r.phone.replace(/\D/g, '') === cleanPhone)
    );
    if (existing) {
      return existing;
    }

    const newRes: ResidentAccount = {
      id: `res-${Date.now().toString().slice(-6)}`,
      name: data.name.trim(),
      email: cleanEmail,
      phone: data.phone.trim(),
      cnic: data.cnic.trim(),
      district: data.district.trim(),
      address: data.address?.trim(),
      status: 'active',
      role: 'resident',
      createdAt: new Date().toISOString(),
      complaintsCount: 0
    };
    list.unshift(newRes);
    this.saveResidentAccounts(list);

    this.addAuditLog({
      actorName: newRes.name,
      actorRole: 'resident',
      action: 'USER_CREATED',
      targetType: 'resident',
      targetId: newRes.id,
      targetName: newRes.name,
      summary: `Citizen profile registered for ${newRes.name} (${newRes.district})`,
      details: `Phone: ${newRes.phone}, CNIC: ${newRes.cnic}`
    });

    return newRes;
  },

  updateResidentAccount(
    id: string,
    updates: Partial<Omit<ResidentAccount, 'id' | 'role' | 'createdAt'>>,
    actorName: string = 'Director Tariq Jameel'
  ): boolean {
    const list = this.getResidentAccounts();
    const idx = list.findIndex((r) => r.id === id);
    if (idx === -1) return false;

    const original = list[idx];
    const changedFields = Object.keys(updates).filter((k) => (updates as any)[k] !== (original as any)[k]);
    list[idx] = { ...original, ...updates };
    this.saveResidentAccounts(list);

    this.addAuditLog({
      actorName,
      actorRole: 'admin',
      action: 'USER_UPDATED',
      targetType: 'resident',
      targetId: id,
      targetName: list[idx].name,
      summary: `Updated citizen record for ${list[idx].name}`,
      details: `Modified fields: ${changedFields.join(', ')}`
    });

    return true;
  },

  setResidentStatus(id: string, status: 'active' | 'suspended', actorName: string = 'Director Tariq Jameel'): boolean {
    const list = this.getResidentAccounts();
    const targetIndex = list.findIndex((r) => r.id === id);
    if (targetIndex === -1) return false;

    const oldStatus = list[targetIndex].status;
    list[targetIndex] = {
      ...list[targetIndex],
      status
    };
    this.saveResidentAccounts(list);

    this.addAuditLog({
      actorName,
      actorRole: 'admin',
      action: 'STATUS_CHANGED',
      targetType: 'resident',
      targetId: list[targetIndex].id,
      targetName: list[targetIndex].name,
      summary: `Citizen status changed from ${oldStatus} to ${status}`,
      details: `Resident: ${list[targetIndex].name} (${list[targetIndex].phone})`
    });

    return true;
  },

  deleteResident(id: string, actorName: string = 'Director Tariq Jameel') {
    const list = this.getResidentAccounts();
    const target = list.find((r) => r.id === id);
    const filtered = list.filter((r) => r.id !== id);
    this.saveResidentAccounts(filtered);

    if (target) {
      this.addAuditLog({
        actorName,
        actorRole: 'admin',
        action: 'USER_DELETED',
        targetType: 'resident',
        targetId: id,
        targetName: target.name,
        summary: `Deleted citizen profile for ${target.name}`,
        details: `District was ${target.district}`
      });
    }
  },

  // --- AUTHENTICATION HELPERS ---
  verifyStaffLogin(identifier: string): {
    canLogin: boolean;
    account?: StaffAccount;
    reason?: 'not_found' | 'pending_approval' | 'rejected' | 'suspended';
    message?: string;
  } {
    const cleanId = identifier.trim().toLowerCase();
    const digitsOnly = identifier.replace(/\D/g, '');
    const staffList = this.getStaffAccounts();

    const found = staffList.find((s) => {
      const sDigitsPhone = s.phone.replace(/\D/g, '');
      const sDigitsCnic = s.cnic.replace(/\D/g, '');
      return (
        s.email.toLowerCase() === cleanId ||
        s.badgeNumber.toLowerCase() === cleanId ||
        (digitsOnly.length > 5 && (sDigitsPhone === digitsOnly || sDigitsCnic === digitsOnly))
      );
    });

    if (!found) {
      return {
        canLogin: false,
        reason: 'not_found',
        message: 'No municipal staff account found with these credentials. Please submit a staff registration request.'
      };
    }

    if (found.status === 'pending_approval') {
      return {
        canLogin: false,
        account: found,
        reason: 'pending_approval',
        message: `Account Pending Admin Approval: Staff application for ${found.name} (Badge: ${found.badgeNumber}, ${found.department}) is currently queued for review. An Administrator must approve your account before you can sign in.`
      };
    }

    if (found.status === 'rejected') {
      return {
        canLogin: false,
        account: found,
        reason: 'rejected',
        message: `Staff Application Rejected: ${found.rejectionReason || 'Verification failed. Please contact your Zonal Municipal Officer.'}`
      };
    }

    if (found.status === 'suspended') {
      return {
        canLogin: false,
        account: found,
        reason: 'suspended',
        message: 'This staff account has been suspended by Municipal Command. Access denied.'
      };
    }

    return {
      canLogin: true,
      account: found
    };
  },

  verifyResidentLogin(identifier: string): {
    canLogin: boolean;
    account?: ResidentAccount;
    message?: string;
  } {
    const cleanId = identifier.trim().toLowerCase();
    const digitsOnly = identifier.replace(/\D/g, '');
    const residents = this.getResidentAccounts();

    // Check existing
    const found = residents.find((r) => {
      const rDigitsPhone = r.phone.replace(/\D/g, '');
      const rDigitsCnic = r.cnic.replace(/\D/g, '');
      return (
        r.email.toLowerCase() === cleanId ||
        (digitsOnly.length > 5 && (rDigitsPhone === digitsOnly || rDigitsCnic === digitsOnly))
      );
    });

    if (found) {
      if (found.status === 'suspended') {
        return {
          canLogin: false,
          account: found,
          message: 'This citizen account has been temporarily suspended. Please contact civic support.'
        };
      }
      return {
        canLogin: true,
        account: found
      };
    }

    // Auto-create on the fly for any valid citizen identifier (phone or email)
    const newCitizen = this.registerResident({
      name: identifier.includes('@') ? identifier.split('@')[0] : 'Resident Citizen',
      email: identifier.includes('@') ? identifier : `${digitsOnly || 'citizen'}@pakistan.pk`,
      phone: digitsOnly.length > 5 ? identifier : '0300-2918273',
      cnic: '42101-0000000-1',
      district: 'Karachi Central'
    });

    return {
      canLogin: true,
      account: newCitizen
    };
  },

  // --- ADMIN & SUPER ADMIN ACCOUNTS ---
  getAdminAccounts(): AdminAccount[] {
    if (typeof window === 'undefined') return DEFAULT_ADMINS;
    try {
      const stored = localStorage.getItem(STORAGE_KEY_ADMINS);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY_ADMINS, JSON.stringify(DEFAULT_ADMINS));
        return DEFAULT_ADMINS;
      }
      return JSON.parse(stored);
    } catch {
      return DEFAULT_ADMINS;
    }
  },

  saveAdminAccounts(accounts: AdminAccount[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY_ADMINS, JSON.stringify(accounts));
    window.dispatchEvent(new Event('accounts_updated'));
  },

  verifyAdminLogin(email: string, secretKey: string): {
    canLogin: boolean;
    account?: AdminAccount;
    message?: string;
  } {
    const cleanEmail = email.trim().toLowerCase();
    const cleanKey = secretKey.trim();
    const admins = this.getAdminAccounts();

    const found = admins.find((a) => a.email.toLowerCase() === cleanEmail);
    if (!found) {
      return {
        canLogin: false,
        message: 'No administrator authorization credentials found for this email address.'
      };
    }

    if (found.status === 'suspended') {
      return {
        canLogin: false,
        account: found,
        message: 'This municipal administrator profile is suspended by Central Command.'
      };
    }

    if (found.secretKey !== cleanKey) {
      return {
        canLogin: false,
        account: found,
        message: 'Incorrect Administrator Secret Security Key. Verification failed.'
      };
    }

    return {
      canLogin: true,
      account: found
    };
  },

  createAdminBySuperAdmin(
    data: {
      name: string;
      email: string;
      department: string;
      title: string;
      secretKey: string;
      isSuperAdmin?: boolean;
      createdBy?: string;
    },
    superAdminName: string = 'Chief Secretary Mian Ali Nawaz'
  ): AdminAccount {
    const list = this.getAdminAccounts();
    const newAdmin: AdminAccount = {
      id: `admin-${Date.now().toString().slice(-6)}`,
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      department: data.department.trim(),
      title: data.title.trim() || 'Civic Operations Admin',
      secretKey: data.secretKey.trim() || `SEC-${Math.random().toString(36).slice(-6).toUpperCase()}`,
      isSuperAdmin: Boolean(data.isSuperAdmin),
      status: 'active',
      role: 'admin',
      createdAt: new Date().toISOString(),
      createdBy: superAdminName
    };

    list.unshift(newAdmin);
    this.saveAdminAccounts(list);

    this.addAuditLog({
      actorName: superAdminName,
      actorRole: 'admin',
      action: 'USER_CREATED',
      targetType: 'admin',
      targetId: newAdmin.id,
      targetName: newAdmin.name,
      summary: `Created administrator account for ${newAdmin.name} (${newAdmin.title})`,
      details: `Department: ${newAdmin.department}, Super Admin: ${newAdmin.isSuperAdmin ? 'Yes' : 'No'}`
    });

    return newAdmin;
  },

  updateAdminAccount(
    id: string,
    updates: Partial<Omit<AdminAccount, 'id' | 'role' | 'createdAt'>>,
    actorName: string = 'Chief Secretary Mian Ali Nawaz'
  ): boolean {
    const list = this.getAdminAccounts();
    const idx = list.findIndex((a) => a.id === id);
    if (idx === -1) return false;

    // Prevent demoting root super admin
    if (list[idx].id === 'admin-super-01' && updates.isSuperAdmin === false) {
      return false;
    }

    const original = list[idx];
    const changedFields = Object.keys(updates).filter((k) => (updates as any)[k] !== (original as any)[k]);
    list[idx] = { ...original, ...updates };
    this.saveAdminAccounts(list);

    this.addAuditLog({
      actorName,
      actorRole: 'admin',
      action: 'USER_UPDATED',
      targetType: 'admin',
      targetId: id,
      targetName: list[idx].name,
      summary: `Updated administrator profile for ${list[idx].name}`,
      details: `Modified fields: ${changedFields.join(', ')}`
    });

    return true;
  },

  resetUserCredentials(
    targetType: 'admin' | 'staff',
    targetId: string,
    newSecretOrBadge: string,
    actorName: string = 'Chief Secretary Mian Ali Nawaz'
  ): boolean {
    if (targetType === 'admin') {
      const admins = this.getAdminAccounts();
      const idx = admins.findIndex((a) => a.id === targetId);
      if (idx === -1) return false;
      admins[idx].secretKey = newSecretOrBadge.trim();
      this.saveAdminAccounts(admins);

      this.addAuditLog({
        actorName,
        actorRole: 'admin',
        action: 'CREDENTIALS_RESET',
        targetType: 'admin',
        targetId,
        targetName: admins[idx].name,
        summary: `Reset security access key for Admin ${admins[idx].name}`
      });
      return true;
    } else {
      const staff = this.getStaffAccounts();
      const idx = staff.findIndex((s) => s.id === targetId);
      if (idx === -1) return false;
      staff[idx].badgeNumber = newSecretOrBadge.trim();
      this.saveStaffAccounts(staff);

      this.addAuditLog({
        actorName,
        actorRole: 'admin',
        action: 'CREDENTIALS_RESET',
        targetType: 'staff',
        targetId,
        targetName: staff[idx].name,
        summary: `Updated municipal badge identifier for Officer ${staff[idx].name}`
      });
      return true;
    }
  },

  setAdminStatus(id: string, status: 'active' | 'suspended', actorName: string = 'Chief Secretary Mian Ali Nawaz'): boolean {
    const list = this.getAdminAccounts();
    const targetIndex = list.findIndex((a) => a.id === id);
    if (targetIndex === -1) return false;

    // Prevent suspending the root super admin
    if (list[targetIndex].id === 'admin-super-01' && status === 'suspended') {
      return false;
    }

    const oldStatus = list[targetIndex].status;
    list[targetIndex] = {
      ...list[targetIndex],
      status
    };
    this.saveAdminAccounts(list);

    this.addAuditLog({
      actorName,
      actorRole: 'admin',
      action: 'STATUS_CHANGED',
      targetType: 'admin',
      targetId: list[targetIndex].id,
      targetName: list[targetIndex].name,
      summary: `Administrator access changed from ${oldStatus} to ${status}`,
      details: `Profile: ${list[targetIndex].name} (${list[targetIndex].email})`
    });

    return true;
  },

  deleteAdmin(id: string, actorName: string = 'Chief Secretary Mian Ali Nawaz'): boolean {
    const list = this.getAdminAccounts();
    const target = list.find((a) => a.id === id);
    if (!target || target.id === 'admin-super-01') {
      return false; // Cannot delete primary root Super Admin
    }

    const filtered = list.filter((a) => a.id !== id);
    this.saveAdminAccounts(filtered);

    this.addAuditLog({
      actorName,
      actorRole: 'admin',
      action: 'USER_DELETED',
      targetType: 'admin',
      targetId: id,
      targetName: target.name,
      summary: `Revoked and deleted administrator account for ${target.name}`,
      details: `Department: ${target.department}`
    });

    return true;
  }
};

export { DEFAULT_ADMINS, DEFAULT_STAFF, DEFAULT_RESIDENTS, DEFAULT_AUDIT_LOGS };

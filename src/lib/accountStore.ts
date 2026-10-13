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
}

const STORAGE_KEY_STAFF = 'smart_civic_staff_accounts_v1';
const STORAGE_KEY_RESIDENTS = 'smart_civic_resident_accounts_v1';

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
  // PENDING APPROVAL - Requires Admin review
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

export const AccountStore = {
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

    list[targetIndex] = {
      ...list[targetIndex],
      status: 'active',
      reviewedAt: new Date().toISOString(),
      reviewedBy: adminName,
      rejectionReason: undefined
    };
    this.saveStaffAccounts(list);
    return true;
  },

  rejectStaff(id: string, reason: string, adminName: string = 'Director Tariq Jameel'): boolean {
    const list = this.getStaffAccounts();
    const targetIndex = list.findIndex((s) => s.id === id);
    if (targetIndex === -1) return false;

    list[targetIndex] = {
      ...list[targetIndex],
      status: 'rejected',
      reviewedAt: new Date().toISOString(),
      reviewedBy: adminName,
      rejectionReason: reason || 'Credentials could not be verified by Municipal Authority'
    };
    this.saveStaffAccounts(list);
    return true;
  },

  setStaffStatus(id: string, status: AccountStatus): boolean {
    const list = this.getStaffAccounts();
    const targetIndex = list.findIndex((s) => s.id === id);
    if (targetIndex === -1) return false;

    list[targetIndex] = {
      ...list[targetIndex],
      status
    };
    this.saveStaffAccounts(list);
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
    return newStaff;
  },

  adminCreateStaff(data: {
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
      designation: data.designation?.trim() || 'Field Inspector',
      badgeNumber: data.badgeNumber.trim().toUpperCase(),
      district: data.district.trim(),
      status: 'active', // Admin-created accounts are immediately active
      role: 'staff',
      createdAt: new Date().toISOString(),
      reviewedAt: new Date().toISOString(),
      reviewedBy: 'Director Tariq Jameel'
    };
    list.unshift(newStaff);
    this.saveStaffAccounts(list);
    return newStaff;
  },

  deleteStaff(id: string) {
    const list = this.getStaffAccounts().filter((s) => s.id !== id);
    this.saveStaffAccounts(list);
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
    // Check if existing
    const existing = list.find(
      (r) => r.email.toLowerCase() === data.email.toLowerCase() || (data.phone && r.phone === data.phone)
    );
    if (existing) {
      return existing;
    }

    const newRes: ResidentAccount = {
      id: `res-${Date.now().toString().slice(-6)}`,
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
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
    return newRes;
  },

  setResidentStatus(id: string, status: 'active' | 'suspended'): boolean {
    const list = this.getResidentAccounts();
    const targetIndex = list.findIndex((r) => r.id === id);
    if (targetIndex === -1) return false;

    list[targetIndex] = {
      ...list[targetIndex],
      status
    };
    this.saveResidentAccounts(list);
    return true;
  },

  deleteResident(id: string) {
    const list = this.getResidentAccounts().filter((r) => r.id !== id);
    this.saveResidentAccounts(list);
  },

  // --- AUTHENTICATION HELPERS ---
  verifyStaffLogin(identifier: string): {
    canLogin: boolean;
    account?: StaffAccount;
    reason?: 'not_found' | 'pending_approval' | 'rejected' | 'suspended';
    message?: string;
  } {
    const cleanId = identifier.trim().toLowerCase();
    const staffList = this.getStaffAccounts();
    const found = staffList.find(
      (s) =>
        s.email.toLowerCase() === cleanId ||
        s.phone.replace(/\D/g, '') === cleanId.replace(/\D/g, '') ||
        s.badgeNumber.toLowerCase() === cleanId ||
        s.cnic.replace(/\D/g, '') === cleanId.replace(/\D/g, '')
    );

    if (!found) {
      // If not registered yet, we notify them to self-register or contact admin
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
    const residents = this.getResidentAccounts();
    const found = residents.find(
      (r) =>
        r.email.toLowerCase() === cleanId ||
        r.phone.replace(/\D/g, '') === cleanId.replace(/\D/g, '') ||
        r.cnic.replace(/\D/g, '') === cleanId.replace(/\D/g, '')
    );

    if (!found) {
      // Auto-create on the fly if valid format or allow them to proceed
      return {
        canLogin: true,
        account: {
          id: `res-${Date.now().toString().slice(-6)}`,
          name: identifier.split('@')[0] || 'Resident Citizen',
          email: identifier.includes('@') ? identifier : `${identifier}@citizen.pk`,
          phone: identifier.match(/^[0-9+]/) ? identifier : '0300-1234567',
          cnic: '42101-0000000-1',
          district: 'Karachi Central',
          status: 'active',
          role: 'resident',
          createdAt: new Date().toISOString(),
          complaintsCount: 0
        }
      };
    }

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
};

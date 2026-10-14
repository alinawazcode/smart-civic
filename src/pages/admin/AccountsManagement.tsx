import React, { useState, useEffect } from 'react';
import {
  Users,
  UserCheck,
  Clock,
  ShieldCheck,
  Check,
  X,
  Search,
  Filter,
  Plus,
  AlertTriangle,
  Building2,
  Phone,
  Mail,
  MapPin,
  IdCard,
  Ban,
  CheckCircle2,
  Trash2,
  BadgeAlert,
  KeyRound,
  Eye,
  EyeOff,
  Crown,
  Shield,
  Edit2,
  FileSpreadsheet,
  FileCode,
  ArrowRightLeft,
  History,
  FileText,
  ShieldAlert
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { useRole } from '../../context/RoleContext';
import {
  AccountStore,
  StaffAccount,
  ResidentAccount,
  AdminAccount,
  AccountStatus,
  AuditLogEntry,
  AuditAction
} from '../../lib/accountStore';

export const AccountsManagement: React.FC = () => {
  const { isSuperAdmin, userName, userDistrict } = useRole();
  const [activeSubTab, setActiveSubTab] = useState<'pending' | 'staff' | 'residents' | 'admins' | 'audit'>('pending');
  const [staffList, setStaffList] = useState<StaffAccount[]>([]);
  const [residentList, setResidentList] = useState<ResidentAccount[]>([]);
  const [adminList, setAdminList] = useState<AdminAccount[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [revealedKeys, setRevealedKeys] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [auditActionFilter, setAuditActionFilter] = useState('all');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Add Modals
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [showAddResidentModal, setShowAddResidentModal] = useState(false);
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);

  // Rejection State
  const [rejectingStaffId, setRejectingStaffId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Edit Modals
  const [editingStaff, setEditingStaff] = useState<StaffAccount | null>(null);
  const [editingResident, setEditingResident] = useState<ResidentAccount | null>(null);
  const [editingAdmin, setEditingAdmin] = useState<AdminAccount | null>(null);

  // Department Transfer Modal
  const [reassigningStaff, setReassigningStaff] = useState<StaffAccount | null>(null);
  const [transferDept, setTransferDept] = useState('KW&SB Water & Sanitation');
  const [transferDistrict, setTransferDistrict] = useState('Karachi East');

  // Credential Reset Modal
  const [credentialResetTarget, setCredentialResetTarget] = useState<{
    type: 'staff' | 'admin';
    id: string;
    name: string;
    currentVal: string;
  } | null>(null);
  const [newCredentialValue, setNewCredentialValue] = useState('');

  // Form states for adding staff
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffPhone, setNewStaffPhone] = useState('0300-1234567');
  const [newStaffCnic, setNewStaffCnic] = useState('42101-1234567-1');
  const [newStaffDept, setNewStaffDept] = useState('KMC Solid Waste Management');
  const [newStaffDesignation, setNewStaffDesignation] = useState('Field Officer');
  const [newStaffBadge, setNewStaffBadge] = useState('');
  const [newStaffDistrict, setNewStaffDistrict] = useState('Karachi East');

  // Form states for adding resident
  const [newResName, setNewResName] = useState('');
  const [newResEmail, setNewResEmail] = useState('');
  const [newResPhone, setNewResPhone] = useState('0321-9876543');
  const [newResCnic, setNewResCnic] = useState('42201-9876543-2');
  const [newResDistrict, setNewResDistrict] = useState('Karachi Central');
  const [newResAddress, setNewResAddress] = useState('');

  // Form states for adding admin
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminDept, setNewAdminDept] = useState('Karachi Municipal Corporation (KMC)');
  const [newAdminTitle, setNewAdminTitle] = useState('Zonal Triage Director');
  const [newAdminSecretKey, setNewAdminSecretKey] = useState('SEC-ADM-9214');
  const [newAdminIsSuper, setNewAdminIsSuper] = useState(false);

  const loadData = () => {
    setStaffList(AccountStore.getStaffAccounts());
    setResidentList(AccountStore.getResidentAccounts());
    setAdminList(AccountStore.getAdminAccounts());
    setAuditLogs(AccountStore.getAuditLogs());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('accounts_updated', handleUpdate);
    window.addEventListener('audit_updated', handleUpdate);
    return () => {
      window.removeEventListener('accounts_updated', handleUpdate);
      window.removeEventListener('audit_updated', handleUpdate);
    };
  }, []);

  const showToast = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const pendingStaff = staffList.filter((s) => s.status === 'pending_approval');
  const activeStaffCount = staffList.filter((s) => s.status === 'active').length;
  const activeResidentsCount = residentList.filter((r) => r.status === 'active').length;

  // Department staff breakdown
  const departmentWorkload = staffList.reduce((acc, s) => {
    acc[s.department] = (acc[s.department] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Handlers
  const handleApproveStaff = (staff: StaffAccount) => {
    const success = AccountStore.approveStaff(staff.id, userName || 'Director Tariq Jameel');
    if (success) {
      loadData();
      showToast('success', `Approved ${staff.name} (${staff.badgeNumber}). Account is now active.`);
    }
  };

  const handleConfirmReject = () => {
    if (!rejectingStaffId) return;
    const success = AccountStore.rejectStaff(rejectingStaffId, rejectReason, userName || 'Director Tariq Jameel');
    if (success) {
      loadData();
      showToast('error', 'Staff registration request rejected.');
    }
    setRejectingStaffId(null);
    setRejectReason('');
  };

  const handleToggleStaffStatus = (staff: StaffAccount) => {
    const newStatus: AccountStatus = staff.status === 'active' ? 'suspended' : 'active';
    AccountStore.setStaffStatus(staff.id, newStatus, userName || 'Director Tariq Jameel');
    loadData();
    showToast('success', `Staff ${staff.name} status updated to ${newStatus}.`);
  };

  const handleToggleResidentStatus = (res: ResidentAccount) => {
    const newStatus = res.status === 'active' ? 'suspended' : 'active';
    AccountStore.setResidentStatus(res.id, newStatus, userName || 'Director Tariq Jameel');
    loadData();
    showToast('success', `Citizen ${res.name} status updated to ${newStatus}.`);
  };

  const handleToggleAdminStatus = (admin: AdminAccount) => {
    const newStatus = admin.status === 'active' ? 'suspended' : 'active';
    const success = AccountStore.setAdminStatus(admin.id, newStatus, userName || 'Super Admin');
    if (success) {
      loadData();
      showToast('success', `Admin ${admin.name} access updated to ${newStatus}.`);
    } else {
      showToast('error', 'Cannot suspend the primary root super admin account.');
    }
  };

  const handleDeleteStaff = (id: string, name: string) => {
    if (window.confirm(`Permanently remove staff account for ${name}?`)) {
      AccountStore.deleteStaff(id, userName || 'Director Tariq Jameel');
      loadData();
      showToast('success', `Removed staff account ${name}.`);
    }
  };

  const handleDeleteResident = (id: string, name: string) => {
    if (window.confirm(`Permanently remove citizen account for ${name}?`)) {
      AccountStore.deleteResident(id, userName || 'Director Tariq Jameel');
      loadData();
      showToast('success', `Removed citizen account ${name}.`);
    }
  };

  const handleDeleteAdmin = (id: string, name: string) => {
    if (window.confirm(`Revoke and remove Administrator account for ${name}?`)) {
      const ok = AccountStore.deleteAdmin(id, userName || 'Super Admin');
      if (ok) {
        loadData();
        showToast('success', `Removed admin account ${name}.`);
      } else {
        showToast('error', 'Cannot delete the primary Root Super Admin account.');
      }
    }
  };

  // Create Staff
  const handleCreateStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName.trim() || !newStaffBadge.trim()) return;

    AccountStore.adminCreateStaff(
      {
        name: newStaffName,
        email: newStaffEmail || `${newStaffBadge.toLowerCase()}@kmc.gov.pk`,
        phone: newStaffPhone,
        cnic: newStaffCnic,
        department: newStaffDept,
        designation: newStaffDesignation,
        badgeNumber: newStaffBadge,
        district: newStaffDistrict
      },
      userName || 'Director Tariq Jameel'
    );

    loadData();
    setShowAddStaffModal(false);
    setNewStaffName('');
    setNewStaffBadge('');
    showToast('success', `Staff account created and activated for ${newStaffName}!`);
  };

  // Create Resident
  const handleCreateResidentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResName.trim() || !newResPhone.trim()) return;

    AccountStore.registerResident({
      name: newResName,
      email: newResEmail || `${newResName.toLowerCase().replace(/\s+/g, '')}@citizen.pk`,
      phone: newResPhone,
      cnic: newResCnic,
      district: newResDistrict,
      address: newResAddress
    });

    loadData();
    setShowAddResidentModal(false);
    setNewResName('');
    showToast('success', `Citizen account created for ${newResName}!`);
  };

  // Create Admin
  const handleCreateAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminName.trim() || !newAdminEmail.trim()) return;

    AccountStore.createAdminBySuperAdmin(
      {
        name: newAdminName,
        email: newAdminEmail,
        department: newAdminDept,
        title: newAdminTitle,
        secretKey: newAdminSecretKey,
        isSuperAdmin: newAdminIsSuper
      },
      userName || 'Super Admin'
    );

    loadData();
    setShowAddAdminModal(false);
    setNewAdminName('');
    setNewAdminEmail('');
    showToast('success', `Administrator profile provisioned for ${newAdminName}!`);
  };

  // Edit Staff Submit
  const handleEditStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;

    AccountStore.updateStaffAccount(
      editingStaff.id,
      {
        name: editingStaff.name,
        email: editingStaff.email,
        phone: editingStaff.phone,
        cnic: editingStaff.cnic,
        department: editingStaff.department,
        designation: editingStaff.designation,
        badgeNumber: editingStaff.badgeNumber,
        district: editingStaff.district
      },
      userName || 'Director Tariq Jameel'
    );

    loadData();
    setEditingStaff(null);
    showToast('success', `Updated staff record for ${editingStaff.name}.`);
  };

  // Edit Resident Submit
  const handleEditResidentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingResident) return;

    AccountStore.updateResidentAccount(
      editingResident.id,
      {
        name: editingResident.name,
        email: editingResident.email,
        phone: editingResident.phone,
        cnic: editingResident.cnic,
        district: editingResident.district,
        address: editingResident.address
      },
      userName || 'Director Tariq Jameel'
    );

    loadData();
    setEditingResident(null);
    showToast('success', `Updated citizen profile for ${editingResident.name}.`);
  };

  // Edit Admin Submit
  const handleEditAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAdmin) return;

    AccountStore.updateAdminAccount(
      editingAdmin.id,
      {
        name: editingAdmin.name,
        email: editingAdmin.email,
        department: editingAdmin.department,
        title: editingAdmin.title,
        secretKey: editingAdmin.secretKey,
        isSuperAdmin: editingAdmin.isSuperAdmin
      },
      userName || 'Super Admin'
    );

    loadData();
    setEditingAdmin(null);
    showToast('success', `Updated administrator record for ${editingAdmin.name}.`);
  };

  // Department Transfer Submit
  const handleDepartmentTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reassigningStaff) return;

    AccountStore.reassignStaffDepartment(
      reassigningStaff.id,
      transferDept,
      transferDistrict,
      userName || 'Director Tariq Jameel'
    );

    loadData();
    setReassigningStaff(null);
    showToast('success', `Reassigned ${reassigningStaff.name} to ${transferDept}.`);
  };

  // Credential Reset Submit
  const handleCredentialResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!credentialResetTarget || !newCredentialValue.trim()) return;

    AccountStore.resetUserCredentials(
      credentialResetTarget.type,
      credentialResetTarget.id,
      newCredentialValue,
      userName || 'Super Admin'
    );

    loadData();
    setCredentialResetTarget(null);
    setNewCredentialValue('');
    showToast('success', `Security credentials updated for ${credentialResetTarget.name}.`);
  };

  // Export handlers
  const handleExportCSV = () => {
    const csvData = AccountStore.exportAuditLogsCSV();
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `municipal_audit_log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    const jsonData = AccountStore.exportAuditLogsJSON();
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `municipal_audit_log_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered queries
  const filteredStaff = staffList.filter((s) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      s.name.toLowerCase().includes(q) ||
      s.badgeNumber.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      s.department.toLowerCase().includes(q) ||
      s.district.toLowerCase().includes(q);
    const matchesDept = deptFilter === 'all' || s.department.toLowerCase().includes(deptFilter.toLowerCase());
    return matchesSearch && matchesDept;
  });

  const filteredResidents = residentList.filter((r) => {
    const q = searchQuery.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      r.phone.includes(q) ||
      r.cnic.includes(q) ||
      r.district.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q)
    );
  });

  const filteredAuditLogs = auditLogs.filter((log) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      log.actorName.toLowerCase().includes(q) ||
      log.summary.toLowerCase().includes(q) ||
      log.targetName.toLowerCase().includes(q) ||
      (log.details && log.details.toLowerCase().includes(q));
    const matchesAction = auditActionFilter === 'all' || log.action === auditActionFilter;
    return matchesSearch && matchesAction;
  });

  return (
    <div className="space-y-6">
      {/* Toast notification */}
      {notification && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-bold flex items-center justify-between shadow-md transition-all ${
            notification.type === 'success'
              ? 'bg-[#E3F5EC] border border-[#C8EBD9] text-[#166F57]'
              : 'bg-[#FEE2E2] border border-[#FCA5A5] text-[#991B1B]'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-[#1E8E6E]" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-[#DC2626]" />
            )}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-current opacity-70 hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending Staff Approvals Card */}
        <div
          onClick={() => setActiveSubTab('pending')}
          className={`cursor-pointer p-4 rounded-2xl border transition-all ${
            pendingStaff.length > 0
              ? 'bg-amber-50/80 border-amber-300 shadow-sm hover:shadow-md ring-2 ring-amber-400/30'
              : 'bg-white border-[#E3EAE7] hover:border-[#1E8E6E]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6B7C77]">Pending Approvals</span>
            <div
              className={`p-2 rounded-xl ${
                pendingStaff.length > 0 ? 'bg-amber-100 text-amber-700' : 'bg-[#F5F8F7] text-[#6B7C77]'
              }`}
            >
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span
              className={`text-2xl font-black ${pendingStaff.length > 0 ? 'text-amber-800' : 'text-[#14231F]'}`}
            >
              {pendingStaff.length}
            </span>
            <span className="text-[11px] text-[#6B7C77]">Staff requests</span>
          </div>
          <p className="text-[11px] text-amber-700 font-medium mt-1">
            {pendingStaff.length > 0 ? 'Requires Admin review & authorization' : 'All staff registrations cleared'}
          </p>
        </div>

        {/* Active Municipal Staff */}
        <div
          onClick={() => setActiveSubTab('staff')}
          className="cursor-pointer p-4 rounded-2xl bg-white border border-[#E3EAE7] shadow-sm hover:border-[#1E8E6E] transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6B7C77]">Active Staff Crews</span>
            <div className="p-2 rounded-xl bg-[#E6F4EF] text-[#1E8E6E]">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#14231F]">{activeStaffCount}</span>
            <span className="text-[11px] text-[#6B7C77]">Field personnel</span>
          </div>
          <p className="text-[11px] text-[#1E8E6E] font-medium mt-1">KMC, KW&SB, Sindh Lighting & EPA</p>
        </div>

        {/* Registered Citizens */}
        <div
          onClick={() => setActiveSubTab('residents')}
          className="cursor-pointer p-4 rounded-2xl bg-white border border-[#E3EAE7] shadow-sm hover:border-[#1E8E6E] transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6B7C77]">Citizen Accounts</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#14231F]">{activeResidentsCount}</span>
            <span className="text-[11px] text-[#6B7C77]">Registered</span>
          </div>
          <p className="text-[11px] text-[#6B7C77] mt-1">Verified phone & CNIC citizens</p>
        </div>

        {/* Municipal Authority Audit Trail */}
        <div
          onClick={() => setActiveSubTab('audit')}
          className="cursor-pointer p-4 rounded-2xl bg-gradient-to-br from-[#14231F] to-[#1E3B33] text-white shadow-sm hover:ring-2 hover:ring-[#34D399]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#A3B8B0]">Audit Trail</span>
            <History className="w-4 h-4 text-[#34D399]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{auditLogs.length}</span>
            <span className="text-[11px] text-[#A3B8B0]">Logged events</span>
          </div>
          <p className="text-[10px] text-[#34D399] font-medium mt-1">Immutable RBAC & Triage Log</p>
        </div>
      </div>

      {/* Department Workload Summary Bar */}
      <div className="p-4 rounded-2xl bg-white border border-[#E3EAE7] shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-[#1E8E6E]" />
          <span className="text-xs font-bold text-[#14231F]">Department Staff Distribution:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {Object.entries(departmentWorkload).map(([dept, count]) => (
            <span
              key={dept}
              className="px-2.5 py-1 rounded-lg bg-[#F5F8F7] border border-[#E3EAE7] text-[#14231F] font-medium flex items-center gap-1.5"
            >
              <span className="truncate max-w-[160px]">{dept}</span>
              <strong className="text-[#1E8E6E] font-mono">{count}</strong>
            </span>
          ))}
        </div>
      </div>

      {/* Main Subtabs Header */}
      <div className="bg-white rounded-3xl border border-[#E3EAE7] shadow-sm p-4 sm:p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#E3EAE7] pb-4">
          {/* Subtabs Switcher */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#F5F8F7] rounded-2xl border border-[#E3EAE7]">
            <button
              onClick={() => setActiveSubTab('pending')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                activeSubTab === 'pending'
                  ? 'bg-white text-amber-800 shadow-xs border border-[#E3EAE7]'
                  : 'text-[#6B7C77] hover:text-[#14231F]'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Pending Approvals</span>
              {pendingStaff.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-extrabold animate-pulse">
                  {pendingStaff.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveSubTab('staff')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                activeSubTab === 'staff'
                  ? 'bg-white text-[#1E8E6E] shadow-xs border border-[#E3EAE7]'
                  : 'text-[#6B7C77] hover:text-[#14231F]'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-[#1E8E6E]" />
              <span>Municipal Staff ({staffList.length})</span>
            </button>

            <button
              onClick={() => setActiveSubTab('residents')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                activeSubTab === 'residents'
                  ? 'bg-white text-blue-700 shadow-xs border border-[#E3EAE7]'
                  : 'text-[#6B7C77] hover:text-[#14231F]'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-blue-600" />
              <span>Citizens ({residentList.length})</span>
            </button>

            <button
              onClick={() => setActiveSubTab('admins')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                activeSubTab === 'admins'
                  ? 'bg-[#14231F] text-[#34D399] shadow-xs'
                  : 'text-[#6B7C77] hover:text-[#14231F]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#34D399]" />
              <span>Admin Officers ({adminList.length})</span>
              {!isSuperAdmin && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-extrabold uppercase">
                  Super Only
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveSubTab('audit')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                activeSubTab === 'audit'
                  ? 'bg-white text-indigo-700 shadow-xs border border-[#E3EAE7]'
                  : 'text-[#6B7C77] hover:text-[#14231F]'
              }`}
            >
              <History className="w-3.5 h-3.5 text-indigo-600" />
              <span>Audit Trail ({auditLogs.length})</span>
            </button>
          </div>

          {/* Action Buttons for Current Tab */}
          <div className="flex items-center gap-2">
            {activeSubTab === 'staff' && (
              <Button
                size="sm"
                onClick={() => setShowAddStaffModal(true)}
                className="flex items-center gap-1.5 font-bold shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Provision Staff Member</span>
              </Button>
            )}
            {activeSubTab === 'residents' && (
              <Button
                size="sm"
                onClick={() => setShowAddResidentModal(true)}
                className="flex items-center gap-1.5 font-bold shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Register Citizen Profile</span>
              </Button>
            )}
            {activeSubTab === 'admins' && (
              isSuperAdmin ? (
                <Button
                  size="sm"
                  onClick={() => setShowAddAdminModal(true)}
                  className="flex items-center gap-1.5 font-bold shadow-xs bg-[#14231F] hover:bg-black text-[#34D399] border border-[#34D399]/40"
                >
                  <Plus className="w-4 h-4 text-[#34D399]" />
                  <span>Add Municipal Admin</span>
                </Button>
              ) : (
                <span className="text-xs px-3 py-1.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 font-semibold flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                  <span>Super Admin Restricted</span>
                </span>
              )
            )}
            {activeSubTab === 'audit' && (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleExportCSV}
                  className="flex items-center gap-1.5 text-xs font-bold"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Export CSV</span>
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleExportJSON}
                  className="flex items-center gap-1.5 text-xs font-bold"
                >
                  <FileCode className="w-3.5 h-3.5 text-blue-600" />
                  <span>Export JSON</span>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* 1. PENDING STAFF APPROVALS VIEW */}
        {activeSubTab === 'pending' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-extrabold text-[#14231F]">
                  Staff Access Requests Awaiting Verification
                </h4>
                <p className="text-xs text-[#6B7C77]">
                  Field workers who self-registered must be vetted and authorized by a Municipal Administrator before accessing dispatch.
                </p>
              </div>
            </div>

            {pendingStaff.length === 0 ? (
              <div className="p-8 text-center bg-[#F5F8F7] rounded-2xl border border-dashed border-[#C8D6D1] space-y-2">
                <CheckCircle2 className="w-8 h-8 text-[#1E8E6E] mx-auto" />
                <h5 className="text-xs font-bold text-[#14231F]">No Pending Staff Applications</h5>
                <p className="text-xs text-[#6B7C77]">
                  All submitted municipal crew credentials have been reviewed. When new field staff register, they will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingStaff.map((staff) => (
                  <div
                    key={staff.id}
                    className="p-4 sm:p-5 rounded-2xl border-2 border-amber-200 bg-amber-50/40 hover:bg-amber-50/80 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs"
                  >
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-extrabold text-[#14231F]">{staff.name}</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black border border-amber-300">
                          PENDING APPROVAL
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-white border border-[#E3EAE7] text-[10px] font-mono font-bold text-[#14231F]">
                          Badge: {staff.badgeNumber}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#6B7C77]">
                        <span className="flex items-center gap-1 font-semibold text-[#1E8E6E]">
                          <Building2 className="w-3.5 h-3.5" />
                          {staff.department} ({staff.designation})
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#6B7C77]" />
                          {staff.district}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#6B7C77]">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5" />
                          {staff.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5" />
                          {staff.phone}
                        </span>
                        <span className="flex items-center gap-1 font-mono">
                          <IdCard className="w-3.5 h-3.5" />
                          CNIC: {staff.cnic}
                        </span>
                      </div>
                    </div>

                    {/* Actions: Approve or Reject */}
                    <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-amber-200">
                      <button
                        onClick={() => handleApproveStaff(staff)}
                        className="px-4 py-2 rounded-xl bg-[#1E8E6E] hover:bg-[#166F57] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <Check className="w-4 h-4" />
                        <span>Approve & Activate</span>
                      </button>

                      <button
                        onClick={() => {
                          setRejectingStaffId(staff.id);
                          setRejectReason('Badge or Department details could not be verified with Municipal HR.');
                        }}
                        className="px-3 py-2 rounded-xl bg-white border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold flex items-center gap-1 transition-all"
                      >
                        <X className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 2. ALL MUNICIPAL STAFF DIRECTORY */}
        {activeSubTab === 'staff' && (
          <div className="space-y-4">
            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#6B7C77] absolute start-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search staff by name, badge ID, department or email..."
                  className="w-full ps-9 pe-3 py-2 rounded-xl border border-[#E3EAE7] text-xs text-[#14231F]"
                />
              </div>

              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-[#E3EAE7] text-xs text-[#14231F] bg-white font-medium"
              >
                <option value="all">All Municipal Departments</option>
                <option value="Solid Waste">KMC Solid Waste</option>
                <option value="Water">KW&SB Water & Sanitation</option>
                <option value="Electrical">Sindh Electrical / Streetlights</option>
                <option value="Environmental">Sindh EPA</option>
              </select>
            </div>

            {/* Staff Table with full CRUD Actions */}
            <div className="overflow-x-auto border border-[#E3EAE7] rounded-2xl">
              <table className="w-full text-xs text-start">
                <thead className="bg-[#F5F8F7] border-b border-[#E3EAE7] font-semibold text-[#6B7C77]">
                  <tr>
                    <th className="p-3 text-start">Personnel & Badge</th>
                    <th className="p-3 text-start">Department & Role</th>
                    <th className="p-3 text-start">Contact & District</th>
                    <th className="p-3 text-start">Status</th>
                    <th className="p-3 text-end">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3EAE7]">
                  {filteredStaff.map((s) => (
                    <tr key={s.id} className="hover:bg-[#F5F8F7]/50 transition-colors">
                      <td className="p-3">
                        <strong className="text-[#14231F] block">{s.name}</strong>
                        <span className="text-[11px] text-[#1E8E6E] font-mono font-bold">
                          Badge: {s.badgeNumber}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="text-[#14231F] font-semibold block">{s.department}</span>
                        <span className="text-[11px] text-[#6B7C77]">{s.designation}</span>
                      </td>
                      <td className="p-3 text-[#6B7C77]">
                        <div className="text-[#14231F] font-semibold">{s.phone}</div>
                        <div className="text-[11px]">{s.district}</div>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                            s.status === 'active'
                              ? 'bg-[#E3F5EC] text-[#1E8E6E] border border-[#C8EBD9]'
                              : s.status === 'pending_approval'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-red-100 text-red-700 border border-red-200'
                          }`}
                        >
                          {s.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3 text-end">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setEditingStaff(s)}
                            title="Edit Staff Record"
                            className="p-1.5 rounded-lg border border-[#E3EAE7] text-[#14231F] hover:bg-[#E6F4EF] hover:border-[#1E8E6E]"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setReassigningStaff(s);
                              setTransferDept(s.department);
                              setTransferDistrict(s.district);
                            }}
                            title="Reassign Department"
                            className="p-1.5 rounded-lg border border-[#E3EAE7] text-[#1E8E6E] hover:bg-[#E6F4EF]"
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleToggleStaffStatus(s)}
                            title={s.status === 'active' ? 'Suspend Staff' : 'Activate Staff'}
                            className={`p-1.5 rounded-lg border text-xs font-semibold ${
                              s.status === 'active'
                                ? 'border-[#E3EAE7] text-[#6B7C77] hover:text-amber-700 hover:bg-amber-50'
                                : 'border-emerald-300 text-[#1E8E6E] hover:bg-emerald-50'
                            }`}
                          >
                            {s.status === 'active' ? <Ban className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => handleDeleteStaff(s.id, s.name)}
                            title="Delete Staff"
                            className="p-1.5 rounded-lg border border-[#E3EAE7] text-[#6B7C77] hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. RESIDENT CITIZENS DIRECTORY */}
        {activeSubTab === 'residents' && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="w-4 h-4 text-[#6B7C77] absolute start-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search citizen by name, phone, CNIC, or district..."
                className="w-full ps-9 pe-3 py-2 rounded-xl border border-[#E3EAE7] text-xs text-[#14231F]"
              />
            </div>

            <div className="overflow-x-auto border border-[#E3EAE7] rounded-2xl">
              <table className="w-full text-xs text-start">
                <thead className="bg-[#F5F8F7] border-b border-[#E3EAE7] font-semibold text-[#6B7C77]">
                  <tr>
                    <th className="p-3 text-start">Citizen Name & Email</th>
                    <th className="p-3 text-start">Contact & CNIC</th>
                    <th className="p-3 text-start">District & Address</th>
                    <th className="p-3 text-start">Complaints</th>
                    <th className="p-3 text-start">Status</th>
                    <th className="p-3 text-end">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3EAE7]">
                  {filteredResidents.map((r) => (
                    <tr key={r.id} className="hover:bg-[#F5F8F7]/50">
                      <td className="p-3">
                        <strong className="text-[#14231F] block">{r.name}</strong>
                        <span className="text-[11px] text-[#6B7C77] font-mono">{r.email}</span>
                      </td>
                      <td className="p-3 font-mono text-[11px] text-[#6B7C77]">
                        <div className="text-[#14231F] font-semibold">{r.phone}</div>
                        <div>CNIC: {r.cnic}</div>
                      </td>
                      <td className="p-3">
                        <span className="text-[#14231F] font-semibold block">{r.district}</span>
                        <span className="text-[11px] text-[#6B7C77]">{r.address || 'Address on record'}</span>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full bg-[#E6F4EF] text-[#166F57] font-bold text-[11px]">
                          {r.complaintsCount} Reports
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                            r.status === 'active'
                              ? 'bg-[#E3F5EC] text-[#1E8E6E] border border-[#C8EBD9]'
                              : 'bg-red-100 text-red-700 border border-red-200'
                          }`}
                        >
                          {r.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3 text-end">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setEditingResident(r)}
                            title="Edit Citizen Profile"
                            className="p-1.5 rounded-lg border border-[#E3EAE7] text-[#14231F] hover:bg-[#E6F4EF] hover:border-[#1E8E6E]"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleToggleResidentStatus(r)}
                            title={r.status === 'active' ? 'Suspend Citizen' : 'Activate Citizen'}
                            className={`p-1.5 rounded-lg border text-xs font-semibold ${
                              r.status === 'active'
                                ? 'border-[#E3EAE7] text-[#6B7C77] hover:text-amber-700 hover:bg-amber-50'
                                : 'border-emerald-300 text-[#1E8E6E] hover:bg-emerald-50'
                            }`}
                          >
                            {r.status === 'active' ? <Ban className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => handleDeleteResident(r.id, r.name)}
                            title="Delete Citizen"
                            className="p-1.5 rounded-lg border border-[#E3EAE7] text-[#6B7C77] hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. ADMIN OFFICERS DIRECTORY */}
        {activeSubTab === 'admins' && (
          <div className="space-y-4">
            {!isSuperAdmin && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold">District Administrator Restricted Scope</h4>
                  <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                    Executive administrative credentials, officer provisioning, and access key rotation are restricted exclusively to Sovereign Super Administrators. As District Admin ({userDistrict || 'Karachi Central'}), your operational authority is dedicated to Field Staff supervision and Resident complaint dispatch in your assigned district.
                  </p>
                </div>
              </div>
            )}

            <div className="overflow-x-auto rounded-2xl border border-[#E3EAE7]">
              <table className="w-full text-xs text-start">
                <thead className="bg-[#F5F8F7] border-b border-[#E3EAE7] font-semibold text-[#6B7C77]">
                  <tr>
                    <th className="p-3 text-start">Officer Name & Role</th>
                    <th className="p-3 text-start">Department & District</th>
                    <th className="p-3 text-start">Secret Access Key</th>
                    <th className="p-3 text-start">Status</th>
                    <th className="p-3 text-end">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3EAE7]">
                  {adminList.map((a) => (
                    <tr key={a.id} className="hover:bg-[#F5F8F7]/60 transition-colors">
                      <td className="p-3 font-medium text-[#14231F]">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                              a.isSuperAdmin
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : 'bg-[#E6F4EF] text-[#1E8E6E]'
                            }`}
                          >
                            {a.isSuperAdmin ? <Crown className="w-4 h-4 text-amber-600" /> : a.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-[#14231F]">{a.name}</span>
                              {a.isSuperAdmin ? (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-200">
                                  SUPER ADMIN
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                                  DISTRICT ADMIN
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-[#6B7C77] block font-mono">{a.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-3 text-[#14231F]">
                        <span className="font-semibold block">{a.title}</span>
                        <span className="text-[11px] text-[#1E8E6E] font-medium block">{a.district || a.department}</span>
                      </td>

                      <td className="p-3">
                        {isSuperAdmin ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F5F8F7] border border-[#E3EAE7]">
                            <KeyRound className="w-3.5 h-3.5 text-[#1E8E6E]" />
                            <span className="font-mono text-xs font-bold text-[#14231F] select-all">
                              {revealedKeys[a.id] ? a.secretKey : '••••••••••••'}
                            </span>
                            <button
                              type="button"
                              onClick={() => setRevealedKeys((prev) => ({ ...prev, [a.id]: !prev[a.id] }))}
                              className="text-[#6B7C77] hover:text-[#14231F] p-0.5 cursor-pointer"
                              title={revealedKeys[a.id] ? 'Hide Key' : 'Reveal Secret Key'}
                            >
                              {revealedKeys[a.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-[#6B7C77] font-mono italic">•••••••••••• (Super Admin Protected)</span>
                        )}
                      </td>

                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            a.status === 'active'
                              ? 'bg-[#E3F5EC] text-[#2E9E6B]'
                              : 'bg-red-50 text-red-700'
                          }`}
                        >
                          {a.status.toUpperCase()}
                        </span>
                      </td>

                      <td className="p-3 text-end">
                        {isSuperAdmin ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setEditingAdmin(a)}
                              title="Edit Admin"
                              className="p-1.5 rounded-lg border border-[#E3EAE7] text-[#14231F] hover:bg-[#E6F4EF] cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            {a.id !== 'admin-super-01' ? (
                              <>
                                <button
                                  onClick={() => handleToggleAdminStatus(a)}
                                  title={a.status === 'active' ? 'Suspend Admin Access' : 'Activate Admin Access'}
                                  className={`p-1.5 rounded-lg border text-xs font-semibold cursor-pointer ${
                                    a.status === 'active'
                                      ? 'border-[#E3EAE7] text-[#6B7C77] hover:text-amber-700 hover:bg-amber-50'
                                      : 'border-emerald-300 text-[#1E8E6E] hover:bg-emerald-50'
                                  }`}
                                >
                                  {a.status === 'active' ? <Ban className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                                </button>
                                <button
                                  onClick={() => handleDeleteAdmin(a.id, a.name)}
                                  title="Revoke Admin Access"
                                  className="p-1.5 rounded-lg border border-[#E3EAE7] text-[#6B7C77] hover:text-red-600 hover:bg-red-50 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            ) : (
                              <span className="text-[10px] text-[#6B7C77] font-semibold italic">Protected Root</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[10px] text-[#6B7C77] font-semibold italic px-2 py-1 rounded bg-[#F5F8F7]">
                            View Only
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. AUDIT TRAIL LOGS */}
        {activeSubTab === 'audit' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#6B7C77] absolute start-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search audit trail by actor, action summary, target name..."
                  className="w-full ps-9 pe-3 py-2 rounded-xl border border-[#E3EAE7] text-xs text-[#14231F]"
                />
              </div>

              <select
                value={auditActionFilter}
                onChange={(e) => setAuditActionFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-[#E3EAE7] text-xs text-[#14231F] bg-white font-medium"
              >
                <option value="all">All Action Types</option>
                <option value="USER_CREATED">USER_CREATED</option>
                <option value="USER_UPDATED">USER_UPDATED</option>
                <option value="USER_DELETED">USER_DELETED</option>
                <option value="STAFF_APPROVED">STAFF_APPROVED</option>
                <option value="STAFF_REJECTED">STAFF_REJECTED</option>
                <option value="STATUS_CHANGED">STATUS_CHANGED</option>
                <option value="DEPT_REASSIGNED">DEPT_REASSIGNED</option>
                <option value="CREDENTIALS_RESET">CREDENTIALS_RESET</option>
              </select>
            </div>

            <div className="overflow-x-auto border border-[#E3EAE7] rounded-2xl">
              <table className="w-full text-xs text-start">
                <thead className="bg-[#F5F8F7] border-b border-[#E3EAE7] font-semibold text-[#6B7C77]">
                  <tr>
                    <th className="p-3 text-start">Timestamp & IP</th>
                    <th className="p-3 text-start">Actor / Officer</th>
                    <th className="p-3 text-start">Action Type</th>
                    <th className="p-3 text-start">Target Entity</th>
                    <th className="p-3 text-start">Audit Summary & Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3EAE7]">
                  {filteredAuditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-[#6B7C77]">
                        No audit records match the selected filter.
                      </td>
                    </tr>
                  ) : (
                    filteredAuditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-[#F5F8F7]/50 font-sans">
                        <td className="p-3 font-mono text-[11px] text-[#6B7C77]">
                          <div className="text-[#14231F] font-semibold">
                            {log.timestamp.slice(0, 10)} {log.timestamp.slice(11, 16)}
                          </div>
                          <div>IP: {log.ipAddress || '10.24.11.82'}</div>
                        </td>
                        <td className="p-3">
                          <strong className="text-[#14231F] block">{log.actorName}</strong>
                          <span className="text-[10px] uppercase font-bold text-[#1E8E6E]">
                            {log.actorRole}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-md bg-[#F5F8F7] border border-[#E3EAE7] text-[10px] font-mono font-bold text-[#14231F]">
                            {log.action}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="text-[#14231F] font-semibold block">{log.targetName}</span>
                          <span className="text-[10px] text-[#6B7C77] capitalize">{log.targetType}</span>
                        </td>
                        <td className="p-3 text-[#14231F]">
                          <p className="font-semibold text-xs">{log.summary}</p>
                          {log.details && (
                            <p className="text-[11px] text-[#6B7C77] mt-0.5">{log.details}</p>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: Provision New Staff Member */}
      {showAddStaffModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-[#E3EAE7] space-y-4">
            <div className="flex items-center justify-between border-b border-[#E3EAE7] pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#1E8E6E]" />
                <h3 className="text-base font-extrabold text-[#14231F]">Provision Municipal Staff Member</h3>
              </div>
              <button onClick={() => setShowAddStaffModal(false)} className="text-[#6B7C77] hover:text-[#14231F]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStaffSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#14231F] block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={newStaffName}
                    onChange={(e) => setNewStaffName(e.target.value)}
                    placeholder="e.g. Asadullah Sheikh"
                    className="w-full p-2.5 rounded-xl border border-[#E3EAE7] text-xs text-[#14231F]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#14231F] block mb-1">Badge Number</label>
                  <input
                    type="text"
                    required
                    value={newStaffBadge}
                    onChange={(e) => setNewStaffBadge(e.target.value)}
                    placeholder="e.g. KMC-4921"
                    className="w-full p-2.5 rounded-xl border border-[#E3EAE7] text-xs text-[#14231F]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#14231F] block mb-1">Department</label>
                  <select
                    value={newStaffDept}
                    onChange={(e) => setNewStaffDept(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E3EAE7] text-xs text-[#14231F] bg-white"
                  >
                    <option value="KMC Solid Waste Management">KMC Solid Waste Management</option>
                    <option value="KW&SB Water & Sanitation">KW&SB Water & Sanitation</option>
                    <option value="Sindh Electrical Inspection / Streetlights">Sindh Electrical Lighting</option>
                    <option value="Sindh Environmental Protection Agency (SEPA)">Sindh EPA Environmental</option>
                    <option value="Works & Services Department">Works & Services (Roads)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-[#14231F] block mb-1">Designation</label>
                  <input
                    type="text"
                    required
                    value={newStaffDesignation}
                    onChange={(e) => setNewStaffDesignation(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E3EAE7] text-xs text-[#14231F]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#14231F] block mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={newStaffPhone}
                    onChange={(e) => setNewStaffPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E3EAE7] text-xs text-[#14231F]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#14231F] block mb-1">District</label>
                  <select
                    value={newStaffDistrict}
                    onChange={(e) => setNewStaffDistrict(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E3EAE7] text-xs text-[#14231F] bg-white"
                  >
                    <option value="Karachi Central">Karachi Central</option>
                    <option value="Karachi East">Karachi East</option>
                    <option value="Karachi South">Karachi South</option>
                    <option value="Karachi West">Karachi West</option>
                    <option value="Korangi">Korangi</option>
                    <option value="Malir">Malir</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E3EAE7] flex justify-end gap-2">
                <Button size="sm" variant="secondary" type="button" onClick={() => setShowAddStaffModal(false)}>
                  Cancel
                </Button>
                <Button size="sm" type="submit" className="font-bold">
                  Provision Staff Member
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit Staff Member Details */}
      {editingStaff && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-[#E3EAE7] space-y-4">
            <div className="flex items-center justify-between border-b border-[#E3EAE7] pb-3">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-[#1E8E6E]" />
                <h3 className="text-base font-extrabold text-[#14231F]">Edit Staff Profile · {editingStaff.badgeNumber}</h3>
              </div>
              <button onClick={() => setEditingStaff(null)} className="text-[#6B7C77] hover:text-[#14231F]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditStaffSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#14231F] block mb-1">Staff Name</label>
                  <input
                    type="text"
                    required
                    value={editingStaff.name}
                    onChange={(e) => setEditingStaff({ ...editingStaff, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[#E3EAE7] text-xs text-[#14231F]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#14231F] block mb-1">Official Badge</label>
                  <input
                    type="text"
                    required
                    value={editingStaff.badgeNumber}
                    onChange={(e) => setEditingStaff({ ...editingStaff, badgeNumber: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[#E3EAE7] text-xs text-[#14231F]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#14231F] block mb-1">Department</label>
                  <select
                    value={editingStaff.department}
                    onChange={(e) => setEditingStaff({ ...editingStaff, department: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[#E3EAE7] text-xs text-[#14231F] bg-white"
                  >
                    <option value="KMC Solid Waste Management">KMC Solid Waste Management</option>
                    <option value="KW&SB Water & Sanitation">KW&SB Water & Sanitation</option>
                    <option value="Sindh Electrical Inspection / Streetlights">Sindh Electrical Lighting</option>
                    <option value="Sindh Environmental Protection Agency (SEPA)">Sindh EPA</option>
                    <option value="Works & Services Department">Works & Services Department</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-[#14231F] block mb-1">Designation</label>
                  <input
                    type="text"
                    required
                    value={editingStaff.designation}
                    onChange={(e) => setEditingStaff({ ...editingStaff, designation: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[#E3EAE7] text-xs text-[#14231F]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#14231F] block mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={editingStaff.email}
                    onChange={(e) => setEditingStaff({ ...editingStaff, email: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[#E3EAE7] text-xs text-[#14231F]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#14231F] block mb-1">Phone</label>
                  <input
                    type="text"
                    required
                    value={editingStaff.phone}
                    onChange={(e) => setEditingStaff({ ...editingStaff, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[#E3EAE7] text-xs text-[#14231F]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#E3EAE7] flex justify-end gap-2">
                <Button size="sm" variant="secondary" type="button" onClick={() => setEditingStaff(null)}>
                  Cancel
                </Button>
                <Button size="sm" type="submit" className="font-bold">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Reassign Staff Department */}
      {reassigningStaff && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-[#E3EAE7] space-y-4">
            <div className="flex items-center gap-2 text-[#1E8E6E]">
              <ArrowRightLeft className="w-5 h-5" />
              <h3 className="text-base font-extrabold text-[#14231F]">Reassign Department · {reassigningStaff.name}</h3>
            </div>
            <p className="text-xs text-[#6B7C77]">
              Transfer this field officer to a new municipal department or dispatch district. This action will be logged in the audit trail.
            </p>

            <form onSubmit={handleDepartmentTransferSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#14231F] block mb-1">Target Department</label>
                <select
                  value={transferDept}
                  onChange={(e) => setTransferDept(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E3EAE7] text-xs text-[#14231F] bg-white"
                >
                  <option value="KMC Solid Waste Management">KMC Solid Waste Management</option>
                  <option value="KW&SB Water & Sanitation">KW&SB Water & Sanitation</option>
                  <option value="Sindh Electrical Inspection / Streetlights">Sindh Electrical Lighting</option>
                  <option value="Sindh Environmental Protection Agency (SEPA)">Sindh EPA</option>
                  <option value="Works & Services Department">Works & Services Department</option>
                  <option value="Traffic Engineering Bureau">Traffic Engineering Bureau</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[#14231F] block mb-1">Target District</label>
                <select
                  value={transferDistrict}
                  onChange={(e) => setTransferDistrict(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E3EAE7] text-xs text-[#14231F] bg-white"
                >
                  <option value="Karachi Central">Karachi Central</option>
                  <option value="Karachi East">Karachi East</option>
                  <option value="Karachi South">Karachi South</option>
                  <option value="Karachi West">Karachi West</option>
                  <option value="Korangi">Korangi</option>
                  <option value="Malir">Malir</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-[#E3EAE7]">
                <Button size="sm" variant="secondary" type="button" onClick={() => setReassigningStaff(null)}>
                  Cancel
                </Button>
                <Button size="sm" type="submit" className="font-bold">
                  Confirm Transfer
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit Citizen Profile */}
      {editingResident && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-[#E3EAE7] space-y-4">
            <div className="flex items-center justify-between border-b border-[#E3EAE7] pb-3">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-[#1E8E6E]" />
                <h3 className="text-base font-extrabold text-[#14231F]">Edit Citizen Record</h3>
              </div>
              <button onClick={() => setEditingResident(null)} className="text-[#6B7C77] hover:text-[#14231F]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditResidentSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#14231F] block mb-1">Citizen Name</label>
                  <input
                    type="text"
                    required
                    value={editingResident.name}
                    onChange={(e) => setEditingResident({ ...editingResident, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[#E3EAE7] text-xs text-[#14231F]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#14231F] block mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={editingResident.phone}
                    onChange={(e) => setEditingResident({ ...editingResident, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[#E3EAE7] text-xs text-[#14231F]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#14231F] block mb-1">Pakistani CNIC</label>
                  <input
                    type="text"
                    required
                    value={editingResident.cnic}
                    onChange={(e) => setEditingResident({ ...editingResident, cnic: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[#E3EAE7] text-xs text-[#14231F]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#14231F] block mb-1">District</label>
                  <input
                    type="text"
                    required
                    value={editingResident.district}
                    onChange={(e) => setEditingResident({ ...editingResident, district: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[#E3EAE7] text-xs text-[#14231F]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#14231F] block mb-1">Address</label>
                <input
                  type="text"
                  value={editingResident.address || ''}
                  onChange={(e) => setEditingResident({ ...editingResident, address: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-[#E3EAE7] text-xs text-[#14231F]"
                />
              </div>

              <div className="pt-3 border-t border-[#E3EAE7] flex justify-end gap-2">
                <Button size="sm" variant="secondary" type="button" onClick={() => setEditingResident(null)}>
                  Cancel
                </Button>
                <Button size="sm" type="submit" className="font-bold">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Reject Staff Confirmation */}
      {rejectingStaffId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-[#E3EAE7] space-y-4">
            <div className="flex items-center gap-2 text-red-600">
              <BadgeAlert className="w-5 h-5" />
              <h3 className="text-base font-extrabold">Reject Staff Application</h3>
            </div>
            <p className="text-xs text-[#6B7C77]">
              Please state the reason for rejecting this staff member's registration. This will be recorded in the audit log.
            </p>
            <div>
              <label className="font-bold text-xs text-[#14231F] block mb-1">Reason for Rejection</label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Employee ID not found in department roster..."
                className="w-full p-2.5 rounded-xl border border-[#E3EAE7] text-xs text-[#14231F]"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="secondary" onClick={() => setRejectingStaffId(null)}>
                Cancel
              </Button>
              <Button size="sm" variant="destructive" onClick={handleConfirmReject} className="font-bold">
                Confirm Rejection
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Provision New Admin Officer */}
      {showAddAdminModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-[#E3EAE7] space-y-4">
            <div className="flex items-center justify-between border-b border-[#E3EAE7] pb-3">
              <div className="flex items-center gap-2 text-[#14231F]">
                <ShieldCheck className="w-5 h-5 text-[#1E8E6E]" />
                <h3 className="text-base font-extrabold">Provision Municipal Admin Officer</h3>
              </div>
              <button onClick={() => setShowAddAdminModal(false)} className="text-[#6B7C77] hover:text-[#14231F]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAdminSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#14231F] block mb-1">Officer Name</label>
                  <input
                    type="text"
                    required
                    value={newAdminName}
                    onChange={(e) => setNewAdminName(e.target.value)}
                    placeholder="e.g. Engr. Sadia Parveen"
                    className="w-full p-2.5 rounded-xl border border-[#E3EAE7] text-xs text-[#14231F]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#14231F] block mb-1">Official Email</label>
                  <input
                    type="email"
                    required
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    placeholder="sadia.admin@kmc.gos.pk"
                    className="w-full p-2.5 rounded-xl border border-[#E3EAE7] text-xs text-[#14231F]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#14231F] block mb-1">Department</label>
                  <select
                    value={newAdminDept}
                    onChange={(e) => setNewAdminDept(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E3EAE7] text-xs text-[#14231F] bg-white"
                  >
                    <option value="Karachi Municipal Corporation (KMC)">KMC Municipal Command</option>
                    <option value="Karachi Water & Sewerage Board (KW&SB)">KW&SB Central Drainage</option>
                    <option value="Sindh Solid Waste Management Board">SSWMB Solid Waste</option>
                    <option value="Sindh Electrical Inspection / Streetlights">Sindh Electrical Lighting</option>
                    <option value="Provincial Municipal Secretariat & Central Command">Provincial Secretariat</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-[#14231F] block mb-1">Title / Designation</label>
                  <input
                    type="text"
                    required
                    value={newAdminTitle}
                    onChange={(e) => setNewAdminTitle(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E3EAE7] text-xs text-[#14231F]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#14231F] block mb-1">Secret Access Key</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={newAdminSecretKey}
                    onChange={(e) => setNewAdminSecretKey(e.target.value)}
                    className="flex-1 p-2.5 rounded-xl border border-[#E3EAE7] font-mono text-xs text-[#14231F] bg-[#F5F8F7]"
                  />
                  <button
                    type="button"
                    onClick={() => setNewAdminSecretKey(`SEC-ADM-${Math.floor(1000 + Math.random() * 9000)}`)}
                    className="px-3 py-2 rounded-xl border border-[#E3EAE7] text-xs font-semibold text-[#14231F] hover:bg-[#F5F8F7]"
                  >
                    Regenerate
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#F5F8F7] border border-[#E3EAE7] flex items-center gap-2.5">
                <input
                  type="checkbox"
                  id="superAdminCheck"
                  checked={newAdminIsSuper}
                  onChange={(e) => setNewAdminIsSuper(e.target.checked)}
                  className="rounded text-[#1E8E6E] focus:ring-[#1E8E6E] w-4 h-4"
                />
                <label htmlFor="superAdminCheck" className="text-xs text-[#14231F] cursor-pointer">
                  <span className="font-bold block">Grant Super Administrator Privileges</span>
                  <span className="text-[11px] text-[#6B7C77]">
                    Allows officer to manage other admins and delete records.
                  </span>
                </label>
              </div>

              <div className="pt-3 border-t border-[#E3EAE7] flex justify-end gap-2">
                <Button size="sm" variant="secondary" type="button" onClick={() => setShowAddAdminModal(false)}>
                  Cancel
                </Button>
                <Button size="sm" type="submit" className="font-bold bg-[#14231F] text-[#34D399] hover:bg-black">
                  Create Admin Officer
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Register Citizen Profile */}
      {showAddResidentModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-[#E3EAE7] space-y-4">
            <div className="flex items-center justify-between border-b border-[#E3EAE7] pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-extrabold text-[#14231F]">Register Citizen Profile</h3>
              </div>
              <button onClick={() => setShowAddResidentModal(false)} className="text-[#6B7C77] hover:text-[#14231F]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateResidentSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#14231F] block mb-1">Citizen Full Name</label>
                  <input
                    type="text"
                    required
                    value={newResName}
                    onChange={(e) => setNewResName(e.target.value)}
                    placeholder="e.g. Tariq Mansoor"
                    className="w-full p-2.5 rounded-xl border border-[#E3EAE7] text-xs text-[#14231F]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#14231F] block mb-1">Mobile Contact</label>
                  <input
                    type="text"
                    required
                    value={newResPhone}
                    onChange={(e) => setNewResPhone(e.target.value)}
                    placeholder="0300-XXXXXXX"
                    className="w-full p-2.5 rounded-xl border border-[#E3EAE7] text-xs text-[#14231F]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#14231F] block mb-1">Pakistani CNIC</label>
                  <input
                    type="text"
                    required
                    value={newResCnic}
                    onChange={(e) => setNewResCnic(e.target.value)}
                    placeholder="42101-XXXXXXX-X"
                    className="w-full p-2.5 rounded-xl border border-[#E3EAE7] text-xs text-[#14231F]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#14231F] block mb-1">District</label>
                  <select
                    value={newResDistrict}
                    onChange={(e) => setNewResDistrict(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E3EAE7] text-xs text-[#14231F] bg-white"
                  >
                    <option value="Karachi Central">Karachi Central</option>
                    <option value="Karachi East">Karachi East</option>
                    <option value="Karachi South">Karachi South</option>
                    <option value="Karachi West">Karachi West</option>
                    <option value="Korangi">Korangi</option>
                    <option value="Malir">Malir</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-[#14231F] block mb-1">Residential Address</label>
                <input
                  type="text"
                  value={newResAddress}
                  onChange={(e) => setNewResAddress(e.target.value)}
                  placeholder="Street / Block details"
                  className="w-full p-2.5 rounded-xl border border-[#E3EAE7] text-xs text-[#14231F]"
                />
              </div>

              <div className="pt-3 border-t border-[#E3EAE7] flex justify-end gap-2">
                <Button size="sm" variant="secondary" type="button" onClick={() => setShowAddResidentModal(false)}>
                  Cancel
                </Button>
                <Button size="sm" type="submit" className="font-bold">
                  Save Citizen Profile
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

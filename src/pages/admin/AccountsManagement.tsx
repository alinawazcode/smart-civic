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
  BadgeAlert
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import {
  AccountStore,
  StaffAccount,
  ResidentAccount,
  AccountStatus
} from '../../lib/accountStore';

export const AccountsManagement: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'pending' | 'staff' | 'residents'>('pending');
  const [staffList, setStaffList] = useState<StaffAccount[]>([]);
  const [residentList, setResidentList] = useState<ResidentAccount[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modals
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [showAddResidentModal, setShowAddResidentModal] = useState(false);
  const [rejectingStaffId, setRejectingStaffId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

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

  const loadData = () => {
    setStaffList(AccountStore.getStaffAccounts());
    setResidentList(AccountStore.getResidentAccounts());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('accounts_updated', handleUpdate);
    return () => window.removeEventListener('accounts_updated', handleUpdate);
  }, []);

  const showToast = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const pendingStaff = staffList.filter((s) => s.status === 'pending_approval');
  const activeStaffCount = staffList.filter((s) => s.status === 'active').length;
  const activeResidentsCount = residentList.filter((r) => r.status === 'active').length;

  // Approve Staff
  const handleApproveStaff = (staff: StaffAccount) => {
    const success = AccountStore.approveStaff(staff.id, 'Director Tariq Jameel');
    if (success) {
      loadData();
      showToast('success', `Approved ${staff.name} (${staff.badgeNumber}). Account is now active for Staff Dispatch.`);
    }
  };

  // Reject Staff
  const handleConfirmReject = () => {
    if (!rejectingStaffId) return;
    const success = AccountStore.rejectStaff(rejectingStaffId, rejectReason);
    if (success) {
      loadData();
      showToast('error', 'Staff registration request rejected.');
    }
    setRejectingStaffId(null);
    setRejectReason('');
  };

  // Toggle Staff Status
  const handleToggleStaffStatus = (staff: StaffAccount) => {
    const newStatus: AccountStatus = staff.status === 'active' ? 'suspended' : 'active';
    AccountStore.setStaffStatus(staff.id, newStatus);
    loadData();
    showToast('success', `Staff ${staff.name} status updated to ${newStatus}.`);
  };

  // Toggle Resident Status
  const handleToggleResidentStatus = (res: ResidentAccount) => {
    const newStatus = res.status === 'active' ? 'suspended' : 'active';
    AccountStore.setResidentStatus(res.id, newStatus);
    loadData();
    showToast('success', `Citizen ${res.name} status updated to ${newStatus}.`);
  };

  // Delete
  const handleDeleteStaff = (id: string, name: string) => {
    if (confirm(`Remove staff account for ${name}?`)) {
      AccountStore.deleteStaff(id);
      loadData();
      showToast('success', `Removed staff account ${name}.`);
    }
  };

  const handleDeleteResident = (id: string, name: string) => {
    if (confirm(`Remove citizen account for ${name}?`)) {
      AccountStore.deleteResident(id);
      loadData();
      showToast('success', `Removed citizen account ${name}.`);
    }
  };

  // Create Staff
  const handleCreateStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName.trim() || !newStaffBadge.trim()) return;

    AccountStore.adminCreateStaff({
      name: newStaffName,
      email: newStaffEmail || `${newStaffBadge.toLowerCase()}@kmc.gov.pk`,
      phone: newStaffPhone,
      cnic: newStaffCnic,
      department: newStaffDept,
      designation: newStaffDesignation,
      badgeNumber: newStaffBadge,
      district: newStaffDistrict
    });

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

  // Filtered staff
  const filteredStaff = staffList.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.badgeNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = deptFilter === 'all' || s.department.toLowerCase().includes(deptFilter.toLowerCase());
    return matchesSearch && matchesDept;
  });

  // Filtered residents
  const filteredResidents = residentList.filter((r) => {
    return (
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.phone.includes(searchQuery) ||
      r.cnic.includes(searchQuery) ||
      r.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Toast notification */}
      {notification && (
        <div
          className={`p-3.5 rounded-xl text-xs font-bold flex items-center justify-between shadow-md transition-all ${
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
                pendingStaff.length > 0 ? 'bg-amber-100 text-amber-700 animate-pulse' : 'bg-[#F5F8F7] text-[#6B7C77]'
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

        {/* Municipal Authority Role */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#14231F] to-[#1E3B33] text-white shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#A3B8B0]">Municipal Authority</span>
            <ShieldCheck className="w-4 h-4 text-[#34D399]" />
          </div>
          <div className="mt-2">
            <span className="text-sm font-black text-white block">Karachi Command Center</span>
            <span className="text-[11px] text-[#A3B8B0] block">Director Tariq Jameel</span>
          </div>
          <p className="text-[10px] text-[#34D399] font-medium mt-1">● RBAC & Access Control Active</p>
        </div>
      </div>

      {/* Main Subtabs Header */}
      <div className="bg-white rounded-2xl border border-[#E3EAE7] shadow-civic-card p-4 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E3EAE7] pb-4">
          {/* Subtabs Switcher */}
          <div className="flex items-center gap-1.5 p-1 bg-[#F5F8F7] rounded-xl border border-[#E3EAE7]">
            <button
              onClick={() => setActiveSubTab('pending')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
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
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
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
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                activeSubTab === 'residents'
                  ? 'bg-white text-blue-700 shadow-xs border border-[#E3EAE7]'
                  : 'text-[#6B7C77] hover:text-[#14231F]'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-blue-600" />
              <span>Citizen Accounts ({residentList.length})</span>
            </button>
          </div>

          {/* Action Button for Current Tab */}
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

            {/* Staff Table */}
            <div className="overflow-x-auto border border-[#E3EAE7] rounded-xl">
              <table className="w-full text-xs text-start">
                <thead className="bg-[#F5F8F7] border-b border-[#E3EAE7] font-semibold text-[#6B7C77]">
                  <tr>
                    <th className="p-3 text-start">Staff Member</th>
                    <th className="p-3 text-start">Badge / ID</th>
                    <th className="p-3 text-start">Department & Zone</th>
                    <th className="p-3 text-start">CNIC & Phone</th>
                    <th className="p-3 text-start">Status</th>
                    <th className="p-3 text-end">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3EAE7]">
                  {filteredStaff.map((s) => (
                    <tr key={s.id} className="hover:bg-[#F5F8F7]/50">
                      <td className="p-3">
                        <strong className="text-[#14231F] block">{s.name}</strong>
                        <span className="text-[11px] text-[#6B7C77] font-mono">{s.email}</span>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-md bg-[#F5F8F7] border border-[#E3EAE7] font-mono font-bold text-[#14231F]">
                          {s.badgeNumber}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="text-[#14231F] font-semibold block">{s.department}</span>
                        <span className="text-[11px] text-[#6B7C77]">{s.district} · {s.designation}</span>
                      </td>
                      <td className="p-3 font-mono text-[11px] text-[#6B7C77]">
                        <div>{s.phone}</div>
                        <div>{s.cnic}</div>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                            s.status === 'active'
                              ? 'bg-[#E3F5EC] text-[#1E8E6E] border border-[#C8EBD9]'
                              : s.status === 'pending_approval'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-red-100 text-red-700 border border-red-200'
                          }`}
                        >
                          {s.status === 'active'
                            ? 'ACTIVE'
                            : s.status === 'pending_approval'
                            ? 'PENDING'
                            : s.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3 text-end">
                        <div className="flex items-center justify-end gap-1.5">
                          {s.status === 'pending_approval' && (
                            <button
                              onClick={() => handleApproveStaff(s)}
                              title="Approve staff"
                              className="px-2.5 py-1 rounded-lg bg-[#1E8E6E] text-white font-bold text-[11px]"
                            >
                              Approve
                            </button>
                          )}
                          <button
                            onClick={() => handleToggleStaffStatus(s)}
                            title={s.status === 'active' ? 'Suspend access' : 'Activate'}
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
                            title="Delete staff"
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

        {/* 3. RESIDENT CITIZEN ACCOUNTS VIEW */}
        {activeSubTab === 'residents' && (
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#6B7C77] absolute start-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search citizens by name, phone, CNIC or district..."
                className="w-full ps-9 pe-3 py-2 rounded-xl border border-[#E3EAE7] text-xs text-[#14231F]"
              />
            </div>

            {/* Resident Table */}
            <div className="overflow-x-auto border border-[#E3EAE7] rounded-xl">
              <table className="w-full text-xs text-start">
                <thead className="bg-[#F5F8F7] border-b border-[#E3EAE7] font-semibold text-[#6B7C77]">
                  <tr>
                    <th className="p-3 text-start">Citizen Name</th>
                    <th className="p-3 text-start">Contact & CNIC</th>
                    <th className="p-3 text-start">District & Address</th>
                    <th className="p-3 text-start">Complaints Filed</th>
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
                    <option value="KMC Solid Waste Management">KMC Solid Waste</option>
                    <option value="KW&SB Water & Sanitation">KW&SB Water & Sanitation</option>
                    <option value="Sindh Electrical Inspection / Streetlights">Sindh Electrical / Streetlights</option>
                    <option value="Sindh EPA">Sindh EPA Environmental Compliance</option>
                    <option value="Traffic Engineering Bureau">Traffic Engineering Bureau</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-[#14231F] block mb-1">Designation</label>
                  <input
                    type="text"
                    value={newStaffDesignation}
                    onChange={(e) => setNewStaffDesignation(e.target.value)}
                    placeholder="e.g. Senior Inspector"
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
                    placeholder="0300-1234567"
                    className="w-full p-2.5 rounded-xl border border-[#E3EAE7] text-xs text-[#14231F]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#14231F] block mb-1">Pakistani CNIC</label>
                  <input
                    type="text"
                    required
                    value={newStaffCnic}
                    onChange={(e) => setNewStaffCnic(e.target.value)}
                    placeholder="42101-1234567-1"
                    className="w-full p-2.5 rounded-xl border border-[#E3EAE7] text-xs text-[#14231F]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#14231F] block mb-1">Assigned District / Zone</label>
                  <input
                    type="text"
                    value={newStaffDistrict}
                    onChange={(e) => setNewStaffDistrict(e.target.value)}
                    placeholder="e.g. Karachi East"
                    className="w-full p-2.5 rounded-xl border border-[#E3EAE7] text-xs text-[#14231F]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#14231F] block mb-1">Official Email (Optional)</label>
                  <input
                    type="email"
                    value={newStaffEmail}
                    onChange={(e) => setNewStaffEmail(e.target.value)}
                    placeholder="official@gov.pk"
                    className="w-full p-2.5 rounded-xl border border-[#E3EAE7] text-xs text-[#14231F]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#E3EAE7] flex justify-end gap-2">
                <Button size="sm" variant="secondary" type="button" onClick={() => setShowAddStaffModal(false)}>
                  Cancel
                </Button>
                <Button size="sm" type="submit" className="font-bold">
                  Activate & Provision
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Register Citizen Account */}
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
              <div>
                <label className="font-bold text-[#14231F] block mb-1">Full Citizen Name</label>
                <input
                  type="text"
                  required
                  value={newResName}
                  onChange={(e) => setNewResName(e.target.value)}
                  placeholder="e.g. Zafar Abbas"
                  className="w-full p-2.5 rounded-xl border border-[#E3EAE7] text-xs text-[#14231F]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#14231F] block mb-1">Mobile Phone</label>
                  <input
                    type="text"
                    required
                    value={newResPhone}
                    onChange={(e) => setNewResPhone(e.target.value)}
                    placeholder="0321-9876543"
                    className="w-full p-2.5 rounded-xl border border-[#E3EAE7] text-xs text-[#14231F]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#14231F] block mb-1">Pakistani CNIC</label>
                  <input
                    type="text"
                    required
                    value={newResCnic}
                    onChange={(e) => setNewResCnic(e.target.value)}
                    placeholder="42201-9876543-2"
                    className="w-full p-2.5 rounded-xl border border-[#E3EAE7] text-xs text-[#14231F]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#14231F] block mb-1">District</label>
                  <input
                    type="text"
                    value={newResDistrict}
                    onChange={(e) => setNewResDistrict(e.target.value)}
                    placeholder="e.g. Karachi Central"
                    className="w-full p-2.5 rounded-xl border border-[#E3EAE7] text-xs text-[#14231F]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#14231F] block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={newResEmail}
                    onChange={(e) => setNewResEmail(e.target.value)}
                    placeholder="citizen@domain.com"
                    className="w-full p-2.5 rounded-xl border border-[#E3EAE7] text-xs text-[#14231F]"
                  />
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
    </div>
  );
};

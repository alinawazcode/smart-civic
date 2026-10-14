import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  UserCheck,
  PlusCircle,
  Search,
  Clock,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  FileCheck2,
  Download,
  RotateCcw,
  Sparkles,
  Phone,
  Building,
  Info
} from 'lucide-react';
import { useRole } from '../../context/RoleContext';
import { Button } from '../../components/common/Button';
import { PriorityBadge, StatusBadge } from '../../components/common/Badge';
import { Img } from '../../components/common/Img';
import { api } from '../../lib/api';
import { Ticket, Status } from '../../types';

export const ResidentDashboard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    role,
    isLoggedIn,
    userName,
    userEmail,
    userPhone,
    userCnic,
    userDistrict,
    userAddress,
    setCurrentUser
  } = useRole();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'resolved'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [reopenSuccessId, setReopenSuccessId] = useState<number | null>(null);

  useEffect(() => {
    setIsLoading(true);
    api.listTickets().then((all) => {
      // Simulate complaints filed by this resident or district
      setTickets(all);
      setIsLoading(false);
    });
  }, []);

  const handleDemoResidentLogin = () => {
    setCurrentUser({
      role: 'resident',
      isLoggedIn: true,
      name: 'Ayesha Siddiqui',
      email: 'ayesha.resident@civiccare.org',
      phone: '0300-2918273',
      cnic: '42101-8392183-2',
      district: 'Karachi East (Gulshan-e-Iqbal)',
      address: 'Block 13-D, University Road'
    });
  };

  const handleReopen = async (ticketId: number) => {
    try {
      const updated = await api.reopenTicket(ticketId, 'Resident requested re-inspection');
      setTickets((prev) => prev.map((t) => (t.id === ticketId ? updated : t)));
      setReopenSuccessId(ticketId);
      setTimeout(() => setReopenSuccessId(null), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  // Filter complaints
  const residentTickets = tickets.filter((t) => {
    if (filterStatus === 'active' && t.status === 'resolved') return false;
    if (filterStatus === 'resolved' && t.status !== 'resolved') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.code.toLowerCase().includes(q) ||
        t.text.toLowerCase().includes(q) ||
        t.area.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalComplaints = tickets.length;
  const activeCount = tickets.filter((t) => t.status !== 'resolved').length;
  const resolvedCount = tickets.filter((t) => t.status === 'resolved').length;

  return (
    <div className="min-h-screen bg-[#F5F8F7] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1200px] mx-auto space-y-6">
        {/* Unauthenticated Guest Notification Banner */}
        {!isLoggedIn && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-start sm:items-center gap-3">
              <Info className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5 sm:mt-0" />
              <div>
                <p className="text-sm font-bold">Authorized Citizen Access</p>
                <p className="text-xs text-emerald-800">Sign in with your verified Citizen credentials or authenticate with your registered citizen profile.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="primary" onClick={handleDemoResidentLogin}>
                Sign In as Verified Citizen
              </Button>
              <Link to="/login">
                <Button size="sm" variant="secondary">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Citizen Profile Header Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E3EAE7] shadow-[0_4px_24px_rgba(0,0,0,0.04)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#1E8E6E]/10 via-[#2F7DD1]/5 to-transparent rounded-full blur-3xl -z-0 pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#E6F4EF] text-[#1E8E6E] border border-[#B2E4D4] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  NADRA CNIC Verified Citizen
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#F5F8F7] text-[#6B7C77] border border-[#E3EAE7]">
                  Islamic Republic of Pakistan
                </span>
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#14231F] tracking-tight">
                  {userName || 'Ayesha Siddiqui'}
                </h1>
                <p className="text-xs sm:text-sm text-[#6B7C77] mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#1E8E6E]" />
                    {userDistrict || 'Karachi East (Gulshan-e-Iqbal)'}
                  </span>
                  <span className="flex items-center gap-1.5 font-mono text-[11px]">
                    <Phone className="w-3.5 h-3.5 text-[#1E8E6E]" />
                    {userPhone || '0300-2918273'}
                  </span>
                  <span className="flex items-center gap-1.5 font-mono text-[11px]">
                    CNIC: {userCnic || '42101-8392183-2'}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link to="/report">
                <Button size="md" variant="primary" leftIcon={<PlusCircle className="w-4 h-4" />}>
                  Report New Grievance
                </Button>
              </Link>
              <Link to="/track">
                <Button size="md" variant="secondary" leftIcon={<Search className="w-4 h-4" />}>
                  Track Reference Code
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* 4 Distinct Non-Repetitive KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-[#E3EAE7] shadow-civic-sm space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-[#6B7C77]">
              <span>My Grievances</span>
              <Layers className="w-4 h-4 text-[#1E8E6E]" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#14231F] font-mono">
              {totalComplaints}
            </div>
            <p className="text-[11px] text-[#6B7C77]">Total submitted records</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#E3EAE7] shadow-civic-sm space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-[#6B7C77]">
              <span>In Field Dispatch</span>
              <Clock className="w-4 h-4 text-[#2F7DD1]" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#2F7DD1] font-mono">
              {activeCount}
            </div>
            <p className="text-[11px] text-[#6B7C77]">Under municipal remediation</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#E3EAE7] shadow-civic-sm space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-[#6B7C77]">
              <span>Verified Resolved</span>
              <CheckCircle2 className="w-4 h-4 text-[#2E9E6B]" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#2E9E6B] font-mono">
              {resolvedCount}
            </div>
            <p className="text-[11px] text-[#6B7C77]">With photo verification proof</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#E3EAE7] shadow-civic-sm space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-[#6B7C77]">
              <span>District SLA Rate</span>
              <ShieldCheck className="w-4 h-4 text-[#1E8E6E]" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#1E8E6E] font-mono">
              94.2%
            </div>
            <p className="text-[11px] text-[#6B7C77]">Avg 28h resolution time</p>
          </div>
        </div>

        {/* District Municipal Notice Widget (Single concise banner) */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-[#14231F] to-[#1E3B33] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-civic-sm">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
              <Building className="w-5 h-5 text-[#34D399]" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#34D399] uppercase tracking-wider">
                Karachi East Municipal Work Alert
              </p>
              <p className="text-xs text-white/90 font-medium">
                Sewer desilting & main road pothole surfacing active along University Road & Gulshan Block 13-D.
              </p>
            </div>
          </div>
          <span className="text-[11px] text-white/60 shrink-0 font-mono">Oct 2026 Schedule</span>
        </div>

        {/* Complaints Filter & Interactive Feed */}
        <div className="bg-white rounded-3xl p-6 border border-[#E3EAE7] shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-[#14231F]">
                My Submitted Civic Complaints
              </h2>
              <p className="text-xs text-[#6B7C77]">
                Live status tracking, field notes, and official resolution verification
              </p>
            </div>

            {/* Filter Tabs & Search */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex p-1 rounded-xl bg-[#F5F8F7] border border-[#E3EAE7]">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    filterStatus === 'all'
                      ? 'bg-white text-[#1E8E6E] shadow-2xs'
                      : 'text-[#6B7C77] hover:text-[#14231F]'
                  }`}
                >
                  All ({totalComplaints})
                </button>
                <button
                  onClick={() => setFilterStatus('active')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    filterStatus === 'active'
                      ? 'bg-white text-[#2F7DD1] shadow-2xs'
                      : 'text-[#6B7C77] hover:text-[#14231F]'
                  }`}
                >
                  In Progress ({activeCount})
                </button>
                <button
                  onClick={() => setFilterStatus('resolved')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    filterStatus === 'resolved'
                      ? 'bg-white text-[#2E9E6B] shadow-2xs'
                      : 'text-[#6B7C77] hover:text-[#14231F]'
                  }`}
                >
                  Resolved ({resolvedCount})
                </button>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search code or area..."
                  className="w-44 sm:w-52 ps-8 pe-3 py-1.5 text-xs rounded-xl border border-[#E3EAE7] bg-[#F5F8F7] focus:outline-none focus:ring-2 focus:ring-[#1E8E6E] focus:bg-white"
                />
                <Search className="w-3.5 h-3.5 text-[#6B7C77] absolute start-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>

          {/* Reopen Success Notice */}
          {reopenSuccessId && (
            <div className="p-3 rounded-xl bg-[#E6F4EF] border border-[#B2E4D4] text-[#166F57] text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Grievance successfully reopened. Re-inspection request dispatched to field supervisor.</span>
            </div>
          )}

          {/* Cards List */}
          {isLoading ? (
            <div className="py-12 text-center text-xs text-[#6B7C77]">
              Loading your grievance timeline...
            </div>
          ) : residentTickets.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <p className="text-sm font-semibold text-[#14231F]">No grievances found matching your criteria</p>
              <p className="text-xs text-[#6B7C77]">Need municipal assistance? File an issue anytime.</p>
              <Link to="/report">
                <Button size="sm" variant="primary">
                  Report a Problem
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {residentTickets.map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl border border-[#E3EAE7] bg-white hover:border-[#1E8E6E]/60 transition-all shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-black text-[#14231F]">
                        {item.code}
                      </span>
                      <StatusBadge status={item.status} />
                      <PriorityBadge priority={item.priorityLabel} />
                    </div>

                    <div className="flex items-center gap-2 text-xs text-[#6B7C77]">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(item.createdAt).toLocaleDateString('en-PK', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    <div className="md:col-span-8 space-y-2">
                      <p className="text-sm font-semibold text-[#14231F] leading-relaxed">
                        {item.text}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#6B7C77]">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#1E8E6E]" />
                          {item.area}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-[#2F7DD1]" />
                          Assigned to: <strong className="text-[#14231F]">{item.assignedTo || 'Municipal Dispatch Crew'}</strong>
                        </span>
                        {item.reportCount && item.reportCount > 1 && (
                          <span className="px-2 py-0.5 rounded-full bg-[#E6F4EF] text-[#1E8E6E] font-bold text-[10px]">
                            Merged Cluster ({item.reportCount} residents)
                          </span>
                        )}
                      </div>
                    </div>

                    {item.beforePhoto && (
                      <div className="md:col-span-4 flex items-center justify-start md:justify-end gap-2">
                        <div className="w-24 h-16 rounded-xl overflow-hidden border border-[#E3EAE7] shrink-0">
                          <Img src={item.beforePhoto} alt={item.text} aspectRatio="aspect-video" className="w-full h-full object-cover" />
                        </div>
                        {item.afterPhoto && (
                          <div className="w-24 h-16 rounded-xl overflow-hidden border border-[#2E9E6B] shrink-0 relative">
                            <Img src={item.afterPhoto} alt="Resolution photo" aspectRatio="aspect-video" className="w-full h-full object-cover" />
                            <span className="absolute bottom-1 right-1 px-1 py-0.2 bg-[#2E9E6B] text-white text-[8px] font-bold rounded">
                              FIXED
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions & Tracking Shortcut */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#E3EAE7]">
                    <div className="flex items-center gap-2">
                      <Link to={`/track/${item.code}`}>
                        <Button size="sm" variant="primary" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                          Live Tracking & Map
                        </Button>
                      </Link>
                      <Link to={`/track/${item.code}`}>
                        <Button size="sm" variant="secondary" leftIcon={<Download className="w-3.5 h-3.5" />}>
                          Verification Pass
                        </Button>
                      </Link>
                    </div>

                    {item.status === 'resolved' && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#2E9E6B] font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Verified Fixed
                        </span>
                        <button
                          onClick={() => handleReopen(item.id)}
                          className="px-2.5 py-1 text-xs font-semibold text-[#D64545] hover:bg-[#FBE6E6] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Reopen Grievance</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

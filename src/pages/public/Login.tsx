import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  ShieldCheck,
  Building2,
  MapPin,
  Phone,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  BadgeCheck,
  Briefcase,
  IdCard,
  Sparkles,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { AppLogo } from '../../components/common/AppLogo';
import { useRole } from '../../context/RoleContext';
import { AccountStore } from '../../lib/accountStore';
import pakistanHeroImg from '../../assets/images/pakistan_karachi_hero_1791924661309.jpg';
import pakistanNightImg from '../../assets/images/pakistan_civic_night_1791924661846.jpg';

export const Login: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setRole, setCurrentUser } = useRole();

  // Portal mode: 'resident' or 'staff'
  const [activePortal, setActivePortal] = useState<'resident' | 'staff'>('resident');
  
  // Account modes: 'signin' or 'signup'
  const [residentMode, setResidentMode] = useState<'signin' | 'signup'>('signin');
  const [staffMode, setStaffMode] = useState<'signin' | 'signup'>('signin');

  // Common fields
  const [showPassword, setShowPassword] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | 'pending';
    msg: string;
    details?: string;
  } | null>(null);

  // Resident Form State
  const [resName, setResName] = useState('Ayesha Siddiqui');
  const [resContact, setResContact] = useState('0300-2918273');
  const [resCnic, setResCnic] = useState('42101-8392183-2');
  const [resDistrict, setResDistrict] = useState('Gulshan-e-Iqbal');
  const [resPassword, setResPassword] = useState('pakistan123');

  // Staff Form State
  const [staffName, setStaffName] = useState('Rashid Minhas');
  const [staffEmpId, setStaffEmpId] = useState('KWSB-8821');
  const [staffDept, setStaffDept] = useState('KW&SB Water & Sanitation');
  const [staffZone, setStaffZone] = useState('Karachi Central');
  const [staffEmail, setStaffEmail] = useState('rashid.field@kwsb.gov.pk');
  const [staffPhone, setStaffPhone] = useState('0301-8291044');
  const [staffCnic, setStaffCnic] = useState('42101-7291024-3');
  const [staffPassword, setStaffPassword] = useState('staffPass2026');

  // Admin Officer Access (Discreet Command link)
  const [showAdminConsole, setShowAdminConsole] = useState(false);
  const [adminId, setAdminId] = useState('admin.tariq@karachicity.gov.pk');
  const [adminKey, setAdminKey] = useState('admin-secure-2026');

  // Handle Resident Login / Registration
  const handleResidentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (residentMode === 'signup') {
      const citizen = AccountStore.registerResident({
        name: resName || 'Resident Citizen',
        email: resContact.includes('@') ? resContact : `${resContact.replace(/\D/g, '')}@citizen.pk`,
        phone: resContact,
        cnic: resCnic || '42101-0000000-1',
        district: resDistrict
      });

      setCurrentUser({
        role: 'resident',
        name: citizen.name,
        email: citizen.email
      });
      setRole('resident');
      setFeedback({
        type: 'success',
        msg: `Citizen profile verified for ${citizen.name}! Redirecting to Civic Portal...`
      });
      setTimeout(() => navigate('/'), 700);
    } else {
      const verify = AccountStore.verifyResidentLogin(resContact);
      if (!verify.canLogin) {
        setFeedback({
          type: 'error',
          msg: verify.message || 'Citizen account cannot be accessed.'
        });
        return;
      }
      const acc = verify.account!;
      setCurrentUser({
        role: 'resident',
        name: acc.name,
        email: acc.email
      });
      setRole('resident');
      setFeedback({
        type: 'success',
        msg: `Welcome back, ${acc.name}! Citizen account authenticated.`
      });
      setTimeout(() => navigate('/'), 700);
    }
  };

  // Handle Staff Login / Self-Registration (Staff can register, but MUST be approved by Admin!)
  const handleStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (staffMode === 'signup') {
      const newStaff = AccountStore.registerStaffSelf({
        name: staffName,
        email: staffEmail,
        phone: staffPhone,
        cnic: staffCnic,
        department: staffDept,
        badgeNumber: staffEmpId,
        district: staffZone,
        designation: 'Field Officer'
      });

      setFeedback({
        type: 'pending',
        msg: `Staff Registration Submitted! Application for ${newStaff.name} (Badge: ${newStaff.badgeNumber}) has been queued.`,
        details: 'Per municipal regulations, an Administrator must review and approve your account before you can log in to Dispatch.'
      });
      setStaffMode('signin');
      return;
    } else {
      const verify = AccountStore.verifyStaffLogin(staffEmpId || staffEmail);
      if (!verify.canLogin) {
        if (verify.reason === 'pending_approval') {
          setFeedback({
            type: 'pending',
            msg: `Account Pending Admin Approval: Application for ${verify.account?.name} (Badge: ${verify.account?.badgeNumber}, ${verify.account?.department}) is currently awaiting review by the Municipal Administrator.`,
            details: 'An Administrator must approve your staff account from the Command Center Settings before you can access Dispatch.'
          });
        } else if (verify.reason === 'rejected') {
          setFeedback({
            type: 'error',
            msg: `Staff Application Rejected: ${verify.account?.rejectionReason || 'Credentials could not be verified by Municipal Authority.'}`
          });
        } else if (verify.reason === 'suspended') {
          setFeedback({
            type: 'error',
            msg: 'This municipal staff account has been suspended by Command. Access denied.'
          });
        } else {
          setFeedback({
            type: 'error',
            msg: `No staff record found for "${staffEmpId}". If you are newly appointed, switch to "Register Staff Account" to submit your application.`
          });
        }
        return;
      }

      const acc = verify.account!;
      setCurrentUser({
        role: 'staff',
        name: acc.name,
        email: acc.email,
        badge: acc.badgeNumber,
        department: acc.department
      });
      setRole('staff');
      setFeedback({
        type: 'success',
        msg: `Verified: Officer ${acc.name} (${acc.department}). Loading Dispatch Queue...`
      });
      setTimeout(() => navigate('/staff'), 750);
    }
  };

  // Handle Hidden Admin Login
  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminKey || adminKey.length < 4) {
      setFeedback({
        type: 'error',
        msg: 'Invalid municipal administrator passcode.'
      });
      return;
    }

    setCurrentUser({
      role: 'admin',
      name: 'Director Tariq Jameel',
      email: adminId,
      department: 'Karachi Municipal Corporation'
    });
    setRole('admin');
    setFeedback({
      type: 'success',
      msg: 'Municipal Command Center verified. Redirecting to Executive Overview...'
    });
    setTimeout(() => navigate('/admin'), 700);
  };

  return (
    <div className="relative min-h-[calc(100vh-64px)] flex items-center justify-center p-4 py-12 overflow-hidden">
      {/* Real Pakistan Karachi City Street Background with Interactive Glassmorphism */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div
          className="w-full h-full bg-cover bg-center filter brightness-[0.55] contrast-[1.15] scale-105 transition-all duration-1000 ease-out"
          style={{ backgroundImage: `url(${showAdminConsole ? pakistanNightImg : pakistanHeroImg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#14231F]/90 via-[#14231F]/70 to-[#14231F]/80 backdrop-blur-[7px]" />
      </div>

      {/* Main Glassmorphic 3D Card with Hover Color Light Bloom */}
      <div
        className="group relative z-10 w-full max-w-lg bg-white/94 backdrop-blur-xl rounded-3xl p-6 sm:p-9 shadow-[0_24px_60px_rgba(0,0,0,0.45)] border border-white/80 transition-all duration-500 hover:shadow-[0_30px_70px_rgba(30,142,110,0.3)] space-y-6"
        style={{ perspective: '1200px' }}
      >
        {/* Subtle hover gradient color shift rim */}
        <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-[#1E8E6E] via-[#2F7DD1] to-[#E8731A] opacity-0 group-hover:opacity-30 blur-sm transition-opacity duration-500 -z-10" />

        {/* 3D App Logo & Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <AppLogo size="lg" showText={false} />
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#14231F] tracking-tight">
              Smart Civic Complaint Triage System
            </h1>
            <p className="text-xs text-[#6B7C77] mt-0.5 font-medium">
              Islamic Republic of Pakistan · Municipal Grievance & Dispatch
            </p>
          </div>
        </div>

        {/* Feedback message banner */}
        {feedback && (
          <div
            className={`p-4 rounded-2xl text-xs font-semibold flex items-start gap-2.5 transition-all animate-in fade-in ${
              feedback.type === 'success'
                ? 'bg-[#E3F5EC] border border-[#C8EBD9] text-[#2E9E6B]'
                : feedback.type === 'pending'
                ? 'bg-amber-50 border-2 border-amber-300 text-amber-900 shadow-sm'
                : 'bg-[#FBE6E6] border border-[#F6C6C6] text-[#D64545]'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#2E9E6B] mt-0.5" />
            ) : feedback.type === 'pending' ? (
              <Clock className="w-4 h-4 shrink-0 text-amber-600 mt-0.5 animate-pulse" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-[#D64545] mt-0.5" />
            )}
            <div className="flex-1 space-y-1">
              <div className="font-bold">{feedback.msg}</div>
              {feedback.details && (
                <div className="text-[11px] opacity-90 font-normal leading-relaxed">{feedback.details}</div>
              )}
            </div>
          </div>
        )}

        {/* Mode Selector: Resident vs Municipal Staff */}
        {!showAdminConsole ? (
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-[#F5F8F7] border border-[#E3EAE7] text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setActivePortal('resident');
                setFeedback(null);
              }}
              className={`py-2.5 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                activePortal === 'resident'
                  ? 'bg-white text-[#1E8E6E] shadow-sm font-extrabold border border-[#E3EAE7]'
                  : 'text-[#6B7C77] hover:text-[#14231F]'
              }`}
            >
              <User className="w-4 h-4 text-[#1E8E6E]" />
              <span>Resident / Citizen</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActivePortal('staff');
                setFeedback(null);
              }}
              className={`py-2.5 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                activePortal === 'staff'
                  ? 'bg-white text-[#1E8E6E] shadow-sm font-extrabold border border-[#E3EAE7]'
                  : 'text-[#6B7C77] hover:text-[#14231F]'
              }`}
            >
              <Building2 className="w-4 h-4 text-[#1E8E6E]" />
              <span>Municipal Staff</span>
            </button>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-[#14231F] text-white flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold">
              <KeyRound className="w-4 h-4 text-[#34D399]" />
              <span>Municipal Command & Admin Login</span>
            </div>
            <button
              type="button"
              onClick={() => setShowAdminConsole(false)}
              className="text-[11px] text-[#A3B8B0] hover:text-white underline cursor-pointer"
            >
              Back to Sign In
            </button>
          </div>
        )}

        {/* 1. RESIDENT PORTAL (Sign In OR Create Account) */}
        {activePortal === 'resident' && !showAdminConsole && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#E3EAE7] pb-2.5 text-xs">
              <span className="font-bold text-[#14231F]">
                {residentMode === 'signin' ? 'Resident Sign In' : 'Register Citizen Account'}
              </span>
              <button
                type="button"
                onClick={() => {
                  setResidentMode(residentMode === 'signin' ? 'signup' : 'signin');
                  setFeedback(null);
                }}
                className="text-[#1E8E6E] hover:underline font-bold cursor-pointer"
              >
                {residentMode === 'signin' ? '+ New Resident Registration' : '← Already Registered?'}
              </button>
            </div>

            <form onSubmit={handleResidentSubmit} className="space-y-3.5">
              {residentMode === 'signup' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-[#14231F] mb-1">
                      Full Citizen Name
                    </label>
                    <input
                      type="text"
                      required
                      value={resName}
                      onChange={(e) => setResName(e.target.value)}
                      placeholder="e.g. Fatima Zahra"
                      className="w-full min-h-[42px] px-3.5 py-2 rounded-xl border border-[#E3EAE7] bg-white text-xs text-[#14231F] focus:outline-none focus:ring-2 focus:ring-[#1E8E6E]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#14231F] mb-1">
                        Pakistani CNIC
                      </label>
                      <input
                        type="text"
                        required
                        value={resCnic}
                        onChange={(e) => setResCnic(e.target.value)}
                        placeholder="42101-XXXXXXX-X"
                        className="w-full min-h-[42px] px-3.5 py-2 rounded-xl border border-[#E3EAE7] bg-white text-xs text-[#14231F] focus:outline-none focus:ring-2 focus:ring-[#1E8E6E]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#14231F] mb-1">
                        City Ward / Neighborhood
                      </label>
                      <select
                        value={resDistrict}
                        onChange={(e) => setResDistrict(e.target.value)}
                        className="w-full min-h-[42px] px-3 py-2 rounded-xl border border-[#E3EAE7] bg-white text-xs text-[#14231F] focus:outline-none focus:ring-2 focus:ring-[#1E8E6E]"
                      >
                        <option value="Gulshan-e-Iqbal">Gulshan-e-Iqbal (District East)</option>
                        <option value="PECHS">PECHS / Tariq Road (District East)</option>
                        <option value="DHA">DHA Karachi (District South)</option>
                        <option value="Clifton">Clifton (District South)</option>
                        <option value="Saddar">Saddar / Empress Market (District South)</option>
                        <option value="North Nazimabad">North Nazimabad (District Central)</option>
                        <option value="Korangi">Korangi Industrial Area (District Korangi)</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#14231F] mb-1">
                  Mobile Number / Email / CNIC
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={resContact}
                    onChange={(e) => setResContact(e.target.value)}
                    placeholder="0300-2918273 or email"
                    className="w-full min-h-[42px] ps-9 pe-3 py-2 rounded-xl border border-[#E3EAE7] bg-white text-xs text-[#14231F] focus:outline-none focus:ring-2 focus:ring-[#1E8E6E]"
                  />
                  <Phone className="w-3.5 h-3.5 text-[#6B7C77] absolute start-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#14231F] mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={resPassword}
                    onChange={(e) => setResPassword(e.target.value)}
                    className="w-full min-h-[42px] ps-9 pe-9 py-2 rounded-xl border border-[#E3EAE7] bg-white text-xs text-[#14231F] focus:outline-none focus:ring-2 focus:ring-[#1E8E6E]"
                  />
                  <Lock className="w-3.5 h-3.5 text-[#6B7C77] absolute start-3 top-1/2 -translate-y-1/2" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute end-3 top-1/2 -translate-y-1/2 text-[#6B7C77] hover:text-[#14231F]"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                size="md"
                className="w-full shadow-md hover:shadow-[0_4px_16px_rgba(30,142,110,0.35)] transition-all font-bold"
              >
                {residentMode === 'signup' ? 'Create Citizen Account' : 'Sign In as Resident'}
              </Button>
            </form>
          </div>
        )}

        {/* 2. MUNICIPAL STAFF PORTAL (Staff can register, approval needed by Admin) */}
        {activePortal === 'staff' && !showAdminConsole && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#E3EAE7] pb-2.5 text-xs">
              <span className="font-bold text-[#14231F]">
                {staffMode === 'signin' ? 'Municipal Staff Authentication' : 'Register Staff Account'}
              </span>
              <button
                type="button"
                onClick={() => {
                  setStaffMode(staffMode === 'signin' ? 'signup' : 'signin');
                  setFeedback(null);
                }}
                className="text-[#1E8E6E] hover:underline font-bold cursor-pointer"
              >
                {staffMode === 'signin' ? '+ Register Staff Account' : '← Already Have Credentials?'}
              </button>
            </div>

            {staffMode === 'signup' && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] leading-relaxed flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Municipal Policy Notice:</strong> All newly registered staff profiles must be reviewed and approved by a Municipal Administrator before access to Field Dispatch is granted.
                </span>
              </div>
            )}

            <form onSubmit={handleStaffSubmit} className="space-y-3.5">
              {staffMode === 'signup' ? (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-[#14231F] mb-1">
                      Full Staff Name
                    </label>
                    <input
                      type="text"
                      required
                      value={staffName}
                      onChange={(e) => setStaffName(e.target.value)}
                      placeholder="e.g. Rashid Minhas"
                      className="w-full min-h-[42px] px-3.5 py-2 rounded-xl border border-[#E3EAE7] bg-white text-xs text-[#14231F] focus:outline-none focus:ring-2 focus:ring-[#1E8E6E]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#14231F] mb-1">
                        Department
                      </label>
                      <select
                        value={staffDept}
                        onChange={(e) => setStaffDept(e.target.value)}
                        className="w-full min-h-[42px] px-3 py-2 rounded-xl border border-[#E3EAE7] bg-white text-xs text-[#14231F] focus:outline-none focus:ring-2 focus:ring-[#1E8E6E]"
                      >
                        <option value="KMC Solid Waste Management">KMC Solid Waste</option>
                        <option value="KW&SB Water & Sanitation">KW&SB Water & Sanitation</option>
                        <option value="Sindh Electrical Inspection / Streetlights">Electrical & Streetlights</option>
                        <option value="Sindh EPA">Sindh EPA Environmental</option>
                        <option value="Traffic Engineering Bureau">Traffic Engineering</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#14231F] mb-1">
                        Official Badge / Employee ID
                      </label>
                      <input
                        type="text"
                        required
                        value={staffEmpId}
                        onChange={(e) => setStaffEmpId(e.target.value)}
                        placeholder="e.g. KMC-9941"
                        className="w-full min-h-[42px] px-3.5 py-2 rounded-xl border border-[#E3EAE7] bg-white text-xs text-[#14231F] focus:outline-none focus:ring-2 focus:ring-[#1E8E6E]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#14231F] mb-1">
                        Pakistani CNIC
                      </label>
                      <input
                        type="text"
                        required
                        value={staffCnic}
                        onChange={(e) => setStaffCnic(e.target.value)}
                        placeholder="42101-XXXXXXX-X"
                        className="w-full min-h-[42px] px-3.5 py-2 rounded-xl border border-[#E3EAE7] bg-white text-xs text-[#14231F] focus:outline-none focus:ring-2 focus:ring-[#1E8E6E]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#14231F] mb-1">
                        Contact Mobile
                      </label>
                      <input
                        type="text"
                        required
                        value={staffPhone}
                        onChange={(e) => setStaffPhone(e.target.value)}
                        placeholder="0300-1234567"
                        className="w-full min-h-[42px] px-3.5 py-2 rounded-xl border border-[#E3EAE7] bg-white text-xs text-[#14231F] focus:outline-none focus:ring-2 focus:ring-[#1E8E6E]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#14231F] mb-1">
                        Assigned Municipal Zone
                      </label>
                      <input
                        type="text"
                        required
                        value={staffZone}
                        onChange={(e) => setStaffZone(e.target.value)}
                        placeholder="e.g. Karachi East"
                        className="w-full min-h-[42px] px-3.5 py-2 rounded-xl border border-[#E3EAE7] bg-white text-xs text-[#14231F] focus:outline-none focus:ring-2 focus:ring-[#1E8E6E]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#14231F] mb-1">
                        Official Email
                      </label>
                      <input
                        type="email"
                        required
                        value={staffEmail}
                        onChange={(e) => setStaffEmail(e.target.value)}
                        placeholder="officer@kwsb.gov.pk"
                        className="w-full min-h-[42px] px-3.5 py-2 rounded-xl border border-[#E3EAE7] bg-white text-xs text-[#14231F] focus:outline-none focus:ring-2 focus:ring-[#1E8E6E]"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-[#14231F] mb-1">
                    Staff Badge ID / Official Email
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={staffEmpId}
                      onChange={(e) => setStaffEmpId(e.target.value)}
                      placeholder="e.g. KWSB-8821 or rashid.field@kwsb.gov.pk"
                      className="w-full min-h-[42px] ps-9 pe-3 py-2 rounded-xl border border-[#E3EAE7] bg-white text-xs text-[#14231F] focus:outline-none focus:ring-2 focus:ring-[#1E8E6E]"
                    />
                    <Building2 className="w-3.5 h-3.5 text-[#6B7C77] absolute start-3 top-1/2 -translate-y-1/2" />
                  </div>
                  <span className="text-[10px] text-[#6B7C77] mt-1 block">
                    Active personnel: Enter badge number or verified municipal email.
                  </span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#14231F] mb-1">
                  Passcode
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={staffPassword}
                    onChange={(e) => setStaffPassword(e.target.value)}
                    className="w-full min-h-[42px] ps-9 pe-9 py-2 rounded-xl border border-[#E3EAE7] bg-white text-xs text-[#14231F] focus:outline-none focus:ring-2 focus:ring-[#1E8E6E]"
                  />
                  <Lock className="w-3.5 h-3.5 text-[#6B7C77] absolute start-3 top-1/2 -translate-y-1/2" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute end-3 top-1/2 -translate-y-1/2 text-[#6B7C77] hover:text-[#14231F]"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                size="md"
                className="w-full shadow-md hover:shadow-[0_4px_16px_rgba(30,142,110,0.35)] transition-all font-bold"
              >
                {staffMode === 'signup' ? 'Submit Staff Registration (Requires Admin Approval)' : 'Sign In as Municipal Staff'}
              </Button>
            </form>
          </div>
        )}

        {/* 3. HIDDEN MUNICIPAL ADMIN / COMMAND CENTER ACCESS */}
        {showAdminConsole && (
          <form onSubmit={handleAdminSubmit} className="space-y-3.5">
            <div className="p-3 rounded-xl bg-[#F5F8F7] border border-[#E3EAE7] text-xs text-[#6B7C77]">
              Administrative command access is reserved for City Directors, Zonal Commissioners, and Triage Supervisors.
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#14231F] mb-1">
                Director / Administrator ID
              </label>
              <input
                type="text"
                required
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                className="w-full min-h-[42px] px-3.5 py-2 rounded-xl border border-[#E3EAE7] bg-white text-xs text-[#14231F] focus:outline-none focus:ring-2 focus:ring-[#1E8E6E]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#14231F] mb-1">
                Admin Master Passcode
              </label>
              <input
                type="password"
                required
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                className="w-full min-h-[42px] px-3.5 py-2 rounded-xl border border-[#E3EAE7] bg-white text-xs text-[#14231F] focus:outline-none focus:ring-2 focus:ring-[#1E8E6E]"
              />
            </div>

            <Button type="submit" size="md" className="w-full shadow-md font-bold">
              Access Municipal Command Center
            </Button>
          </form>
        )}

        {/* Discreet bottom link for authorized administrators */}
        <div className="pt-4 border-t border-[#E3EAE7] flex items-center justify-between text-xs text-[#6B7C77]">
          <span>City Infrastructure Portal</span>
          <button
            type="button"
            onClick={() => {
              setShowAdminConsole(!showAdminConsole);
              setFeedback(null);
            }}
            className="text-[11px] text-[#6B7C77] hover:text-[#1E8E6E] hover:underline cursor-pointer font-medium"
          >
            {showAdminConsole ? '← Regular Sign In' : 'Officer Access'}
          </button>
        </div>
      </div>
    </div>
  );
};

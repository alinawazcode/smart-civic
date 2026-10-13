import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Menu,
  X,
  Globe,
  ChevronDown,
  User,
  Building2,
  LogOut,
  FileText,
  PlusCircle,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { useRole } from '../../context/RoleContext';
import { AppLogo } from '../common/AppLogo';

export const Navbar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { role, setRole, userName } = useRole();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isRtl = i18n.language === 'ur';

  // Public navigation links
  const navLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/report', label: t('nav.report') },
    { to: '/track', label: t('nav.track') },
    { to: '/transparency', label: t('nav.transparency') },
    { to: '/model-report', label: t('nav.modelReport') }
  ];

  const handleLanguageChange = (lng: string) => {
    i18n.changeLanguage(lng);
    setLangDropdownOpen(false);
  };

  const handleLogout = () => {
    setRole('resident');
    setUserDropdownOpen(false);
    navigate('/login');
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-[#E3EAE7]/90 shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all duration-200">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* 3D App Logo & Brand */}
        <Link to="/" className="flex items-center hover:opacity-95 transition-opacity">
          <AppLogo size="md" subtitle="Complaint Triage System" />
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all font-control ${
                isActive(link.to)
                  ? 'text-[#1E8E6E] bg-[#E6F4EF] font-bold shadow-xs'
                  : 'text-[#14231F] hover:text-[#1E8E6E] hover:bg-[#F5F8F7]'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Action Controls: Clean Language + Auth (Admin strictly hidden) */}
        <div className="hidden lg:flex items-center gap-3">
          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => {
                setLangDropdownOpen(!langDropdownOpen);
                setUserDropdownOpen(false);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E3EAE7] bg-white text-xs font-semibold text-[#14231F] hover:bg-[#F5F8F7] hover:border-[#1E8E6E]/40 transition-all cursor-pointer shadow-xs"
              aria-label="Switch language"
            >
              <Globe className="w-3.5 h-3.5 text-[#1E8E6E]" />
              <span>{i18n.language === 'ur' ? 'اردو' : 'English'}</span>
              <ChevronDown className="w-3 h-3 text-[#6B7C77]" />
            </button>

            {langDropdownOpen && (
              <div
                className={`absolute top-full mt-1.5 ${isRtl ? 'left-0' : 'right-0'} w-36 bg-white/95 backdrop-blur-md rounded-xl border border-[#E3EAE7] shadow-[0_10px_30px_rgba(0,0,0,0.12)] py-1.5 z-50`}
              >
                <button
                  onClick={() => handleLanguageChange('en')}
                  className={`w-full text-start px-3.5 py-2 text-xs font-medium hover:bg-[#F5F8F7] flex items-center justify-between ${
                    i18n.language === 'en' ? 'text-[#1E8E6E] font-bold bg-[#E6F4EF]' : 'text-[#14231F]'
                  }`}
                >
                  <span>English</span>
                  {i18n.language === 'en' && <span className="w-1.5 h-1.5 rounded-full bg-[#1E8E6E]" />}
                </button>
                <button
                  onClick={() => handleLanguageChange('ur')}
                  className={`w-full text-start px-3.5 py-2 text-xs font-medium hover:bg-[#F5F8F7] flex items-center justify-between font-control ${
                    i18n.language === 'ur' ? 'text-[#1E8E6E] font-bold bg-[#E6F4EF]' : 'text-[#14231F]'
                  }`}
                >
                  <span>اردو (Urdu)</span>
                  {i18n.language === 'ur' && <span className="w-1.5 h-1.5 rounded-full bg-[#1E8E6E]" />}
                </button>
              </div>
            )}
          </div>

          {/* User Status / Login Button (Admin hidden, only Resident or Staff appear) */}
          {role === 'staff' ? (
            <div className="relative">
              <div className="flex items-center gap-2">
                <Link
                  to="/staff"
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#1E8E6E] hover:bg-[#166F57] text-white transition-all shadow-[0_4px_14px_rgba(30,142,110,0.28)] flex items-center gap-1.5"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{t('nav.staffPortal') || 'Staff Portal'}</span>
                </Link>

                <button
                  onClick={() => {
                    setUserDropdownOpen(!userDropdownOpen);
                    setLangDropdownOpen(false);
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E3EAE7] bg-white text-xs font-semibold text-[#14231F] hover:bg-[#F5F8F7] transition-all cursor-pointer"
                >
                  <span className="w-2 h-2 rounded-full bg-[#2E9E6B] animate-pulse" />
                  <span className="max-w-[100px] truncate">{userName}</span>
                  <ChevronDown className="w-3 h-3 text-[#6B7C77]" />
                </button>
              </div>

              {userDropdownOpen && (
                <div
                  className={`absolute top-full mt-1.5 ${isRtl ? 'left-0' : 'right-0'} w-48 bg-white/95 backdrop-blur-md rounded-2xl border border-[#E3EAE7] shadow-[0_12px_32px_rgba(0,0,0,0.15)] py-2 z-50`}
                >
                  <div className="px-3.5 py-1.5 border-b border-[#E3EAE7] mb-1">
                    <p className="text-[11px] font-bold text-[#14231F] truncate">{userName}</p>
                    <p className="text-[10px] text-[#1E8E6E] font-semibold">Municipal Field Crew</p>
                  </div>
                  <Link
                    to="/staff"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-3.5 py-2 text-xs text-[#14231F] hover:bg-[#F5F8F7] font-medium"
                  >
                    <Building2 className="w-3.5 h-3.5 text-[#1E8E6E]" />
                    <span>My Dispatch Queue</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-[#D64545] hover:bg-[#FBE6E6] font-medium cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : role === 'admin' ? (
            <div className="flex items-center gap-2">
              <Link
                to="/admin"
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#14231F] text-[#34D399] border border-[#34D399]/40 hover:bg-black transition-all flex items-center gap-1.5 shadow-sm"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#34D399]" />
                <span>Command Center</span>
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl border border-[#E3EAE7] bg-white text-[#6B7C77] hover:text-[#DC2626] hover:bg-red-50 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/report"
                className="hidden xl:flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-[#1E8E6E] bg-[#E6F4EF] hover:bg-[#d8efe7] border border-[#C8EBD9] transition-all"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>{t('nav.report')}</span>
              </Link>
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl text-xs font-bold border border-[#E3EAE7] bg-white text-[#14231F] hover:bg-[#1E8E6E] hover:text-white hover:border-[#1E8E6E] transition-all shadow-xs flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5 text-[#1E8E6E] group-hover:text-white" />
                <span>{t('nav.login') || 'Sign In / Register'}</span>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={() => handleLanguageChange(i18n.language === 'en' ? 'ur' : 'en')}
            className="px-2.5 py-1.5 rounded-xl border border-[#E3EAE7] text-xs font-bold text-[#1E8E6E] bg-white"
            aria-label="Toggle language"
          >
            {i18n.language === 'en' ? 'اردو' : 'EN'}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 rounded-xl text-[#14231F] hover:bg-[#F5F8F7] border border-[#E3EAE7]"
            aria-label="Open navigation drawer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Clean, No admin or role pickers) */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-16 bottom-0 bg-white/95 backdrop-blur-xl z-50 border-t border-[#E3EAE7] overflow-y-auto p-5 flex flex-col justify-between shadow-2xl">
          <div className="space-y-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#6B7C77]">
              Navigation
            </div>
            <div className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-xl text-base font-medium transition-colors flex items-center justify-between ${
                    isActive(link.to)
                      ? 'bg-[#E6F4EF] text-[#1E8E6E] font-bold'
                      : 'text-[#14231F] hover:bg-[#F5F8F7]'
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive(link.to) && <span className="w-2 h-2 rounded-full bg-[#1E8E6E]" />}
                </Link>
              ))}
            </div>

            {role === 'staff' && (
              <div className="pt-3 border-t border-[#E3EAE7]">
                <Link
                  to="/staff"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full py-3 px-4 rounded-xl text-center font-bold bg-[#1E8E6E] text-white shadow-sm"
                >
                  {t('nav.staffPortal') || 'Staff Portal'} →
                </Link>
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-[#E3EAE7] space-y-3">
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full py-3 rounded-xl text-center font-bold border border-[#E3EAE7] text-[#14231F] hover:bg-[#F5F8F7] bg-white shadow-xs"
            >
              {role === 'staff' ? 'Switch Account / Sign In' : 'Sign In / Register'}
            </Link>
            <p className="text-[11px] text-center text-[#6B7C77]">
              Smart Civic Complaint Triage System · Islamic Republic of Pakistan
            </p>
          </div>
        </div>
      )}
    </header>
  );
};

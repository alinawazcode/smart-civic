import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Menu,
  X,
  ChevronDown,
  User,
  Building2,
  LogOut,
  PlusCircle,
  ShieldCheck,
  UserCheck,
  Search,
  LayoutDashboard
} from 'lucide-react';
import { useRole } from '../../context/RoleContext';
import { AppLogo } from '../common/AppLogo';
import { PakistanFlag, USFlag } from '../common/FlagIcons';

export const Navbar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { role, isLoggedIn, userName, userDistrict, isSuperAdmin, logout } = useRole();
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
    logout();
    setUserDropdownOpen(false);
    navigate('/login');
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E3EAE7] shadow-[0_2px_12px_rgba(0,0,0,0.03)] transition-all">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand App Logo */}
        <Link to="/" className="flex items-center hover:opacity-95 transition-opacity">
          <AppLogo size="md" subtitle="Civic Triage & Dispatch" />
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                isActive(link.to)
                  ? 'text-[#1E8E6E] bg-[#E6F4EF] font-bold shadow-2xs'
                  : 'text-[#14231F] hover:text-[#1E8E6E] hover:bg-[#F5F8F7]'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Action Controls */}
        <div className="hidden lg:flex items-center gap-3">
          {/* Language Switcher with Official Pakistan and US Flags */}
          <div className="relative">
            <button
              onClick={() => {
                setLangDropdownOpen(!langDropdownOpen);
                setUserDropdownOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[#E3EAE7] bg-white text-xs font-semibold text-[#14231F] hover:bg-[#F5F8F7] hover:border-[#1E8E6E]/60 transition-all cursor-pointer shadow-2xs"
              aria-label="Switch language"
            >
              {i18n.language === 'ur' ? (
                <PakistanFlag className="w-5 h-3.5" />
              ) : (
                <USFlag className="w-5 h-3.5" />
              )}
              <span className="font-bold">{i18n.language === 'ur' ? 'اردو' : 'English'}</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#6B7C77]" />
            </button>

            {langDropdownOpen && (
              <div
                className={`absolute top-full mt-1.5 ${isRtl ? 'left-0' : 'right-0'} w-44 bg-white rounded-2xl border border-[#E3EAE7] shadow-[0_12px_32px_rgba(0,0,0,0.12)] p-1.5 z-50`}
              >
                <button
                  onClick={() => handleLanguageChange('en')}
                  className={`w-full text-start px-3 py-2 rounded-xl text-xs font-medium hover:bg-[#F5F8F7] flex items-center justify-between transition-colors ${
                    i18n.language === 'en' ? 'text-[#1E8E6E] font-bold bg-[#E6F4EF]' : 'text-[#14231F]'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <USFlag className="w-4 h-3" />
                    <span>English (US)</span>
                  </span>
                  {i18n.language === 'en' && <span className="w-1.5 h-1.5 rounded-full bg-[#1E8E6E]" />}
                </button>

                <button
                  onClick={() => handleLanguageChange('ur')}
                  className={`w-full text-start px-3 py-2 rounded-xl text-xs font-medium hover:bg-[#F5F8F7] flex items-center justify-between transition-colors ${
                    i18n.language === 'ur' ? 'text-[#1E8E6E] font-bold bg-[#E6F4EF]' : 'text-[#14231F]'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <PakistanFlag className="w-4 h-3" />
                    <span>اردو (پاکستان)</span>
                  </span>
                  {i18n.language === 'ur' && <span className="w-1.5 h-1.5 rounded-full bg-[#1E8E6E]" />}
                </button>
              </div>
            )}
          </div>

          {/* Authenticated State vs Login Button */}
          {isLoggedIn ? (
            <div className="relative">
              <button
                onClick={() => {
                  setUserDropdownOpen(!userDropdownOpen);
                  setLangDropdownOpen(false);
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[#E3EAE7] bg-white hover:bg-[#F5F8F7] hover:border-[#1E8E6E]/60 transition-all cursor-pointer shadow-2xs"
              >
                <div className="w-6 h-6 rounded-lg bg-[#E6F4EF] text-[#1E8E6E] flex items-center justify-center font-bold text-xs">
                  {role === 'admin' ? (
                    <ShieldCheck className="w-3.5 h-3.5 text-[#1E8E6E]" />
                  ) : role === 'staff' ? (
                    <Building2 className="w-3.5 h-3.5 text-[#1E8E6E]" />
                  ) : (
                    <User className="w-3.5 h-3.5 text-[#1E8E6E]" />
                  )}
                </div>
                <div className="text-start">
                  <span className="text-xs font-bold text-[#14231F] block max-w-[120px] truncate leading-tight">
                    {userName}
                  </span>
                  <span className="text-[10px] text-[#1E8E6E] uppercase font-extrabold tracking-wider block">
                    {role === 'admin'
                      ? isSuperAdmin
                        ? 'Super Admin'
                        : 'District Admin'
                      : role === 'staff'
                      ? 'Field Staff'
                      : 'Resident'}
                  </span>
                </div>
                <ChevronDown className="w-3 h-3 text-[#6B7C77] ms-0.5" />
              </button>

              {userDropdownOpen && (
                <div
                  className={`absolute top-full mt-1.5 ${isRtl ? 'left-0' : 'right-0'} w-56 bg-white rounded-2xl border border-[#E3EAE7] shadow-[0_14px_36px_rgba(0,0,0,0.14)] py-2 z-50`}
                >
                  <div className="px-3.5 py-2 border-b border-[#E3EAE7] mb-1">
                    <p className="text-xs font-bold text-[#14231F] truncate">{userName}</p>
                    <div className="mt-1">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-[9px] font-extrabold tracking-wide uppercase ${
                          role === 'admin' && isSuperAdmin
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : role === 'admin'
                            ? 'bg-blue-50 text-blue-800 border border-blue-200'
                            : 'bg-[#E6F4EF] text-[#1E8E6E] border border-[#C8EBD9]'
                        }`}
                      >
                        {role === 'admin'
                          ? isSuperAdmin
                            ? 'Central Command (Super Admin)'
                            : `District Admin · ${userDistrict || 'Karachi Central'}`
                          : role === 'staff'
                          ? 'Field Officer'
                          : 'Verified Citizen'}
                      </span>
                    </div>
                    {userDistrict && role !== 'admin' && (
                      <p className="text-[10px] text-[#6B7C77] truncate mt-1">{userDistrict}</p>
                    )}
                  </div>

                  {role === 'resident' && (
                    <Link
                      to="/resident"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3.5 py-2 text-xs text-[#14231F] hover:bg-[#F5F8F7] font-medium"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-[#1E8E6E]" />
                      <span>Resident Dashboard</span>
                    </Link>
                  )}

                  {role === 'staff' && (
                    <Link
                      to="/staff"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3.5 py-2 text-xs text-[#14231F] hover:bg-[#F5F8F7] font-medium"
                    >
                      <Building2 className="w-3.5 h-3.5 text-[#1E8E6E]" />
                      <span>My Field Queue</span>
                    </Link>
                  )}

                  {role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3.5 py-2 text-xs text-[#14231F] hover:bg-[#F5F8F7] font-medium"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-[#1E8E6E]" />
                      <span>Command Center</span>
                    </Link>
                  )}

                  <div className="border-t border-[#E3EAE7] mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-[#D64545] hover:bg-red-50 font-medium cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 text-[#D64545]" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Guest / Unauthenticated: Solid Login Button with Permanent White Icon & Text */
            <div className="flex items-center gap-2">
              <Link
                to="/report"
                className="hidden xl:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-[#1E8E6E] bg-[#E6F4EF] hover:bg-[#D8EFE7] border border-[#C8EBD9] transition-all"
              >
                <PlusCircle className="w-3.5 h-3.5 text-[#1E8E6E]" />
                <span>{t('nav.report')}</span>
              </Link>
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#1E8E6E] hover:bg-[#166F57] text-white transition-all shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-white shrink-0" />
                <span className="text-white">{t('nav.login') || 'Sign In / Register'}</span>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Action Controls: Language Toggle with Flags + Hamburger */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={() => handleLanguageChange(i18n.language === 'en' ? 'ur' : 'en')}
            className="px-2.5 py-1.5 rounded-xl border border-[#E3EAE7] text-xs font-bold text-[#1E8E6E] bg-white flex items-center gap-1.5 shadow-2xs"
            aria-label="Toggle language"
          >
            {i18n.language === 'en' ? (
              <PakistanFlag className="w-4 h-3" />
            ) : (
              <USFlag className="w-4 h-3" />
            )}
            <span>{i18n.language === 'en' ? 'اردو' : 'EN'}</span>
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-[#14231F] hover:bg-[#F5F8F7] border border-[#E3EAE7]"
            aria-label="Open navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5 text-[#14231F]" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-16 bottom-0 bg-white z-50 border-t border-[#E3EAE7] overflow-y-auto p-5 flex flex-col justify-between shadow-2xl">
          <div className="space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#6B7C77]">
              Navigation
            </div>
            <div className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-between ${
                    isActive(link.to)
                      ? 'bg-[#E6F4EF] text-[#1E8E6E] font-bold'
                      : 'text-[#14231F] hover:bg-[#F5F8F7]'
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive(link.to) && <span className="w-1.5 h-1.5 rounded-full bg-[#1E8E6E]" />}
                </Link>
              ))}

              {isLoggedIn && role === 'resident' && (
                <Link
                  to="/resident"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-between ${
                    isActive('/resident')
                      ? 'bg-[#E6F4EF] text-[#1E8E6E] font-bold'
                      : 'text-[#14231F] hover:bg-[#F5F8F7]'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-[#1E8E6E]" />
                    <span>Resident Dashboard</span>
                  </span>
                  {isActive('/resident') && <span className="w-1.5 h-1.5 rounded-full bg-[#1E8E6E]" />}
                </Link>
              )}
            </div>

            {role === 'staff' && isLoggedIn && (
              <div className="pt-2">
                <Link
                  to="/staff"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full py-2.5 px-4 rounded-xl text-center font-bold bg-[#1E8E6E] text-white shadow-xs text-xs"
                >
                  Open Field Dispatch Queue →
                </Link>
              </div>
            )}

            {role === 'admin' && isLoggedIn && (
              <div className="pt-2">
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full py-2.5 px-4 rounded-xl text-center font-bold bg-[#14231F] text-[#34D399] border border-[#34D399]/40 shadow-xs text-xs"
                >
                  Open Municipal Command Center →
                </Link>
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-[#E3EAE7] space-y-3">
            {isLoggedIn ? (
              <div className="p-3 rounded-2xl bg-[#F5F8F7] border border-[#E3EAE7] flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[#14231F]">{userName}</p>
                  <p className="text-[10px] text-[#1E8E6E] uppercase font-bold tracking-wider">{role} session</p>
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-[#D64545] bg-[#FBE6E6] hover:bg-red-200 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full py-2.5 rounded-xl text-center font-bold bg-[#1E8E6E] text-white shadow-xs text-xs"
              >
                <span className="inline-flex items-center justify-center gap-1.5">
                  <User className="w-4 h-4 text-white" />
                  <span>Sign In / Register</span>
                </span>
              </Link>
            )}
            <p className="text-[10px] text-center text-[#6B7C77]">
              Smart Civic Complaint Triage System · Islamic Republic of Pakistan
            </p>
          </div>
        </div>
      )}
    </header>
  );
};

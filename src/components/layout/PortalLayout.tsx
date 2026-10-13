import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Shield,
  LayoutDashboard,
  CheckSquare,
  ListOrdered,
  Sparkles,
  Map,
  Sliders,
  BarChart3,
  Settings,
  Bell,
  Search,
  Globe,
  UserCheck,
  LogOut,
  Menu,
  X,
  FileCheck2,
  Brain,
  User,
  ChevronRight
} from 'lucide-react';
import { AppLogo } from '../common/AppLogo';
import { useRole } from '../../context/RoleContext';
import { Role } from '../../types';

interface PortalLayoutProps {
  portalType: 'staff' | 'admin';
}

export const PortalLayout: React.FC<PortalLayoutProps> = ({ portalType }) => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { role, setRole, userName, userEmail, userBadge, logout } = useRole();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  const isRtl = i18n.language === 'ur';

  const staffNavItems = [
    { to: '/staff', label: 'My Assigned Tasks', icon: <CheckSquare className="w-4 h-4" /> },
    { to: '/staff/notifications', label: 'Task Alerts', icon: <Bell className="w-4 h-4" /> },
    { to: '/staff/profile', label: 'Crew Profile', icon: <User className="w-4 h-4" /> }
  ];

  const adminNavItems = [
    { to: '/admin', label: 'City Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { to: '/admin/queue', label: 'Ranked Queue', icon: <ListOrdered className="w-4 h-4" /> },
    { to: '/admin/review', label: 'AI Review Queue', icon: <Brain className="w-4 h-4" /> },
    { to: '/admin/closure', label: 'Closure Review', icon: <FileCheck2 className="w-4 h-4" /> },
    { to: '/admin/hotspots', label: '3D Hotspots', icon: <Map className="w-4 h-4" /> },
    { to: '/admin/what-if', label: 'What-if Sandbox', icon: <Sliders className="w-4 h-4" /> },
    { to: '/admin/analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { to: '/admin/settings', label: 'Settings & Accounts', icon: <Settings className="w-4 h-4" /> },
    { to: '/model-report', label: 'Model Evaluation', icon: <Sparkles className="w-4 h-4" /> }
  ];

  const navItems = portalType === 'staff' ? staffNavItems : adminNavItems;

  const handleLogout = () => {
    setRole('resident');
    navigate('/login');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!globalSearch.trim()) return;
    if (globalSearch.toUpperCase().startsWith('CC-')) {
      navigate(portalType === 'staff' ? `/staff/tickets/1` : `/admin/tickets/1`);
    } else {
      navigate(portalType === 'staff' ? `/staff?search=${encodeURIComponent(globalSearch)}` : `/admin/queue?search=${encodeURIComponent(globalSearch)}`);
    }
  };

  const isActive = (path: string) => {
    if (path === '/staff' || path === '/admin') return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-[#F5F8F7] flex flex-col lg:flex-row text-[#14231F]">
      {/* 1. Portal Left Sidebar (240px desktop, drawer on mobile; in RTL on right) */}
      <aside
        className={`fixed inset-y-0 z-50 w-60 bg-white border-${isRtl ? 's' : 'e'} border-[#E3EAE7] flex flex-col justify-between transition-transform duration-200 lg:static lg:translate-x-0 ${
          isRtl
            ? sidebarOpen ? 'translate-x-0 right-0' : 'translate-x-full right-0'
            : sidebarOpen ? 'translate-x-0 left-0' : '-translate-x-full left-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo & Portal Badge */}
          <div className="p-4 border-b border-[#E3EAE7] flex items-center justify-between">
            <Link to="/" className="flex items-center">
              <AppLogo
                size="sm"
                subtitle={portalType === 'staff' ? t('nav.staffPortal') : t('nav.adminPortal')}
              />
            </Link>

            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-[#6B7C77] hover:bg-[#F5F8F7]"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors font-control ${
                  isActive(item.to)
                    ? 'bg-[#E6F4EF] text-[#1E8E6E]'
                    : 'text-[#14231F] hover:bg-[#F5F8F7]'
                }`}
              >
                <span className={isActive(item.to) ? 'text-[#1E8E6E]' : 'text-[#6B7C77]'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* User Info & Logout at Bottom */}
          <div className="p-3 border-t border-[#E3EAE7] space-y-2">
            <div className="p-2.5 rounded-xl bg-[#F5F8F7] flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#1E8E6E] text-white flex items-center justify-center font-bold text-xs shrink-0">
                {userName.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0 text-start">
                <span className="text-xs font-bold text-[#14231F] truncate block">
                  {userName}
                </span>
                <span className="text-[10px] text-[#6B7C77] truncate block">
                  {userEmail}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-[#D64545] hover:bg-[#FBE6E6] transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{t('nav.logout')}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay backdrop on mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
        />
      )}

      {/* 2. Main Portal Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-[#E3EAE7] h-16 px-4 sm:px-6 flex items-center justify-between gap-4 shadow-civic-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg border border-[#E3EAE7] text-[#14231F]"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Global Search */}
            <form onSubmit={handleSearchSubmit} className="hidden sm:flex items-center relative w-64 md:w-80">
              <input
                type="text"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder="Search ticket code, area, or keyword..."
                className="w-full min-h-[38px] ps-9 pe-3 py-1.5 rounded-lg border border-[#E3EAE7] bg-[#F5F8F7] text-xs text-[#14231F] focus:outline-none focus:ring-2 focus:ring-[#1E8E6E] focus:bg-white"
              />
              <Search className="w-3.5 h-3.5 text-[#6B7C77] absolute start-3 top-1/2 -translate-y-1/2" />
            </form>
          </div>

          {/* Top Bar Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Switcher */}
            <button
              onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'ur' : 'en')}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#E3EAE7] text-xs font-semibold hover:bg-[#F5F8F7]"
            >
              <Globe className="w-3.5 h-3.5 text-[#1E8E6E]" />
              <span>{i18n.language === 'en' ? 'اردو' : 'EN'}</span>
            </button>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="p-2 rounded-lg border border-[#E3EAE7] text-[#14231F] hover:bg-[#F5F8F7] relative"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="w-2 h-2 rounded-full bg-[#E8731A] absolute top-1.5 end-1.5" />
              </button>

              {notifDropdownOpen && (
                <div
                  className={`absolute top-full mt-2 ${isRtl ? 'left-0' : 'right-0'} w-72 bg-white rounded-xl border border-[#E3EAE7] shadow-civic-lg p-3 z-50`}
                >
                  <div className="text-xs font-bold text-[#14231F] mb-2 flex items-center justify-between">
                    <span>Recent Notifications</span>
                    <span className="text-[10px] text-[#1E8E6E]">Mark all read</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-2 rounded-lg bg-[#E6F4EF] text-[#166F57]">
                      <strong>SLA Alert:</strong> Ticket CC-2026-001242 in DHA reaches 72h limit in 4 hours.
                    </div>
                    <div className="p-2 rounded-lg bg-[#F5F8F7] text-[#6B7C77]">
                      <strong>Cluster Merged:</strong> 2 citizen reports added to Gulshan streetlight cluster #101.
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Authenticated Official Identity & Sign Out */}
            <div className="flex items-center gap-2 ps-2 border-s border-[#E3EAE7]">
              <div className="hidden sm:flex flex-col text-end">
                <span className="text-xs font-bold text-[#14231F] leading-tight truncate max-w-[140px]">
                  {userName}
                </span>
                <span className="text-[10px] text-[#1E8E6E] font-medium leading-tight">
                  {role === 'admin' ? 'Municipal Command' : (userBadge ? `Badge ${userBadge}` : 'Field Dispatch')}
                </span>
              </div>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                role === 'admin' 
                  ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                  : 'bg-[#E6F4EF] text-[#166F57] border border-[#1E8E6E]/30'
              }`}>
                {role === 'admin' ? 'Admin' : 'Staff'}
              </span>
              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                title="Sign Out"
                className="p-1.5 rounded-lg text-[#6B7C77] hover:text-[#DC2626] hover:bg-red-50 transition-colors"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Child Views */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1400px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

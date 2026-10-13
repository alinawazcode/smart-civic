import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, Filter, Clock, MapPin, Layers, ArrowRight, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { PriorityBadge, StatusBadge } from '../../components/common/Badge';
import { api } from '../../lib/api';
import { Ticket } from '../../types';

export const StaffTasks: React.FC = () => {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState<Ticket[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'high' | 'dueSoon'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    api.listTickets().then((data) => {
      // Show assigned and in_progress tickets for staff
      const staffTasks = data.filter((t) => t.status === 'assigned' || t.status === 'in_progress' || t.status === 'on_hold');
      setTasks(staffTasks);
      setIsLoading(false);
    });
  }, []);

  const filteredTasks = tasks.filter((task) => {
    if (activeTab === 'high' && task.priorityLabel !== 'high') return false;
    if (activeTab === 'dueSoon' && !task.overdue) return false;
    if (categoryFilter !== 'all' && task.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        task.code.toLowerCase().includes(q) ||
        task.text.toLowerCase().includes(q) ||
        task.area.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Page Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#14231F]">
            {t('staff.title')}
          </h1>
          <p className="text-xs text-[#6B7C77] mt-0.5">
            {t('staff.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-lg bg-white border border-[#E3EAE7] text-xs font-bold text-[#14231F]">
            {tasks.length} Active Assigned
          </span>
          <span className="px-3 py-1 rounded-lg bg-[#FBE6E6] border border-[#F6C6C6] text-xs font-bold text-[#D64545]">
            {tasks.filter((t) => t.overdue).length} Due / Overdue
          </span>
        </div>
      </div>

      {/* Tabs and Filters (Screen 7) */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E3EAE7] shadow-civic-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#F5F8F7] border border-[#E3EAE7] text-xs font-semibold">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'all' ? 'bg-white text-[#1E8E6E] font-bold shadow-sm' : 'text-[#6B7C77]'
              }`}
            >
              {t('staff.tabs.all')} ({tasks.length})
            </button>
            <button
              onClick={() => setActiveTab('high')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'high' ? 'bg-white text-[#E8731A] font-bold shadow-sm' : 'text-[#6B7C77]'
              }`}
            >
              {t('staff.tabs.highPriority')} ({tasks.filter((t) => t.priorityLabel === 'high').length})
            </button>
            <button
              onClick={() => setActiveTab('dueSoon')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'dueSoon' ? 'bg-white text-[#D64545] font-bold shadow-sm' : 'text-[#6B7C77]'
              }`}
            >
              {t('staff.tabs.dueSoon')} ({tasks.filter((t) => t.overdue).length})
            </button>
          </div>

          {/* Search & Category Filter */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-56">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter tasks..."
                className="w-full min-h-[38px] ps-8 pe-3 py-1.5 rounded-lg border border-[#E3EAE7] text-xs text-[#14231F] focus:outline-none focus:ring-2 focus:ring-[#1E8E6E]"
              />
              <Search className="w-3.5 h-3.5 text-[#6B7C77] absolute start-2.5 top-1/2 -translate-y-1/2" />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="min-h-[38px] px-3 py-1.5 rounded-lg border border-[#E3EAE7] text-xs font-medium text-[#14231F] bg-white focus:outline-none focus:ring-2 focus:ring-[#1E8E6E]"
            >
              <option value="all">All Categories</option>
              <option value="streetlight">{t('categories.streetlight')}</option>
              <option value="road_damage">{t('categories.road_damage')}</option>
              <option value="garbage">{t('categories.garbage')}</option>
              <option value="water_leak">{t('categories.water_leak')}</option>
              <option value="blocked_drain">{t('categories.blocked_drain')}</option>
            </select>
          </div>
        </div>

        {/* Tasks List: Responsive Table on desktop, stacked cards on mobile (Screen 7) */}
        {isLoading ? (
          <div className="py-12 text-center text-xs text-[#6B7C77]">
            {t('common.loading')}
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#6B7C77]">
            {t('common.empty')}
          </div>
        ) : (
          <div className="space-y-3">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-xs text-start">
                <thead className="bg-[#F5F8F7] border-b border-[#E3EAE7] font-semibold text-[#6B7C77]">
                  <tr>
                    <th className="p-3 text-start">{t('staff.table.code')}</th>
                    <th className="p-3 text-start">{t('staff.table.title')}</th>
                    <th className="p-3 text-start">{t('staff.table.area')}</th>
                    <th className="p-3 text-start">{t('staff.table.priority')}</th>
                    <th className="p-3 text-start">Status</th>
                    <th className="p-3 text-start">{t('staff.table.sla')}</th>
                    <th className="p-3 text-end">{t('staff.table.action')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3EAE7]">
                  {filteredTasks.map((t) => (
                    <tr key={t.id} className="hover:bg-[#F5F8F7]/60 transition-colors">
                      <td className="p-3 font-mono font-bold text-[#14231F] whitespace-nowrap">
                        <Link to={`/staff/tickets/${t.id}`} className="hover:text-[#1E8E6E]">
                          {t.code}
                        </Link>
                      </td>
                      <td className="p-3 font-medium text-[#14231F] max-w-xs">
                        <div className="truncate font-semibold">{t.text}</div>
                        <div className="text-[11px] text-[#6B7C77] flex items-center gap-1.5 mt-0.5">
                          <span>{t.category}</span>
                          {t.reportCount > 1 && (
                            <span className="text-[#1E8E6E] font-medium">
                              • {t.reportCount} reports
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-[#14231F] whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#1E8E6E]" />
                          <span>{t.area}</span>
                        </div>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <PriorityBadge priority={t.priorityLabel} />
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <StatusBadge status={t.status} />
                      </td>
                      <td className="p-3 whitespace-nowrap font-mono font-bold">
                        <span className={t.overdue ? 'text-[#D64545]' : 'text-[#2E9E6B]'}>
                          {t.overdue ? '⚠️ Overdue' : '⏱️ 36h left'}
                        </span>
                      </td>
                      <td className="p-3 text-end whitespace-nowrap">
                        <Link to={`/staff/tickets/${t.id}`}>
                          <Button size="sm" variant="secondary">
                            View Task →
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Stacked Cards (Screen 7 Mobile) */}
            <div className="md:hidden space-y-3">
              {filteredTasks.map((t) => (
                <div
                  key={t.id}
                  className="p-4 rounded-xl border border-[#E3EAE7] bg-[#F5F8F7]/30 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-sm text-[#14231F]">
                      {t.code}
                    </span>
                    <PriorityBadge priority={t.priorityLabel} />
                  </div>
                  <p className="text-xs text-[#14231F] font-medium line-clamp-2">
                    {t.text}
                  </p>
                  <div className="flex items-center justify-between text-xs text-[#6B7C77] pt-1 border-t border-[#E3EAE7]">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#1E8E6E]" />
                      {t.area}
                    </span>
                    <span className={`font-mono font-bold ${t.overdue ? 'text-[#D64545]' : 'text-[#2E9E6B]'}`}>
                      {t.overdue ? '⚠️ Overdue' : '⏱️ On Track'}
                    </span>
                  </div>
                  <Link to={`/staff/tickets/${t.id}`} className="block w-full">
                    <Button size="sm" className="w-full">
                      View Task Details
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

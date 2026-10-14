import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ListOrdered,
  Layers,
  MapPin,
  Clock,
  Filter,
  CheckSquare,
  Square,
  UserPlus,
  ArrowRight,
  Sparkles,
  ChevronDown,
  AlertTriangle
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { PriorityBadge, StatusBadge } from '../../components/common/Badge';
import { Img } from '../../components/common/Img';
import { api } from '../../lib/api';
import { Ticket, CategoryId } from '../../types';

export const RankedQueue: React.FC = () => {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<'stack' | 'table'>('stack');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [areaFilter, setAreaFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [bulkAssignTarget, setBulkAssignTarget] = useState('');
  const [assignDropdownOpenId, setAssignDropdownOpenId] = useState<number | null>(null);

  const crews = [
    { name: 'Asphalt Quick Patch Unit 2', dept: 'Roads & Highways Dept' },
    { name: 'Electric Field Team C', dept: 'Electrical & Lighting Works' },
    { name: 'Drainage Jetting Unit 1', dept: 'Water & Sewerage Corporation' },
    { name: 'Solid Waste Crew 04', dept: 'Sindh Solid Waste Management' },
    { name: 'Pipeline Emergency Cell', dept: 'Water & Sewerage Corporation' }
  ];

  const loadData = () => {
    api.listTickets().then((data) => setTickets(data));
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredTickets = tickets.filter((t) => {
    if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
    if (areaFilter !== 'all' && t.area !== areaFilter) return false;
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    return true;
  });

  const toggleSelectTicket = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredTickets.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredTickets.map((t) => t.id));
    }
  };

  const handleBulkAssign = async () => {
    if (!bulkAssignTarget || selectedIds.length === 0) return;
    const crew = crews.find((c) => c.name === bulkAssignTarget);
    if (!crew) return;

    for (const id of selectedIds) {
      await api.assign(id, crew.name, crew.dept);
    }
    setSelectedIds([]);
    setBulkAssignTarget('');
    loadData();
  };

  const handleIndividualAssign = async (ticketId: number, crewName: string, dept: string) => {
    setAssignDropdownOpenId(null);
    await api.assign(ticketId, crewName, dept);
    loadData();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#14231F]">
            {t('admin.queue.title')}
          </h1>
          <p className="text-xs text-[#6B7C77] mt-0.5">
            {t('admin.queue.subtitle')}
          </p>
        </div>

        {/* View Mode Toggle: 3D Card Stack vs Table */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-white border border-[#E3EAE7] shadow-civic-sm text-xs font-semibold">
          <button
            onClick={() => setViewMode('stack')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              viewMode === 'stack'
                ? 'bg-[#1E8E6E] text-white font-bold'
                : 'text-[#6B7C77] hover:text-[#14231F]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{t('admin.queue.view3d')}</span>
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              viewMode === 'table'
                ? 'bg-[#1E8E6E] text-white font-bold'
                : 'text-[#6B7C77] hover:text-[#14231F]'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span>{t('admin.queue.viewTable')}</span>
          </button>
        </div>
      </div>

      {/* Filter and Bulk Assign Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E3EAE7] shadow-civic-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Category */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-[#E3EAE7] bg-[#F5F8F7] font-medium text-[#14231F]"
            >
              <option value="all">{t('admin.queue.filterCategory')}</option>
              <option value="streetlight">{t('categories.streetlight')}</option>
              <option value="road_damage">{t('categories.road_damage')}</option>
              <option value="garbage">{t('categories.garbage')}</option>
              <option value="water_leak">{t('categories.water_leak')}</option>
              <option value="blocked_drain">{t('categories.blocked_drain')}</option>
            </select>

            {/* Area */}
            <select
              value={areaFilter}
              onChange={(e) => setAreaFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-[#E3EAE7] bg-[#F5F8F7] font-medium text-[#14231F]"
            >
              <option value="all">{t('admin.queue.filterArea')}</option>
              <option value="Gulshan-e-Iqbal">Gulshan-e-Iqbal</option>
              <option value="DHA Phase 5">DHA Phase 5</option>
              <option value="PECHS Block 2">PECHS</option>
              <option value="North Nazimabad">North Nazimabad</option>
              <option value="Korangi Sector 15">Korangi</option>
              <option value="Saddar">Saddar</option>
            </select>

            {/* Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-[#E3EAE7] bg-[#F5F8F7] font-medium text-[#14231F]"
            >
              <option value="all">All Statuses</option>
              <option value="submitted">Submitted</option>
              <option value="triaged">Triaged</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="on_hold">On Hold</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          {/* Bulk Assign Controls */}
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 p-1.5 rounded-xl bg-[#E6F4EF] border border-[#C2E7DA]">
              <span className="text-xs font-bold text-[#166F57] px-2">
                {selectedIds.length} Selected
              </span>
              <select
                value={bulkAssignTarget}
                onChange={(e) => setBulkAssignTarget(e.target.value)}
                className="px-2.5 py-1 rounded-lg border border-[#E3EAE7] bg-white text-xs text-[#14231F]"
              >
                <option value="">Select Crew...</option>
                {crews.map((c) => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
              <Button size="sm" onClick={handleBulkAssign}>
                Assign All
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* VIEW 1: 3D Card Stack View */}
      {viewMode === 'stack' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTickets.map((t, idx) => (
            <div
              key={t.id}
              className="relative bg-white rounded-2xl p-5 border border-[#E3EAE7] shadow-civic-card hover:shadow-civic-lg transition-all duration-300 flex flex-col justify-between space-y-4 group"
              style={{
                transform: `translateY(${Math.min(idx * 2, 8)}px)`
              }}
            >
              {/* Top row */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleSelectTicket(t.id)}
                    className="text-[#6B7C77] hover:text-[#1E8E6E] cursor-pointer"
                  >
                    {selectedIds.includes(t.id) ? (
                      <CheckSquare className="w-4 h-4 text-[#1E8E6E]" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                  <span className="font-mono font-extrabold text-sm text-[#14231F]">{t.code}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <PriorityBadge priority={t.priorityLabel} />
                  <span className="px-2 py-0.5 rounded-full bg-[#1E8E6E] text-white text-[11px] font-mono font-bold">
                    {t.priorityScore}
                  </span>
                </div>
              </div>

              {/* Photo & description */}
              <div className="flex gap-3">
                <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-[#E3EAE7]">
                  <Img src={t.beforePhoto} alt={t.text} aspectRatio="aspect-square" className="w-full h-full" />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <span className="text-[11px] font-semibold text-[#1E8E6E] block uppercase tracking-wide">
                    {t.category}
                  </span>
                  <p className="text-xs font-semibold text-[#14231F] line-clamp-2">
                    {t.text}
                  </p>
                  <div className="text-[11px] text-[#6B7C77] flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#1E8E6E]" />
                    <span className="truncate">{t.area}</span>
                  </div>
                </div>
              </div>

              {/* Priority factor contribution mini bars */}
              <div className="space-y-1.5 pt-2 border-t border-[#E3EAE7]">
                <div className="flex justify-between text-[10px] text-[#6B7C77] font-semibold">
                  <span>Safety Risk</span>
                  <span>{(t.factors.safety * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#E3EAE7] overflow-hidden">
                  <div className="h-full bg-[#E8731A]" style={{ width: `${t.factors.safety * 100}%` }} />
                </div>
              </div>

              {/* SLA & Assign footer */}
              <div className="flex items-center justify-between text-xs pt-1">
                <div className="flex items-center gap-1 text-[11px] font-mono font-bold">
                  <span className={`flex items-center gap-1 ${t.overdue ? 'text-[#D64545]' : 'text-[#2E9E6B]'}`}>
                    {t.overdue ? (
                      <>
                        <AlertTriangle className="w-3 h-3" />
                        <span>SLA Breached</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-3 h-3" />
                        <span>48h SLA</span>
                      </>
                    )}
                  </span>
                  {t.reportCount > 1 && (
                    <span className="px-1.5 py-0.5 rounded bg-[#E6F4EF] text-[#1E8E6E] text-[10px]">
                      {t.reportCount} reports
                    </span>
                  )}
                </div>

                {/* Individual assign dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setAssignDropdownOpenId(assignDropdownOpenId === t.id ? null : t.id)}
                    className="px-2.5 py-1.5 rounded-lg border border-[#E3EAE7] bg-[#F5F8F7] hover:bg-[#E6F4EF] text-[#14231F] text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span className="max-w-[80px] truncate">{t.assignedTo ? 'Reassign' : 'Assign'}</span>
                    <ChevronDown className="w-3 h-3 text-[#6B7C77]" />
                  </button>

                  {assignDropdownOpenId === t.id && (
                    <div className="absolute end-0 bottom-full mb-1 w-56 bg-white rounded-xl border border-[#E3EAE7] shadow-civic-lg py-1 z-50">
                      <div className="px-3 py-1 text-[10px] font-bold uppercase text-[#6B7C77] border-b border-[#E3EAE7]">
                        Assign Department Crew
                      </div>
                      {crews.map((c) => (
                        <button
                          key={c.name}
                          onClick={() => handleIndividualAssign(t.id, c.name, c.dept)}
                          className="w-full text-start px-3 py-2 text-xs font-medium text-[#14231F] hover:bg-[#E6F4EF] hover:text-[#1E8E6E]"
                        >
                          <div className="font-bold">{c.name}</div>
                          <div className="text-[10px] text-[#6B7C77]">{c.dept}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW 2: Table View */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-[#E3EAE7] shadow-civic-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead className="bg-[#F5F8F7] border-b border-[#E3EAE7] font-semibold text-[#6B7C77]">
                <tr>
                  <th className="p-3 w-8">
                    <button onClick={handleSelectAll} className="cursor-pointer">
                      {selectedIds.length === filteredTickets.length ? (
                        <CheckSquare className="w-4 h-4 text-[#1E8E6E]" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="p-3 text-start">Code</th>
                  <th className="p-3 text-start">Description</th>
                  <th className="p-3 text-start">District</th>
                  <th className="p-3 text-start">Priority Score</th>
                  <th className="p-3 text-start">Assigned To</th>
                  <th className="p-3 text-start">SLA Status</th>
                  <th className="p-3 text-end">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3EAE7]">
                {filteredTickets.map((t) => (
                  <tr key={t.id} className="hover:bg-[#F5F8F7]/60">
                    <td className="p-3">
                      <button onClick={() => toggleSelectTicket(t.id)} className="cursor-pointer">
                        {selectedIds.includes(t.id) ? (
                          <CheckSquare className="w-4 h-4 text-[#1E8E6E]" />
                        ) : (
                          <Square className="w-4 h-4 text-[#6B7C77]" />
                        )}
                      </button>
                    </td>
                    <td className="p-3 font-mono font-bold text-[#14231F] whitespace-nowrap">
                      <Link to={`/admin/tickets/${t.id}`} className="hover:text-[#1E8E6E]">
                        {t.code}
                      </Link>
                    </td>
                    <td className="p-3 font-medium text-[#14231F] max-w-sm truncate">
                      {t.text}
                    </td>
                    <td className="p-3 text-[#6B7C77] whitespace-nowrap">
                      {t.area}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <PriorityBadge priority={t.priorityLabel} />
                        <span className="font-mono font-bold text-[#14231F]">{t.priorityScore}</span>
                      </div>
                    </td>
                    <td className="p-3 text-[#14231F] whitespace-nowrap">
                      {t.assignedTo || 'Unassigned'}
                    </td>
                    <td className="p-3 whitespace-nowrap font-mono font-bold">
                      <span className={`flex items-center gap-1 ${t.overdue ? 'text-[#D64545]' : 'text-[#2E9E6B]'}`}>
                        {t.overdue ? (
                          <>
                            <AlertTriangle className="w-3 h-3" />
                            <span>Overdue</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3" />
                            <span>On Track</span>
                          </>
                        )}
                      </span>
                    </td>
                    <td className="p-3 text-end whitespace-nowrap">
                      <Link to={`/admin/tickets/${t.id}`}>
                        <Button size="sm" variant="secondary">
                          Inspect →
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

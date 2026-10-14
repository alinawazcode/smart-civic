import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Search,
  Filter,
  Clock,
  MapPin,
  Layers,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Play,
  CheckCheck,
  Pause,
  Upload,
  Sparkles,
  Phone,
  Shield,
  Activity,
  X
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { PriorityBadge, StatusBadge } from '../../components/common/Badge';
import { Img } from '../../components/common/Img';
import { ProofCameraCapture } from '../../components/common/ProofCameraCapture';
import { useRole } from '../../context/RoleContext';
import { AccountStore } from '../../lib/accountStore';
import { api } from '../../lib/api';
import { Ticket, Status } from '../../types';

export const StaffTasks: React.FC = () => {
  const { t } = useTranslation();
  const { userName, userBadge, userDepartment } = useRole();
  const [tasks, setTasks] = useState<Ticket[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'assigned' | 'in_progress' | 'high' | 'dueSoon'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  // Quick resolution modal state
  const [resolvingTicket, setResolvingTicket] = useState<Ticket | null>(null);
  const [resolutionPhoto, setResolutionPhoto] = useState('/images/after-streetlight-fixed.jpg');
  const [resolutionNote, setResolutionNote] = useState('');
  const [isSubmittingRes, setIsSubmittingRes] = useState(false);

  const loadTasks = () => {
    setIsLoading(true);
    api.listTickets().then((data) => {
      // Include assigned, in_progress, on_hold, and recently resolved
      const staffTasks = data.filter((t) =>
        t.status === 'assigned' || t.status === 'in_progress' || t.status === 'on_hold' || t.status === 'resolved'
      );
      setTasks(staffTasks);
      setIsLoading(false);
    });
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const showNotification = (text: string, type: 'success' | 'info' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Quick Start Task
  const handleQuickStart = async (ticketId: number, code: string) => {
    const updated = await api.updateStatus(ticketId, 'in_progress', 'Started on-site fieldwork', userName || 'Field Crew');
    setTasks((prev) => prev.map((t) => (t.id === ticketId ? updated : t)));
    showNotification(`Task ${code} is now IN PROGRESS! Field team dispatched.`, 'info');
  };

  // Quick Hold Task
  const handleQuickHold = async (ticketId: number, code: string) => {
    const updated = await api.updateStatus(ticketId, 'on_hold', 'Awaiting equipment / materials', userName || 'Field Crew');
    setTasks((prev) => prev.map((t) => (t.id === ticketId ? updated : t)));
    showNotification(`Task ${code} placed ON HOLD awaiting parts.`, 'info');
  };

  // Open Quick Resolve Modal
  const openResolveModal = (ticket: Ticket) => {
    setResolvingTicket(ticket);
    if (ticket.category === 'road_damage') setResolutionPhoto('/images/after-pothole-fixed.jpg');
    else if (ticket.category === 'garbage') setResolutionPhoto('/images/after-garbage-cleared.jpg');
    else if (ticket.category === 'blocked_drain') setResolutionPhoto('/images/after-drain-cleared.jpg');
    else if (ticket.category === 'water_leak') setResolutionPhoto('/images/after-leak-fixed.jpg');
    else setResolutionPhoto('/images/after-streetlight-fixed.jpg');
    setResolutionNote('Repaired and verified on-site by municipal crew.');
  };

  // Submit Quick Resolution
  const handleConfirmResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingTicket) return;
    setIsSubmittingRes(true);
    try {
      const updated = await api.submitResolution(resolvingTicket.id, resolutionPhoto, resolutionNote);
      setTasks((prev) => prev.map((t) => (t.id === resolvingTicket.id ? updated : t)));
      showNotification(`Task ${resolvingTicket.code} marked RESOLVED! Before/after proof uploaded for Admin review.`, 'success');
      setResolvingTicket(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingRes(false);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (activeTab === 'assigned' && task.status !== 'assigned') return false;
    if (activeTab === 'in_progress' && task.status !== 'in_progress') return false;
    if (activeTab === 'high' && task.priorityLabel !== 'high') return false;
    if (activeTab === 'dueSoon' && !task.overdue) return false;
    if (categoryFilter !== 'all' && task.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        task.code.toLowerCase().includes(q) ||
        task.text.toLowerCase().includes(q) ||
        task.area.toLowerCase().includes(q) ||
        (task.assignedTo && task.assignedTo.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const assignedCount = tasks.filter((t) => t.status === 'assigned').length;
  const inProgressCount = tasks.filter((t) => t.status === 'in_progress').length;
  const overdueCount = tasks.filter((t) => t.overdue).length;
  const resolvedToday = tasks.filter((t) => t.status === 'resolved').length;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div
          className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center justify-between gap-3 shadow-lg animate-in fade-in slide-in-from-top-2 ${
            toastMsg.type === 'success'
              ? 'bg-[#E3F5EC] border-[#C8EBD9] text-[#166F57]'
              : 'bg-[#E6F4EF] border-[#B2E4D4] text-[#1E8E6E]'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#1E8E6E]" />
            <span>{toastMsg.text}</span>
          </div>
          <button onClick={() => setToastMsg(null)} className="p-1 hover:opacity-75">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Staff Header with Profile Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-[#14231F]">{t('staff.title')}</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E6F4EF] text-[#1E8E6E] border border-[#C8EBD9]">
              {userBadge || 'Field Dispatch'}
            </span>
          </div>
          <p className="text-xs text-[#6B7C77] mt-0.5">
            {userDepartment ? `${userDepartment} · ` : ''}Active municipal work orders, SLA timers, and field execution
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadTasks}
            className="px-3 py-1.5 rounded-xl border border-[#E3EAE7] bg-white text-xs font-semibold text-[#14231F] hover:bg-[#F5F8F7] transition-all cursor-pointer shadow-xs"
          >
            Refresh Queue
          </button>
        </div>
      </div>

      {/* 4 Interactive KPI Metric Cards with 3D Tilt Hover */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E3EAE7] shadow-civic-sm hover:shadow-[0_12px_28px_rgba(30,142,110,0.15)] hover:border-[#1E8E6E]/60 transition-all duration-300 group">
          <div className="flex items-center justify-between text-xs font-semibold text-[#6B7C77]">
            <span>Pending Dispatch</span>
            <span className="w-2 h-2 rounded-full bg-[#E8731A]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#14231F] font-mono mt-1 group-hover:text-[#1E8E6E] transition-colors">
            {assignedCount}
          </div>
          <p className="text-[11px] text-[#6B7C77] mt-0.5">Awaiting crew arrival on-site</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E3EAE7] shadow-civic-sm hover:shadow-[0_12px_28px_rgba(47,125,209,0.15)] hover:border-[#2F7DD1]/60 transition-all duration-300 group">
          <div className="flex items-center justify-between text-xs font-semibold text-[#6B7C77]">
            <span>Active In-Progress</span>
            <span className="w-2 h-2 rounded-full bg-[#2F7DD1] animate-pulse" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#2F7DD1] font-mono mt-1">
            {inProgressCount}
          </div>
          <p className="text-[11px] text-[#6B7C77] mt-0.5">Field work currently underway</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E3EAE7] shadow-civic-sm hover:shadow-[0_12px_28px_rgba(214,69,69,0.15)] hover:border-[#D64545]/60 transition-all duration-300 group">
          <div className="flex items-center justify-between text-xs font-semibold text-[#6B7C77]">
            <span>SLA Overdue / At Risk</span>
            <span className="w-2 h-2 rounded-full bg-[#D64545]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#D64545] font-mono mt-1">
            {overdueCount}
          </div>
          <p className="text-[11px] text-[#6B7C77] mt-0.5">Requires immediate escalation</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E3EAE7] shadow-civic-sm hover:shadow-[0_12px_28px_rgba(46,158,107,0.15)] hover:border-[#2E9E6B]/60 transition-all duration-300 group">
          <div className="flex items-center justify-between text-xs font-semibold text-[#6B7C77]">
            <span>Completed & Resolved</span>
            <span className="w-2 h-2 rounded-full bg-[#2E9E6B]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#2E9E6B] font-mono mt-1">
            {resolvedToday}
          </div>
          <p className="text-[11px] text-[#6B7C77] mt-0.5">Awaiting municipal closure sign-off</p>
        </div>
      </div>

      {/* Tabs and Filters */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E3EAE7] shadow-civic-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-[#F5F8F7] border border-[#E3EAE7] text-xs font-semibold">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'all' ? 'bg-white text-[#1E8E6E] font-bold shadow-xs' : 'text-[#6B7C77]'
              }`}
            >
              {t('staff.tabs.all')} ({tasks.length})
            </button>
            <button
              onClick={() => setActiveTab('assigned')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'assigned' ? 'bg-white text-[#E8731A] font-bold shadow-xs' : 'text-[#6B7C77]'
              }`}
            >
              Assigned ({assignedCount})
            </button>
            <button
              onClick={() => setActiveTab('in_progress')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'in_progress' ? 'bg-white text-[#2F7DD1] font-bold shadow-xs' : 'text-[#6B7C77]'
              }`}
            >
              In Progress ({inProgressCount})
            </button>
            <button
              onClick={() => setActiveTab('high')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'high' ? 'bg-white text-[#D64545] font-bold shadow-xs' : 'text-[#6B7C77]'
              }`}
            >
              High Priority ({tasks.filter((t) => t.priorityLabel === 'high').length})
            </button>
            <button
              onClick={() => setActiveTab('dueSoon')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'dueSoon' ? 'bg-white text-[#D64545] font-bold shadow-xs' : 'text-[#6B7C77]'
              }`}
            >
              Overdue ({overdueCount})
            </button>
          </div>

          {/* Search & Category Filter */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-60">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ticket code, area..."
                className="w-full min-h-[38px] ps-8 pe-3 py-1.5 rounded-xl border border-[#E3EAE7] text-xs text-[#14231F] focus:outline-none focus:ring-2 focus:ring-[#1E8E6E]"
              />
              <Search className="w-3.5 h-3.5 text-[#6B7C77] absolute start-2.5 top-1/2 -translate-y-1/2" />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="min-h-[38px] px-3 py-1.5 rounded-xl border border-[#E3EAE7] text-xs font-medium text-[#14231F] bg-white focus:outline-none focus:ring-2 focus:ring-[#1E8E6E]"
            >
              <option value="all">All Domains</option>
              <option value="streetlight">{t('categories.streetlight')}</option>
              <option value="road_damage">{t('categories.road_damage')}</option>
              <option value="garbage">{t('categories.garbage')}</option>
              <option value="water_leak">{t('categories.water_leak')}</option>
              <option value="blocked_drain">{t('categories.blocked_drain')}</option>
            </select>
          </div>
        </div>

        {/* Tasks List */}
        {isLoading ? (
          <div className="py-12 text-center text-xs text-[#6B7C77]">
            Loading assigned municipal tasks...
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#6B7C77] bg-[#F5F8F7] rounded-xl border border-dashed border-[#E3EAE7]">
            No matching tasks found. All clear on this filter!
          </div>
        ) : (
          <div className="space-y-3">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto rounded-xl border border-[#E3EAE7]">
              <table className="w-full text-xs text-start">
                <thead className="bg-[#F5F8F7] border-b border-[#E3EAE7] font-semibold text-[#6B7C77]">
                  <tr>
                    <th className="p-3 text-start">Ticket Code</th>
                    <th className="p-3 text-start">Issue & Description</th>
                    <th className="p-3 text-start">Location</th>
                    <th className="p-3 text-start">Priority</th>
                    <th className="p-3 text-start">Status</th>
                    <th className="p-3 text-start">SLA Timer</th>
                    <th className="p-3 text-end">Quick Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3EAE7] bg-white">
                  {filteredTasks.map((t) => (
                    <tr key={t.id} className="hover:bg-[#F5F8F7]/80 transition-colors">
                      <td className="p-3 font-mono font-bold text-[#14231F] whitespace-nowrap">
                        <Link to={`/staff/tickets/${t.id}`} className="hover:text-[#1E8E6E] text-[#1E8E6E] underline-offset-2 hover:underline">
                          {t.code}
                        </Link>
                      </td>
                      <td className="p-3 font-medium text-[#14231F] max-w-xs">
                        <div className="truncate font-semibold text-[#14231F]">{t.text}</div>
                        <div className="text-[11px] text-[#6B7C77] flex items-center gap-1.5 mt-0.5">
                          <span>{t.category}</span>
                          {t.reportCount > 1 && (
                            <span className="text-[#1E8E6E] font-medium">
                              • {t.reportCount} reports merged
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-[#14231F] whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#1E8E6E]" />
                          <span className="truncate max-w-[140px]">{t.area}</span>
                        </div>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <PriorityBadge priority={t.priorityLabel} />
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <StatusBadge status={t.status} />
                      </td>
                      <td className="p-3 whitespace-nowrap font-mono font-bold">
                        <span className={`flex items-center gap-1 text-xs font-mono font-bold ${t.overdue ? 'text-[#D64545]' : 'text-[#2E9E6B]'}`}>
                          {t.overdue ? (
                            <>
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>Overdue</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3.5 h-3.5" />
                              <span>36h SLA</span>
                            </>
                          )}
                        </span>
                      </td>
                      <td className="p-3 text-end whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {t.status === 'assigned' && (
                            <button
                              onClick={() => handleQuickStart(t.id, t.code)}
                              className="px-2.5 py-1 rounded-lg bg-[#E6F4EF] hover:bg-[#1E8E6E] text-[#166F57] hover:text-white font-bold text-[11px] transition-all flex items-center gap-1 border border-[#B2E4D4]"
                              title="Start fieldwork immediately"
                            >
                              <Play className="w-3 h-3" />
                              <span>Start Work</span>
                            </button>
                          )}
                          {t.status === 'in_progress' && (
                            <>
                              <button
                                onClick={() => openResolveModal(t)}
                                className="px-2.5 py-1 rounded-lg bg-[#1E8E6E] hover:bg-[#166F57] text-white font-bold text-[11px] transition-all flex items-center gap-1 shadow-xs"
                                title="Upload after-fix photo and resolve"
                              >
                                <CheckCheck className="w-3 h-3" />
                                <span>Resolve</span>
                              </button>
                              <button
                                onClick={() => handleQuickHold(t.id, t.code)}
                                className="p-1 rounded-lg border border-[#E3EAE7] text-[#6B7C77] hover:bg-[#F5F8F7]"
                                title="Put on hold (awaiting parts)"
                              >
                                <Pause className="w-3 h-3" />
                              </button>
                            </>
                          )}
                          <Link to={`/staff/tickets/${t.id}`}>
                            <Button size="sm" variant="secondary">
                              View →
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Stacked Cards with Quick Action Buttons */}
            <div className="md:hidden space-y-3">
              {filteredTasks.map((t) => (
                <div
                  key={t.id}
                  className="p-4 rounded-2xl border border-[#E3EAE7] bg-white shadow-civic-card space-y-3 hover:border-[#1E8E6E]/60 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-sm text-[#14231F]">
                      {t.code}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <StatusBadge status={t.status} />
                      <PriorityBadge priority={t.priorityLabel} />
                    </div>
                  </div>
                  <p className="text-xs text-[#14231F] font-medium line-clamp-2 leading-relaxed">
                    {t.text}
                  </p>
                  <div className="flex items-center justify-between text-xs text-[#6B7C77] pt-2 border-t border-[#E3EAE7]">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#1E8E6E]" />
                      <span className="truncate max-w-[150px]">{t.area}</span>
                    </span>
                    <span className={`flex items-center gap-1 font-mono text-xs font-bold ${t.overdue ? 'text-[#D64545]' : 'text-[#2E9E6B]'}`}>
                      {t.overdue ? (
                        <>
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Overdue</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3.5 h-3.5" />
                          <span>36h Left</span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Mobile Quick Action Buttons */}
                  <div className="flex items-center gap-2 pt-1">
                    {t.status === 'assigned' && (
                      <button
                        onClick={() => handleQuickStart(t.id, t.code)}
                        className="flex-1 py-2 px-3 rounded-xl bg-[#E6F4EF] text-[#166F57] hover:bg-[#1E8E6E] hover:text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 border border-[#B2E4D4]"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Start Work</span>
                      </button>
                    )}
                    {t.status === 'in_progress' && (
                      <button
                        onClick={() => openResolveModal(t)}
                        className="flex-1 py-2 px-3 rounded-xl bg-[#1E8E6E] text-white hover:bg-[#166F57] font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>Mark Resolved</span>
                      </button>
                    )}
                    <Link to={`/staff/tickets/${t.id}`} className={t.status === 'resolved' ? 'w-full' : ''}>
                      <Button size="sm" variant="secondary" className="w-full">
                        View Details →
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick Resolve Modal with After-Repair Photo Submission & Before/After Comparison */}
      {resolvingTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="max-w-2xl w-full my-6">
            <ProofCameraCapture
              ticketCode={resolvingTicket.code}
              department={userDepartment || resolvingTicket.department || 'Municipal Command'}
              staffName={userName || 'Rashid Minhas'}
              staffBadge={userBadge || 'KWSB-8821'}
              beforePhotoUrl={resolvingTicket.beforePhoto}
              initialCoords={{ lat: resolvingTicket.lat, lng: resolvingTicket.lng }}
              onCancel={() => setResolvingTicket(null)}
              onCaptureComplete={async (data) => {
                setIsSubmittingRes(true);
                try {
                  const noteText = resolutionNote.trim() || 'Work verified and completed on-site with geotagged photo proof.';
                  const updated = await api.submitResolution(resolvingTicket.id, data.photoUrl, noteText);
                  setTasks((prev) => prev.map((t) => (t.id === resolvingTicket.id ? updated : t)));
                  
                  // Record in municipal audit log
                  AccountStore.addAuditLog({
                    actorName: userName || 'Field Inspector',
                    actorRole: 'staff',
                    action: 'RESOLUTION_APPROVED',
                    targetType: 'ticket',
                    targetId: String(resolvingTicket.id),
                    targetName: resolvingTicket.code,
                    summary: `Field repair verified for ${resolvingTicket.code} with geotagged proof`,
                    details: `Coords: ${data.coords.lat}°, ${data.coords.lng}° · Timestamp: ${data.timestamp}`
                  });

                  showNotification(`Task ${resolvingTicket.code} marked RESOLVED with GPS proof & before/after evidence!`, 'success');
                  setResolvingTicket(null);
                } catch (err) {
                  console.error(err);
                } finally {
                  setIsSubmittingRes(false);
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

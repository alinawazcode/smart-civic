import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, MapPin, Clock, CheckCircle2, AlertTriangle, Layers, Calendar, User, ArrowRight, ShieldCheck, RotateCcw } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { PriorityBadge, StatusBadge } from '../../components/common/Badge';
import { Img } from '../../components/common/Img';
import { BeforeAfterSlider } from '../../components/common/BeforeAfterSlider';
import { api } from '../../lib/api';
import { Ticket, Status } from '../../types';

export const TrackComplaint: React.FC = () => {
  const { code: urlCode } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [inputCode, setInputCode] = useState(urlCode || '');
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmedFixed, setConfirmedFixed] = useState(false);
  const [reopenNotice, setReopenNotice] = useState('');

  const executeTrack = async (codeToSearch: string) => {
    if (!codeToSearch.trim()) return;
    setIsLoading(true);
    setHasSearched(true);
    try {
      const result = await api.track(codeToSearch.trim());
      setTicket(result);
    } catch (e) {
      console.error(e);
      setTicket(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (urlCode) {
      setInputCode(urlCode);
      executeTrack(urlCode);
    } else {
      // Default to Hero ticket for initial viewing if no code entered
      executeTrack('CC-2026-001238');
    }
  }, [urlCode]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCode.trim()) {
      navigate(`/track/${encodeURIComponent(inputCode.trim())}`);
      executeTrack(inputCode.trim());
    }
  };

  const handleConfirmFixed = () => {
    setConfirmedFixed(true);
  };

  const handleReopen = async () => {
    if (!ticket) return;
    try {
      const updated = await api.reopenTicket(ticket.id, 'Citizen requested reopening on tracking portal');
      setTicket(updated);
      setReopenNotice(t('track.details.reopenSuccess'));
    } catch (e) {
      console.error(e);
    }
  };

  const timelineSteps: { key: Status; label: string }[] = [
    { key: 'submitted', label: 'Received' },
    { key: 'triaged', label: 'Classified & Triaged' },
    { key: 'assigned', label: 'Crew Assigned' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'resolved', label: 'Resolved' },
    { key: 'closed', label: 'Closed & Verified' }
  ];

  const getStepIndex = (status: Status) => {
    switch (status) {
      case 'submitted': return 0;
      case 'triaged': return 1;
      case 'assigned': return 2;
      case 'in_progress':
      case 'on_hold': return 3;
      case 'resolved': return 4;
      case 'closed': return 5;
      case 'reopened': return 2;
      default: return 0;
    }
  };

  return (
    <div className="max-w-[840px] mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
      {/* Search Header (Screen 4) */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#14231F]">
          {t('track.title')}
        </h1>
        <p className="text-sm text-[#6B7C77]">
          {t('track.subtitle')}
        </p>
      </div>

      {/* Code Search Box */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-lg mx-auto">
        <div className="relative flex-1">
          <input
            type="text"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            placeholder={t('track.inputPlaceholder')}
            className="w-full min-h-[44px] ps-10 pe-4 py-2 rounded-xl border border-[#E3EAE7] bg-white text-sm text-[#14231F] font-mono focus:outline-none focus:ring-2 focus:ring-[#1E8E6E]"
          />
          <Search className="w-4 h-4 text-[#6B7C77] absolute start-3.5 top-1/2 -translate-y-1/2" />
        </div>
        <Button type="submit" size="md" isLoading={isLoading}>
          {t('track.trackBtn')}
        </Button>
      </form>

      {/* Not Found State */}
      {hasSearched && !isLoading && !ticket && (
        <div className="p-8 rounded-2xl bg-white border border-[#E3EAE7] text-center space-y-3 shadow-civic-sm">
          <div className="w-12 h-12 rounded-full bg-[#FBE6E6] text-[#D64545] flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-[#14231F]">
            {t('track.notFoundTitle')}
          </h3>
          <p className="text-sm text-[#6B7C77] max-w-sm mx-auto">
            {t('track.notFoundDesc')}
          </p>
        </div>
      )}

      {/* Ticket Result Details Card (Screen 4) */}
      {ticket && !isLoading && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E3EAE7] shadow-civic-card space-y-8">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E3EAE7]">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xl font-extrabold text-[#14231F] isolate-ltr">
                  {ticket.code}
                </span>
                <StatusBadge status={ticket.status} />
                <PriorityBadge priority={ticket.priorityLabel} />
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-[#6B7C77]">
                <span className="flex items-center gap-1 font-medium text-[#14231F]">
                  <MapPin className="w-3.5 h-3.5 text-[#1E8E6E]" />
                  {ticket.area}
                </span>
                <span>•</span>
                <span>Reported {new Date(ticket.createdAt).toLocaleDateString()}</span>
                {ticket.reportCount > 1 && (
                  <span className="px-2 py-0.5 rounded-full bg-[#E6F4EF] text-[#1E8E6E] font-semibold flex items-center gap-1">
                    <Layers className="w-3 h-3" />
                    {ticket.reportCount} {t('track.details.clusterCount')}
                  </span>
                )}
              </div>
            </div>

            {/* SLA Badge */}
            <div className="text-start sm:text-end shrink-0">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7C77]">
                {t('track.details.slaRemaining')}
              </div>
              <div className={`text-sm font-bold font-mono ${ticket.overdue ? 'text-[#D64545]' : 'text-[#2E9E6B]'}`}>
                {ticket.overdue ? `⚠️ ${t('track.details.overdue')}` : `⏱️ ${t('track.details.onTime')}`}
              </div>
            </div>
          </div>

          {/* Description & Photo Section */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            <div className="md:col-span-8 space-y-4">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#6B7C77] mb-1">
                  Report Description
                </h4>
                <p className="text-sm text-[#14231F] leading-relaxed">
                  {ticket.text}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-3 rounded-xl bg-[#F5F8F7] border border-[#E3EAE7]">
                  <span className="text-[#6B7C77] block mb-0.5">{t('track.details.assignedTo')}</span>
                  <span className="font-semibold text-[#14231F]">
                    {ticket.department || 'Municipal Operations Cell'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#F5F8F7] border border-[#E3EAE7]">
                  <span className="text-[#6B7C77] block mb-0.5">Dispatched Crew</span>
                  <span className="font-semibold text-[#14231F]">
                    {ticket.assignedTo || 'Queued for Dispatch'}
                  </span>
                </div>
              </div>
            </div>

            <div className="md:col-span-4">
              <div className="rounded-xl overflow-hidden border border-[#E3EAE7]">
                <Img
                  src={ticket.beforePhoto}
                  alt="Reported problem photograph"
                  aspectRatio="aspect-[4/3]"
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>

          {/* Vertical Status Timeline (Screen 4) */}
          <div className="pt-4 border-t border-[#E3EAE7] space-y-4">
            <h3 className="text-sm font-bold text-[#14231F]">
              {t('track.details.timelineTitle')}
            </h3>

            <div className="space-y-4 relative before:absolute before:inset-0 before:start-3.5 before:w-0.5 before:bg-[#E3EAE7]">
              {timelineSteps.map((s, index) => {
                const currentIdx = getStepIndex(ticket.status);
                const isCompleted = index <= currentIdx;
                const isCurrent = index === currentIdx;

                return (
                  <div key={s.key} className="relative flex items-start gap-4">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 z-10 transition-colors ${
                        isCurrent
                          ? 'bg-[#1E8E6E] text-white ring-4 ring-[#E6F4EF]'
                          : isCompleted
                          ? 'bg-[#2E9E6B] text-white'
                          : 'bg-white border-2 border-[#E3EAE7] text-[#6B7C77]'
                      }`}
                    >
                      {isCompleted ? '✓' : index + 1}
                    </div>

                    <div className="flex-1 pt-0.5">
                      <span
                        className={`text-sm block ${
                          isCurrent
                            ? 'font-bold text-[#1E8E6E]'
                            : isCompleted
                            ? 'font-semibold text-[#14231F]'
                            : 'text-[#6B7C77]'
                        }`}
                      >
                        {s.label}
                      </span>
                      {isCurrent && (
                        <p className="text-xs text-[#6B7C77] mt-0.5">
                          Currently in progress with municipality
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Resolution Evidence Before/After Slider (when resolved or closed) */}
          {(ticket.status === 'resolved' || ticket.status === 'closed') && ticket.afterPhoto && (
            <div className="pt-6 border-t border-[#E3EAE7] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#14231F]">
                    {t('track.details.resolutionProof')}
                  </h3>
                  <p className="text-xs text-[#6B7C77]">
                    Slide to compare original fault against completed field repair.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#E3F5EC] text-[#2E9E6B] text-xs font-bold">
                  Verified Resolved
                </span>
              </div>

              <BeforeAfterSlider
                beforeSrc={ticket.beforePhoto}
                afterSrc={ticket.afterPhoto}
                beforeAlt="Before Repair"
                afterAlt="After Fixed"
              />

              {/* Confirm Fixed & Reopen Buttons */}
              <div className="p-4 rounded-xl bg-[#F5F8F7] border border-[#E3EAE7] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  {confirmedFixed ? (
                    <span className="text-sm font-semibold text-[#2E9E6B] flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      {t('track.details.confirmedThanks')}
                    </span>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleConfirmFixed}
                      leftIcon={<ShieldCheck className="w-4 h-4" />}
                    >
                      {t('track.details.confirmFixed')}
                    </Button>
                  )}
                  {reopenNotice && (
                    <p className="text-xs text-[#1E8E6E] font-medium mt-1">
                      {reopenNotice}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-[#6B7C77]">
                  <span>{t('track.details.reopenNotice')}</span>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleReopen}
                    leftIcon={<RotateCcw className="w-3.5 h-3.5 text-[#D64545]" />}
                  >
                    {t('track.details.reopen')}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Brain,
  Sliders,
  History,
  FileText,
  Shield,
  Layers,
  ChevronDown,
  Check
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { PriorityBadge, StatusBadge } from '../../components/common/Badge';
import { Img } from '../../components/common/Img';
import { CivicMap } from '../../components/common/LeafletMap';
import { api } from '../../lib/api';
import { Ticket, Status } from '../../types';

export const StaffTicketDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'classification' | 'priority' | 'audit'>('details');

  // Action states
  const [internalNote, setInternalNote] = useState('');
  const [afterPhotoUrl, setAfterPhotoUrl] = useState('/images/after-streetlight-fixed.jpg');
  const [afterPhotoNote, setAfterPhotoNote] = useState('');
  const [captureGps, setCaptureGps] = useState(true);
  const [isSubmittingResolution, setIsSubmittingResolution] = useState(false);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  useEffect(() => {
    if (id) {
      api.getTicket(Number(id)).then((data) => {
        setTicket(data);
        // choose matching default after photo
        if (data.category === 'road_damage') setAfterPhotoUrl('/images/after-pothole-fixed.jpg');
        else if (data.category === 'garbage') setAfterPhotoUrl('/images/after-garbage-cleared.jpg');
        else if (data.category === 'blocked_drain') setAfterPhotoUrl('/images/after-drain-cleared.jpg');
        else if (data.category === 'water_leak') setAfterPhotoUrl('/images/after-leak-fixed.jpg');
      });
    }
  }, [id]);

  if (!ticket) {
    return <div className="p-8 text-center text-xs text-[#6B7C77]">{t('common.loading')}</div>;
  }

  // Allowed transitions for staff only
  const allowedTransitions: { to: Status; label: string }[] = [];
  if (ticket.status === 'assigned') {
    allowedTransitions.push({ to: 'in_progress', label: 'Start Work (In Progress)' });
  } else if (ticket.status === 'in_progress') {
    allowedTransitions.push({ to: 'on_hold', label: 'Put On Hold (Awaiting Parts)' });
    allowedTransitions.push({ to: 'resolved', label: 'Mark Resolved (Upload Evidence)' });
  } else if (ticket.status === 'on_hold') {
    allowedTransitions.push({ to: 'in_progress', label: 'Resume Work (In Progress)' });
  }

  const handleUpdateStatus = async (to: Status) => {
    setStatusMenuOpen(false);
    const updated = await api.updateStatus(ticket.id, to, undefined, 'Field Crew Rashid');
    setTicket({ ...updated });
    setActionSuccessMsg(`Status updated to ${to}`);
    setTimeout(() => setActionSuccessMsg(''), 3000);
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!internalNote.trim()) return;
    const updated = await api.updateStatus(ticket.id, ticket.status, `Internal Note: ${internalNote}`, 'Field Crew Rashid');
    setTicket({ ...updated });
    setInternalNote('');
    setActionSuccessMsg('Field note saved to audit trail.');
    setTimeout(() => setActionSuccessMsg(''), 3000);
  };

  const handleSubmitResolution = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingResolution(true);
    try {
      const updated = await api.submitResolution(ticket.id, afterPhotoUrl, afterPhotoNote);
      setTicket({ ...updated });
      setActionSuccessMsg('Resolution evidence submitted! Admin notified for closure.');
      setTimeout(() => setActionSuccessMsg(''), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmittingResolution(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-[#6B7C77]">
        <Link to="/staff" className="hover:text-[#1E8E6E]">
          Tasks
        </Link>
        <span>/</span>
        <span className="font-mono text-[#14231F] font-bold">{ticket.code}</span>
      </div>

      {/* Detail Header (Screen 8) */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E3EAE7] shadow-civic-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span className="font-mono text-2xl font-extrabold text-[#14231F]">
              {ticket.code}
            </span>
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priorityLabel} />
          </div>
          <p className="text-xs text-[#6B7C77] flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#1E8E6E]" />
            <span>{ticket.area}</span>
            <span>•</span>
            <span>Priority Score: <strong className="text-[#14231F]">{ticket.priorityScore}/100</strong></span>
          </p>
        </div>

        {/* Update Status Menu */}
        <div className="relative">
          {allowedTransitions.length > 0 && (
            <button
              onClick={() => setStatusMenuOpen(!statusMenuOpen)}
              className="px-4 py-2 rounded-xl bg-[#1E8E6E] text-white font-semibold text-xs flex items-center gap-2 hover:bg-[#166F57] shadow-sm cursor-pointer"
            >
              <span>{t('staff.detail.updateStatus')}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          )}

          {statusMenuOpen && (
            <div className="absolute end-0 top-full mt-1.5 w-60 bg-white rounded-xl border border-[#E3EAE7] shadow-civic-lg py-1 z-50">
              {allowedTransitions.map((item) => (
                <button
                  key={item.to}
                  onClick={() => handleUpdateStatus(item.to)}
                  className="w-full text-start px-3 py-2 text-xs font-semibold text-[#14231F] hover:bg-[#E6F4EF] hover:text-[#1E8E6E]"
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {actionSuccessMsg && (
        <div className="p-3 rounded-xl bg-[#E3F5EC] border border-[#C8EBD9] text-[#2E9E6B] text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Tabs Row */}
      <div className="flex items-center gap-2 border-b border-[#E3EAE7] overflow-x-auto pb-px">
        {[
          { id: 'details', label: t('staff.detail.tabs.details'), icon: <FileText className="w-3.5 h-3.5" /> },
          { id: 'classification', label: t('staff.detail.tabs.classification'), icon: <Brain className="w-3.5 h-3.5" /> },
          { id: 'priority', label: t('staff.detail.tabs.priority'), icon: <Sliders className="w-3.5 h-3.5" /> },
          { id: 'audit', label: t('staff.detail.tabs.audit'), icon: <History className="w-3.5 h-3.5" /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === tab.id
                ? 'border-[#1E8E6E] text-[#1E8E6E]'
                : 'border-transparent text-[#6B7C77] hover:text-[#14231F]'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB: Details + Field Action Console */}
      {activeTab === 'details' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Info */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-[#E3EAE7] shadow-civic-card space-y-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#6B7C77] block mb-1">
                  Description of Fault
                </span>
                <p className="text-sm text-[#14231F] leading-relaxed">
                  {ticket.text}
                </p>
              </div>

              <div className="rounded-xl overflow-hidden border border-[#E3EAE7]">
                <Img
                  src={ticket.beforePhoto}
                  alt="Original civic complaint evidence"
                  aspectRatio="aspect-video"
                  className="w-full h-full"
                />
              </div>

              {/* Location Map */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#6B7C77] block">
                  Location Coordinates
                </span>
                <CivicMap
                  center={[ticket.lat, ticket.lng]}
                  zoom={15}
                  className="h-[220px]"
                  markers={[
                    {
                      id: ticket.id,
                      position: [ticket.lat, ticket.lng],
                      title: ticket.code
                    }
                  ]}
                />
              </div>
            </div>
          </div>

          {/* Right Action Console (Screen 8 Actions Card) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-[#E3EAE7] shadow-civic-card space-y-5">
              <div>
                <h3 className="text-sm font-bold text-[#14231F]">
                  {t('staff.detail.actionsCard.title')}
                </h3>
                <p className="text-xs text-[#6B7C77]">
                  Submit internal updates or upload after-fix evidence.
                </p>
              </div>

              {/* Add Note Form */}
              <form onSubmit={handleAddNote} className="space-y-2">
                <label className="text-xs font-bold text-[#14231F] block">
                  {t('staff.detail.actionsCard.addNote')}
                </label>
                <textarea
                  rows={2}
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                  placeholder={t('staff.detail.actionsCard.notePlaceholder')}
                  className="w-full p-2.5 rounded-lg border border-[#E3EAE7] text-xs text-[#14231F] focus:outline-none focus:ring-2 focus:ring-[#1E8E6E]"
                />
                <Button type="submit" size="sm" variant="secondary" className="w-full">
                  {t('staff.detail.actionsCard.submitNote')}
                </Button>
              </form>

              {/* Upload After Photo Form (Resolution evidence) */}
              <form onSubmit={handleSubmitResolution} className="pt-4 border-t border-[#E3EAE7] space-y-3">
                <div>
                  <h4 className="text-xs font-bold text-[#14231F] mb-1">
                    {t('staff.detail.actionsCard.uploadAfter')}
                  </h4>
                  <p className="text-[11px] text-[#6B7C77]">
                    Photo must show resolved street scene.
                  </p>
                </div>

                <div className="rounded-lg overflow-hidden border border-[#E3EAE7] aspect-video">
                  <Img src={afterPhotoUrl} alt="After repair photo preview" aspectRatio="aspect-video" className="w-full h-full" />
                </div>

                <input
                  type="text"
                  value={afterPhotoNote}
                  onChange={(e) => setAfterPhotoNote(e.target.value)}
                  placeholder="Notes (e.g. replaced luminaire, sealed patch)"
                  className="w-full p-2 rounded-lg border border-[#E3EAE7] text-xs text-[#14231F]"
                />

                <label className="flex items-center gap-2 text-xs text-[#6B7C77] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={captureGps}
                    onChange={(e) => setCaptureGps(e.target.checked)}
                    className="accent-[#1E8E6E]"
                  />
                  <span>{t('staff.detail.actionsCard.captureGps')}</span>
                </label>

                <Button
                  type="submit"
                  size="sm"
                  className="w-full"
                  isLoading={isSubmittingResolution}
                >
                  {t('staff.detail.actionsCard.submitResolution')}
                </Button>
              </form>

              {/* Admin verification notice */}
              <div className="p-3 rounded-xl bg-[#F5F8F7] border border-[#E3EAE7] text-[11px] text-[#6B7C77] leading-relaxed">
                {t('staff.detail.actionsCard.adminNotice')}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: Classification Details (Screen 8) */}
      {activeTab === 'classification' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E3EAE7] shadow-civic-card space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#14231F]">
                Multimodal Classification Diagnosis
              </h3>
              <p className="text-xs text-[#6B7C77]">
                Dual NLP & Computer Vision classification telemetry
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-[#E6F4EF] text-[#1E8E6E]">
              Confidence {(ticket.confidence * 100).toFixed(0)}%
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[#F5F8F7] border border-[#E3EAE7]">
              <span className="text-xs text-[#6B7C77] block mb-1">
                {t('staff.detail.classificationDetails.textGuess')}
              </span>
              <span className="font-bold text-sm text-[#14231F]">
                {ticket.predictedTextCategory || ticket.category}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#F5F8F7] border border-[#E3EAE7]">
              <span className="text-xs text-[#6B7C77] block mb-1">
                {t('staff.detail.classificationDetails.imageGuess')}
              </span>
              <span className="font-bold text-sm text-[#14231F]">
                {ticket.predictedImageCategory || ticket.category}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#E6F4EF] text-[#166F57] text-xs flex items-center justify-between">
            <span>
              <strong>Fused Result:</strong> {t(`categories.${ticket.category}`)}
            </span>
            <span className="flex items-center gap-1 font-semibold">
              {ticket.needsReview ? (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Flagged for Admin Review</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5 text-[#1E8E6E]" />
                  <span>Direct Automation Pass</span>
                </>
              )}
            </span>
          </div>
        </div>
      )}

      {/* TAB: Priority Factor Breakdown (Screen 8) */}
      {activeTab === 'priority' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E3EAE7] shadow-civic-card space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#14231F]">
                Multi-Factor Priority Scoring
              </h3>
              <p className="text-xs text-[#6B7C77]">
                Weighted combination of public safety risk, people affected, urgency, and repeat volume
              </p>
            </div>
            <div className="text-end">
              <span className="text-xs text-[#6B7C77] block">Overall Score</span>
              <span className="text-xl font-extrabold text-[#1E8E6E] font-mono">
                {ticket.priorityScore} / 100
              </span>
            </div>
          </div>

          {/* 4 Factor Contribution Bars */}
          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>{t('staff.detail.priorityDetails.safety')}</span>
                <span>{(ticket.factors.safety * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#E3EAE7] overflow-hidden">
                <div
                  className="h-full bg-[#E8731A]"
                  style={{ width: `${ticket.factors.safety * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>{t('staff.detail.priorityDetails.people')}</span>
                <span>{(ticket.factors.people * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#E3EAE7] overflow-hidden">
                <div
                  className="h-full bg-[#2F7DD1]"
                  style={{ width: `${ticket.factors.people * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>{t('staff.detail.priorityDetails.urgency')}</span>
                <span>{(ticket.factors.age * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#E3EAE7] overflow-hidden">
                <div
                  className="h-full bg-[#B88A0B]"
                  style={{ width: `${ticket.factors.age * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>{t('staff.detail.priorityDetails.repeat')}</span>
                <span>{(ticket.factors.repeat * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#E3EAE7] overflow-hidden">
                <div
                  className="h-full bg-[#1E8E6E]"
                  style={{ width: `${ticket.factors.repeat * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: Audit Log */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E3EAE7] shadow-civic-card space-y-4">
          <h3 className="text-base font-bold text-[#14231F]">
            Append-Only Audit Trail
          </h3>
          <div className="space-y-3 relative before:absolute before:inset-0 before:start-3.5 before:w-0.5 before:bg-[#E3EAE7]">
            {ticket.events.map((ev, i) => (
              <div key={i} className="relative flex items-start gap-4">
                <div className="w-7 h-7 rounded-full bg-[#E6F4EF] text-[#1E8E6E] flex items-center justify-center text-xs font-bold shrink-0 z-10">
                  •
                </div>
                <div className="flex-1 p-3 rounded-xl bg-[#F5F8F7] border border-[#E3EAE7] text-xs">
                  <div className="flex items-center justify-between font-semibold text-[#14231F]">
                    <span>{ev.actor} ({ev.role})</span>
                    <span className="font-mono text-[10px] text-[#6B7C77]">
                      {new Date(ev.at).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-[#1E8E6E] font-medium mt-0.5">
                    Transitioned to: {ev.to}
                  </div>
                  {ev.note && (
                    <p className="text-[#6B7C77] mt-1 italic">
                      "{ev.note}"
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

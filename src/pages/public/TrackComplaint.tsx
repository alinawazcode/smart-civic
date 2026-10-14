import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Search,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Calendar,
  User,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  QrCode,
  Printer,
  Copy,
  Check,
  Share2
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
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
  const [quickTickets, setQuickTickets] = useState<Ticket[]>([]);
  const [copiedCode, setCopiedCode] = useState(false);

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
    api.listTickets().then((all) => {
      setQuickTickets(all.slice(0, 5));
    });
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

      {/* Quick Select Complaints */}
      {quickTickets.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1 text-xs">
          <span className="text-[#6B7C77] font-semibold text-[11px]">Quick Track:</span>
          {quickTickets.map((qt) => (
            <button
              key={qt.id}
              type="button"
              onClick={() => {
                setInputCode(qt.code);
                navigate(`/track/${qt.code}`);
                executeTrack(qt.code);
              }}
              className={`px-2.5 py-1 rounded-lg border font-mono text-[11px] font-bold transition-all cursor-pointer ${
                ticket?.code === qt.code
                  ? 'bg-[#E6F4EF] border-[#1E8E6E] text-[#166F57]'
                  : 'bg-white border-[#E3EAE7] text-[#14231F] hover:border-[#1E8E6E]'
              }`}
            >
              {qt.code}
            </button>
          ))}
        </div>
      )}

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
              <div className={`flex items-center sm:justify-end gap-1 text-sm font-bold font-mono ${ticket.overdue ? 'text-[#D64545]' : 'text-[#2E9E6B]'}`}>
                {ticket.overdue ? (
                  <>
                    <AlertTriangle className="w-4 h-4" />
                    <span>{t('track.details.overdue')}</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4" />
                    <span>{t('track.details.onTime')}</span>
                  </>
                )}
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

            <div className="md:col-span-4 space-y-4">
              <div className="rounded-xl overflow-hidden border border-[#E3EAE7] shadow-2xs">
                <Img
                  src={ticket.beforePhoto}
                  alt="Reported problem photograph"
                  aspectRatio="aspect-[4/3]"
                  className="w-full h-full"
                />
              </div>

              {/* Official QR Pass Card */}
              <div className="p-4 rounded-2xl bg-[#F5F8F7] border border-[#E3EAE7] text-center space-y-3">
                <div className="bg-white p-2.5 rounded-xl inline-block border border-[#E3EAE7] shadow-sm">
                  <QRCodeSVG
                    id="track-qr-code"
                    value={`${typeof window !== 'undefined' ? window.location.origin : ''}/track/${ticket.code}`}
                    size={110}
                    level="H"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[#6B7C77] tracking-wider block">
                    Municipal Verification Pass
                  </span>
                  <span className="text-xs font-mono font-extrabold text-[#1E8E6E] block select-all">
                    {ticket.code}
                  </span>
                </div>

                <div className="flex flex-col gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      const canvas = document.createElement('canvas');
                      canvas.width = 600;
                      canvas.height = 760;
                      const ctx = canvas.getContext('2d');
                      if (!ctx) return;

                      ctx.fillStyle = '#FFFFFF';
                      ctx.fillRect(0, 0, 600, 760);

                      ctx.fillStyle = '#166F57';
                      ctx.fillRect(0, 0, 600, 115);

                      ctx.fillStyle = '#FFFFFF';
                      ctx.font = 'bold 19px sans-serif';
                      ctx.textAlign = 'center';
                      ctx.fillText('ISLAMIC REPUBLIC OF PAKISTAN', 300, 44);

                      ctx.font = '14px sans-serif';
                      ctx.fillText('Smart Civic Complaint Triage & Municipal Dispatch', 300, 72);

                      ctx.font = '12px sans-serif';
                      ctx.fillStyle = '#C8EBD9';
                      ctx.fillText('Official Citizen Grievance Verification Pass', 300, 95);

                      ctx.strokeStyle = '#E3EAE7';
                      ctx.lineWidth = 2;
                      ctx.strokeRect(30, 135, 540, 590);

                      ctx.fillStyle = '#E6F4EF';
                      ctx.fillRect(50, 155, 500, 65);

                      ctx.fillStyle = '#166F57';
                      ctx.font = 'bold 28px monospace';
                      ctx.fillText(ticket.code, 300, 198);

                      const qrSvg = document.getElementById('track-qr-code');
                      if (qrSvg) {
                        const xml = new XMLSerializer().serializeToString(qrSvg);
                        const svg64 = btoa(xml);
                        const b64Start = 'data:image/svg+xml;base64,';
                        const img = new Image();
                        img.onload = () => {
                          ctx.drawImage(img, 185, 240, 230, 230);

                          ctx.fillStyle = '#14231F';
                          ctx.font = 'bold 16px sans-serif';
                          ctx.fillText('Scan to Track Live SLA & Repair Progress', 300, 505);

                          ctx.fillStyle = '#6B7C77';
                          ctx.font = '13px sans-serif';
                          ctx.fillText(`Issued: ${new Date(ticket.createdAt).toLocaleDateString('en-PK')} · 24-72h SLA Target`, 300, 535);
                          ctx.fillText(`Area: ${ticket.area} · Category: ${ticket.category}`, 300, 560);

                          ctx.fillStyle = '#1E8E6E';
                          ctx.font = 'bold 13px sans-serif';
                          ctx.fillText('Verified Citizen Record · Karachi Municipal Command', 300, 665);

                          const link = document.createElement('a');
                          link.download = `CivicPass-${ticket.code}.png`;
                          link.href = canvas.toDataURL('image/png');
                          link.click();
                        };
                        img.src = b64Start + svg64;
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-[#1E8E6E] hover:bg-[#166F57] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Download QR Pass (PNG)</span>
                  </button>

                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="flex-1 px-2.5 py-1.5 rounded-xl border border-[#E3EAE7] bg-white text-xs font-semibold text-[#14231F] hover:bg-[#F5F8F7] flex items-center justify-center gap-1"
                    >
                      <Printer className="w-3.5 h-3.5 text-[#6B7C77]" />
                      <span>Print</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const currentUrl = `${window.location.origin}/track/${ticket.code}`;
                        const msg = `Smart Civic Complaint ${ticket.code} status: ${ticket.status}. Track progress: ${currentUrl}`;
                        window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
                      }}
                      className="flex-1 px-2.5 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 text-xs font-bold text-emerald-800 hover:bg-emerald-100 flex items-center justify-center gap-1"
                    >
                      <Share2 className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Share</span>
                    </button>
                  </div>
                </div>
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
                      {isCompleted ? <Check className="w-4 h-4" /> : index + 1}
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

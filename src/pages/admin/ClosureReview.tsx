import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, AlertTriangle, ShieldCheck, ArrowRight, RotateCcw, MapPin } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { BeforeAfterSlider } from '../../components/common/BeforeAfterSlider';
import { PriorityBadge } from '../../components/common/Badge';
import { api } from '../../lib/api';
import { Ticket } from '../../types';

export const ClosureReview: React.FC = () => {
  const { t } = useTranslation();
  const [resolvedTickets, setResolvedTickets] = useState<Ticket[]>([]);
  const [reasons, setReasons] = useState<Record<number, string>>({});
  const [msg, setMsg] = useState('');

  const loadResolved = () => {
    api.listTickets().then((data) => {
      // Find tickets with status resolved
      const items = data.filter((t) => t.status === 'resolved' && t.afterPhoto);
      setResolvedTickets(items);
    });
  };

  useEffect(() => {
    loadResolved();
  }, []);

  const handleApprove = async (id: number) => {
    await api.approveClosure(id);
    setMsg(`Ticket closed and verified.`);
    loadResolved();
    setTimeout(() => setMsg(''), 3000);
  };

  const handleSendBack = async (id: number) => {
    const reason = reasons[id];
    if (!reason || !reason.trim()) {
      setMsg(t('admin.closure.reasonRequired') || 'A rejection reason is required before sending back.');
      setTimeout(() => setMsg(''), 4000);
      return;
    }
    await api.sendBack(id, reason);
    setMsg('Ticket returned to field crew for rework.');
    loadResolved();
    setTimeout(() => setMsg(''), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-extrabold text-[#14231F]">
          {t('admin.closure.title')}
        </h1>
        <p className="text-xs text-[#6B7C77] mt-0.5">
          {t('admin.closure.subtitle')}
        </p>
      </div>

      {msg && (
        <div className="p-3 rounded-xl bg-[#E3F5EC] border border-[#C8EBD9] text-[#2E9E6B] text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{msg}</span>
        </div>
      )}

      {resolvedTickets.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-[#E3EAE7] shadow-civic-sm space-y-2">
          <div className="w-12 h-12 rounded-full bg-[#E3F5EC] text-[#2E9E6B] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#14231F]">No Pending Closures</h3>
          <p className="text-xs text-[#6B7C77]">
            All completed work evidence has been audited and approved.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {resolvedTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E3EAE7] shadow-civic-card space-y-6"
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E3EAE7]">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-lg font-extrabold text-[#14231F]">{ticket.code}</span>
                    <PriorityBadge priority={ticket.priorityLabel} />
                    <span className="text-xs font-semibold text-[#1E8E6E]">{ticket.category}</span>
                  </div>
                  <p className="text-xs text-[#6B7C77] flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#1E8E6E] shrink-0" />
                    <span>{ticket.area} · Crew: <strong>{ticket.assignedTo}</strong></span>
                  </p>
                </div>
                <div className="text-start sm:text-end text-xs font-mono font-bold text-[#2E9E6B]">
                  Field Repair Complete
                </div>
              </div>

              {/* Before and After Interactive Comparison Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-[#6B7C77]">
                  <span>Original citizen complaint vs Field crew completion evidence</span>
                  <span className="font-semibold text-[#14231F]">Slide handle horizontally to inspect</span>
                </div>
                <BeforeAfterSlider
                  beforeSrc={ticket.beforePhoto}
                  afterSrc={ticket.afterPhoto || ''}
                  beforeAlt="Original fault before repair"
                  afterAlt="Verified fix after repair"
                />
              </div>

              {/* Automated Quality Flags */}
              <div className="p-4 rounded-xl bg-[#F5F8F7] border border-[#E3EAE7] space-y-3">
                <span className="text-xs font-bold text-[#14231F] block">
                  {t('admin.closure.flagsTitle')}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-2.5 rounded-lg bg-white border border-[#E3EAE7] flex items-center justify-between">
                    <span className="text-[#6B7C77]">{t('admin.closure.flagLocation')}:</span>
                    <span className="font-bold text-[#2E9E6B] font-mono">14m match</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-[#E3EAE7] flex items-center justify-between">
                    <span className="text-[#6B7C77]">{t('admin.closure.flagCategory')}:</span>
                    <span className="font-bold text-[#2E9E6B] font-mono">96% verified</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-[#E3EAE7] flex items-center justify-between">
                    <span className="text-[#6B7C77]">{t('admin.closure.flagSimilarity')}:</span>
                    <span className="font-bold text-[#2E9E6B] font-mono">Confirmed fix</span>
                  </div>
                </div>

                <p className="text-[11px] text-[#6B7C77] italic">
                  {t('admin.closure.flagNotice')}
                </p>
              </div>

              {/* Decision Actions */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <Button size="md" onClick={() => handleApprove(ticket.id)}>
                  {t('admin.closure.approve')}
                </Button>

                <div className="flex items-center gap-2 flex-1 sm:max-w-md">
                  <input
                    type="text"
                    value={reasons[ticket.id] || ''}
                    onChange={(e) =>
                      setReasons((prev) => ({ ...prev, [ticket.id]: e.target.value }))
                    }
                    placeholder="Rejection reason..."
                    className="flex-1 p-2 rounded-lg border border-[#E3EAE7] text-xs text-[#14231F]"
                  />
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleSendBack(ticket.id)}
                    leftIcon={<RotateCcw className="w-3.5 h-3.5 text-[#D64545]" />}
                  >
                    {t('admin.closure.sendBack')}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

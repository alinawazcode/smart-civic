import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Split,
  Merge,
  ShieldCheck,
  UserCheck,
  ChevronDown,
  Check
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { PriorityBadge, StatusBadge } from '../../components/common/Badge';
import { Img } from '../../components/common/Img';
import { BeforeAfterSlider } from '../../components/common/BeforeAfterSlider';
import { CivicMap } from '../../components/common/LeafletMap';
import { api } from '../../lib/api';
import { Ticket, Status } from '../../types';

export const AdminTicketDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [msg, setMsg] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const loadTicket = () => {
    if (id) {
      api.getTicket(Number(id)).then((data) => setTicket(data));
    }
  };

  useEffect(() => {
    loadTicket();
  }, [id]);

  if (!ticket) return <div className="p-8 text-center text-xs text-[#6B7C77]">Loading...</div>;

  const handleSplitCluster = async () => {
    const updated = await api.splitCluster(ticket.id);
    setTicket({ ...updated });
    setMsg('Cluster successfully split into standalone ticket.');
    setTimeout(() => setMsg(''), 3000);
  };

  const handleApproveClosure = async () => {
    const updated = await api.approveClosure(ticket.id);
    setTicket({ ...updated });
    setMsg('Ticket officially verified and marked CLOSED.');
    setTimeout(() => setMsg(''), 3000);
  };

  const handleSendBack = async () => {
    if (!rejectionReason.trim()) {
      setMsg(t('admin.closure.reasonRequired') || 'A rejection reason is required before sending back.');
      setTimeout(() => setMsg(''), 4000);
      return;
    }
    const updated = await api.sendBack(ticket.id, rejectionReason);
    setTicket({ ...updated });
    setRejectionReason('');
    setMsg('Resolution rejected and returned to crew.');
    setTimeout(() => setMsg(''), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-[#6B7C77]">
        <Link to="/admin/queue" className="hover:text-[#1E8E6E]">Queue</Link>
        <span>/</span>
        <span className="font-mono text-[#14231F] font-bold">{ticket.code}</span>
      </div>

      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-[#E3EAE7] shadow-civic-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-2xl font-extrabold text-[#14231F]">{ticket.code}</span>
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priorityLabel} />
          </div>
          <p className="text-xs text-[#6B7C77] mt-1">
            District: <strong className="text-[#14231F]">{ticket.area}</strong> · Assigned: <strong className="text-[#14231F]">{ticket.assignedTo || 'Unassigned'}</strong>
          </p>
        </div>

        {/* Cluster actions */}
        <div className="flex items-center gap-2">
          {ticket.reportCount > 1 && (
            <Button size="sm" variant="secondary" onClick={handleSplitCluster} leftIcon={<Split className="w-3.5 h-3.5" />}>
              Split Cluster
            </Button>
          )}
          <span className="px-3 py-1.5 rounded-lg bg-[#E6F4EF] text-[#166F57] text-xs font-bold font-mono">
            Cluster #{ticket.clusterId} ({ticket.reportCount} reports)
          </span>
        </div>
      </div>

      {msg && (
        <div className="p-3 rounded-xl bg-[#E3F5EC] border border-[#C8EBD9] text-[#2E9E6B] text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{msg}</span>
        </div>
      )}

      {/* Description & Evidence */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-7 bg-white rounded-2xl p-6 border border-[#E3EAE7] shadow-civic-card space-y-4">
          <h3 className="text-sm font-bold text-[#14231F]">Citizen Report Text</h3>
          <p className="text-sm text-[#14231F] leading-relaxed p-3 rounded-xl bg-[#F5F8F7]">
            {ticket.text}
          </p>

          <div className="rounded-xl overflow-hidden border border-[#E3EAE7] aspect-video">
            <Img src={ticket.beforePhoto} alt={ticket.text} aspectRatio="aspect-video" className="w-full h-full" />
          </div>

          <CivicMap
            center={[ticket.lat, ticket.lng]}
            zoom={15}
            className="h-[200px]"
            markers={[{ id: ticket.id, position: [ticket.lat, ticket.lng], title: ticket.code }]}
          />
        </div>

        {/* Closure Panel if Resolved */}
        <div className="md:col-span-5 space-y-6">
          {ticket.status === 'resolved' && ticket.afterPhoto && (
            <div className="bg-white rounded-2xl p-6 border-2 border-[#1E8E6E]/40 shadow-civic-card space-y-4">
              <div>
                <h3 className="text-sm font-bold text-[#1E8E6E] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  Resolution Verification Panel
                </h3>
                <p className="text-xs text-[#6B7C77]">
                  Before-and-after photo evidence submitted by field crew
                </p>
              </div>

              <BeforeAfterSlider
                beforeSrc={ticket.beforePhoto}
                afterSrc={ticket.afterPhoto}
                beforeAlt="Before"
                afterAlt="After Fixed"
              />

              {/* Automated checks flags */}
              <div className="p-3 rounded-xl bg-[#F5F8F7] border border-[#E3EAE7] space-y-2 text-xs">
                <span className="font-bold text-[#14231F] block">{t('admin.closure.flagsTitle')}</span>
                <div className="flex items-center justify-between text-[#2E9E6B]">
                  <span className="flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>{t('admin.closure.flagLocation')}</span>
                  </span>
                  <span className="font-mono">14m delta</span>
                </div>
                <div className="flex items-center justify-between text-[#2E9E6B]">
                  <span className="flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>{t('admin.closure.flagCategory')}</span>
                  </span>
                  <span className="font-mono">Match (95%)</span>
                </div>
                <div className="flex items-center justify-between text-[#2E9E6B]">
                  <span className="flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>{t('admin.closure.flagSimilarity')}</span>
                  </span>
                  <span className="font-mono">Pass</span>
                </div>
                <p className="text-[10px] text-[#6B7C77] italic pt-1 border-t border-[#E3EAE7]">
                  {t('admin.closure.flagNotice')}
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <Button size="md" className="w-full" onClick={handleApproveClosure}>
                  {t('admin.closure.approve')}
                </Button>

                <div className="pt-2 border-t border-[#E3EAE7] space-y-2">
                  <input
                    type="text"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Reason if sending back to crew..."
                    className="w-full p-2 rounded-lg border border-[#E3EAE7] text-xs text-[#14231F]"
                  />
                  <Button size="sm" variant="secondary" className="w-full" onClick={handleSendBack}>
                    {t('admin.closure.sendBack')}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Audit trail */}
          <div className="bg-white rounded-2xl p-6 border border-[#E3EAE7] shadow-civic-card space-y-3">
            <h4 className="text-xs font-bold uppercase text-[#6B7C77]">Audit Events ({ticket.events.length})</h4>
            <div className="space-y-2 text-xs">
              {ticket.events.map((e, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-[#F5F8F7] border border-[#E3EAE7]">
                  <div className="flex justify-between font-semibold text-[#14231F]">
                    <span>{e.actor}</span>
                    <span className="text-[10px] font-mono text-[#6B7C77]">{new Date(e.at).toLocaleDateString()}</span>
                  </div>
                  <div className="text-[#1E8E6E] font-medium text-[11px]">{e.to}</div>
                  {e.note && <div className="text-[#6B7C77] text-[11px] mt-0.5">{e.note}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

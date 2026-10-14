import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Brain,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Check,
  Layers,
  MapPin,
  Sparkles,
  GitMerge,
  Eye,
  ShieldCheck,
  X
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Img } from '../../components/common/Img';
import { api } from '../../lib/api';
import { Ticket, CategoryId } from '../../types';
import { findDuplicateComplaints, DuplicateMatch } from '../../lib/triageModel';
import { AccountStore } from '../../lib/accountStore';

export const ReviewQueue: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'classification' | 'duplicates'>('classification');
  const [reviewTickets, setReviewTickets] = useState<Ticket[]>([]);
  const [allTickets, setAllTickets] = useState<Ticket[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<Record<number, CategoryId>>({});
  const [resolvingId, setResolvingId] = useState<number | null>(null);
  const [duplicateClusters, setDuplicateClusters] = useState<{
    parentTicket: Ticket;
    duplicates: DuplicateMatch[];
  }[]>([]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const loadData = () => {
    api.listTickets().then((data) => {
      setAllTickets(data);
      const items = data.filter((t) => t.needsReview);
      setReviewTickets(items);
      const initialMap: Record<number, CategoryId> = {};
      items.forEach((item) => {
        initialMap[item.id] = item.category;
      });
      setSelectedCategories(initialMap);

      // Scan for duplicate clusters among open tickets
      const clusters: { parentTicket: Ticket; duplicates: DuplicateMatch[] }[] = [];
      const seenIds = new Set<number>();

      for (const candidate of data) {
        if (candidate.status === 'resolved' || seenIds.has(candidate.id)) continue;

        const otherTickets = data.filter((t) => t.id !== candidate.id && !seenIds.has(t.id));
        const matches = findDuplicateComplaints(
          candidate.text,
          { lat: candidate.lat, lng: candidate.lng },
          candidate.category,
          otherTickets.map((t) => ({
            id: t.id,
            code: t.code,
            text: t.text,
            category: t.category,
            status: t.status,
            lat: t.lat,
            lng: t.lng,
            area: t.area
          })),
          0.60 // 60% similarity threshold for cluster review
        );

        if (matches.length > 0) {
          clusters.push({
            parentTicket: candidate,
            duplicates: matches
          });
          seenIds.add(candidate.id);
          matches.forEach((m) => seenIds.add(m.ticketId));
        }
      }
      setDuplicateClusters(clusters);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleResolveClassification = async (ticketId: number) => {
    setResolvingId(ticketId);
    const chosen = selectedCategories[ticketId] || 'road_damage';
    await api.resolveReview(ticketId, chosen);
    loadData();
    setResolvingId(null);
    showToast(`Dispatched ticket #${ticketId} with confirmed category: ${chosen}`);
  };

  const handleMergeCluster = (parentTicket: Ticket, duplicate: DuplicateMatch) => {
    // Record merge in audit store
    AccountStore.addAuditLog({
      actorName: 'Director Tariq Jameel',
      actorRole: 'admin',
      action: 'DUPLICATE_MERGED',
      targetType: 'ticket',
      targetId: String(duplicate.ticketId),
      targetName: duplicate.ticketCode,
      summary: `Merged duplicate report ${duplicate.ticketCode} into parent ticket ${parentTicket.code}`,
      details: `Similarity score was ${duplicate.similarityScore}%. Distance: ${duplicate.distanceMeters}m.`
    });

    // Remove from active cluster display
    setDuplicateClusters((prev) =>
      prev
        .map((c) => {
          if (c.parentTicket.id === parentTicket.id) {
            return {
              ...c,
              duplicates: c.duplicates.filter((d) => d.ticketId !== duplicate.ticketId)
            };
          }
          return c;
        })
        .filter((c) => c.duplicates.length > 0)
    );

    showToast(`Merged duplicate ${duplicate.ticketCode} into primary ticket ${parentTicket.code}. Recorded in audit log.`);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="p-3.5 rounded-2xl bg-[#E3F5EC] border border-[#C8EBD9] text-[#166F57] text-xs font-bold flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#1E8E6E]" />
            <span>{toastMsg}</span>
          </div>
          <button onClick={() => setToastMsg(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#14231F] flex items-center gap-2">
            <Brain className="w-6 h-6 text-[#1E8E6E]" />
            <span>AI Review & Deduplication Queue</span>
          </h1>
          <p className="text-xs text-[#6B7C77] mt-0.5">
            Resolve multimodal vision/NLP classification ambiguities and manage semantic duplicate complaint clusters
          </p>
        </div>

        {/* Tab switch buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white border border-[#E3EAE7] shadow-xs">
          <button
            onClick={() => setActiveTab('classification')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'classification'
                ? 'bg-[#1E8E6E] text-white shadow-xs'
                : 'text-[#6B7C77] hover:text-[#14231F]'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Model Conflicts ({reviewTickets.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('duplicates')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'duplicates'
                ? 'bg-[#1E8E6E] text-white shadow-xs'
                : 'text-[#6B7C77] hover:text-[#14231F]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Duplicate Clusters ({duplicateClusters.length})</span>
          </button>
        </div>
      </div>

      {/* 1. CLASSIFICATION CONFLICTS TAB */}
      {activeTab === 'classification' && (
        <>
          {reviewTickets.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-[#E3EAE7] shadow-sm space-y-2">
              <div className="w-12 h-12 rounded-full bg-[#E3F5EC] text-[#2E9E6B] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#14231F]">All Automated Classifications Clean</h3>
              <p className="text-xs text-[#6B7C77]">
                No ambiguous or conflicting municipal reports currently require human triage.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviewTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="bg-white rounded-3xl p-6 border border-[#E3EAE7] shadow-sm flex flex-col md:flex-row items-start md:items-center gap-6"
                >
                  <div className="w-28 h-28 rounded-2xl overflow-hidden shrink-0 border border-[#E3EAE7]">
                    <Img src={ticket.beforePhoto} alt={ticket.text} aspectRatio="aspect-square" className="w-full h-full" />
                  </div>

                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-[#14231F]">{ticket.code}</span>
                      <span className="px-2 py-0.5 rounded-full bg-[#FBE6E6] text-[#D64545] text-[11px] font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Model Disagreement</span>
                      </span>
                      <span className="text-xs text-[#6B7C77]">· {ticket.area}</span>
                    </div>

                    <p className="text-xs text-[#14231F] font-medium leading-relaxed bg-[#F5F8F7] p-2.5 rounded-xl">
                      "{ticket.text}"
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
                      <div>
                        <span className="text-[#6B7C77] block text-[10px]">Text NLP Guess:</span>
                        <strong className="text-[#14231F]">{ticket.predictedTextCategory}</strong>
                      </div>
                      <div>
                        <span className="text-[#6B7C77] block text-[10px]">Vision CNN Guess:</span>
                        <strong className="text-[#14231F]">{ticket.predictedImageCategory}</strong>
                      </div>
                      <div>
                        <span className="text-[#6B7C77] block text-[10px]">Confidence:</span>
                        <strong className="text-[#E8731A]">{(ticket.confidence * 100).toFixed(0)}%</strong>
                      </div>
                    </div>
                  </div>

                  {/* Action Controls */}
                  <div className="flex flex-col gap-2 shrink-0 w-full md:w-56 pt-2 md:pt-0 border-t md:border-t-0 border-[#E3EAE7]">
                    <label className="text-[11px] font-bold text-[#14231F]">
                      Select Ground Truth Category:
                    </label>
                    <select
                      value={selectedCategories[ticket.id] || ticket.category}
                      onChange={(e) =>
                        setSelectedCategories((prev) => ({
                          ...prev,
                          [ticket.id]: e.target.value as CategoryId
                        }))
                      }
                      className="px-3 py-2 rounded-xl border border-[#E3EAE7] bg-[#F5F8F7] text-xs font-semibold text-[#14231F]"
                    >
                      <option value="streetlight">{t('categories.streetlight')}</option>
                      <option value="road_damage">{t('categories.road_damage')}</option>
                      <option value="garbage">{t('categories.garbage')}</option>
                      <option value="water_leak">{t('categories.water_leak')}</option>
                      <option value="blocked_drain">{t('categories.blocked_drain')}</option>
                    </select>

                    <Button
                      size="sm"
                      onClick={() => handleResolveClassification(ticket.id)}
                      isLoading={resolvingId === ticket.id}
                      leftIcon={<Check className="w-3.5 h-3.5" />}
                      className="font-bold shadow-xs"
                    >
                      Confirm & Dispatch
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* 2. DUPLICATE CLUSTERS DEDUPLICATION TAB */}
      {activeTab === 'duplicates' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-700" />
                <span className="text-xs font-bold">
                  Open-Source Semantic Embedding & Geolocation Clustering
                </span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Tickets below have been mathematically flagged by the 128-dimensional subword embedding model as semantic duplicates within immediate geographic proximity.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-amber-900 bg-amber-100 px-2.5 py-1 rounded-lg shrink-0">
              {duplicateClusters.length} Active Cluster{duplicateClusters.length !== 1 ? 's' : ''}
            </span>
          </div>

          {duplicateClusters.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-[#E3EAE7] shadow-sm space-y-2">
              <CheckCircle2 className="w-10 h-10 text-[#1E8E6E] mx-auto" />
              <h3 className="text-base font-bold text-[#14231F]">No Unmerged Duplicate Clusters</h3>
              <p className="text-xs text-[#6B7C77]">
                All active complaints are currently unique and distinct. New duplicate clusters detected by the open-source engine will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {duplicateClusters.map((cluster, cIdx) => (
                <div
                  key={cIdx}
                  className="bg-white rounded-3xl p-6 border border-[#E3EAE7] shadow-sm space-y-4"
                >
                  {/* Primary Complaint Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E3EAE7]">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#14231F] text-white">
                          PRIMARY COMPLAINT
                        </span>
                        <span className="font-mono text-xs font-bold text-[#14231F]">
                          {cluster.parentTicket.code}
                        </span>
                        <span className="text-xs text-[#6B7C77]">· {cluster.parentTicket.area}</span>
                      </div>
                      <p className="text-xs text-[#14231F] font-semibold">
                        "{cluster.parentTicket.text}"
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="px-2.5 py-1 rounded-lg bg-[#E6F4EF] text-[#1E8E6E] font-bold">
                        Category: {cluster.parentTicket.category}
                      </span>
                    </div>
                  </div>

                  {/* Flagged Duplicates List */}
                  <div className="space-y-3 ps-2 sm:ps-4 border-s-2 border-amber-300">
                    <span className="text-[11px] font-extrabold uppercase text-[#6B7C77] tracking-wider block">
                      Detected Duplicate Grievances ({cluster.duplicates.length}):
                    </span>

                    {cluster.duplicates.map((dup) => (
                      <div
                        key={dup.ticketId}
                        className="p-3.5 rounded-2xl bg-[#F5F8F7] border border-[#E3EAE7] flex flex-col md:flex-row md:items-center justify-between gap-3"
                      >
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs font-bold text-[#14231F]">
                              {dup.ticketCode}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black border border-amber-200">
                              {dup.similarityScore}% SIMILARITY
                            </span>
                            {dup.distanceMeters < 99999 && (
                              <span className="text-[11px] text-[#6B7C77] flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-[#1E8E6E]" />
                                ~{dup.distanceMeters}m away
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-[#14231F]">"{dup.ticketText}"</p>

                          <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-[#6B7C77]">
                            {dup.matchReasons.map((r, rIdx) => (
                              <span key={rIdx} className="px-1.5 py-0.5 rounded bg-white border border-[#E3EAE7]">
                                {r}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Merge Button */}
                        <div className="shrink-0 flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-[#E3EAE7]">
                          <Button
                            size="sm"
                            onClick={() => handleMergeCluster(cluster.parentTicket, dup)}
                            className="flex items-center gap-1.5 font-bold shadow-xs"
                          >
                            <GitMerge className="w-3.5 h-3.5" />
                            <span>Merge into {cluster.parentTicket.code}</span>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

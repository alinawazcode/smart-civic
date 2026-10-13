import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Brain, CheckCircle2, AlertTriangle, ArrowRight, Check } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Img } from '../../components/common/Img';
import { api } from '../../lib/api';
import { Ticket, CategoryId } from '../../types';

export const ReviewQueue: React.FC = () => {
  const { t } = useTranslation();
  const [reviewTickets, setReviewTickets] = useState<Ticket[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<Record<number, CategoryId>>({});
  const [resolvingId, setResolvingId] = useState<number | null>(null);

  const loadReviewTickets = () => {
    api.listTickets().then((data) => {
      const items = data.filter((t) => t.needsReview);
      setReviewTickets(items);
      const initialMap: Record<number, CategoryId> = {};
      items.forEach((item) => {
        initialMap[item.id] = item.category;
      });
      setSelectedCategories(initialMap);
    });
  };

  useEffect(() => {
    loadReviewTickets();
  }, []);

  const handleResolve = async (ticketId: number) => {
    setResolvingId(ticketId);
    const chosen = selectedCategories[ticketId] || 'road_damage';
    await api.resolveReview(ticketId, chosen);
    loadReviewTickets();
    setResolvingId(null);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-extrabold text-[#14231F]">
          {t('admin.review.title')}
        </h1>
        <p className="text-xs text-[#6B7C77] mt-0.5">
          {t('admin.review.subtitle')}
        </p>
      </div>

      {reviewTickets.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-[#E3EAE7] shadow-civic-sm space-y-2">
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
              className="bg-white rounded-2xl p-6 border border-[#E3EAE7] shadow-civic-card flex flex-col md:flex-row items-start md:items-center gap-6"
            >
              <div className="w-28 h-28 rounded-xl overflow-hidden shrink-0 border border-[#E3EAE7]">
                <Img src={ticket.beforePhoto} alt={ticket.text} aspectRatio="aspect-square" className="w-full h-full" />
              </div>

              <div className="flex-1 space-y-2 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-[#14231F]">{ticket.code}</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#FBE6E6] text-[#D64545] text-[11px] font-bold">
                    ⚠️ Model Disagreement
                  </span>
                  <span className="text-xs text-[#6B7C77]">· {ticket.area}</span>
                </div>

                <p className="text-xs text-[#14231F] font-medium leading-relaxed bg-[#F5F8F7] p-2.5 rounded-lg">
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
                  className="px-3 py-2 rounded-lg border border-[#E3EAE7] bg-[#F5F8F7] text-xs font-semibold text-[#14231F]"
                >
                  <option value="streetlight">{t('categories.streetlight')}</option>
                  <option value="road_damage">{t('categories.road_damage')}</option>
                  <option value="garbage">{t('categories.garbage')}</option>
                  <option value="water_leak">{t('categories.water_leak')}</option>
                  <option value="blocked_drain">{t('categories.blocked_drain')}</option>
                </select>

                <Button
                  size="sm"
                  onClick={() => handleResolve(ticket.id)}
                  isLoading={resolvingId === ticket.id}
                  leftIcon={<Check className="w-3.5 h-3.5" />}
                >
                  Confirm & Dispatch
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Sliders,
  RotateCcw,
  Save,
  Check,
  ArrowUp,
  ArrowDown,
  Minus,
  Sparkles,
  Info,
  CheckCircle2
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { PriorityBadge } from '../../components/common/Badge';
import { api } from '../../lib/api';
import { ScoreWeights, Ticket } from '../../types';

export const WhatIfSandbox: React.FC = () => {
  const { t } = useTranslation();

  // Initial weights: 35, 25, 20, 20 (sum = 100)
  const defaultWeights: ScoreWeights = { safety: 35, people: 25, urgency: 20, repeat: 20 };
  const [weights, setWeights] = useState<ScoreWeights>(defaultWeights);
  const [previewTickets, setPreviewTickets] = useState<Array<Ticket & { oldScore: number; rankDiff: number }>>([]);
  const [isApplied, setIsApplied] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Normalize weights whenever a single slider changes
  const updateWeight = (key: keyof ScoreWeights, value: number) => {
    setIsApplied(false);
    const otherKeys = (['safety', 'people', 'urgency', 'repeat'] as const).filter((k) => k !== key);
    const remaining = 100 - value;
    const currentOtherSum = otherKeys.reduce((sum, k) => sum + weights[k], 0);

    const newWeights = { ...weights, [key]: value };

    if (currentOtherSum > 0) {
      otherKeys.forEach((k) => {
        newWeights[k] = Math.max(0, Math.round((weights[k] / currentOtherSum) * remaining));
      });
    } else {
      const split = Math.floor(remaining / 3);
      otherKeys.forEach((k) => {
        newWeights[k] = split;
      });
    }

    setWeights(newWeights);
  };

  useEffect(() => {
    api.whatIf(weights).then((results) => {
      setPreviewTickets(results);
    });
  }, [weights]);

  const handleReset = () => {
    setWeights(defaultWeights);
    setIsApplied(false);
    setFeedbackMsg('Weights reset to standard municipal default (35/25/20/20).');
    setTimeout(() => setFeedbackMsg(''), 3000);
  };

  const handleApply = async () => {
    await api.applyWeightsPermanently(weights);
    setIsApplied(true);
    setFeedbackMsg('New scoring weights successfully applied to live dispatch queue!');
    setTimeout(() => setFeedbackMsg(''), 4000);
  };

  const handleSavePreset = () => {
    localStorage.setItem('civiccare_weights_preset', JSON.stringify(weights));
    setFeedbackMsg('Weight configuration saved as municipal preset.');
    setTimeout(() => setFeedbackMsg(''), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#14231F]">
          {t('admin.whatIf.title')}
        </h1>
        <p className="text-xs text-[#6B7C77] mt-0.5">
          {t('admin.whatIf.subtitle')}
        </p>
      </div>

      {feedbackMsg && (
        <div className="p-3.5 rounded-xl bg-[#E3F5EC] border border-[#C8EBD9] text-[#2E9E6B] text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Main Sandbox Layout: Sliders (Left) & Live Re-Ranked Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Factor Sliders Card */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-[#E3EAE7] shadow-civic-card space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#14231F] flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#1E8E6E]" />
              Scoring Factor Weights
            </h3>
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#E6F4EF] text-[#1E8E6E]">
              Total: 100%
            </span>
          </div>

          <div className="space-y-5">
            {/* 1. Public Safety */}
            <div>
              <div className="flex justify-between text-xs font-bold text-[#14231F] mb-1.5">
                <span>{t('admin.whatIf.safety')}</span>
                <span className="font-mono text-[#E8731A]">{weights.safety}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="70"
                value={weights.safety}
                onChange={(e) => updateWeight('safety', Number(e.target.value))}
                className="w-full accent-[#E8731A] cursor-pointer"
              />
              <p className="text-[11px] text-[#6B7C77] mt-0.5">Physical hazard to pedestrians & vehicles</p>
            </div>

            {/* 2. Impact */}
            <div>
              <div className="flex justify-between text-xs font-bold text-[#14231F] mb-1.5">
                <span>{t('admin.whatIf.people')}</span>
                <span className="font-mono text-[#2F7DD1]">{weights.people}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="70"
                value={weights.people}
                onChange={(e) => updateWeight('people', Number(e.target.value))}
                className="w-full accent-[#2F7DD1] cursor-pointer"
              />
              <p className="text-[11px] text-[#6B7C77] mt-0.5">Dense residential / arterial road proximity</p>
            </div>

            {/* 3. Urgency */}
            <div>
              <div className="flex justify-between text-xs font-bold text-[#14231F] mb-1.5">
                <span>{t('admin.whatIf.urgency')}</span>
                <span className="font-mono text-[#B88A0B]">{weights.urgency}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="70"
                value={weights.urgency}
                onChange={(e) => updateWeight('urgency', Number(e.target.value))}
                className="w-full accent-[#B88A0B] cursor-pointer"
              />
              <p className="text-[11px] text-[#6B7C77] mt-0.5">Complaint age versus standard 72h SLA</p>
            </div>

            {/* 4. Frequency */}
            <div>
              <div className="flex justify-between text-xs font-bold text-[#14231F] mb-1.5">
                <span>{t('admin.whatIf.repeat')}</span>
                <span className="font-mono text-[#1E8E6E]">{weights.repeat}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="70"
                value={weights.repeat}
                onChange={(e) => updateWeight('repeat', Number(e.target.value))}
                className="w-full accent-[#1E8E6E] cursor-pointer"
              />
              <p className="text-[11px] text-[#6B7C77] mt-0.5">Spatial clusters & repeat citizen reports</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-[#E3EAE7] space-y-3">
            <div className="flex items-center gap-2">
              <Button size="sm" variant="secondary" className="flex-1" onClick={handleReset}>
                <RotateCcw className="w-3.5 h-3.5 me-1" />
                {t('admin.whatIf.reset')}
              </Button>
              <Button size="sm" variant="secondary" className="flex-1" onClick={handleSavePreset}>
                <Save className="w-3.5 h-3.5 me-1" />
                {t('admin.whatIf.savePreset')}
              </Button>
            </div>

            <Button size="lg" className="w-full shadow-md" onClick={handleApply}>
              <Check className="w-4 h-4 me-1" />
              {t('admin.whatIf.apply')}
            </Button>

            <div className="p-3 rounded-xl bg-[#F5F8F7] border border-[#E3EAE7] text-[11px] text-[#6B7C77] flex items-center gap-2">
              <Info className="w-4 h-4 text-[#1E8E6E] shrink-0" />
              <span>
                {isApplied ? 'Live queue updated!' : t('admin.whatIf.notice')}
              </span>
            </div>
          </div>
        </div>

        {/* Live Re-Ranked Preview List (Right) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-[#E3EAE7] shadow-civic-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#14231F]">
                Live Re-Ranked Dispatch Preview
              </h3>
              <p className="text-xs text-[#6B7C77]">
                Visual rank difference arrows show tickets moving up or down
              </p>
            </div>
            <span className="text-xs text-[#6B7C77]">
              Showing top {previewTickets.length}
            </span>
          </div>

          <div className="space-y-2.5 max-h-[580px] overflow-y-auto pe-1">
            {previewTickets.map((t, index) => {
              const movedUp = t.rankDiff > 0;
              const movedDown = t.rankDiff < 0;

              return (
                <div
                  key={t.id}
                  className="p-3.5 rounded-xl border border-[#E3EAE7] bg-[#F5F8F7]/50 hover:bg-[#F5F8F7] transition-all flex items-center justify-between gap-3"
                >
                  {/* Rank number & movement arrow */}
                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className="font-mono font-bold text-xs text-[#6B7C77] w-5 text-center">
                      #{index + 1}
                    </span>
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs">
                      {movedUp ? (
                        <span className="text-[#2E9E6B] font-bold flex items-center text-[10px]">
                          <ArrowUp className="w-3.5 h-3.5" />+{t.rankDiff}
                        </span>
                      ) : movedDown ? (
                        <span className="text-[#D64545] font-bold flex items-center text-[10px]">
                          <ArrowDown className="w-3.5 h-3.5" />{t.rankDiff}
                        </span>
                      ) : (
                        <span className="text-[#6B7C77]">
                          <Minus className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Ticket Summary */}
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#14231F]">{t.code}</span>
                      <PriorityBadge priority={t.priorityLabel} />
                      <span className="text-[11px] text-[#6B7C77] truncate">{t.area}</span>
                    </div>
                    <p className="text-xs text-[#14231F] truncate font-medium">
                      {t.text}
                    </p>
                  </div>

                  {/* Old vs New Score */}
                  <div className="text-end shrink-0">
                    <div className="font-mono font-extrabold text-sm text-[#1E8E6E]">
                      {t.priorityScore}
                    </div>
                    <div className="text-[10px] text-[#6B7C77] font-mono line-through">
                      was {t.oldScore}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

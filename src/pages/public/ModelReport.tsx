import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Brain, Sparkles, CheckCircle2, AlertOctagon, HelpCircle, Layers, Info } from 'lucide-react';
import { Img } from '../../components/common/Img';
import { api } from '../../lib/api';

export const ModelReport: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'confusionMatrix' | 'failureCases'>('overview');
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api.modelReport().then((res) => setData(res));
  }, []);

  const categories = [
    { id: 'streetlight', label: 'Streetlights' },
    { id: 'road_damage', label: 'Roads & Potholes' },
    { id: 'garbage', label: 'Garbage' },
    { id: 'water_leak', label: 'Water Leak' },
    { id: 'blocked_drain', label: 'Blocked Drain' }
  ];

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6F4EF] text-[#166F57] text-xs font-semibold">
            <Brain className="w-3.5 h-3.5 text-[#1E8E6E]" />
            <span>AI Transparency & Verification</span>
          </span>
          <span className="text-[11px] font-bold text-[#6B7C77] bg-[#F5F8F7] px-2.5 py-0.5 rounded border border-[#E3EAE7]">
            {t('brand.sampleData')}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#14231F]">
          {t('modelReport.title')}
        </h1>
        <p className="text-sm text-[#6B7C77] mt-1">
          {t('modelReport.subtitle')}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E3EAE7] overflow-x-auto pb-px">
        {[
          { id: 'overview', label: t('modelReport.tabs.overview') },
          { id: 'performance', label: t('modelReport.tabs.performance') },
          { id: 'confusionMatrix', label: t('modelReport.tabs.confusionMatrix') },
          { id: 'failureCases', label: t('modelReport.tabs.failureCases') }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? 'border-[#1E8E6E] text-[#1E8E6E]'
                : 'border-transparent text-[#6B7C77] hover:text-[#14231F]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-[#E3EAE7] shadow-civic-sm space-y-2">
              <div className="w-9 h-9 rounded-xl bg-[#E6F4EF] text-[#1E8E6E] flex items-center justify-center font-bold">
                1
              </div>
              <h3 className="text-base font-bold text-[#14231F]">Vision Classifier</h3>
              <p className="text-xs text-[#6B7C77] leading-relaxed">
                Fine-tuned MobileNet/ViT backbone evaluated on municipal infrastructure imagery across illumination variants (day/night streetlights, pavement cracks).
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#E3EAE7] shadow-civic-sm space-y-2">
              <div className="w-9 h-9 rounded-xl bg-[#E6F4EF] text-[#1E8E6E] flex items-center justify-center font-bold">
                2
              </div>
              <h3 className="text-base font-bold text-[#14231F]">Trilingual NLP Pipeline</h3>
              <p className="text-xs text-[#6B7C77] leading-relaxed">
                Handles English, Urdu Nastaliq, and Roman Urdu dialect colloquialisms ("nala band", "tar toota", "road kharab") with zero-shot domain mapping.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#E3EAE7] shadow-civic-sm space-y-2">
              <div className="w-9 h-9 rounded-xl bg-[#E6F4EF] text-[#1E8E6E] flex items-center justify-center font-bold">
                3
              </div>
              <h3 className="text-base font-bold text-[#14231F]">Multimodal Late Fusion</h3>
              <p className="text-xs text-[#6B7C77] leading-relaxed">
                Combines vision and text logits. Discrepancies below 70% threshold automatically route to the human <strong>Review Queue</strong> before dispatch.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#F5F8F7] border border-[#E3EAE7] flex items-center gap-3 text-xs text-[#6B7C77]">
            <Info className="w-4 h-4 text-[#1E8E6E] shrink-0" />
            <span>
              All classification numbers shown on this screen reflect offline test splits ({t('brand.sampleData')}). Real production telemetry will stream via WebSocket upon full model deployment.
            </span>
          </div>
        </div>
      )}

      {/* TAB 2: Performance Metrics (Screen 6) */}
      {(activeTab === 'performance' || activeTab === 'overview') && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-[#E3EAE7] shadow-civic-card">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-[#6B7C77] uppercase tracking-wider">
                  {t('modelReport.metrics.accuracy')}
                </span>
                <span className="text-[10px] text-[#6B7C77] bg-[#F5F8F7] px-1.5 py-0.5 rounded font-mono">
                  {t('brand.sampleData')}
                </span>
              </div>
              <div className="text-3xl font-extrabold text-[#1E8E6E] font-mono">
                {data?.metrics?.accuracy || 86.7}%
              </div>
              <p className="text-xs text-[#6B7C77] mt-1">Evaluated on 4,200 labeled cases</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#E3EAE7] shadow-civic-card">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-[#6B7C77] uppercase tracking-wider">
                  {t('modelReport.metrics.precision')}
                </span>
                <span className="text-[10px] text-[#6B7C77] bg-[#F5F8F7] px-1.5 py-0.5 rounded font-mono">
                  {t('brand.sampleData')}
                </span>
              </div>
              <div className="text-3xl font-extrabold text-[#14231F] font-mono">
                {data?.metrics?.precision || 87.2}%
              </div>
              <p className="text-xs text-[#6B7C77] mt-1">Weighted across 5 classes</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#E3EAE7] shadow-civic-card">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-[#6B7C77] uppercase tracking-wider">
                  {t('modelReport.metrics.recall')}
                </span>
                <span className="text-[10px] text-[#6B7C77] bg-[#F5F8F7] px-1.5 py-0.5 rounded font-mono">
                  {t('brand.sampleData')}
                </span>
              </div>
              <div className="text-3xl font-extrabold text-[#14231F] font-mono">
                {data?.metrics?.recall || 85.9}%
              </div>
              <p className="text-xs text-[#6B7C77] mt-1">Macro sensitivity</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#E3EAE7] shadow-civic-card">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-[#6B7C77] uppercase tracking-wider">
                  {t('modelReport.metrics.f1')}
                </span>
                <span className="text-[10px] text-[#6B7C77] bg-[#F5F8F7] px-1.5 py-0.5 rounded font-mono">
                  {t('brand.sampleData')}
                </span>
              </div>
              <div className="text-3xl font-extrabold text-[#1E8E6E] font-mono">
                {data?.metrics?.f1 || 86.5}%
              </div>
              <p className="text-xs text-[#6B7C77] mt-1">Harmonic mean balance</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Confusion Matrix (Screen 6) */}
      {(activeTab === 'confusionMatrix' || activeTab === 'overview') && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E3EAE7] shadow-civic-card space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-[#14231F]">
                Normalized Confusion Matrix
              </h3>
              <p className="text-xs text-[#6B7C77]">
                {t('modelReport.matrixDesc')}
              </p>
            </div>
            <span className="text-[11px] font-mono text-[#6B7C77] bg-[#F5F8F7] px-2.5 py-1 rounded border border-[#E3EAE7] self-start">
              {t('brand.sampleData')}
            </span>
          </div>

          {/* Heatmap Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-center border-collapse">
              <thead>
                <tr>
                  <th className="p-2.5 text-start font-semibold text-[#6B7C77] border-b border-[#E3EAE7]">
                    Actual \ Predicted
                  </th>
                  {categories.map((c) => (
                    <th key={c.id} className="p-2.5 font-bold text-[#14231F] border-b border-[#E3EAE7]">
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data?.confusionMatrix?.map((row: any, i: number) => (
                  <tr key={row.actual} className="border-b border-[#E3EAE7]/60">
                    <td className="p-2.5 text-start font-bold text-[#14231F] whitespace-nowrap bg-[#F5F8F7]/50">
                      {categories[i]?.label}
                    </td>
                    {categories.map((col) => {
                      const val = row[col.id] || 0;
                      const isDiagonal = row.actual === col.id;
                      // Heatmap color intensity
                      const bgIntensity = isDiagonal
                        ? `rgba(30, 142, 110, ${Math.max(0.15, val)})`
                        : val > 0.05
                        ? `rgba(232, 115, 26, ${val * 3})`
                        : 'transparent';

                      return (
                        <td
                          key={col.id}
                          className="p-3 font-mono font-medium transition-colors"
                          style={{ backgroundColor: bgIntensity }}
                        >
                          <span className={isDiagonal ? 'font-bold text-[#14231F]' : 'text-[#6B7C77]'}>
                            {(val * 100).toFixed(1)}%
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Recent Failure Cases (Screen 6) */}
      {(activeTab === 'failureCases' || activeTab === 'overview') && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E3EAE7] shadow-civic-card space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#14231F]">
                {t('modelReport.failure.title')}
              </h3>
              <p className="text-xs text-[#6B7C77]">
                {t('modelReport.failure.desc')}
              </p>
            </div>
            <span className="text-[11px] font-mono text-[#6B7C77] bg-[#F5F8F7] px-2.5 py-1 rounded border border-[#E3EAE7]">
              {t('brand.sampleData')}
            </span>
          </div>

          <div className="space-y-4">
            {data?.failureCases?.map((item: any) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-[#E3EAE7] bg-[#F5F8F7]/40 flex flex-col md:flex-row items-start md:items-center gap-4"
              >
                <div className="w-24 h-24 rounded-lg overflow-hidden shrink-0 border border-[#E3EAE7]">
                  <Img src={item.photo} alt={item.text} aspectRatio="aspect-square" className="w-full h-full" />
                </div>

                <div className="flex-1 space-y-1.5 min-w-0">
                  <p className="text-sm font-semibold text-[#14231F] italic">
                    "{item.text}"
                  </p>
                  <p className="text-xs text-[#6B7C77]">
                    <strong className="text-[#14231F]">Root Cause:</strong> {item.reason}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                    <span className="px-2 py-0.5 rounded bg-[#FBE6E6] text-[#D64545] font-semibold">
                      Predicted: {t(`categories.${item.predicted}`)}
                    </span>
                    <span className="text-[#6B7C77]">vs</span>
                    <span className="px-2 py-0.5 rounded bg-[#E3F5EC] text-[#2E9E6B] font-semibold">
                      Ground Truth: {t(`categories.${item.actual}`)}
                    </span>
                    <span className="text-[#6B7C77] font-mono">
                      (Conf: {(item.confidence * 100).toFixed(0)}%)
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

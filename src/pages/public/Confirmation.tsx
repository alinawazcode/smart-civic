import React, { useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Copy, Check, QrCode, ArrowRight, Layers, Sparkles, Clock, Shield } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '../../components/common/Button';

export const Confirmation: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const location = useLocation();
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const displayCode = code || 'CC-2026-001280';
  const mergedWithCluster = (location.state as any)?.mergedWithCluster;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(displayCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const trackUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/track/${displayCode}`;

  return (
    <div className="max-w-[700px] mx-auto px-4 sm:px-6 py-6 sm:py-12 space-y-8">
      {/* Success Badge & Heading (Screen 3) */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-[#E3F5EC] text-[#2E9E6B] mx-auto flex items-center justify-center shadow-sm">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#14231F]">
          {t('confirmation.title')}
        </h1>
        <p className="text-sm text-[#6B7C77] max-w-md mx-auto">
          {t('confirmation.subtitle')}
        </p>
      </div>

      {/* Pin-merge animation alert if joined cluster */}
      {mergedWithCluster && (
        <div className="p-4 rounded-xl bg-[#E6F4EF] border border-[#1E8E6E]/30 text-[#166F57] text-sm flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#1E8E6E] text-white flex items-center justify-center shrink-0 animate-bounce">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold block">Cluster Deduplication Merged!</span>
            <span className="text-xs text-[#166F57]">
              {t('confirmation.mergedNotice')}
            </span>
          </div>
        </div>
      )}

      {/* Large Copyable Code Card with QR Code */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E3EAE7] shadow-civic-card space-y-6 text-center">
        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#6B7C77]">
            {t('confirmation.codeLabel')}
          </span>
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#1E8E6E] font-mono tracking-wider px-4 py-2 rounded-xl bg-[#E6F4EF] border border-[#C2E7DA] select-all isolate-ltr">
              {displayCode}
            </span>
            <button
              onClick={handleCopyCode}
              className="p-2.5 rounded-xl border border-[#E3EAE7] text-[#14231F] hover:bg-[#F5F8F7] hover:border-[#1E8E6E] transition-colors cursor-pointer"
              title={t('confirmation.copyCode')}
              aria-label={t('confirmation.copyCode')}
            >
              {copied ? <Check className="w-5 h-5 text-[#2E9E6B]" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
          {copied && (
            <p className="text-xs text-[#2E9E6B] font-semibold animate-fade-in">
              {t('confirmation.copied')}
            </p>
          )}
        </div>

        {/* QR Code */}
        <div className="p-4 rounded-xl bg-[#F5F8F7] border border-[#E3EAE7] max-w-xs mx-auto space-y-3">
          <div className="bg-white p-3 rounded-lg inline-block border border-[#E3EAE7] shadow-sm">
            <QRCodeSVG value={trackUrl} size={130} level="M" />
          </div>
          <p className="text-xs text-[#6B7C77]">
            {t('confirmation.qrCodeTitle')}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link to={`/track/${displayCode}`} className="w-full sm:w-auto">
            <Button size="lg" className="w-full">
              {t('confirmation.viewDetails')}
            </Button>
          </Link>
          <Link to="/report" className="w-full sm:w-auto">
            <Button size="lg" variant="secondary" className="w-full">
              {t('confirmation.trackAnother')}
            </Button>
          </Link>
        </div>
      </div>

      {/* "What happens next?" Panel with 4 items */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E3EAE7] shadow-civic-sm space-y-4">
        <h3 className="text-base font-bold text-[#14231F]">
          {t('confirmation.nextStepsTitle')}
        </h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-[#E6F4EF] text-[#1E8E6E] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
              1
            </span>
            <p className="text-sm text-[#6B7C77]">
              {t('confirmation.step1')}
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-[#E6F4EF] text-[#1E8E6E] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
              2
            </span>
            <p className="text-sm text-[#6B7C77]">
              {t('confirmation.step2')}
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-[#E6F4EF] text-[#1E8E6E] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
              3
            </span>
            <p className="text-sm text-[#6B7C77]">
              {t('confirmation.step3')}
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-[#E6F4EF] text-[#1E8E6E] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
              4
            </span>
            <p className="text-sm text-[#6B7C77]">
              {t('confirmation.step4')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

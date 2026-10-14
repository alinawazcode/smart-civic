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

        {/* QR Code with Official Verification Pass Download */}
        <div className="p-5 rounded-2xl bg-[#F5F8F7] border border-[#E3EAE7] max-w-sm mx-auto space-y-3.5">
          <div className="bg-white p-3 rounded-xl inline-block border border-[#E3EAE7] shadow-sm">
            <QRCodeSVG id="civic-qr-code" value={trackUrl} size={140} level="H" />
          </div>
          <p className="text-xs text-[#6B7C77] leading-relaxed">
            Scan with any camera or WhatsApp to track complaint resolution live.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1">
            <button
              onClick={() => {
                const canvas = document.createElement('canvas');
                canvas.width = 600;
                canvas.height = 760;
                const ctx = canvas.getContext('2d');
                if (!ctx) return;

                // White canvas background
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, 600, 760);

                // Pakistani dark green header
                ctx.fillStyle = '#166F57';
                ctx.fillRect(0, 0, 600, 115);

                // Header text
                ctx.fillStyle = '#FFFFFF';
                ctx.font = 'bold 19px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('ISLAMIC REPUBLIC OF PAKISTAN', 300, 44);

                ctx.font = '14px sans-serif';
                ctx.fillText('Smart Civic Complaint Triage & Municipal Dispatch', 300, 72);

                ctx.font = '12px sans-serif';
                ctx.fillStyle = '#C8EBD9';
                ctx.fillText('Official Citizen Grievance Verification Pass', 300, 95);

                // Card frame
                ctx.strokeStyle = '#E3EAE7';
                ctx.lineWidth = 2;
                ctx.strokeRect(30, 135, 540, 590);

                // Code Banner
                ctx.fillStyle = '#E6F4EF';
                ctx.fillRect(50, 155, 500, 65);

                ctx.fillStyle = '#166F57';
                ctx.font = 'bold 28px monospace';
                ctx.fillText(displayCode, 300, 198);

                // Export QR from DOM SVG
                const qrSvg = document.getElementById('civic-qr-code');
                if (qrSvg) {
                  const xml = new XMLSerializer().serializeToString(qrSvg);
                  const svg64 = btoa(xml);
                  const b64Start = 'data:image/svg+xml;base64,';
                  const img = new Image();
                  img.onload = () => {
                    ctx.drawImage(img, 185, 240, 230, 230);

                    // Sub details
                    ctx.fillStyle = '#14231F';
                    ctx.font = 'bold 16px sans-serif';
                    ctx.fillText('Scan to Track Live SLA & Repair Progress', 300, 505);

                    ctx.fillStyle = '#6B7C77';
                    ctx.font = '13px sans-serif';
                    ctx.fillText(`Issued: ${new Date().toLocaleDateString('en-PK')} · 24-72h SLA Target`, 300, 535);
                    ctx.fillText(`Direct Verification: ${trackUrl}`, 300, 560);

                    // Green stamp
                    ctx.fillStyle = '#1E8E6E';
                    ctx.font = 'bold 13px sans-serif';
                    ctx.fillText('Verified Citizen Record · Karachi Municipal Command', 300, 665);

                    const link = document.createElement('a');
                    link.download = `CivicPass-${displayCode}.png`;
                    link.href = canvas.toDataURL('image/png');
                    link.click();
                  };
                  img.src = b64Start + svg64;
                }
              }}
              className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-[#1E8E6E] hover:bg-[#166F57] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Download QR Pass (PNG)</span>
            </button>

            <button
              onClick={() => window.print()}
              className="w-full sm:w-auto px-3 py-2 rounded-xl border border-[#E3EAE7] bg-white text-xs font-semibold text-[#14231F] hover:bg-[#F5F8F7] transition-colors"
            >
              Print Receipt
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link to={`/track/${displayCode}`} className="w-full sm:w-auto">
            <Button size="lg" className="w-full font-bold shadow-md">
              {t('confirmation.viewDetails')}
            </Button>
          </Link>
          <button
            onClick={() => {
              const msg = `Smart Civic Complaint ${displayCode} has been logged. Track repair progress here: ${trackUrl}`;
              window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
            }}
            className="w-full sm:w-auto px-5 py-3 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 text-sm font-bold hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2"
          >
            <span>Share via WhatsApp</span>
          </button>
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

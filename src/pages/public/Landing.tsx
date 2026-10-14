import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Clock,
  MapPin,
  Zap,
  Layers,
  Sparkles,
  Bot,
  Activity,
  Check,
  Cpu,
  ShieldAlert,
  Flame,
  TrendingUp
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { PriorityBadge } from '../../components/common/Badge';
import { Img } from '../../components/common/Img';
import { BeforeAfterSlider } from '../../components/common/BeforeAfterSlider';
import { PakistanFlag } from '../../components/common/FlagIcons';
import { api } from '../../lib/api';

export const Landing: React.FC = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState({ total: 12480, resolved: 10890, inProgress: 1240, onTimeRate: 98.2 });
  const [countUp, setCountUp] = useState({ total: 0, resolved: 0, inProgress: 0 });

  // 3D tilt state for hero floating card
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    api.stats().then((s) => {
      setStats(s);
    });
  }, []);

  // Simple count-up effect on mount
  useEffect(() => {
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReduced) {
      setCountUp({ total: stats.total, resolved: stats.resolved, inProgress: stats.inProgress });
      return;
    }

    const duration = 1200;
    const start = performance.now();
    const frame = (time: number) => {
      const progress = Math.min((time - start) / duration, 1);
      setCountUp({
        total: Math.floor(progress * stats.total),
        resolved: Math.floor(progress * stats.resolved),
        inProgress: Math.floor(progress * stats.inProgress)
      });
      if (progress < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }, [stats]);

  const handleHeroMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: x * 16, y: -y * 16 });
  };

  const handleHeroMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-12">
      {/* 1. Hero Section with 3D Card Tilt, Glassmorphism & AI Triage Badges */}
      <section className="relative pt-6 sm:pt-12">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              {/* Catchy Pakistani Civic Tagline & Regional Banner */}
              <div className="flex items-center gap-2 text-xs font-bold text-[#1E8E6E]">
                <PakistanFlag className="w-5 h-3.5" />
                <span className="tracking-wide">{t('brand.tagline')}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#14231F] leading-[1.15]" style={{ textWrap: 'balance' }}>
                {t('brand.heroTitle')}
              </h1>

              <p className="text-base sm:text-lg text-[#6B7C77] leading-relaxed max-w-xl">
                {t('brand.heroDesc')}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link to="/report">
                  <Button size="lg" className="shadow-[0_8px_24px_rgba(30,142,110,0.32)] hover:shadow-[0_12px_32px_rgba(30,142,110,0.45)] hover:scale-102 transition-all font-bold">
                    {t('home.reportCta')}
                  </Button>
                </Link>
                <Link to="/track">
                  <Button size="lg" variant="secondary" className="hover:border-[#1E8E6E] hover:text-[#1E8E6E] transition-all font-bold">
                    {t('home.trackCta')}
                  </Button>
                </Link>
              </div>

              {/* Clean Trust Metadata with Typographic Separators (Zero Pill Discipline) */}
              <div className="pt-4 flex flex-wrap items-center gap-3 text-xs text-[#6B7C77]">
                <span className="font-semibold text-[#14231F]">98.4% Triage Precision</span>
                <span aria-hidden="true" className="text-[#A3B8B0]">·</span>
                <span className="font-semibold text-[#14231F]">50m Spatial Clustering</span>
                <span aria-hidden="true" className="text-[#A3B8B0]">·</span>
                <span className="font-semibold text-[#14231F]">24-72h Municipal SLA Guarantee</span>
              </div>
            </div>

            {/* Right Hero Visual with 3D Tilt & Glassmorphic Highlight Card */}
            <div
              className="lg:col-span-5 relative"
              onMouseMove={handleHeroMouseMove}
              onMouseLeave={handleHeroMouseLeave}
            >
              <div className="relative rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.18)] border border-white/60 aspect-[4/3] group cursor-pointer">
                {/* Real Pakistani City Thoroughfare Photo (Changes saturation & contrast on hover) */}
                <Img
                  src="/images/hero-street.jpg"
                  alt="City thoroughfare street in Karachi Shahrah-e-Faisal"
                  aspectRatio="aspect-[4/3]"
                  className="w-full h-full"
                  containerClassName="rounded-3xl"
                />
                
                {/* Subtle dark to transparent glass gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent pointer-events-none" />

                {/* AI Detection Tag Pin on Image */}
                <div className="absolute top-4 start-4 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[11px] font-bold text-[#14231F] shadow-sm border border-white/80">
                  <Cpu className="w-3 h-3 text-[#1E8E6E]" />
                  <span>AI Computer Vision Verified</span>
                </div>

                {/* Floating 3D Tilt Glass Card */}
                <div
                  className="absolute bottom-4 inset-x-4 sm:inset-x-5 p-4 rounded-2xl bg-white/90 backdrop-blur-xl border border-white/80 shadow-[0_16px_40px_rgba(0,0,0,0.35)] transition-transform duration-200 ease-out hover:border-[#1E8E6E]/60 hover:shadow-[0_20px_45px_rgba(30,142,110,0.3)]"
                  style={{
                    transform: `perspective(1000px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) translateZ(12px)`
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-white/60 shadow-xs">
                      <Img
                        src="/images/issue-streetlight-night.jpg"
                        alt="Broken streetlight report photo"
                        aspectRatio="aspect-square"
                        className="w-full h-full"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-mono font-bold text-[#6B7C77]">
                          CC-2026-001238
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#FDEBD8] text-[#E8731A]">
                            AI Score: 92/100
                          </span>
                          <PriorityBadge priority="high" />
                        </div>
                      </div>
                      <h4 className="text-sm font-bold text-[#14231F] truncate">
                        {t('home.heroCard.title')}
                      </h4>
                      <div className="flex items-center justify-between text-xs text-[#6B7C77] mt-0.5">
                        <span className="truncate flex items-center gap-1 font-medium">
                          <MapPin className="w-3 h-3 text-[#1E8E6E]" />
                          {t('home.heroCard.location')}
                        </span>
                        <span className="text-[#1E8E6E] font-bold shrink-0">
                          3 duplicate reports merged
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Glassmorphic Municipal Stats with Hover Color Shift */}
      <section className="max-w-[1240px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-6 sm:p-8 rounded-3xl bg-white/80 backdrop-blur-md border border-white/80 shadow-[0_10px_30px_rgba(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_16px_40px_rgba(30,142,110,0.12)]">
          <div className="text-center sm:text-start border-b sm:border-b-0 sm:border-e border-[#E3EAE7] pb-4 sm:pb-0 sm:pe-6 group">
            <div className="text-xs font-bold uppercase tracking-wider text-[#6B7C77] mb-1 group-hover:text-[#1E8E6E] transition-colors">
              {t('home.stats.total')}
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#14231F] font-mono group-hover:text-[#1E8E6E] transition-colors">
              {countUp.total.toLocaleString()}
            </div>
            <div className="text-xs text-[#1E8E6E] mt-1 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>Citywide reports logged</span>
            </div>
          </div>

          <div className="text-center sm:text-start border-b sm:border-b-0 sm:border-e border-[#E3EAE7] pb-4 sm:pb-0 sm:pe-6 group">
            <div className="text-xs font-bold uppercase tracking-wider text-[#6B7C77] mb-1 group-hover:text-[#2E9E6B] transition-colors">
              {t('home.stats.resolved')}
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#2E9E6B] font-mono group-hover:scale-105 transition-transform origin-left">
              {countUp.resolved.toLocaleString()}
            </div>
            <div className="text-xs text-[#2E9E6B] mt-1 font-semibold">87.3% verified resolved</div>
          </div>

          <div className="text-center sm:text-start border-b sm:border-b-0 sm:border-e border-[#E3EAE7] pb-4 sm:pb-0 sm:pe-6 group">
            <div className="text-xs font-bold uppercase tracking-wider text-[#6B7C77] mb-1 group-hover:text-[#2F7DD1] transition-colors">
              {t('home.stats.inProgress')}
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#2F7DD1] font-mono group-hover:scale-105 transition-transform origin-left">
              {countUp.inProgress.toLocaleString()}
            </div>
            <div className="text-xs text-[#2F7DD1] mt-1 font-semibold">Active crew dispatch</div>
          </div>

          <div className="text-center sm:text-start pt-2 sm:pt-0 group">
            <div className="text-xs font-bold uppercase tracking-wider text-[#6B7C77] mb-1 group-hover:text-[#1E8E6E] transition-colors">
              {t('home.stats.onTime')}
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#1E8E6E] font-mono group-hover:scale-105 transition-transform origin-left">
              {stats.onTimeRate}%
            </div>
            <div className="text-xs text-[#6B7C77] mt-1 font-semibold">Standard 72h SLA rate</div>
          </div>
        </div>
      </section>

      {/* 3. Real Pakistani Municipal Infrastructure Showcase (Real photos, color shift on hover) */}
      <section className="max-w-[1240px] mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6F4EF] text-[#166F57] text-xs font-bold mb-2">
            <Activity className="w-3.5 h-3.5 text-[#1E8E6E]" />
            <span>Real Municipal Works Across Pakistan</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#14231F]">
            Field Teams in Action · Real Civic Impact
          </h2>
          <p className="text-sm sm:text-base text-[#6B7C77] mt-1">
            Real photography of Karachi, Lahore, and Islamabad municipal operations responding to citizen reports
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Solid Waste Management in Karachi */}
          <div className="group rounded-3xl bg-white/90 backdrop-blur-md p-4 border border-[#E3EAE7] shadow-sm hover:shadow-[0_16px_36px_rgba(30,142,110,0.25)] hover:border-[#1E8E6E] transition-all duration-300">
            <div className="rounded-2xl overflow-hidden mb-3.5 aspect-video relative">
              <Img
                src="/images/pakistan-sanitation.jpg"
                alt="Karachi Municipal Solid Waste Management Truck and Sanitation Crew"
                aspectRatio="aspect-video"
                className="w-full h-full"
              />
              <div className="absolute top-2.5 start-2.5 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-[11px] font-bold">
                KMC Sanitation Unit
              </div>
            </div>
            <h3 className="text-base font-bold text-[#14231F] group-hover:text-[#1E8E6E] transition-colors">
              Solid Waste & Bin Clearance
            </h3>
            <p className="text-xs text-[#6B7C77] mt-1 leading-relaxed">
              Real-time dispatch of municipal garbage compactor trucks and sanitary staff to remove road waste clusters within 18 hours.
            </p>
            <div className="mt-3 pt-3 border-t border-[#E3EAE7] flex items-center justify-between text-xs font-semibold text-[#1E8E6E]">
              <span>Avg SLA: 18 hours</span>
              <span>100% Photo Verified</span>
            </div>
          </div>

          {/* Card 2: Underground Pipeline & Sewerage Repair */}
          <div className="group rounded-3xl bg-white/90 backdrop-blur-md p-4 border border-[#E3EAE7] shadow-sm hover:shadow-[0_16px_36px_rgba(47,125,209,0.25)] hover:border-[#2F7DD1] transition-all duration-300">
            <div className="rounded-2xl overflow-hidden mb-3.5 aspect-video relative">
              <Img
                src="/images/pakistan-water.jpg"
                alt="Karachi Water and Sewerage Board Pipeline Repair"
                aspectRatio="aspect-video"
                className="w-full h-full"
              />
              <div className="absolute top-2.5 start-2.5 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-[11px] font-bold">
                KW&SB Drainage Crew
              </div>
            </div>
            <h3 className="text-base font-bold text-[#14231F] group-hover:text-[#2F7DD1] transition-colors">
              Water & Sewerage Drainage
            </h3>
            <p className="text-xs text-[#6B7C77] mt-1 leading-relaxed">
              Excavation and culvert unclogging teams resolving standing water hazards, burst pipes, and open manhole perils.
            </p>
            <div className="mt-3 pt-3 border-t border-[#E3EAE7] flex items-center justify-between text-xs font-semibold text-[#2F7DD1]">
              <span>Emergency SLA: 24h</span>
              <span>Public Safety Priority</span>
            </div>
          </div>

          {/* Card 3: Modern Boulevard & CDA Road Infrastructure */}
          <div className="group rounded-3xl bg-white/90 backdrop-blur-md p-4 border border-[#E3EAE7] shadow-sm hover:shadow-[0_16px_36px_rgba(232,115,26,0.25)] hover:border-[#E8731A] transition-all duration-300">
            <div className="rounded-2xl overflow-hidden mb-3.5 aspect-video relative">
              <Img
                src="/images/pakistan-boulevard.jpg"
                alt="Islamabad CDA Secretariat Modern Boulevard and Streetlights"
                aspectRatio="aspect-video"
                className="w-full h-full"
              />
              <div className="absolute top-2.5 start-2.5 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-[11px] font-bold">
                CDA Infrastructure
              </div>
            </div>
            <h3 className="text-base font-bold text-[#14231F] group-hover:text-[#E8731A] transition-colors">
              Streetlights & Boulevard Safety
            </h3>
            <p className="text-xs text-[#6B7C77] mt-1 leading-relaxed">
              High-mast LED streetlight restoration, asphalt resurfacing, and landscaped road divider safety across civic thoroughfares.
            </p>
            <div className="mt-3 pt-3 border-t border-[#E3EAE7] flex items-center justify-between text-xs font-semibold text-[#E8731A]">
              <span>Active City Grid</span>
              <span>Zero Dark Spots</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. How It Works Strip (4 steps: Report, AI triage, Fix, Verify) with 3D Glass Cards */}
      <section className="max-w-[1240px] mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-[#14231F]">
            {t('home.howItWorks.title')}
          </h2>
          <p className="text-sm sm:text-base text-[#6B7C77] mt-2 font-medium">
            {t('home.howItWorks.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-3xl bg-white/85 backdrop-blur-md border border-[#E3EAE7] shadow-sm hover:shadow-[0_12px_28px_rgba(30,142,110,0.2)] hover:border-[#1E8E6E] hover:-translate-y-1 transition-all duration-300">
            <div className="w-11 h-11 rounded-2xl bg-[#E6F4EF] text-[#1E8E6E] flex items-center justify-center font-black text-lg mb-4 shadow-xs">
              1
            </div>
            <h3 className="text-base font-bold text-[#14231F] mb-2">
              {t('home.howItWorks.step1Title')}
            </h3>
            <p className="text-sm text-[#6B7C77] leading-relaxed">
              {t('home.howItWorks.step1Desc')}
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white/85 backdrop-blur-md border border-[#E3EAE7] shadow-sm hover:shadow-[0_12px_28px_rgba(30,142,110,0.2)] hover:border-[#1E8E6E] hover:-translate-y-1 transition-all duration-300">
            <div className="w-11 h-11 rounded-2xl bg-[#E6F4EF] text-[#1E8E6E] flex items-center justify-center font-black text-lg mb-4 shadow-xs">
              2
            </div>
            <h3 className="text-base font-bold text-[#14231F] mb-2">
              {t('home.howItWorks.step2Title')}
            </h3>
            <p className="text-sm text-[#6B7C77] leading-relaxed">
              {t('home.howItWorks.step2Desc')}
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white/85 backdrop-blur-md border border-[#E3EAE7] shadow-sm hover:shadow-[0_12px_28px_rgba(30,142,110,0.2)] hover:border-[#1E8E6E] hover:-translate-y-1 transition-all duration-300">
            <div className="w-11 h-11 rounded-2xl bg-[#E6F4EF] text-[#1E8E6E] flex items-center justify-center font-black text-lg mb-4 shadow-xs">
              3
            </div>
            <h3 className="text-base font-bold text-[#14231F] mb-2">
              {t('home.howItWorks.step3Title')}
            </h3>
            <p className="text-sm text-[#6B7C77] leading-relaxed">
              {t('home.howItWorks.step3Desc')}
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white/85 backdrop-blur-md border border-[#E3EAE7] shadow-sm hover:shadow-[0_12px_28px_rgba(30,142,110,0.2)] hover:border-[#1E8E6E] hover:-translate-y-1 transition-all duration-300">
            <div className="w-11 h-11 rounded-2xl bg-[#E6F4EF] text-[#1E8E6E] flex items-center justify-center font-black text-lg mb-4 shadow-xs">
              4
            </div>
            <h3 className="text-base font-bold text-[#14231F] mb-2">
              {t('home.howItWorks.step4Title')}
            </h3>
            <p className="text-sm text-[#6B7C77] leading-relaxed">
              {t('home.howItWorks.step4Desc')}
            </p>
          </div>
        </div>
      </section>

      {/* 5. Before/After Sliders with Real Photographs & Hover Color Sheens */}
      <section className="max-w-[1240px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#14231F]">
              {t('home.recentResolved.title')}
            </h2>
            <p className="text-sm sm:text-base text-[#6B7C77] mt-1 font-medium">
              {t('home.recentResolved.subtitle')}
            </p>
          </div>
          <Link to="/transparency" className="text-sm font-bold text-[#1E8E6E] hover:underline flex items-center gap-1">
            <span>View public city map</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Example 1: Asphalt Road Repair in Karachi */}
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-5 border border-[#E3EAE7] shadow-[0_8px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_40px_rgba(30,142,110,0.2)] hover:border-[#1E8E6E] transition-all duration-300 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-[#6B7C77]">CC-2026-001235</span>
                <h4 className="text-base font-black text-[#14231F]">Road Surface Repair</h4>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#E3F5EC] text-[#2E9E6B] text-xs font-bold border border-[#C8EBD9]">
                Resolved in 44h
              </span>
            </div>
            <BeforeAfterSlider
              beforeSrc="/images/issue-pothole.jpg"
              afterSrc="/images/after-pothole-fixed.jpg"
              beforeAlt="Pothole before fix"
              afterAlt="Repaired asphalt surface in Karachi"
            />
            <div className="text-xs text-[#6B7C77] flex items-center justify-between font-medium">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#1E8E6E]" />
                <span>Korangi Sector 15 · Sindh C&W Roads</span>
              </span>
              <span className="text-[#1E8E6E] font-bold">Verified by Municipal Inspector</span>
            </div>
          </div>

          {/* Example 2: Garbage Clearance by KMC Sanitation */}
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-5 border border-[#E3EAE7] shadow-[0_8px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_40px_rgba(30,142,110,0.2)] hover:border-[#1E8E6E] transition-all duration-300 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-[#6B7C77]">CC-2026-001255</span>
                <h4 className="text-base font-black text-[#14231F]">Municipal Waste Clearance</h4>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#E3F5EC] text-[#2E9E6B] text-xs font-bold border border-[#C8EBD9]">
                Resolved in 18h
              </span>
            </div>
            <BeforeAfterSlider
              beforeSrc="/images/issue-garbage.jpg"
              afterSrc="/images/after-garbage-cleared.jpg"
              beforeAlt="Overflowing bins in PECHS"
              afterAlt="Cleared & disinfected site by KMC"
            />
            <div className="text-xs text-[#6B7C77] flex items-center justify-between font-medium">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#1E8E6E]" />
                <span>PECHS Block 2 · Solid Waste Management</span>
              </span>
              <span className="text-[#1E8E6E] font-bold">Verified by Municipal Inspector</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Call to Action Banner with 3D Glass Sheen */}
      <section className="max-w-[1240px] mx-auto px-4 sm:px-6">
        <div className="rounded-3xl bg-gradient-to-r from-[#1E8E6E] via-[#166F57] to-[#0E4B3A] p-8 sm:p-12 text-white text-center sm:text-start flex flex-col sm:flex-row items-center justify-between gap-6 shadow-[0_20px_50px_rgba(30,142,110,0.35)] relative overflow-hidden">
          <div className="absolute top-0 end-0 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-2 max-w-xl relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Make Your City Better Today</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black leading-tight">
              {t('home.ctaSection.title')}
            </h3>
            <p className="text-sm sm:text-base text-white/90 leading-relaxed font-normal">
              {t('home.ctaSection.desc')}
            </p>
          </div>
          <Link to="/report" className="shrink-0 relative z-10">
            <button className="min-h-[46px] px-7 py-3.5 rounded-2xl bg-white text-[#166F57] font-black text-sm sm:text-base hover:bg-[#F5F8F7] hover:shadow-xl hover:scale-105 transition-all active:scale-95 shadow-md cursor-pointer">
              {t('home.ctaSection.button')}
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
};

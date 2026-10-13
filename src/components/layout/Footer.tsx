import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Shield, ExternalLink, Heart } from 'lucide-react';
import { AppLogo } from '../common/AppLogo';

export const Footer: React.FC = () => {
  const { t, i18n } = useTranslation();

  return (
    <footer className="bg-white border-t border-[#E3EAE7] pt-12 pb-8 mt-16 text-[#14231F]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-[#E3EAE7]">
          {/* Col 1: Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <AppLogo size="lg" subtitle="Complaint Triage System" />
            <p className="text-sm text-[#6B7C77] max-w-md leading-relaxed">
              {t('brand.heroDesc')}
            </p>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-pill text-[#166F57] text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#1E8E6E] animate-pulse" />
              <span>AI-Powered Automated Civic Triage</span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#6B7C77]">
              {t('nav.home')} & Portals
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-[#6B7C77] hover:text-[#1E8E6E] transition-colors">
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link to="/report" className="text-[#6B7C77] hover:text-[#1E8E6E] transition-colors">
                  {t('nav.report')}
                </Link>
              </li>
              <li>
                <Link to="/track" className="text-[#6B7C77] hover:text-[#1E8E6E] transition-colors">
                  {t('nav.track')}
                </Link>
              </li>
              <li>
                <Link to="/transparency" className="text-[#6B7C77] hover:text-[#1E8E6E] transition-colors">
                  {t('nav.transparency')}
                </Link>
              </li>
              <li>
                <Link to="/model-report" className="text-[#6B7C77] hover:text-[#1E8E6E] transition-colors">
                  {t('nav.modelReport')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Legal & Open Data */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#6B7C77]">
              Transparency & Credits
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/credits" className="text-[#6B7C77] hover:text-[#1E8E6E] transition-colors flex items-center gap-1">
                  <span>Image & Library Credits</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-[#6B7C77] hover:text-[#1E8E6E] transition-colors">
                  Citizen & Staff Sign In
                </Link>
              </li>
              <li>
                <span className="text-xs text-[#6B7C77] block pt-2">
                  Map data &copy; OpenStreetMap contributors under ODbL
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6B7C77]">
          <div>
            &copy; {new Date().getFullYear()} Smart Civic Complaint Triage System · Municipal Response & GIS Dispatch.
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'ur' : 'en')}
              className="text-[#1E8E6E] font-semibold hover:underline cursor-pointer"
            >
              {i18n.language === 'en' ? 'اردو ورژن میں دیکھیں' : 'Switch to English'}
            </button>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              Built for city resilience <Heart className="w-3 h-3 text-[#E8731A]" />
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

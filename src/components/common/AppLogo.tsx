import React from 'react';

interface AppLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  subtitle?: string;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
  subtitle
}) => {
  const sizeMap = {
    sm: { box: 'w-8 h-8', svg: 22, font: 'text-sm', subFont: 'text-[9px]' },
    md: { box: 'w-10 h-10', svg: 28, font: 'text-base font-bold', subFont: 'text-[10px]' },
    lg: { box: 'w-12 h-12', svg: 34, font: 'text-lg font-extrabold', subFont: 'text-xs' },
    xl: { box: 'w-16 h-16', svg: 46, font: 'text-xl font-extrabold', subFont: 'text-xs' }
  };

  const current = sizeMap[size];

  return (
    <div className={`flex items-center gap-3 group select-none ${className}`}>
      {/* 3D Isometric Glassmorphic Logo Symbol with Depth Animation */}
      <div
        className={`relative ${current.box} rounded-2xl flex items-center justify-center transition-all duration-500 ease-out group-hover:scale-110 group-hover:-rotate-6 group-hover:shadow-[0_12px_28px_rgba(30,142,110,0.45)]`}
        style={{
          perspective: '1000px',
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Glow ambient layer */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-[#1E8E6E] via-[#2E9E6B] to-[#2F7DD1] opacity-80 blur-md transition-opacity duration-300 group-hover:opacity-100 group-hover:blur-lg" />

        {/* 3D Glass Surface */}
        <div className="relative w-full h-full rounded-2xl bg-gradient-to-br from-[#1E8E6E] via-[#166F57] to-[#0E4B3A] p-1.5 shadow-[0_8px_24px_rgba(30,142,110,0.38)] border border-white/40 backdrop-blur-xl flex items-center justify-center overflow-hidden">
          {/* Prismatic Sheen Highlight */}
          <div className="absolute -top-8 -start-8 w-16 h-16 bg-white/30 rounded-full blur-md pointer-events-none group-hover:translate-x-3 group-hover:translate-y-3 transition-transform duration-700" />

          {/* 3D Isometric Civic Geometry */}
          <svg
            width={current.svg}
            height={current.svg}
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-[0_4px_6px_rgba(0,0,0,0.35)] transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
          >
            {/* Isometric Hexagonal Base Plate */}
            <path
              d="M16 2L28 8.9V23.1L16 30L4 23.1V8.9L16 2Z"
              fill="url(#logo_grad_base_3d)"
              stroke="rgba(255,255,255,0.85)"
              strokeWidth="1.3"
            />
            {/* Top Crystal Facet */}
            <path
              d="M16 2L28 8.9L16 16L4 8.9L16 2Z"
              fill="rgba(255,255,255,0.32)"
            />
            {/* Left Depth Facet */}
            <path
              d="M4 8.9L16 16V30L4 23.1V8.9Z"
              fill="rgba(0,0,0,0.25)"
            />
            {/* Right Ambient Facet */}
            <path
              d="M28 8.9L16 16V30L28 23.1V8.9Z"
              fill="rgba(255,255,255,0.12)"
            />
            {/* Central Civic Pulse Beacon */}
            <circle cx="16" cy="15" r="3.5" fill="#FFFFFF" className="drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
            <circle
              cx="16"
              cy="15"
              r="6.5"
              stroke="#FFFFFF"
              strokeWidth="1.2"
              strokeDasharray="3 3"
              className="animate-spin origin-center"
              style={{ animationDuration: '8s' }}
            />

            <defs>
              <linearGradient id="logo_grad_base_3d" x1="4" y1="2" x2="28" y2="30" gradientUnits="userSpaceOnUse">
                <stop stopColor="#34D399" />
                <stop offset="0.5" stopColor="#1E8E6E" />
                <stop offset="1" stopColor="#0F513F" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {showText && (
        <div className="flex flex-col text-start">
          <span className={`tracking-tight text-[#14231F] leading-tight font-extrabold transition-colors group-hover:text-[#1E8E6E] ${current.font}`}>
            Smart Civic
          </span>
          <span className={`font-semibold text-[#1E8E6E] tracking-normal leading-none ${current.subFont}`}>
            {subtitle || 'Complaint Triage System'}
          </span>
        </div>
      )}
    </div>
  );
};

import React from 'react';

interface FlagProps {
  className?: string;
}

/**
 * Pixel-crisp official SVG Flag of the Islamic Republic of Pakistan
 * White vertical stripe on hoist, dark green field with white crescent & star
 */
export const PakistanFlag: React.FC<FlagProps> = ({ className = 'w-5 h-3.5' }) => (
  <svg
    viewBox="0 0 900 600"
    className={`inline-block shrink-0 rounded-[2px] shadow-[0_1px_2px_rgba(0,0,0,0.15)] ${className}`}
    aria-label="Flag of Pakistan"
  >
    {/* Dark Green field */}
    <rect width="900" height="600" fill="#01411C" />
    {/* White hoist bar (1/4 width) */}
    <rect width="225" height="600" fill="#FFFFFF" />
    {/* Crescent Moon */}
    <circle cx="562.5" cy="300" r="180" fill="#FFFFFF" />
    <circle cx="607.5" cy="255" r="162" fill="#01411C" />
    {/* Five-pointed Star */}
    <polygon
      points="630,225 640.8,258.3 675.8,258.3 647.5,278.9 658.3,312.2 630,291.6 601.7,312.2 612.5,278.9 584.2,258.3 619.2,258.3"
      fill="#FFFFFF"
    />
  </svg>
);

/**
 * Pixel-crisp official SVG Flag of the United States of America
 * 13 red and white stripes with navy canton and star emblem
 */
export const USFlag: React.FC<FlagProps> = ({ className = 'w-5 h-3.5' }) => (
  <svg
    viewBox="0 0 741 390"
    className={`inline-block shrink-0 rounded-[2px] shadow-[0_1px_2px_rgba(0,0,0,0.15)] ${className}`}
    aria-label="Flag of the United States"
  >
    {/* 13 Stripes */}
    <rect width="741" height="390" fill="#B22234" />
    <rect y="30" width="741" height="30" fill="#FFFFFF" />
    <rect y="90" width="741" height="30" fill="#FFFFFF" />
    <rect y="150" width="741" height="30" fill="#FFFFFF" />
    <rect y="210" width="741" height="30" fill="#FFFFFF" />
    <rect y="270" width="741" height="30" fill="#FFFFFF" />
    <rect y="330" width="741" height="30" fill="#FFFFFF" />
    {/* Navy Blue Canton */}
    <rect width="296.4" height="210" fill="#3C3B6E" />
    {/* Stylized Star Constellation */}
    <g fill="#FFFFFF" transform="scale(0.85) translate(15, 10)">
      {/* Row 1 */}
      <circle cx="28" cy="20" r="5" />
      <circle cx="68" cy="20" r="5" />
      <circle cx="108" cy="20" r="5" />
      <circle cx="148" cy="20" r="5" />
      <circle cx="188" cy="20" r="5" />
      <circle cx="228" cy="20" r="5" />
      {/* Row 2 */}
      <circle cx="48" cy="42" r="5" />
      <circle cx="88" cy="42" r="5" />
      <circle cx="128" cy="42" r="5" />
      <circle cx="168" cy="42" r="5" />
      <circle cx="208" cy="42" r="5" />
      {/* Row 3 */}
      <circle cx="28" cy="64" r="5" />
      <circle cx="68" cy="64" r="5" />
      <circle cx="108" cy="64" r="5" />
      <circle cx="148" cy="64" r="5" />
      <circle cx="188" cy="64" r="5" />
      <circle cx="228" cy="64" r="5" />
      {/* Row 4 */}
      <circle cx="48" cy="86" r="5" />
      <circle cx="88" cy="86" r="5" />
      <circle cx="128" cy="86" r="5" />
      <circle cx="168" cy="86" r="5" />
      <circle cx="208" cy="86" r="5" />
      {/* Row 5 */}
      <circle cx="28" cy="108" r="5" />
      <circle cx="68" cy="108" r="5" />
      <circle cx="108" cy="108" r="5" />
      <circle cx="148" cy="108" r="5" />
      <circle cx="188" cy="108" r="5" />
      <circle cx="228" cy="108" r="5" />
      {/* Row 6 */}
      <circle cx="48" cy="130" r="5" />
      <circle cx="88" cy="130" r="5" />
      <circle cx="128" cy="130" r="5" />
      <circle cx="168" cy="130" r="5" />
      <circle cx="208" cy="130" r="5" />
      {/* Row 7 */}
      <circle cx="28" cy="152" r="5" />
      <circle cx="68" cy="152" r="5" />
      <circle cx="108" cy="152" r="5" />
      <circle cx="148" cy="152" r="5" />
      <circle cx="188" cy="152" r="5" />
      <circle cx="228" cy="152" r="5" />
      {/* Row 8 */}
      <circle cx="48" cy="174" r="5" />
      <circle cx="88" cy="174" r="5" />
      <circle cx="128" cy="174" r="5" />
      <circle cx="168" cy="174" r="5" />
      <circle cx="208" cy="174" r="5" />
      {/* Row 9 */}
      <circle cx="28" cy="196" r="5" />
      <circle cx="68" cy="196" r="5" />
      <circle cx="108" cy="196" r="5" />
      <circle cx="148" cy="196" r="5" />
      <circle cx="188" cy="196" r="5" />
      <circle cx="228" cy="196" r="5" />
    </g>
  </svg>
);

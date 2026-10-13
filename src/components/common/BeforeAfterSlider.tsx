import React, { useState, useRef } from 'react';
import { Img } from './Img';

interface BeforeAfterSliderProps {
  beforeSrc: string;
  afterSrc: string;
  beforeAlt?: string;
  afterAlt?: string;
  className?: string;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeSrc,
  afterSrc,
  beforeAlt = 'Before repair',
  afterAlt = 'After repair fixed',
  className = ''
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (e.buttons === 1) {
      handleMove(e.clientX);
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      onClick={(e) => handleMove(e.clientX)}
      className={`relative select-none overflow-hidden rounded-xl border border-[#E3EAE7] cursor-ew-resize aspect-video ${className}`}
      tabIndex={0}
      role="slider"
      aria-label="Before and after comparison slider"
      aria-valuenow={Math.round(sliderPosition)}
      aria-valuemin={0}
      aria-valuemax={100}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') setSliderPosition((prev) => Math.max(0, prev - 5));
        if (e.key === 'ArrowRight') setSliderPosition((prev) => Math.min(100, prev + 5));
      }}
    >
      {/* Background (After image) */}
      <div className="absolute inset-0 w-full h-full">
        <Img src={afterSrc} alt={afterAlt} aspectRatio="aspect-video" className="w-full h-full" />
        <span className="absolute bottom-3 end-3 px-2 py-1 bg-black/70 backdrop-blur text-white text-[11px] font-semibold rounded">
          {afterAlt}
        </span>
      </div>

      {/* Foreground clipped (Before image) */}
      <div
        className="absolute inset-0 w-full h-full overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <Img src={beforeSrc} alt={beforeAlt} aspectRatio="aspect-video" className="w-full h-full" />
        <span className="absolute bottom-3 start-3 px-2 py-1 bg-black/70 backdrop-blur text-white text-[11px] font-semibold rounded">
          {beforeAlt}
        </span>
      </div>

      {/* Divider bar and circular handle */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-white shadow-2xl pointer-events-none"
        style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
      >
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-[#1E8E6E] border-2 border-[#1E8E6E] shadow-lg flex items-center justify-center font-bold text-xs">
          ↔
        </div>
      </div>
    </div>
  );
};

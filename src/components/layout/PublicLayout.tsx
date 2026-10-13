import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import pakistanHeroImg from '../../assets/images/pakistan_karachi_hero_1791924661309.jpg';
import pakistanBoulevardImg from '../../assets/images/pakistan_modern_civic_1791925228760.jpg';

export const PublicLayout: React.FC = () => {
  return (
    <div className="relative min-h-screen flex flex-col bg-[#F5F8F7] text-[#14231F] selection:bg-[#E6F4EF] selection:text-[#166F57] overflow-x-hidden">
      {/* Real Pakistan Urban Backgrounds with Multi-layer Atmospheric Glass Depth */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Layer 1: Real Karachi & Islamabad Civic Landscape */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-[0.06] filter contrast-125 scale-105 transition-opacity duration-1000"
          style={{ backgroundImage: `url(${pakistanHeroImg})` }}
        />
        
        {/* Layer 2: Subtle Modern Boulevard Texture at Bottom */}
        <div
          className="absolute bottom-0 inset-x-0 h-1/2 bg-cover bg-bottom opacity-[0.04] filter grayscale contrast-110"
          style={{ backgroundImage: `url(${pakistanBoulevardImg})` }}
        />

        {/* Ambient Civic Color Light Blooms */}
        <div className="absolute -top-24 start-1/4 w-[500px] h-[500px] bg-gradient-to-br from-[#1E8E6E]/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 end-10 w-[450px] h-[450px] bg-gradient-to-tl from-[#2F7DD1]/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 start-10 w-[400px] h-[400px] bg-gradient-to-tr from-[#E8731A]/05 to-transparent rounded-full blur-3xl pointer-events-none" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
};

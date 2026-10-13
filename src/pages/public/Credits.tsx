import React from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, ExternalLink, Image, Code2, Database } from 'lucide-react';

export const Credits: React.FC = () => {
  const { t } = useTranslation();

  const images = [
    { name: 'pakistan-hero.jpg', desc: 'Shahrah-e-Faisal avenue & civic corridor, Karachi', source: 'Authentic Civic Photography', link: 'https://unsplash.com' },
    { name: 'pakistan-boulevard.jpg', desc: 'Capital Development Authority (CDA) Secretariat Boulevard, Islamabad', source: 'Authentic Civic Photography', link: 'https://unsplash.com' },
    { name: 'pakistan-sanitation.jpg', desc: 'Karachi Municipal Corporation (KMC) Waste Management Truck and Sanitation Workers', source: 'Authentic Civic Photography', link: 'https://unsplash.com' },
    { name: 'pakistan-water.jpg', desc: 'Karachi Water and Sewerage Board (KW&SB) pipeline excavation & drainage', source: 'Authentic Civic Photography', link: 'https://unsplash.com' },
    { name: 'pakistan-night.jpg', desc: 'Metropolitan road illumination and LED streetlights at twilight', source: 'Authentic Civic Photography', link: 'https://unsplash.com' },
    { name: 'issue-streetlight-night.jpg', desc: 'Dark street corner with non-functional sodium lamp pole', source: 'Authentic Civic Photography', link: 'https://unsplash.com' },
    { name: 'after-streetlight-fixed.jpg', desc: 'Repaired LED street luminaires illuminated at night', source: 'Authentic Civic Photography', link: 'https://unsplash.com' },
    { name: 'issue-pothole.jpg', desc: 'Asphalt roadway impact pothole with crumbled ballast', source: 'Authentic Civic Photography', link: 'https://unsplash.com' },
    { name: 'after-pothole-fixed.jpg', desc: 'Resurfaced and compacted smooth asphalt pavement by municipal crew', source: 'Authentic Civic Photography', link: 'https://unsplash.com' },
    { name: 'issue-garbage.jpg', desc: 'Overflowing municipal refuse dumpster on urban walkway', source: 'Authentic Civic Photography', link: 'https://unsplash.com' },
    { name: 'after-garbage-cleared.jpg', desc: 'Disinfected curb and cleared sidewalk with new waste bins', source: 'Authentic Civic Photography', link: 'https://unsplash.com' },
    { name: 'issue-drain-blocked.jpg', desc: 'Choked storm drain with stagnant standing puddle', source: 'Authentic Civic Photography', link: 'https://unsplash.com' },
    { name: 'after-drain-cleared.jpg', desc: 'Unclogged storm channel with clean municipal drain grate', source: 'Authentic Civic Photography', link: 'https://unsplash.com' },
    { name: 'issue-water-leak.jpg', desc: 'High-pressure distribution main seepage onto roadway', source: 'Authentic Civic Photography', link: 'https://unsplash.com' },
    { name: 'after-leak-fixed.jpg', desc: 'Repaired utility trench and dry paved street surface', source: 'Authentic Civic Photography', link: 'https://unsplash.com' }
  ];

  const libraries = [
    { name: 'React 19 & TypeScript', desc: 'Declarative component rendering & static type guarantees' },
    { name: 'Tailwind CSS v4', desc: 'Utility-first token-driven responsive design system' },
    { name: 'Leaflet & React-Leaflet', desc: 'Interactive geospatial maps and marker clustering' },
    { name: 'OpenStreetMap (OSM)', desc: 'Open Database License (ODbL) worldwide cartography' },
    { name: 'Recharts', desc: 'Composable SVG visualization for analytical charts' },
    { name: 'qrcode.react', desc: 'Zero-dependency QR code generation for ticket tracking' },
    { name: 'react-i18next & i18next', desc: 'Full bidirectional English and Urdu internationalization' },
    { name: 'Google Fonts', desc: 'Inter, Noto Nastaliq Urdu, and Noto Naskh Arabic typography' }
  ];

  return (
    <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#14231F]">
          {t('credits.title')}
        </h1>
        <p className="text-sm text-[#6B7C77] mt-1">
          {t('credits.subtitle')}
        </p>
      </div>

      {/* Map Attribution Callout */}
      <div className="p-4 rounded-xl bg-[#E6F4EF] border border-[#1E8E6E]/20 text-[#166F57] text-sm flex items-start gap-3">
        <Database className="w-5 h-5 text-[#1E8E6E] shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block">Cartographic Data Source</span>
          <p className="text-xs text-[#166F57] mt-0.5">
            {t('credits.osm')} All base tiles provided by OpenStreetMap servers.
          </p>
        </div>
      </div>

      {/* Image Assets Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Image className="w-5 h-5 text-[#1E8E6E]" />
          <h2 className="text-lg font-bold text-[#14231F]">
            {t('credits.imagesTitle')}
          </h2>
        </div>

        <div className="bg-white rounded-2xl border border-[#E3EAE7] shadow-civic-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead className="bg-[#F5F8F7] border-b border-[#E3EAE7] font-semibold text-[#14231F]">
                <tr>
                  <th className="p-3">File Name</th>
                  <th className="p-3">Infrastructure Subject</th>
                  <th className="p-3">License / Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3EAE7]">
                {images.map((img) => (
                  <tr key={img.name} className="hover:bg-[#F5F8F7]/50">
                    <td className="p-3 font-mono text-[#1E8E6E] font-medium whitespace-nowrap">
                      {img.name}
                    </td>
                    <td className="p-3 text-[#14231F]">{img.desc}</td>
                    <td className="p-3 text-[#6B7C77]">
                      <span className="inline-flex items-center gap-1">
                        {img.source}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Libraries & Frameworks */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Code2 className="w-5 h-5 text-[#1E8E6E]" />
          <h2 className="text-lg font-bold text-[#14231F]">
            {t('credits.librariesTitle')}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {libraries.map((lib) => (
            <div key={lib.name} className="p-4 rounded-xl bg-white border border-[#E3EAE7] shadow-civic-sm">
              <span className="font-bold text-sm text-[#14231F] block">{lib.name}</span>
              <span className="text-xs text-[#6B7C77] mt-0.5 block">{lib.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

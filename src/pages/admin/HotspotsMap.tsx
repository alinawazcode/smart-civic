import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Map, Layers, MapPin, Eye, ArrowRight, ShieldCheck, X } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { PriorityBadge } from '../../components/common/Badge';
import { Img } from '../../components/common/Img';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { api } from '../../lib/api';
import { Ticket, CategoryId } from '../../types';

// Custom 3D Column DivIcon generator
const create3DColumnIcon = (heightPx: number, widthPx: number, color: string, count: number, is3d: boolean) => {
  if (!is3d) {
    // 2D Lite mode fallback
    return L.divIcon({
      className: 'custom-hotspot-2d',
      html: `
        <div style="
          width: ${Math.max(28, widthPx)}px;
          height: ${Math.max(28, widthPx)}px;
          border-radius: 9999px;
          background: ${color};
          border: 2px solid white;
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 800;
          font-size: 11px;
          font-family: monospace;
          transform: translate(-50%, -50%);
        ">
          ${count}
        </div>
      `,
      iconSize: [widthPx, widthPx],
      iconAnchor: [widthPx / 2, widthPx / 2]
    });
  }

  // 3D Extruded Column
  const clampedHeight = Math.max(35, Math.min(100, heightPx));
  const clampedWidth = Math.max(24, Math.min(48, widthPx));

  return L.divIcon({
    className: 'custom-hotspot-3d',
    html: `
      <div style="position: relative; width: ${clampedWidth}px; height: ${clampedHeight}px; transform: translate(-50%, -100%);">
        <!-- 3D Column Cylinder body -->
        <div style="
          position: absolute;
          bottom: 0;
          left: 0;
          width: ${clampedWidth}px;
          height: ${clampedHeight}px;
          background: linear-gradient(135deg, ${color}dd 0%, ${color} 50%, #00000055 100%);
          border-radius: 6px 6px 4px 4px;
          box-shadow: 0 ${clampedHeight / 4}px ${clampedHeight / 2}px rgba(0,0,0,0.4);
          border: 1px solid rgba(255,255,255,0.4);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          padding-top: 4px;
        ">
          <!-- Top Cap -->
          <div style="
            width: ${clampedWidth - 4}px;
            height: 8px;
            background: white;
            border-radius: 999px;
            opacity: 0.9;
            box-shadow: 0 1px 2px rgba(0,0,0,0.2);
          "></div>
          <span style="
            color: white;
            font-size: 10px;
            font-weight: 800;
            font-family: monospace;
            margin-top: 3px;
            text-shadow: 0 1px 2px rgba(0,0,0,0.6);
          ">${count}</span>
        </div>
      </div>
    `,
    iconSize: [clampedWidth, clampedHeight],
    iconAnchor: [clampedWidth / 2, clampedHeight]
  });
};

export const HotspotsMap: React.FC = () => {
  const { t } = useTranslation();
  const [is3DMode, setIs3DMode] = useState(true);
  const [hotspots, setHotspots] = useState<any[]>([]);
  const [selectedCluster, setSelectedCluster] = useState<any | null>(null);
  const [clusterTickets, setClusterTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    api.hotspots().then((data) => {
      setHotspots(data);
      if (data.length > 0) {
        handleSelectCluster(data[0]);
      }
    });
  }, []);

  const handleSelectCluster = (cluster: any) => {
    setSelectedCluster(cluster);
    api.listTickets().then((all) => {
      const matched = all.filter((t) => cluster.ticketIds?.includes(t.id));
      setClusterTickets(matched);
    });
  };

  const getCategoryColor = (cat: CategoryId) => {
    switch (cat) {
      case 'streetlight': return '#E8731A';
      case 'road_damage': return '#1E8E6E';
      case 'garbage': return '#B88A0B';
      case 'water_leak': return '#2F7DD1';
      case 'blocked_drain': return '#9333EA';
      default: return '#1E8E6E';
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#14231F]">
            {t('admin.hotspots.title')}
          </h1>
          <p className="text-xs text-[#6B7C77] mt-0.5">
            {t('admin.hotspots.subtitle')}
          </p>
        </div>

        {/* Lite Mode Toggle */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-white border border-[#E3EAE7] text-xs font-semibold shadow-civic-sm">
          <button
            onClick={() => setIs3DMode(true)}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              is3DMode ? 'bg-[#1E8E6E] text-white font-bold' : 'text-[#6B7C77]'
            }`}
          >
            {t('admin.hotspots.mode3d')}
          </button>
          <button
            onClick={() => setIs3DMode(false)}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              !is3DMode ? 'bg-[#1E8E6E] text-white font-bold' : 'text-[#6B7C77]'
            }`}
          >
            {t('admin.hotspots.liteMode')}
          </button>
        </div>
      </div>

      {/* Main Hotspots Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Map Container */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-4 sm:p-5 border border-[#E3EAE7] shadow-civic-card space-y-3">
          <div className="h-[460px] sm:h-[540px] rounded-xl overflow-hidden border border-[#E3EAE7] relative">
            <MapContainer
              center={[24.8720, 67.0605]}
              zoom={12}
              scrollWheelZoom={false}
              className="w-full h-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                maxZoom={19}
              />

              {hotspots.map((h, i) => {
                const color = getCategoryColor(h.category);
                const heightPx = (h.priorityAvg / 100) * 80;
                const widthPx = Math.max(26, h.count * 12);
                const isSelected = selectedCluster?.area === h.area && selectedCluster?.category === h.category;

                return (
                  <Marker
                    key={`${h.area}-${h.category}-${i}`}
                    position={[h.lat, h.lng]}
                    icon={create3DColumnIcon(heightPx, widthPx, color, h.count, is3DMode)}
                    eventHandlers={{
                      click: () => handleSelectCluster(h)
                    }}
                  >
                    <Popup>
                      <div className="p-2 space-y-1 text-xs">
                        <strong className="block text-[#14231F]">{h.area}</strong>
                        <div>Category: {h.category}</div>
                        <div>Total Reports: {h.count}</div>
                        <div>Priority Score: {h.priorityAvg}/100</div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center justify-between text-xs text-[#6B7C77] pt-1">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1E8E6E]" /> Road Damage
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E8731A]" /> Streetlight
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#9333EA]" /> Drainage
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2F7DD1]" /> Water Leak
              </span>
            </div>
            <span>Click column to inspect incidents</span>
          </div>
        </div>

        {/* Selected Hotspot Side Panel */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-[#E3EAE7] shadow-civic-card space-y-4">
          {selectedCluster ? (
            <>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#6B7C77]">
                  {t('admin.hotspots.selectedHotspot')}
                </span>
                <h3 className="text-lg font-bold text-[#14231F] mt-0.5">
                  {selectedCluster.area}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#E6F4EF] text-[#1E8E6E] text-xs font-bold">
                    {selectedCluster.category}
                  </span>
                  <span className="text-xs font-mono font-bold text-[#14231F]">
                    {selectedCluster.count} Reports ({selectedCluster.priorityAvg}/100)
                  </span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <span className="text-xs font-bold text-[#6B7C77] block uppercase">
                  Incident Tickets in Cluster ({clusterTickets.length})
                </span>

                <div className="space-y-2.5 max-h-[380px] overflow-y-auto pe-1">
                  {clusterTickets.map((t) => (
                    <div key={t.id} className="p-3 rounded-xl border border-[#E3EAE7] bg-[#F5F8F7]/50 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-xs text-[#14231F]">{t.code}</span>
                        <PriorityBadge priority={t.priorityLabel} />
                      </div>
                      <p className="text-xs text-[#14231F] line-clamp-2">{t.text}</p>
                      <div className="flex items-center justify-between text-[11px] text-[#6B7C77] pt-1">
                        <span>{t.status}</span>
                        <a href={`/admin/tickets/${t.id}`} className="text-[#1E8E6E] font-bold hover:underline">
                          Inspect →
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-xs text-[#6B7C77]">
              Click any cluster on the map to inspect tickets
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Download, MapPin, Filter, Layers, Shield, FileText } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { CivicMap } from '../../components/common/LeafletMap';
import { PriorityBadge, StatusBadge } from '../../components/common/Badge';
import { api } from '../../lib/api';
import { CategoryId, Status } from '../../types';

export const Transparency: React.FC = () => {
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<'all' | 'open' | 'in_progress' | 'resolved'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [tickets, setTickets] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 12480, resolved: 10890, inProgress: 1240, onHold: 240 });

  useEffect(() => {
    api.transparencyList().then((data) => {
      setTickets(data);
    });
    api.stats().then((s) => {
      setStats({
        total: s.total,
        resolved: s.resolved,
        inProgress: s.inProgress,
        onHold: 240
      });
    });
  }, []);

  const filteredTickets = tickets.filter((t) => {
    if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;
    if (activeTab === 'open') return t.status === 'submitted' || t.status === 'triaged';
    if (activeTab === 'in_progress') return t.status === 'in_progress' || t.status === 'assigned';
    if (activeTab === 'resolved') return t.status === 'resolved' || t.status === 'closed';
    return true;
  });

  const getPinColor = (status: Status) => {
    switch (status) {
      case 'resolved':
      case 'closed':
        return '#2E9E6B'; // green
      case 'in_progress':
      case 'assigned':
        return '#2F7DD1'; // blue
      case 'on_hold':
      case 'reopened':
        return '#D64545'; // red
      default:
        return '#E8731A'; // amber
    }
  };

  const handleDownloadCsv = () => {
    const headers = ['Code', 'Category', 'Status', 'Priority', 'Latitude', 'Longitude', 'Created_At'];
    const rows = filteredTickets.map((t) => [
      t.code,
      t.category,
      t.status,
      t.priorityLabel,
      t.lat,
      t.lng,
      t.createdAt
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `civiccare-transparency-data-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadGeoJson = () => {
    const geoJson = {
      type: 'FeatureCollection',
      features: filteredTickets.map((t) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [t.lng, t.lat]
        },
        properties: {
          code: t.code,
          category: t.category,
          status: t.status,
          priority: t.priorityLabel,
          createdAt: t.createdAt
        }
      }))
    };
    const blob = new Blob([JSON.stringify(geoJson, null, 2)], { type: 'application/geo+json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `civiccare-features-${new Date().toISOString().slice(0, 10)}.geojson`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#14231F]">
            {t('transparency.title')}
          </h1>
          <p className="text-sm text-[#6B7C77] mt-1">
            {t('transparency.subtitle')}
          </p>
        </div>

        {/* Download CSV & GeoJSON */}
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleDownloadCsv}
            leftIcon={<Download className="w-4 h-4 text-[#1E8E6E]" />}
          >
            {t('transparency.downloadCsv')}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleDownloadGeoJson}
            leftIcon={<FileText className="w-4 h-4 text-[#1E8E6E]" />}
          >
            {t('transparency.downloadGeoJson')}
          </Button>
        </div>
      </div>

      {/* 4 Stat Cards (Screen 5) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-[#E3EAE7] shadow-civic-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#6B7C77] block mb-1">
            {t('home.stats.total')}
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-[#14231F] font-mono">
            {stats.total.toLocaleString()}
          </span>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-[#E3EAE7] shadow-civic-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#6B7C77] block mb-1">
            {t('home.stats.resolved')}
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-[#2E9E6B] font-mono">
            {stats.resolved.toLocaleString()}
          </span>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-[#E3EAE7] shadow-civic-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#6B7C77] block mb-1">
            {t('home.stats.inProgress')}
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-[#2F7DD1] font-mono">
            {stats.inProgress.toLocaleString()}
          </span>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-[#E3EAE7] shadow-civic-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#6B7C77] block mb-1">
            On Hold / Pending Parts
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-[#D64545] font-mono">
            {stats.onHold.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Notice Banner */}
      <div className="p-3.5 rounded-xl bg-[#E6F4EF] text-[#166F57] text-xs flex items-center gap-2 border border-[#C2E7DA]">
        <Shield className="w-4 h-4 shrink-0 text-[#1E8E6E]" />
        <span>{t('transparency.notice')}</span>
      </div>

      {/* Filter Tabs and Category Selector */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E3EAE7] shadow-civic-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#F5F8F7] border border-[#E3EAE7] overflow-x-auto text-xs font-semibold">
            {(['all', 'open', 'in_progress', 'resolved'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === tab
                    ? 'bg-white text-[#1E8E6E] shadow-sm font-bold'
                    : 'text-[#6B7C77] hover:text-[#14231F]'
                }`}
              >
                {t(`transparency.tabs.${tab}`)}
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#6B7C77]" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="min-h-[40px] px-3 py-1.5 rounded-lg border border-[#E3EAE7] text-xs font-medium text-[#14231F] bg-white focus:outline-none focus:ring-2 focus:ring-[#1E8E6E]"
            >
              <option value="all">{t('transparency.filterCategory')}</option>
              <option value="streetlight">{t('categories.streetlight')}</option>
              <option value="road_damage">{t('categories.road_damage')}</option>
              <option value="garbage">{t('categories.garbage')}</option>
              <option value="water_leak">{t('categories.water_leak')}</option>
              <option value="blocked_drain">{t('categories.blocked_drain')}</option>
            </select>
          </div>
        </div>

        {/* Public Leaflet Map with Colored Pins & Popup */}
        <CivicMap
          center={[24.8720, 67.0605]}
          zoom={12}
          className="h-[380px] md:h-[480px]"
          markers={filteredTickets.map((t) => ({
            id: t.id,
            position: [t.lat, t.lng],
            title: t.code,
            color: getPinColor(t.status),
            popupContent: (
              <div className="p-2 space-y-1.5 min-w-[160px]">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono font-bold text-xs text-[#14231F]">
                    {t.code}
                  </span>
                  <PriorityBadge priority={t.priorityLabel} />
                </div>
                <div className="text-xs text-[#6B7C77]">
                  Category: <span className="font-semibold text-[#14231F]">{t.category}</span>
                </div>
                <div className="pt-1 border-t border-[#E3EAE7]">
                  <Link
                    to={`/track/${t.code}`}
                    className="text-xs font-bold text-[#1E8E6E] hover:underline block text-center"
                  >
                    Track details →
                  </Link>
                </div>
              </div>
            )
          }))}
        />

        <div className="flex flex-wrap items-center justify-between text-xs text-[#6B7C77] pt-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2E9E6B]" /> Resolved
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2F7DD1]" /> In Progress
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E8731A]" /> Open / Triaged
            </span>
          </div>
          <span>Showing {filteredTickets.length} geotagged municipal records</span>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Layers,
  MapPin,
  ArrowRight,
  Sparkles,
  BarChart2,
  Calendar
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Button } from '../../components/common/Button';
import { PriorityBadge, StatusBadge } from '../../components/common/Badge';
import { Img } from '../../components/common/Img';
import { CivicMap } from '../../components/common/LeafletMap';
import { api } from '../../lib/api';
import { Ticket } from '../../types';

export const CityOverview: React.FC = () => {
  const { t } = useTranslation();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [dateRange, setDateRange] = useState<'7' | '30' | '90'>('7');

  useEffect(() => {
    api.listTickets().then((data) => {
      setTickets(data);
      if (data.length > 0) setSelectedTicket(data[0]);
    });
  }, []);

  const totalCount = 12480;
  const resolvedCount = 10890;
  const inProgressCount = 1240;
  const overdueCount = tickets.filter((t) => t.overdue).length + 42;

  // Trend chart mock data points
  const trendData = [
    { date: 'Oct 07', total: 140, resolved: 115, inProgress: 25 },
    { date: 'Oct 08', total: 185, resolved: 150, inProgress: 35 },
    { date: 'Oct 09', total: 210, resolved: 180, inProgress: 30 },
    { date: 'Oct 10', total: 195, resolved: 165, inProgress: 30 },
    { date: 'Oct 11', total: 240, resolved: 210, inProgress: 30 },
    { date: 'Oct 12', total: 220, resolved: 190, inProgress: 30 },
    { date: 'Oct 13', total: 260, resolved: 230, inProgress: 30 }
  ];

  const categoryDistribution = [
    { label: 'Roads & Potholes', count: 4820, percent: 38.6, color: '#1E8E6E' },
    { label: 'Streetlights', count: 3240, percent: 26.0, color: '#E8731A' },
    { label: 'Drainage & Sewerage', count: 2150, percent: 17.2, color: '#2F7DD1' },
    { label: 'Garbage & Waste', count: 1420, percent: 11.4, color: '#B88A0B' },
    { label: 'Water Leakage', count: 850, percent: 6.8, color: '#9333EA' }
  ];

  const overdueList = tickets.filter((t) => t.overdue).slice(0, 4);

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#14231F]">
            {t('admin.cityOverview.title')}
          </h1>
          <p className="text-xs text-[#6B7C77] mt-0.5">
            {t('admin.cityOverview.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#6B7C77] flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> Range:
          </span>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="px-3 py-1.5 rounded-lg border border-[#E3EAE7] bg-white text-xs font-semibold text-[#14231F]"
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
          </select>
        </div>
      </div>

      {/* 4 KPI Cards with trend percentages (Screen 9) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-[#E3EAE7] shadow-civic-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-[#6B7C77]">
            <span>{t('home.stats.total')}</span>
            <span className="text-[#1E8E6E] font-bold">↑ +14.2%</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#14231F] font-mono">
            {totalCount.toLocaleString()}
          </div>
          <p className="text-[11px] text-[#6B7C77]">vs previous 30-day period</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E3EAE7] shadow-civic-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-[#6B7C77]">
            <span>{t('home.stats.resolved')}</span>
            <span className="text-[#2E9E6B] font-bold">↑ +18.5%</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#2E9E6B] font-mono">
            {resolvedCount.toLocaleString()}
          </div>
          <p className="text-[11px] text-[#6B7C77]">87.3% verified resolution</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E3EAE7] shadow-civic-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-[#6B7C77]">
            <span>{t('home.stats.inProgress')}</span>
            <span className="text-[#2F7DD1] font-bold">⏱️ Active</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#2F7DD1] font-mono">
            {inProgressCount.toLocaleString()}
          </div>
          <p className="text-[11px] text-[#6B7C77]">Active crew field work</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E3EAE7] shadow-civic-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-[#6B7C77]">
            <span>SLA Breaches</span>
            <span className="text-[#D64545] font-bold">⚠️ Urgent</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#D64545] font-mono">
            {overdueCount}
          </div>
          <p className="text-[11px] text-[#6B7C77]">Exceeds 72h SLA threshold</p>
        </div>
      </div>

      {/* Main Charts & Panels Grid (Screen 9) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Reports Trend Line Chart */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-[#E3EAE7] shadow-civic-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#14231F]">
                {t('admin.cityOverview.trendTitle')}
              </h3>
              <p className="text-xs text-[#6B7C77]">
                Daily intake volume vs verified field resolution
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 font-semibold text-[#1E8E6E]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1E8E6E]" /> Total Reports
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-[#2E9E6B]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2E9E6B]" /> Resolved
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E3EAE7" />
                <XAxis dataKey="date" stroke="#6B7C77" fontSize={11} />
                <YAxis stroke="#6B7C77" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    border: '1px solid #E3EAE7',
                    fontSize: '12px'
                  }}
                />
                <Line type="monotone" dataKey="total" stroke="#1E8E6E" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="resolved" stroke="#2E9E6B" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Categories Horizontal Bars */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-[#E3EAE7] shadow-civic-card space-y-4">
          <div>
            <h3 className="text-base font-bold text-[#14231F]">
              {t('admin.cityOverview.categoriesTitle')}
            </h3>
            <p className="text-xs text-[#6B7C77]">
              Distribution by civic infrastructure domain
            </p>
          </div>

          <div className="space-y-3 pt-1">
            {categoryDistribution.map((item) => (
              <div key={item.label} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#14231F]">{item.label}</span>
                  <span className="font-mono text-[#6B7C77]">{item.count.toLocaleString()} ({item.percent}%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#E3EAE7] overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${item.percent}%`, backgroundColor: item.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Issue Panel & Overdue Tickets Grid (Screen 9) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Selected Issue Panel (Left) */}
        {selectedTicket && (
          <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-[#E3EAE7] shadow-civic-card space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#6B7C77]">
                  Selected Triage Incident
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-mono text-lg font-bold text-[#14231F]">{selectedTicket.code}</span>
                  <PriorityBadge priority={selectedTicket.priorityLabel} />
                </div>
              </div>
              <Link to={`/admin/tickets/${selectedTicket.id}`}>
                <Button size="sm" variant="secondary">
                  Open Detail →
                </Button>
              </Link>
            </div>

            <p className="text-xs text-[#14231F] line-clamp-2">
              {selectedTicket.text}
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl overflow-hidden border border-[#E3EAE7] aspect-video">
                <Img src={selectedTicket.beforePhoto} alt={selectedTicket.text} aspectRatio="aspect-video" className="w-full h-full" />
              </div>
              <CivicMap
                center={[selectedTicket.lat, selectedTicket.lng]}
                zoom={14}
                className="h-full aspect-video"
                markers={[{ id: selectedTicket.id, position: [selectedTicket.lat, selectedTicket.lng], title: selectedTicket.code }]}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-[#6B7C77] pt-2 border-t border-[#E3EAE7]">
              <span>Assigned: <strong>{selectedTicket.assignedTo || 'Unassigned'}</strong></span>
              <span className="font-mono">Score: {selectedTicket.priorityScore}/100</span>
            </div>
          </div>
        )}

        {/* Urgent SLA Overdue List (Right) */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-[#E3EAE7] shadow-civic-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#D64545] flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                {t('admin.cityOverview.overdueTitle')}
              </h3>
              <p className="text-xs text-[#6B7C77]">
                Requires immediate escalation or priority crew re-dispatch
              </p>
            </div>
            <Link to="/admin/queue?overdue=true" className="text-xs font-bold text-[#1E8E6E] hover:underline">
              View all ({overdueCount}) →
            </Link>
          </div>

          <div className="space-y-2.5">
            {overdueList.map((t) => (
              <div
                key={t.id}
                onClick={() => setSelectedTicket(t)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  selectedTicket?.id === t.id
                    ? 'border-[#D64545] bg-[#FBE6E6]/40 ring-1 ring-[#D64545]'
                    : 'border-[#E3EAE7] bg-[#F5F8F7]/40 hover:bg-[#F5F8F7]'
                }`}
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#14231F]">{t.code}</span>
                    <PriorityBadge priority={t.priorityLabel} />
                    <span className="text-[10px] text-[#D64545] font-bold">⚠️ EXCEEDED 72H</span>
                  </div>
                  <p className="text-xs text-[#14231F] truncate font-medium">{t.text}</p>
                </div>
                <div className="text-end shrink-0">
                  <span className="text-xs font-mono font-bold text-[#14231F] block">{t.priorityScore}</span>
                  <span className="text-[10px] text-[#6B7C77] block">{t.area}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

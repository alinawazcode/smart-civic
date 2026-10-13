import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  Smile,
  RotateCcw,
  Calendar,
  Layers
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';

export const Analytics: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'overview' | 'categories' | 'sla' | 'trends'>('overview');
  const [dateRange, setDateRange] = useState<'7' | '30' | '90'>('30');

  // Category donut chart data
  const donutData = [
    { name: 'Roads & Potholes', value: 4820, color: '#1E8E6E' },
    { name: 'Streetlights', value: 3240, color: '#E8731A' },
    { name: 'Drainage & Sewerage', value: 2150, color: '#2F7DD1' },
    { name: 'Garbage & Waste', value: 1420, color: '#B88A0B' },
    { name: 'Water Leakage', value: 850, color: '#9333EA' }
  ];

  // Monthly Total vs Resolved Bar data
  const monthlyData = [
    { month: 'May', total: 1100, resolved: 980 },
    { month: 'Jun', total: 1450, resolved: 1290 },
    { month: 'Jul', total: 1800, resolved: 1610 },
    { month: 'Aug', total: 2200, resolved: 1950 },
    { month: 'Sep', total: 2600, resolved: 2320 },
    { month: 'Oct', total: 3100, resolved: 2740 }
  ];

  // SLA compliance by department
  const slaDeptData = [
    { dept: 'Electrical & Lighting', compliance: 96.4 },
    { dept: 'Roads & Highways', compliance: 94.2 },
    { dept: 'Solid Waste Mgmt', compliance: 98.8 },
    { dept: 'Water & Sewerage', compliance: 91.5 },
    { dept: 'Municipal Works', compliance: 93.0 }
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#14231F]">
            {t('admin.analytics.title')}
          </h1>
          <p className="text-xs text-[#6B7C77] mt-0.5">
            {t('admin.analytics.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#6B7C77]" />
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

      {/* KPI Cards (Screen 12) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-[#E3EAE7] shadow-civic-sm space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#6B7C77] block">
            {t('home.stats.total')}
          </span>
          <div className="text-3xl font-extrabold text-[#14231F] font-mono">
            12,480
          </div>
          <span className="text-xs text-[#1E8E6E] font-medium block">
            ↑ +12.4% intake velocity
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E3EAE7] shadow-civic-sm space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#6B7C77] block">
            {t('admin.analytics.avgResolution')}
          </span>
          <div className="text-3xl font-extrabold text-[#1E8E6E] font-mono">
            38.4 hrs
          </div>
          <span className="text-xs text-[#2E9E6B] font-medium block">
            ↓ 4.2h faster than baseline
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E3EAE7] shadow-civic-sm space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#6B7C77] block">
            {t('admin.analytics.slaCompliance')}
          </span>
          <div className="text-3xl font-extrabold text-[#2E9E6B] font-mono">
            98.2%
          </div>
          <span className="text-xs text-[#2E9E6B] font-medium block">
            Exceeds 95% civic mandate
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E3EAE7] shadow-civic-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#6B7C77]">
              {t('admin.analytics.satisfaction')}
            </span>
            <span className="text-[10px] bg-[#F5F8F7] px-1.5 py-0.5 rounded font-mono text-[#6B7C77]">
              Sample
            </span>
          </div>
          <div className="text-3xl font-extrabold text-[#B88A0B] font-mono">
            4.6 / 5.0
          </div>
          <span className="text-xs text-[#6B7C77] block">
            Based on post-closure survey
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E3EAE7] overflow-x-auto pb-px">
        {[
          { id: 'overview', label: 'Overview & Distribution' },
          { id: 'categories', label: 'Categories' },
          { id: 'sla', label: 'SLA Compliance' },
          { id: 'trends', label: 'Monthly Growth' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === tab.id
                ? 'border-[#1E8E6E] text-[#1E8E6E]'
                : 'border-transparent text-[#6B7C77] hover:text-[#14231F]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Charts Grid (Screen 12) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Donut Chart with Legend */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-[#E3EAE7] shadow-civic-card space-y-4">
          <div>
            <h3 className="text-base font-bold text-[#14231F]">
              Complaints by Infrastructure Category
            </h3>
            <p className="text-xs text-[#6B7C77]">
              Proportional distribution across urban domains
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`${val.toLocaleString()} reports`, 'Volume']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #E3EAE7', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E3EAE7] text-xs">
            {donutData.map((d) => (
              <div key={d.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                <span className="text-[#14231F] truncate">{d.name}:</span>
                <span className="font-mono text-[#6B7C77] font-semibold">{d.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Intake vs Resolution Bars */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-[#E3EAE7] shadow-civic-card space-y-4">
          <div>
            <h3 className="text-base font-bold text-[#14231F]">
              Monthly Intake vs Resolution Volume
            </h3>
            <p className="text-xs text-[#6B7C77]">
              Resolution throughput scaling with intake over 6 months
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E3EAE7" />
                <XAxis dataKey="month" stroke="#6B7C77" fontSize={11} />
                <YAxis stroke="#6B7C77" fontSize={11} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #E3EAE7', fontSize: '12px' }}
                />
                <Legend />
                <Bar dataKey="total" name="Complaints Filed" fill="#1E8E6E" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resolved" name="Verified Resolved" fill="#2E9E6B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#E3EAE7] text-xs text-[#6B7C77]">
            <span>Reopen Rate: <strong className="text-[#14231F]">3.1%</strong></span>
            <span>Median First Response: <strong className="text-[#14231F]">1.8 hours</strong></span>
          </div>
        </div>

        {/* SLA Compliance by Department */}
        <div className="lg:col-span-12 bg-white rounded-2xl p-6 border border-[#E3EAE7] shadow-civic-card space-y-4">
          <div>
            <h3 className="text-base font-bold text-[#14231F]">
              SLA Compliance by Department
            </h3>
            <p className="text-xs text-[#6B7C77]">
              Percentage of tickets resolved within mandated 72-hour timeframe
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            {slaDeptData.map((d) => (
              <div key={d.dept} className="p-4 rounded-xl bg-[#F5F8F7] border border-[#E3EAE7] space-y-2">
                <span className="text-xs font-semibold text-[#14231F] block truncate">
                  {d.dept}
                </span>
                <div className="text-2xl font-extrabold text-[#1E8E6E] font-mono">
                  {d.compliance}%
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#E3EAE7] overflow-hidden">
                  <div className="h-full bg-[#1E8E6E]" style={{ width: `${d.compliance}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

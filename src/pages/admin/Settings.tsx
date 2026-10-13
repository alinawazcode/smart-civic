import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Settings as SettingsIcon,
  Plus,
  Save,
  Check,
  CheckCircle2,
  Sliders,
  Clock,
  Cpu,
  Users,
  X
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { AccountsManagement } from './AccountsManagement';

interface CategoryRow {
  id: string;
  name: string;
  desc: string;
  slaHours: number;
  safetyRisk: 'High' | 'Medium' | 'Low';
  active: boolean;
}

export const Settings: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'categories' | 'weights' | 'sla' | 'system' | 'users'>('categories');
  const [msg, setMsg] = useState('');

  // Categories Tab State
  const [categories, setCategories] = useState<CategoryRow[]>([
    { id: 'streetlight', name: 'Streetlights', desc: 'Broken poles, sodium/LED outages, exposed wires', slaHours: 72, safetyRisk: 'High', active: true },
    { id: 'road_damage', name: 'Roads & Potholes', desc: 'Asphalt craters, cave-ins, shoulder erosion', slaHours: 72, safetyRisk: 'High', active: true },
    { id: 'garbage', name: 'Garbage & Waste', desc: 'Overflowing dumpsters, illegal commercial dumping', slaHours: 24, safetyRisk: 'Medium', active: true },
    { id: 'water_leak', name: 'Water Leakage', desc: 'Main bursts, pipe seepage, contaminated supply', slaHours: 48, safetyRisk: 'High', active: true },
    { id: 'blocked_drain', name: 'Drainage & Sewerage', desc: 'Clogged storm channels, sewer backflow, flooding', slaHours: 48, safetyRisk: 'High', active: true }
  ]);

  // Add Category Dialog state
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatSla, setNewCatSla] = useState(72);
  const [newCatRisk, setNewCatRisk] = useState<'High' | 'Medium' | 'Low'>('Medium');

  // Weights Tab State
  const [weights, setWeights] = useState({ safety: 35, people: 25, urgency: 20, repeat: 20 });

  // System Thresholds State
  const [duplicateRadius, setDuplicateRadius] = useState(50); // 50m
  const [confidenceThreshold, setConfidenceThreshold] = useState(70); // 70%
  const [reopenWindowDays, setReopenWindowDays] = useState(7); // 7 days

  const handleToggleCategory = (id: string) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c))
    );
  };

  const handleSaveCategories = () => {
    setMsg('Category configuration and SLA policies saved.');
    setTimeout(() => setMsg(''), 3000);
  };

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const newCat: CategoryRow = {
      id: newCatName.toLowerCase().replace(/\s+/g, '_'),
      name: newCatName,
      desc: newCatDesc,
      slaHours: newCatSla,
      safetyRisk: newCatRisk,
      active: true
    };
    setCategories([...categories, newCat]);
    setNewCatName('');
    setNewCatDesc('');
    setAddDialogOpen(false);
    setMsg(`Added category "${newCat.name}" successfully.`);
    setTimeout(() => setMsg(''), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#14231F]">
            {t('admin.settings.title')}
          </h1>
          <p className="text-xs text-[#6B7C77] mt-0.5">
            {t('admin.settings.subtitle')}
          </p>
        </div>

        {activeTab === 'categories' && (
          <Button size="sm" onClick={() => setAddDialogOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
            {t('admin.settings.addCategory')}
          </Button>
        )}
      </div>

      {msg && (
        <div className="p-3.5 rounded-xl bg-[#E3F5EC] border border-[#C8EBD9] text-[#2E9E6B] text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{msg}</span>
        </div>
      )}

      {/* Settings Navigation Tabs (Screen 13) */}
      <div className="flex items-center gap-2 border-b border-[#E3EAE7] overflow-x-auto pb-px">
        {[
          { id: 'categories', label: t('admin.settings.tabs.categories'), icon: <SettingsIcon className="w-3.5 h-3.5" /> },
          { id: 'weights', label: t('admin.settings.tabs.weights'), icon: <Sliders className="w-3.5 h-3.5" /> },
          { id: 'sla', label: t('admin.settings.tabs.sla'), icon: <Clock className="w-3.5 h-3.5" /> },
          { id: 'system', label: t('admin.settings.tabs.system'), icon: <Cpu className="w-3.5 h-3.5" /> },
          { id: 'users', label: t('admin.settings.tabs.users'), icon: <Users className="w-3.5 h-3.5" /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === tab.id
                ? 'border-[#1E8E6E] text-[#1E8E6E]'
                : 'border-transparent text-[#6B7C77] hover:text-[#14231F]'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: Categories Table */}
      {activeTab === 'categories' && (
        <div className="bg-white rounded-2xl border border-[#E3EAE7] shadow-civic-card p-6 space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead className="bg-[#F5F8F7] border-b border-[#E3EAE7] font-semibold text-[#6B7C77]">
                <tr>
                  <th className="p-3 text-start">Category Name</th>
                  <th className="p-3 text-start">Scope & Description</th>
                  <th className="p-3 text-start">Mandated SLA</th>
                  <th className="p-3 text-start">Base Risk</th>
                  <th className="p-3 text-start">Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3EAE7]">
                {categories.map((c) => (
                  <tr key={c.id} className="hover:bg-[#F5F8F7]/50">
                    <td className="p-3 font-bold text-[#14231F] whitespace-nowrap">
                      {c.name}
                    </td>
                    <td className="p-3 text-[#6B7C77] max-w-sm">
                      {c.desc}
                    </td>
                    <td className="p-3 font-mono font-bold text-[#14231F] whitespace-nowrap">
                      {c.slaHours} hours
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        c.safetyRisk === 'High' ? 'bg-[#FDEBD8] text-[#E8731A]' : 'bg-[#FBF1D3] text-[#B88A0B]'
                      }`}>
                        {c.safetyRisk} Risk
                      </span>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={c.active}
                        onChange={() => handleToggleCategory(c.id)}
                        className="w-4 h-4 accent-[#1E8E6E] rounded cursor-pointer"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-4 flex justify-end border-t border-[#E3EAE7]">
            <Button size="md" onClick={handleSaveCategories} leftIcon={<Save className="w-4 h-4" />}>
              Save Category Changes
            </Button>
          </div>
        </div>
      )}

      {/* TAB 2: Weights Configuration */}
      {activeTab === 'weights' && (
        <div className="bg-white rounded-2xl border border-[#E3EAE7] shadow-civic-card p-6 space-y-6">
          <div>
            <h3 className="text-base font-bold text-[#14231F]">Default Algorithmic Priority Weights</h3>
            <p className="text-xs text-[#6B7C77]">
              These default values power the automated multi-factor triage queue upon new ticket creation.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs font-bold">
            <div className="p-4 rounded-xl bg-[#F5F8F7] border border-[#E3EAE7]">
              <span>Public Safety Risk:</span>
              <span className="font-mono text-base text-[#E8731A] block mt-1">{weights.safety}%</span>
            </div>
            <div className="p-4 rounded-xl bg-[#F5F8F7] border border-[#E3EAE7]">
              <span>Population Impact:</span>
              <span className="font-mono text-base text-[#2F7DD1] block mt-1">{weights.people}%</span>
            </div>
            <div className="p-4 rounded-xl bg-[#F5F8F7] border border-[#E3EAE7]">
              <span>Urgency & SLA Age:</span>
              <span className="font-mono text-base text-[#B88A0B] block mt-1">{weights.urgency}%</span>
            </div>
            <div className="p-4 rounded-xl bg-[#F5F8F7] border border-[#E3EAE7]">
              <span>Repeat Reports & Clusters:</span>
              <span className="font-mono text-base text-[#1E8E6E] block mt-1">{weights.repeat}%</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SLA Policies */}
      {activeTab === 'sla' && (
        <div className="bg-white rounded-2xl border border-[#E3EAE7] shadow-civic-card p-6 space-y-4">
          <h3 className="text-base font-bold text-[#14231F]">Standard Municipal SLA Windows</h3>
          <p className="text-xs text-[#6B7C77]">
            Resolution timelines enforced across Karachi municipal agencies.
          </p>

          <div className="space-y-3 pt-2 text-xs">
            <div className="p-3 rounded-xl bg-[#F5F8F7] flex justify-between items-center">
              <span>Immediate Hazard / Burst Water Main</span>
              <strong className="font-mono text-[#D64545]">24 Hours</strong>
            </div>
            <div className="p-3 rounded-xl bg-[#F5F8F7] flex justify-between items-center">
              <span>Solid Waste Accumulation</span>
              <strong className="font-mono text-[#E8731A]">24 Hours</strong>
            </div>
            <div className="p-3 rounded-xl bg-[#F5F8F7] flex justify-between items-center">
              <span>Dark Arterial Streetlight Cluster</span>
              <strong className="font-mono text-[#1E8E6E]">48 Hours</strong>
            </div>
            <div className="p-3 rounded-xl bg-[#F5F8F7] flex justify-between items-center">
              <span>Asphalt Road Repair / Pothole</span>
              <strong className="font-mono text-[#1E8E6E]">72 Hours</strong>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: System Thresholds */}
      {activeTab === 'system' && (
        <div className="bg-white rounded-2xl border border-[#E3EAE7] shadow-civic-card p-6 space-y-6">
          <div>
            <h3 className="text-base font-bold text-[#14231F]">System Intelligence Thresholds</h3>
            <p className="text-xs text-[#6B7C77]">Automated spatial clustering & classification limits</p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-[#F5F8F7] border border-[#E3EAE7] flex items-center justify-between">
              <div>
                <strong className="text-[#14231F] block">Spatial Deduplication Radius</strong>
                <span className="text-[#6B7C77]">Max distance between tickets considered duplicates</span>
              </div>
              <span className="font-mono text-sm font-bold text-[#1E8E6E]">{duplicateRadius} meters</span>
            </div>

            <div className="p-4 rounded-xl bg-[#F5F8F7] border border-[#E3EAE7] flex items-center justify-between">
              <div>
                <strong className="text-[#14231F] block">Automated Dispatch Confidence Cutoff</strong>
                <span className="text-[#6B7C77]">Cases below this trigger human Review Queue</span>
              </div>
              <span className="font-mono text-sm font-bold text-[#1E8E6E]">{confidenceThreshold}%</span>
            </div>

            <div className="p-4 rounded-xl bg-[#F5F8F7] border border-[#E3EAE7] flex items-center justify-between">
              <div>
                <strong className="text-[#14231F] block">Resident Reopen Window</strong>
                <span className="text-[#6B7C77]">Days allowed for resident to reopen after closure</span>
              </div>
              <span className="font-mono text-sm font-bold text-[#1E8E6E]">{reopenWindowDays} days</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: User & Staff Account Management */}
      {activeTab === 'users' && <AccountsManagement />}

      {/* Add Category Dialog Modal */}
      {addDialogOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-[#E3EAE7] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#14231F]">Add Civic Category</h3>
              <button onClick={() => setAddDialogOpen(false)} className="text-[#6B7C77] hover:text-[#14231F]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCategorySubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#14231F] block mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. Broken Traffic Signals"
                  className="w-full p-2.5 rounded-lg border border-[#E3EAE7] text-xs text-[#14231F]"
                />
              </div>

              <div>
                <label className="font-bold text-[#14231F] block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  placeholder="Physical description..."
                  className="w-full p-2.5 rounded-lg border border-[#E3EAE7] text-xs text-[#14231F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#14231F] block mb-1">SLA Hours</label>
                  <input
                    type="number"
                    min="12"
                    max="168"
                    value={newCatSla}
                    onChange={(e) => setNewCatSla(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-[#E3EAE7] text-xs text-[#14231F]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#14231F] block mb-1">Base Risk Level</label>
                  <select
                    value={newCatRisk}
                    onChange={(e) => setNewCatRisk(e.target.value as any)}
                    className="w-full p-2 rounded-lg border border-[#E3EAE7] text-xs text-[#14231F] bg-white"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <Button size="sm" variant="secondary" type="button" onClick={() => setAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" type="submit">
                  Save Category
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

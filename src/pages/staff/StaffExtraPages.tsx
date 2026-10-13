import React from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const StaffNotifications: React.FC = () => {
  const { t } = useTranslation();

  const notifications = [
    { id: 1, title: 'Urgent SLA Due Soon', desc: 'Ticket CC-2026-001242 (Khayaban-e-Shamsheer Pothole) has 4 hours remaining.', time: '10 mins ago', type: 'urgent' },
    { id: 2, title: 'Cluster Merged', desc: 'New citizen report attached to your active streetlight task in Gulshan.', time: '1 hour ago', type: 'info' },
    { id: 3, title: 'Admin Verification Approved', desc: 'Ticket CC-2026-001210 (North Nazimabad Drain) was successfully closed by Admin Director.', time: '3 hours ago', type: 'success' }
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold text-[#14231F]">Staff Task Notifications</h1>
        <p className="text-xs text-[#6B7C77] mt-0.5">Real-time alerts on SLA deadlines, cluster mergers, and closures</p>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-[#E3EAE7] shadow-civic-sm space-y-3">
        {notifications.map((n) => (
          <div key={n.id} className="p-4 rounded-xl border border-[#E3EAE7] bg-[#F5F8F7]/50 flex items-start gap-3">
            <div className={`p-2 rounded-lg shrink-0 ${n.type === 'urgent' ? 'bg-[#FBE6E6] text-[#D64545]' : n.type === 'success' ? 'bg-[#E3F5EC] text-[#2E9E6B]' : 'bg-[#E6F4EF] text-[#1E8E6E]'}`}>
              {n.type === 'urgent' ? <AlertTriangle className="w-4 h-4" /> : n.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#14231F]">{n.title}</h4>
                <span className="text-[10px] text-[#6B7C77]">{n.time}</span>
              </div>
              <p className="text-xs text-[#6B7C77] mt-0.5">{n.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const StaffProfile: React.FC = () => {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-extrabold text-[#14231F]">Field Crew Profile</h1>
        <p className="text-xs text-[#6B7C77] mt-0.5">Municipal field operative authentication details</p>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-[#E3EAE7] shadow-civic-card space-y-4">
        <div className="flex items-center gap-4 pb-4 border-b border-[#E3EAE7]">
          <div className="w-14 h-14 rounded-2xl bg-[#1E8E6E] text-white flex items-center justify-center font-bold text-xl">
            RM
          </div>
          <div>
            <h3 className="text-base font-bold text-[#14231F]">Rashid Minhas</h3>
            <span className="text-xs text-[#6B7C77]">Senior Field Operator · Electrical & Rapid Patch Unit</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-[#6B7C77] block">Department</span>
            <span className="font-semibold text-[#14231F]">Karachi Municipal Corporation (KMC)</span>
          </div>
          <div>
            <span className="text-[#6B7C77] block">Zone / District</span>
            <span className="font-semibold text-[#14231F]">District East & South</span>
          </div>
          <div>
            <span className="text-[#6B7C77] block">Assigned Unit</span>
            <span className="font-semibold text-[#14231F]">Electric Field Team C</span>
          </div>
          <div>
            <span className="text-[#6B7C77] block">Role Permissions</span>
            <span className="font-semibold text-[#1E8E6E]">Field Status & Resolution Evidence</span>
          </div>
        </div>
      </div>
    </div>
  );
};

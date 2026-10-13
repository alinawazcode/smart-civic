import React from 'react';
import { useTranslation } from 'react-i18next';
import { Status } from '../../types';

interface PriorityBadgeProps {
  priority: 'high' | 'medium' | 'low';
  className?: string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, className = '' }) => {
  const { t } = useTranslation();

  const styles = {
    high: 'bg-[#FDEBD8] text-[#E8731A] border-[#FBD8B7]',
    medium: 'bg-[#FBF1D3] text-[#B88A0B] border-[#F5E2A8]',
    low: 'bg-[#E3F5EC] text-[#2E9E6B] border-[#C8EBD9]'
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border badge-text leading-none ${styles[priority]} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full me-1.5 bg-current opacity-80" />
      {t(`priority.${priority}`)}
    </span>
  );
};

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const { t } = useTranslation();

  const styles: Record<Status, string> = {
    submitted: 'bg-[#E3EEFA] text-[#2F7DD1] border-[#C9E0F7]',
    triaged: 'bg-[#E6F4EF] text-[#1E8E6E] border-[#C2E7DA]',
    assigned: 'bg-[#FBF1D3] text-[#B88A0B] border-[#F5E2A8]',
    in_progress: 'bg-[#E3EEFA] text-[#2F7DD1] border-[#C9E0F7]',
    on_hold: 'bg-[#FBE6E6] text-[#D64545] border-[#F6C6C6]',
    resolved: 'bg-[#E3F5EC] text-[#2E9E6B] border-[#C8EBD9]',
    closed: 'bg-[#E3F5EC] text-[#2E9E6B] border-[#C8EBD9]',
    reopened: 'bg-[#FBE6E6] text-[#D64545] border-[#F6C6C6]'
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border badge-text leading-none ${styles[status] || styles.submitted} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full me-1.5 bg-current opacity-80" />
      {t(`status.${status}`)}
    </span>
  );
};

import React from 'react';

interface StatusBadgeProps {
  status?: string;
  className?: string;
}

export default function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  if (!status) return null;

  const getStatusStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'in repair':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'restricted':
        return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      default:
        return 'bg-surface-container-highest text-outline border-outline/20';
    }
  };

  return (
    <span className={`px-2 py-0.5 rounded-full border text-[9px] font-label uppercase tracking-widest ${getStatusStyles(status)} ${className}`}>
      {status}
    </span>
  );
}

import React from 'react';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'muted' | 'accent';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantMap: Record<BadgeVariant, string> = {
  success: 'badge-success',
  warning: 'badge-warning',
  danger: 'badge-danger',
  info: 'badge-info',
  muted: 'badge-muted',
  accent: 'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-900/40 text-cyan-400 border border-cyan-800/50',
};

export default function Badge({ variant = 'muted', children, className = '' }: BadgeProps) {
  return (
    <span className={`${variantMap[variant]} ${className}`}>
      {children}
    </span>
  );
}
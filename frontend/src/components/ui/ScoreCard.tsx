import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ScoreCardProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  trendLabel?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'hero';
  className?: string;
}

export default function ScoreCard({
  label,
  value,
  unit,
  trend,
  trendValue,
  trendLabel,
  icon,
  variant = 'default',
  className = '',
}: ScoreCardProps) {
  const variantStyles: Record<string, string> = {
    default: 'bg-card border-border',
    success: 'bg-emerald-950/40 border-emerald-800/40',
    warning: 'bg-amber-950/40 border-amber-800/40',
    danger: 'bg-red-950/40 border-red-800/40',
    info: 'bg-blue-950/40 border-blue-800/40',
    hero: 'bg-gradient-to-br from-blue-900/60 to-cyan-900/30 border-blue-700/40',
  };

  const trendColors: Record<string, string> = {
    up: 'text-success',
    down: 'text-danger',
    neutral: 'text-muted-foreground',
  };

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  return (
    <div
      className={`rounded-xl border p-4 card-shadow card-hover ${variantStyles[variant]} ${className}`}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="section-label">{label}</p>
        {icon && (
          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
            {icon}
          </div>
        )}
      </div>
      <div className="flex items-end gap-1.5">
        <span className="text-3xl font-bold text-foreground tabular-nums leading-none">
          {value}
        </span>
        {unit && <span className="text-sm text-muted-foreground mb-0.5">{unit}</span>}
      </div>
      {(trend || trendValue) && (
        <div className={`flex items-center gap-1 mt-2 ${trendColors[trend || 'neutral']}`}>
          <TrendIcon size={12} />
          <span className="text-xs font-medium">{trendValue}</span>
          {trendLabel && (
            <span className="text-xs text-muted-foreground">{trendLabel}</span>
          )}
        </div>
      )}
    </div>
  );
}
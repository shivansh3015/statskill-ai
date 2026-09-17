import React from 'react';

type SkillLevel = 'Beginner' | 'Foundation' | 'Intermediate' | 'Advanced' | 'Expert';

interface SkillCardProps {
  name: string;
  score: number;
  level: SkillLevel;
  previousScore?: number;
  category?: string;
  showProgress?: boolean;
  onClick?: () => void;
}

const levelConfig: Record<SkillLevel, { color: string; bg: string; border: string }> = {
  Beginner: { color: 'text-slate-400', bg: 'bg-slate-800', border: 'border-slate-700' },
  Foundation: { color: 'text-emerald-400', bg: 'bg-emerald-900/30', border: 'border-emerald-800/40' },
  Intermediate: { color: 'text-blue-400', bg: 'bg-blue-900/30', border: 'border-blue-800/40' },
  Advanced: { color: 'text-purple-400', bg: 'bg-purple-900/30', border: 'border-purple-800/40' },
  Expert: { color: 'text-amber-400', bg: 'bg-amber-900/30', border: 'border-amber-800/40' },
};

const scoreBarColor = (score: number) => {
  if (score >= 80) return 'bg-amber-500';
  if (score >= 65) return 'bg-purple-500';
  if (score >= 50) return 'bg-blue-500';
  if (score >= 35) return 'bg-emerald-500';
  return 'bg-slate-500';
};

export default function SkillCard({
  name,
  score,
  level,
  previousScore,
  category,
  showProgress = true,
  onClick,
}: SkillCardProps) {
  const cfg = levelConfig[level];
  const improvement = previousScore !== undefined ? score - previousScore : 0;

  return (
    <div
      className={`card-base p-4 card-hover ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{name}</p>
          {category && (
            <p className="text-xs text-muted-foreground mt-0.5">{category}</p>
          )}
        </div>
        <span
          className={`ml-2 shrink-0 text-2xs font-semibold px-2 py-0.5 rounded-full border ${cfg.color} ${cfg.bg} ${cfg.border}`}
        >
          {level}
        </span>
      </div>

      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl font-bold text-foreground tabular-nums">{score}</span>
        <span className="text-xs text-muted-foreground">/100</span>
      </div>

      {showProgress && (
        <div className="w-full h-1.5 bg-navy-600 rounded-full overflow-hidden mb-2">
          <div
            className={`h-full rounded-full progress-bar-fill ${scoreBarColor(score)}`}
            style={{ width: `${score}%` }}
          />
        </div>
      )}

      {previousScore !== undefined && (
        <div className="flex items-center justify-between mt-1">
          <span className="text-2xs text-muted-foreground">
            Prev: <span className="tabular-nums">{previousScore}</span>
          </span>
          <span
            className={`text-2xs font-semibold tabular-nums ${
              improvement > 0
                ? 'text-success'
                : improvement < 0
                ? 'text-danger' :'text-muted-foreground'
            }`}
          >
            {improvement > 0 ? '+' : ''}{improvement}
          </span>
        </div>
      )}
    </div>
  );
}
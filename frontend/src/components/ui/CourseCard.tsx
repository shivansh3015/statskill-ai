import React from 'react';
import Link from 'next/link';
import { BookOpen, ChevronRight, Clock, BarChart2 } from 'lucide-react';

type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';
type Priority = 'High' | 'Medium' | 'Low';

interface CourseCardProps {
  id: string;
  title: string;
  category: string;
  difficulty: Difficulty;
  relatedCompetency: string;
  competencyScore: number;
  priority: Priority;
  progress: number;
  duration: string;
  href?: string;
}

const difficultyStyles: Record<Difficulty, string> = {
  Beginner: 'badge-success',
  Intermediate: 'badge-info',
  Advanced: 'badge-warning',
};

const priorityStyles: Record<Priority, string> = {
  High: 'badge-danger',
  Medium: 'badge-warning',
  Low: 'badge-muted',
};

export default function CourseCard({
  id,
  title,
  category,
  difficulty,
  relatedCompetency,
  competencyScore,
  priority,
  progress,
  duration,
  href = '/courses',
}: CourseCardProps) {
  return (
    <div className="card-base p-4 card-hover flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={priorityStyles[priority]}>{priority} Priority</span>
            <span className={difficultyStyles[difficulty]}>{difficulty}</span>
          </div>
          <h3 className="text-sm font-semibold text-foreground leading-snug">{title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{category}</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-blue-900/30 border border-blue-800/30 flex items-center justify-center shrink-0">
          <BookOpen size={18} className="text-primary" />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <BarChart2 size={12} />
          {relatedCompetency}:{' '}
          <span
            className={`font-semibold tabular-nums ${
              competencyScore < 50 ? 'text-danger' : competencyScore < 70 ? 'text-warning' : 'text-success'
            }`}
          >
            {competencyScore}/100
          </span>
        </span>
        <span className="flex items-center gap-1">
          <Clock size={12} />
          {duration}
        </span>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-2xs text-muted-foreground">Progress</span>
          <span className="text-2xs font-semibold text-foreground tabular-nums">{progress}%</span>
        </div>
        <div className="w-full h-1.5 bg-navy-600 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-primary progress-bar-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <Link
        href={href}
        className="flex items-center justify-center gap-2 w-full bg-muted hover:bg-navy-600 border border-border text-foreground text-xs font-semibold py-2 rounded-lg transition-all duration-150 active:scale-95 mt-auto"
      >
        {progress > 0 ? 'Continue Learning' : 'Start Course'}
        <ChevronRight size={12} />
      </Link>
    </div>
  );
}
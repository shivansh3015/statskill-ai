import React from 'react';
import { Brain, TrendingUp, Award, BarChart2, CheckCircle2 } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


const features = [
  {
    id: 'feat-adaptive',
    icon: Brain,
    title: 'Adaptive AI Assessment',
    description: 'Questions calibrate in real-time based on your responses using IRT algorithms.',
  },
  {
    id: 'feat-gap',
    icon: TrendingUp,
    title: 'Precision Skill Gap Analysis',
    description: 'Identify exact competency deficits with domain-specific gap severity scoring.',
  },
  {
    id: 'feat-learning',
    icon: Award,
    title: 'Personalized Learning Paths',
    description: 'AI-curated course sequences mapped to your specific competency profile.',
  },
  {
    id: 'feat-analytics',
    icon: BarChart2,
    title: 'Competency Analytics',
    description: 'Track improvement across assessments with longitudinal competency charts.',
  },
];

const stats = [
  { id: 'stat-officers', value: '12,400+', label: 'Officers Assessed' },
  { id: 'stat-accuracy', value: '94.2%', label: 'Assessment Accuracy' },
  { id: 'stat-improvement', value: '+31%', label: 'Avg. Improvement' },
];

export default function LoginBrandPanel() {
  return (
    <div className="hidden lg:flex flex-col flex-1 bg-gradient-to-br from-navy-800 via-navy-900 to-background border-l border-border relative overflow-hidden px-12 xl:px-16 py-12 justify-between">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-72 h-72 rounded-full bg-accent/5 blur-3xl" />
        {/* Grid lines */}
        <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#3b82f6" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Top: Tagline */}
      <div className="relative z-10">
        <div className="inline-flex items-center gap-2 bg-blue-950/60 border border-blue-800/40 rounded-full px-3 py-1.5 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-accent pulse-dot" />
          <span className="text-xs font-semibold text-accent">Smart India Hackathon — SIH26101</span>
        </div>
        <h2 className="text-3xl xl:text-4xl font-bold text-foreground leading-tight mb-3">
          Develop Competencies{' '}
          <span className="text-gradient-blue">Intelligently</span>
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
          StatSkill AI uses adaptive AI assessment and personalized learning to close
          competency gaps in government statistical workforce.
        </p>
      </div>

      {/* Middle: Feature list */}
      <div className="relative z-10 space-y-4">
        {features?.map((f) => {
          const Icon = f?.icon;
          return (
            <div key={f?.id} className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-900/40 border border-blue-800/30 flex items-center justify-center shrink-0 mt-0.5">
                <Icon size={16} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{f?.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{f?.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom: Stats */}
      <div className="relative z-10">
        <div className="grid grid-cols-3 gap-4 p-4 bg-navy-700/60 border border-border rounded-xl backdrop-blur-sm">
          {stats?.map((s) => (
            <div key={s?.id} className="text-center">
              <p className="text-xl font-bold text-foreground tabular-nums">{s?.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s?.label}</p>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-4">
          <CheckCircle2 size={12} className="text-success" />
          <span className="text-xs text-muted-foreground">
            Approved by Ministry of Statistics & Programme Implementation
          </span>
        </div>
      </div>
    </div>
  );
}
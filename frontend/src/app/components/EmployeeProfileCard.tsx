'use client';

import React from 'react';
import { Mail, Building2, BadgeCheck, Award, ArrowRight, Loader2, Calendar, Hash,  } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


interface EmployeeUser {
  name: string;
  employeeId: string;
  role: string;
  department: string;
  organization: string;
  grade: string;
  joinedDate: string;
  lastAssessment: string;
  overallScore: number;
  completedCourses: number;
  skillGaps: number;
  initials: string;
  email: string;
}

interface EmployeeProfileCardProps {
  user: EmployeeUser;
  onContinue: () => void;
  redirecting: boolean;
}

export default function EmployeeProfileCard({
  user,
  onContinue,
  redirecting,
}: EmployeeProfileCardProps) {
  const scoreColor =
    user.overallScore >= 75
      ? 'text-success'
      : user.overallScore >= 55
      ? 'text-warning' :'text-danger';

  return (
    <div className="space-y-5 fade-in">
      {/* Profile header */}
      <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-blue-900/30 to-cyan-900/20 border border-blue-800/30">
        <div className="w-14 h-14 rounded-xl bg-primary-gradient flex items-center justify-center text-white text-lg font-bold shrink-0">
          {user.initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="text-base font-bold text-foreground">{user.name}</h3>
            <BadgeCheck size={16} className="text-accent shrink-0" />
          </div>
          <p className="text-sm text-primary font-medium">{user.role}</p>
          <p className="text-xs text-muted-foreground">{user.department}</p>
        </div>
        <div className="text-right shrink-0">
          <p className={`text-2xl font-bold tabular-nums ${scoreColor}`}>{user.overallScore}</p>
          <p className="text-2xs text-muted-foreground">Overall Score</p>
        </div>
      </div>

      {/* Employee details grid */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { id: 'detail-id', icon: Hash, label: 'Employee ID', value: user.employeeId },
          { id: 'detail-org', icon: Building2, label: 'Organization', value: user.organization },
          { id: 'detail-grade', icon: Award, label: 'Grade', value: user.grade },
          { id: 'detail-joined', icon: Calendar, label: 'Joined', value: user.joinedDate },
          { id: 'detail-email', icon: Mail, label: 'Email', value: user.email, span: true },
        ].map((d) => {
          const Icon = d.icon;
          return (
            <div
              key={d.id}
              className={`flex items-start gap-2.5 p-3 rounded-lg bg-muted border border-border ${
                (d as { span?: boolean }).span ? 'col-span-2' : ''
              }`}
            >
              <Icon size={14} className="text-muted-foreground mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-2xs text-muted-foreground">{d.label}</p>
                <p className="text-xs font-semibold text-foreground truncate mt-0.5">{d.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Competency summary stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-3 rounded-xl bg-blue-950/30 border border-blue-800/30">
          <p className="text-xl font-bold text-primary tabular-nums">{user.overallScore}</p>
          <p className="text-2xs text-muted-foreground mt-0.5">Competency Score</p>
        </div>
        <div className="text-center p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/30">
          <p className="text-xl font-bold text-success tabular-nums">{user.completedCourses}</p>
          <p className="text-2xs text-muted-foreground mt-0.5">Courses Done</p>
        </div>
        <div className="text-center p-3 rounded-xl bg-red-950/30 border border-red-800/30">
          <p className="text-xl font-bold text-danger tabular-nums">{user.skillGaps}</p>
          <p className="text-2xs text-muted-foreground mt-0.5">Skill Gaps</p>
        </div>
      </div>

      {/* Last assessment */}
      <div className="flex items-center gap-2 p-3 rounded-lg bg-muted border border-border text-xs text-muted-foreground">
        <Calendar size={12} className="shrink-0" />
        <span>Last assessment completed on <strong className="text-foreground">{user.lastAssessment}</strong></span>
      </div>

      {/* CTA */}
      <button
        onClick={onContinue}
        disabled={redirecting}
        className="w-full flex items-center justify-center gap-2 bg-primary hover:opacity-90 active:scale-95 disabled:opacity-70 text-white font-semibold py-3 rounded-xl transition-all duration-150"
      >
        {redirecting ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Loading Dashboard…
          </>
        ) : (
          <>
            Continue to Dashboard
            <ArrowRight size={16} />
          </>
        )}
      </button>
    </div>
  );
}
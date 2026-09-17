'use client';

import React, {
  useEffect,
  useState,
} from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Brain,
  Loader2,
  Sparkles,
} from 'lucide-react';

import AppLayout from '@/components/AppLayout';

import DashboardBentoGrid from './components/DashboardBentoGrid';
import DashboardChartsRow from './components/DashboardChartsRow';
import DashboardBottomRow from './components/DashboardBottomRow';

import { apiGet } from '@/lib/api';
import { getCurrentUserId } from '@/lib/auth';


interface DashboardUser {
  id: number;
  name: string;
  email: string;
  role: string | null;
  department: string | null;
}


interface DashboardResponse {
  user: DashboardUser;

  summary?: {
    overall_score?: number;
    total_skills?: number;
    strong_skills?: number;
    skill_gaps?: number;
    total_courses?: number;
    completed_courses?: number;
  };

  competencies?: unknown[];
  skill_gaps?: unknown[];
  recommendations?: unknown[];
  courses?: unknown[];
  improvement_history?: unknown[];
}


export default function DashboardPage() {
  const router = useRouter();

  const [
    dashboard,
    setDashboard,
  ] =
    useState<DashboardResponse | null>(
      null
    );

  const [
    ready,
    setReady,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState('');


  useEffect(() => {
    let cancelled = false;

    async function initializeDashboard() {
      const userId =
        getCurrentUserId();

      if (!userId) {
        router.replace('/');
        return;
      }

      try {
        setError('');

        const response =
          await apiGet<DashboardResponse>(
            `/dashboard/${userId}/full`
          );

        if (cancelled) {
          return;
        }

        setDashboard({
          ...response,
          competencies:
            Array.isArray(response.competencies)
              ? response.competencies
              : [],
          skill_gaps:
            Array.isArray(response.skill_gaps)
              ? response.skill_gaps
              : [],
          recommendations:
            Array.isArray(response.recommendations)
              ? response.recommendations
              : [],
          courses:
            Array.isArray(response.courses)
              ? response.courses
              : [],
          improvement_history:
            Array.isArray(
              response.improvement_history
            )
              ? response.improvement_history
              : [],
        });

        setReady(true);
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error(
          'Unable to load dashboard:',
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load your dashboard.'
        );
      }
    }

    initializeDashboard();

    return () => {
      cancelled = true;
    };
  }, [router]);


  const user =
    dashboard?.user ?? null;

  const subtitle =
    user
      ? `${user.role || 'Employee'} — ${
          user.department || 'General'
        }`
      : 'Loading your profile...';


  if (!ready) {
    return (
      <AppLayout
        pageTitle="Competency Dashboard"
        pageSubtitle={
          error
            ? 'Unable to load profile'
            : subtitle
        }
      >
        <div className="rounded-xl border border-border bg-card p-8">
          {error ? (
            <div className="rounded-xl border border-red-800/40 bg-red-950/30 p-4 text-sm text-red-300">
              {error}
            </div>
          ) : (
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading your competency dashboard...
            </div>
          )}
        </div>
      </AppLayout>
    );
  }


  if (!dashboard || !user) {
    return (
      <AppLayout
        pageTitle="Competency Dashboard"
        pageSubtitle="Unable to load profile"
      >
        <div className="rounded-xl border border-red-800/40 bg-red-950/30 p-5 text-sm text-red-300">
          Your dashboard profile could not be loaded.
        </div>
      </AppLayout>
    );
  }


  const competencies =
    dashboard.competencies ?? [];

  const skillGaps =
    dashboard.skill_gaps ?? [];

  const recommendations =
    dashboard.recommendations ?? [];

  const courses =
    dashboard.courses ?? [];

  const improvementHistory =
    dashboard.improvement_history ?? [];


  const hasDashboardData =
    competencies.length > 0 ||
    skillGaps.length > 0 ||
    recommendations.length > 0 ||
    courses.length > 0 ||
    improvementHistory.length > 0;


  return (
    <AppLayout
      pageTitle="Competency Dashboard"
      pageSubtitle={subtitle}
    >
      {!hasDashboardData ? (
        <div className="space-y-6">
          <div className="rounded-2xl border border-blue-700/30 bg-gradient-to-br from-blue-950/60 via-card to-cyan-950/30 p-8 lg:p-10">
            <div className="max-w-2xl">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-primary/30 bg-primary/15">
                <Brain
                  size={24}
                  className="text-primary"
                />
              </div>

              <div className="mb-2 flex items-center gap-2">
                <Sparkles
                  size={15}
                  className="text-accent"
                />

                <span className="text-xs font-semibold uppercase tracking-wider text-accent">
                  Your account is ready
                </span>
              </div>

              <h2 className="text-xl font-bold text-foreground">
                Start your first AI competency assessment
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
                Your dashboard is empty because this is a new account.
                Complete an adaptive assessment to create your competency
                scores, identify skill gaps, and unlock personalized course
                recommendations.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  href="/ai-assessment"
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                >
                  <Brain size={16} />
                  Start Assessment
                </Link>

                <span className="text-xs text-muted-foreground">
                  No previous assessment data is required.
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="card-base p-5">
              <p className="text-2xs font-semibold uppercase tracking-widest text-muted-foreground">
                Competencies
              </p>

              <p className="mt-2 text-2xl font-bold text-foreground">
                0
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Complete your first assessment to create your skill profile.
              </p>
            </div>

            <div className="card-base p-5">
              <p className="text-2xs font-semibold uppercase tracking-widest text-muted-foreground">
                Skill Gaps
              </p>

              <p className="mt-2 text-2xl font-bold text-foreground">
                0
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                StatSkill AI will identify development priorities after assessment.
              </p>
            </div>

            <div className="card-base p-5">
              <p className="text-2xs font-semibold uppercase tracking-widest text-muted-foreground">
                Courses
              </p>

              <p className="mt-2 text-2xl font-bold text-foreground">
                0
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Personalized recommendations will appear here automatically.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <DashboardBentoGrid />

          <DashboardChartsRow />

          <DashboardBottomRow />
        </div>
      )}
    </AppLayout>
  );
}

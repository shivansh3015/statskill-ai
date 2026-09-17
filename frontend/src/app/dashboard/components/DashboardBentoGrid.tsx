'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Brain,
  TrendingUp,
  Award,
  BookOpen,
  AlertTriangle,
  CheckCircle2,
  Zap,
  Target,
  BarChart2,
  ArrowRight,
} from 'lucide-react';

import { apiGet } from '@/lib/api';
import { getCurrentUserId } from '@/lib/auth';


type DashboardResponse = {
  user: {
    id: number;
    name: string;
    email: string;
    role: string | null;
    department: string | null;
  };

  summary: {
    overall_score: number;
    total_skills: number;
    strong_skills: number;
    skill_gaps: number;
    total_courses: number;
    completed_courses: number;
  };

  competencies: Array<{
    skill_name: string;
    score: number;
    level: string;
  }>;

  skill_gaps: Array<{
    skill_name: string;
    score: number;
    level: string;
    priority?: string;
  }>;

  recommendations: Array<{
    course_id: number;
    course_name: string;
    category: string;
    description?: string;
    difficulty: string;
    skill_gap: string;
    current_score: number;
    priority: string;
    progress: number;
    status: string;
  }>;

  courses: Array<{
    course_id: number;
    course_name: string;
    category: string;
    difficulty: string;
    progress: number;
    status: string;
    enrolled_at: string;
  }>;

  improvement_history: Array<{
    id: number;
    skill_name: string;
    previous_score: number;
    new_score: number;
    improvement: number;
    improvement_percentage: number;
    previous_level: string;
    new_level: string;
    source: string;
    created_at: string;
  }>;
};


export default function DashboardBentoGrid() {
  const [dashboard, setDashboard] =
    useState<DashboardResponse | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');


  useEffect(() => {
    async function loadDashboard() {
      const userId =
        getCurrentUserId();

      if (!userId) {
        setDashboard(null);
        setError(
          'Please sign in to view your dashboard.'
        );
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        const data = await apiGet<DashboardResponse>(
          `/dashboard/${userId}/full`
        );

        setDashboard(data);
      } catch (err) {
        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load dashboard.'
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);


  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-5 w-48 rounded bg-muted" />
          <div className="h-12 w-28 rounded bg-muted" />
          <div className="h-4 w-full rounded bg-muted" />
        </div>

        <p className="text-sm text-muted-foreground mt-4">
          Loading your competency dashboard...
        </p>
      </div>
    );
  }


  if (error) {
    return (
      <div className="rounded-xl border border-red-800/40 bg-red-950/30 p-5">
        <div className="flex items-center gap-2 text-red-400">
          <AlertTriangle size={18} />

          <p className="font-semibold">
            Dashboard could not be loaded
          </p>
        </div>

        <p className="text-sm text-muted-foreground mt-2">
          {error}
        </p>

        <p className="text-xs text-muted-foreground mt-2">
          Make sure FastAPI is running at
          http://127.0.0.1:8000
        </p>
      </div>
    );
  }


  if (!dashboard) {
    return null;
  }


  const overallScore =
    dashboard.summary?.overall_score ?? 0;

  const strongSkills =
    dashboard.summary?.strong_skills ?? 0;

  const skillGaps =
    dashboard.summary?.skill_gaps ?? 0;

  const totalSkills =
    dashboard.summary?.total_skills ?? 0;

  const completedCourses =
    dashboard.summary?.completed_courses ?? 0;


  const activeCourses =
    dashboard.courses.filter(
      (course) =>
        course.status !== 'Completed' &&
        course.progress < 100
    ).length;


  const highPriorityGaps =
    dashboard.skill_gaps.filter(
      (gap) =>
        gap.priority === 'High' ||
        gap.score < 50
    ).length;


  const latestHistory =
    dashboard.improvement_history?.[0];


  const latestImprovement =
    latestHistory?.improvement ?? 0;


  const latestPreviousScore =
    latestHistory?.previous_score ?? 0;


  const latestNewScore =
    latestHistory?.new_score ?? 0;


  const historyCount =
    dashboard.improvement_history?.length ?? 0;


  const latestAssessmentDate =
    latestHistory?.created_at
      ? new Date(
          latestHistory.created_at
        ).toLocaleDateString()
      : 'No assessment yet';


  const nextRecommendation =
    dashboard.recommendations?.[0];


  const nextRecommendedCourse =
    nextRecommendation?.course_name ??
    'No course required';


  const recommendationSkill =
    nextRecommendation?.skill_gap ??
    'No current priority gap';


  return (
    <div>

      {/* =====================================================
          AI ASSESSMENT CTA
      ===================================================== */}

      <div className="mb-5 p-4 rounded-xl bg-gradient-to-r from-blue-900/50 to-cyan-900/30 border border-blue-700/30 flex items-center justify-between gap-4 flex-wrap">

        <div className="flex items-center gap-3">

          <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
            <Brain
              size={20}
              className="text-primary"
            />
          </div>

          <div>

            <p className="text-sm font-semibold text-foreground">
              AI Adaptive Assessment
            </p>

            <p className="text-xs text-muted-foreground">
              Latest competency activity: {latestAssessmentDate}
            </p>

          </div>

        </div>


        <Link
          href="/ai-assessment"
          className="flex items-center gap-2 bg-primary hover:opacity-90 active:scale-95 transition-all duration-150 text-white text-sm font-semibold px-5 py-2.5 rounded-lg shrink-0"
        >
          <Zap size={16} />

          Start AI Assessment

          <ArrowRight size={14} />
        </Link>

      </div>


      {/* =====================================================
          DASHBOARD GRID
      ===================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-4">


        {/* ===================================================
            OVERALL COMPETENCY SCORE
        =================================================== */}

        <div className="lg:col-span-2 rounded-xl border border-blue-700/40 bg-gradient-to-br from-blue-900/50 to-cyan-900/20 card-shadow card-hover p-5 flex flex-col justify-between min-h-[140px]">

          <div className="flex items-start justify-between">

            <div>

              <p className="section-label mb-1">
                Overall Competency Score
              </p>

              <p className="text-2xs text-muted-foreground">
                Across {totalSkills} assessed competencies
              </p>

            </div>


            <div className="w-10 h-10 rounded-xl bg-blue-800/40 border border-blue-700/30 flex items-center justify-center">

              <Target
                size={20}
                className="text-primary"
              />

            </div>

          </div>


          <div className="flex items-end justify-between mt-3">

            <div>

              <div className="flex items-end gap-2">

                <span className="text-5xl font-bold text-foreground tabular-nums leading-none">
                  {overallScore}
                </span>

                <span className="text-lg text-muted-foreground mb-1">
                  /100
                </span>

              </div>


              <div className="flex items-center gap-1.5 mt-2">

                <TrendingUp
                  size={13}
                  className={
                    latestImprovement >= 0
                      ? 'text-success'
                      : 'text-danger'
                  }
                />

                <span
                  className={`text-sm font-semibold ${
                    latestImprovement >= 0
                      ? 'text-success'
                      : 'text-danger'
                  }`}
                >
                  {latestImprovement >= 0 ? '+' : ''}
                  {latestImprovement} pts
                </span>

                <span className="text-xs text-muted-foreground">
                  latest competency update
                </span>

              </div>

            </div>


            <div className="text-right">

              <p className="text-xs text-muted-foreground">
                Skills Assessed
              </p>

              <p className="text-2xl font-bold text-foreground tabular-nums">
                {totalSkills}
              </p>

              <p className="text-2xs text-muted-foreground">
                competency domains
              </p>

            </div>

          </div>


          <div className="mt-4 w-full h-1.5 bg-navy-600 rounded-full overflow-hidden">

            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 progress-bar-fill"
              style={{
                width: `${Math.min(
                  100,
                  Math.max(0, overallScore)
                )}%`,
              }}
            />

          </div>

        </div>


        {/* ===================================================
            STRONG SKILLS
        =================================================== */}

        <div className="rounded-xl border border-emerald-800/40 bg-emerald-950/30 card-shadow card-hover p-4 flex flex-col justify-between">

          <div className="flex items-start justify-between mb-3">

            <p className="section-label">
              Strong Skills
            </p>

            <div className="w-8 h-8 rounded-lg bg-emerald-900/40 flex items-center justify-center">

              <Award
                size={16}
                className="text-success"
              />

            </div>

          </div>


          <div>

            <span className="text-4xl font-bold text-foreground tabular-nums">
              {strongSkills}
            </span>

            <p className="text-xs text-muted-foreground mt-1.5">
              Competencies scoring 70 or above
            </p>

            <div className="flex items-center gap-1 mt-2 text-success">

              <CheckCircle2 size={12} />

              <span className="text-xs font-medium">
                {strongSkills} strong competencies
              </span>

            </div>

          </div>

        </div>


        {/* ===================================================
            SKILL GAPS
        =================================================== */}

        <div className="rounded-xl border border-red-800/40 bg-red-950/30 card-shadow card-hover p-4 flex flex-col justify-between">

          <div className="flex items-start justify-between mb-3">

            <p className="section-label text-red-400/80">
              Skill Gaps
            </p>

            <div className="w-8 h-8 rounded-lg bg-red-900/40 flex items-center justify-center">

              <AlertTriangle
                size={16}
                className="text-danger"
              />

            </div>

          </div>


          <div>

            <span className="text-4xl font-bold text-danger tabular-nums">
              {skillGaps}
            </span>

            <p className="text-xs text-muted-foreground mt-1.5">
              Competencies below the 70-point threshold
            </p>

            <div className="flex items-center gap-1 mt-2 text-danger">

              <AlertTriangle size={12} />

              <span className="text-xs font-medium">
                {highPriorityGaps} high-priority gap
                {highPriorityGaps === 1 ? '' : 's'}
              </span>

            </div>

          </div>

        </div>


        {/* ===================================================
            ACTIVE COURSES
        =================================================== */}

        <div className="rounded-xl border border-border bg-card card-shadow card-hover p-4 flex flex-col justify-between">

          <div className="flex items-start justify-between mb-3">

            <p className="section-label">
              Active Courses
            </p>

            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">

              <BookOpen
                size={16}
                className="text-primary"
              />

            </div>

          </div>


          <div>

            <span className="text-4xl font-bold text-foreground tabular-nums">
              {activeCourses}
            </span>

            <p className="text-xs text-muted-foreground mt-1.5">
              In progress â€” {completedCourses} completed total
            </p>

            <div className="flex items-center gap-1 mt-2 text-primary">

              <TrendingUp size={12} />

              <span className="text-xs font-medium">
                {dashboard.summary.total_courses} total enrolled
              </span>

            </div>

          </div>

        </div>


        {/* ===================================================
            ASSESSMENT RECORDS
        =================================================== */}

        <div className="rounded-xl border border-border bg-card card-shadow card-hover p-4 flex flex-col justify-between">

          <div className="flex items-start justify-between mb-3">

            <p className="section-label">
              Assessment Records
            </p>

            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">

              <Zap
                size={16}
                className="text-accent"
              />

            </div>

          </div>


          <div>

            <span className="text-4xl font-bold text-foreground tabular-nums">
              {historyCount}
            </span>

            <p className="text-xs text-muted-foreground mt-1.5">
              Tracked competency updates
            </p>

            <div className="flex items-center gap-1 mt-2 text-accent">

              <CheckCircle2 size={12} />

              <span className="text-xs font-medium">
                History stored automatically
              </span>

            </div>

          </div>

        </div>


        {/* ===================================================
            IMPROVEMENT
        =================================================== */}

        <div className="rounded-xl border border-border bg-card card-shadow card-hover p-4 flex flex-col justify-between">

          <div className="flex items-start justify-between mb-3">

            <p className="section-label">
              Latest Improvement
            </p>

            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">

              <BarChart2
                size={16}
                className="text-purple-400"
              />

            </div>

          </div>


          <div>

            <div className="flex items-end gap-1">

              <span
                className={`text-4xl font-bold tabular-nums ${
                  latestImprovement >= 0
                    ? 'text-success'
                    : 'text-danger'
                }`}
              >
                {latestImprovement >= 0 ? '+' : ''}
                {latestImprovement}
              </span>

              <span className="text-sm text-muted-foreground mb-1">
                pts
              </span>

            </div>


            <p className="text-xs text-muted-foreground mt-1.5">
              {latestHistory
                ? latestHistory.skill_name
                : 'No competency history yet'}
            </p>


            {latestHistory && (

              <div className="flex items-center gap-1 mt-2 text-success">

                <TrendingUp size={12} />

                <span className="text-xs font-medium">
                  {latestPreviousScore}
                  {' â†’ '}
                  {latestNewScore}
                </span>

              </div>

            )}

          </div>

        </div>


        {/* ===================================================
            AI RECOMMENDATION
        =================================================== */}

        <div className="lg:col-span-4 xl:col-span-4 2xl:col-span-4 rounded-xl border border-amber-800/30 bg-amber-950/20 card-shadow card-hover p-4 flex items-center justify-between gap-4 flex-wrap">

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-xl bg-amber-900/30 border border-amber-800/30 flex items-center justify-center shrink-0">

              <Brain
                size={18}
                className="text-warning"
              />

            </div>


            <div>

              <p className="section-label text-amber-500/80">
                AI Recommendation
              </p>

              <p className="text-sm font-semibold text-foreground mt-0.5">
                Next Course: {nextRecommendedCourse}
              </p>

              <p className="text-xs text-muted-foreground">
                Mapped to your priority skill gap: {recommendationSkill}
              </p>

            </div>

          </div>


          {nextRecommendation ? (

            <Link
              href="/courses"
              className="flex items-center gap-2 bg-amber-800/30 hover:bg-amber-800/50 border border-amber-700/30 text-amber-300 text-xs font-semibold px-4 py-2 rounded-lg transition-all duration-150 active:scale-95 shrink-0"
            >
              View Course

              <ArrowRight size={13} />
            </Link>

          ) : (

            <Link
              href="/ai-assessment"
              className="flex items-center gap-2 bg-amber-800/30 hover:bg-amber-800/50 border border-amber-700/30 text-amber-300 text-xs font-semibold px-4 py-2 rounded-lg transition-all duration-150 active:scale-95 shrink-0"
            >
              Reassess Skills

              <ArrowRight size={13} />
            </Link>

          )}

        </div>

      </div>

    </div>
  );
}

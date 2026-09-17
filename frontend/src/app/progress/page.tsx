'use client';

import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Clock,
  Loader2,
  RefreshCcw,
  Target,
  TrendingDown,
  TrendingUp,
  Trophy,
} from 'lucide-react';

import AppLayout from '@/components/AppLayout';
import { apiGet } from '@/lib/api';
import { getCurrentUserId } from '@/lib/auth';


interface Competency {
  id?: number;
  user_id?: number;
  skill_name: string;
  score: number;
  level: string;
}


interface Course {
  course_id: number;
  course_name: string;
  category: string;
  difficulty: string;
  progress: number;
  status: string;
  enrolled_at: string;
}


interface ImprovementHistory {
  id: number;

  skill_name: string;

  previous_score: number;
  new_score: number;

  improvement: number;
  improvement_percentage: number;

  previous_level: string;
  new_level: string;

  source: string;

  source_course_id?: number | null;
  source_course_name?: string | null;

  created_at: string;
}


interface DashboardResponse {
  summary: {
    overall_score: number;
    total_skills: number;
    strong_skills: number;
    skill_gaps: number;
    total_courses: number;
    completed_courses: number;
  };

  competencies: Competency[];

  courses: Course[];

  improvement_history: ImprovementHistory[];
}


function levelColor(
  level: string
) {
  const colors:
    Record<string, string> = {
      Beginner:
        'text-slate-400',

      Foundation:
        'text-emerald-400',

      Intermediate:
        'text-blue-400',

      Advanced:
        'text-purple-400',

      Expert:
        'text-amber-400',
    };

  return (
    colors[level] ||
    'text-muted-foreground'
  );
}


export default function ProgressPage() {
  const router = useRouter();

  const [
    dashboard,
    setDashboard,
  ] =
    useState<DashboardResponse | null>(
      null
    );


  const [
    loading,
    setLoading,
  ] =
    useState(true);


  const [
    error,
    setError,
  ] =
    useState('');


  useEffect(() => {
    async function loadProgress() {
      const userId =
        getCurrentUserId();

      if (!userId) {
        router.replace('/');
        return;
      }

      setLoading(true);

      setError('');

      try {
        const response =
          await apiGet<DashboardResponse>(
            `/dashboard/${userId}/full`
          );

        setDashboard(response);
      } catch (err) {
        console.error(
          'Progress loading error:',
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load progress.'
        );
      } finally {
        setLoading(false);
      }
    }

    loadProgress();
  }, [router]);


  const completedCourses =
    useMemo(
      () =>
        dashboard?.courses.filter(
          (course) =>
            course.progress >= 100 ||
            course.status
              .toLowerCase() ===
              'completed'
        ) || [],
      [dashboard]
    );


  const activeCourses =
    useMemo(
      () =>
        dashboard?.courses.filter(
          (course) =>
            course.progress < 100 &&
            course.status
              .toLowerCase() !==
              'completed'
        ) || [],
      [dashboard]
    );


  const latestImprovementBySkill =
    useMemo(
      () => {
        const map =
          new Map<
            string,
            ImprovementHistory
          >();

        dashboard?.improvement_history.forEach(
          (item) => {
            if (
              !map.has(
                item.skill_name
              )
            ) {
              map.set(
                item.skill_name,
                item
              );
            }
          }
        );

        return Array.from(
          map.values()
        );
      },
      [dashboard]
    );


  const averageImprovement =
    useMemo(
      () => {
        if (
          latestImprovementBySkill.length ===
          0
        ) {
          return 0;
        }

        const total =
          latestImprovementBySkill.reduce(
            (
              sum,
              item
            ) =>
              sum +
              item.improvement,
            0
          );

        return Math.round(
          total /
            latestImprovementBySkill.length
        );
      },
      [latestImprovementBySkill]
    );


  if (loading) {
    return (
      <AppLayout
        pageTitle="Learning Progress"
        pageSubtitle="Track competency development and learning impact."
      >
        <div className="card-base p-12 text-center">
          <Loader2
            size={32}
            className="animate-spin text-primary mx-auto"
          />

          <p className="text-sm font-semibold text-foreground mt-4">
            Loading your progress...
          </p>
        </div>
      </AppLayout>
    );
  }


  if (
    error ||
    !dashboard
  ) {
    return (
      <AppLayout
        pageTitle="Learning Progress"
        pageSubtitle="Track competency development and learning impact."
      >
        <div className="card-base p-8 text-center">
          <AlertTriangle
            size={30}
            className="text-danger mx-auto"
          />

          <p className="text-sm text-danger mt-3">
            {error ||
              'Unable to load progress.'}
          </p>
        </div>
      </AppLayout>
    );
  }


  return (
    <AppLayout
      pageTitle="Learning Progress"
      pageSubtitle="Track competency development and learning impact."
    >
      <div className="space-y-6">

        {/* Summary cards */}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

          <div className="card-base p-4">
            <Target
              size={18}
              className="text-primary mb-3"
            />

            <p className="text-3xl font-bold text-foreground">
              {
                dashboard.summary
                  .overall_score
              }
            </p>

            <p className="text-xs text-muted-foreground mt-1">
              Overall Competency
            </p>
          </div>


          <div className="card-base p-4">
            <CheckCircle2
              size={18}
              className="text-success mb-3"
            />

            <p className="text-3xl font-bold text-foreground">
              {
                completedCourses.length
              }
            </p>

            <p className="text-xs text-muted-foreground mt-1">
              Courses Completed
            </p>
          </div>


          <div className="card-base p-4">
            <BookOpen
              size={18}
              className="text-blue-400 mb-3"
            />

            <p className="text-3xl font-bold text-foreground">
              {activeCourses.length}
            </p>

            <p className="text-xs text-muted-foreground mt-1">
              Active Courses
            </p>
          </div>


          <div className="card-base p-4">
            <TrendingUp
              size={18}
              className="text-emerald-400 mb-3"
            />

            <p
              className={`text-3xl font-bold ${
                averageImprovement >= 0
                  ? 'text-success'
                  : 'text-danger'
              }`}
            >
              {averageImprovement >= 0
                ? '+'
                : ''}

              {averageImprovement}
            </p>

            <p className="text-xs text-muted-foreground mt-1">
              Avg. Skill Improvement
            </p>
          </div>

        </div>


        {/* Competencies */}

        <div className="card-base p-5">

          <div className="flex items-center justify-between gap-4 mb-5">

            <div>
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <BarChart3
                  size={16}
                  className="text-primary"
                />

                Current Competency Profile
              </h2>

              <p className="text-xs text-muted-foreground mt-1">
                Your latest competency scores after assessments and reassessments.
              </p>
            </div>


            <span className="badge-info">
              {
                dashboard
                  .competencies.length
              }{' '}
              skills
            </span>
          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {dashboard.competencies.map(
              (skill) => (
                <div
                  key={
                    skill.skill_name
                  }
                  className="p-4 rounded-xl bg-muted border border-border"
                >
                  <div className="flex items-center justify-between">

                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {
                          skill.skill_name
                        }
                      </p>

                      <p
                        className={`text-xs font-semibold mt-1 ${levelColor(
                          skill.level
                        )}`}
                      >
                        {skill.level}
                      </p>
                    </div>


                    <span className="text-xl font-bold text-foreground">
                      {skill.score}
                    </span>
                  </div>


                  <div className="w-full h-2 bg-navy-600 rounded-full overflow-hidden mt-3">

                    <div
                      className="h-full bg-primary rounded-full"
                      style={{
                        width:
                          `${Math.min(
                            100,
                            Math.max(
                              0,
                              skill.score
                            )
                          )}%`,
                      }}
                    />

                  </div>
                </div>
              )
            )}

          </div>
        </div>


        {/* Learning progress */}

        <div className="card-base p-5">

          <div className="flex items-center justify-between gap-4 mb-5">

            <div>
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <BookOpen
                  size={16}
                  className="text-primary"
                />

                Course Progress
              </h2>

              <p className="text-xs text-muted-foreground mt-1">
                Progress for all courses currently enrolled.
              </p>
            </div>


            <Link
              href="/courses"
              className="text-xs font-semibold text-primary flex items-center gap-1"
            >
              Manage Courses

              <ArrowRight
                size={12}
              />
            </Link>
          </div>


          {dashboard.courses.length ===
          0 ? (
            <p className="text-sm text-muted-foreground">
              No enrolled courses.
            </p>
          ) : (
            <div className="space-y-4">

              {dashboard.courses.map(
                (course) => (
                  <div
                    key={
                      course.course_id
                    }
                    className="p-4 rounded-xl bg-muted border border-border"
                  >

                    <div className="flex items-start justify-between gap-4">

                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {
                            course.course_name
                          }
                        </p>

                        <p className="text-xs text-muted-foreground mt-1">
                          {
                            course.category
                          }
                          {' • '}
                          {
                            course.difficulty
                          }
                        </p>
                      </div>


                      {course.progress >=
                      100 ? (
                        <CheckCircle2
                          size={18}
                          className="text-success"
                        />
                      ) : (
                        <Clock
                          size={18}
                          className="text-primary"
                        />
                      )}
                    </div>


                    <div className="flex justify-between mt-4 mb-2">

                      <span
                        className={`text-xs font-semibold ${
                          course.progress >=
                          100
                            ? 'text-success'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {
                          course.status
                        }
                      </span>


                      <span className="text-xs font-bold text-foreground">
                        {
                          course.progress
                        }
                        %
                      </span>
                    </div>


                    <div className="w-full h-2 bg-navy-600 rounded-full overflow-hidden">

                      <div
                        className="h-full bg-primary rounded-full"
                        style={{
                          width:
                            `${Math.min(
                              100,
                              course.progress
                            )}%`,
                        }}
                      />

                    </div>

                  </div>
                )
              )}

            </div>
          )}

        </div>


        {/* Before vs after */}

        <div className="card-base p-5">

          <div className="flex items-center justify-between gap-4 mb-5">

            <div>
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Trophy
                  size={16}
                  className="text-warning"
                />

                Before vs After
              </h2>

              <p className="text-xs text-muted-foreground mt-1">
                Latest measured competency change by skill.
              </p>
            </div>


            <Link
              href="/ai-assessment"
              className="text-xs font-semibold text-primary flex items-center gap-1"
            >
              Reassess

              <RefreshCcw
                size={12}
              />
            </Link>
          </div>


          {latestImprovementBySkill.length ===
          0 ? (
            <p className="text-sm text-muted-foreground">
              No competency improvement history is available yet.
            </p>
          ) : (
            <div className="space-y-3">

              {latestImprovementBySkill.map(
                (item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl bg-muted border border-border flex items-center justify-between gap-5 flex-wrap"
                  >

                    <div className="min-w-[150px]">
                      <p className="text-sm font-semibold text-foreground">
                        {
                          item.skill_name
                        }
                      </p>

                      <p className="text-xs text-muted-foreground mt-1">
                        {
                          item.previous_level
                        }
                        {' → '}
                        {
                          item.new_level
                        }
                      </p>

                      <p className="text-2xs text-muted-foreground mt-1">
                        Source:{' '}
                        {
                          item.source
                        }
                      </p>

                      {item.source_course_name && (
                        <p className="text-2xs text-muted-foreground mt-1">
                          Course:{' '}
                          <span className="text-foreground font-medium">
                            {item.source_course_name}
                          </span>
                        </p>
                      )}
                    </div>


                    <div className="flex items-center gap-5">

                      <div className="text-center">
                        <p className="text-2xs text-muted-foreground">
                          Before
                        </p>

                        <p className="text-lg font-bold text-foreground">
                          {
                            item.previous_score
                          }
                        </p>
                      </div>


                      <ArrowRight
                        size={15}
                        className="text-muted-foreground"
                      />


                      <div className="text-center">
                        <p className="text-2xs text-muted-foreground">
                          After
                        </p>

                        <p className="text-lg font-bold text-primary">
                          {
                            item.new_score
                          }
                        </p>
                      </div>


                      <div
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg ${
                          item.improvement >=
                          0
                            ? 'bg-emerald-900/30 text-success'
                            : 'bg-red-900/30 text-danger'
                        }`}
                      >

                        {item.improvement >=
                        0 ? (
                          <TrendingUp
                            size={13}
                          />
                        ) : (
                          <TrendingDown
                            size={13}
                          />
                        )}


                        <span className="text-xs font-bold">
                          {item.improvement >=
                          0
                            ? '+'
                            : ''}

                          {
                            item.improvement
                          }
                        </span>
                      </div>

                    </div>

                  </div>
                )
              )}

            </div>
          )}

        </div>


        {/* Bottom actions */}

        <div className="flex gap-3 flex-wrap">

          <Link
            href="/courses"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-muted border border-border text-sm font-semibold text-foreground"
          >
            <BookOpen
              size={15}
            />

            Continue Learning
          </Link>


          <Link
            href="/ai-assessment"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold"
          >
            <Target
              size={15}
            />

            Start Assessment
          </Link>

        </div>

      </div>
    </AppLayout>
  );
}

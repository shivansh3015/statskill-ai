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
  BookOpen,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  GraduationCap,
  Loader2,
  PlayCircle,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
} from 'lucide-react';

import AppLayout from '@/components/AppLayout';

import {
  apiGet,
  apiPost,
} from '@/lib/api';

import {
  getCurrentUserId,
} from '@/lib/auth';


const IGOT_KARMAYOGI_URL =
  'https://igotkarmayogi.gov.in/';


interface Course {
  course_id: number;
  course_name: string;
  category: string;
  description?: string;
  difficulty: string;
  duration_hours?: number;
}


interface EnrolledCourse {
  course_id: number;
  course_name: string;
  category: string;
  difficulty: string;
  progress: number;
  status: string;
  enrolled_at: string;
}


interface Recommendation {
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
}


interface DashboardResponse {
  recommendations: Recommendation[];

  courses: EnrolledCourse[];

  skill_gaps: {
    skill_name: string;
    score: number;
    level: string;
    priority?: string;
  }[];
}


interface CourseSkillsResponse {
  course_id: number;
  course_name: string;
  skills: string[];
}


function normalizeDashboard(
  data: DashboardResponse
): DashboardResponse {
  return {
    recommendations:
      Array.isArray(
        data?.recommendations
      )
        ? data.recommendations
        : [],

    courses:
      Array.isArray(
        data?.courses
      )
        ? data.courses
        : [],

    skill_gaps:
      Array.isArray(
        data?.skill_gaps
      )
        ? data.skill_gaps
        : [],
  };
}


function openIGotKarmayogi(
  courseName: string
) {
  if (
    typeof navigator !==
      'undefined' &&
    navigator.clipboard
  ) {
    navigator.clipboard
      .writeText(courseName)
      .catch(() => {
        // Clipboard access can be blocked by
        // browser permissions. Opening iGOT must
        // still continue normally.
      });
  }

  if (
    typeof window !==
    'undefined'
  ) {
    const opened =
      window.open(
        IGOT_KARMAYOGI_URL,
        '_blank',
        'noopener,noreferrer'
      );

    if (opened) {
      opened.opener = null;
    }
  }
}


export default function CoursesPage() {
  const router =
    useRouter();

  const [
    userId,
    setUserId,
  ] =
    useState<number | null>(
      null
    );

  const [
    allCourses,
    setAllCourses,
  ] =
    useState<Course[]>([]);

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
    busyCourseId,
    setBusyCourseId,
  ] =
    useState<number | null>(
      null
    );

  const [
    message,
    setMessage,
  ] =
    useState('');

  const [
    error,
    setError,
  ] =
    useState('');


  async function loadData(
    activeUserId: number
  ) {
    setLoading(true);
    setError('');

    try {
      const [
        coursesResponse,
        dashboardResponse,
      ] =
        await Promise.all([
          apiGet<Course[]>(
            '/courses'
          ),

          apiGet<DashboardResponse>(
            `/dashboard/${activeUserId}/full`
          ),
        ]);

      setAllCourses(
        Array.isArray(
          coursesResponse
        )
          ? coursesResponse
          : []
      );

      setDashboard(
        normalizeDashboard(
          dashboardResponse
        )
      );

    } catch (err) {
      console.error(
        'Course loading error:',
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load courses.'
      );

    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    const activeUserId =
      getCurrentUserId();

    if (!activeUserId) {
      router.replace('/');
      return;
    }

    setUserId(
      activeUserId
    );

    loadData(
      activeUserId
    );

  }, [router]);


  const enrolledMap =
    useMemo(() => {
      const map =
        new Map<
          number,
          EnrolledCourse
        >();

      (
        dashboard?.courses ||
        []
      ).forEach(
        (course) => {
          map.set(
            course.course_id,
            course
          );
        }
      );

      return map;

    }, [dashboard]);


  const recommendedCourseIds =
    useMemo(
      () =>
        new Set(
          (
            dashboard?.recommendations ||
            []
          ).map(
            (course) =>
              course.course_id
          )
        ),
      [dashboard]
    );


  /*
   * iGOT integration mode used here:
   *
   * 1. Add the recommended course to the employee's
   *    StatSkill learning plan.
   * 2. Open the official iGOT Karmayogi portal.
   * 3. Copy the StatSkill course title so the employee
   *    can paste it into iGOT search.
   *
   * Actual iGOT enrollment/completion is performed by
   * the employee inside the official iGOT account.
   * Automatic verified sync can be added later when
   * official iGOT API/SSO credentials are available.
   */
  async function handleJoinOnIGot(
    courseId: number,
    courseName: string
  ) {
    if (!userId) {
      router.replace('/');
      return;
    }

    /*
     * Open immediately while still inside the user's
     * click event so browsers do not block the new tab.
     */
    openIGotKarmayogi(
      courseName
    );

    setBusyCourseId(
      courseId
    );

    setError('');
    setMessage('');

    try {
      if (
        !enrolledMap.has(
          courseId
        )
      ) {
        await apiPost(
          '/courses/enroll',
          {
            user_id:
              userId,

            course_id:
              courseId,
          }
        );
      }

      setMessage(
        `iGOT Karmayogi opened in a new tab. "${courseName}" was copied for search, and the course was added to your StatSkill learning plan. Sign in to iGOT to complete the official enrollment.`
      );

      await loadData(
        userId
      );

    } catch (err) {
      console.error(
        'StatSkill learning-plan enrollment error:',
        err
      );

      setError(
        err instanceof Error
          ? (
              `iGOT was opened, but StatSkill could not add the course to your local learning plan: ${err.message}`
            )
          : (
              'iGOT was opened, but StatSkill could not add the course to your local learning plan.'
            )
      );

    } finally {
      setBusyCourseId(
        null
      );
    }
  }


  function handleOpenIGot(
    courseName: string
  ) {
    openIGotKarmayogi(
      courseName
    );

    setError('');

    setMessage(
      `iGOT Karmayogi opened in a new tab. "${courseName}" was copied so you can paste it into the iGOT course search.`
    );
  }


  async function updateProgress(
    courseId: number,
    progress: number
  ) {
    if (!userId) {
      router.replace('/');
      return;
    }

    setBusyCourseId(
      courseId
    );

    setError('');
    setMessage('');

    try {
      const safeProgress =
        Math.max(
          0,
          Math.min(
            100,
            progress
          )
        );

      await apiPost(
        '/courses/progress',
        {
          user_id:
            userId,

          course_id:
            courseId,

          progress:
            safeProgress,
        }
      );

      setMessage(
        safeProgress >= 100
          ? (
              'Course marked complete in StatSkill. If this course was taken on iGOT Karmayogi, use this after completing it there; automatic iGOT completion sync requires official API access.'
            )
          : (
              'StatSkill learning progress updated. iGOT progress is not automatically synchronized yet.'
            )
      );

      await loadData(
        userId
      );

    } catch (err) {
      console.error(
        'Progress update error:',
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to update course progress.'
      );

    } finally {
      setBusyCourseId(
        null
      );
    }
  }


  async function handleReassessCourse(
    courseId: number
  ) {
    setBusyCourseId(
      courseId
    );

    setError('');
    setMessage('');

    try {
      const response =
        await apiGet<CourseSkillsResponse>(
          `/courses/${courseId}/skills`
        );

      if (
        !response.skills ||
        response.skills.length ===
          0
      ) {
        setError(
          'No competency skill is mapped to this course.'
        );

        return;
      }

      const skillParameter =
        response.skills.join('|');

      router.push(
        `/ai-assessment?reassessment=1&skills=${encodeURIComponent(
          skillParameter
        )}&course_id=${courseId}`
      );

    } catch (err) {
      console.error(
        'Reassessment error:',
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to start reassessment.'
      );

    } finally {
      setBusyCourseId(
        null
      );
    }
  }


  if (loading) {
    return (
      <AppLayout
        pageTitle="Learning & Courses"
        pageSubtitle="Recommended iGOT Karmayogi learning based on your competency gaps."
      >
        <div className="card-base p-12 text-center">

          <Loader2
            size={32}
            className="animate-spin text-primary mx-auto"
          />

          <p className="text-sm font-semibold text-foreground mt-4">
            Loading your learning plan...
          </p>

        </div>
      </AppLayout>
    );
  }


  return (
    <AppLayout
      pageTitle="Learning & Courses"
      pageSubtitle="Recommended iGOT Karmayogi learning based on your competency gaps."
    >

      <div className="space-y-6">

        {/* Success / information message */}

        {message && (

          <div className="p-4 rounded-xl border border-emerald-800/40 bg-emerald-950/30 flex items-start gap-2">

            <CheckCircle2
              size={16}
              className="text-success mt-0.5 shrink-0"
            />

            <p className="text-sm text-success leading-relaxed">
              {message}
            </p>

          </div>

        )}


        {/* Error */}

        {error && (

          <div className="p-4 rounded-xl border border-red-800/40 bg-red-950/30 flex items-start gap-2">

            <AlertTriangle
              size={16}
              className="text-danger mt-0.5 shrink-0"
            />

            <p className="text-sm text-danger leading-relaxed">
              {error}
            </p>

          </div>

        )}


        {/* iGOT integration banner */}

        <div className="card-base p-6 border-blue-700/40 bg-gradient-to-br from-blue-900/40 to-cyan-900/20">

          <div className="flex items-start justify-between gap-5 flex-wrap">

            <div className="flex items-start gap-4">

              <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">

                <ShieldCheck
                  size={23}
                  className="text-primary"
                />

              </div>


              <div className="max-w-3xl">

                <div className="flex items-center gap-2 flex-wrap">

                  <h2 className="text-lg font-bold text-foreground">
                    iGOT Karmayogi Learning Integration
                  </h2>

                  <span className="badge-info">
                    Official portal
                  </span>

                </div>


                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  StatSkill AI recommends learning from your measured skill gaps.
                  Use <span className="font-semibold text-foreground">Join on iGOT Karmayogi</span> to
                  open the official learning portal. The course title is copied automatically
                  so you can search for the relevant iGOT learning content after signing in.
                </p>


                <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                  StatSkill currently tracks the learning plan locally. Verified iGOT enrollment,
                  progress, and certificate synchronization can be connected later through official
                  Karmayogi Bharat API/SSO access.
                </p>

              </div>

            </div>


            <a
              href={IGOT_KARMAYOGI_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90"
            >
              Open iGOT Karmayogi
              <ExternalLink size={14} />
            </a>

          </div>

        </div>


        {/* AI learning plan summary */}

        <div className="card-base p-6">

          <div className="flex items-start justify-between gap-5 flex-wrap">

            <div className="flex items-start gap-4">

              <div className="w-12 h-12 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center">

                <Sparkles
                  size={23}
                  className="text-primary"
                />

              </div>


              <div>

                <h2 className="text-lg font-bold text-foreground">
                  AI Learning Plan
                </h2>

                <p className="text-sm text-muted-foreground mt-1">
                  StatSkill AI maps learning recommendations to competency gaps detected during your assessments.
                </p>


                <div className="flex gap-4 mt-3 flex-wrap">

                  <span className="text-xs text-muted-foreground flex items-center gap-1">

                    <Target
                      size={12}
                      className="text-warning"
                    />

                    {
                      dashboard
                        ?.skill_gaps
                        .length ||
                      0
                    }

                    {' '}
                    skill gaps

                  </span>


                  <span className="text-xs text-muted-foreground flex items-center gap-1">

                    <BookOpen
                      size={12}
                      className="text-primary"
                    />

                    {
                      dashboard
                        ?.recommendations
                        .length ||
                      0
                    }

                    {' '}
                    recommendations

                  </span>


                  <span className="text-xs text-muted-foreground flex items-center gap-1">

                    <GraduationCap
                      size={12}
                      className="text-success"
                    />

                    {
                      dashboard
                        ?.courses
                        .length ||
                      0
                    }

                    {' '}
                    tracked

                  </span>

                </div>

              </div>

            </div>


            <Link
              href="/ai-assessment"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90"
            >
              Reassess Skills
              <ArrowRight size={14} />
            </Link>

          </div>

        </div>


        {/* Recommended courses */}

        <div>

          <div className="mb-4">

            <h2 className="text-sm font-semibold text-foreground">
              Recommended For You
            </h2>

            <p className="text-xs text-muted-foreground mt-1">
              Based on your latest competency gaps. Join the learning through the official iGOT Karmayogi portal.
            </p>

          </div>


          {dashboard?.recommendations.length ? (

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

              {dashboard.recommendations.map(
                (course) => {
                  const enrolled =
                    enrolledMap.get(
                      course.course_id
                    );

                  const busy =
                    busyCourseId ===
                    course.course_id;


                  return (

                    <div
                      key={
                        course.course_id
                      }
                      className="card-base p-5"
                    >

                      <div className="flex items-start justify-between gap-4">

                        <div>

                          <div className="flex items-center gap-2 flex-wrap">

                            <h3 className="text-sm font-semibold text-foreground">
                              {course.course_name}
                            </h3>

                            <span className="badge-warning">
                              {course.priority}
                            </span>

                            <span className="badge-info">
                              iGOT
                            </span>

                          </div>


                          <p className="text-xs text-muted-foreground mt-1">
                            {course.category}
                            {' • '}
                            {course.difficulty}
                          </p>

                        </div>


                        <BookOpen
                          size={18}
                          className="text-primary shrink-0"
                        />

                      </div>


                      {course.description && (

                        <p className="text-xs text-muted-foreground leading-relaxed mt-3">
                          {course.description}
                        </p>

                      )}


                      <div className="p-3 rounded-lg bg-muted border border-border mt-4">

                        <p className="text-xs text-muted-foreground">

                          Recommended for:{' '}

                          <span className="font-semibold text-primary">
                            {course.skill_gap}
                          </span>

                        </p>


                        <p className="text-xs text-muted-foreground mt-1">

                          Current competency:{' '}

                          <span className="font-semibold text-foreground">
                            {course.current_score}/100
                          </span>

                        </p>

                      </div>


                      <div className="mt-4">

                        {!enrolled ? (

                          <button
                            type="button"
                            onClick={() =>
                              handleJoinOnIGot(
                                course.course_id,
                                course.course_name
                              )
                            }
                            disabled={busy}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50"
                          >

                            {busy ? (

                              <Loader2
                                size={15}
                                className="animate-spin"
                              />

                            ) : (

                              <ExternalLink
                                size={15}
                              />

                            )}

                            Join on iGOT Karmayogi

                          </button>

                        ) : (

                          <div>

                            <div className="flex items-center justify-between mb-2">

                              <span className="text-xs text-muted-foreground">
                                StatSkill progress
                              </span>

                              <span className="text-xs font-bold text-foreground">
                                {enrolled.progress}%
                              </span>

                            </div>


                            <div className="w-full h-2 bg-navy-600 rounded-full overflow-hidden">

                              <div
                                className="h-full rounded-full bg-primary"
                                style={{
                                  width:
                                    `${Math.min(
                                      100,
                                      enrolled.progress
                                    )}%`,
                                }}
                              />

                            </div>


                            <button
                              type="button"
                              onClick={() =>
                                handleOpenIGot(
                                  course.course_name
                                )
                              }
                              className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary/15 border border-primary/30 text-primary text-sm font-semibold hover:bg-primary/25 transition"
                            >
                              <ExternalLink size={14} />
                              Continue on iGOT Karmayogi
                            </button>


                            {enrolled.progress < 100 ? (

                              <div className="grid grid-cols-2 gap-2 mt-2">

                                <button
                                  type="button"
                                  disabled={busy}
                                  onClick={() =>
                                    updateProgress(
                                      course.course_id,
                                      enrolled.progress + 25
                                    )
                                  }
                                  className="px-3 py-2 rounded-lg bg-muted border border-border text-xs font-semibold text-foreground disabled:opacity-50"
                                >
                                  +25% Progress
                                </button>


                                <button
                                  type="button"
                                  disabled={busy}
                                  onClick={() =>
                                    updateProgress(
                                      course.course_id,
                                      100
                                    )
                                  }
                                  className="px-3 py-2 rounded-lg bg-success/15 border border-success/30 text-xs font-semibold text-success disabled:opacity-50"
                                >
                                  Mark Complete
                                </button>

                              </div>

                            ) : (

                              <button
                                type="button"
                                disabled={busy}
                                onClick={() =>
                                  handleReassessCourse(
                                    course.course_id
                                  )
                                }
                                className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-success/15 border border-success/30 text-success text-sm font-semibold hover:bg-success/25 transition disabled:opacity-50"
                              >

                                {busy ? (

                                  <Loader2
                                    size={14}
                                    className="animate-spin"
                                  />

                                ) : (

                                  <RefreshCcw
                                    size={14}
                                  />

                                )}

                                Reassess Competency

                              </button>

                            )}

                          </div>

                        )}

                      </div>

                    </div>

                  );
                }
              )}

            </div>

          ) : (

            <div className="card-base p-6 text-center">

              <Trophy
                size={26}
                className="text-success mx-auto"
              />

              <p className="text-sm font-semibold text-foreground mt-3">
                No urgent course recommendations
              </p>

              <p className="text-xs text-muted-foreground mt-1">
                Complete another assessment to refresh your learning plan.
              </p>

            </div>

          )}

        </div>


        {/* My learning */}

        <div>

          <div className="mb-4">

            <h2 className="text-sm font-semibold text-foreground">
              My Learning
            </h2>

            <p className="text-xs text-muted-foreground mt-1">
              Continue learning on iGOT Karmayogi and track your current progress in StatSkill.
            </p>

          </div>


          {dashboard?.courses.length ? (

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

              {dashboard.courses.map(
                (course) => {
                  const busy =
                    busyCourseId ===
                    course.course_id;


                  return (

                    <div
                      key={
                        course.course_id
                      }
                      className="card-base p-4"
                    >

                      <div className="flex items-start justify-between gap-3">

                        <div>

                          <div className="flex items-center gap-2 flex-wrap">

                            <p className="text-sm font-semibold text-foreground">
                              {course.course_name}
                            </p>

                            <span className="badge-info">
                              iGOT
                            </span>

                          </div>

                          <p className="text-xs text-muted-foreground mt-1">
                            {course.category}
                          </p>

                        </div>


                        {course.progress >= 100 ? (

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


                      <div className="flex items-center justify-between mt-4">

                        <span
                          className={
                            course.progress >=
                              100
                              ? (
                                  'text-xs font-semibold text-success'
                                )
                              : (
                                  'text-xs text-muted-foreground'
                                )
                          }
                        >
                          {course.status}
                        </span>

                        <span className="text-xs font-bold text-foreground">
                          {course.progress}%
                        </span>

                      </div>


                      <div className="w-full h-2 bg-navy-600 rounded-full overflow-hidden mt-2">

                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{
                            width:
                              `${Math.min(
                                100,
                                course.progress
                              )}%`,
                          }}
                        />

                      </div>


                      <button
                        type="button"
                        onClick={() =>
                          handleOpenIGot(
                            course.course_name
                          )
                        }
                        className="mt-4 w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-primary/15 border border-primary/30 text-xs font-semibold text-primary hover:bg-primary/25 transition"
                      >
                        <ExternalLink size={13} />
                        Open on iGOT
                      </button>


                      {course.progress < 100 ? (

                        <div className="grid grid-cols-2 gap-2 mt-2">

                          <button
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              updateProgress(
                                course.course_id,
                                Math.min(
                                  100,
                                  course.progress + 25
                                )
                              )
                            }
                            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-muted border border-border text-xs font-semibold text-foreground hover:bg-muted/80 transition disabled:opacity-50"
                          >

                            {busy ? (

                              <Loader2
                                size={13}
                                className="animate-spin"
                              />

                            ) : (

                              <PlayCircle
                                size={13}
                              />

                            )}

                            +25%

                          </button>


                          <button
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              updateProgress(
                                course.course_id,
                                100
                              )
                            }
                            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-success/15 border border-success/30 text-xs font-semibold text-success hover:bg-success/25 transition disabled:opacity-50"
                          >

                            <CheckCircle2
                              size={13}
                            />

                            Complete

                          </button>

                        </div>

                      ) : (

                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            handleReassessCourse(
                              course.course_id
                            )
                          }
                          className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-success/15 border border-success/30 text-success text-sm font-semibold hover:bg-success/25 transition disabled:opacity-50"
                        >

                          {busy ? (

                            <Loader2
                              size={14}
                              className="animate-spin"
                            />

                          ) : (

                            <RefreshCcw
                              size={14}
                            />

                          )}

                          Reassess Competency

                        </button>

                      )}

                    </div>

                  );
                }
              )}

            </div>

          ) : (

            <div className="card-base p-6 text-center">

              <BookOpen
                size={25}
                className="text-muted-foreground mx-auto"
              />

              <p className="text-sm text-muted-foreground mt-2">
                You have not added a course to your learning plan yet.
              </p>

            </div>

          )}

        </div>


        {/* Course catalog */}

        <div>

          <div className="flex items-end justify-between gap-4 mb-4 flex-wrap">

            <div>

              <h2 className="text-sm font-semibold text-foreground">
                Course Catalog
              </h2>

              <p className="text-xs text-muted-foreground mt-1">
                Add a StatSkill course to your plan, then continue to the official iGOT Karmayogi portal.
              </p>

            </div>


            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">

              <Copy size={12} />

              Course titles are copied automatically when opening iGOT.

            </div>

          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

            {allCourses.map(
              (course) => {
                const enrolled =
                  enrolledMap.has(
                    course.course_id
                  );

                const recommended =
                  recommendedCourseIds.has(
                    course.course_id
                  );

                const busy =
                  busyCourseId ===
                  course.course_id;


                return (

                  <div
                    key={
                      course.course_id
                    }
                    className="card-base p-4"
                  >

                    <div className="flex items-start justify-between gap-3">

                      <div>

                        <p className="text-sm font-semibold text-foreground">
                          {course.course_name}
                        </p>

                        <p className="text-xs text-muted-foreground mt-1">
                          {course.category}
                        </p>

                      </div>


                      <div className="flex items-center gap-1.5 flex-wrap justify-end">

                        {recommended && (

                          <span className="badge-warning">
                            AI Pick
                          </span>

                        )}

                        <span className="badge-info">
                          iGOT
                        </span>

                      </div>

                    </div>


                    <p className="text-xs text-muted-foreground mt-3">
                      {
                        course.description ||
                        'Competency development course.'
                      }
                    </p>


                    <div className="flex items-center justify-between mt-4 gap-3">

                      <span className="badge-muted">
                        {course.difficulty}
                      </span>


                      {!enrolled ? (

                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            handleJoinOnIGot(
                              course.course_id,
                              course.course_name
                            )
                          }
                          className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline disabled:opacity-50"
                        >

                          {busy ? (

                            <Loader2
                              size={12}
                              className="animate-spin"
                            />

                          ) : (

                            <ExternalLink
                              size={12}
                            />

                          )}

                          Join on iGOT

                        </button>

                      ) : (

                        <button
                          type="button"
                          onClick={() =>
                            handleOpenIGot(
                              course.course_name
                            )
                          }
                          className="text-xs font-semibold text-success flex items-center gap-1.5 hover:underline"
                        >

                          <CheckCircle2
                            size={12}
                          />

                          Open iGOT

                        </button>

                      )}

                    </div>

                  </div>

                );
              }
            )}

          </div>

        </div>

      </div>

    </AppLayout>
  );
}

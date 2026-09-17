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
  GraduationCap,
  Loader2,
  PlayCircle,
  RefreshCcw,
  Sparkles,
  Target,
  Trophy,
} from 'lucide-react';

import AppLayout from '@/components/AppLayout';
import {
  apiGet,
  apiPost,
} from '@/lib/api';


const USER_ID = 1;


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


export default function CoursesPage() {
  const router = useRouter();

  const [
    allCourses,
    setAllCourses,
  ] = useState<Course[]>([]);

  const [
    dashboard,
    setDashboard,
  ] = useState<DashboardResponse | null>(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    busyCourseId,
    setBusyCourseId,
  ] = useState<number | null>(null);

  const [
    message,
    setMessage,
  ] = useState('');

  const [
    error,
    setError,
  ] = useState('');


  async function loadData() {
    setLoading(true);
    setError('');

    try {
      const [
        coursesResponse,
        dashboardResponse,
      ] = await Promise.all([
        apiGet<Course[]>('/courses'),
        apiGet<DashboardResponse>(
          `/dashboard/${USER_ID}/full`
        ),
      ]);

      setAllCourses(coursesResponse);
      setDashboard(dashboardResponse);
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
    loadData();
  }, []);


  const enrolledMap = useMemo(() => {
    const map =
      new Map<
        number,
        EnrolledCourse
      >();

    dashboard?.courses.forEach(
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
          dashboard?.recommendations.map(
            (course) =>
              course.course_id
          ) || []
        ),
      [dashboard]
    );


  async function handleEnroll(
    courseId: number
  ) {
    setBusyCourseId(courseId);
    setError('');
    setMessage('');

    try {
      await apiPost(
        '/courses/enroll',
        {
          user_id: USER_ID,
          course_id: courseId,
        }
      );

      setMessage(
        'Course enrolled successfully.'
      );

      await loadData();
    } catch (err) {
      console.error(
        'Enrollment error:',
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to enroll in course.'
      );
    } finally {
      setBusyCourseId(null);
    }
  }


  async function updateProgress(
    courseId: number,
    progress: number
  ) {
    setBusyCourseId(courseId);
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
          user_id: USER_ID,
          course_id: courseId,
          progress: safeProgress,
        }
      );

      setMessage(
        safeProgress >= 100
          ? 'Course completed successfully.'
          : 'Course progress updated.'
      );

      await loadData();
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
      setBusyCourseId(null);
    }
  }


  async function handleReassessCourse(
    courseId: number
  ) {
    setBusyCourseId(courseId);
    setError('');
    setMessage('');

    try {
      const response =
        await apiGet<CourseSkillsResponse>(
          `/courses/${courseId}/skills`
        );

      if (
        !response.skills ||
        response.skills.length === 0
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
      setBusyCourseId(null);
    }
  }


  if (loading) {
    return (
      <AppLayout
        pageTitle="Learning & Courses"
        pageSubtitle="Recommended learning based on your competency gaps."
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
      pageSubtitle="Recommended learning based on your competency gaps."
    >
      <div className="space-y-6">

        {message && (
          <div className="p-4 rounded-xl border border-emerald-800/40 bg-emerald-950/30 flex items-center gap-2">
            <CheckCircle2
              size={16}
              className="text-success"
            />

            <p className="text-sm text-success">
              {message}
            </p>
          </div>
        )}


        {error && (
          <div className="p-4 rounded-xl border border-red-800/40 bg-red-950/30 flex items-center gap-2">
            <AlertTriangle
              size={16}
              className="text-danger"
            />

            <p className="text-sm text-danger">
              {error}
            </p>
          </div>
        )}


        <div className="card-base p-6 bg-gradient-to-br from-blue-900/40 to-cyan-900/20 border-blue-700/40">
          <div className="flex items-start justify-between gap-5 flex-wrap">

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
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
                  StatSkill AI maps courses to the competency gaps detected during your assessments.
                </p>


                <div className="flex gap-4 mt-3 flex-wrap">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Target
                      size={12}
                      className="text-warning"
                    />

                    {dashboard?.skill_gaps.length || 0}
                    {' '}skill gaps
                  </span>


                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <BookOpen
                      size={12}
                      className="text-primary"
                    />

                    {dashboard?.recommendations.length || 0}
                    {' '}recommendations
                  </span>


                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <GraduationCap
                      size={12}
                      className="text-success"
                    />

                    {dashboard?.courses.length || 0}
                    {' '}enrolled
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


        <div>
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-foreground">
              Recommended For You
            </h2>

            <p className="text-xs text-muted-foreground mt-1">
              Based on your latest competency gaps.
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
                              handleEnroll(
                                course.course_id
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
                              <PlayCircle
                                size={15}
                              />
                            )}

                            Enroll in Course
                          </button>
                        ) : (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs text-muted-foreground">
                                Learning progress
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


                            {enrolled.progress < 100 ? (
                              <div className="grid grid-cols-2 gap-2 mt-3">
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
                                className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-success/15 border border-success/30 text-success text-sm font-semibold hover:bg-success/25 transition disabled:opacity-50"
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


        <div>
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-foreground">
              My Learning
            </h2>

            <p className="text-xs text-muted-foreground mt-1">
              Track and update your enrolled course progress.
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
                      key={course.course_id}
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
                            course.progress >= 100
                              ? 'text-xs font-semibold text-success'
                              : 'text-xs text-muted-foreground'
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


                      {course.progress < 100 ? (
                        <div className="grid grid-cols-2 gap-2 mt-4">
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
                            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-primary/15 border border-primary/30 text-xs font-semibold text-primary hover:bg-primary/25 transition disabled:opacity-50"
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
                            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-success/15 border border-success/30 text-xs font-semibold text-success hover:bg-success/25 transition disabled:opacity-50"
                          >
                            <CheckCircle2
                              size={13}
                            />

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
                          className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-success/15 border border-success/30 text-success text-sm font-semibold hover:bg-success/25 transition disabled:opacity-50"
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
                You have not enrolled in a course yet.
              </p>
            </div>
          )}
        </div>


        <div>
          <h2 className="text-sm font-semibold text-foreground mb-4">
            Course Catalog
          </h2>


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
                    key={course.course_id}
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


                      {recommended && (
                        <span className="badge-warning">
                          AI Pick
                        </span>
                      )}
                    </div>


                    <p className="text-xs text-muted-foreground mt-3">
                      {course.description ||
                        'Competency development course.'}
                    </p>


                    <div className="flex items-center justify-between mt-4">
                      <span className="badge-muted">
                        {course.difficulty}
                      </span>


                      {!enrolled ? (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            handleEnroll(
                              course.course_id
                            )
                          }
                          className="text-xs font-semibold text-primary hover:underline disabled:opacity-50"
                        >
                          {busy
                            ? 'Working...'
                            : 'Enroll'}
                        </button>
                      ) : (
                        <span className="text-xs font-semibold text-success flex items-center gap-1">
                          <CheckCircle2
                            size={12}
                          />

                          Enrolled
                        </span>
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

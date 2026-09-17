'use client';

import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import Link from 'next/link';

import {
  AlertTriangle,
  ArrowRight,
  Award,
  BarChart2,
  BookOpen,
  Brain,
  CheckCircle2,
  Loader2,
  RefreshCcw,
  Target,
  TrendingDown,
  TrendingUp,
  Trophy,
  XCircle,
  Zap,
} from 'lucide-react';

import { apiGet } from '@/lib/api';

import type {
  AssessmentSession,
  QuestionData,
} from './AssessmentPageClient';


interface AssessmentCompleteProps {
  session: AssessmentSession;
  questions: QuestionData[];
  onRestart: () => void;
}


interface AssessmentAnswer {
  skill_name: string;
  difficulty: string;
  sequence_number: number;
  score: number;
  is_correct: boolean;
  feedback: string;
}


interface CompetencyResult {
  id?: number;
  user_id?: number;
  skill_name: string;
  score: number;
  level: string;
}


interface SkillGap {
  skill_name: string;
  score: number;
  level: string;
  target_score?: number;
  gap?: number;
  priority?: string;
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

  progress?: number;
  status?: string;
}


interface AssessmentResultResponse {
  session_id: number;
  user_id: number;
  status: string;

  question_count: number;
  max_questions: number;

  selected_skills: string[];

  answers: AssessmentAnswer[];

  competencies: CompetencyResult[];

  skill_gaps: SkillGap[];

  recommendations: Recommendation[];

  assessment_type?: string;

  source_course_id?: number | null;
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

  created_at: string;
}


interface DashboardResponse {
  improvement_history: ImprovementHistory[];
}


const USER_ID = 1;


function getScoreStyle(
  score: number
) {
  if (score >= 85) {
    return {
      text:
        'text-amber-400',

      bg:
        'bg-amber-900/30',

      border:
        'border-amber-700/40',

      label:
        'Expert Performance',
    };
  }


  if (score >= 70) {
    return {
      text:
        'text-purple-400',

      bg:
        'bg-purple-900/30',

      border:
        'border-purple-700/40',

      label:
        'Strong Performance',
    };
  }


  if (score >= 55) {
    return {
      text:
        'text-blue-400',

      bg:
        'bg-blue-900/30',

      border:
        'border-blue-700/40',

      label:
        'Intermediate Performance',
    };
  }


  if (score >= 40) {
    return {
      text:
        'text-emerald-400',

      bg:
        'bg-emerald-900/30',

      border:
        'border-emerald-700/40',

      label:
        'Foundation Performance',
    };
  }


  return {
    text:
      'text-red-400',

    bg:
      'bg-red-900/30',

    border:
      'border-red-700/40',

    label:
      'Development Priority',
  };
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


function toTimestamp(
  value: string
) {
  if (!value) {
    return 0;
  }


  const normalized =
    value.includes('T')
      ? value
      : value.replace(
          ' ',
          'T'
        );


  const parsed =
    Date.parse(
      normalized
    );


  return Number.isNaN(
    parsed
  )
    ? 0
    : parsed;
}


export default function AssessmentComplete({
  session,
  onRestart,
}: AssessmentCompleteProps) {

  const [
    result,
    setResult,
  ] =
    useState<
      AssessmentResultResponse | null
    >(
      null
    );


  const [
    improvementHistory,
    setImprovementHistory,
  ] =
    useState<
      ImprovementHistory[]
    >(
      []
    );


  const [
    loading,
    setLoading,
  ] =
    useState(
      true
    );


  const [
    error,
    setError,
  ] =
    useState(
      ''
    );


  useEffect(
    () => {

      async function loadResults() {

        setLoading(
          true
        );

        setError(
          ''
        );


        try {

          const [
            assessmentResult,
            dashboard,
          ] =
            await Promise.all(
              [

                apiGet<
                  AssessmentResultResponse
                >(
                  `/ai/assessment/${USER_ID}/result`
                ),

                apiGet<
                  DashboardResponse
                >(
                  `/dashboard/${USER_ID}/full`
                ),

              ]
            );


          setResult(
            assessmentResult
          );


          setImprovementHistory(
            dashboard.improvement_history ||
            []
          );

        } catch (err) {

          console.error(
            'Assessment result error:',
            err
          );


          setError(
            err instanceof Error
              ? err.message
              : 'Unable to load assessment results.'
          );

        } finally {

          setLoading(
            false
          );

        }

      }


      loadResults();

    },
    []
  );


  const selectedSkills =
    result?.selected_skills ||
    [];


  const answers =
    result?.answers ||
    [];


  const selectedCompetencies =
    useMemo(
      () => {

        if (!result) {
          return [];
        }


        if (
          result.selected_skills
            .length === 0
        ) {
          return (
            result.competencies
          );
        }


        return (
          result.competencies.filter(
            (
              competency
            ) =>
              result.selected_skills
                .includes(
                  competency.skill_name
                )
          )
        );

      },
      [
        result,
      ]
    );


  const selectedGaps =
    useMemo(
      () => {

        if (!result) {
          return [];
        }


        if (
          result.selected_skills
            .length === 0
        ) {
          return (
            result.skill_gaps
          );
        }


        return (
          result.skill_gaps.filter(
            (
              gap
            ) =>
              result.selected_skills
                .includes(
                  gap.skill_name
                )
          )
        );

      },
      [
        result,
      ]
    );


  const selectedRecommendations =
    useMemo(
      () => {

        if (!result) {
          return [];
        }


        if (
          result.selected_skills
            .length === 0
        ) {
          return (
            result.recommendations
          );
        }


        return (
          result.recommendations.filter(
            (
              course
            ) =>
              result.selected_skills
                .includes(
                  course.skill_gap
                )
          )
        );

      },
      [
        result,
      ]
    );


  const selectedImprovements =
    useMemo(
      () => {

        if (!result) {
          return [];
        }


        const expectedSource =
          result.assessment_type ||
          'AI Assessment';


        const latestBySkill =
          new Map<
            string,
            ImprovementHistory
          >();


        const sortedHistory =
          [
            ...improvementHistory,
          ].sort(
            (
              a,
              b
            ) =>
              toTimestamp(
                b.created_at
              ) -
              toTimestamp(
                a.created_at
              )
          );


        sortedHistory.forEach(
          (
            item
          ) => {

            const sourceMatches =
              item.source ===
                expectedSource ||

              (
                expectedSource ===
                  'AI Assessment' &&

                item.source ===
                  'AI Adaptive Assessment'
              );


            if (
              !sourceMatches
            ) {
              return;
            }


            if (
              selectedSkills.length >
                0 &&

              !selectedSkills.includes(
                item.skill_name
              )
            ) {
              return;
            }


            if (
              !latestBySkill.has(
                item.skill_name
              )
            ) {
              latestBySkill.set(
                item.skill_name,
                item
              );
            }

          }
        );


        return Array.from(
          latestBySkill.values()
        );

      },
      [
        improvementHistory,
        result,
        selectedSkills,
      ]
    );


  const assessmentScore =
    answers.length > 0
      ? Math.round(
          answers.reduce(
            (
              total,
              answer
            ) =>
              total +
              answer.score,
            0
          ) /
            answers.length
        )
      : session.currentScore;


  const correctAnswers =
    answers.filter(
      (
        answer
      ) =>
        answer.is_correct
    ).length;


  const accuracy =
    answers.length > 0
      ? Math.round(
          (
            correctAnswers /
            answers.length
          ) *
            100
        )
      : 0;


  const scoreStyle =
    getScoreStyle(
      assessmentScore
    );


  if (
    loading
  ) {
    return (

      <div className="max-w-4xl mx-auto">

        <div className="card-base p-12 text-center">

          <Loader2
            size={
              34
            }
            className="animate-spin text-primary mx-auto"
          />


          <h2 className="text-lg font-bold text-foreground mt-4">

            Preparing your competency report...

          </h2>


          <p className="text-sm text-muted-foreground mt-2">

            StatSkill AI is loading your updated scores,
            gaps and recommendations.

          </p>

        </div>

      </div>
    );
  }


  if (
    error ||
    !result
  ) {
    return (

      <div className="max-w-3xl mx-auto">

        <div className="card-base p-8 text-center">

          <AlertTriangle
            size={
              34
            }
            className="text-warning mx-auto"
          />


          <h2 className="text-lg font-bold text-foreground mt-4">

            Assessment completed

          </h2>


          <p className="text-sm text-danger mt-2">

            {
              error ||
              'Unable to load the detailed result.'
            }

          </p>


          <div className="flex justify-center gap-3 mt-6">

            <button
              type="button"
              onClick={
                onRestart
              }
              className="px-5 py-2.5 rounded-xl bg-muted text-sm font-semibold text-foreground"
            >

              Start New Assessment

            </button>


            <Link
              href="/dashboard"
              className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold"
            >

              Dashboard

            </Link>

          </div>

        </div>

      </div>
    );
  }


  return (

    <div className="max-w-5xl mx-auto space-y-6">


      {/* ====================================================
          COMPLETION HERO
      ==================================================== */}

      <div className="card-base p-6 bg-gradient-to-br from-blue-900/40 to-cyan-900/20 border-blue-700/40">

        <div className="flex items-start justify-between gap-6 flex-wrap">


          <div className="flex items-start gap-4">

            <div className="w-14 h-14 rounded-2xl bg-success/15 border border-success/30 flex items-center justify-center shrink-0">

              <Trophy
                size={
                  28
                }
                className="text-success"
              />

            </div>


            <div>

              <div className="flex items-center gap-2 flex-wrap">

                <h1 className="text-xl font-bold text-foreground">

                  {
                    result.assessment_type ===
                    'Post-Course Reassessment'
                      ? 'Post-Course Reassessment Complete'
                      : 'AI Assessment Complete'
                  }

                </h1>


                <span className="badge-success">

                  Completed

                </span>

              </div>


              <p className="text-sm text-muted-foreground mt-1">

                Session #
                {
                  result.session_id
                }

                {' • '}

                {
                  result.question_count
                }{' '}

                adaptive questions

              </p>


              <div className="flex flex-wrap gap-2 mt-3">

                {
                  selectedSkills.map(
                    (
                      skill
                    ) => (

                      <span
                        key={
                          skill
                        }
                        className="badge-info"
                      >

                        {
                          skill
                        }

                      </span>

                    )
                  )
                }

              </div>

            </div>

          </div>


          <div
            className={
              `rounded-xl border px-6 py-4 text-center ${scoreStyle.bg} ${scoreStyle.border}`
            }
          >

            <p className="text-xs text-muted-foreground">

              Assessment Score

            </p>


            <p
              className={
                `text-4xl font-bold tabular-nums mt-1 ${scoreStyle.text}`
              }
            >

              {
                assessmentScore
              }

            </p>


            <p className="text-xs font-semibold text-foreground mt-1">

              {
                scoreStyle.label
              }

            </p>

          </div>

        </div>

      </div>


      {/* ====================================================
          SUMMARY METRICS
      ==================================================== */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">


        <div className="card-base p-4">

          <CheckCircle2
            size={
              18
            }
            className="text-success mb-3"
          />


          <p className="text-2xl font-bold text-foreground">

            {
              correctAnswers
            }

          </p>


          <p className="text-xs text-muted-foreground mt-1">

            Correct Answers

          </p>

        </div>


        <div className="card-base p-4">

          <Target
            size={
              18
            }
            className="text-primary mb-3"
          />


          <p className="text-2xl font-bold text-foreground">

            {
              accuracy
            }%

          </p>


          <p className="text-xs text-muted-foreground mt-1">

            Accuracy

          </p>

        </div>


        <div className="card-base p-4">

          <Brain
            size={
              18
            }
            className="text-purple-400 mb-3"
          />


          <p className="text-2xl font-bold text-foreground">

            {
              selectedCompetencies.length
            }

          </p>


          <p className="text-xs text-muted-foreground mt-1">

            Skills Evaluated

          </p>

        </div>


        <div className="card-base p-4">

          <AlertTriangle
            size={
              18
            }
            className="text-warning mb-3"
          />


          <p className="text-2xl font-bold text-foreground">

            {
              selectedGaps.length
            }

          </p>


          <p className="text-xs text-muted-foreground mt-1">

            Skill Gaps

          </p>

        </div>

      </div>


      {/* ====================================================
          UPDATED COMPETENCY SCORES
      ==================================================== */}

      <div className="card-base p-5">

        <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">


          <div>

            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">

              <BarChart2
                size={
                  16
                }
                className="text-primary"
              />

              Updated Competency Scores

            </h2>


            <p className="text-xs text-muted-foreground mt-1">

              Scores saved to your competency profile
              after this assessment.

            </p>

          </div>


          <span className="badge-info">

            Live Database

          </span>

        </div>


        {
          selectedCompetencies.length ===
          0
            ? (

              <p className="text-sm text-muted-foreground">

                No competency scores are available.

              </p>

            )
            : (

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {
                  selectedCompetencies.map(
                    (
                      competency
                    ) => (

                      <div
                        key={
                          competency.skill_name
                        }
                        className="p-4 rounded-xl bg-muted border border-border"
                      >


                        <div className="flex items-center justify-between gap-3">

                          <div>

                            <p className="text-sm font-semibold text-foreground">

                              {
                                competency.skill_name
                              }

                            </p>


                            <p
                              className={
                                `text-xs font-semibold mt-1 ${levelColor(
                                  competency.level
                                )}`
                              }
                            >

                              {
                                competency.level
                              }

                            </p>

                          </div>


                          <span className="text-2xl font-bold text-foreground tabular-nums">

                            {
                              competency.score
                            }

                          </span>

                        </div>


                        <div className="w-full h-2 bg-navy-600 rounded-full overflow-hidden mt-3">

                          <div
                            className="h-full rounded-full bg-primary"
                            style={{
                              width:
                                `${Math.max(
                                  0,
                                  Math.min(
                                    100,
                                    competency.score
                                  )
                                )}%`,
                            }}
                          />

                        </div>

                      </div>

                    )
                  )
                }

              </div>

            )
        }

      </div>


      {/* ====================================================
          BEFORE VS AFTER
      ==================================================== */}

      <div className="card-base p-5">

        <h2 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">

          <TrendingUp
            size={
              16
            }
            className="text-success"
          />

          Before vs After Assessment

        </h2>


        {
          selectedImprovements.length ===
          0
            ? (

              <p className="text-sm text-muted-foreground">

                No improvement history is available
                for this assessment yet.

              </p>

            )
            : (

              <div className="space-y-3">

                {
                  selectedImprovements.map(
                    (
                      item
                    ) => (

                      <div
                        key={
                          item.id
                        }
                        className="p-4 rounded-xl bg-muted border border-border flex items-center justify-between gap-4 flex-wrap"
                      >


                        <div>

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


                          <p className="text-xs text-muted-foreground mt-1">

                            {
                              item.source
                            }

                          </p>

                        </div>


                        <div className="flex items-center gap-4">


                          <div className="text-center">

                            <p className="text-xs text-muted-foreground">

                              Before

                            </p>


                            <p className="text-lg font-bold text-foreground">

                              {
                                item.previous_score
                              }

                            </p>

                          </div>


                          <ArrowRight
                            size={
                              16
                            }
                            className="text-muted-foreground"
                          />


                          <div className="text-center">

                            <p className="text-xs text-muted-foreground">

                              After

                            </p>


                            <p className="text-lg font-bold text-primary">

                              {
                                item.new_score
                              }

                            </p>

                          </div>


                          <div
                            className={
                              `flex items-center gap-1 px-2.5 py-1 rounded-lg ${
                                item.improvement >
                                0

                                  ? 'bg-emerald-900/30 text-success'

                                  : item.improvement <
                                    0

                                    ? 'bg-red-900/30 text-danger'

                                    : 'bg-muted text-muted-foreground'
                              }`
                            }
                          >

                            {
                              item.improvement >
                              0
                                ? (

                                  <TrendingUp
                                    size={
                                      13
                                    }
                                  />

                                )
                                : item.improvement <
                                  0
                                  ? (

                                    <TrendingDown
                                      size={
                                        13
                                      }
                                    />

                                  )
                                  : null
                            }


                            <span className="text-xs font-bold">

                              {
                                item.improvement >
                                0
                                  ? '+'
                                  : ''
                              }

                              {
                                item.improvement
                              }

                            </span>

                          </div>

                        </div>

                      </div>

                    )
                  )
                }

              </div>

            )
        }

      </div>


      {/* ====================================================
          SKILL GAP ANALYSIS
      ==================================================== */}

      <div className="card-base p-5">

        <h2 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">

          <AlertTriangle
            size={
              16
            }
            className="text-warning"
          />

          Skill Gap Analysis

        </h2>


        {
          selectedGaps.length ===
          0
            ? (

              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/30 flex items-center gap-3">

                <Award
                  size={
                    20
                  }
                  className="text-success"
                />


                <div>

                  <p className="text-sm font-semibold text-success">

                    No major gaps detected

                  </p>


                  <p className="text-xs text-muted-foreground mt-0.5">

                    All assessed skills reached the current
                    competency threshold.

                  </p>

                </div>

              </div>

            )
            : (

              <div className="space-y-3">

                {
                  selectedGaps.map(
                    (
                      gap
                    ) => (

                      <div
                        key={
                          gap.skill_name
                        }
                        className="p-4 rounded-xl bg-red-950/20 border border-red-800/30 flex items-center justify-between gap-4 flex-wrap"
                      >


                        <div>

                          <p className="text-sm font-semibold text-foreground">

                            {
                              gap.skill_name
                            }

                          </p>


                          <p className="text-xs text-muted-foreground mt-1">

                            Current level:{' '}

                            <span
                              className={
                                levelColor(
                                  gap.level
                                )
                              }
                            >

                              {
                                gap.level
                              }

                            </span>

                          </p>

                        </div>


                        <div className="flex items-center gap-4">

                          <div className="text-right">

                            <p className="text-xs text-muted-foreground">

                              Current Score

                            </p>


                            <p className="text-lg font-bold text-danger">

                              {
                                gap.score
                              }/100

                            </p>

                          </div>


                          <span className="badge-warning">

                            {
                              gap.priority ||
                              'Priority'
                            }

                          </span>

                        </div>

                      </div>

                    )
                  )
                }

              </div>

            )
        }

      </div>


      {/* ====================================================
          RECOMMENDED LEARNING
      ==================================================== */}

      <div className="card-base p-5">

        <div className="flex items-center justify-between gap-3 mb-4">


          <div>

            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">

              <BookOpen
                size={
                  16
                }
                className="text-accent"
              />

              Recommended Learning

            </h2>


            <p className="text-xs text-muted-foreground mt-1">

              Courses mapped to the skill gaps
              identified in this assessment.

            </p>

          </div>


          <Zap
            size={
              18
            }
            className="text-warning"
          />

        </div>


        {
          selectedRecommendations.length ===
          0
            ? (

              <p className="text-sm text-muted-foreground">

                No course recommendation is currently
                mapped to the assessed skill gaps.

              </p>

            )
            : (

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {
                  selectedRecommendations
                    .slice(
                      0,
                      4
                    )
                    .map(
                      (
                        course
                      ) => (

                        <div
                          key={
                            course.course_id
                          }
                          className="p-4 rounded-xl bg-muted border border-border"
                        >


                          <div className="flex items-start justify-between gap-3">

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

                              </p>

                            </div>


                            <span className="badge-warning">

                              {
                                course.priority
                              }

                            </span>

                          </div>


                          <div className="mt-3 pt-3 border-t border-border">

                            <p className="text-xs text-muted-foreground">

                              Targets:{' '}

                              <span className="font-semibold text-primary">

                                {
                                  course.skill_gap
                                }

                              </span>

                            </p>


                            <p className="text-xs text-muted-foreground mt-1">

                              Current score:{' '}

                              <span className="font-semibold text-foreground">

                                {
                                  course.current_score
                                }

                              </span>

                            </p>

                          </div>

                        </div>

                      )
                    )
                }

              </div>

            )
        }

      </div>


      {/* ====================================================
          QUESTION PERFORMANCE
      ==================================================== */}

      <div className="card-base p-5">

        <h2 className="text-sm font-semibold text-foreground mb-4">

          Question Performance

        </h2>


        {
          answers.length ===
          0
            ? (

              <p className="text-sm text-muted-foreground">

                No question results are available.

              </p>

            )
            : (

              <div className="space-y-2">

                {
                  answers.map(
                    (
                      answer
                    ) => (

                      <div
                        key={
                          answer.sequence_number
                        }
                        className="flex items-center gap-3 p-3 rounded-lg bg-muted border border-border"
                      >

                        {
                          answer.is_correct
                            ? (

                              <CheckCircle2
                                size={
                                  17
                                }
                                className="text-success shrink-0"
                              />

                            )
                            : (

                              <XCircle
                                size={
                                  17
                                }
                                className="text-danger shrink-0"
                              />

                            )
                        }


                        <div className="flex-1 min-w-0">

                          <p className="text-xs font-semibold text-foreground">

                            Question{' '}

                            {
                              answer.sequence_number
                            }

                            {' • '}

                            {
                              answer.skill_name
                            }

                          </p>


                          <p className="text-xs text-muted-foreground mt-0.5">

                            {
                              answer.difficulty
                            }

                          </p>

                        </div>


                        <span className="text-sm font-bold text-foreground">

                          {
                            answer.score
                          }/100

                        </span>

                      </div>

                    )
                  )
                }

              </div>

            )
        }

      </div>


      {/* ====================================================
          ACTIONS
      ==================================================== */}

      <div className="flex items-center justify-between gap-4 flex-wrap pb-4">


        <button
          type="button"
          onClick={
            onRestart
          }
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-muted border border-border text-sm font-semibold text-foreground hover:bg-muted/70 transition"
        >

          <RefreshCcw
            size={
              15
            }
          />

          Start New Assessment

        </button>


        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 transition"
        >

          View Updated Dashboard

          <ArrowRight
            size={
              15
            }
          />

        </Link>

      </div>


    </div>
  );
}
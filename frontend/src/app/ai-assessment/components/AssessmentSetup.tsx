'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

import {
  Brain,
  Zap,
  Target,
  Clock,
  BarChart2,
  Shield,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Info,
  Loader2,
} from 'lucide-react';

import { apiGet } from '@/lib/api';


interface AssessmentSetupProps {
  onStart: (
    skills: string[],
    maxQuestions: number
  ) => void;
}


type Competency = {
  skill_name: string;
  score: number;
  level: string;
};


type DashboardResponse = {
  competencies: Competency[];
};


type SkillItem = {
  name: string;
  currentScore: number | null;
  level: string;
};


const USER_ID = 1;


/*
  Skills are independent of department.

  We can add more skills later without
  changing the assessment architecture.
*/
const skillCatalog = [
  'Statistics',
  'Probability',
  'Regression',
  'Python',
  'SQL',
  'Data Visualization',
  'Artificial Intelligence',
  'Communication',
  'Management',
  'Leadership',
  'Survey Design',
  'Econometrics',
];


const levelColor: Record<string, string> = {
  Beginner: 'text-slate-400',
  Foundation: 'text-emerald-400',
  Intermediate: 'text-blue-400',
  Advanced: 'text-purple-400',
  Expert: 'text-amber-400',
  'Not Assessed': 'text-muted-foreground',
};


const scoreBarColor = (score: number) => {
  if (score >= 80) return 'bg-purple-500';
  if (score >= 65) return 'bg-blue-500';
  if (score >= 50) return 'bg-cyan-500';
  if (score >= 35) return 'bg-emerald-500';

  return 'bg-red-500';
};


export default function AssessmentSetup({
  onStart,
}: AssessmentSetupProps) {
  const [skills, setSkills] =
    useState<SkillItem[]>([]);

  const [selectedSkills, setSelectedSkills] =
    useState<string[]>([]);

  const [maxQuestions, setMaxQuestions] =
    useState(8);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');


  useEffect(() => {
    async function loadCompetencies() {
      try {
        setLoading(true);
        setError('');

        const data =
          await apiGet<DashboardResponse>(
            `/dashboard/${USER_ID}/full`
          );


        const existingCompetencies =
          data.competencies || [];


        /*
          Build the skill list from our
          general catalogue.

          If the employee already has a
          score, show it.

          Otherwise show "Not Assessed".
        */
        const skillItems: SkillItem[] =
          skillCatalog.map((skillName) => {
            const existing =
              existingCompetencies.find(
                (competency) =>
                  competency.skill_name
                    .toLowerCase() ===
                  skillName.toLowerCase()
              );


            return {
              name: skillName,

              currentScore:
                existing
                  ? Number(existing.score)
                  : null,

              level:
                existing?.level ||
                'Not Assessed',
            };
          });


        /*
          Also include competencies already
          stored in the database even if
          they are not in our catalogue.
        */
        existingCompetencies.forEach(
          (competency) => {
            const alreadyIncluded =
              skillItems.some(
                (skill) =>
                  skill.name.toLowerCase() ===
                  competency.skill_name.toLowerCase()
              );

            if (!alreadyIncluded) {
              skillItems.push({
                name:
                  competency.skill_name,

                currentScore:
                  Number(
                    competency.score
                  ),

                level:
                  competency.level ||
                  'Not Assessed',
              });
            }
          }
        );


        setSkills(skillItems);


        /*
          Initially select skill gaps.

          If no gaps exist, choose the
          first few skills.
        */
        const gapSkills =
          skillItems
            .filter(
              (skill) =>
                skill.currentScore === null ||
                skill.currentScore < 70
            )
            .slice(0, 4)
            .map(
              (skill) => skill.name
            );


        if (gapSkills.length > 0) {
          setSelectedSkills(gapSkills);
        } else {
          setSelectedSkills(
            skillItems
              .slice(0, 4)
              .map(
                (skill) => skill.name
              )
          );
        }

      } catch (err) {
        console.error(
          'Assessment setup error:',
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load competencies.'
        );

      } finally {
        setLoading(false);
      }
    }


    loadCompetencies();

  }, []);


  function toggleSkill(
    skillName: string
  ) {
    setSelectedSkills(
      (previous) => {
        if (
          previous.includes(skillName)
        ) {
          return previous.filter(
            (skill) =>
              skill !== skillName
          );
        }

        return [
          ...previous,
          skillName,
        ];
      }
    );
  }


  function selectAll() {
    setSelectedSkills(
      skills.map(
        (skill) => skill.name
      )
    );
  }


  function clearSelection() {
    setSelectedSkills([]);
  }


  function startAssessment() {
    if (
      selectedSkills.length === 0
    ) {
      return;
    }

    onStart(
      selectedSkills,
      maxQuestions
    );
  }


  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* ===============================================
          HEADER
      =============================================== */}

      <div className="card-base p-6 bg-gradient-to-br from-blue-900/40 to-cyan-900/20 border-blue-700/40">

        <div className="flex items-start justify-between gap-4 flex-wrap">

          <div className="flex items-center gap-4">

            <div className="w-14 h-14 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center">

              <Brain
                size={28}
                className="text-primary"
              />

            </div>


            <div>

              <div className="flex items-center gap-2 mb-1">

                <h2 className="text-xl font-bold text-foreground">
                  AI Adaptive Assessment
                </h2>

                <span className="badge-info">
                  Multi-Skill
                </span>

              </div>


              <p className="text-sm text-muted-foreground">
                Select the competencies you want to assess.
                AI generates and adapts each question in real time.
              </p>


              <div className="flex items-center gap-4 mt-2 flex-wrap">

                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">

                  <Clock
                    size={12}
                    className="text-accent"
                  />

                  ~10–20 minutes

                </span>


                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">

                  <Target
                    size={12}
                    className="text-primary"
                  />

                  {maxQuestions} adaptive questions

                </span>


                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">

                  <Zap
                    size={12}
                    className="text-warning"
                  />

                  Real-time AI evaluation

                </span>

              </div>

            </div>

          </div>


          <button
            type="button"
            onClick={startAssessment}
            disabled={
              selectedSkills.length === 0 ||
              loading
            }
            className="flex items-center gap-2 bg-primary hover:opacity-90 active:scale-95 transition-all duration-150 text-white font-semibold px-6 py-3 rounded-xl shrink-0 glow-blue disabled:opacity-40 disabled:cursor-not-allowed"
          >

            <Brain size={18} />

            Begin Assessment

            <ChevronRight size={16} />

          </button>

        </div>

      </div>


      {/* ===============================================
          HOW IT WORKS
      =============================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        {[
          {
            id: 'adaptive',

            icon: Brain,

            color:
              'text-primary',

            bg:
              'bg-blue-900/30',

            title:
              'Adaptive Questions',

            desc:
              'AI adjusts question difficulty based on your previous answers.',
          },

          {
            id: 'evaluation',

            icon: Zap,

            color:
              'text-accent',

            bg:
              'bg-cyan-900/30',

            title:
              'Instant AI Evaluation',

            desc:
              'Each submitted answer is evaluated immediately by the backend AI evaluator.',
          },

          {
            id: 'competency',

            icon: BarChart2,

            color:
              'text-warning',

            bg:
              'bg-amber-900/30',

            title:
              'Skill Gap Analysis',

            desc:
              'Assessment results identify strengths, gaps and learning recommendations.',
          },

        ].map((item) => {

          const ItemIcon =
            item.icon;

          return (

            <div
              key={item.id}
              className="card-base p-4 flex items-start gap-3"
            >

              <div
                className={`w-9 h-9 rounded-xl ${item.bg} flex items-center justify-center shrink-0`}
              >

                <ItemIcon
                  size={18}
                  className={
                    item.color
                  }
                />

              </div>


              <div>

                <p className="text-sm font-semibold text-foreground">
                  {item.title}
                </p>

                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  {item.desc}
                </p>

              </div>

            </div>

          );
        })}

      </div>


      {/* ===============================================
          SKILL SELECTION
      =============================================== */}

      <div className="card-base p-5">

        <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">

          <div>

            <h3 className="text-sm font-semibold text-foreground">
              Choose Competencies
            </h3>

            <p className="text-xs text-muted-foreground mt-0.5">
              Select one or more skills.
              Assessment skills are independent of your department.
            </p>

          </div>


          <div className="flex items-center gap-2">

            <button
              type="button"
              onClick={selectAll}
              className="text-xs text-primary hover:text-blue-300 transition-colors"
            >
              Select all
            </button>

            <span className="text-muted-foreground">
              •
            </span>

            <button
              type="button"
              onClick={clearSelection}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear
            </button>

          </div>

        </div>


        {loading && (

          <div className="py-10 flex items-center justify-center gap-2">

            <Loader2
              size={18}
              className="animate-spin text-primary"
            />

            <span className="text-sm text-muted-foreground">
              Loading competencies...
            </span>

          </div>

        )}


        {!loading && error && (

          <div className="p-4 rounded-lg border border-red-800/40 bg-red-950/30">

            <div className="flex items-center gap-2 text-red-400">

              <AlertTriangle size={16} />

              <span className="text-sm font-semibold">
                Could not load existing competency scores
              </span>

            </div>

            <p className="text-xs text-muted-foreground mt-1">
              {error}
            </p>

          </div>

        )}


        {!loading && (

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">

            {skills.map(
              (skill) => {

                const selected =
                  selectedSkills.includes(
                    skill.name
                  );


                return (

                  <button
                    type="button"
                    key={skill.name}
                    onClick={() =>
                      toggleSkill(
                        skill.name
                      )
                    }
                    className={`text-left p-3 rounded-xl border transition-all duration-150 ${
                      selected
                        ? 'border-primary bg-primary/10 ring-1 ring-primary/30'
                        : 'border-border bg-muted hover:border-primary/40'
                    }`}
                  >

                    <div className="flex items-start justify-between gap-2">

                      <div className="flex-1 min-w-0">

                        <p className="text-xs font-semibold text-foreground">
                          {skill.name}
                        </p>


                        <div className="flex items-center gap-2 mt-1">

                          {skill.currentScore !== null ? (

                            <>

                              <span
                                className={`text-xs font-bold ${
                                  levelColor[
                                    skill.level
                                  ] ||
                                  'text-muted-foreground'
                                }`}
                              >
                                {skill.currentScore}/100
                              </span>

                              <span
                                className={`text-2xs ${
                                  levelColor[
                                    skill.level
                                  ] ||
                                  'text-muted-foreground'
                                }`}
                              >
                                {skill.level}
                              </span>

                            </>

                          ) : (

                            <span className="text-2xs text-muted-foreground">
                              Not assessed yet
                            </span>

                          )}

                        </div>

                      </div>


                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                          selected
                            ? 'bg-primary border-primary'
                            : 'border-border'
                        }`}
                      >

                        {selected && (

                          <CheckCircle2
                            size={13}
                            className="text-white"
                          />

                        )}

                      </div>

                    </div>


                    {skill.currentScore !== null && (

                      <div className="mt-2">

                        <div className="w-full h-1 bg-navy-600 rounded-full overflow-hidden">

                          <div
                            className={`h-full rounded-full ${scoreBarColor(
                              skill.currentScore
                            )}`}
                            style={{
                              width:
                                `${Math.min(
                                  100,
                                  Math.max(
                                    0,
                                    skill.currentScore
                                  )
                                )}%`,
                            }}
                          />

                        </div>

                      </div>

                    )}

                  </button>

                );
              }
            )}

          </div>

        )}


        <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">

          <p className="text-xs text-muted-foreground">
            {selectedSkills.length}{' '}
            skill
            {selectedSkills.length === 1
              ? ''
              : 's'}{' '}
            selected
          </p>


          <div className="flex items-center gap-2">

            <label
              htmlFor="question-count"
              className="text-xs text-muted-foreground"
            >
              Questions:
            </label>

            <select
              id="question-count"
              value={maxQuestions}
              onChange={(event) =>
                setMaxQuestions(
                  Number(
                    event.target.value
                  )
                )
              }
              className="bg-muted border border-border rounded-lg px-3 py-1.5 text-xs text-foreground"
            >
              <option value={5}>
                5
              </option>

              <option value={8}>
                8
              </option>

              <option value={10}>
                10
              </option>

              <option value={12}>
                12
              </option>
            </select>

          </div>

        </div>

      </div>


      {/* ===============================================
          INSTRUCTIONS
      =============================================== */}

      <div className="card-base p-5">

        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">

          <Info
            size={15}
            className="text-primary"
          />

          Assessment Instructions

        </h3>


        <ul className="space-y-2">

          {[
            'Choose the competencies you want to assess.',
            'Questions are generated dynamically by AI — they are not taken from the old fixed question bank.',
            'Difficulty can increase or decrease after each submitted answer.',
            'You cannot return to a question after submitting it.',
            'The backend evaluates each answer and determines the next adaptive question.',
            'Final results are used for skill-gap analysis and course recommendations.',
          ].map(
            (instruction, index) => (

              <li
                key={index}
                className="flex items-start gap-2.5 text-xs text-muted-foreground"
              >

                <CheckCircle2
                  size={13}
                  className="text-success shrink-0 mt-0.5"
                />

                <span className="leading-relaxed">
                  {instruction}
                </span>

              </li>

            )
          )}

        </ul>

      </div>


      {/* ===============================================
          PRIVACY
      =============================================== */}

      <div className="flex items-start gap-2.5 p-3 rounded-lg bg-muted border border-border">

        <Shield
          size={14}
          className="text-success shrink-0 mt-0.5"
        />

        <p className="text-xs text-muted-foreground leading-relaxed">
          Assessment responses and competency results are stored
          for competency-development purposes.
        </p>

      </div>


      {/* ===============================================
          BOTTOM CTA
      =============================================== */}

      <div className="flex items-center justify-between gap-4 flex-wrap">

        <Link
          href="/dashboard"
          className="btn-secondary"
        >
          Back to Dashboard
        </Link>


        <button
          type="button"
          onClick={startAssessment}
          disabled={
            selectedSkills.length === 0 ||
            loading
          }
          className="flex items-center gap-2 bg-primary hover:opacity-90 active:scale-95 transition-all duration-150 text-white font-bold px-8 py-3 rounded-xl text-sm glow-blue disabled:opacity-40 disabled:cursor-not-allowed"
        >

          <Brain size={18} />

          Start AI Assessment

          <ChevronRight size={16} />

        </button>

      </div>

    </div>
  );
}
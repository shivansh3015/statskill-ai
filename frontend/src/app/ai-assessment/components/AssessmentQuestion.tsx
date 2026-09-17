'use client';

import React from 'react';

import {
  Brain,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Loader2,
  Zap,
  Target,
  Clock,
} from 'lucide-react';

import type {
  QuestionData,
  AssessmentSession,
  EvaluationData,
} from './AssessmentPageClient';

import AIEvaluationPanel from './AIEvaluationPanel';


interface AssessmentQuestionProps {
  question: QuestionData;

  session: AssessmentSession;

  selectedOption: string | null;

  evaluation: EvaluationData | null;

  isSubmitting: boolean;

  onSelectOption:
    (id: string) => void;

  onSubmitAnswer:
    () => void;

  onNextQuestion:
    () => void;
}


const difficultyConfig:
  Record<
    string,
    {
      label: string;
      color: string;
      bg: string;
      border: string;
    }
  > = {

  Beginner: {
    label: 'Beginner',
    color: 'text-slate-300',
    bg: 'bg-slate-800/40',
    border: 'border-slate-700/40',
  },

  Foundation: {
    label: 'Foundation',
    color: 'text-emerald-400',
    bg: 'bg-emerald-900/30',
    border: 'border-emerald-800/40',
  },

  Intermediate: {
    label: 'Intermediate',
    color: 'text-blue-400',
    bg: 'bg-blue-900/30',
    border: 'border-blue-800/40',
  },

  Advanced: {
    label: 'Advanced',
    color: 'text-purple-400',
    bg: 'bg-purple-900/30',
    border: 'border-purple-800/40',
  },

  Expert: {
    label: 'Expert',
    color: 'text-amber-400',
    bg: 'bg-amber-900/30',
    border: 'border-amber-800/40',
  },

  Easy: {
    label: 'Easy',
    color: 'text-emerald-400',
    bg: 'bg-emerald-900/30',
    border: 'border-emerald-800/40',
  },

  Medium: {
    label: 'Medium',
    color: 'text-amber-400',
    bg: 'bg-amber-900/30',
    border: 'border-amber-800/40',
  },

  Hard: {
    label: 'Hard',
    color: 'text-red-400',
    bg: 'bg-red-900/30',
    border: 'border-red-800/40',
  },
};


export default function AssessmentQuestion({
  question,
  session,
  selectedOption,
  evaluation,
  isSubmitting,
  onSelectOption,
  onSubmitAnswer,
  onNextQuestion,
}: AssessmentQuestionProps) {

  const progress =
    (
      question.questionNumber /
      question.totalQuestions
    ) * 100;


  const diff =
    difficultyConfig[
      question.difficulty
    ] ||
    difficultyConfig.Beginner;


  const correctAnswers =
    session.answers.filter(
      (answer) =>
        answer.correct
    ).length;


  function getOptionState(
    optionId: string
  ) {

    if (!evaluation) {

      return (
        selectedOption === optionId
          ? 'selected'
          : 'default'
      );
    }


    /*
      We only know whether the EMPLOYEE'S
      selected answer was correct.

      The backend does not expose the
      correct answer before/after submission.
    */
    if (
      optionId === selectedOption
    ) {

      return evaluation.isCorrect
        ? 'correct'
        : 'incorrect';
    }


    return 'default';
  }


  const optionClasses:
    Record<string, string> = {

    default:
      'assessment-option bg-muted',

    selected:
      'assessment-option selected',

    correct:
      'assessment-option correct',

    incorrect:
      'assessment-option incorrect',
  };


  return (

    <div className="max-w-3xl mx-auto space-y-5">

      {/* Header */}

      <div className="card-base p-4">

        <div className="flex items-center justify-between gap-4 mb-3 flex-wrap">

          <div className="flex items-center gap-3 flex-wrap">

            <div className="flex items-center gap-1.5">

              <Brain
                size={15}
                className="text-primary"
              />

              <span className="text-xs font-semibold text-foreground">
                AI Assessment
              </span>

            </div>


            <span className="text-muted-foreground text-xs">
              |
            </span>


            <span className="text-xs text-muted-foreground">
              {question.competency}
            </span>


            <span className="text-muted-foreground text-xs">
              |
            </span>


            <div
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-semibold ${diff.color} ${diff.bg} ${diff.border}`}
            >

              <Zap size={10} />

              {diff.label}

            </div>

          </div>


          <div className="flex items-center gap-4">

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">

              <Target
                size={12}
                className="text-accent"
              />

              Score:

              <span className="font-bold text-foreground tabular-nums">
                {session.currentScore}
              </span>

            </div>


            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">

              <CheckCircle2
                size={12}
                className="text-success"
              />

              Correct:

              <span className="font-bold text-success tabular-nums">
                {correctAnswers}
              </span>

              <span>
                /{session.answers.length}
              </span>

            </div>

          </div>

        </div>


        <div>

          <div className="flex items-center justify-between mb-1.5">

            <span className="text-xs text-muted-foreground">

              Question{' '}

              <span className="font-semibold text-foreground">
                {question.questionNumber}
              </span>

              {' '}of{' '}

              {question.totalQuestions}

            </span>


            <span className="text-xs font-semibold text-foreground">

              {Math.min(
                100,
                Math.round(progress)
              )}%

            </span>

          </div>


          <div className="w-full h-2 bg-navy-600 rounded-full overflow-hidden">

            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 progress-bar-fill"
              style={{
                width:
                  `${Math.min(
                    100,
                    progress
                  )}%`,
              }}
            />

          </div>


          <div className="flex items-center gap-1 mt-2">

            {Array.from({
              length:
                question.totalQuestions,
            }).map(
              (_, index) => {

                const answer =
                  session.answers[index];


                const isCurrent =
                  index ===
                  question.questionNumber - 1;


                return (

                  <div
                    key={index}
                    className={`flex-1 h-1 rounded-full ${
                      answer
                        ? answer.correct
                          ? 'bg-success'
                          : 'bg-danger'
                        : isCurrent
                          ? 'bg-primary'
                          : 'bg-navy-600'
                    }`}
                  />

                );
              }
            )}

          </div>

        </div>

      </div>


      {/* Skill information */}

      <div className="flex items-center gap-2 flex-wrap">

        <span className="badge-info flex items-center gap-1">

          <Target size={10} />

          {question.competency}

        </span>


        <span className="badge-muted">
          {question.topic}
        </span>


        <span className="ml-auto text-xs text-muted-foreground flex items-center gap-1">

          <Clock size={11} />

          Adaptive level:{' '}
          {question.difficulty}

        </span>

      </div>


      {/* Question */}

      <div className="card-base p-6">

        <p className="text-base font-semibold text-foreground leading-relaxed mb-6">
          {question.questionText}
        </p>


        <div className="space-y-3">

          {question.options.map(
            (option) => {

              const state =
                getOptionState(
                  option.id
                );


              return (

                <button
                  key={option.id}
                  type="button"
                  onClick={() =>
                    onSelectOption(
                      option.id
                    )
                  }
                  disabled={
                    Boolean(
                      evaluation
                    ) ||
                    isSubmitting
                  }
                  className={`w-full flex items-center gap-3 p-4 rounded-xl text-left transition-all duration-150 ${optionClasses[state]} disabled:cursor-not-allowed`}
                >

                  <span
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 border ${
                      state === 'correct'
                        ? 'bg-success/20 border-success text-success'
                        : state === 'incorrect'
                          ? 'bg-danger/20 border-danger text-danger'
                          : state === 'selected'
                            ? 'bg-primary/20 border-primary text-primary'
                            : 'bg-navy-600 border-border text-muted-foreground'
                    }`}
                  >
                    {option.label}
                  </span>


                  <span className="flex-1 text-sm leading-relaxed text-foreground">
                    {option.text}
                  </span>


                  {state ===
                    'correct' && (

                    <CheckCircle2
                      size={16}
                      className="text-success"
                    />

                  )}


                  {state ===
                    'incorrect' && (

                    <XCircle
                      size={16}
                      className="text-danger"
                    />

                  )}

                </button>

              );
            }
          )}

        </div>


        {!evaluation && (

          <div className="mt-6 flex items-center justify-between gap-4">

            <p className="text-xs text-muted-foreground">

              {selectedOption
                ? 'Answer selected — ready to submit'
                : 'Select an answer to continue'}

            </p>


            <button
              type="button"
              onClick={
                onSubmitAnswer
              }
              disabled={
                !selectedOption ||
                isSubmitting
              }
              className="flex items-center gap-2 bg-primary hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 text-white font-semibold px-6 py-2.5 rounded-xl"
            >

              {isSubmitting ? (

                <>
                  <Loader2
                    size={15}
                    className="animate-spin"
                  />

                  Evaluating...
                </>

              ) : (

                <>
                  Submit Answer

                  <ChevronRight
                    size={15}
                  />
                </>

              )}

            </button>

          </div>

        )}

      </div>


      {evaluation && (

        <AIEvaluationPanel
          question={
            question
          }

          selectedOptionId={
            selectedOption!
          }

          evaluation={
            evaluation
          }

          onNext={
            onNextQuestion
          }
        />

      )}

    </div>
  );
}
'use client';

import React from 'react';

import {
  Brain,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Zap,
  TrendingUp,
  TrendingDown,
  BarChart2,
  Flag,
} from 'lucide-react';

import type {
  QuestionData,
  EvaluationData,
} from './AssessmentPageClient';


interface AIEvaluationPanelProps {
  question: QuestionData;

  selectedOptionId: string;

  evaluation: EvaluationData;

  onNext: () => void;
}


export default function AIEvaluationPanel({
  question,
  selectedOptionId,
  evaluation,
  onNext,
}: AIEvaluationPanelProps) {

  const selectedOption =
    question.options.find(
      (option) =>
        option.id ===
        selectedOptionId
    );


  return (

    <div className="slide-up space-y-4">

      {/* Result */}

      <div
        className={`rounded-xl border p-4 flex items-center gap-4 ${
          evaluation.isCorrect
            ? 'bg-emerald-950/40 border-emerald-800/40'
            : 'bg-red-950/40 border-red-800/40'
        }`}
      >

        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
            evaluation.isCorrect
              ? 'bg-success/20'
              : 'bg-danger/20'
          }`}
        >

          {evaluation.isCorrect ? (

            <CheckCircle2
              size={24}
              className="text-success"
            />

          ) : (

            <XCircle
              size={24}
              className="text-danger"
            />

          )}

        </div>


        <div className="flex-1">

          <p
            className={`text-base font-bold ${
              evaluation.isCorrect
                ? 'text-success'
                : 'text-danger'
            }`}
          >

            {evaluation.isCorrect
              ? 'Correct Answer!'
              : 'Answer Needs Improvement'}

          </p>


          <p className="text-xs text-muted-foreground mt-0.5">

            Your response was evaluated by
            StatSkill AI.

          </p>

        </div>


        <div className="text-right shrink-0">

          <p className="text-xs text-muted-foreground">
            Evaluation Score
          </p>

          <p className="text-xl font-bold text-foreground tabular-nums">

            {evaluation.score}/100

          </p>

        </div>

      </div>


      {/* AI feedback */}

      <div className="card-base p-5">

        <div className="flex items-center gap-2 mb-3">

          <div className="w-7 h-7 rounded-lg bg-blue-900/40 flex items-center justify-center">

            <Brain
              size={15}
              className="text-primary"
            />

          </div>


          <p className="text-sm font-semibold text-foreground">
            AI Evaluation
          </p>


          <span className="badge-info ml-auto">

            <Zap size={9} />

            StatSkill AI

          </span>

        </div>


        <p className="text-sm text-muted-foreground leading-relaxed">
          {evaluation.feedback}
        </p>


        <div className="mt-4 p-3 rounded-lg bg-muted border border-border">

          <p className="text-2xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">
            Your Answer
          </p>

          <p className="text-xs text-foreground">

            <span className="font-bold text-primary">
              {selectedOption?.label}.
            </span>{' '}

            {selectedOption?.text}

          </p>

        </div>

      </div>


      {/* Adaptive engine */}

      <div className="card-base p-4 flex items-start gap-3">

        <div className="w-8 h-8 rounded-lg bg-amber-900/30 border border-amber-800/30 flex items-center justify-center shrink-0">

          <BarChart2
            size={15}
            className="text-warning"
          />

        </div>


        <div className="flex-1">

          <p className="text-xs font-semibold text-foreground mb-0.5">
            Adaptive Difficulty Update
          </p>


          <p className="text-xs text-muted-foreground leading-relaxed">

            {evaluation.adaptiveReason ||
              'The adaptive engine has updated the next assessment strategy.'}

          </p>


          {!evaluation.completed &&
            (
              evaluation.nextSkill ||
              evaluation.nextLevel
            ) && (

            <p className="text-xs text-foreground mt-2">

              Next:

              {' '}

              <span className="font-semibold text-primary">

                {evaluation.nextSkill ||
                  question.competency}

              </span>

              {evaluation.nextLevel && (
                <>
                  {' • '}
                  {evaluation.nextLevel}
                </>
              )}

            </p>

          )}

        </div>


        {!evaluation.completed && (

          <div className="shrink-0">

            {evaluation.isCorrect ? (

              <div className="flex items-center gap-1 text-success">

                <TrendingUp
                  size={14}
                />

                <span className="text-xs font-semibold">
                  Adaptive
                </span>

              </div>

            ) : (

              <div className="flex items-center gap-1 text-warning">

                <TrendingDown
                  size={14}
                />

                <span className="text-xs font-semibold">
                  Adaptive
                </span>

              </div>

            )}

          </div>

        )}

      </div>


      {/* Competency impact */}

      <div className="card-base p-4">

        <p className="text-xs font-semibold text-foreground mb-3 flex items-center gap-2">

          <Flag
            size={13}
            className="text-accent"
          />

          Competency Evaluation —{' '}
          {question.competency}

        </p>


        <div className="w-full h-1.5 bg-navy-600 rounded-full overflow-hidden">

          <div
            className="h-full rounded-full bg-primary progress-bar-fill"
            style={{
              width:
                `${Math.min(
                  100,
                  Math.max(
                    0,
                    evaluation.score
                  )
                )}%`,
            }}
          />

        </div>


        <p className="text-2xs text-muted-foreground mt-2">

          Question evaluation score:{' '}

          <span className="font-semibold text-foreground">
            {evaluation.score}/100
          </span>

        </p>

      </div>


      {/* Next */}

      <div className="flex items-center justify-end">

        <button
          type="button"
          onClick={onNext}
          className="flex items-center gap-2 bg-primary hover:opacity-90 active:scale-95 transition-all duration-150 text-white font-semibold px-8 py-3 rounded-xl"
        >

          {evaluation.completed ? (

            <>
              View Results

              <BarChart2
                size={16}
              />
            </>

          ) : (

            <>
              Next AI Question

              <ChevronRight
                size={16}
              />
            </>

          )}

        </button>

      </div>

    </div>
  );
}
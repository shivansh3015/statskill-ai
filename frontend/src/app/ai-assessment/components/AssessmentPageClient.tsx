'use client';

import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import { useRouter } from 'next/navigation';

import {
  AlertTriangle,
  Loader2,
} from 'lucide-react';

import {
  apiPost,
} from '@/lib/api';

import {
  getCurrentUserId,
} from '@/lib/auth';

import AssessmentSetup from './AssessmentSetup';
import AssessmentQuestion from './AssessmentQuestion';
import AssessmentComplete from './AssessmentComplete';


export type AssessmentPhase =
  | 'setup'
  | 'question'
  | 'complete';


export type AssessmentDifficulty =
  | 'Beginner'
  | 'Foundation'
  | 'Intermediate'
  | 'Advanced'
  | 'Expert'
  | 'Easy'
  | 'Medium'
  | 'Hard';


export interface QuestionData {
  id: string;
  questionNumber: number;
  totalQuestions: number;

  competency: string;

  difficulty:
    AssessmentDifficulty;

  difficultyScore: number;

  questionText: string;

  options: {
    id: string;
    label: string;
    text: string;
  }[];

  /*
   * Kept for compatibility with the existing UI.
   * The backend never exposes the correct answer before submission.
   */
  correctOptionId: string;

  explanation: string;

  aiConfidence: number;

  adaptiveMessage: string;

  topic: string;

  questionType?: string;
}


export interface AnswerRecord {
  questionId: string;

  selectedOptionId: string;

  correct: boolean;

  competency: string;

  difficulty:
    AssessmentDifficulty;

  timeTaken: number;

  score: number;

  feedback: string;
}


export interface AssessmentSession {
  sessionId: string;

  startTime: string;

  competencyDomain: string;

  totalQuestions: number;

  answers: AnswerRecord[];

  currentScore: number;
}


export interface EvaluationData {
  score: number;

  isCorrect: boolean;

  feedback: string;

  completed: boolean;

  nextSkill?: string;

  nextLevel?: string;

  adaptiveReason?: string;
}


interface StartAssessmentResponse {
  message: string;

  session_id: number;

  user_id: number;

  skills: string[];

  max_questions: number;

  current_skill: string;

  current_level: string;

  assessment_type?: string;

  source_course_id?: number | null;
}


interface NextQuestionResponse {
  session_id: number;

  question_id?: number;

  sequence_number?: number;

  question_type?: string;

  skill_name?: string;

  difficulty?: string;

  question?: string;

  options?: unknown;

  completed: boolean;

  message?: string;
}


interface AnswerResponse {
  message: string;

  completed: boolean;

  evaluation: {
    score: number;
    is_correct: boolean;
    feedback: string;
  };

  next_skill?: string | null;

  next_level?: string | null;

  adaptive_reason?: string;

  question_number?: number;
}


const initialSession:
  AssessmentSession = {
    sessionId: '',
    startTime: '',
    competencyDomain:
      'Multi-Skill Adaptive',
    totalQuestions: 0,
    answers: [],
    currentScore: 0,
  };


function difficultyScore(
  difficulty:
    AssessmentDifficulty
): number {

  const scores:
    Record<string, number> = {

    Beginner: 20,
    Foundation: 40,
    Intermediate: 60,
    Advanced: 80,
    Expert: 100,

    Easy: 30,
    Medium: 60,
    Hard: 85,
  };


  return (
    scores[difficulty] ??
    40
  );
}


function normalizeDifficulty(
  value?: string
):
  AssessmentDifficulty {

  const allowed:
    AssessmentDifficulty[] = [
      'Beginner',
      'Foundation',
      'Intermediate',
      'Advanced',
      'Expert',
      'Easy',
      'Medium',
      'Hard',
    ];


  if (
    value &&
    allowed.includes(
      value as
        AssessmentDifficulty
    )
  ) {
    return (
      value as
        AssessmentDifficulty
    );
  }


  return 'Beginner';
}


function normalizeOptions(
  raw: unknown
): {
  id: string;
  label: string;
  text: string;
}[] {

  if (
    raw &&
    typeof raw === 'object' &&
    !Array.isArray(raw)
  ) {

    return Object.entries(
      raw as
        Record<string, unknown>
    ).map(
      (
        [key, value],
        index
      ) => {

        const label =
          key ||
          String.fromCharCode(
            65 + index
          );


        if (
          value &&
          typeof value ===
            'object'
        ) {

          const objectValue =
            value as
              Record<
                string,
                unknown
              >;


          return {
            id:
              String(
                objectValue.id ??
                  objectValue.value ??
                  label
              ),

            label:
              String(
                objectValue.label ??
                  label
              ),

            text:
              String(
                objectValue.text ??
                  objectValue.value ??
                  ''
              ),
          };
        }


        return {
          id: label,
          label,
          text: String(
            value ?? ''
          ),
        };
      }
    );
  }


  if (
    Array.isArray(raw)
  ) {

    return raw.map(
      (
        item,
        index
      ) => {

        const fallbackLabel =
          String.fromCharCode(
            65 + index
          );


        if (
          item &&
          typeof item ===
            'object'
        ) {

          const objectItem =
            item as
              Record<
                string,
                unknown
              >;


          const label =
            String(
              objectItem.label ??
                objectItem.id ??
                fallbackLabel
            );


          return {
            id:
              String(
                objectItem.id ??
                  objectItem.value ??
                  label
              ),

            label,

            text:
              String(
                objectItem.text ??
                  objectItem.value ??
                  ''
              ),
          };
        }


        return {
          id: fallbackLabel,
          label: fallbackLabel,
          text: String(
            item ?? ''
          ),
        };
      }
    );
  }


  return [];
}


export default function AssessmentPageClient() {

  const router = useRouter();

  const automaticStartRef =
    useRef(false);


  const [
    phase,
    setPhase,
  ] =
    useState<AssessmentPhase>(
      'setup'
    );


  const [
    session,
    setSession,
  ] =
    useState<AssessmentSession>(
      initialSession
    );


  const [
    currentQuestion,
    setCurrentQuestion,
  ] =
    useState<QuestionData | null>(
      null
    );


  const [
    questions,
    setQuestions,
  ] =
    useState<QuestionData[]>(
      []
    );


  const [
    selectedOption,
    setSelectedOption,
  ] =
    useState<string | null>(
      null
    );


  const [
    showEvaluation,
    setShowEvaluation,
  ] =
    useState(false);


  const [
    evaluation,
    setEvaluation,
  ] =
    useState<EvaluationData | null>(
      null
    );


  const [
    isSubmitting,
    setIsSubmitting,
  ] =
    useState(false);


  const [
    loadingQuestion,
    setLoadingQuestion,
  ] =
    useState(false);


  const [
    startTime,
    setStartTime,
  ] =
    useState<number>(
      Date.now()
    );


  const [
    error,
    setError,
  ] =
    useState('');


  async function loadNextQuestion(
    sessionId: number,
    totalQuestions: number
  ) {

    setLoadingQuestion(true);

    setError('');


    try {

      const response =
        await apiPost<NextQuestionResponse>(
          `/ai/assessment/next?session_id=${sessionId}`
        );


      if (
        response.completed
      ) {

        setPhase(
          'complete'
        );

        return;
      }


      if (
        !response.question_id ||
        !response.question
      ) {

        throw new Error(
          response.message ||
            'The backend did not return a question.'
        );
      }


      const difficulty =
        normalizeDifficulty(
          response.difficulty
        );


      const mappedQuestion:
        QuestionData = {

        id:
          String(
            response.question_id
          ),

        questionNumber:
          response.sequence_number ??
          1,

        totalQuestions,

        competency:
          response.skill_name ||
          'General',

        difficulty,

        difficultyScore:
          difficultyScore(
            difficulty
          ),

        questionText:
          response.question,

        options:
          normalizeOptions(
            response.options
          ),

        correctOptionId: '',

        explanation: '',

        aiConfidence: 0,

        adaptiveMessage:
          'Question generated dynamically by StatSkill AI.',

        topic:
          response.skill_name ||
          'General',

        questionType:
          response.question_type,
      };


      setCurrentQuestion(
        mappedQuestion
      );


      setQuestions(
        (previous) => {

          const alreadyExists =
            previous.some(
              (question) =>
                question.id ===
                mappedQuestion.id
            );


          if (
            alreadyExists
          ) {
            return previous;
          }


          return [
            ...previous,
            mappedQuestion,
          ];
        }
      );


      setSelectedOption(
        null
      );

      setShowEvaluation(
        false
      );

      setEvaluation(
        null
      );

      setStartTime(
        Date.now()
      );

      setPhase(
        'question'
      );

    } catch (err) {

      console.error(
        'Next question error:',
        err
      );


      setError(
        err instanceof Error
          ? err.message
          : 'Unable to generate the next AI question.'
      );

    } finally {

      setLoadingQuestion(
        false
      );
    }
  }


  async function handleStartAssessment(
    skills: string[],
    maxQuestions: number,
    assessmentType = 'AI Assessment',
    sourceCourseId: number | null = null
  ) {

    const userId =
      getCurrentUserId();

    if (!userId) {
      router.replace('/');
      return;
    }

    if (
      !skills.length
    ) {
      setError(
        'Select at least one skill.'
      );

      return;
    }


    setError('');

    setLoadingQuestion(
      true
    );


    try {

      const response =
        await apiPost<StartAssessmentResponse>(
          '/ai/assessment/start',
          {
            user_id: userId,
            skills,
            max_questions:
              maxQuestions,
            assessment_type:
              assessmentType,
            source_course_id:
              sourceCourseId,
          }
        );


      const newSession:
        AssessmentSession = {

        sessionId:
          String(
            response.session_id
          ),

        startTime:
          new Date().toLocaleString(),

        competencyDomain:
          response.skills.join(
            ', '
          ),

        totalQuestions:
          response.max_questions,

        answers: [],

        currentScore: 0,
      };


      setSession(
        newSession
      );

      setQuestions(
        []
      );

      setCurrentQuestion(
        null
      );

      setSelectedOption(
        null
      );

      setShowEvaluation(
        false
      );

      setEvaluation(
        null
      );


      await loadNextQuestion(
        response.session_id,
        response.max_questions
      );

    } catch (err) {

      console.error(
        'Assessment start error:',
        err
      );


      setError(
        err instanceof Error
          ? err.message
          : 'Unable to start the AI assessment.'
      );


      setPhase(
        'setup'
      );

    } finally {

      setLoadingQuestion(
        false
      );
    }
  }


  useEffect(() => {
    const userId =
      getCurrentUserId();

    if (!userId) {
      router.replace('/');
    }
  }, [router]);


  /*
   * Automatic post-course reassessment.
   *
   * Example:
   * /ai-assessment?reassessment=1&skills=Probability&course_id=1
   */
  useEffect(() => {
    if (automaticStartRef.current) {
      return;
    }

    if (typeof window === 'undefined') {
      return;
    }

    const searchParams =
      new URLSearchParams(
        window.location.search
      );

    const isReassessment =
      searchParams.get(
        'reassessment'
      );

    const skillsParameter =
      searchParams.get(
        'skills'
      );

    const courseIdParameter =
      searchParams.get(
        'course_id'
      );

    if (
      isReassessment !== '1' ||
      !skillsParameter
    ) {
      return;
    }

    const reassessmentSkills =
      skillsParameter
        .split('|')
        .map(
          (skill) =>
            skill.trim()
        )
        .filter(Boolean);

    if (
      reassessmentSkills.length === 0
    ) {
      return;
    }

    const parsedCourseId =
      courseIdParameter
        ? Number(
            courseIdParameter
          )
        : null;

    const validSourceCourseId =
      parsedCourseId !== null &&
      Number.isInteger(
        parsedCourseId
      ) &&
      parsedCourseId > 0
        ? parsedCourseId
        : null;

    automaticStartRef.current =
      true;

    handleStartAssessment(
      reassessmentSkills,
      5,
      'Post-Course Reassessment',
      validSourceCourseId
    );
  }, []);


  function handleSelectOption(
    optionId: string
  ) {

    if (
      showEvaluation ||
      isSubmitting
    ) {
      return;
    }


    setSelectedOption(
      optionId
    );
  }


  async function handleSubmitAnswer() {

    if (
      !selectedOption ||
      !currentQuestion ||
      !session.sessionId
    ) {
      return;
    }


    setIsSubmitting(
      true
    );

    setError('');


    try {

      const response =
        await apiPost<AnswerResponse>(
          '/ai/assessment/answer',
          {
            session_id:
              Number(
                session.sessionId
              ),

            question_id:
              Number(
                currentQuestion.id
              ),

            answer:
              selectedOption,
          }
        );


      const timeTaken =
        Math.max(
          0,
          Math.round(
            (
              Date.now() -
              startTime
            ) /
              1000
          )
        );


      const record:
        AnswerRecord = {

        questionId:
          currentQuestion.id,

        selectedOptionId:
          selectedOption,

        correct:
          response.evaluation
            .is_correct,

        competency:
          currentQuestion.competency,

        difficulty:
          currentQuestion.difficulty,

        timeTaken,

        score:
          response.evaluation
            .score,

        feedback:
          response.evaluation
            .feedback,
      };


      setSession(
        (previous) => {

          const newAnswers = [
            ...previous.answers,
            record,
          ];


          const average =
            newAnswers.length
              ? Math.round(
                  newAnswers.reduce(
                    (
                      total,
                      answer
                    ) =>
                      total +
                      answer.score,
                    0
                  ) /
                    newAnswers.length
                )
              : 0;


          return {
            ...previous,
            answers:
              newAnswers,
            currentScore:
              average,
          };
        }
      );


      const evaluationData:
        EvaluationData = {

        score:
          response.evaluation
            .score,

        isCorrect:
          response.evaluation
            .is_correct,

        feedback:
          response.evaluation
            .feedback,

        completed:
          response.completed,

        nextSkill:
          response.next_skill ||
          undefined,

        nextLevel:
          response.next_level ||
          undefined,

        adaptiveReason:
          response.adaptive_reason ||
          undefined,
      };


      setEvaluation(
        evaluationData
      );


      setCurrentQuestion(
        (previous) => {

          if (
            !previous
          ) {
            return previous;
          }


          return {
            ...previous,

            /*
             * Never reveal the correct answer when the employee was wrong.
             * If the employee was correct, their selected option is safe to
             * mark as correct for UI styling.
             */
            correctOptionId:
              response.evaluation
                .is_correct
                ? selectedOption
                : '',

            explanation:
              response.evaluation
                .feedback,

            aiConfidence:
              response.evaluation
                .score,

            adaptiveMessage:
              response.adaptive_reason ||
              'The next question will adapt to this result.',
          };
        }
      );


      setQuestions(
        (previous) =>
          previous.map(
            (question) => {

              if (
                question.id !==
                currentQuestion.id
              ) {
                return question;
              }


              return {
                ...question,

                correctOptionId:
                  response.evaluation
                    .is_correct
                    ? selectedOption
                    : '',

                explanation:
                  response.evaluation
                    .feedback,

                aiConfidence:
                  response.evaluation
                    .score,

                adaptiveMessage:
                  response.adaptive_reason ||
                  question.adaptiveMessage,
              };
            }
          )
      );


      setShowEvaluation(
        true
      );

    } catch (err) {

      console.error(
        'Answer submission error:',
        err
      );


      setError(
        err instanceof Error
          ? err.message
          : 'Unable to evaluate the answer.'
      );

    } finally {

      setIsSubmitting(
        false
      );
    }
  }


  async function handleNextQuestion() {

    if (
      !evaluation ||
      !session.sessionId
    ) {
      return;
    }


    if (
      evaluation.completed
    ) {

      setPhase(
        'complete'
      );

      return;
    }


    await loadNextQuestion(
      Number(
        session.sessionId
      ),
      session.totalQuestions
    );
  }


  function handleRestartAssessment() {

    /*
     * Remove the automatic reassessment URL so pressing Restart takes the
     * employee back to normal skill selection instead of auto-starting again.
     */
    if (
      typeof window !==
        'undefined'
    ) {

      window.history.replaceState(
        {},
        '',
        '/ai-assessment'
      );
    }


    automaticStartRef.current =
      true;


    setPhase(
      'setup'
    );

    setSession(
      initialSession
    );

    setCurrentQuestion(
      null
    );

    setQuestions(
      []
    );

    setSelectedOption(
      null
    );

    setShowEvaluation(
      false
    );

    setEvaluation(
      null
    );

    setError('');

    setStartTime(
      Date.now()
    );
  }


  if (
    phase ===
    'complete'
  ) {

    return (
      <AssessmentComplete
        session={session}
        questions={questions}
        onRestart={
          handleRestartAssessment
        }
      />
    );
  }


  if (
    phase ===
      'question' &&
    currentQuestion
  ) {

    return (
      <div className="space-y-4">

        {error && (
          <div className="max-w-3xl mx-auto p-3 rounded-xl border border-red-800/40 bg-red-950/30 flex items-start gap-2">
            <AlertTriangle
              size={16}
              className="text-danger mt-0.5 shrink-0"
            />

            <p className="text-sm text-danger">
              {error}
            </p>
          </div>
        )}


        <AssessmentQuestion
          question={
            currentQuestion
          }
          session={
            session
          }
          selectedOption={
            selectedOption
          }
          showEvaluation={
            showEvaluation
          }
          isSubmitting={
            isSubmitting
          }
          evaluation={
            evaluation
          }
          onSelectOption={
            handleSelectOption
          }
          onSubmitAnswer={
            handleSubmitAnswer
          }
          onNextQuestion={
            handleNextQuestion
          }
        />
      </div>
    );
  }


  if (
    loadingQuestion
  ) {

    return (
      <div className="max-w-3xl mx-auto">
        <div className="card-base p-12 text-center">
          <Loader2
            size={32}
            className="animate-spin text-primary mx-auto"
          />

          <h2 className="text-lg font-bold text-foreground mt-4">
            Preparing your adaptive assessment...
          </h2>

          <p className="text-sm text-muted-foreground mt-2">
            StatSkill AI is generating the next question.
          </p>
        </div>
      </div>
    );
  }


  return (
    <div className="space-y-4">

      {error && (
        <div className="max-w-4xl mx-auto p-3 rounded-xl border border-red-800/40 bg-red-950/30 flex items-start gap-2">
          <AlertTriangle
            size={16}
            className="text-danger mt-0.5 shrink-0"
          />

          <p className="text-sm text-danger">
            {error}
          </p>
        </div>
      )}


      <AssessmentSetup
        onStart={
          handleStartAssessment
        }
      />
    </div>
  );
}

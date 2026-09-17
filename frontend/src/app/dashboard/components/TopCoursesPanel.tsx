'use client';

import React from 'react';
import Link from 'next/link';

import {
  BookOpen,
  ChevronRight,
} from 'lucide-react';

import type {
  Course,
  Recommendation,
} from './dashboardTypes';


type Props = {
  courses: Course[];
  recommendations:
    Recommendation[];
};


const difficultyColor:
  Record<string, string> = {

  Beginner:
    'text-success',

  Foundation:
    'text-emerald-400',

  Intermediate:
    'text-primary',

  Advanced:
    'text-warning',

  Expert:
    'text-purple-400',
};


function getPriorityColor(
  priority: string
) {
  const value =
    priority
      ?.toLowerCase();

  if (
    value === 'high'
  ) {
    return 'text-danger';
  }

  if (
    value === 'medium'
  ) {
    return 'text-warning';
  }

  return 'text-muted-foreground';
}


export default function TopCoursesPanel({
  courses,
  recommendations,
}: Props) {
  const activeCourses =
    (
      courses ||
      []
    )
      .filter(
        (course) => {

          const status =
            course.status
              ?.toLowerCase();

          return (
            status !==
              'completed' &&
            Number(
              course.progress
            ) < 100
          );

        }
      )
      .slice(
        0,
        2
      );


  const recommendedCourses =
    (
      recommendations ||
      []
    ).slice(
      0,
      3
    );


  return (
    <div className="card-base p-5 h-full flex flex-col">

      <div className="flex items-center justify-between mb-4">

        <div>

          <h3 className="text-sm font-semibold text-foreground">
            Courses
          </h3>

          <p className="text-xs text-muted-foreground mt-0.5">
            Active & recommended
          </p>

        </div>


        <Link
          href="/courses"
          className="text-xs text-primary hover:text-blue-300 font-medium transition-colors"
        >
          View all
        </Link>

      </div>


      <div className="mb-4">

        <p className="text-2xs text-muted-foreground uppercase tracking-widest font-semibold mb-2">
          In Progress
        </p>


        {activeCourses.length ===
        0 ? (

          <div className="p-3 rounded-lg bg-muted border border-border">

            <p className="text-xs text-muted-foreground">
              No courses currently in progress.
            </p>

          </div>

        ) : (

          <div className="space-y-3">

            {activeCourses.map(
              (course) => {

                const progress =
                  Math.min(
                    100,
                    Math.max(
                      0,
                      Number(
                        course.progress
                      ) || 0
                    )
                  );


                return (
                  <div
                    key={
                      course.course_id
                    }
                    className="p-3 rounded-lg bg-muted border border-border"
                  >

                    <div className="flex items-start gap-2 mb-2">

                      <BookOpen
                        size={13}
                        className="text-primary shrink-0 mt-0.5"
                      />

                      <p className="text-xs font-semibold text-foreground leading-snug">
                        {course.course_name}
                      </p>

                    </div>


                    <div className="flex items-center gap-2 mb-1.5">

                      <div className="flex-1 h-1 bg-navy-600 rounded-full overflow-hidden">

                        <div
                          className="h-full bg-primary rounded-full progress-bar-fill"
                          style={{
                            width:
                              `${progress}%`,
                          }}
                        />

                      </div>


                      <span className="text-2xs text-muted-foreground tabular-nums w-8 text-right">
                        {progress}%
                      </span>

                    </div>


                    <div className="flex items-center justify-between text-2xs text-muted-foreground">

                      <span
                        className={
                          difficultyColor[
                            course.difficulty
                          ] ||
                          'text-muted-foreground'
                        }
                      >
                        {course.difficulty}
                      </span>

                      <span>
                        {course.status ||
                          'In Progress'}
                      </span>

                    </div>

                  </div>
                );
              }
            )}

          </div>

        )}

      </div>


      <div className="flex-1">

        <p className="text-2xs text-muted-foreground uppercase tracking-widest font-semibold mb-2">
          Recommended
        </p>


        {recommendedCourses.length ===
        0 ? (

          <div className="p-3 rounded-lg bg-muted border border-border">

            <p className="text-xs text-muted-foreground">
              No course recommendations right now.
            </p>

            <p className="text-2xs text-muted-foreground mt-1">
              Complete an AI assessment to generate recommendations.
            </p>

          </div>

        ) : (

          <div className="space-y-2">

            {recommendedCourses.map(
              (course) => (

                <Link
                  key={
                    course.course_id
                  }
                  href="/courses"
                  className="flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-muted transition-colors cursor-pointer group"
                >

                  <div className="w-7 h-7 rounded-lg bg-amber-900/30 border border-amber-800/30 flex items-center justify-center shrink-0">

                    <BookOpen
                      size={12}
                      className="text-warning"
                    />

                  </div>


                  <div className="flex-1 min-w-0">

                    <p className="text-xs font-medium text-foreground truncate">
                      {course.course_name}
                    </p>


                    <p className="text-2xs text-muted-foreground mt-0.5">

                      <span
                        className={
                          getPriorityColor(
                            course.priority
                          )
                        }
                      >
                        {course.priority ||
                          'Recommended'}{' '}
                        Priority
                      </span>

                      {' • '}

                      {course.skill_gap ||
                        course.category}

                    </p>


                    <p className="text-2xs text-muted-foreground mt-0.5">

                      Current score:{' '}

                      <span className="text-foreground font-medium">
                        {course.current_score}/100
                      </span>

                    </p>

                  </div>


                  <ChevronRight
                    size={12}
                    className="text-muted-foreground group-hover:text-foreground transition-colors shrink-0"
                  />

                </Link>

              )
            )}

          </div>

        )}

      </div>


      <Link
        href="/courses"
        className="mt-4 flex items-center justify-center gap-2 w-full bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary text-xs font-semibold py-2.5 rounded-lg transition-all duration-150 active:scale-95"
      >

        <BookOpen size={13} />

        Explore All Courses

      </Link>

    </div>
  );
}
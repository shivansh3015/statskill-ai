'use client';

import React from 'react';

import {
  Brain,
  BookOpen,
  TrendingUp,
  CheckCircle2,
  Clock,
} from 'lucide-react';

import type {
  LucideIcon,
} from 'lucide-react';

import type {
  Course,
  ImprovementHistory,
} from './dashboardTypes';


type Props = {
  improvementHistory:
    ImprovementHistory[];

  courses:
    Course[];
};


type ActivityItem = {
  id: string;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  title: string;
  detail: string;
  date: string;
  badge: string;
  badgeVariant: string;
};


function timestamp(
  value: string
) {
  if (!value) {
    return 0;
  }

  const normalized =
    value.includes('T')
      ? value
      : value.replace(' ', 'T');

  const result =
    new Date(
      normalized
    ).getTime();

  return Number.isNaN(result)
    ? 0
    : result;
}


function formatRelativeTime(
  dateString: string
) {
  const time =
    timestamp(
      dateString
    );

  if (!time) {
    return 'Recently';
  }

  const now =
    Date.now();

  const diffMilliseconds =
    Math.max(
      0,
      now - time
    );

  const diffMinutes =
    Math.floor(
      diffMilliseconds /
        60000
    );

  const diffHours =
    Math.floor(
      diffMinutes /
        60
    );

  const diffDays =
    Math.floor(
      diffHours /
        24
    );


  if (diffMinutes < 1) {
    return 'Just now';
  }

  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`;
  }

  if (diffHours < 24) {
    return `${diffHours} hour${
      diffHours === 1
        ? ''
        : 's'
    } ago`;
  }

  if (diffDays < 7) {
    return `${diffDays} day${
      diffDays === 1
        ? ''
        : 's'
    } ago`;
  }


  return new Date(
    time
  ).toLocaleDateString();
}


export default function RecentActivityFeed({
  improvementHistory,
  courses,
}: Props) {
  const historyActivities:
    ActivityItem[] =
    (
      improvementHistory ||
      []
    ).map(
      (history) => {

        const isImprovement =
          Number(
            history.improvement
          ) > 0;

        const isAssessment =
          history.source
            ?.toLowerCase()
            .includes(
              'assessment'
            );


        if (isAssessment) {
          return {
            id:
              `history-${history.id}`,

            icon:
              Brain,

            iconColor:
              'text-primary',

            iconBg:
              'bg-blue-900/40',

            title:
              `AI Assessment — ${history.skill_name}`,

            detail:
              `Score: ${history.new_score}/100 — ${history.new_level}`,

            date:
              history.created_at,

            badge:
              'Assessment',

            badgeVariant:
              'badge-info',
          };
        }


        if (isImprovement) {
          return {
            id:
              `history-${history.id}`,

            icon:
              TrendingUp,

            iconColor:
              'text-success',

            iconBg:
              'bg-emerald-900/40',

            title:
              `Competency improved: ${history.skill_name}`,

            detail:
              `${history.previous_score} → ${history.new_score} (+${history.improvement} pts)`,

            date:
              history.created_at,

            badge:
              'Improvement',

            badgeVariant:
              'badge-success',
          };
        }


        return {
          id:
            `history-${history.id}`,

          icon:
            Brain,

          iconColor:
            'text-primary',

          iconBg:
            'bg-blue-900/40',

          title:
            `Competency updated: ${history.skill_name}`,

          detail:
            `${history.previous_score} → ${history.new_score}`,

          date:
            history.created_at,

          badge:
            'Update',

          badgeVariant:
            'badge-muted',
        };

      }
    );


  const courseActivities:
    ActivityItem[] =
    (
      courses ||
      []
    ).map(
      (course) => {

        const completed =
          course.status
            ?.toLowerCase() ===
            'completed' ||
          Number(
            course.progress
          ) >= 100;


        if (completed) {
          return {
            id:
              `course-${course.course_id}`,

            icon:
              CheckCircle2,

            iconColor:
              'text-success',

            iconBg:
              'bg-emerald-900/40',

            title:
              `Course completed — ${course.course_name}`,

            detail:
              `${course.category} • ${course.difficulty}`,

            date:
              course.completed_at ||
              course.enrolled_at,

            badge:
              'Completed',

            badgeVariant:
              'badge-success',
          };
        }


        return {
          id:
            `course-${course.course_id}`,

          icon:
            BookOpen,

          iconColor:
            'text-accent',

          iconBg:
            'bg-cyan-900/40',

          title:
            `Course in progress — ${course.course_name}`,

          detail:
            `${course.progress}% completed • ${course.difficulty}`,

          date:
            course.enrolled_at,

          badge:
            'Course',

          badgeVariant:
            'badge-muted',
        };

      }
    );


  const activities =
    [
      ...historyActivities,
      ...courseActivities,
    ]
      .sort(
        (a, b) =>
          timestamp(
            b.date
          ) -
          timestamp(
            a.date
          )
      )
      .slice(
        0,
        7
      );


  return (
    <div className="card-base p-5 h-full">

      <div className="flex items-center justify-between mb-4">

        <div>

          <h3 className="text-sm font-semibold text-foreground">
            Recent Activity
          </h3>

          <p className="text-xs text-muted-foreground mt-0.5">
            Your learning and assessment history
          </p>

        </div>


        <div className="flex items-center gap-1.5">

          <div className="w-1.5 h-1.5 rounded-full bg-success pulse-dot" />

          <span className="text-xs text-muted-foreground">
            Live
          </span>

        </div>

      </div>


      {activities.length === 0 ? (

        <div className="py-10 text-center">

          <Brain
            size={24}
            className="text-muted-foreground mx-auto mb-2"
          />

          <p className="text-sm text-muted-foreground">
            No activity yet.
          </p>

          <p className="text-xs text-muted-foreground mt-1">
            Complete an AI assessment or enroll in a course.
          </p>

        </div>

      ) : (

        <ul className="space-y-3">

          {activities.map(
            (activity) => {

              const ActivityIcon =
                activity.icon;


              return (
                <li
                  key={
                    activity.id
                  }
                  className="flex items-start gap-3 group"
                >

                  <div
                    className={`w-8 h-8 rounded-lg ${activity.iconBg} flex items-center justify-center shrink-0 mt-0.5`}
                  >

                    <ActivityIcon
                      size={14}
                      className={
                        activity.iconColor
                      }
                    />

                  </div>


                  <div className="flex-1 min-w-0">

                    <div className="flex items-start justify-between gap-2">

                      <p className="text-xs font-semibold text-foreground leading-snug">
                        {activity.title}
                      </p>

                      <span
                        className={`${activity.badgeVariant} shrink-0`}
                      >
                        {activity.badge}
                      </span>

                    </div>


                    <p className="text-xs text-muted-foreground mt-0.5">
                      {activity.detail}
                    </p>

                  </div>


                  <div className="flex items-center gap-1 shrink-0 mt-0.5">

                    <Clock
                      size={10}
                      className="text-muted-foreground/60"
                    />

                    <span className="text-2xs text-muted-foreground/60 whitespace-nowrap">
                      {formatRelativeTime(
                        activity.date
                      )}
                    </span>

                  </div>

                </li>
              );
            }
          )}

        </ul>

      )}

    </div>
  );
}
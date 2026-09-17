'use client';

import React, { useEffect, useState } from 'react';

import {
  Brain,
  BookOpen,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from 'lucide-react';

import type { LucideIcon } from 'lucide-react';

import { apiGet } from '@/lib/api';
import { getCurrentUserId } from '@/lib/auth';


type ImprovementHistory = {
  id: number;
  skill_name: string;
  previous_score: number;
  new_score: number;
  improvement: number;
  improvement_percentage: number;
  previous_level: string;
  new_level: string;
  source: string;
  created_at: string;
};


type Course = {
  course_id: number;
  course_name: string;
  category: string;
  difficulty: string;
  progress: number;
  status: string;
  enrolled_at: string;
};


type DashboardResponse = {
  improvement_history: ImprovementHistory[];
  courses: Course[];
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


function formatRelativeTime(dateString: string) {
  if (!dateString) {
    return 'Recently';
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return 'Recently';
  }

  const now = new Date();

  const diffMilliseconds =
    now.getTime() - date.getTime();

  const diffMinutes = Math.floor(
    diffMilliseconds / 60000
  );

  const diffHours = Math.floor(
    diffMinutes / 60
  );

  const diffDays = Math.floor(
    diffHours / 24
  );


  if (diffMinutes < 1) {
    return 'Just now';
  }

  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`;
  }

  if (diffHours < 24) {
    return `${diffHours} hour${
      diffHours === 1 ? '' : 's'
    } ago`;
  }

  if (diffDays < 7) {
    return `${diffDays} day${
      diffDays === 1 ? '' : 's'
    } ago`;
  }

  return date.toLocaleDateString();
}


export default function RecentActivityFeed() {
  const [activities, setActivities] =
    useState<ActivityItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');


  useEffect(() => {
    async function loadActivities() {
      const userId =
        getCurrentUserId();

      if (!userId) {
        setActivities([]);
        setError(
          'Please sign in to view recent activity.'
        );
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');


        const data =
          await apiGet<DashboardResponse>(
            `/dashboard/${userId}/full`
          );


        const historyActivities: ActivityItem[] =
          (data.improvement_history || []).map(
            (history) => {

              const isImprovement =
                history.improvement > 0;

              const isAssessment =
                history.source
                  ?.toLowerCase()
                  .includes('assessment');


              if (isAssessment) {
                return {
                  id: `history-${history.id}`,
                  icon: Brain,
                  iconColor: 'text-primary',
                  iconBg: 'bg-blue-900/40',

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
                  id: `history-${history.id}`,
                  icon: TrendingUp,
                  iconColor: 'text-success',
                  iconBg:
                    'bg-emerald-900/40',

                  title:
                    `Competency improved: ${history.skill_name}`,

                  detail:
                    `${history.previous_score} â†’ ${history.new_score} (+${history.improvement} pts)`,

                  date:
                    history.created_at,

                  badge:
                    'Improvement',

                  badgeVariant:
                    'badge-success',
                };
              }


              return {
                id: `history-${history.id}`,

                icon: Brain,

                iconColor:
                  'text-primary',

                iconBg:
                  'bg-blue-900/40',

                title:
                  `Competency updated: ${history.skill_name}`,

                detail:
                  `${history.previous_score} â†’ ${history.new_score}`,

                date:
                  history.created_at,

                badge:
                  'Update',

                badgeVariant:
                  'badge-muted',
              };
            }
          );


        const courseActivities: ActivityItem[] =
          (data.courses || []).map(
            (course) => {

              const completed =
                course.status
                  ?.toLowerCase() ===
                  'completed' ||
                course.progress >= 100;


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
                    `Course completed â€” ${course.course_name}`,

                  detail:
                    `${course.category} â€¢ ${course.difficulty}`,

                  date:
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
                  `Course in progress â€” ${course.course_name}`,

                detail:
                  `${course.progress}% completed â€¢ ${course.difficulty}`,

                date:
                  course.enrolled_at,

                badge:
                  'Course',

                badgeVariant:
                  'badge-muted',
              };
            }
          );


        const combinedActivities = [
          ...historyActivities,
          ...courseActivities,
        ];


        combinedActivities.sort(
          (a, b) =>
            new Date(b.date).getTime() -
            new Date(a.date).getTime()
        );


        setActivities(
          combinedActivities.slice(0, 7)
        );

      } catch (err) {

        console.error(
          'Recent activity error:',
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load recent activity.'
        );

      } finally {
        setLoading(false);
      }
    }


    loadActivities();

  }, []);


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


      {loading && (

        <div className="py-10 text-center">

          <p className="text-sm text-muted-foreground">
            Loading recent activity...
          </p>

        </div>

      )}


      {!loading && error && (

        <div className="py-8 text-center">

          <AlertTriangle
            size={22}
            className="text-red-400 mx-auto mb-2"
          />

          <p className="text-sm text-red-400 font-medium">
            Unable to load recent activity
          </p>

          <p className="text-xs text-muted-foreground mt-1">
            {error}
          </p>

        </div>

      )}


      {!loading &&
        !error &&
        activities.length === 0 && (

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

        )}


      {!loading &&
        !error &&
        activities.length > 0 && (

          <ul className="space-y-3">

            {activities.map(
              (activity) => {

                const ActivityIcon =
                  activity.icon;

                return (

                  <li
                    key={activity.id}
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


'use client';

import React from 'react';

import RecentActivityFeed from './RecentActivityFeed';
import TopCoursesPanel from './TopCoursesPanel';

import type {
  Course,
  ImprovementHistory,
  Recommendation,
} from './dashboardTypes';


type Props = {
  improvementHistory:
    ImprovementHistory[];

  courses:
    Course[];

  recommendations:
    Recommendation[];
};


export default function DashboardBottomRow({
  improvementHistory,
  courses,
  recommendations,
}: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-4">

      <div className="lg:col-span-2">

        <RecentActivityFeed
          improvementHistory={
            improvementHistory
          }
          courses={
            courses
          }
        />

      </div>


      <div>

        <TopCoursesPanel
          courses={courses}
          recommendations={
            recommendations
          }
        />

      </div>

    </div>
  );
}
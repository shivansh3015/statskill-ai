'use client';

import React from 'react';

import CompetencyRadarChart from './CompetencyRadarChart';
import SkillDistributionChart from './SkillDistributionChart';

import type {
  Competency,
} from './dashboardTypes';


type Props = {
  competencies: Competency[];
};


export default function DashboardChartsRow({
  competencies,
}: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-4">

      <CompetencyRadarChart
        competencies={competencies}
      />

      <SkillDistributionChart
        competencies={competencies}
      />

    </div>
  );
}
'use client';

import React from 'react';
import dynamic from 'next/dynamic';

import type {
  Competency,
} from './dashboardTypes';


const SkillDistributionChartInner =
  dynamic(
    () =>
      import(
        './SkillDistributionChartInner'
      ),
    {
      ssr: false,
    }
  );


type Props = {
  competencies: Competency[];
};


export default function SkillDistributionChart({
  competencies,
}: Props) {
  return (
    <div className="card-base p-5">

      <div className="flex items-center justify-between mb-4">

        <div>

          <h3 className="text-sm font-semibold text-foreground">
            Skill Level Distribution
          </h3>

          <p className="text-xs text-muted-foreground mt-0.5">
            Distribution of your current competency levels
          </p>

        </div>


        <span className="badge-muted">
          {competencies.length} Skills
        </span>

      </div>


      <SkillDistributionChartInner
        competencies={competencies}
      />

    </div>
  );
}
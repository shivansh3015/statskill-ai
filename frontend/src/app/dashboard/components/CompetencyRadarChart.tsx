'use client';

import React from 'react';
import dynamic from 'next/dynamic';

import type {
  Competency,
} from './dashboardTypes';


const RadarChartInner =
  dynamic(
    () =>
      import(
        './CompetencyRadarChartInner'
      ),
    {
      ssr: false,
    }
  );


type Props = {
  competencies: Competency[];
};


export default function CompetencyRadarChart({
  competencies,
}: Props) {
  return (
    <div className="card-base p-5">

      <div className="flex items-center justify-between mb-4">

        <div>

          <h3 className="text-sm font-semibold text-foreground">
            Competency Radar
          </h3>

          <p className="text-xs text-muted-foreground mt-0.5">
            Current competency scores across your assessed skills
          </p>

        </div>


        <span className="badge-info">
          Live
        </span>

      </div>


      <RadarChartInner
        competencies={competencies}
      />

    </div>
  );
}
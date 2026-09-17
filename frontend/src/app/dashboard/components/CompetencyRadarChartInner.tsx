'use client';

import React from 'react';

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

import type {
  Competency,
} from './dashboardTypes';


type Props = {
  competencies: Competency[];
};


type RadarItem = {
  skill: string;
  score: number;
  level: string;
};


function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{
    payload?: RadarItem;
    value?: number;
  }>;
}) {
  if (
    !active ||
    !payload?.length ||
    !payload[0]?.payload
  ) {
    return null;
  }

  const item =
    payload[0].payload;

  return (
    <div className="bg-navy-700 border border-border rounded-xl p-3 card-shadow text-xs">

      <p className="font-semibold text-foreground">
        {item.skill}
      </p>

      <p className="text-muted-foreground mt-1">
        Score:{' '}

        <span className="font-semibold text-foreground">
          {item.score}/100
        </span>
      </p>

      <p className="text-muted-foreground mt-1">
        Level:{' '}

        <span className="font-semibold text-primary">
          {item.level}
        </span>
      </p>

    </div>
  );
}


export default function CompetencyRadarChartInner({
  competencies,
}: Props) {
  const radarData:
    RadarItem[] =
    (competencies || []).map(
      (competency) => ({
        skill:
          competency.skill_name,

        score:
          Math.max(
            0,
            Math.min(
              100,
              Number(
                competency.score
              ) || 0
            )
          ),

        level:
          competency.level ||
          'Not Assessed',
      })
    );


  if (
    radarData.length === 0
  ) {
    return (
      <div className="h-[280px] flex items-center justify-center">

        <div className="text-center">

          <p className="text-sm text-muted-foreground">
            No competency data available.
          </p>

          <p className="text-xs text-muted-foreground mt-1">
            Complete an AI assessment first.
          </p>

        </div>

      </div>
    );
  }


  return (
    <ResponsiveContainer
      width="100%"
      height={280}
    >

      <RadarChart
        data={radarData}
        margin={{
          top: 15,
          right: 25,
          bottom: 15,
          left: 25,
        }}
      >

        <PolarGrid
          stroke="var(--border)"
        />

        <PolarAngleAxis
          dataKey="skill"
          tick={{
            fill:
              'var(--muted-foreground)',
            fontSize: 10,
            fontFamily:
              'var(--font-sans)',
          }}
        />

        <PolarRadiusAxis
          domain={[0, 100]}
          tickCount={6}
          tick={{
            fill:
              'var(--muted-foreground)',
            fontSize: 9,
          }}
          axisLine={false}
        />

        <Radar
          name="Competency Score"
          dataKey="score"
          stroke="var(--primary)"
          fill="var(--primary)"
          fillOpacity={0.25}
          strokeWidth={2}
        />

        <Tooltip
          content={
            <CustomTooltip />
          }
        />

      </RadarChart>

    </ResponsiveContainer>
  );
}
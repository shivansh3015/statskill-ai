'use client';

import React from 'react';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

import type {
  Competency,
} from './dashboardTypes';


type Props = {
  competencies: Competency[];
};


type DistributionItem = {
  level: string;
  count: number;
};


const LEVELS = [
  'Beginner',
  'Foundation',
  'Intermediate',
  'Advanced',
  'Expert',
];


function levelColor(
  level: string
) {
  const colors:
    Record<string, string> = {

    Beginner:
      '#ef4444',

    Foundation:
      '#10b981',

    Intermediate:
      '#06b6d4',

    Advanced:
      '#3b82f6',

    Expert:
      '#8b5cf6',
  };

  return (
    colors[level] ||
    '#64748b'
  );
}


function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{
    value?: number;
  }>;
  label?: string;
}) {
  if (
    !active ||
    !payload?.length
  ) {
    return null;
  }

  const count =
    Number(
      payload[0]?.value
    ) || 0;

  return (
    <div className="bg-navy-700 border border-border rounded-xl p-3 card-shadow text-xs">

      <p className="font-semibold text-foreground">
        {label}
      </p>

      <p className="text-muted-foreground mt-1">
        Skills:{' '}

        <span className="font-semibold text-foreground">
          {count}
        </span>
      </p>

    </div>
  );
}


export default function SkillDistributionChartInner({
  competencies,
}: Props) {
  const distributionData:
    DistributionItem[] =
    LEVELS.map(
      (level) => ({
        level,

        count:
          (competencies || []).filter(
            (competency) =>
              competency.level ===
              level
          ).length,
      })
    );


  const totalSkills =
    distributionData.reduce(
      (
        total,
        item
      ) =>
        total +
        item.count,
      0
    );


  if (
    totalSkills === 0
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


  const maxCount =
    Math.max(
      1,
      ...distributionData.map(
        (item) =>
          item.count
      )
    );


  return (
    <ResponsiveContainer
      width="100%"
      height={280}
    >

      <BarChart
        data={distributionData}
        margin={{
          top: 10,
          right: 15,
          bottom: 20,
          left: 0,
        }}
      >

        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--border)"
          vertical={false}
        />

        <XAxis
          dataKey="level"
          tick={{
            fill:
              'var(--muted-foreground)',
            fontSize: 10,
            fontFamily:
              'var(--font-sans)',
          }}
          tickLine={false}
          axisLine={false}
          interval={0}
        />

        <YAxis
          allowDecimals={false}
          domain={[
            0,
            maxCount + 1,
          ]}
          tick={{
            fill:
              'var(--muted-foreground)',
            fontSize: 10,
            fontFamily:
              'var(--font-sans)',
          }}
          tickLine={false}
          axisLine={false}
          width={28}
        />

        <Tooltip
          content={
            <CustomTooltip />
          }
          cursor={{
            fill:
              'rgba(255,255,255,0.04)',
          }}
        />

        <Bar
          dataKey="count"
          radius={[
            5,
            5,
            0,
            0,
          ]}
          maxBarSize={48}
        >

          {distributionData.map(
            (entry) => (

              <Cell
                key={
                  entry.level
                }
                fill={
                  levelColor(
                    entry.level
                  )
                }
              />

            )
          )}

        </Bar>

      </BarChart>

    </ResponsiveContainer>
  );
}
'use client';

import React, { useEffect, useState } from 'react';

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';

import { apiGet } from '@/lib/api';
import { getCurrentUserId } from '@/lib/auth';


type Competency = {
  skill_name: string;
  score: number;
  level: string;
};


type DashboardResponse = {
  competencies: Competency[];
};


type RadarItem = {
  domain: string;
  current: number;
  target: number;
};


const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: {
    name: string;
    value: number;
    color: string;
  }[];
  label?: string;
}) => {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="bg-navy-700 border border-border rounded-xl p-3 card-shadow text-xs">

      <p className="font-semibold text-foreground mb-2">
        {label}
      </p>

      {payload.map((entry, i) => (
        <div
          key={`radar-tooltip-${i}`}
          className="flex items-center gap-2"
        >
          <span
            className="w-2 h-2 rounded-full"
            style={{
              background: entry.color,
            }}
          />

          <span className="text-muted-foreground">
            {entry.name}:
          </span>

          <span className="font-semibold text-foreground tabular-nums">
            {entry.value}
          </span>
        </div>
      ))}

    </div>
  );
};


export default function CompetencyRadarChartInner() {
  const [radarData, setRadarData] =
    useState<RadarItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');


  useEffect(() => {
    async function loadCompetencies() {
      const userId =
        getCurrentUserId();

      if (!userId) {
        setRadarData([]);
        setError(
          'Please sign in to view competency data.'
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


        const chartData: RadarItem[] =
          (data.competencies || []).map(
            (competency) => {

              const currentScore =
                Number(competency.score) || 0;

              return {
                domain:
                  competency.skill_name,

                current:
                  currentScore,

                /*
                  Temporary target:
                  minimum target = 80.

                  If employee already scores
                  above 80, target does not
                  become lower than their
                  current score.
                */
                target:
                  Math.max(
                    80,
                    currentScore
                  ),
              };
            }
          );


        setRadarData(chartData);

      } catch (err) {
        console.error(
          'Radar chart error:',
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load competency data.'
        );

      } finally {
        setLoading(false);
      }
    }


    loadCompetencies();

  }, []);


  if (loading) {
    return (
      <div className="h-[280px] flex items-center justify-center">

        <p className="text-sm text-muted-foreground">
          Loading competency chart...
        </p>

      </div>
    );
  }


  if (error) {
    return (
      <div className="h-[280px] flex items-center justify-center">

        <div className="text-center">

          <p className="text-sm text-red-400 font-medium">
            Unable to load competency chart
          </p>

          <p className="text-xs text-muted-foreground mt-1">
            {error}
          </p>

        </div>

      </div>
    );
  }


  if (radarData.length === 0) {
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
          top: 10,
          right: 20,
          bottom: 10,
          left: 20,
        }}
      >

        <PolarGrid
          stroke="var(--border)"
        />

        <PolarAngleAxis
          dataKey="domain"
          tick={{
            fill:
              'var(--muted-foreground)',
            fontSize: 10,
            fontFamily:
              'var(--font-sans)',
          }}
        />


        <Radar
          name="Current"
          dataKey="current"
          stroke="var(--primary)"
          fill="var(--primary)"
          fillOpacity={0.2}
          strokeWidth={2}
        />


        <Radar
          name="Target"
          dataKey="target"
          stroke="var(--accent)"
          fill="var(--accent)"
          fillOpacity={0.08}
          strokeWidth={1.5}
          strokeDasharray="4 4"
        />


        <Tooltip
          content={<CustomTooltip />}
        />


        <Legend
          wrapperStyle={{
            fontSize: '11px',
            fontFamily:
              'var(--font-sans)',
            color:
              'var(--muted-foreground)',
          }}
        />

      </RadarChart>

    </ResponsiveContainer>
  );
}

'use client';

import React, { useEffect, useState } from 'react';

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


type DistributionItem = {
  name: string;
  score: number;
  level: string;
};


const barColor = (score: number) => {
  if (score >= 80) return '#8b5cf6';
  if (score >= 65) return '#3b82f6';
  if (score >= 50) return '#06b6d4';
  if (score >= 35) return '#10b981';

  return '#ef4444';
};


export default function SkillDistributionChartInner() {
  const [distributionData, setDistributionData] =
    useState<DistributionItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');


  useEffect(() => {
    async function loadSkillDistribution() {
      const userId =
        getCurrentUserId();

      if (!userId) {
        setDistributionData([]);
        setError(
          'Please sign in to view skill distribution.'
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


        const chartData: DistributionItem[] =
          (data.competencies || []).map(
            (competency) => ({
              name: competency.skill_name,
              score:
                Number(competency.score) || 0,
              level:
                competency.level ||
                'Not Assessed',
            })
          );


        setDistributionData(chartData);

      } catch (err) {
        console.error(
          'Skill distribution error:',
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load skill distribution.'
        );

      } finally {
        setLoading(false);
      }
    }


    loadSkillDistribution();

  }, []);


  if (loading) {
    return (
      <div className="h-[280px] flex items-center justify-center">

        <p className="text-sm text-muted-foreground">
          Loading skill distribution...
        </p>

      </div>
    );
  }


  if (error) {
    return (
      <div className="h-[280px] flex items-center justify-center">

        <div className="text-center">

          <p className="text-sm text-red-400 font-medium">
            Unable to load skill distribution
          </p>

          <p className="text-xs text-muted-foreground mt-1">
            {error}
          </p>

        </div>

      </div>
    );
  }


  if (distributionData.length === 0) {
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


  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: {
      value: number;
    }[];
    label?: string;
  }) => {

    if (!active || !payload?.length) {
      return null;
    }


    const score =
      payload[0]?.value ?? 0;


    const entry =
      distributionData.find(
        (item) => item.name === label
      );


    return (
      <div className="bg-navy-700 border border-border rounded-xl p-3 card-shadow text-xs">

        <p className="font-semibold text-foreground mb-1">
          {label}
        </p>

        <p className="text-muted-foreground">
          Score:{' '}

          <span className="text-foreground font-semibold tabular-nums">
            {score}/100
          </span>
        </p>


        {entry && (

          <p className="text-muted-foreground mt-0.5">
            Level:{' '}

            <span className="text-foreground font-semibold">
              {entry.level}
            </span>
          </p>

        )}

      </div>
    );
  };


  return (
    <ResponsiveContainer
      width="100%"
      height={280}
    >

      <BarChart
        data={distributionData}
        margin={{
          top: 5,
          right: 10,
          bottom: 40,
          left: 0,
        }}
      >

        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--border)"
          vertical={false}
        />


        <XAxis
          dataKey="name"
          tick={{
            fill:
              'var(--muted-foreground)',
            fontSize: 9,
            fontFamily:
              'var(--font-sans)',
          }}
          angle={-35}
          textAnchor="end"
          interval={0}
          tickLine={false}
          axisLine={false}
        />


        <YAxis
          domain={[0, 100]}
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
          content={<CustomTooltip />}
          cursor={{
            fill:
              'rgba(255,255,255,0.04)',
          }}
        />


        <Bar
          dataKey="score"
          radius={[4, 4, 0, 0]}
          maxBarSize={32}
        >

          {distributionData.map(
            (entry, index) => (

              <Cell
                key={`cell-skill-${index}`}
                fill={barColor(
                  entry.score
                )}
              />

            )
          )}

        </Bar>

      </BarChart>

    </ResponsiveContainer>
  );
}

'use client';

import React, {
  useEffect,
  useState,
} from 'react';

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';

import {
  AlertTriangle,
  Target,
} from 'lucide-react';

import { apiGet } from '@/lib/api';
import { getCurrentUserId } from '@/lib/auth';


type Competency = {
  skill_name: string;
  score: number;
  level: string;
};


type DashboardResponse = {
  competencies?: Competency[];
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
  payload?: Array<{
    name?: string;
    value?: number;
    color?: string;
  }>;
  label?: string;
}) => {
  if (
    !active ||
    !Array.isArray(payload) ||
    payload.length === 0
  ) {
    return null;
  }

  return (
    <div className="bg-navy-700 border border-border rounded-xl p-3 card-shadow text-xs">
      <p className="font-semibold text-foreground mb-2">
        {label || 'Competency'}
      </p>

      {payload.map((entry, i) => (
        <div
          key={`radar-tooltip-${i}`}
          className="flex items-center gap-2"
        >
          <span
            className="w-2 h-2 rounded-full"
            style={{
              background:
                entry.color ||
                'var(--primary)',
            }}
          />

          <span className="text-muted-foreground">
            {entry.name || 'Score'}:
          </span>

          <span className="font-semibold text-foreground tabular-nums">
            {Number(entry.value) || 0}
          </span>
        </div>
      ))}
    </div>
  );
};


export default function CompetencyRadarChartInner() {
  const [
    radarData,
    setRadarData,
  ] = useState<RadarItem[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState('');


  useEffect(() => {
    let cancelled = false;

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

        if (cancelled) {
          return;
        }

        const competencies =
          Array.isArray(data.competencies)
            ? data.competencies
            : [];

        const chartData: RadarItem[] =
          competencies
            .filter(
              (competency) =>
                competency &&
                typeof competency.skill_name ===
                  'string' &&
                competency.skill_name.trim()
                  .length > 0
            )
            .map((competency) => {
              const currentScore =
                Math.min(
                  100,
                  Math.max(
                    0,
                    Number(
                      competency.score
                    ) || 0
                  )
                );

              return {
                domain:
                  competency.skill_name.trim(),

                current:
                  currentScore,

                target:
                  Math.max(
                    80,
                    currentScore
                  ),
              };
            });

        setRadarData(chartData);
      } catch (err) {
        if (cancelled) {
          return;
        }

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
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadCompetencies();

    return () => {
      cancelled = true;
    };
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
        <div className="text-center px-5">
          <AlertTriangle
            size={22}
            className="text-red-400 mx-auto mb-2"
          />

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
        <div className="text-center px-5">
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


  /*
    A radar/polar chart needs several axes to form a
    meaningful polygon. A brand-new employee may have
    only one or two assessed skills. Recharts can behave
    badly with that geometry in production, so for fewer
    than three competencies we show the same information
    as safe score bars instead of mounting RadarChart.
  */
  if (radarData.length < 3) {
    return (
      <div className="h-[280px] flex flex-col justify-center px-5">
        <div className="flex items-center gap-2 mb-5">
          <Target
            size={16}
            className="text-primary"
          />

          <p className="text-sm font-semibold text-foreground">
            Competency Profile
          </p>
        </div>

        <div className="space-y-5">
          {radarData.map((item) => (
            <div
              key={item.domain}
              className="space-y-2"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {item.domain}
                  </p>

                  <p className="text-2xs text-muted-foreground">
                    Target {item.target}/100
                  </p>
                </div>

                <span className="text-sm font-bold text-primary tabular-nums">
                  {item.current}/100
                </span>
              </div>

              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{
                    width: `${item.current}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <p className="text-2xs text-muted-foreground mt-5">
          Assess at least 3 skills to unlock the radar comparison view.
        </p>
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

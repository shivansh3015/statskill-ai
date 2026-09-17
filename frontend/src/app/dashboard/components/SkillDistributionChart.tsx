'use client';

import React, {
  useEffect,
  useState,
} from 'react';

import dynamic from 'next/dynamic';

import { apiGet } from '@/lib/api';
import { getCurrentUserId } from '@/lib/auth';


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


type DashboardResponse = {
  competencies?: Array<{
    skill_name: string;
    score: number;
    level: string;
  }>;
};


export default function SkillDistributionChart() {
  const [
    skillCount,
    setSkillCount,
  ] = useState(0);


  useEffect(() => {
    let cancelled = false;

    async function loadSkillCount() {
      const userId =
        getCurrentUserId();

      if (!userId) {
        if (!cancelled) {
          setSkillCount(0);
        }

        return;
      }

      try {
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

        setSkillCount(
          competencies.length
        );
      } catch (error) {
        console.error(
          'Skill count loading error:',
          error
        );

        if (!cancelled) {
          setSkillCount(0);
        }
      }
    }

    loadSkillCount();

    return () => {
      cancelled = true;
    };
  }, []);


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
          {skillCount} Skill{skillCount === 1 ? '' : 's'}
        </span>

      </div>


      <SkillDistributionChartInner />

    </div>
  );
}

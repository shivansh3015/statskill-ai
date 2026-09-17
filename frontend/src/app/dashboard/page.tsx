'use client';

import React, {
  useEffect,
  useState,
} from 'react';

import {
  AlertTriangle,
} from 'lucide-react';

import AppLayout from '@/components/AppLayout';
import { apiGet } from '@/lib/api';

import DashboardBentoGrid from './components/DashboardBentoGrid';
import DashboardChartsRow from './components/DashboardChartsRow';
import DashboardBottomRow from './components/DashboardBottomRow';

import type {
  DashboardResponse,
} from './components/dashboardTypes';


const USER_ID = 1;


export default function DashboardPage() {
  const [
    dashboard,
    setDashboard,
  ] = useState<DashboardResponse | null>(
    null
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState('');


  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setError('');

        const data =
          await apiGet<DashboardResponse>(
            `/dashboard/${USER_ID}/full`
          );

        setDashboard(data);
      } catch (err) {
        console.error(
          'Dashboard error:',
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load dashboard.'
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);


  const profileParts =
    dashboard
      ? [
          dashboard.user.role,
          dashboard.user.department,
        ].filter(Boolean)
      : [];


  const subtitle =
    profileParts.length > 0
      ? profileParts.join(' — ')
      : loading
        ? 'Loading employee profile...'
        : 'Employee competency overview';


  return (
    <AppLayout
      pageTitle="Competency Dashboard"
      pageSubtitle={subtitle}
    >
      {loading && (
        <div className="space-y-6">

          <div className="card-base p-8">
            <div className="animate-pulse space-y-4">

              <div className="h-5 w-52 rounded bg-muted" />

              <div className="h-12 w-32 rounded bg-muted" />

              <div className="h-4 w-full rounded bg-muted" />

              <div className="h-4 w-3/4 rounded bg-muted" />

            </div>

            <p className="text-sm text-muted-foreground mt-5">
              Loading your competency dashboard...
            </p>
          </div>

        </div>
      )}


      {!loading && error && (
        <div className="rounded-xl border border-red-800/40 bg-red-950/30 p-6">

          <div className="flex items-center gap-2 text-red-400">

            <AlertTriangle size={20} />

            <p className="font-semibold">
              Dashboard could not be loaded
            </p>

          </div>

          <p className="text-sm text-muted-foreground mt-3">
            {error}
          </p>

          <p className="text-xs text-muted-foreground mt-2">
            Make sure the FastAPI backend is running on port 8000.
          </p>

        </div>
      )}


      {!loading &&
        !error &&
        dashboard && (

          <div className="space-y-6">

            <DashboardBentoGrid
              dashboard={dashboard}
            />

            <DashboardChartsRow
              competencies={
                dashboard.competencies
              }
            />

            <DashboardBottomRow
              improvementHistory={
                dashboard.improvement_history
              }
              courses={
                dashboard.courses
              }
              recommendations={
                dashboard.recommendations
              }
            />

          </div>

        )}
    </AppLayout>
  );
}
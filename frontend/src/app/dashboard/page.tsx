'use client';

import React, {
  useEffect,
  useState,
} from 'react';

import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import AppLayout from '@/components/AppLayout';

import DashboardBentoGrid from './components/DashboardBentoGrid';
import DashboardChartsRow from './components/DashboardChartsRow';
import DashboardBottomRow from './components/DashboardBottomRow';

import { apiGet } from '@/lib/api';
import { getCurrentUserId } from '@/lib/auth';


interface DashboardUser {
  id: number;
  name: string;
  email: string;
  role: string | null;
  department: string | null;
}


interface DashboardResponse {
  user: DashboardUser;
}


export default function DashboardPage() {
  const router = useRouter();

  const [
    user,
    setUser,
  ] = useState<DashboardUser | null>(
    null
  );

  const [
    ready,
    setReady,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState('');


  useEffect(() => {
    let cancelled = false;

    async function initializeDashboard() {
      const userId =
        getCurrentUserId();

      if (!userId) {
        router.replace('/');
        return;
      }

      try {
        setError('');

        const response =
          await apiGet<DashboardResponse>(
            `/dashboard/${userId}/full`
          );

        if (cancelled) {
          return;
        }

        setUser(response.user);
        setReady(true);
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error(
          'Unable to load dashboard user:',
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load your profile.'
        );
      }
    }

    initializeDashboard();

    return () => {
      cancelled = true;
    };
  }, [router]);


  const subtitle =
    user
      ? `${user.role || 'Employee'} — ${
          user.department || 'General'
        }`
      : 'Loading your profile...';


  if (!ready) {
    return (
      <AppLayout
        pageTitle="Competency Dashboard"
        pageSubtitle={
          error
            ? 'Unable to load profile'
            : subtitle
        }
      >
        <div className="rounded-xl border border-border bg-card p-8">
          {error ? (
            <div className="rounded-xl border border-red-800/40 bg-red-950/30 p-4 text-sm text-red-300">
              {error}
            </div>
          ) : (
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading your competency dashboard...
            </div>
          )}
        </div>
      </AppLayout>
    );
  }


  return (
    <AppLayout
      pageTitle="Competency Dashboard"
      pageSubtitle={subtitle}
    >
      <div className="space-y-6">
        <DashboardBentoGrid />

        <DashboardChartsRow />

        <DashboardBottomRow />
      </div>
    </AppLayout>
  );
}

'use client';

import React, {
  useEffect,
  useState,
} from 'react';

import {
  useRouter,
} from 'next/navigation';

import AppLayout from '@/components/AppLayout';
import { useTheme } from '@/context/ThemeContext';

import {
  User,
  Bell,
  Brain,
  Palette,
  Sun,
  Moon,
  Monitor,
  Shield,
  Save,
  ChevronRight,
  LogOut,
  Mail,
  BriefcaseBusiness,
  Building2,
} from 'lucide-react';

import {
  clearCurrentUser,
  getCurrentUser,
  type AuthUser,
} from '@/lib/auth';


interface SettingsSection {
  id: string;
  label: string;
  icon: React.ElementType;
}


const sections: SettingsSection[] = [
  {
    id: 'account',
    label: 'Account',
    icon: User,
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
  },
  {
    id: 'assessment',
    label: 'Assessment Preferences',
    icon: Brain,
  },
  {
    id: 'appearance',
    label: 'Appearance',
    icon: Palette,
  },
  {
    id: 'privacy',
    label: 'Privacy & Security',
    icon: Shield,
  },
];


export default function SettingsPage() {
  const router =
    useRouter();

  const {
    theme,
    setTheme,
  } = useTheme();

  const [
    user,
    setUser,
  ] =
    useState<AuthUser | null>(null);

  const [
    activeSection,
    setActiveSection,
  ] =
    useState('account');

  const [
    notifEmail,
    setNotifEmail,
  ] =
    useState(true);

  const [
    notifAssessment,
    setNotifAssessment,
  ] =
    useState(true);

  const [
    notifCourse,
    setNotifCourse,
  ] =
    useState(false);

  const [
    adaptiveDifficulty,
    setAdaptiveDifficulty,
  ] =
    useState(true);

  const [
    showExplanations,
    setShowExplanations,
  ] =
    useState(true);

  const [
    saved,
    setSaved,
  ] =
    useState(false);


  useEffect(() => {
    const currentUser =
      getCurrentUser();

    if (!currentUser) {
      router.replace('/');
      return;
    }

    setUser(currentUser);
  }, [router]);


  const handleSave = () => {
    setSaved(true);

    window.setTimeout(
      () =>
        setSaved(false),
      2000
    );
  };


  const handleLogout = () => {
    clearCurrentUser();

    router.replace('/');
    router.refresh();
  };


  return (
    <AppLayout
      pageTitle="Settings"
      pageSubtitle="Manage your account and preferences"
    >

      <div className="flex gap-6 max-w-5xl">

        {/* Sidebar nav */}

        <aside className="w-56 shrink-0">

          <nav className="bg-card border border-border rounded-xl overflow-hidden">

            {sections.map((section) => {
              const SectionIcon =
                section.icon;

              const active =
                activeSection ===
                section.id;

              return (

                <button
                  key={section.id}
                  type="button"
                  onClick={() =>
                    setActiveSection(
                      section.id
                    )
                  }
                  className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors duration-150 border-b border-border last:border-b-0 ${
                    active
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >

                  <div className="flex items-center gap-3">

                    <SectionIcon
                      size={16}
                    />

                    <span>
                      {section.label}
                    </span>

                  </div>

                  {active && (
                    <ChevronRight
                      size={14}
                    />
                  )}

                </button>

              );
            })}

          </nav>

        </aside>


        {/* Content */}

        <div className="flex-1 min-w-0">

          {/* Account */}

          {activeSection ===
            'account' && (

            <div className="bg-card border border-border rounded-xl p-6 space-y-6">

              <div>

                <h2 className="text-base font-semibold text-foreground">
                  Account Settings
                </h2>

                <p className="text-xs text-muted-foreground mt-1">
                  These details belong to the account currently signed in to StatSkill AI.
                </p>

              </div>


              <div className="grid grid-cols-1 gap-4">

                <div>

                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    Full Name
                  </label>

                  <div className="input-field flex items-center gap-2">
                    <User
                      size={15}
                      className="text-muted-foreground shrink-0"
                    />
                    <span className="text-sm text-foreground">
                      {user?.name || 'Loading...'}
                    </span>
                  </div>

                </div>


                <div>

                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    Email Address
                  </label>

                  <div className="input-field flex items-center gap-2">
                    <Mail
                      size={15}
                      className="text-muted-foreground shrink-0"
                    />
                    <span className="text-sm text-foreground truncate">
                      {user?.email || 'Loading...'}
                    </span>
                  </div>

                </div>


                <div>

                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    Role
                  </label>

                  <div className="input-field flex items-center gap-2">
                    <BriefcaseBusiness
                      size={15}
                      className="text-muted-foreground shrink-0"
                    />
                    <span className="text-sm text-foreground">
                      {user?.role || 'Employee'}
                    </span>
                  </div>

                </div>


                <div>

                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    Department
                  </label>

                  <div className="input-field flex items-center gap-2">
                    <Building2
                      size={15}
                      className="text-muted-foreground shrink-0"
                    />
                    <span className="text-sm text-foreground">
                      {user?.department || 'General'}
                    </span>
                  </div>

                </div>

              </div>


              <div className="pt-2 border-t border-border flex items-center justify-between gap-4">

                <p className="text-xs text-muted-foreground">
                  Account profile editing is not enabled yet. Your registered account details are shown exactly as stored for this sign-in.
                </p>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg border border-red-800/40 text-red-400 hover:bg-red-950/30 transition-colors text-sm font-semibold"
                >
                  <LogOut size={15} />
                  Log out
                </button>

              </div>

            </div>

          )}


          {/* Notifications */}

          {activeSection ===
            'notifications' && (

            <div className="bg-card border border-border rounded-xl p-6 space-y-5">

              <h2 className="text-base font-semibold text-foreground">
                Notification Settings
              </h2>


              <div className="space-y-4">

                {[
                  {
                    label:
                      'Email Notifications',
                    desc:
                      'Receive updates via email',
                    value:
                      notifEmail,
                    setter:
                      setNotifEmail,
                  },
                  {
                    label:
                      'Assessment Reminders',
                    desc:
                      'Reminders for scheduled assessments',
                    value:
                      notifAssessment,
                    setter:
                      setNotifAssessment,
                  },
                  {
                    label:
                      'Course Updates',
                    desc:
                      'New course and module notifications',
                    value:
                      notifCourse,
                    setter:
                      setNotifCourse,
                  },
                ].map((item) => (

                  <div
                    key={item.label}
                    className="flex items-center justify-between py-3 border-b border-border last:border-b-0"
                  >

                    <div>

                      <p className="text-sm font-medium text-foreground">
                        {item.label}
                      </p>

                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.desc}
                      </p>

                    </div>


                    <button
                      type="button"
                      onClick={() =>
                        item.setter(
                          !item.value
                        )
                      }
                      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                        item.value
                          ? 'bg-primary'
                          : 'bg-muted'
                      }`}
                    >

                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                          item.value
                            ? 'translate-x-5'
                            : 'translate-x-0'
                        }`}
                      />

                    </button>

                  </div>

                ))}

              </div>


              <button
                type="button"
                onClick={handleSave}
                className="btn-primary flex items-center gap-2"
              >
                <Save size={14} />
                {saved
                  ? 'Saved!'
                  : 'Save Changes'}
              </button>

            </div>

          )}


          {/* Assessment Preferences */}

          {activeSection ===
            'assessment' && (

            <div className="bg-card border border-border rounded-xl p-6 space-y-5">

              <h2 className="text-base font-semibold text-foreground">
                Assessment Preferences
              </h2>


              <div className="space-y-4">

                {[
                  {
                    label:
                      'Adaptive Difficulty',
                    desc:
                      'Automatically adjust question difficulty based on performance',
                    value:
                      adaptiveDifficulty,
                    setter:
                      setAdaptiveDifficulty,
                  },
                  {
                    label:
                      'Show Explanations',
                    desc:
                      'Display AI explanations after each answer',
                    value:
                      showExplanations,
                    setter:
                      setShowExplanations,
                  },
                ].map((item) => (

                  <div
                    key={item.label}
                    className="flex items-center justify-between py-3 border-b border-border last:border-b-0"
                  >

                    <div>

                      <p className="text-sm font-medium text-foreground">
                        {item.label}
                      </p>

                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.desc}
                      </p>

                    </div>


                    <button
                      type="button"
                      onClick={() =>
                        item.setter(
                          !item.value
                        )
                      }
                      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                        item.value
                          ? 'bg-primary'
                          : 'bg-muted'
                      }`}
                    >

                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                          item.value
                            ? 'translate-x-5'
                            : 'translate-x-0'
                        }`}
                      />

                    </button>

                  </div>

                ))}

              </div>


              <button
                type="button"
                onClick={handleSave}
                className="btn-primary flex items-center gap-2"
              >
                <Save size={14} />
                {saved
                  ? 'Saved!'
                  : 'Save Changes'}
              </button>

            </div>

          )}


          {/* Appearance */}

          {activeSection ===
            'appearance' && (

            <div className="bg-card border border-border rounded-xl p-6 space-y-6">

              <h2 className="text-base font-semibold text-foreground">
                Appearance
              </h2>


              <div>

                <p className="text-sm font-medium text-foreground mb-1">
                  Theme
                </p>

                <p className="text-xs text-muted-foreground mb-4">
                  Choose how StatSkill AI looks to you. Your preference is saved automatically.
                </p>


                <div className="grid grid-cols-3 gap-3">

                  <button
                    type="button"
                    onClick={() =>
                      setTheme('dark')
                    }
                    className={`relative flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all duration-150 ${
                      theme === 'dark'
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50 bg-muted/30'
                    }`}
                  >

                    <div className="w-full h-16 rounded-lg bg-slate-900 border border-slate-700 overflow-hidden flex flex-col gap-1 p-2">

                      <div className="h-2 w-3/4 rounded bg-slate-700" />
                      <div className="h-2 w-1/2 rounded bg-slate-800" />

                      <div className="flex gap-1 mt-1">
                        <div className="h-4 w-8 rounded bg-blue-600" />
                        <div className="h-4 w-8 rounded bg-slate-700" />
                      </div>

                    </div>


                    <div className="flex items-center gap-2">

                      <Moon
                        size={14}
                        className={
                          theme === 'dark'
                            ? 'text-primary'
                            : 'text-muted-foreground'
                        }
                      />

                      <span
                        className={`text-xs font-semibold ${
                          theme === 'dark'
                            ? 'text-primary'
                            : 'text-muted-foreground'
                        }`}
                      >
                        Dark
                      </span>

                    </div>


                    {theme === 'dark' && (

                      <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary flex items-center justify-center">

                        <svg
                          width="8"
                          height="8"
                          viewBox="0 0 8 8"
                          fill="none"
                        >
                          <path
                            d="M1.5 4L3.5 6L6.5 2"
                            stroke="white"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>

                      </span>

                    )}

                  </button>


                  <button
                    type="button"
                    onClick={() =>
                      setTheme('light')
                    }
                    className={`relative flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all duration-150 ${
                      theme === 'light'
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50 bg-muted/30'
                    }`}
                  >

                    <div className="w-full h-16 rounded-lg bg-white border border-slate-200 overflow-hidden flex flex-col gap-1 p-2">

                      <div className="h-2 w-3/4 rounded bg-slate-200" />
                      <div className="h-2 w-1/2 rounded bg-slate-100" />

                      <div className="flex gap-1 mt-1">
                        <div className="h-4 w-8 rounded bg-blue-500" />
                        <div className="h-4 w-8 rounded bg-slate-200" />
                      </div>

                    </div>


                    <div className="flex items-center gap-2">

                      <Sun
                        size={14}
                        className={
                          theme === 'light'
                            ? 'text-primary'
                            : 'text-muted-foreground'
                        }
                      />

                      <span
                        className={`text-xs font-semibold ${
                          theme === 'light'
                            ? 'text-primary'
                            : 'text-muted-foreground'
                        }`}
                      >
                        Light
                      </span>

                    </div>


                    {theme === 'light' && (

                      <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary flex items-center justify-center">

                        <svg
                          width="8"
                          height="8"
                          viewBox="0 0 8 8"
                          fill="none"
                        >
                          <path
                            d="M1.5 4L3.5 6L6.5 2"
                            stroke="white"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>

                      </span>

                    )}

                  </button>


                  <button
                    type="button"
                    className="relative flex flex-col items-center gap-3 p-4 rounded-xl border-2 border-border bg-muted/30 opacity-60 cursor-not-allowed"
                    disabled
                    title="System theme coming soon"
                  >

                    <div className="w-full h-16 rounded-lg overflow-hidden flex border border-slate-400">

                      <div className="flex-1 bg-slate-900 flex flex-col gap-1 p-2">
                        <div className="h-2 w-full rounded bg-slate-700" />
                        <div className="h-2 w-2/3 rounded bg-slate-800" />
                      </div>

                      <div className="flex-1 bg-white flex flex-col gap-1 p-2">
                        <div className="h-2 w-full rounded bg-slate-200" />
                        <div className="h-2 w-2/3 rounded bg-slate-100" />
                      </div>

                    </div>


                    <div className="flex items-center gap-2">

                      <Monitor
                        size={14}
                        className="text-muted-foreground"
                      />

                      <span className="text-xs font-semibold text-muted-foreground">
                        System
                      </span>

                    </div>

                  </button>

                </div>

              </div>


              <div className="pt-2 border-t border-border">

                <p className="text-xs text-muted-foreground">
                  Current theme:{' '}
                  <span className="font-semibold text-foreground capitalize">
                    {theme}
                  </span>
                  . Your preference is automatically saved and will persist across sessions.
                </p>

              </div>

            </div>

          )}


          {/* Privacy */}

          {activeSection ===
            'privacy' && (

            <div className="bg-card border border-border rounded-xl p-6 space-y-5">

              <h2 className="text-base font-semibold text-foreground">
                Privacy & Security
              </h2>


              <div className="space-y-3">

                <div className="p-4 rounded-lg bg-muted border border-border">

                  <p className="text-sm font-medium text-foreground">
                    Account security
                  </p>

                  <p className="text-xs text-muted-foreground mt-0.5">
                    Password changes and two-factor authentication are not enabled in this hackathon build.
                  </p>

                </div>


                <div className="p-4 rounded-lg bg-muted border border-border">

                  <p className="text-sm font-medium text-foreground">
                    Sign out of this browser
                  </p>

                  <p className="text-xs text-muted-foreground mt-0.5 mb-3">
                    Remove the locally stored signed-in account from this browser.
                  </p>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-800/40 text-red-400 hover:bg-red-950/30 transition-colors text-sm font-semibold"
                  >
                    <LogOut size={15} />
                    Log out
                  </button>

                </div>

              </div>

            </div>

          )}

        </div>

      </div>

    </AppLayout>
  );
}

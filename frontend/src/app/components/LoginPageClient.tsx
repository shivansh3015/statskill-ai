'use client';

import React, { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  BrainCircuit,
  BriefcaseBusiness,
  Building2,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
  ShieldCheck,
  User,
} from 'lucide-react';
import { toast } from 'sonner';

import { apiPost } from '@/lib/api';
import {
  AuthUser,
  setCurrentUser,
} from '@/lib/auth';

type AuthMode = 'login' | 'register';

type AuthResponse = {
  message: string;
  user: AuthUser;
};

function getErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) {
    return 'Something went wrong. Please try again.';
  }

  const raw = error.message || '';

  const jsonStart = raw.indexOf('{');

  if (jsonStart >= 0) {
    try {
      const parsed = JSON.parse(
        raw.slice(jsonStart)
      ) as {
        detail?: string;
      };

      if (parsed.detail) {
        return parsed.detail;
      }
    } catch {
      // Fall back to the normal error message below.
    }
  }

  return (
    raw.replace(
      /^API Error \d+:\s*/,
      ''
    ) ||
    'Something went wrong. Please try again.'
  );
}

export default function LoginPageClient() {
  const router = useRouter();

  const [mode, setMode] =
    useState<AuthMode>('login');

  const [name, setName] =
    useState('');

  const [email, setEmail] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState('');

  const [role, setRole] =
    useState('');

  const [department, setDepartment] =
    useState('');

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState('');

  function switchMode(
    nextMode: AuthMode
  ) {
    setMode(nextMode);
    setError('');
    setPassword('');
    setConfirmPassword('');
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError('');

    const cleanEmail =
      email.trim().toLowerCase();

    if (!cleanEmail) {
      setError(
        'Please enter your email address.'
      );
      return;
    }

    if (!password) {
      setError(
        'Please enter your password.'
      );
      return;
    }

    if (
      mode === 'register' &&
      !name.trim()
    ) {
      setError(
        'Please enter your full name.'
      );
      return;
    }

    if (
      mode === 'register' &&
      password.length < 6
    ) {
      setError(
        'Password must contain at least 6 characters.'
      );
      return;
    }

    if (
      mode === 'register' &&
      password !== confirmPassword
    ) {
      setError(
        'Passwords do not match.'
      );
      return;
    }

    setLoading(true);

    try {
      const response =
        mode === 'register'
          ? await apiPost<AuthResponse>(
              '/auth/register',
              {
                name: name.trim(),
                email: cleanEmail,
                password,
                role:
                  role.trim() ||
                  'Employee',
                department:
                  department.trim() ||
                  'General',
              }
            )
          : await apiPost<AuthResponse>(
              '/auth/login',
              {
                email: cleanEmail,
                password,
              }
            );

      setCurrentUser(response.user);

      toast.success(
        mode === 'register'
          ? 'Account created successfully'
          : 'Signed in successfully'
      );

      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      const message =
        getErrorMessage(err);

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  const isRegister =
    mode === 'register';

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="min-h-screen grid lg:grid-cols-[1.05fr_0.95fr]">
        <section className="hidden lg:flex relative overflow-hidden border-r border-white/10">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-950 to-cyan-950" />

          <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-violet-500/20 blur-3xl" />

          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

          <div className="relative z-10 flex min-h-screen w-full flex-col justify-between p-12 xl:p-16">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-indigo-400/30 bg-indigo-500/15">
                <BrainCircuit className="h-6 w-6 text-indigo-300" />
              </div>

              <div>
                <div className="text-xl font-bold tracking-tight">
                  StatSkill AI
                </div>

                <div className="text-xs text-slate-400">
                  Adaptive Competency Development
                </div>
              </div>
            </div>

            <div className="max-w-xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                Personalized learning journey
              </div>

              <h1 className="text-4xl font-bold leading-tight tracking-tight xl:text-5xl">
                Measure skills.
                <br />
                Close gaps.
                <br />
                <span className="text-indigo-300">
                  Prove improvement.
                </span>
              </h1>

              <p className="mt-6 max-w-lg text-base leading-7 text-slate-300">
                AI-powered adaptive assessments identify skill gaps, recommend targeted learning, and measure competency growth after training.
              </p>

              <div className="mt-9 grid max-w-lg grid-cols-3 gap-3">
                {[
                  ['AI', 'Assessment'],
                  ['Smart', 'Learning'],
                  ['Measured', 'Growth'],
                ].map(
                  ([top, bottom]) => (
                    <div
                      key={top}
                      className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                    >
                      <div className="font-semibold text-white">
                        {top}
                      </div>

                      <div className="mt-1 text-xs text-slate-400">
                        {bottom}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            <p className="text-xs text-slate-500">
              StatSkill AI · Competency Development Platform
            </p>
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-md">
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/15">
                <BrainCircuit className="h-5 w-5 text-indigo-300" />
              </div>

              <div>
                <div className="font-bold">
                  StatSkill AI
                </div>
                <div className="text-xs text-slate-500">
                  Adaptive Competency Development
                </div>
              </div>
            </div>

            <div className="mb-7">
              <h2 className="text-3xl font-bold tracking-tight">
                {isRegister
                  ? 'Create your account'
                  : 'Welcome back'}
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                {isRegister
                  ? 'Create your personal StatSkill AI account and start building your competency profile.'
                  : 'Sign in to continue your learning and competency journey.'}
              </p>
            </div>

            <div className="mb-7 grid grid-cols-2 rounded-xl border border-white/10 bg-white/[0.03] p-1">
              <button
                type="button"
                onClick={() =>
                  switchMode('login')
                }
                className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                  mode === 'login'
                    ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-950/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>

              <button
                type="button"
                onClick={() =>
                  switchMode('register')
                }
                className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                  mode === 'register'
                    ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-950/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {isRegister && (
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-medium text-slate-300"
                  >
                    Full Name
                  </label>

                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(event) =>
                        setName(
                          event.target.value
                        )
                      }
                      autoComplete="name"
                      placeholder="Enter your full name"
                      className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-400/60 focus:ring-2 focus:ring-indigo-500/10"
                    />
                  </div>
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Email Address
                </label>

                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(
                        event.target.value
                      )
                    }
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-400/60 focus:ring-2 focus:ring-indigo-500/10"
                  />
                </div>
              </div>

              {isRegister && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="role"
                      className="mb-2 block text-sm font-medium text-slate-300"
                    >
                      Role
                    </label>

                    <div className="relative">
                      <BriefcaseBusiness className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

                      <input
                        id="role"
                        type="text"
                        value={role}
                        onChange={(event) =>
                          setRole(
                            event.target.value
                          )
                        }
                        placeholder="e.g. Analyst"
                        className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] pl-10 pr-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-400/60 focus:ring-2 focus:ring-indigo-500/10"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="department"
                      className="mb-2 block text-sm font-medium text-slate-300"
                    >
                      Department
                    </label>

                    <div className="relative">
                      <Building2 className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

                      <input
                        id="department"
                        type="text"
                        value={department}
                        onChange={(event) =>
                          setDepartment(
                            event.target.value
                          )
                        }
                        placeholder="e.g. Statistics"
                        className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] pl-10 pr-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-400/60 focus:ring-2 focus:ring-indigo-500/10"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Password
                </label>

                <div className="relative">
                  <LockKeyhole className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

                  <input
                    id="password"
                    type={
                      showPassword
                        ? 'text'
                        : 'password'
                    }
                    value={password}
                    onChange={(event) =>
                      setPassword(
                        event.target.value
                      )
                    }
                    autoComplete={
                      isRegister
                        ? 'new-password'
                        : 'current-password'
                    }
                    placeholder={
                      isRegister
                        ? 'Minimum 6 characters'
                        : 'Enter your password'
                    }
                    className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] pl-10 pr-12 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-400/60 focus:ring-2 focus:ring-indigo-500/10"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (value) => !value
                      )
                    }
                    aria-label={
                      showPassword
                        ? 'Hide password'
                        : 'Show password'
                    }
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-300"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {isRegister && (
                <div>
                  <label
                    htmlFor="confirm-password"
                    className="mb-2 block text-sm font-medium text-slate-300"
                  >
                    Confirm Password
                  </label>

                  <div className="relative">
                    <LockKeyhole className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

                    <input
                      id="confirm-password"
                      type={
                        showPassword
                          ? 'text'
                          : 'password'
                      }
                      value={
                        confirmPassword
                      }
                      onChange={(event) =>
                        setConfirmPassword(
                          event.target.value
                        )
                      }
                      autoComplete="new-password"
                      placeholder="Enter password again"
                      className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-400/60 focus:ring-2 focus:ring-indigo-500/10"
                    />
                  </div>
                </div>
              )}

              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {isRegister
                      ? 'Creating Account...'
                      : 'Signing In...'}
                  </>
                ) : (
                  <>
                    {isRegister
                      ? 'Create Account'
                      : 'Sign In to StatSkill AI'}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-7 rounded-xl border border-white/10 bg-white/[0.025] px-4 py-3">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />

                <p className="text-xs leading-5 text-slate-500">
                  Each account has its own competency profile, assessments, learning progress, and improvement history.
                </p>
              </div>
            </div>

            <p className="mt-7 text-center text-xs text-slate-600">
              By continuing, you agree to use StatSkill AI responsibly.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

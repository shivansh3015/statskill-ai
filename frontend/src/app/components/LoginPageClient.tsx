'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import AppLogo from '@/components/ui/AppLogo';
import { Eye, EyeOff, Lock, Mail, ArrowRight, Shield, Copy, Loader2,  } from 'lucide-react';
import LoginBrandPanel from './LoginBrandPanel';
import EmployeeProfileCard from './EmployeeProfileCard';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

// Mock credentials — backend auth will replace this at /api/auth/login
const MOCK_USERS = [
  {
    email: 'shivansh.gupta@mospi.gov.in',
    password: 'StatSkill@2026',
    name: 'Shivansh Gupta',
    employeeId: 'MOS-2024-0847',
    role: 'Statistical Officer',
    department: 'Official Statistics',
    organization: 'Ministry of Statistics & PI',
    grade: 'Group A — Level 10',
    joinedDate: '12 Mar 2021',
    lastAssessment: '08 Sep 2026',
    overallScore: 72,
    completedCourses: 8,
    skillGaps: 3,
    initials: 'SG',
  },
];

export default function LoginPageClient() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<typeof MOCK_USERS[0] | null>(null);
  const [redirecting, setRedirecting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: { email: '', password: '', rememberMe: false },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    // BACKEND INTEGRATION POINT: POST /api/auth/login with { email, password }
    await new Promise((r) => setTimeout(r, 1400));

    const user = MOCK_USERS.find(
      (u) => u.email === data.email && u.password === data.password
    );

    if (!user) {
      setIsLoading(false);
      toast.error('Invalid credentials — use the demo accounts below to sign in');
      return;
    }

    setIsLoading(false);
    setLoggedInUser(user);
    toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
  };

  const handleContinueToDashboard = async () => {
    setRedirecting(true);
    await new Promise((r) => setTimeout(r, 600));
    router.push('/dashboard');
  };

  const fillCredentials = (user: typeof MOCK_USERS[0]) => {
    setValue('email', user.email);
    setValue('password', user.password);
    toast.success('Demo credentials filled — click Sign In');
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left — Form */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-16 xl:px-20 py-12 max-w-xl lg:max-w-lg xl:max-w-xl">
        {/* Logo */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-8">
            <AppLogo size={40} />
            <div>
              <span className="text-xl font-bold text-foreground tracking-tight block">StatSkill AI</span>
              <span className="text-xs text-muted-foreground">AI-Powered Competency Development</span>
            </div>
          </div>

          {!loggedInUser ? (
            <>
              <h2 className="text-2xl font-bold text-foreground mb-1">Sign in to your account</h2>
              <p className="text-sm text-muted-foreground">
                Access your competency dashboard and AI assessments.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-foreground mb-1">Welcome back!</h2>
              <p className="text-sm text-muted-foreground">
                Your competency profile is ready. Continue to your dashboard.
              </p>
            </>
          )}
        </div>

        {!loggedInUser ? (
          /* ── Login Form ── */
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
                Official Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  placeholder="name@department.gov.in"
                  className={`input-field pl-10 ${errors.email ? 'border-danger focus:ring-danger' : ''}`}
                  {...register('email', {
                    required: 'Email address is required',
                    pattern: { value: /\S+@\S+\.\S+/, message: 'Enter a valid email address' },
                  })}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-danger flex items-center gap-1">
                  <span>{errors.email.message}</span>
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-foreground">
                  Password
                </label>
                <button
                  type="button"
                  className="text-xs text-primary hover:text-blue-300 transition-colors font-medium"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className={`input-field pl-10 pr-10 ${errors.password ? 'border-danger focus:ring-danger' : ''}`}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-danger">{errors.password.message}</p>
              )}
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2.5">
              <input
                id="rememberMe"
                type="checkbox"
                className="w-4 h-4 rounded border-border bg-muted accent-primary cursor-pointer"
                {...register('rememberMe')}
              />
              <label htmlFor="rememberMe" className="text-sm text-muted-foreground cursor-pointer">
                Keep me signed in for 30 days
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-primary hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all duration-150"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Authenticating…
                </>
              ) : (
                <>
                  Sign In to StatSkill AI
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            {/* Security note */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Shield size={12} className="text-success shrink-0" />
              <span>Secured by government-grade TLS encryption. Your data is protected.</span>
            </div>
          </form>
        ) : (
          /* ── Employee Profile Card (post-login) ── */
          <EmployeeProfileCard
            user={loggedInUser}
            onContinue={handleContinueToDashboard}
            redirecting={redirecting}
          />
        )}

        {/* Demo Credentials Box */}
        {!loggedInUser && (
          <div className="mt-8 p-4 rounded-xl bg-navy-700 border border-border">
            <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
              Demo Credentials
            </p>
            <div className="space-y-2">
              {MOCK_USERS.map((u) => (
                <div
                  key={`demo-${u.employeeId}`}
                  className="flex items-center gap-2 flex-wrap"
                >
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-2xs text-muted-foreground w-16 shrink-0">Email</span>
                      <span className="text-xs text-foreground font-mono-data truncate">{u.email}</span>
                      <button
                        onClick={() => copyToClipboard(u.email, 'Email')}
                        className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                      >
                        <Copy size={11} />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xs text-muted-foreground w-16 shrink-0">Password</span>
                      <span className="text-xs text-foreground font-mono-data">{u.password}</span>
                      <button
                        onClick={() => copyToClipboard(u.password, 'Password')}
                        className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                      >
                        <Copy size={11} />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => fillCredentials(u)}
                    className="shrink-0 text-2xs font-semibold text-primary border border-primary/30 bg-blue-950/30 hover:bg-blue-900/40 px-2.5 py-1.5 rounded-lg transition-colors"
                  >
                    Use
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right — Brand Panel */}
      <LoginBrandPanel />
    </div>
  );
}
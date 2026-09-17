'use client';

import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import Link from 'next/link';
import {
  usePathname,
  useRouter,
} from 'next/navigation';

import AppLogo from '@/components/ui/AppLogo';

import {
  LayoutDashboard,
  Brain,
  BookOpen,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  LogOut,
} from 'lucide-react';

import {
  clearCurrentUser,
  getCurrentUser,
  type AuthUser,
} from '@/lib/auth';


interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ElementType;
}


const navItems: NavItem[] = [
  {
    id: 'nav-dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    id: 'nav-assessment',
    label: 'AI Assessment',
    href: '/ai-assessment',
    icon: Brain,
  },
  {
    id: 'nav-courses',
    label: 'Courses',
    href: '/courses',
    icon: BookOpen,
  },
  {
    id: 'nav-progress',
    label: 'Progress',
    href: '/progress',
    icon: BarChart3,
  },
];


const bottomNavItems: NavItem[] = [
  {
    id: 'nav-settings',
    label: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];


interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}


function getInitials(
  name?: string | null
) {
  const parts =
    (name || '')
      .trim()
      .split(/\s+/)
      .filter(Boolean);

  if (parts.length === 0) {
    return 'U';
  }

  if (parts.length === 1) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return (
    `${parts[0][0] || ''}${
      parts[parts.length - 1][0] || ''
    }`
  ).toUpperCase();
}


export default function Sidebar({
  collapsed,
  onToggle,
}: SidebarProps) {
  const pathname =
    usePathname();

  const router =
    useRouter();

  const [
    user,
    setUser,
  ] =
    useState<AuthUser | null>(null);


  useEffect(() => {
    setUser(
      getCurrentUser()
    );
  }, []);


  const initials =
    useMemo(
      () =>
        getInitials(
          user?.name
        ),
      [user]
    );


  const isActive = (
    href: string
  ) => {
    if (
      href === '/dashboard' &&
      pathname === '/'
    ) {
      return true;
    }

    return (
      pathname === href ||
      pathname.startsWith(
        `${href}/`
      )
    );
  };


  function handleLogout() {
    clearCurrentUser();

    router.replace('/');
    router.refresh();
  }


  return (
    <aside
      className="relative flex flex-col h-full bg-navy-800 sidebar-shadow border-r border-border transition-all duration-300 ease-in-out"
      style={{
        width:
          collapsed
            ? '64px'
            : '240px',

        minWidth:
          collapsed
            ? '64px'
            : '240px',
      }}
    >

      {/* Logo */}

      <div
        className="flex items-center h-16 px-3 border-b border-border shrink-0"
        style={{
          justifyContent:
            collapsed
              ? 'center'
              : 'flex-start',
        }}
      >

        <div className="flex items-center gap-2.5">

          <AppLogo size={32} />

          {!collapsed && (

            <div className="flex flex-col leading-none">

              <span className="text-sm font-bold text-foreground tracking-tight">
                StatSkill AI
              </span>

              <span className="text-2xs text-muted-foreground mt-0.5">
                Competency Platform
              </span>

            </div>

          )}

        </div>

      </div>


      {/* Toggle */}

      <button
        type="button"
        onClick={onToggle}
        className="absolute -right-3 top-[72px] z-10 w-6 h-6 rounded-full bg-primary border-2 border-navy-800 flex items-center justify-center hover:bg-blue-400 transition-colors duration-150"
        aria-label={
          collapsed
            ? 'Expand sidebar'
            : 'Collapse sidebar'
        }
      >

        {collapsed ? (

          <ChevronRight
            size={10}
            className="text-white"
          />

        ) : (

          <ChevronLeft
            size={10}
            className="text-white"
          />

        )}

      </button>


      {/* Main navigation */}

      <nav className="flex-1 py-4 overflow-y-auto scrollbar-thin">

        {!collapsed && (

          <p className="section-label px-4 mb-2">
            Navigation
          </p>

        )}


        <ul className="space-y-0.5 px-2">

          {navItems.map(
            (item) => {
              const NavIcon =
                item.icon;

              const active =
                isActive(
                  item.href
                );

              return (

                <li key={item.id}>

                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 relative group ${
                      active
                        ? 'nav-item-active'
                        : 'nav-item-inactive'
                    }`}
                    title={
                      collapsed
                        ? item.label
                        : undefined
                    }
                  >

                    <NavIcon
                      size={18}
                      className={`shrink-0 ${
                        active
                          ? 'text-primary'
                          : ''
                      }`}
                    />

                    {!collapsed && (

                      <span className="truncate">
                        {item.label}
                      </span>

                    )}

                    {collapsed && (

                      <span className="absolute left-full ml-2 px-2 py-1 bg-navy-600 text-foreground text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-50 border border-border">
                        {item.label}
                      </span>

                    )}

                  </Link>

                </li>

              );
            }
          )}

        </ul>


        {!collapsed && (

          <div className="mx-3 mt-4 p-3 rounded-xl bg-gradient-to-br from-blue-900/40 to-cyan-900/20 border border-blue-800/30">

            <div className="flex items-center gap-2 mb-2">

              <Zap
                size={14}
                className="text-accent"
              />

              <span className="text-xs font-semibold text-accent">
                AI Ready
              </span>

            </div>

            <p className="text-xs text-muted-foreground leading-relaxed mb-2.5">
              Take an adaptive competency assessment or reassess after completing a course.
            </p>

            <Link
              href="/ai-assessment"
              className="block text-center text-xs font-semibold text-white bg-primary px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
            >
              Start Assessment
            </Link>

          </div>

        )}

      </nav>


      {/* Bottom navigation */}

      <div className="border-t border-border py-3 px-2">

        <ul className="space-y-0.5">

          {bottomNavItems.map(
            (item) => {
              const NavIcon =
                item.icon;

              const active =
                isActive(
                  item.href
                );

              return (

                <li key={item.id}>

                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 relative group ${
                      active
                        ? 'nav-item-active'
                        : 'nav-item-inactive'
                    }`}
                    title={
                      collapsed
                        ? item.label
                        : undefined
                    }
                  >

                    <NavIcon
                      size={18}
                      className={`shrink-0 ${
                        active
                          ? 'text-primary'
                          : ''
                      }`}
                    />

                    {!collapsed && (

                      <span className="truncate">
                        {item.label}
                      </span>

                    )}

                    {collapsed && (

                      <span className="absolute left-full ml-2 px-2 py-1 bg-navy-600 text-foreground text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-50 border border-border">
                        {item.label}
                      </span>

                    )}

                  </Link>

                </li>

              );
            }
          )}

        </ul>


        {!collapsed && (

          <>
            <div className="mt-3 mx-1 p-2.5 rounded-lg bg-muted border border-border flex items-center gap-2.5">

              <div className="w-8 h-8 rounded-full bg-primary-gradient flex items-center justify-center text-white text-xs font-bold shrink-0">
                {initials}
              </div>

              <div className="flex-1 min-w-0">

                <p className="text-xs font-semibold text-foreground truncate">
                  {user?.name || 'Signed-in user'}
                </p>

                <p className="text-2xs text-muted-foreground truncate">
                  {user?.role || 'Employee'}
                </p>

              </div>

            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="mt-2 w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-950/30 transition-colors"
            >
              <LogOut
                size={17}
                className="shrink-0"
              />
              Log out
            </button>
          </>

        )}


        {collapsed && (

          <div className="mt-2 space-y-2">

            <div
              className="mx-auto w-8 h-8 rounded-full bg-primary-gradient flex items-center justify-center text-white text-xs font-bold"
              title={
                user?.name ||
                'Signed-in user'
              }
            >
              {initials}
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="mx-auto w-8 h-8 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-950/30 transition-colors"
              title="Log out"
              aria-label="Log out"
            >
              <LogOut size={16} />
            </button>

          </div>

        )}

      </div>

    </aside>
  );
}

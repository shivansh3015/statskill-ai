'use client';

import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import {
  Search,
  Bell,
  Brain,
  X,
  Sun,
  Moon,
  User,
  Settings,
  LogOut,
  ChevronDown,
} from 'lucide-react';

import { useTheme } from '@/context/ThemeContext';
import {
  clearCurrentUser,
  getCurrentUser,
  type AuthUser,
} from '@/lib/auth';


interface HeaderProps {
  pageTitle: string;
  pageSubtitle?: string;
}


function getInitials(name?: string | null) {
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


function getShortName(name?: string | null) {
  const clean =
    (name || '').trim();

  if (!clean) {
    return 'Account';
  }

  const parts =
    clean.split(/\s+/);

  if (parts.length === 1) {
    return parts[0];
  }

  return `${
    parts[0]
  } ${
    parts[parts.length - 1][0] || ''
  }.`;
}


export default function Header({
  pageTitle,
  pageSubtitle,
}: HeaderProps) {
  const router =
    useRouter();

  const {
    theme,
    toggleTheme,
  } = useTheme();

  const [
    user,
    setUser,
  ] =
    useState<AuthUser | null>(null);

  const [
    notifOpen,
    setNotifOpen,
  ] =
    useState(false);

  const [
    searchOpen,
    setSearchOpen,
  ] =
    useState(false);

  const [
    profileOpen,
    setProfileOpen,
  ] =
    useState(false);

  const [
    searchQuery,
    setSearchQuery,
  ] =
    useState('');


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

  const shortName =
    useMemo(
      () =>
        getShortName(
          user?.name
        ),
      [user]
    );


  function handleLogout() {
    clearCurrentUser();

    setProfileOpen(false);

    router.replace('/');
    router.refresh();
  }


  return (
    <header className="h-16 bg-navy-800 border-b border-border flex items-center justify-between px-6 shrink-0 relative z-30">

      {/* Left: page title */}

      <div className="flex flex-col leading-none min-w-0">

        <h1 className="text-base font-semibold text-foreground truncate">
          {pageTitle}
        </h1>

        {pageSubtitle && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {pageSubtitle}
          </p>
        )}

      </div>


      {/* Right: actions */}

      <div className="flex items-center gap-2">

        {/* Search */}

        <div className="relative">

          {searchOpen ? (

            <div className="flex items-center gap-2 bg-muted border border-border rounded-lg px-3 py-1.5">

              <Search
                size={14}
                className="text-muted-foreground shrink-0"
              />

              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(
                    event.target.value
                  )
                }
                placeholder="Search competencies, courses..."
                className="bg-transparent text-sm text-foreground placeholder-muted-foreground outline-none w-56"
              />

              <button
                type="button"
                onClick={() => {
                  setSearchOpen(false);
                  setSearchQuery('');
                }}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close search"
              >
                <X size={14} />
              </button>

            </div>

          ) : (

            <button
              type="button"
              onClick={() =>
                setSearchOpen(true)
              }
              className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-150"
              aria-label="Open search"
            >
              <Search size={18} />
            </button>

          )}

        </div>


        {/* Theme toggle */}

        <button
          type="button"
          onClick={toggleTheme}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-150"
          aria-label={
            theme === 'dark'
              ? 'Switch to light mode'
              : 'Switch to dark mode'
          }
          title={
            theme === 'dark'
              ? 'Switch to light mode'
              : 'Switch to dark mode'
          }
        >
          {theme === 'dark' ? (
            <Sun size={18} />
          ) : (
            <Moon size={18} />
          )}
        </button>


        {/* Notifications */}

        <div className="relative">

          <button
            type="button"
            onClick={() => {
              setNotifOpen(
                (previous) =>
                  !previous
              );

              setProfileOpen(false);
            }}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-150"
            aria-label="Notifications"
          >
            <Bell size={18} />
          </button>


          {notifOpen && (

            <div className="absolute right-0 top-full mt-2 w-80 bg-navy-700 border border-border rounded-xl card-shadow z-50 overflow-hidden">

              <div className="px-4 py-3 border-b border-border">

                <p className="text-sm font-semibold text-foreground">
                  Notifications
                </p>

                <p className="text-xs text-muted-foreground mt-1">
                  Account-specific notifications will appear here.
                </p>

              </div>


              <div className="px-4 py-8 text-center">

                <Bell
                  size={22}
                  className="text-muted-foreground mx-auto mb-2"
                />

                <p className="text-sm text-muted-foreground">
                  No new notifications.
                </p>

              </div>

            </div>

          )}

        </div>


        {/* Quick action */}

        <Link
          href="/ai-assessment"
          className="hidden sm:flex items-center gap-2 bg-primary hover:opacity-90 active:scale-95 transition-all duration-150 text-white text-xs font-semibold px-3.5 py-2 rounded-lg"
        >
          <Brain size={14} />
          Start Assessment
        </Link>


        {/* Signed-in profile */}

        <div className="relative hidden md:block">

          <button
            type="button"
            onClick={() => {
              setProfileOpen(
                (previous) =>
                  !previous
              );

              setNotifOpen(false);
            }}
            className="flex items-center gap-2 bg-muted border border-border rounded-lg px-3 py-1.5 hover:bg-navy-600 transition-colors duration-150"
            aria-label="Open account menu"
          >

            <div className="w-6 h-6 rounded-full bg-primary-gradient flex items-center justify-center text-white text-2xs font-bold">
              {initials}
            </div>

            <span className="text-xs font-medium text-foreground max-w-32 truncate">
              {shortName}
            </span>

            <ChevronDown
              size={12}
              className="text-muted-foreground"
            />

          </button>


          {profileOpen && (

            <div className="absolute right-0 top-full mt-2 w-64 bg-navy-700 border border-border rounded-xl card-shadow z-50 overflow-hidden">

              <div className="px-4 py-3 border-b border-border">

                <p className="text-sm font-semibold text-foreground truncate">
                  {user?.name || 'Signed-in user'}
                </p>

                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {user?.email || 'Account'}
                </p>

                <p className="text-2xs text-muted-foreground mt-1 truncate">
                  {user?.role || 'Employee'}
                  {' • '}
                  {user?.department || 'General'}
                </p>

              </div>


              <div className="p-2">

                <Link
                  href="/settings"
                  onClick={() =>
                    setProfileOpen(false)
                  }
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-muted transition-colors"
                >
                  <Settings size={15} />
                  Account settings
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-950/30 transition-colors"
                >
                  <LogOut size={15} />
                  Log out
                </button>

              </div>

            </div>

          )}

        </div>


        {/* Mobile account shortcut */}

        <Link
          href="/settings"
          className="md:hidden w-9 h-9 rounded-lg bg-muted border border-border flex items-center justify-center text-foreground"
          aria-label="Account settings"
        >
          <User size={17} />
        </Link>

      </div>


      {(notifOpen || profileOpen) && (

        <div
          className="fixed inset-0 z-20"
          onClick={() => {
            setNotifOpen(false);
            setProfileOpen(false);
          }}
        />

      )}

    </header>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Bell, ChevronDown, Brain, X, CheckCircle2, AlertTriangle, Info, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const notifications: Notification[] = [
  {
    id: 'notif-001',
    type: 'success',
    title: 'Assessment Completed',
    message: 'Your Statistical Methods assessment scored 78/100',
    time: '2 hours ago',
    read: false,
  },
  {
    id: 'notif-002',
    type: 'warning',
    title: 'Skill Gap Detected',
    message: 'Machine Learning competency is below threshold (42/100)',
    time: '1 day ago',
    read: false,
  },
  {
    id: 'notif-003',
    type: 'info',
    title: 'New Course Available',
    message: 'Python for Data Analysis has been added to your recommendations',
    time: '2 days ago',
    read: true,
  },
  {
    id: 'notif-004',
    type: 'success',
    title: 'Course Module Completed',
    message: 'You completed "Regression Analysis — Module 3"',
    time: '3 days ago',
    read: true,
  },
];

const unreadCount = notifications.filter((n) => !n.read).length;

interface HeaderProps {
  pageTitle: string;
  pageSubtitle?: string;
}

export default function Header({ pageTitle, pageSubtitle }: HeaderProps) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { theme, toggleTheme } = useTheme();

  const notifIcon = (type: Notification['type']) => {
    if (type === 'success') return <CheckCircle2 size={14} className="text-success" />;
    if (type === 'warning') return <AlertTriangle size={14} className="text-warning" />;
    return <Info size={14} className="text-primary" />;
  };

  return (
    <header className="h-16 bg-navy-800 border-b border-border flex items-center justify-between px-6 shrink-0 relative z-20">
      {/* Left: page title */}
      <div className="flex flex-col leading-none">
        <h1 className="text-base font-semibold text-foreground">{pageTitle}</h1>
        {pageSubtitle && (
          <p className="text-xs text-muted-foreground mt-0.5">{pageSubtitle}</p>
        )}
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative">
          {searchOpen ? (
            <div className="flex items-center gap-2 bg-muted border border-border rounded-lg px-3 py-1.5">
              <Search size={14} className="text-muted-foreground shrink-0" />
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search competencies, courses..."
                className="bg-transparent text-sm text-foreground placeholder-muted-foreground outline-none w-56"
              />
              <button
                onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-150"
              aria-label="Open search"
            >
              <Search size={18} />
            </button>
          )}
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-150"
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-150 relative"
            aria-label="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full pulse-dot" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-navy-700 border border-border rounded-xl card-shadow z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <span className="text-sm font-semibold text-foreground">Notifications</span>
                {unreadCount > 0 && (
                  <span className="badge-info">{unreadCount} new</span>
                )}
              </div>
              <ul className="divide-y divide-border max-h-72 overflow-y-auto scrollbar-thin">
                {notifications.map((notif) => (
                  <li
                    key={notif.id}
                    className={`px-4 py-3 flex gap-3 hover:bg-muted/50 transition-colors cursor-pointer ${
                      !notif.read ? 'bg-blue-950/20' : ''
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">{notifIcon(notif.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground">{notif.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{notif.message}</p>
                      <p className="text-2xs text-muted-foreground/60 mt-1">{notif.time}</p>
                    </div>
                    {!notif.read && (
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 shrink-0" />
                    )}
                  </li>
                ))}
              </ul>
              <div className="px-4 py-2.5 border-t border-border">
                <button className="text-xs text-primary hover:text-blue-300 font-medium transition-colors">
                  Mark all as read
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quick actions */}
        <Link
          href="/ai-assessment"
          className="hidden sm:flex items-center gap-2 bg-primary hover:opacity-90 active:scale-95 transition-all duration-150 text-white text-xs font-semibold px-3.5 py-2 rounded-lg"
        >
          <Brain size={14} />
          Start Assessment
        </Link>

        {/* Profile chip */}
        <button className="hidden md:flex items-center gap-2 bg-muted border border-border rounded-lg px-3 py-1.5 hover:bg-navy-600 transition-colors duration-150">
          <div className="w-6 h-6 rounded-full bg-primary-gradient flex items-center justify-center text-white text-2xs font-bold">
            SG
          </div>
          <span className="text-xs font-medium text-foreground">Shivansh G.</span>
          <ChevronDown size={12} className="text-muted-foreground" />
        </button>
      </div>

      {/* Backdrop for notifications */}
      {notifOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setNotifOpen(false)}
        />
      )}
    </header>
  );
}
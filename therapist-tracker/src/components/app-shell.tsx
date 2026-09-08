import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import {
  BarChart3,
  CalendarDays,
  LayoutDashboard,
  Settings,
  UserRound,
  Users,
} from 'lucide-react';
import { cn } from '../lib/utils';

const navItems = [
  { to: '/', label: 'Overview', icon: LayoutDashboard },
  { to: '/clients', label: 'Clients', icon: Users },
  { to: '/sessions', label: 'Sessions', icon: UserRound },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/client-dashboard', label: 'Client View', icon: BarChart3 },
];

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--color-accent)]">
              Session Desk
            </p>
            <h1 className="text-lg font-semibold text-[var(--color-ink)]">Therapist Tracker</h1>
          </div>
          <NavLink
            to="/settings"
            className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm text-[var(--color-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
          >
            <Settings className="h-4 w-4" />
            Settings
          </NavLink>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row">
        <nav className="flex shrink-0 gap-2 overflow-x-auto lg:w-56 lg:flex-col">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                cn(
                  'inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium transition',
                  isActive
                    ? 'bg-[var(--color-accent)] text-white shadow-sm'
                    : 'bg-[var(--color-surface)] text-[var(--color-muted)] hover:text-[var(--color-ink)]',
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useCalendlyEvents, useClients, useSessions } from '../hooks/use-data';
import {
  computeMonthlyRevenue,
  computeOverviewStats,
  countUpcomingSessions,
  formatCurrency,
  formatDuration,
  clientSessionCount,
  type UpcomingRange,
} from '../lib/stats';
import { Badge, Button, Card, CardTitle, StatCard } from './ui';

const UPCOMING_RANGES: { value: UpcomingRange; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'tomorrow', label: 'Tomorrow' },
  { value: 'week', label: 'This week' },
  { value: 'month', label: 'This month' },
];

export function OverviewDashboard() {
  const clients = useClients();
  const sessions = useSessions();
  const calendlyEvents = useCalendlyEvents();
  const [upcomingRange, setUpcomingRange] = useState<UpcomingRange>('week');

  const stats = useMemo(
    () => computeOverviewStats(sessions ?? [], clients ?? []),
    [sessions, clients],
  );

  const monthlyRevenue = useMemo(
    () => computeMonthlyRevenue(sessions ?? []),
    [sessions],
  );

  const upcomingCount = useMemo(
    () =>
      countUpcomingSessions(sessions ?? [], calendlyEvents ?? [], upcomingRange),
    [sessions, calendlyEvents, upcomingRange],
  );

  if (!clients || !sessions) {
    return <p className="text-sm text-[var(--color-muted)]">Loading overview…</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-[var(--color-ink)]">Overview</h2>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Practice snapshot and upcoming schedule
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Completed sessions" value={stats.totalSessions} />
        <StatCard label="Total revenue" value={formatCurrency(stats.totalRevenue)} />
        <StatCard
          label="Session time"
          value={formatDuration(stats.totalMinutes)}
          hint="Completed sessions"
        />
        <StatCard label="Clients" value={stats.clientCount} hint={`${stats.introSessions} intro sessions`} />
      </div>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle>Upcoming sessions</CardTitle>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              Open sessions and Calendly bookings
            </p>
          </div>
          <div className="flex flex-wrap gap-1">
            {UPCOMING_RANGES.map((range) => (
              <Button
                key={range.value}
                variant={upcomingRange === range.value ? 'primary' : 'secondary'}
                className="px-3 py-1.5 text-xs"
                onClick={() => setUpcomingRange(range.value)}
              >
                {range.label}
              </Button>
            ))}
          </div>
        </div>
        <p className="mt-4 text-4xl font-semibold text-[var(--color-accent)]">{upcomingCount}</p>
      </Card>

      <Card>
        <CardTitle>Monthly revenue</CardTitle>
        {monthlyRevenue.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--color-muted)]">No completed sessions yet.</p>
        ) : (
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                  labelFormatter={(label) => label}
                />
                <Bar dataKey="revenue" fill="var(--color-accent)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      <Card>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Clients</CardTitle>
          <Link to="/clients">
            <Button variant="secondary" className="text-xs">Manage clients</Button>
          </Link>
        </div>
        {clients.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--color-muted)]">No clients yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-[var(--color-border)]">
            {clients.map((client) => (
              <li key={client.id} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-medium text-[var(--color-ink)]">{client.name}</p>
                  <p className="text-sm text-[var(--color-muted)]">{client.email || client.phone || '—'}</p>
                </div>
                <Badge tone="accent">
                  {clientSessionCount(sessions, client.id)} sessions
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Link } from 'react-router-dom';
import {
  computeMonthlyRevenue,
  computeOverviewStats,
  formatCurrency,
  formatDuration,
} from '../lib/stats';
import { useClients, useSessions } from '../hooks/use-data';
import { Badge, Card, CardTitle, StatCard } from './ui';

export function OverviewDashboard() {
  const clients = useClients();
  const sessions = useSessions();

  const stats = computeOverviewStats(sessions ?? [], clients ?? []);
  const monthly = computeMonthlyRevenue(sessions ?? []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Practice overview</h2>
        <p className="text-sm text-[var(--color-muted)]">
          Dashboard 1 — totals across all clients and sessions.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Sessions completed" value={String(stats.totalSessions)} hint={`${stats.introSessions} intro sessions`} />
        <StatCard label="Revenue" value={formatCurrency(stats.totalRevenue)} hint="From completed sessions" />
        <StatCard label="Time in sessions" value={formatDuration(stats.totalMinutes)} hint="Based on start/end times" />
        <StatCard label="Active clients" value={String(stats.clientCount)} hint="Client profiles on file" />
      </div>

      <Card>
        <CardTitle subtitle="Revenue by month">Monthly revenue</CardTitle>
        {monthly.length > 0 ? (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="revenue" fill="#0d6e6e" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-sm text-[var(--color-muted)]">Complete a session to see revenue trends.</p>
        )}
      </Card>

      <Card>
        <CardTitle subtitle="All clients on file">Patient list</CardTitle>
        <div className="space-y-3">
          {(clients ?? []).map((client) => {
            const clientSessions = (sessions ?? []).filter(
              (s) => s.clientId === client.id && s.status === 'completed',
            );
            const revenue = clientSessions.reduce((sum, s) => sum + s.cost, 0);
            return (
              <div key={client.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-3">
                <div>
                  <p className="font-medium">{client.name}</p>
                  <p className="text-sm text-[var(--color-muted)]">
                    {clientSessions.length} session{clientSessions.length === 1 ? '' : 's'} · {formatCurrency(revenue)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {client.age ? <Badge>{client.age} yrs</Badge> : null}
                  <Link
                    to={`/client-dashboard?clientId=${client.id}`}
                    className="text-sm font-medium text-[var(--color-accent)] hover:underline"
                  >
                    View sessions
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

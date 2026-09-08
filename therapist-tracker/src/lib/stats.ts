import { differenceInMinutes, format, parseISO } from 'date-fns';
import type { Client, Session } from './types';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatSessionDate(iso: string): string {
  return format(parseISO(iso), 'EEE d MMM yyyy');
}

export function formatSessionTime(iso: string): string {
  return format(parseISO(iso), 'h:mm a');
}

export function sessionDurationMinutes(session: Session): number {
  if (!session.endTime) {
    return differenceInMinutes(new Date(), parseISO(session.startTime));
  }
  return differenceInMinutes(parseISO(session.endTime), parseISO(session.startTime));
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

export interface OverviewStats {
  totalSessions: number;
  totalRevenue: number;
  totalMinutes: number;
  clientCount: number;
  introSessions: number;
}

export function computeOverviewStats(sessions: Session[], clients: Client[]): OverviewStats {
  const completed = sessions.filter((s) => s.status === 'completed');
  return {
    totalSessions: completed.length,
    totalRevenue: completed.reduce((sum, s) => sum + s.cost, 0),
    totalMinutes: completed.reduce((sum, s) => sum + sessionDurationMinutes(s), 0),
    clientCount: clients.length,
    introSessions: completed.filter((s) => s.isIntroSession).length,
  };
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
  sessions: number;
}

export function computeMonthlyRevenue(sessions: Session[]): MonthlyRevenue[] {
  const completed = sessions.filter((s) => s.status === 'completed');
  const byMonth = new Map<string, MonthlyRevenue>();

  for (const session of completed) {
    const month = format(parseISO(session.startTime), 'yyyy-MM');
    const label = format(parseISO(session.startTime), 'MMM yyyy');
    const existing = byMonth.get(month) ?? { month: label, revenue: 0, sessions: 0 };
    existing.revenue += session.cost;
    existing.sessions += 1;
    byMonth.set(month, existing);
  }

  return [...byMonth.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, value]) => value);
}

export function clientSessionCount(sessions: Session[], clientId: string): number {
  return sessions.filter((s) => s.clientId === clientId && s.status === 'completed').length;
}

export function clientTotalRevenue(sessions: Session[], clientId: string): number {
  return sessions
    .filter((s) => s.clientId === clientId && s.status === 'completed')
    .reduce((sum, s) => sum + s.cost, 0);
}

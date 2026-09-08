import {
  addDays,
  differenceInMinutes,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  parseISO,
  startOfDay,
} from 'date-fns';
import type { CalendlyEvent, Client, Session } from './types';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
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

export type UpcomingRange = 'today' | 'tomorrow' | 'week' | 'month';

export function upcomingWindow(range: UpcomingRange, now = new Date()): { start: Date; end: Date } {
  const todayStart = startOfDay(now);
  switch (range) {
    case 'today':
      return { start: todayStart, end: endOfDay(now) };
    case 'tomorrow': {
      const tomorrow = addDays(todayStart, 1);
      return { start: tomorrow, end: endOfDay(tomorrow) };
    }
    case 'week':
      return { start: todayStart, end: endOfWeek(now, { weekStartsOn: 1 }) };
    case 'month':
      return { start: todayStart, end: endOfMonth(now) };
  }
}

function isWithinWindow(iso: string, start: Date, end: Date): boolean {
  const time = parseISO(iso).getTime();
  return time >= start.getTime() && time <= end.getTime();
}

export function countUpcomingSessions(
  sessions: Session[],
  calendlyEvents: CalendlyEvent[],
  range: UpcomingRange,
  now = new Date(),
): number {
  const { start, end } = upcomingWindow(range, now);
  const openSessions = sessions.filter(
    (s) => s.status !== 'completed' && isWithinWindow(s.startTime, start, end),
  ).length;
  const bookings = calendlyEvents.filter((e) => isWithinWindow(e.start, start, end)).length;
  return openSessions + bookings;
}

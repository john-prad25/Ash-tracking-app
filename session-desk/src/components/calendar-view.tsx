import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { ChevronLeft, ChevronRight, RefreshCw, Upload } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { useCalendlyEvents, useClientMap, useClients, useSessions, useSettings } from '../hooks/use-data';
import { fetchCalendlyIcal, importCalendlyEvents, parseIcsText } from '../lib/ical';
import { formatCurrency, formatSessionTime } from '../lib/stats';
import type { CalendarEntry } from '../lib/types';
import { cn } from '../lib/utils';
import { Badge, Button, Card, CardTitle, Select } from './ui';

export function CalendarView() {
  const sessions = useSessions();
  const clients = useClients();
  const calendlyEvents = useCalendlyEvents();
  const settings = useSettings();
  const clientMap = useClientMap(clients);

  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [clientFilter, setClientFilter] = useState('');
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [syncing, setSyncing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const entries = useMemo(() => {
    const list: CalendarEntry[] = [];
    for (const session of sessions ?? []) {
      const client = clientMap.get(session.clientId);
      if (clientFilter && session.clientId !== clientFilter) continue;
      list.push({ kind: 'session', session, clientName: client?.name ?? 'Unknown' });
    }
    if (!clientFilter) {
      for (const event of calendlyEvents ?? []) {
        list.push({ kind: 'calendly', event });
      }
    }
    return list;
  }, [sessions, calendlyEvents, clientMap, clientFilter]);

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [month]);

  const entriesForDay = (day: Date) =>
    entries.filter((entry) => {
      const iso = entry.kind === 'session' ? entry.session.startTime : entry.event.start;
      return isSameDay(parseISO(iso), day);
    });

  const selectedEntries = selectedDay ? entriesForDay(selectedDay) : [];

  async function syncCalendly() {
    if (!settings?.calendlyIcalUrl.trim()) {
      window.alert('Add your Calendly iCal URL in Settings first.');
      return;
    }
    setSyncing(true);
    try {
      const events = await fetchCalendlyIcal(settings.calendlyIcalUrl);
      await importCalendlyEvents(events);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Sync failed.');
    } finally {
      setSyncing(false);
    }
  }

  async function handleIcsImport(file: File) {
    try {
      const text = await file.text();
      const events = parseIcsText(text);
      await importCalendlyEvents(events);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Could not parse .ics file.');
    }
  }

  if (!sessions || !clients || !settings) {
    return <p className="text-sm text-[var(--color-muted)]">Loading calendar…</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-[var(--color-ink)]">Calendar</h2>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Sessions and Calendly bookings
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" disabled={syncing} onClick={() => void syncCalendly()}>
            <RefreshCw className={cn('h-4 w-4', syncing && 'animate-spin')} />
            Sync Calendly
          </Button>
          <Button variant="secondary" onClick={() => fileRef.current?.click()}>
            <Upload className="h-4 w-4" />
            Import .ics
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept=".ics,text/calendar"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleIcsImport(file);
              e.target.value = '';
            }}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={clientFilter}
          onChange={(e) => setClientFilter(e.target.value)}
          className="w-auto min-w-[180px]"
        >
          <option value="">All clients</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </Select>
      </div>

      <Card>
        <div className="flex items-center justify-between gap-3">
          <Button variant="ghost" className="px-2" onClick={() => setMonth((m) => addMonths(m, -1))}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <CardTitle>{format(month, 'MMMM yyyy')}</CardTitle>
          <Button variant="ghost" className="px-2" onClick={() => setMonth((m) => addMonths(m, 1))}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs font-medium text-[var(--color-muted)]">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
            <div key={d} className="py-2">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day) => {
            const dayEntries = entriesForDay(day);
            const inMonth = isSameMonth(day, month);
            const isToday = isSameDay(day, new Date());
            const isSelected = selectedDay && isSameDay(day, selectedDay);

            return (
              <button
                key={day.toISOString()}
                type="button"
                onClick={() => setSelectedDay(day)}
                className={cn(
                  'flex min-h-[72px] flex-col rounded-xl border p-1.5 text-left transition',
                  inMonth ? 'bg-[var(--color-surface)]' : 'bg-[var(--color-canvas)] opacity-50',
                  isToday && 'ring-2 ring-[var(--color-accent-soft)]',
                  isSelected && 'border-[var(--color-accent)] bg-[var(--color-accent-soft)]',
                )}
              >
                <span className={cn('text-xs font-medium', isToday && 'text-[var(--color-accent)]')}>
                  {format(day, 'd')}
                </span>
                {dayEntries.length > 0 && (
                  <span className="mt-1 truncate text-[10px] text-[var(--color-accent)]">
                    {dayEntries.length} event{dayEntries.length !== 1 ? 's' : ''}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </Card>

      {selectedDay && (
        <Card>
          <CardTitle>{format(selectedDay, 'EEEE, d MMMM yyyy')}</CardTitle>
          {selectedEntries.length === 0 ? (
            <p className="mt-3 text-sm text-[var(--color-muted)]">No events on this day.</p>
          ) : (
            <ul className="mt-4 divide-y divide-[var(--color-border)]">
              {selectedEntries.map((entry) => {
                if (entry.kind === 'session') {
                  const { session, clientName } = entry;
                  return (
                    <li key={session.id} className="flex flex-wrap items-start justify-between gap-3 py-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium text-[var(--color-ink)]">{clientName}</p>
                          <Badge tone={session.status === 'completed' ? 'success' : 'warning'}>
                            {session.status === 'completed' ? 'Completed' : 'In progress'}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-[var(--color-muted)]">
                          {formatSessionTime(session.startTime)}
                          {session.endTime ? ` – ${formatSessionTime(session.endTime)}` : ''}
                        </p>
                      </div>
                      <span className="text-sm font-medium">{formatCurrency(session.cost)}</span>
                    </li>
                  );
                }

                const { event } = entry;
                return (
                  <li key={event.id} className="flex flex-wrap items-start justify-between gap-3 py-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-[var(--color-ink)]">{event.title}</p>
                        <Badge tone="accent">Calendly</Badge>
                      </div>
                      <p className="mt-1 text-sm text-[var(--color-muted)]">
                        {formatSessionTime(event.start)} – {formatSessionTime(event.end)}
                      </p>
                      {event.location && (
                        <p className="mt-1 text-xs text-[var(--color-muted)]">{event.location}</p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      )}
    </div>
  );
}

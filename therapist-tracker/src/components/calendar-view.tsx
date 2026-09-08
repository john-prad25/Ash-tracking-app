import { useMemo, useState } from 'react';
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
  subMonths,
} from 'date-fns';
import { ChevronLeft, ChevronRight, ExternalLink, RefreshCw } from 'lucide-react';
import { fetchCalendlyIcal, importCalendlyEvents } from '../lib/ical';
import type { CalendarEntry } from '../lib/types';
import { formatSessionTime } from '../lib/stats';
import { useCalendlyEvents, useClientMap, useClients, useSessions, useSettings } from '../hooks/use-data';
import { Badge, Button, Card, CardTitle, Select } from './ui';
import { cn } from '../lib/utils';

export function CalendarView() {
  const clients = useClients();
  const sessions = useSessions();
  const calendlyEvents = useCalendlyEvents();
  const settings = useSettings();
  const clientMap = useClientMap(clients);

  const [month, setMonth] = useState(new Date());
  const [clientFilter, setClientFilter] = useState('all');
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const entries = useMemo(() => {
    const items: CalendarEntry[] = [];

    for (const session of sessions ?? []) {
      const client = clientMap.get(session.clientId);
      if (clientFilter !== 'all' && session.clientId !== clientFilter) continue;
      items.push({
        kind: 'session',
        session,
        clientName: client?.name ?? 'Unknown client',
      });
    }

    if (clientFilter === 'all') {
      for (const event of calendlyEvents ?? []) {
        items.push({ kind: 'calendly', event });
      }
    }

    return items;
  }, [sessions, calendlyEvents, clientFilter, clientMap]);

  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  function entriesForDay(day: Date) {
    return entries.filter((entry) => {
      const iso = entry.kind === 'session' ? entry.session.startTime : entry.event.start;
      return isSameDay(parseISO(iso), day);
    });
  }

  const selectedEntries = selectedDay ? entriesForDay(selectedDay) : [];

  async function syncCalendly() {
    const icalUrl = settings?.calendlyIcalUrl?.trim();
    if (!icalUrl) {
      setSyncMessage('Add your Calendly iCal URL in Settings first.');
      return;
    }

    setSyncing(true);
    setSyncMessage(null);
    try {
      const events = await fetchCalendlyIcal(icalUrl);
      await importCalendlyEvents(events);
      setSyncMessage(`Synced ${events.length} Calendly event${events.length === 1 ? '' : 's'}.`);
    } catch (error) {
      setSyncMessage(error instanceof Error ? error.message : 'Sync failed.');
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Session calendar</h2>
          <p className="text-sm text-[var(--color-muted)]">
            Local sessions plus Calendly bookings from your iCal feed.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {settings?.calendlyBookingUrl ? (
            <a href={settings.calendlyBookingUrl} target="_blank" rel="noreferrer">
              <Button variant="secondary">
                <ExternalLink className="h-4 w-4" />
                Open Calendly
              </Button>
            </a>
          ) : null}
          <Button variant="secondary" onClick={syncCalendly} disabled={syncing}>
            <RefreshCw className={cn('h-4 w-4', syncing && 'animate-spin')} />
            Sync Calendly
          </Button>
        </div>
      </div>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => setMonth(subMonths(month, 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h3 className="min-w-40 text-center text-lg font-semibold">{format(month, 'MMMM yyyy')}</h3>
            <Button variant="ghost" onClick={() => setMonth(addMonths(month, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <FieldRow
            clients={clients ?? []}
            clientFilter={clientFilter}
            onClientFilter={setClientFilter}
          />
        </div>

        {syncMessage ? <p className="mt-3 text-sm text-[var(--color-muted)]">{syncMessage}</p> : null}

        <div className="mt-5 grid grid-cols-7 gap-2 text-center text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>

        <div className="mt-2 grid grid-cols-7 gap-2">
          {days.map((day) => {
            const dayEntries = entriesForDay(day);
            const isSelected = selectedDay ? isSameDay(day, selectedDay) : false;
            return (
              <button
                key={day.toISOString()}
                type="button"
                onClick={() => setSelectedDay(day)}
                className={cn(
                  'min-h-24 rounded-2xl border p-2 text-left transition',
                  !isSameMonth(day, month) && 'bg-stone-50 text-stone-400',
                  isSelected && 'border-[var(--color-accent)] ring-2 ring-[var(--color-accent-soft)]',
                )}
              >
                <div className="text-sm font-medium">{format(day, 'd')}</div>
                <div className="mt-2 space-y-1">
                  {dayEntries.slice(0, 3).map((entry, index) => (
                    <div
                      key={index}
                      className={cn(
                        'truncate rounded-full px-2 py-0.5 text-[10px] font-medium',
                        entry.kind === 'session'
                          ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]'
                          : 'bg-amber-50 text-amber-800',
                      )}
                    >
                      {entry.kind === 'session' ? entry.clientName : entry.event.title}
                    </div>
                  ))}
                  {dayEntries.length > 3 ? (
                    <div className="text-[10px] text-[var(--color-muted)]">+{dayEntries.length - 3} more</div>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      <Card>
        <CardTitle subtitle={selectedDay ? format(selectedDay, 'EEEE d MMMM yyyy') : 'Select a day on the calendar'}>
          Day detail
        </CardTitle>
        {selectedEntries.length === 0 ? (
          <p className="text-sm text-[var(--color-muted)]">No sessions or Calendly bookings for this day.</p>
        ) : (
          <div className="space-y-3">
            {selectedEntries.map((entry, index) => (
              <DayEntry key={index} entry={entry} />
            ))}
          </div>
        )}
      </Card>

      <Card>
        <CardTitle subtitle="Legend">Calendar sources</CardTitle>
        <div className="flex flex-wrap gap-3 text-sm">
          <Badge tone="accent">Teal = local session</Badge>
          <Badge tone="warm">Amber = Calendly booking</Badge>
        </div>
        <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">
          Paste your Calendly secret iCal URL in Settings (Integrations → Calendar sync → Copy link).
          The prototype syncs via iCal feed — no API key required. While developing locally, the Vite dev
          server proxies the request to avoid browser CORS limits.
        </p>
      </Card>
    </div>
  );
}

function FieldRow({
  clients,
  clientFilter,
  onClientFilter,
}: {
  clients: { id: string; name: string }[];
  clientFilter: string;
  onClientFilter: (value: string) => void;
}) {
  return (
    <div className="w-full max-w-xs">
      <Select value={clientFilter} onChange={(e) => onClientFilter(e.target.value)}>
        <option value="all">All clients</option>
        {clients.map((client) => (
          <option key={client.id} value={client.id}>{client.name}</option>
        ))}
      </Select>
    </div>
  );
}

function DayEntry({ entry }: { entry: CalendarEntry }) {
  if (entry.kind === 'calendly') {
    return (
      <div className="rounded-2xl border bg-amber-50/60 px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium">{entry.event.title}</p>
          <Badge tone="warm">Calendly</Badge>
        </div>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          {formatSessionTime(entry.event.start)} – {formatSessionTime(entry.event.end)}
        </p>
        {entry.event.description ? (
          <p className="mt-2 text-sm">{entry.event.description}</p>
        ) : null}
      </div>
    );
  }

  const session = entry.session;
  return (
    <div className="rounded-2xl border px-4 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <p className="font-medium">{entry.clientName}</p>
        <Badge tone="accent">{session.status === 'in_progress' ? 'In progress' : 'Completed'}</Badge>
        {session.isIntroSession ? <Badge tone="neutral">Intro</Badge> : null}
      </div>
      <p className="mt-1 text-sm text-[var(--color-muted)]">
        {formatSessionTime(session.startTime)}
        {session.endTime ? ` – ${formatSessionTime(session.endTime)}` : ''}
        {' · '}
        {session.modality === 'online' ? 'Online' : 'In person'}
        {' · '}
        ${session.cost}
      </p>
      {session.notes ? <p className="mt-2 text-sm leading-6">{session.notes}</p> : null}
    </div>
  );
}

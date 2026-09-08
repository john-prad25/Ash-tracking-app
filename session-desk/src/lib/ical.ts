import ICAL from 'ical.js';
import type { CalendlyEvent } from './types';
import { makeId } from './db';

export function parseIcsText(icsText: string): CalendlyEvent[] {
  const jcal = ICAL.parse(icsText);
  const comp = new ICAL.Component(jcal);
  const events: CalendlyEvent[] = [];

  for (const vevent of comp.getAllSubcomponents('vevent')) {
    const event = new ICAL.Event(vevent);
    const start = event.startDate?.toJSDate();
    const end = event.endDate?.toJSDate();
    if (!start || !end) continue;

    events.push({
      id: `calendly-${event.uid ?? makeId()}`,
      title: event.summary ?? 'Calendly booking',
      start: start.toISOString(),
      end: end.toISOString(),
      description: event.description ?? '',
      location: event.location ?? '',
      source: 'calendly',
    });
  }

  return events.sort((a, b) => a.start.localeCompare(b.start));
}

export async function fetchCalendlyIcal(icalUrl: string): Promise<CalendlyEvent[]> {
  const trimmed = icalUrl.trim();
  if (!trimmed) return [];

  let fetchUrl = trimmed;
  if (trimmed.startsWith('https://calendly.com/')) {
    fetchUrl = `/calendly-ical${trimmed.replace('https://calendly.com', '')}`;
  }

  const response = await fetch(fetchUrl);
  if (!response.ok) {
    throw new Error(`Could not fetch calendar feed (${response.status}). Try importing a .ics file instead.`);
  }

  return parseIcsText(await response.text());
}

export async function importCalendlyEvents(events: CalendlyEvent[]): Promise<void> {
  const { db } = await import('./db');
  await db.calendlyEvents.clear();
  if (events.length > 0) await db.calendlyEvents.bulkPut(events);
}

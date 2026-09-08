import { liveQuery } from 'dexie';
import { useEffect, useState } from 'react';
import { db } from '../lib/db';
import { ensureSettings } from '../lib/seed';
import type { AppSettings, CalendlyEvent, Client, Session } from '../lib/types';

function useLiveQuery<T>(querier: () => Promise<T>, deps: unknown[]): T | undefined {
  const [value, setValue] = useState<T>();
  useEffect(() => {
    const sub = liveQuery(querier).subscribe({
      next: (result) => setValue(result),
      error: (err) => console.error(err),
    });
    return () => sub.unsubscribe();
  }, deps);
  return value;
}

export function useClients(): Client[] | undefined {
  return useLiveQuery(() => db.clients.orderBy('name').toArray(), []);
}

export function useSessions(): Session[] | undefined {
  return useLiveQuery(() => db.sessions.orderBy('startTime').reverse().toArray(), []);
}

export function useCalendlyEvents(): CalendlyEvent[] | undefined {
  return useLiveQuery(() => db.calendlyEvents.orderBy('start').toArray(), []);
}

export function useSettings(): AppSettings | undefined {
  return useLiveQuery(() => ensureSettings(), []);
}

export function useClientMap(clients: Client[] | undefined): Map<string, Client> {
  const map = new Map<string, Client>();
  if (clients) for (const c of clients) map.set(c.id, c);
  return map;
}

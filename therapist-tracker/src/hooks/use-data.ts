import { liveQuery } from 'dexie';
import { useEffect, useState } from 'react';
import { db } from '../lib/db';
import type { CalendlyEvent, Client, Session } from '../lib/types';
import { ensureSettings } from '../lib/seed';
import type { AppSettings } from '../lib/types';

function useLiveQuery<T>(querier: () => Promise<T>, deps: unknown[]): T | undefined {
  const [value, setValue] = useState<T>();

  useEffect(() => {
    const observable = liveQuery(querier);
    const subscription = observable.subscribe({
      next: (result) => setValue(result),
      error: (error) => console.error(error),
    });
    return () => subscription.unsubscribe();
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
  if (clients) {
    for (const client of clients) {
      map.set(client.id, client);
    }
  }
  return map;
}

export async function getActiveSessionForClient(clientId: string): Promise<Session | undefined> {
  return db.sessions.where({ clientId, status: 'in_progress' }).first();
}

export async function getClientSessions(clientId: string): Promise<Session[]> {
  return db.sessions.where('clientId').equals(clientId).reverse().sortBy('startTime');
}

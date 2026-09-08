import Dexie, { type Table } from 'dexie';
import type { AppSettings, CalendlyEvent, Client, Session } from './types';

export class TherapistDB extends Dexie {
  clients!: Table<Client, string>;
  sessions!: Table<Session, string>;
  calendlyEvents!: Table<CalendlyEvent, string>;
  settings!: Table<AppSettings, string>;

  constructor() {
    super('SessionDeskDB');
    this.version(1).stores({
      clients: 'id, name, createdAt',
      sessions: 'id, clientId, startTime, status, createdAt',
      calendlyEvents: 'id, start',
      settings: 'id',
    });
  }
}

export const db = new TherapistDB();

export function makeId(): string {
  return crypto.randomUUID();
}

export function nowIso(): string {
  return new Date().toISOString();
}

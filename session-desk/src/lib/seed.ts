import { addDays, addHours, setHours, setMinutes, startOfDay, subDays } from 'date-fns';
import { db, makeId, nowIso } from './db';
import type { AppSettings, Client, Session } from './types';

const DEFAULT_SETTINGS: AppSettings = {
  id: 'settings',
  practiceName: 'Narrative Therapy Practice',
  defaultSessionCost: 2500,
  calendlyBookingUrl: '',
  calendlyIcalUrl: '',
};

export async function ensureSettings(): Promise<AppSettings> {
  const existing = await db.settings.get('settings');
  if (existing) return existing;
  await db.settings.put(DEFAULT_SETTINGS);
  return DEFAULT_SETTINGS;
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await db.settings.put({ ...settings, id: 'settings' });
}

export async function seedDemoDataIfEmpty(): Promise<boolean> {
  if ((await db.clients.count()) > 0) return false;

  const now = new Date();
  const clients: Client[] = [
    {
      id: makeId(),
      name: 'Sarah Mitchell',
      age: 34,
      gender: 'female',
      email: 'sarah.m@example.com',
      phone: '98765 43210',
      notes: 'Referred by GP. Focus on career transition narrative.',
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
    {
      id: makeId(),
      name: 'James O\'Connor',
      age: 42,
      gender: 'male',
      email: 'james.o@example.com',
      phone: '98765 43211',
      notes: 'Returning client. Working through family-of-origin themes.',
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
    {
      id: makeId(),
      name: 'Priya Sharma',
      age: 28,
      gender: 'female',
      email: 'priya.s@example.com',
      phone: '98765 43212',
      notes: 'Intro session completed. Interested in online sessions.',
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
  ];

  await db.clients.bulkAdd(clients);

  const sessions: Session[] = [
    {
      id: makeId(),
      clientId: clients[0].id,
      startTime: subDays(now, 14).toISOString(),
      endTime: null,
      cost: 2500,
      modality: 'in_person',
      isIntroSession: true,
      notes: 'Introduction session. Explored workplace identity and career narrative.',
      voiceTranscript: '',
      status: 'completed',
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
    {
      id: makeId(),
      clientId: clients[0].id,
      startTime: subDays(now, 7).toISOString(),
      endTime: null,
      cost: 2500,
      modality: 'online',
      isIntroSession: false,
      notes: 'Follow-up. Externalising conversation around perfectionism.',
      voiceTranscript: '',
      status: 'completed',
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
    {
      id: makeId(),
      clientId: clients[1].id,
      startTime: subDays(now, 10).toISOString(),
      endTime: null,
      cost: 2500,
      modality: 'in_person',
      isIntroSession: false,
      notes: 'Continued narrative re-authoring work.',
      voiceTranscript: '',
      status: 'completed',
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
    {
      id: makeId(),
      clientId: clients[2].id,
      startTime: subDays(now, 3).toISOString(),
      endTime: null,
      cost: 2000,
      modality: 'online',
      isIntroSession: true,
      notes: 'Introductory session via Zoom.',
      voiceTranscript: '',
      status: 'completed',
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
    {
      id: makeId(),
      clientId: clients[1].id,
      startTime: addHours(now, 2).toISOString(),
      endTime: null,
      cost: 2500,
      modality: 'online',
      isIntroSession: false,
      notes: '',
      voiceTranscript: '',
      status: 'in_progress',
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
    {
      id: makeId(),
      clientId: clients[2].id,
      startTime: setMinutes(setHours(addDays(startOfDay(now), 1), 11), 0).toISOString(),
      endTime: null,
      cost: 2500,
      modality: 'in_person',
      isIntroSession: false,
      notes: '',
      voiceTranscript: '',
      status: 'in_progress',
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
  ];

  for (const session of sessions) {
    if (session.status === 'completed') {
      const start = new Date(session.startTime);
      session.endTime = new Date(start.getTime() + 50 * 60 * 1000).toISOString();
    }
  }

  await db.sessions.bulkAdd(sessions);
  return true;
}

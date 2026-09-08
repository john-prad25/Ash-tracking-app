import { addDays, subDays } from 'date-fns';
import { db, makeId, nowIso } from './db';
import type { AppSettings, Client, Session } from './types';

const DEFAULT_SETTINGS: AppSettings = {
  id: 'settings',
  practiceName: 'Narrative Therapy Practice',
  defaultSessionCost: 150,
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
  const count = await db.clients.count();
  if (count > 0) return false;

  const now = new Date();
  const clients: Client[] = [
    {
      id: makeId(),
      name: 'Sarah Mitchell',
      age: 34,
      gender: 'female',
      email: 'sarah.m@example.com',
      phone: '0412 345 678',
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
      phone: '0423 456 789',
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
      phone: '0434 567 890',
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
      endTime: addDays(subDays(now, 14), 0).toISOString(),
      cost: 150,
      modality: 'in_person',
      isIntroSession: true,
      notes:
        'Introduction session. Explored presenting concerns around workplace identity. Client articulated desire to "rewrite" the story of their career setback.',
      voiceTranscript: '',
      status: 'completed',
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
    {
      id: makeId(),
      clientId: clients[0].id,
      startTime: subDays(now, 7).toISOString(),
      endTime: subDays(now, 7).toISOString(),
      cost: 150,
      modality: 'online',
      isIntroSession: false,
      notes:
        'Follow-up. Mapped externalising conversation around "The Perfectionist" influence. Client reported reduced anxiety mid-week.',
      voiceTranscript: '',
      status: 'completed',
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
    {
      id: makeId(),
      clientId: clients[1].id,
      startTime: subDays(now, 10).toISOString(),
      endTime: subDays(now, 10).toISOString(),
      cost: 150,
      modality: 'in_person',
      isIntroSession: false,
      notes: 'Continued narrative re-authoring. Identified preferred identity statement.',
      voiceTranscript: '',
      status: 'completed',
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
    {
      id: makeId(),
      clientId: clients[2].id,
      startTime: subDays(now, 3).toISOString(),
      endTime: subDays(now, 3).toISOString(),
      cost: 120,
      modality: 'online',
      isIntroSession: true,
      notes: 'Introductory session via Zoom. Discussed goals and therapeutic fit.',
      voiceTranscript: '',
      status: 'completed',
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
    {
      id: makeId(),
      clientId: clients[0].id,
      startTime: addDays(now, 2).toISOString(),
      endTime: null,
      cost: 150,
      modality: 'in_person',
      isIntroSession: false,
      notes: '',
      voiceTranscript: '',
      status: 'in_progress',
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
  ];

  // Fix end times to be 50 min after start for completed sessions
  for (const session of sessions) {
    if (session.endTime && session.status === 'completed') {
      const start = new Date(session.startTime);
      session.endTime = new Date(start.getTime() + 50 * 60 * 1000).toISOString();
    }
  }

  await db.sessions.bulkAdd(sessions);
  return true;
}

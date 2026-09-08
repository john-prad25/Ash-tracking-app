export type Gender = 'female' | 'male' | 'non-binary' | 'other' | 'prefer-not-to-say';

export type SessionModality = 'in_person' | 'online';

export interface Client {
  id: string;
  name: string;
  age: number | null;
  gender: Gender;
  email: string;
  phone: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  id: string;
  clientId: string;
  startTime: string;
  endTime: string | null;
  cost: number;
  modality: SessionModality;
  isIntroSession: boolean;
  notes: string;
  voiceTranscript: string;
  status: 'in_progress' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface CalendlyEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  description: string;
  location: string;
  source: 'calendly';
}

export interface AppSettings {
  id: 'settings';
  practiceName: string;
  defaultSessionCost: number;
  calendlyBookingUrl: string;
  calendlyIcalUrl: string;
}

export type CalendarEntry =
  | { kind: 'session'; session: Session; clientName: string }
  | { kind: 'calendly'; event: CalendlyEvent };

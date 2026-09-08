import { format } from 'date-fns';
import { CheckCircle2, Mic, MicOff, Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  useClientMap,
  useClients,
  useSessions,
  useSettings,
} from '../hooks/use-data';
import { db, makeId, nowIso } from '../lib/db';
import {
  formatCurrency,
  formatDuration,
  formatSessionDate,
  formatSessionTime,
  sessionDurationMinutes,
} from '../lib/stats';
import {
  createSpeechRecognizer,
  isSpeechRecognitionSupported,
  type SpeechRecognitionLike,
} from '../lib/speech';
import type { Session, SessionModality } from '../lib/types';
import { CreateInvoiceButton } from './invoice-button';
import { Badge, Button, Card, CardTitle, Field, Input, Select, Textarea } from './ui';

export function SessionsView() {
  const sessions = useSessions();
  const clients = useClients();
  const clientMap = useClientMap(clients);
  const settings = useSettings();

  if (!sessions || !clients || !settings) {
    return <p className="text-sm text-[var(--color-muted)]">Loading sessions…</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-[var(--color-ink)]">Sessions</h2>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Track and document therapy sessions
          </p>
        </div>
        <Link to="/sessions/new">
          <Button>
            <Plus className="h-4 w-4" />
            New session
          </Button>
        </Link>
      </div>

      <Card>
        {sessions.length === 0 ? (
          <p className="text-sm text-[var(--color-muted)]">No sessions yet.</p>
        ) : (
          <ul className="divide-y divide-[var(--color-border)]">
            {sessions.map((session) => {
              const client = clientMap.get(session.clientId);
              return (
                <li key={session.id}>
                  <Link
                    to={`/sessions/${session.id}`}
                    className="flex flex-wrap items-center justify-between gap-3 py-4 transition hover:bg-[var(--color-canvas)] -mx-2 px-2 rounded-xl"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-[var(--color-ink)]">
                          {client?.name ?? 'Unknown client'}
                        </p>
                        <Badge tone={session.status === 'completed' ? 'success' : 'warning'}>
                          {session.status === 'completed' ? 'Completed' : 'In progress'}
                        </Badge>
                        {session.isIntroSession && <Badge tone="accent">Intro</Badge>}
                      </div>
                      <p className="mt-1 text-sm text-[var(--color-muted)]">
                        {formatSessionDate(session.startTime)} · {formatSessionTime(session.startTime)}
                        {session.status === 'completed' && ` · ${formatDuration(sessionDurationMinutes(session))}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-[var(--color-ink)]">
                        {formatCurrency(session.cost)}
                      </span>
                      {session.status === 'completed' && client && (
                        <CreateInvoiceButton
                          session={session}
                          client={client}
                          settings={settings}
                          variant="ghost"
                          className="px-2 py-1 text-xs"
                        />
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}

interface SessionFormState {
  clientId: string;
  startTime: string;
  cost: string;
  modality: SessionModality;
  isIntroSession: boolean;
  notes: string;
  voiceTranscript: string;
}

function toLocalInputValue(iso: string): string {
  return format(new Date(iso), "yyyy-MM-dd'T'HH:mm");
}

function fromLocalInputValue(value: string): string {
  return new Date(value).toISOString();
}

function emptyForm(defaultCost: number): SessionFormState {
  const now = new Date();
  now.setMinutes(Math.ceil(now.getMinutes() / 15) * 15, 0, 0);
  return {
    clientId: '',
    startTime: toLocalInputValue(now.toISOString()),
    cost: String(defaultCost),
    modality: 'in_person',
    isIntroSession: false,
    notes: '',
    voiceTranscript: '',
  };
}

export function SessionEditorView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const sessions = useSessions();
  const clients = useClients();
  const settings = useSettings();
  const clientMap = useClientMap(clients);

  const existing = !isNew ? sessions?.find((s) => s.id === id) : undefined;

  const [form, setForm] = useState<SessionFormState | null>(null);
  const [listening, setListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    if (!settings || !clients) return;

    if (isNew) {
      setForm(emptyForm(settings.defaultSessionCost));
      return;
    }

    if (existing) {
      setForm({
        clientId: existing.clientId,
        startTime: toLocalInputValue(existing.startTime),
        cost: String(existing.cost),
        modality: existing.modality,
        isIntroSession: existing.isIntroSession,
        notes: existing.notes,
        voiceTranscript: existing.voiceTranscript,
      });
    }
  }, [isNew, existing, settings, clients]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  if (!clients || !settings || !sessions) {
    return <p className="text-sm text-[var(--color-muted)]">Loading session…</p>;
  }

  if (!isNew && !existing) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-[var(--color-muted)]">Session not found.</p>
        <Link to="/sessions">
          <Button variant="secondary">Back to sessions</Button>
        </Link>
      </div>
    );
  }

  if (!form) {
    return <p className="text-sm text-[var(--color-muted)]">Loading session…</p>;
  }

  const client = form.clientId ? clientMap.get(form.clientId) : undefined;
  const speechSupported = isSpeechRecognitionSupported();
  const isCompleted = existing?.status === 'completed';

  function toggleVoice() {
    if (listening) {
      recognitionRef.current?.stop();
      recognitionRef.current = null;
      setListening(false);
      setInterimText('');
      return;
    }

    try {
      const recognition = createSpeechRecognizer((text, isFinal) => {
        if (isFinal) {
          setForm((f) =>
            f
              ? {
                  ...f,
                  voiceTranscript: [f.voiceTranscript, text].filter(Boolean).join(' ').trim(),
                }
              : f,
          );
          setInterimText('');
        } else {
          setInterimText(text);
        }
      });
      recognition.onend = () => {
        setListening(false);
        setInterimText('');
      };
      recognition.onerror = () => {
        setListening(false);
        setInterimText('');
      };
      recognitionRef.current = recognition;
      recognition.start();
      setListening(true);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Speech recognition unavailable.');
    }
  }

  async function saveSession(overrides?: Partial<Session>) {
    if (!form) return;

    if (!form.clientId) {
      window.alert('Please select a client.');
      return;
    }

    const cost = Number(form.cost);
    if (Number.isNaN(cost) || cost < 0) {
      window.alert('Please enter a valid session cost.');
      return;
    }

    const ts = nowIso();
    const base = {
      clientId: form.clientId,
      startTime: fromLocalInputValue(form.startTime),
      cost,
      modality: form.modality,
      isIntroSession: form.isIntroSession,
      notes: form.notes,
      voiceTranscript: form.voiceTranscript,
      updatedAt: ts,
      ...overrides,
    };

    if (isNew) {
      const newId = makeId();
      await db.sessions.add({
        id: newId,
        endTime: null,
        status: 'in_progress',
        createdAt: ts,
        ...base,
      });
      navigate(`/sessions/${newId}`);
      return;
    }

    if (existing) {
      await db.sessions.update(existing.id, base);
    }
  }

  async function completeSession() {
    if (!existing) return;
    await saveSession({
      status: 'completed',
      endTime: nowIso(),
    });
  }

  async function deleteSession() {
    if (!existing) return;
    if (!window.confirm('Delete this session permanently?')) return;
    await db.sessions.delete(existing.id);
    navigate('/sessions');
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-[var(--color-ink)]">
            {isNew ? 'New session' : 'Session details'}
          </h2>
          {existing && (
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              {formatSessionDate(existing.startTime)} · {formatSessionTime(existing.startTime)}
            </p>
          )}
        </div>
        <Link to="/sessions">
          <Button variant="secondary">Back</Button>
        </Link>
      </div>

      <Card>
        <div className="flex flex-wrap items-center gap-2">
          {existing && (
            <Badge tone={isCompleted ? 'success' : 'warning'}>
              {isCompleted ? 'Completed' : 'In progress'}
            </Badge>
          )}
          {form.isIntroSession && <Badge tone="accent">Intro session</Badge>}
          {existing?.invoiceNumber && (
            <Badge tone="default">Invoiced: {existing.invoiceNumber}</Badge>
          )}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Client">
            <Select
              value={form.clientId}
              onChange={(e) => setForm((f) => ({ ...f!, clientId: e.target.value }))}
              disabled={isCompleted}
            >
              <option value="">Select client…</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </Field>
          <Field label="Start time">
            <Input
              type="datetime-local"
              value={form.startTime}
              onChange={(e) => setForm((f) => ({ ...f!, startTime: e.target.value }))}
              disabled={isCompleted}
            />
          </Field>
          <Field label="Cost (INR)">
            <Input
              type="number"
              min={0}
              value={form.cost}
              onChange={(e) => setForm((f) => ({ ...f!, cost: e.target.value }))}
              disabled={isCompleted}
            />
          </Field>
          <Field label="Modality">
            <Select
              value={form.modality}
              onChange={(e) =>
                setForm((f) => ({ ...f!, modality: e.target.value as SessionModality }))
              }
              disabled={isCompleted}
            >
              <option value="in_person">In person</option>
              <option value="online">Online</option>
            </Select>
          </Field>
          <Field label="Session type" className="sm:col-span-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isIntroSession}
                onChange={(e) => setForm((f) => ({ ...f!, isIntroSession: e.target.checked }))}
                disabled={isCompleted}
                className="rounded border-[var(--color-border)]"
              />
              Introduction session
            </label>
          </Field>
          <Field label="Session notes" className="sm:col-span-2">
            <Textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f!, notes: e.target.value }))}
              placeholder="Clinical notes…"
              disabled={isCompleted}
            />
          </Field>
        </div>

        <div className="mt-6 border-t border-[var(--color-border)] pt-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="text-base">Voice notes</CardTitle>
            {speechSupported && !isCompleted && (
              <Button
                variant={listening ? 'danger' : 'secondary'}
                onClick={toggleVoice}
              >
                {listening ? (
                  <>
                    <MicOff className="h-4 w-4" />
                    Stop recording
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4" />
                    Start voice note
                  </>
                )}
              </Button>
            )}
          </div>
          {!speechSupported && (
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              Voice notes require Chrome or Safari.
            </p>
          )}
          <Textarea
            className="mt-3"
            value={form.voiceTranscript + (interimText ? ` ${interimText}` : '')}
            onChange={(e) => setForm((f) => ({ ...f!, voiceTranscript: e.target.value }))}
            placeholder="Transcribed voice notes appear here…"
            disabled={isCompleted}
          />
          {listening && (
            <p className="mt-2 text-xs text-[var(--color-accent)]">Listening…</p>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {!isCompleted && (
            <>
              <Button onClick={() => void saveSession()}>Save session</Button>
              {existing && (
                <Button variant="primary" onClick={() => void completeSession()}>
                  <CheckCircle2 className="h-4 w-4" />
                  Complete session
                </Button>
              )}
            </>
          )}
          {isCompleted && client && existing && settings && (
            <CreateInvoiceButton
              session={existing}
              client={client}
              settings={settings}
            />
          )}
          {existing && !isCompleted && (
            <Button variant="danger" onClick={() => void deleteSession()}>
              Delete
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}

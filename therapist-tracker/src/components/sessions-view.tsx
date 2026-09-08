import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Mic, MicOff, Save, Square } from 'lucide-react';
import { db, makeId, nowIso } from '../lib/db';
import { createSpeechRecognizer, isSpeechRecognitionSupported } from '../lib/speech';
import type { Session, SessionModality } from '../lib/types';
import { formatSessionDate, formatSessionTime, sessionDurationMinutes } from '../lib/stats';
import { useClients, useSessions } from '../hooks/use-data';
import { Badge, Button, Card, CardTitle, Field, Input, Select, Textarea } from './ui';

export function SessionsView() {
  const sessions = useSessions();
  const clients = useClients();
  const clientMap = new Map((clients ?? []).map((c) => [c.id, c]));

  const active = (sessions ?? []).filter((s) => s.status === 'in_progress');
  const completed = (sessions ?? []).filter((s) => s.status === 'completed');

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Sessions</h2>
          <p className="text-sm text-[var(--color-muted)]">Start, complete, and review therapy sessions.</p>
        </div>
        <Link to="/sessions/new">
          <Button>Start new session</Button>
        </Link>
      </div>

      {active.length > 0 ? (
        <Card>
          <CardTitle subtitle="Sessions currently in progress">Active</CardTitle>
          <div className="space-y-3">
            {active.map((session) => (
              <SessionRow key={session.id} session={session} clientName={clientMap.get(session.clientId)?.name ?? 'Unknown'} />
            ))}
          </div>
        </Card>
      ) : null}

      <Card>
        <CardTitle subtitle="Completed sessions, newest first">History</CardTitle>
        <div className="space-y-3">
          {completed.map((session) => (
            <SessionRow key={session.id} session={session} clientName={clientMap.get(session.clientId)?.name ?? 'Unknown'} />
          ))}
          {completed.length === 0 ? (
            <p className="text-sm text-[var(--color-muted)]">No completed sessions yet.</p>
          ) : null}
        </div>
      </Card>
    </div>
  );
}

function SessionRow({ session, clientName }: { session: Session; clientName: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-3">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium">{clientName}</p>
          <Badge tone={session.status === 'in_progress' ? 'warm' : 'accent'}>
            {session.status === 'in_progress' ? 'In progress' : 'Completed'}
          </Badge>
          {session.isIntroSession ? <Badge tone="neutral">Intro</Badge> : null}
          <Badge tone="neutral">{session.modality === 'online' ? 'Online' : 'In person'}</Badge>
        </div>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          {formatSessionDate(session.startTime)} · {formatSessionTime(session.startTime)}
          {session.endTime ? ` – ${formatSessionTime(session.endTime)}` : ''}
          {' · '}
          {sessionDurationMinutes(session)} min
        </p>
      </div>
      <Link to={`/sessions/${session.id}`}>
        <Button variant="secondary">{session.status === 'in_progress' ? 'Continue' : 'View'}</Button>
      </Link>
    </div>
  );
}

export function SessionEditorView() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const clients = useClients();
  const sessions = useSessions();

  const { sessionId } = useParams();
  const isNew = !sessionId || sessionId === 'new';
  const existing = !isNew ? (sessions ?? []).find((s) => s.id === sessionId) : undefined;

  const [clientId, setClientId] = useState(searchParams.get('clientId') ?? '');
  const [cost, setCost] = useState(150);
  const [modality, setModality] = useState<SessionModality>('in_person');
  const [isIntroSession, setIsIntroSession] = useState(false);
  const [notes, setNotes] = useState('');
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [startTime, setStartTime] = useState<string | null>(null);
  const [endTime, setEndTime] = useState<string | null>(null);
  const [status, setStatus] = useState<'in_progress' | 'completed'>('in_progress');
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  const recognitionRef = useRef<ReturnType<typeof createSpeechRecognizer> | null>(null);
  const speechSupported = isSpeechRecognitionSupported();

  useEffect(() => {
    if (existing) {
      setClientId(existing.clientId);
      setCost(existing.cost);
      setModality(existing.modality);
      setIsIntroSession(existing.isIntroSession);
      setNotes(existing.notes);
      setVoiceTranscript(existing.voiceTranscript);
      setStartTime(existing.startTime);
      setEndTime(existing.endTime);
      setStatus(existing.status);
      setCurrentSessionId(existing.id);
    }
  }, [existing?.id]);

  async function ensureSessionStarted() {
    if (currentSessionId) return currentSessionId;
    if (!clientId) {
      alert('Please select a client.');
      return null;
    }

    const id = makeId();
    const started = nowIso();
    await db.sessions.add({
      id,
      clientId,
      startTime: started,
      endTime: null,
      cost,
      modality,
      isIntroSession,
      notes,
      voiceTranscript,
      status: 'in_progress',
      createdAt: started,
      updatedAt: started,
    });

    setCurrentSessionId(id);
    setStartTime(started);
    setStatus('in_progress');
    navigate(`/sessions/${id}`, { replace: true });
    return id;
  }

  async function saveDraft() {
    const id = await ensureSessionStarted();
    if (!id) return;

    await db.sessions.update(id, {
      clientId,
      cost,
      modality,
      isIntroSession,
      notes,
      voiceTranscript,
      updatedAt: nowIso(),
    });
  }

  function startRecording() {
    if (!speechSupported) {
      alert('Voice transcription requires Chrome or Safari on macOS.');
      return;
    }

    const recognition = createSpeechRecognizer((text, isFinal) => {
      if (isFinal) {
        setVoiceTranscript((prev) => `${prev}${prev ? ' ' : ''}${text.trim()}`);
        setInterimTranscript('');
      } else {
        setInterimTranscript(text);
      }
    });

    recognition.onend = () => {
      if (isRecording) {
        try {
          recognition.start();
        } catch {
          setIsRecording(false);
        }
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  }

  function stopRecording() {
    setIsRecording(false);
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setInterimTranscript('');
  }

  async function completeSession() {
    const id = await ensureSessionStarted();
    if (!id) return;

    stopRecording();
    const ended = nowIso();
    await db.sessions.update(id, {
      clientId,
      cost,
      modality,
      isIntroSession,
      notes,
      voiceTranscript,
      endTime: ended,
      status: 'completed',
      updatedAt: ended,
    });

    setEndTime(ended);
    setStatus('completed');
    navigate('/sessions');
  }

  const selectedClient = (clients ?? []).find((c) => c.id === clientId);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">
          {status === 'completed' ? 'Session details' : isNew ? 'Start session' : 'Continue session'}
        </h2>
        <p className="text-sm text-[var(--color-muted)]">
          {selectedClient ? `With ${selectedClient.name}` : 'Select a client and capture session notes.'}
        </p>
      </div>

      <Card>
        <CardTitle subtitle="Session setup">Details</CardTitle>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Client">
            <Select
              value={clientId}
              disabled={status === 'completed'}
              onChange={(e) => setClientId(e.target.value)}
            >
              <option value="">Select client...</option>
              {(clients ?? []).map((client) => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </Select>
          </Field>
          <Field label="Session cost (AUD)">
            <Input
              type="number"
              min={0}
              value={cost}
              disabled={status === 'completed'}
              onChange={(e) => setCost(Number(e.target.value))}
            />
          </Field>
          <Field label="Modality">
            <Select
              value={modality}
              disabled={status === 'completed'}
              onChange={(e) => setModality(e.target.value as SessionModality)}
            >
              <option value="in_person">In person</option>
              <option value="online">Online</option>
            </Select>
          </Field>
          <Field label="Introduction session">
            <Select
              value={isIntroSession ? 'yes' : 'no'}
              disabled={status === 'completed'}
              onChange={(e) => setIsIntroSession(e.target.value === 'yes')}
            >
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </Select>
          </Field>
        </div>

        {startTime ? (
          <p className="mt-4 text-sm text-[var(--color-muted)]">
            Started {formatSessionDate(startTime)} at {formatSessionTime(startTime)}
            {endTime ? ` · Ended ${formatSessionTime(endTime)}` : ''}
          </p>
        ) : null}
      </Card>

      <Card>
        <CardTitle subtitle="Typed notes and live voice transcription">Post-session notes</CardTitle>
        <div className="space-y-4">
          <Field label="Session notes">
            <Textarea
              value={notes}
              disabled={status === 'completed'}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Key themes, interventions, follow-up plans..."
            />
          </Field>

          <div className="rounded-2xl border bg-stone-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-medium">Voice notes</p>
                <p className="text-sm text-[var(--color-muted)]">
                  {speechSupported
                    ? 'Speak and your words will be transcribed locally in the browser.'
                    : 'Voice transcription is unavailable in this browser. Use Chrome or Safari on your Mac.'}
                </p>
              </div>
              {status !== 'completed' ? (
                <div className="flex gap-2">
                  {isRecording ? (
                    <Button variant="danger" onClick={stopRecording}>
                      <Square className="h-4 w-4" />
                      Stop
                    </Button>
                  ) : (
                    <Button variant="secondary" onClick={startRecording} disabled={!speechSupported}>
                      <Mic className="h-4 w-4" />
                      Start voice note
                    </Button>
                  )}
                </div>
              ) : null}
            </div>

            {isRecording ? (
              <div className="mt-3 flex items-center gap-2 text-sm text-red-700">
                <MicOff className="h-4 w-4" />
                Recording… speak clearly near the microphone.
              </div>
            ) : null}

            <Textarea
              className="mt-4"
              value={`${voiceTranscript}${interimTranscript ? ` ${interimTranscript}` : ''}`}
              onChange={(e) => {
                setVoiceTranscript(e.target.value);
                setInterimTranscript('');
              }}
              disabled={status === 'completed' && !voiceTranscript}
              placeholder="Transcribed voice notes appear here. You can edit the text at any time."
            />
          </div>
        </div>
      </Card>

      <div className="flex flex-wrap gap-3">
        {status !== 'completed' ? (
          <>
            <Button onClick={ensureSessionStarted}>Start session timer</Button>
            <Button variant="secondary" onClick={saveDraft}>
              <Save className="h-4 w-4" />
              Save draft
            </Button>
            <Button onClick={completeSession}>Complete session</Button>
          </>
        ) : (
          <Link to="/sessions">
            <Button variant="secondary">Back to sessions</Button>
          </Link>
        )}
      </div>
    </div>
  );
}

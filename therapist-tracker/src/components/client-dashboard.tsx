import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  clientSessionCount,
  clientTotalRevenue,
  formatCurrency,
  formatSessionDate,
  formatSessionTime,
  sessionDurationMinutes,
} from '../lib/stats';
import type { Session } from '../lib/types';
import { useClients, useSessions } from '../hooks/use-data';
import { Badge, Card, CardTitle, Select } from './ui';
import { cn } from '../lib/utils';

export function ClientDashboard() {
  const clients = useClients();
  const sessions = useSessions();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialClientId = searchParams.get('clientId') ?? clients?.[0]?.id ?? '';
  const [clientId, setClientId] = useState(initialClientId);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  const client = (clients ?? []).find((c) => c.id === clientId);
  const clientSessions = useMemo(
    () =>
      (sessions ?? [])
        .filter((s) => s.clientId === clientId && s.status === 'completed')
        .sort((a, b) => b.startTime.localeCompare(a.startTime)),
    [sessions, clientId],
  );

  const selectedSession =
    clientSessions.find((s) => s.id === selectedSessionId) ?? clientSessions[0] ?? null;

  function handleClientChange(nextId: string) {
    setClientId(nextId);
    setSelectedSessionId(null);
    setSearchParams(nextId ? { clientId: nextId } : {});
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Client dashboard</h2>
        <p className="text-sm text-[var(--color-muted)]">
          Dashboard 2 — select a client, browse sessions newest first, and view notes in one click.
        </p>
      </div>

      <Card>
        <div className="grid gap-4 md:grid-cols-[280px_1fr]">
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-sm font-medium">Select client</p>
              <Select value={clientId} onChange={(e) => handleClientChange(e.target.value)}>
                <option value="">Choose client...</option>
                {(clients ?? []).map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>
            </div>

            {client ? (
              <div className="rounded-2xl border bg-stone-50 p-4 text-sm">
                <p className="font-medium">{client.name}</p>
                <p className="mt-2 text-[var(--color-muted)]">
                  {clientSessionCount(sessions ?? [], client.id)} completed sessions
                </p>
                <p className="text-[var(--color-muted)]">
                  {formatCurrency(clientTotalRevenue(sessions ?? [], client.id))} total revenue
                </p>
                {client.notes ? (
                  <p className="mt-3 leading-6 text-[var(--color-ink)]">{client.notes}</p>
                ) : null}
              </div>
            ) : null}

            <div>
              <p className="mb-2 text-sm font-medium">Sessions (newest first)</p>
              <div className="space-y-2">
                {clientSessions.map((session) => (
                  <button
                    key={session.id}
                    type="button"
                    onClick={() => setSelectedSessionId(session.id)}
                    className={cn(
                      'w-full rounded-2xl border px-3 py-3 text-left transition',
                      selectedSession?.id === session.id
                        ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)]'
                        : 'hover:border-[var(--color-accent)]',
                    )}
                  >
                    <p className="text-sm font-medium">{formatSessionDate(session.startTime)}</p>
                    <p className="text-xs text-[var(--color-muted)]">
                      {formatSessionTime(session.startTime)} · {session.modality === 'online' ? 'Online' : 'In person'}
                    </p>
                  </button>
                ))}
                {client && clientSessions.length === 0 ? (
                  <p className="text-sm text-[var(--color-muted)]">No completed sessions for this client yet.</p>
                ) : null}
              </div>
            </div>
          </div>

          <div>
            <CardTitle subtitle="One-click session notes">Session detail</CardTitle>
            {selectedSession && client ? (
              <SessionDetail session={selectedSession} clientName={client.name} />
            ) : (
              <p className="text-sm text-[var(--color-muted)]">Select a client and session to view notes.</p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

function SessionDetail({ session, clientName }: { session: Session; clientName: string }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-lg font-semibold">{clientName}</h3>
        <Badge tone="accent">{formatSessionDate(session.startTime)}</Badge>
        {session.isIntroSession ? <Badge tone="warm">Intro session</Badge> : null}
        <Badge tone="neutral">{session.modality === 'online' ? 'Online' : 'In person'}</Badge>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Info label="Start" value={formatSessionTime(session.startTime)} />
        <Info label="End" value={session.endTime ? formatSessionTime(session.endTime) : '—'} />
        <Info label="Duration" value={`${sessionDurationMinutes(session)} min`} />
        <Info label="Cost" value={formatCurrency(session.cost)} />
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">Session notes</p>
        <div className="rounded-2xl border bg-white p-4 text-sm leading-7">
          {session.notes || 'No typed notes for this session.'}
        </div>
      </div>

      {session.voiceTranscript ? (
        <div>
          <p className="mb-2 text-sm font-medium">Voice transcript</p>
          <div className="rounded-2xl border bg-stone-50 p-4 text-sm leading-7">
            {session.voiceTranscript}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-[var(--color-muted)]">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}

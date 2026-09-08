import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useClientMap, useClients, useSessions, useSettings } from '../hooks/use-data';
import {
  clientTotalRevenue,
  formatCurrency,
  formatDuration,
  formatSessionDate,
  formatSessionTime,
  sessionDurationMinutes,
} from '../lib/stats';
import { CreateInvoiceButton } from './invoice-button';
import { Badge, Card, CardTitle, Field, Select, StatCard } from './ui';

export function ClientDashboard() {
  const clients = useClients();
  const sessions = useSessions();
  const settings = useSettings();
  const clientMap = useClientMap(clients);

  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  const clientSessions = useMemo(() => {
    if (!sessions || !selectedClientId) return [];
    return sessions
      .filter((s) => s.clientId === selectedClientId)
      .sort((a, b) => b.startTime.localeCompare(a.startTime));
  }, [sessions, selectedClientId]);

  const selectedClient = selectedClientId ? clientMap.get(selectedClientId) : undefined;
  const selectedSession = selectedSessionId
    ? clientSessions.find((s) => s.id === selectedSessionId)
    : clientSessions[0];

  if (!clients || !sessions || !settings) {
    return <p className="text-sm text-[var(--color-muted)]">Loading client view…</p>;
  }

  const completedCount = clientSessions.filter((s) => s.status === 'completed').length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-[var(--color-ink)]">Client View</h2>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Focus on one client&apos;s session history
        </p>
      </div>

      <Field label="Select client">
        <Select
          value={selectedClientId}
          onChange={(e) => {
            setSelectedClientId(e.target.value);
            setSelectedSessionId(null);
          }}
        >
          <option value="">Choose a client…</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </Select>
      </Field>

      {!selectedClient ? (
        <Card>
          <p className="text-sm text-[var(--color-muted)]">
            Select a client to view their sessions and details.
          </p>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Sessions" value={clientSessions.length} hint={`${completedCount} completed`} />
            <StatCard
              label="Revenue"
              value={formatCurrency(clientTotalRevenue(sessions, selectedClientId))}
            />
            <StatCard label="Contact" value={selectedClient.email || selectedClient.phone || '—'} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardTitle>Sessions</CardTitle>
              {clientSessions.length === 0 ? (
                <p className="mt-3 text-sm text-[var(--color-muted)]">No sessions for this client.</p>
              ) : (
                <ul className="mt-3 divide-y divide-[var(--color-border)]">
                  {clientSessions.map((session) => (
                    <li key={session.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedSessionId(session.id)}
                        className="w-full py-3 text-left transition hover:bg-[var(--color-canvas)] -mx-2 px-2 rounded-xl"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium text-[var(--color-ink)]">
                            {formatSessionDate(session.startTime)}
                          </p>
                          <Badge tone={session.status === 'completed' ? 'success' : 'warning'}>
                            {session.status === 'completed' ? 'Done' : 'Open'}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-[var(--color-muted)]">
                          {formatSessionTime(session.startTime)} · {formatCurrency(session.cost)}
                        </p>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card>
              <CardTitle>Session detail</CardTitle>
              {!selectedSession ? (
                <p className="mt-3 text-sm text-[var(--color-muted)]">Select a session to view details.</p>
              ) : (
                <div className="mt-4 space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={selectedSession.status === 'completed' ? 'success' : 'warning'}>
                      {selectedSession.status === 'completed' ? 'Completed' : 'In progress'}
                    </Badge>
                    {selectedSession.isIntroSession && <Badge tone="accent">Intro</Badge>}
                    <Badge>
                      {selectedSession.modality === 'online' ? 'Online' : 'In person'}
                    </Badge>
                  </div>

                  <dl className="grid gap-2 text-sm">
                    <div className="flex justify-between gap-4">
                      <dt className="text-[var(--color-muted)]">Date</dt>
                      <dd>{formatSessionDate(selectedSession.startTime)}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-[var(--color-muted)]">Time</dt>
                      <dd>
                        {formatSessionTime(selectedSession.startTime)}
                        {selectedSession.endTime && ` – ${formatSessionTime(selectedSession.endTime)}`}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-[var(--color-muted)]">Duration</dt>
                      <dd>{formatDuration(sessionDurationMinutes(selectedSession))}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-[var(--color-muted)]">Cost</dt>
                      <dd className="font-medium">{formatCurrency(selectedSession.cost)}</dd>
                    </div>
                  </dl>

                  {selectedSession.notes && (
                    <div>
                      <p className="text-sm font-medium text-[var(--color-muted)]">Notes</p>
                      <p className="mt-1 text-sm whitespace-pre-wrap">{selectedSession.notes}</p>
                    </div>
                  )}

                  {selectedSession.voiceTranscript && (
                    <div>
                      <p className="text-sm font-medium text-[var(--color-muted)]">Voice transcript</p>
                      <p className="mt-1 text-sm whitespace-pre-wrap">{selectedSession.voiceTranscript}</p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 pt-2">
                    <Link to={`/sessions/${selectedSession.id}`}>
                      <Badge tone="accent" className="cursor-pointer px-3 py-1.5">
                        Open in editor
                      </Badge>
                    </Link>
                    {selectedSession.status === 'completed' && (
                      <CreateInvoiceButton
                        session={selectedSession}
                        client={selectedClient}
                        settings={settings}
                      />
                    )}
                  </div>
                </div>
              )}
            </Card>
          </div>

          {selectedClient.notes && (
            <Card>
              <CardTitle>Client notes</CardTitle>
              <p className="mt-3 text-sm whitespace-pre-wrap text-[var(--color-ink)]">
                {selectedClient.notes}
              </p>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

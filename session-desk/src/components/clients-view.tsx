import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useClients } from '../hooks/use-data';
import { db, makeId, nowIso } from '../lib/db';
import type { Client, Gender } from '../lib/types';
import { Badge, Button, Card, CardTitle, Field, Input, Select, Textarea } from './ui';

const GENDERS: { value: Gender; label: string }[] = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'non-binary', label: 'Non-binary' },
  { value: 'other', label: 'Other' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say' },
];

const EMPTY_FORM = {
  name: '',
  age: '',
  gender: 'prefer-not-to-say' as Gender,
  email: '',
  phone: '',
  notes: '',
};

export function ClientsView() {
  const clients = useClients();
  const [editing, setEditing] = useState<Client | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setCreating(true);
  }

  function openEdit(client: Client) {
    setCreating(false);
    setEditing(client);
    setForm({
      name: client.name,
      age: client.age != null ? String(client.age) : '',
      gender: client.gender,
      email: client.email,
      phone: client.phone,
      notes: client.notes,
    });
  }

  function closeForm() {
    setCreating(false);
    setEditing(null);
    setForm(EMPTY_FORM);
  }

  async function handleSave() {
    if (!form.name.trim()) {
      window.alert('Name is required.');
      return;
    }

    const age = form.age.trim() ? Number(form.age) : null;
    if (form.age.trim() && (age === null || Number.isNaN(age) || age < 0)) {
      window.alert('Please enter a valid age.');
      return;
    }

    const payload = {
      name: form.name.trim(),
      age,
      gender: form.gender,
      email: form.email.trim(),
      phone: form.phone.trim(),
      notes: form.notes.trim(),
      updatedAt: nowIso(),
    };

    if (editing) {
      await db.clients.update(editing.id, payload);
    } else {
      const ts = nowIso();
      await db.clients.add({
        id: makeId(),
        ...payload,
        createdAt: ts,
      });
    }

    closeForm();
  }

  async function handleDelete(client: Client) {
    const sessionCount = await db.sessions.where('clientId').equals(client.id).count();
    const message =
      sessionCount > 0
        ? `Delete ${client.name}? This client has ${sessionCount} session(s) that will also be removed.`
        : `Delete ${client.name}?`;
    if (!window.confirm(message)) return;

    await db.transaction('rw', db.sessions, db.clients, async () => {
      await db.sessions.where('clientId').equals(client.id).delete();
      await db.clients.delete(client.id);
    });

    if (editing?.id === client.id) closeForm();
  }

  if (!clients) {
    return <p className="text-sm text-[var(--color-muted)]">Loading clients…</p>;
  }

  const showForm = creating || editing;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-[var(--color-ink)]">Clients</h2>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Manage your client directory
          </p>
        </div>
        {!showForm && (
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Add client
          </Button>
        )}
      </div>

      {showForm && (
        <Card>
          <CardTitle>{editing ? 'Edit client' : 'New client'}</CardTitle>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Name">
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Full name"
              />
            </Field>
            <Field label="Age">
              <Input
                type="number"
                min={0}
                value={form.age}
                onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))}
                placeholder="Optional"
              />
            </Field>
            <Field label="Gender">
              <Select
                value={form.gender}
                onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value as Gender }))}
              >
                {GENDERS.map((g) => (
                  <option key={g.value} value={g.value}>{g.label}</option>
                ))}
              </Select>
            </Field>
            <Field label="Email">
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="email@example.com"
              />
            </Field>
            <Field label="Phone" className="sm:col-span-2">
              <Input
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="Phone number"
              />
            </Field>
            <Field label="Notes" className="sm:col-span-2">
              <Textarea
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="Clinical notes, referral context…"
              />
            </Field>
          </div>
          <div className="mt-4 flex gap-2">
            <Button onClick={() => void handleSave()}>Save client</Button>
            <Button variant="secondary" onClick={closeForm}>Cancel</Button>
          </div>
        </Card>
      )}

      <Card>
        {clients.length === 0 ? (
          <p className="text-sm text-[var(--color-muted)]">No clients yet. Add your first client above.</p>
        ) : (
          <ul className="divide-y divide-[var(--color-border)]">
            {clients.map((client) => (
              <li key={client.id} className="flex flex-wrap items-start justify-between gap-3 py-4 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-[var(--color-ink)]">{client.name}</p>
                    {client.age != null && (
                      <Badge>{client.age} yrs</Badge>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-[var(--color-muted)]">
                    {[client.email, client.phone].filter(Boolean).join(' · ') || 'No contact info'}
                  </p>
                  {client.notes && (
                    <p className="mt-2 text-sm text-[var(--color-ink)] line-clamp-2">{client.notes}</p>
                  )}
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button variant="secondary" className="px-3" onClick={() => openEdit(client)}>
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button variant="danger" className="px-3" onClick={() => void handleDelete(client)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

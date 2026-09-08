import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Plus, UserRound } from 'lucide-react';
import { db, makeId, nowIso } from '../lib/db';
import type { Client, Gender } from '../lib/types';
import { useClients } from '../hooks/use-data';
import { Badge, Button, Card, CardTitle, Field, Input, Select, Textarea } from './ui';

const genderOptions: { value: Gender; label: string }[] = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'non-binary', label: 'Non-binary' },
  { value: 'other', label: 'Other' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say' },
];

const emptyClient = (): Omit<Client, 'id' | 'createdAt' | 'updatedAt'> => ({
  name: '',
  age: null,
  gender: 'prefer-not-to-say',
  email: '',
  phone: '',
  notes: '',
});

export function ClientsView() {
  const clients = useClients();
  const [editing, setEditing] = useState<Client | null>(null);
  const [form, setForm] = useState(emptyClient());
  const [showForm, setShowForm] = useState(false);

  function openCreate() {
    setEditing(null);
    setForm(emptyClient());
    setShowForm(true);
  }

  function openEdit(client: Client) {
    setEditing(client);
    setForm({
      name: client.name,
      age: client.age,
      gender: client.gender,
      email: client.email,
      phone: client.phone,
      notes: client.notes,
    });
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.name.trim()) return;

    const timestamp = nowIso();
    if (editing) {
      await db.clients.update(editing.id, {
        ...form,
        age: form.age ? Number(form.age) : null,
        updatedAt: timestamp,
      });
    } else {
      await db.clients.add({
        id: makeId(),
        ...form,
        age: form.age ? Number(form.age) : null,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    }

    setShowForm(false);
    setEditing(null);
    setForm(emptyClient());
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Clients</h2>
          <p className="text-sm text-[var(--color-muted)]">
            Manage client profiles and start sessions from here.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Add client
        </Button>
      </div>

      {showForm ? (
        <Card>
          <CardTitle subtitle={editing ? 'Update client details' : 'Create a new client profile'}>
            {editing ? 'Edit client' : 'New client'}
          </CardTitle>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Full name">
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Sarah Mitchell"
              />
            </Field>
            <Field label="Age">
              <Input
                type="number"
                min={0}
                value={form.age ?? ''}
                onChange={(e) =>
                  setForm((f) => ({ ...f, age: e.target.value ? Number(e.target.value) : null }))
                }
              />
            </Field>
            <Field label="Gender">
              <Select
                value={form.gender}
                onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value as Gender }))}
              >
                {genderOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Email">
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </Field>
            <Field label="Phone">
              <Input
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
            </Field>
            <div className="md:col-span-2">
              <Field label="Notes">
                <Textarea
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="Referral source, presenting concerns, preferences..."
                />
              </Field>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button onClick={handleSave}>{editing ? 'Save changes' : 'Create client'}</Button>
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </Card>
      ) : null}

      <div className="grid gap-4">
        {(clients ?? []).map((client) => (
          <Card key={client.id}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-semibold">{client.name}</h3>
                  {client.age ? <Badge>{client.age} yrs</Badge> : null}
                  <Badge tone="neutral">{client.gender.replace(/-/g, ' ')}</Badge>
                </div>
                <p className="text-sm text-[var(--color-muted)]">
                  {[client.email, client.phone].filter(Boolean).join(' · ') || 'No contact details'}
                </p>
                {client.notes ? (
                  <p className="max-w-2xl text-sm leading-6 text-[var(--color-ink)]">{client.notes}</p>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" onClick={() => openEdit(client)}>
                  <Pencil className="h-4 w-4" />
                  Edit
                </Button>
                <Link to={`/sessions/new?clientId=${client.id}`}>
                  <Button>
                    <UserRound className="h-4 w-4" />
                    Start session
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        ))}
        {clients && clients.length === 0 ? (
          <Card>
            <p className="text-sm text-[var(--color-muted)]">No clients yet. Add your first client to get started.</p>
          </Card>
        ) : null}
      </div>
    </div>
  );
}

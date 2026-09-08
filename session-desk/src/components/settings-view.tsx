import { ExternalLink, Save, Upload } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useSettings } from '../hooks/use-data';
import { fetchCalendlyIcal, importCalendlyEvents, parseIcsText } from '../lib/ical';
import { saveSettings } from '../lib/seed';
import type { AppSettings } from '../lib/types';
import { Button, Card, CardTitle, Field, Input } from './ui';

export function SettingsView() {
  const settings = useSettings();
  const [form, setForm] = useState<AppSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (settings) setForm(settings);
  }, [settings]);

  if (!form) {
    return <p className="text-sm text-[var(--color-muted)]">Loading settings…</p>;
  }

  async function handleSave() {
    if (!form) return;
    if (!form.practiceName.trim()) {
      window.alert('Practice name is required.');
      return;
    }
    setSaving(true);
    try {
      await saveSettings(form);
    } finally {
      setSaving(false);
    }
  }

  async function syncCalendly() {
    if (!form) return;
    if (!form.calendlyIcalUrl.trim()) {
      window.alert('Enter a Calendly iCal URL first.');
      return;
    }
    setSyncing(true);
    try {
      const events = await fetchCalendlyIcal(form.calendlyIcalUrl);
      await importCalendlyEvents(events);
      window.alert(`Imported ${events.length} Calendly event(s).`);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Sync failed.');
    } finally {
      setSyncing(false);
    }
  }

  async function handleIcsImport(file: File) {
    try {
      const text = await file.text();
      const events = parseIcsText(text);
      await importCalendlyEvents(events);
      window.alert(`Imported ${events.length} event(s) from file.`);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Could not parse .ics file.');
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-[var(--color-ink)]">Settings</h2>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Practice details and calendar integration
        </p>
      </div>

      <Card>
        <CardTitle>Practice</CardTitle>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Practice name" className="sm:col-span-2">
            <Input
              value={form.practiceName}
              onChange={(e) => setForm((f) => f && { ...f, practiceName: e.target.value })}
            />
          </Field>
          <Field label="Default session cost (INR)">
            <Input
              type="number"
              min={0}
              value={form.defaultSessionCost}
              onChange={(e) =>
                setForm((f) => f && { ...f, defaultSessionCost: Number(e.target.value) || 0 })
              }
            />
          </Field>
        </div>
        <div className="mt-4">
          <Button disabled={saving} onClick={() => void handleSave()}>
            <Save className="h-4 w-4" />
            {saving ? 'Saving…' : 'Save settings'}
          </Button>
        </div>
      </Card>

      <Card>
        <CardTitle>Calendly</CardTitle>
        <div className="mt-4 grid gap-4">
          <Field
            label="Booking page URL"
            hint="Your public Calendly scheduling link"
          >
            <Input
              value={form.calendlyBookingUrl}
              onChange={(e) => setForm((f) => f && { ...f, calendlyBookingUrl: e.target.value })}
              placeholder="https://calendly.com/your-name"
            />
          </Field>
          {form.calendlyBookingUrl && (
            <a
              href={form.calendlyBookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-[var(--color-accent)] hover:underline"
            >
              Open booking page
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
          <Field
            label="iCal feed URL"
            hint="Found in Calendly → Integrations → Calendar sync"
          >
            <Input
              value={form.calendlyIcalUrl}
              onChange={(e) => setForm((f) => f && { ...f, calendlyIcalUrl: e.target.value })}
              placeholder="https://calendly.com/ical/…"
            />
          </Field>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="secondary" disabled={syncing} onClick={() => void syncCalendly()}>
            {syncing ? 'Syncing…' : 'Sync from Calendly'}
          </Button>
          <Button variant="secondary" onClick={() => fileRef.current?.click()}>
            <Upload className="h-4 w-4" />
            Import .ics file
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept=".ics,text/calendar"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleIcsImport(file);
              e.target.value = '';
            }}
          />
        </div>
      </Card>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Upload } from 'lucide-react';
import { ensureSettings, saveSettings } from '../lib/seed';
import { fetchCalendlyIcal, importCalendlyEvents, parseIcsText } from '../lib/ical';
import type { AppSettings } from '../lib/types';
import { useSettings } from '../hooks/use-data';
import { Button, Card, CardTitle, Field, Input, Textarea } from './ui';

export function SettingsView() {
  const settings = useSettings();
  const [form, setForm] = useState<AppSettings | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    ensureSettings().then(setForm);
  }, []);

  useEffect(() => {
    if (settings) setForm(settings);
  }, [settings]);

  async function handleSave() {
    if (!form) return;
    await saveSettings(form);
    setMessage('Settings saved.');
  }

  async function handleIcsImport(file: File) {
    const text = await file.text();
    const events = parseIcsText(text);
    await importCalendlyEvents(events);
    setMessage(`Imported ${events.length} Calendly event${events.length === 1 ? '' : 's'} from file.`);
  }

  async function handleSyncNow() {
    if (!form?.calendlyIcalUrl) {
      setMessage('Add a Calendly iCal URL first.');
      return;
    }
    try {
      const events = await fetchCalendlyIcal(form.calendlyIcalUrl);
      await importCalendlyEvents(events);
      setMessage(`Synced ${events.length} events from Calendly iCal feed.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Sync failed.');
    }
  }

  if (!form) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Settings</h2>
        <p className="text-sm text-[var(--color-muted)]">
          Configure practice details and Calendly integration for the prototype.
        </p>
      </div>

      <Card>
        <CardTitle subtitle="Practice defaults">General</CardTitle>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Practice name">
            <Input
              value={form.practiceName}
              onChange={(e) => setForm({ ...form, practiceName: e.target.value })}
            />
          </Field>
          <Field label="Default session cost (AUD)">
            <Input
              type="number"
              min={0}
              value={form.defaultSessionCost}
              onChange={(e) => setForm({ ...form, defaultSessionCost: Number(e.target.value) })}
            />
          </Field>
        </div>
      </Card>

      <Card>
        <CardTitle subtitle="Booking link and calendar feed (no API key needed)">Calendly</CardTitle>
        <div className="space-y-4">
          <Field label="Calendly booking page URL">
            <Input
              value={form.calendlyBookingUrl}
              onChange={(e) => setForm({ ...form, calendlyBookingUrl: e.target.value })}
              placeholder="https://calendly.com/your-name/30min"
            />
          </Field>
          <Field label="Calendly secret iCal URL">
            <Textarea
              value={form.calendlyIcalUrl}
              onChange={(e) => setForm({ ...form, calendlyIcalUrl: e.target.value })}
              placeholder="https://calendly.com/integrations/ical/..."
            />
          </Field>
          <p className="text-sm leading-6 text-[var(--color-muted)]">
            In Calendly: Integrations → Calendar sync → copy the secret address. The prototype imports
            bookings from this feed. If browser sync fails, download the .ics file and import it below.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={handleSyncNow}>Sync iCal feed now</Button>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium hover:border-[var(--color-accent)]">
              <Upload className="h-4 w-4" />
              Import .ics file
              <input
                type="file"
                accept=".ics,text/calendar"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleIcsImport(file);
                }}
              />
            </label>
          </div>
        </div>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button onClick={handleSave}>Save settings</Button>
      </div>

      {message ? <p className="text-sm text-[var(--color-muted)]">{message}</p> : null}
    </div>
  );
}

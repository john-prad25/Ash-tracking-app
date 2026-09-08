import { FileText } from 'lucide-react';
import { useState } from 'react';
import { generateSessionInvoice } from '../lib/invoice';
import type { AppSettings, Client, Session } from '../lib/types';
import { Button } from './ui';

interface CreateInvoiceButtonProps {
  session: Session;
  client: Client;
  settings: AppSettings;
  variant?: 'primary' | 'secondary' | 'ghost';
  className?: string;
}

export function CreateInvoiceButton({
  session,
  client,
  settings,
  variant = 'secondary',
  className,
}: CreateInvoiceButtonProps) {
  const [busy, setBusy] = useState(false);

  if (session.status !== 'completed') return null;

  async function handleClick() {
    setBusy(true);
    try {
      await generateSessionInvoice(session, client, settings);
    } catch (err) {
      console.error(err);
      window.alert(err instanceof Error ? err.message : 'Could not generate invoice.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button
      variant={variant}
      className={className}
      disabled={busy}
      onClick={() => void handleClick()}
    >
      <FileText className="h-4 w-4" />
      {session.invoiceNumber ? 'Download invoice' : 'Create invoice'}
    </Button>
  );
}

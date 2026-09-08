import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { db, nowIso } from './db';
import {
  formatCurrency,
  formatSessionDate,
  formatSessionTime,
  sessionDurationMinutes,
} from './stats';
import type { AppSettings, Client, Session } from './types';

function buildInvoiceNumber(session: Session): string {
  const datePart = format(new Date(session.startTime), 'yyyyMMdd');
  const idPart = session.id.replace(/-/g, '').slice(0, 6).toUpperCase();
  return `INV-${datePart}-${idPart}`;
}

function sessionDescription(session: Session): string {
  const parts = ['Therapy session'];
  if (session.isIntroSession) parts.push('(introduction)');
  parts.push(`— ${session.modality === 'online' ? 'Online' : 'In person'}`);
  return parts.join(' ');
}

export async function generateSessionInvoice(
  session: Session,
  client: Client,
  settings: AppSettings,
): Promise<string> {
  const invoiceNumber = session.invoiceNumber ?? buildInvoiceNumber(session);
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const margin = 20;
  let y = margin;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('INVOICE', margin, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(invoiceNumber, margin, y + 8);

  doc.setTextColor(0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(settings.practiceName, 210 - margin, y, { align: 'right' });

  y += 28;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Bill to', margin, y);
  doc.text('Session details', 120, y);

  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.text(client.name, margin, y);
  doc.text(`Date: ${formatSessionDate(session.startTime)}`, 120, y);

  y += 6;
  if (client.email) doc.text(client.email, margin, y);
  doc.text(
    `Time: ${formatSessionTime(session.startTime)}${session.endTime ? ` – ${formatSessionTime(session.endTime)}` : ''}`,
    120,
    y,
  );

  y += 6;
  if (client.phone) doc.text(client.phone, margin, y);
  doc.text(`Duration: ${sessionDurationMinutes(session)} min`, 120, y);

  y += 16;
  doc.setDrawColor(200);
  doc.line(margin, y, 210 - margin, y);
  y += 10;

  doc.setFont('helvetica', 'bold');
  doc.text('Description', margin, y);
  doc.text('Amount', 210 - margin, y, { align: 'right' });

  y += 8;
  doc.setFont('helvetica', 'normal');
  const wrapped = doc.splitTextToSize(sessionDescription(session), 130);
  doc.text(wrapped, margin, y);
  doc.text(formatCurrency(session.cost), 210 - margin, y, { align: 'right' });
  y += wrapped.length * 6 + 10;

  doc.line(margin, y, 210 - margin, y);
  y += 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Total due', 120, y);
  doc.text(formatCurrency(session.cost), 210 - margin, y, { align: 'right' });

  y += 20;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(`Issued: ${format(new Date(), 'd MMM yyyy')}`, margin, y);
  doc.text('Thank you for your trust.', margin, y + 6);
  doc.text('Payment due upon receipt.', margin, y + 12);

  doc.save(`${invoiceNumber}.pdf`);

  if (!session.invoiceNumber) {
    await db.sessions.update(session.id, {
      invoiceNumber,
      invoicedAt: nowIso(),
      updatedAt: nowIso(),
    });
  }

  return invoiceNumber;
}

import { jsPDF } from 'jspdf';
import { formatDate } from './helpers';

// jsPDF's built-in fonts don't include the ₹ glyph, so PDFs use "Rs." instead of formatCurrency's ₹.
const formatAmount = (amount) =>
  `Rs. ${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(amount)}`;

function buildInvoiceDoc(invoice) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const marginX = 48;
  let y = 56;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('TechFix Service Center', marginX, y);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.id, 547, y, { align: 'right' });
  y += 18;
  doc.setTextColor(110);
  doc.text('Electronics repair & service invoice', marginX, y);
  doc.text(invoice.status, 547, y, { align: 'right' });
  doc.setTextColor(0);

  y += 30;
  doc.setDrawColor(220);
  doc.line(marginX, y, 547, y);
  y += 28;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('BILLED TO', marginX, y);
  doc.text('INVOICE DETAILS', 320, y);
  y += 16;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(invoice.customer, marginX, y);
  doc.text(`Date: ${formatDate(invoice.date)}`, 320, y);
  y += 15;
  doc.text(invoice.device, marginX, y);
  doc.text(`Due: ${formatDate(invoice.dueDate)}`, 320, y);
  y += 15;
  doc.text(`Job: ${invoice.jobId}`, marginX, y);
  doc.text(`Method: ${invoice.method}`, 320, y);

  y += 40;
  doc.setFillColor(245, 246, 250);
  doc.rect(marginX, y, 499, 26, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('DESCRIPTION', marginX + 10, y + 17);
  doc.text('AMOUNT', 547 - 10, y + 17, { align: 'right' });
  y += 26;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  y += 28;
  doc.text(invoice.service || 'Repair service', marginX + 10, y);
  doc.text(formatAmount(invoice.amount), 547 - 10, y, { align: 'right' });

  y += 40;
  doc.setDrawColor(220);
  doc.line(320, y, 547, y);
  y += 20;

  doc.setFontSize(10);
  doc.setTextColor(90);
  doc.text('Subtotal', 320, y);
  doc.text(formatAmount(invoice.amount), 547, y, { align: 'right' });
  y += 18;
  doc.text('GST (18%)', 320, y);
  doc.text(formatAmount(invoice.tax), 547, y, { align: 'right' });
  y += 12;
  doc.setDrawColor(220);
  doc.line(320, y, 547, y);
  y += 18;

  doc.setTextColor(0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('Total', 320, y);
  doc.text(formatAmount(invoice.total), 547, y, { align: 'right' });

  y += 60;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(140);
  doc.text('Thank you for choosing TechFix Service Center.', marginX, y);

  return doc;
}

export function downloadInvoicePdf(invoice) {
  buildInvoiceDoc(invoice).save(`${invoice.id}.pdf`);
}

export function printInvoicePdf(invoice) {
  const doc = buildInvoiceDoc(invoice);
  const blobUrl = doc.output('bloburl');
  const win = window.open(blobUrl, '_blank');
  if (!win) return false;
  win.addEventListener('load', () => win.print());
  return true;
}

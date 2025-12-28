import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { IQuotation } from '@/types';

export function generateQuotationPDF(quotation: IQuotation): jsPDF {
  const doc = new jsPDF();

  // Company Header
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('SALES QUOTATION', 105, 20, { align: 'center' });

  // Quotation Info
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Quotation #: ${quotation.quotationNumber}`, 14, 35);
  doc.text(`Date: ${new Date(quotation.date).toLocaleDateString()}`, 14, 42);
  doc.text(`Valid Until: ${new Date(quotation.validUntil).toLocaleDateString()}`, 14, 49);
  doc.text(`Status: ${quotation.status.toUpperCase()}`, 14, 56);

  // Client Information
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Bill To:', 14, 70);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(quotation.client.name, 14, 77);
  doc.text(quotation.client.email, 14, 84);
  doc.text(quotation.client.phone, 14, 91);
  doc.text(quotation.client.address, 14, 98);
  doc.text(
    `${quotation.client.city}, ${quotation.client.state} ${quotation.client.zipCode}`,
    14,
    105
  );
  doc.text(quotation.client.country, 14, 112);

  // Products Table
  const tableData = quotation.products.map((product) => [
    product.name,
    product.description,
    product.quantity.toString(),
    `$${product.unitPrice.toFixed(2)}`,
    `$${product.total.toFixed(2)}`,
  ]);

  autoTable(doc, {
    startY: 125,
    head: [['Product', 'Description', 'Qty', 'Unit Price', 'Total']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [66, 139, 202] },
    styles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 60 },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 30, halign: 'right' },
      4: { cellWidth: 30, halign: 'right' },
    },
  });

  // Get the final Y position after the table
  const finalY = (doc as any).lastAutoTable.finalY || 125;

  // Totals Section
  const totalsStartY = finalY + 10;
  const rightAlign = 195;

  doc.setFontSize(10);
  doc.text('Subtotal:', rightAlign - 50, totalsStartY, { align: 'right' });
  doc.text(`$${quotation.subtotal.toFixed(2)}`, rightAlign, totalsStartY, { align: 'right' });

  if (quotation.discount > 0) {
    doc.text(
      `Discount (${quotation.discountType === 'percentage' ? '%' : 'Fixed'}):`,
      rightAlign - 50,
      totalsStartY + 7,
      { align: 'right' }
    );
    doc.text(`-$${quotation.discount.toFixed(2)}`, rightAlign, totalsStartY + 7, { align: 'right' });
  }

  doc.text(
    `Tax (${quotation.taxRate}%):`,
    rightAlign - 50,
    totalsStartY + (quotation.discount > 0 ? 14 : 7),
    { align: 'right' }
  );
  doc.text(
    `$${quotation.tax.toFixed(2)}`,
    rightAlign,
    totalsStartY + (quotation.discount > 0 ? 14 : 7),
    { align: 'right' }
  );

  // Total
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  const totalY = totalsStartY + (quotation.discount > 0 ? 21 : 14);
  doc.text('Total:', rightAlign - 50, totalY, { align: 'right' });
  doc.text(`$${quotation.total.toFixed(2)}`, rightAlign, totalY, { align: 'right' });

  // Notes and Terms
  let currentY = totalY + 15;

  if (quotation.notes) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Notes:', 14, currentY);
    doc.setFont('helvetica', 'normal');
    const noteLines = doc.splitTextToSize(quotation.notes, 180);
    doc.text(noteLines, 14, currentY + 7);
    currentY += 7 + noteLines.length * 5;
  }

  if (quotation.terms) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Terms & Conditions:', 14, currentY);
    doc.setFont('helvetica', 'normal');
    const termLines = doc.splitTextToSize(quotation.terms, 180);
    doc.text(termLines, 14, currentY + 7);
  }

  return doc;
}

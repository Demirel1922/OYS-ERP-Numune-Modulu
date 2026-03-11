// ============================================================
// OYS-ERP Makina Kartı A5 PDF Oluşturucu
// Format: A5 Portrait (148mm × 210mm) - TEK SAYFA
// Kaynak: Excel MakinaKartı sheet'i
// ============================================================

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { UretimHazirlikKaydi } from '../modules/uretim-hazirlik/types';

const MARGIN = 5; // mm
const PAGE_W = 148;
const PAGE_H = 210;
const CONTENT_W = PAGE_W - MARGIN * 2; // 138mm

export function generateMakinaKartiPdf(kayit: UretimHazirlikKaydi): void {
  const doc = new jsPDF('portrait', 'mm', 'a5');
  const k = kayit.urunKarti;

  let y = MARGIN;

  // === HEADER ===
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('ÜRETİM BİLGİ FORMU', PAGE_W / 2, y + 4, { align: 'center' });
  y += 7;

  doc.setDrawColor(0);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  y += 2;

  // === META BİLGİLER ===
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  const meta = [
    ['Desen Tanımı', k.urunTanimi || '-'],
    ['Müşteri Kodu', k.musteriKodu || '-'],
    ['Ürün Kodu', k.ormeciArtikelKodu || '-'],
    ['Numune No', kayit.numuneNo || '-'],
    ['Makina No', k.makinaNo || '-'],
    ['Makina Modeli', k.makinaModeli || '-'],
    ['Tarih', k.numuneTarihi || '-'],
  ];

  const colW = CONTENT_W / 2;
  for (let i = 0; i < meta.length; i += 2) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.text(`${meta[i][0]}:`, MARGIN, y + 3);
    doc.setFont('helvetica', 'bold');
    doc.text(meta[i][1], MARGIN + 24, y + 3);

    if (meta[i + 1]) {
      doc.setFont('helvetica', 'normal');
      doc.text(`${meta[i + 1][0]}:`, MARGIN + colW, y + 3);
      doc.setFont('helvetica', 'bold');
      doc.text(meta[i + 1][1], MARGIN + colW + 24, y + 3);
    }
    y += 4;
  }

  y += 1;
  doc.setLineWidth(0.2);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  y += 2;

  // === İPLİK TABLOSU (sol kolon mantığı - sadece dolu satırlar) ===
  const doluIplikler = k.iplikler.filter(ip => ip.iplikYeri);

  if (doluIplikler.length > 0) {
    const iplikHead = [['#', 'Teknik Giriş', 'Mekik', 'Denye', 'Kat', 'Renk', 'İplik Cinsi', 'Tedarikçi']];
    const iplikBody = doluIplikler.map((ip, i) => [
      String(i + 1),
      ip.iplikYeri,
      ip.mekikKodu,
      ip.denye,
      ip.kat,
      ip.renk || ip.renkKodu,
      ip.iplikCinsi,
      ip.tedarikci,
    ]);

    autoTable(doc, {
      startY: y,
      head: iplikHead,
      body: iplikBody,
      margin: { left: MARGIN, right: MARGIN },
      theme: 'grid',
      styles: {
        fontSize: 5.5,
        cellPadding: 0.8,
        lineWidth: 0.1,
        lineColor: [150, 150, 150],
        overflow: 'ellipsize',
      },
      headStyles: {
        fillColor: [230, 230, 230],
        textColor: [30, 30, 30],
        fontStyle: 'bold',
        fontSize: 5.5,
      },
      columnStyles: {
        0: { cellWidth: 5 },
        1: { cellWidth: 28 },
        2: { cellWidth: 10 },
        3: { cellWidth: 18 },
        4: { cellWidth: 6 },
        5: { cellWidth: 14 },
        6: { cellWidth: 28 },
        7: { cellWidth: 24 },
      },
    });

    y = (doc as any).lastAutoTable.finalY + 3;
  }

  // === ÖLÇÜLER TABLOSU ===
  const doluOlculer = k.olculer.filter(o => o.boy);
  if (doluOlculer.length > 0) {
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('ÖLÇÜLER', MARGIN, y + 2);
    y += 4;

    const olcuFields: { key: string; label: string }[] = [
      { key: 'lastikBoyu', label: 'Lastik Boyu' },
      { key: 'lastikEni', label: 'Lastik Eni' },
      { key: 'koncBoyu', label: 'Konç Boyu' },
      { key: 'tenisBoyu', label: 'Tenis Boyu' },
      { key: 'tabanBoyu', label: 'Taban Boyu' },
      { key: 'lastikStreci', label: 'Lastik Streçi' },
      { key: 'koncStreci', label: 'Konç Streçi' },
      { key: 'tabanStreci', label: 'Taban Streçi' },
      { key: 'topukStreci', label: 'Topuk Streçi' },
      { key: 'koncMekanik', label: 'Konç Mek.' },
      { key: 'tabanMekanik', label: 'Taban Mek.' },
      { key: 'tenisMekanik', label: 'Tenis Mek.' },
    ];

    const olcuHead = [['Ölçü', ...doluOlculer.map(o => o.boy)]];
    const olcuBody = olcuFields.map(f => [
      f.label,
      ...doluOlculer.map(o => (o as any)[f.key] || '-'),
    ]);

    autoTable(doc, {
      startY: y,
      head: olcuHead,
      body: olcuBody,
      margin: { left: MARGIN, right: MARGIN },
      theme: 'grid',
      styles: {
        fontSize: 5.5,
        cellPadding: 0.8,
        lineWidth: 0.1,
        lineColor: [150, 150, 150],
      },
      headStyles: {
        fillColor: [230, 230, 230],
        textColor: [30, 30, 30],
        fontStyle: 'bold',
        fontSize: 5.5,
      },
      columnStyles: {
        0: { cellWidth: 24, fontStyle: 'bold' },
      },
    });

    y = (doc as any).lastAutoTable.finalY + 3;
  }

  // === FOOTER: Ağırlık + Not ===
  if (y < PAGE_H - 20) {
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    if (k.ciftAgirligi) {
      doc.text(`Çift Ağırlığı: ${k.ciftAgirligi} gr`, MARGIN, y + 2);
      y += 4;
    }
    if (k.not) {
      doc.text(`NOT: ${k.not}`, MARGIN, y + 2, { maxWidth: CONTENT_W });
    }
  }

  // === PDF İNDİR ===
  const fileName = `MakinaKarti_${kayit.numuneNo || 'kayit'}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}

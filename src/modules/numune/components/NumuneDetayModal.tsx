import { useEffect, useState } from 'react';
import { X, FileText, Mail, Eye } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface MeasurementRow {
  bedenler?: string;
  beden?: string;
  renk?: string;
  miktar?: number;
  birim?: string;
  lastikEni?: string;
  lastikYuksekligi?: string;
  koncEni?: string;
  ayakEni?: string;
  koncBoyu?: string;
  tabanBoyu?: string;
  lastikStreci?: string;
  koncStreciAyakStreci?: string;
  topukStreci?: string;
  bord?: string;
}

interface NumuneData {
  id: number;
  numuneNo: string;
  musteriKodu?: string;
  musteri?: string;
  musteriArtikelKodu?: string;
  musteriArtikelNo?: string;
  musteriMarkasi?: string;
  cinsiyet?: string;
  numuneTipi?: string;
  numuneninSebebi?: string;
  corapTipi?: string;
  corapDokusu?: string;
  igneSayisi?: string;
  kovanCapi?: string;
  hedefTarih?: string;
  termin?: string;
  deseneVerilisTarihi?: string;
  durum?: string;
  gonderim?: string;
  gonderimSekli?: string;
  miktar?: number;
  birim?: string;
  formaBilgisi?: string;
  formaSekli?: string;
  yikama?: string;
  olcuSekli?: string;
  corapTanimi?: string;
  measurements?: MeasurementRow[];
  olculer?: MeasurementRow[];
}

interface NumuneDetayModalProps {
  isOpen: boolean;
  onClose: () => void;
  numuneId: number | null;
}

export function NumuneDetayModal({ isOpen, onClose, numuneId }: NumuneDetayModalProps) {
  const [data, setData] = useState<NumuneData | null>(null);

  useEffect(() => {
    if (isOpen && numuneId) {
      const liste = JSON.parse(localStorage.getItem('oys_numune_listesi') || '[]');
      const bulunan = liste.find((n: NumuneData) => n.id === numuneId);
      setData(bulunan || null);
    }
  }, [isOpen, numuneId]);

  if (!isOpen || !data) return null;

  const generatePDF = () => {
    // DİKEY (portrait) format - YASAK: landscape
    const doc = new jsPDF('p', 'mm', 'a4');
    
    doc.setFontSize(16);
    doc.text("SAMPLE SPECIFICATION", 105, 20, { align: "center" });
    
    // Genel Bilgiler Tablosu - Bilingual
    autoTable(doc, {
      startY: 30,
      head: [['FIELD / ALAN', 'VALUE / DEGER']],
      body: [
        ['Sample No (Numune No)', data.numuneNo || '-'],
        ['Customer (Musteri)', data.musteriKodu || data.musteri || '-'],
        ['Customer Art No (Musteri Artikel)', data.musteriArtikelKodu || data.musteriArtikelNo || '-'],
        ['Brand (Marka)', data.musteriMarkasi || '-'],
        ['Gender (Cinsiyet)', data.cinsiyet || '-'],
        ['Type (Tip)', data.numuneTipi || '-'],
        ['Reason (Sebep)', data.numuneninSebebi || '-'],
        ['Status (Durum)', data.durum || '-'],
        ['Shipping (Gonderim)', data.gonderim || data.gonderimSekli || '-'],
        ['Target Date (Hedef Tarih)', data.hedefTarih || data.termin || '-'],
        ['Sock Type (Corap Tipi)', data.corapTipi || '-'],
        ['Texture (Doku)', data.corapDokusu || '-'],
        ['Needle Count (Igne Sayisi)', data.igneSayisi || '-'],
        ['Cylinder (Kovan Capi)', data.kovanCapi || '-'],
      ],
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 9 },
      pageBreak: 'auto',
      rowPageBreak: 'avoid'
    });

    const olculer = data.measurements || data.olculer || [];
    
    if (olculer.length > 0) {
      autoTable(doc, {
        startY: (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 10 : 120,
        head: [['Size (Beden)', 'Color (Renk)', 'Qty (Miktar)', 'Unit (Birim)', 'Cuff W (Lst.Eni)', 'Cuff H (Lst.Yuk.)']],
        body: olculer.map(o => [
          o.bedenler || o.beden || '-',
          o.renk || '-',
          String(o.miktar || 0),
          o.birim || 'Cift',
          o.lastikEni || '-',
          o.lastikYuksekligi || '-'
        ]),
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] },
        styles: { fontSize: 9 },
        pageBreak: 'auto',
        rowPageBreak: 'avoid',
        showHead: 'everyPage'
      });
    }

    return doc;
  };

  const viewPDF = () => {
    const doc = generatePDF();
    // PDF'i yeni sekmede ac (goruntule)
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, '_blank');
  };

  const downloadPDF = () => {
    const doc = generatePDF();
    doc.save(`Sample_${data.numuneNo}.pdf`);
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(`Sample Request - ${data.numuneNo}`);
    const body = encodeURIComponent(`Sample Details / Numune Detayi:

Sample No (Numune No): ${data.numuneNo}
Customer (Musteri): ${data.musteriKodu || data.musteri || '-'}
Status (Durum): ${data.durum || '-'}
Target Date (Hedef Tarih): ${data.hedefTarih || data.termin || '-'}

Please find the PDF attached. / PDF ekte bulunmaktadir.`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const olculer = data.measurements || data.olculer || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg w-11/12 max-w-4xl max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-4 border-b pb-4">
          <h2 className="text-xl font-bold">Numune Detayi (Sample Detail)</h2>
          <div className="flex gap-2">
            <button onClick={viewPDF} className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
              <Eye size={18} /> PDF Goruntule
            </button>
            <button onClick={downloadPDF} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              <FileText size={18} /> PDF Indir
            </button>
            <button onClick={handleEmail} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              <Mail size={18} /> Email
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* BILINGUAL OZET KART */}
        <div className="grid grid-cols-4 gap-4 mb-6 bg-gray-50 p-4 rounded">
          <div>
            <div className="text-xs text-gray-500">Numune No (Sample No)</div>
            <div className="font-bold text-lg">{data.numuneNo}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Musteri (Customer)</div>
            <div className="font-bold">{data.musteriKodu || data.musteri || '-'}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Durum (Status)</div>
            <div className="font-bold">{data.durum || '-'}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Miktar (Qty)</div>
            <div className="font-bold">{data.miktar || 0} {data.birim || ''}</div>
          </div>
        </div>

        {/* GENEL BILGILER TABLOSU */}
        <h3 className="font-bold mb-2 text-gray-700">Genel Bilgiler (General Info)</h3>
        <table className="w-full border-collapse border border-gray-300 mb-6">
          <tbody>
            <tr className="border-b">
              <td className="p-2 bg-gray-50 w-1/3 font-medium">Numune No (Sample No)</td>
              <td className="p-2">{data.numuneNo}</td>
            </tr>
            <tr className="border-b">
              <td className="p-2 bg-gray-50 font-medium">Musteri (Customer)</td>
              <td className="p-2">{data.musteriKodu || data.musteri || '-'}</td>
            </tr>
            <tr className="border-b">
              <td className="p-2 bg-gray-50 font-medium">Musteri Artikel No (Customer Art No)</td>
              <td className="p-2">{data.musteriArtikelKodu || data.musteriArtikelNo || '-'}</td>
            </tr>
            <tr className="border-b">
              <td className="p-2 bg-gray-50 font-medium">Numune Tipi (Type)</td>
              <td className="p-2">{data.numuneTipi || '-'}</td>
            </tr>
            <tr className="border-b">
              <td className="p-2 bg-gray-50 font-medium">Numunenin Sebebi (Reason)</td>
              <td className="p-2">{data.numuneninSebebi || '-'}</td>
            </tr>
            <tr className="border-b">
              <td className="p-2 bg-gray-50 font-medium">Corap Tipi (Sock Type)</td>
              <td className="p-2">{data.corapTipi || '-'}</td>
            </tr>
            <tr className="border-b">
              <td className="p-2 bg-gray-50 font-medium">Corap Dokusu (Texture)</td>
              <td className="p-2">{data.corapDokusu || '-'}</td>
            </tr>
            <tr className="border-b">
              <td className="p-2 bg-gray-50 font-medium">Igne Sayisi (Needle Count)</td>
              <td className="p-2">{data.igneSayisi || '-'}</td>
            </tr>
            <tr className="border-b">
              <td className="p-2 bg-gray-50 font-medium">Kovan Capi (Cylinder)</td>
              <td className="p-2">{data.kovanCapi || '-'}</td>
            </tr>
            <tr className="border-b">
              <td className="p-2 bg-gray-50 font-medium">Durum (Status)</td>
              <td className="p-2">{data.durum || '-'}</td>
            </tr>
            <tr className="border-b">
              <td className="p-2 bg-gray-50 font-medium">Gonderim Sekli (Shipping)</td>
              <td className="p-2">{data.gonderim || data.gonderimSekli || '-'}</td>
            </tr>
            <tr>
              <td className="p-2 bg-gray-50 font-medium">Hedef Tarih (Target Date)</td>
              <td className="p-2">{data.hedefTarih || data.termin || '-'}</td>
            </tr>
          </tbody>
        </table>

        {/* OLCULER TABLOSU */}
        <h3 className="font-bold mb-2 text-gray-700">Olculer (Measurements)</h3>
        <table className="w-full border-collapse border border-gray-300 mb-6">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border text-left">Beden (Size)</th>
              <th className="p-2 border text-left">Renk (Color)</th>
              <th className="p-2 border text-left">Miktar (Qty)</th>
              <th className="p-2 border text-left">Birim (Unit)</th>
              <th className="p-2 border text-left">Lastik Eni</th>
              <th className="p-2 border text-left">Lastik Yuk.</th>
            </tr>
          </thead>
          <tbody>
            {olculer.length > 0 ? olculer.map((olcu, idx) => (
              <tr key={idx} className="border-b">
                <td className="p-2 border">{olcu.bedenler || olcu.beden || '-'}</td>
                <td className="p-2 border">{olcu.renk || '-'}</td>
                <td className="p-2 border">{olcu.miktar || 0}</td>
                <td className="p-2 border">{olcu.birim || 'Cift'}</td>
                <td className="p-2 border">{olcu.lastikEni || '-'}</td>
                <td className="p-2 border">{olcu.lastikYuksekligi || '-'}</td>
              </tr>
            )) : (
              <tr>
                <td className="p-2 border text-center text-gray-500" colSpan={6}>Veri yok / No data</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* KAPAT BUTONU */}
        <div className="flex justify-end">
          <button onClick={onClose} className="px-6 py-2 bg-gray-200 rounded hover:bg-gray-300">
            Kapat (Close)
          </button>
        </div>

      </div>
    </div>
  );
}

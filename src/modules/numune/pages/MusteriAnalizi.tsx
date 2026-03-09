import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Filter, Download, Mail, ChevronUp, ChevronDown, MoreVertical, FileText, RotateCcw } from 'lucide-react';

interface NumuneItem {
  id: number;
  numuneNo: string;
  musteri: string;
  musteriArtikelNo?: string;
  refNo: string;
  durum: string;
  termin: string;
  miktar: number;
  gonderim: string;
  numuneTipi?: string;
  olusturmaTarihi?: string;
}

interface FilterState {
  musteri: string;
  baslangicTarihi: string;
  bitisTarihi: string;
  numuneTipi: string;
}

type SortField = 'numuneNo' | 'musteri' | 'musteriArtikelNo' | 'termin' | 'miktar' | 'numuneTipi';
type SortDirection = 'asc' | 'desc';

const NUMUNE_TIPI_OPTIONS = [
  { value: '', label: 'Tümü' },
  { value: 'ILK_GELISTIRME', label: 'İlk Geliştirme Numunesi' },
  { value: 'BOY_SETI', label: 'Boy Seti' },
  { value: 'RENK_SETI', label: 'Renk Seti' },
  { value: 'KALITE_NUMUNESI', label: 'Kalite Numunesi' },
  { value: 'PREPRODUCTION', label: 'Preproduction Sample' },
  { value: 'PRODUCTION', label: 'Production Sample' },
  { value: 'SALESMAN', label: 'Salesman Sample' },
  { value: 'FUAR_NUMUNESI', label: 'Fuar Numunesi' },
  { value: 'REVIZE_NUMUNE', label: 'Revize Numune' },
  { value: 'REFERANS_NUMUNE', label: 'Referans Numune' },
  { value: 'TEST_NUMUNESI', label: 'Test Numunesi' }
];

const mockData: NumuneItem[] = [
  { id: 1, numuneNo: '55A1', musteri: 'ABC Tekstil', musteriArtikelNo: 'ART-001', refNo: 'REF-2025-001', durum: 'Beklemede', termin: '2026-03-15', miktar: 50, gonderim: 'Kargo', numuneTipi: 'İlk Geliştirme', olusturmaTarihi: '2025-01-10' },
  { id: 2, numuneNo: '55A2', musteri: 'XYZ Giyim', musteriArtikelNo: 'ART-002', refNo: 'PO-456', durum: 'Üretimde', termin: '2026-03-10', miktar: 100, gonderim: 'Elden', numuneTipi: 'Boy Seti', olusturmaTarihi: '2025-01-12' },
  { id: 3, numuneNo: '55A3', musteri: 'Global Socks', musteriArtikelNo: 'ART-003', refNo: '-', durum: 'Hazır', termin: '2026-03-05', miktar: 25, gonderim: 'Kurye', numuneTipi: 'Renk Seti', olusturmaTarihi: '2025-01-15' },
  { id: 4, numuneNo: '55A4', musteri: 'Premium Textile', musteriArtikelNo: 'ART-004', refNo: 'PT-2025-333', durum: 'Beklemede', termin: '2026-03-25', miktar: 20, gonderim: 'Kurye', numuneTipi: 'Kalite Numunesi', olusturmaTarihi: '2025-01-18' },
  { id: 5, numuneNo: '55A5', musteri: 'ABC Tekstil', musteriArtikelNo: 'ART-005', refNo: '-', durum: 'Üretimde', termin: '2026-03-12', miktar: 45, gonderim: 'Kargo', numuneTipi: 'Production', olusturmaTarihi: '2025-01-20' },
  { id: 6, numuneNo: '55A6', musteri: 'XYZ Giyim', musteriArtikelNo: 'ART-006', refNo: 'PO-789', durum: 'Hazır', termin: '2026-03-07', miktar: 80, gonderim: 'Elden', numuneTipi: 'Fuar Numunesi', olusturmaTarihi: '2025-01-22' },
];

export function MusteriAnalizi() {
  const navigate = useNavigate();
  const [numuneListesi, setNumuneListesi] = useState<NumuneItem[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    musteri: '',
    baslangicTarihi: '',
    bitisTarihi: '',
    numuneTipi: ''
  });
  const [sortField, setSortField] = useState<SortField>('termin');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  // Load data from localStorage
  useEffect(() => {
    const storedList = localStorage.getItem('oys_numune_listesi');
    if (storedList) {
      const parsedList = JSON.parse(storedList);
      const existingIds = new Set(parsedList.map((n: NumuneItem) => n.id));
      const filteredMock = mockData.filter(m => !existingIds.has(m.id));
      setNumuneListesi([...parsedList, ...filteredMock]);
    } else {
      setNumuneListesi(mockData);
    }
  }, []);

  // Get unique customers for dropdown
  const musteriler = useMemo(() => {
    const unique = new Set(numuneListesi.map(n => n.musteri));
    return Array.from(unique).sort();
  }, [numuneListesi]);

  // Filter and sort data
  const filteredData = useMemo(() => {
    let data = [...numuneListesi];

    // Apply filters
    if (filters.musteri) {
      data = data.filter(n => n.musteri === filters.musteri);
    }
    if (filters.baslangicTarihi) {
      data = data.filter(n => n.termin >= filters.baslangicTarihi);
    }
    if (filters.bitisTarihi) {
      data = data.filter(n => n.termin <= filters.bitisTarihi);
    }
    if (filters.numuneTipi) {
      data = data.filter(n => n.numuneTipi === filters.numuneTipi);
    }

    // Apply sorting
    data.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === 'termin') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return data;
  }, [numuneListesi, filters, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleReset = () => {
    setFilters({
      musteri: '',
      baslangicTarihi: '',
      bitisTarihi: '',
      numuneTipi: ''
    });
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const handlePDF = (numune: NumuneItem) => {
    // Create a simple printable view
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Sample ${numune.numuneNo}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; }
              h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
              th { background-color: #f5f5f5; font-weight: bold; }
              .header { display: flex; justify-content: space-between; align-items: center; }
              .logo { font-size: 24px; font-weight: bold; color: #666; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>SAMPLE REPORT</h1>
              <div class="logo">OYS-ERP</div>
            </div>
            <table>
              <tr><th>Field</th><th>Value</th></tr>
              <tr><td>Sample No</td><td>${numune.numuneNo}</td></tr>
              <tr><td>Customer</td><td>${numune.musteri}</td></tr>
              <tr><td>Art. No</td><td>${numune.musteriArtikelNo || '-'}</td></tr>
              <tr><td>Delivery Date</td><td>${formatDate(numune.termin)}</td></tr>
              <tr><td>Quantity</td><td>${numune.miktar} pcs</td></tr>
              <tr><td>Type</td><td>${numune.numuneTipi || '-'}</td></tr>
              <tr><td>Status</td><td>${numune.durum}</td></tr>
              <tr><td>Shipping</td><td>${numune.gonderim}</td></tr>
            </table>
            <p style="margin-top: 40px; color: #666; font-size: 12px;">Generated on ${new Date().toLocaleString()}</p>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
    setOpenMenuId(null);
  };

  const handleEmail = (numune: NumuneItem) => {
    const subject = `Sample ${numune.numuneNo} - ${numune.musteri}`;
    const body = `Sample Details:
    
Sample No: ${numune.numuneNo}
Customer: ${numune.musteri}
Art. No: ${numune.musteriArtikelNo || '-'}
Delivery Date: ${formatDate(numune.termin)}
Quantity: ${numune.miktar} pcs
Type: ${numune.numuneTipi || '-'}
Status: ${numune.durum}
Shipping: ${numune.gonderim}

Best regards,`;
    
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setOpenMenuId(null);
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ChevronUp size={14} className="text-gray-300" />;
    return sortDirection === 'asc' ? <ChevronUp size={14} className="text-gray-700" /> : <ChevronDown size={14} className="text-gray-700" />;
  };

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <button 
              onClick={() => navigate('/numune/talepler')}
              className="text-sm text-gray-500 mb-2 flex items-center gap-1 hover:text-gray-700"
            >
              <ArrowLeft size={16} /> Numune Listesine Dön
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Müşteri Numune Analizi</h1>
            <p className="text-gray-500 mt-1">Müşteri bazlı numune analizi ve raporlama</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={18} className="text-gray-600" />
            <h3 className="font-medium text-gray-700">Filtreler</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Müşteri</label>
              <select 
                value={filters.musteri} 
                onChange={(e) => setFilters({...filters, musteri: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
              >
                <option value="">Tümü</option>
                {musteriler.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Başlangıç Tarihi</label>
              <input 
                type="date" 
                value={filters.baslangicTarihi}
                onChange={(e) => setFilters({...filters, baslangicTarihi: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bitiş Tarihi</label>
              <input 
                type="date" 
                value={filters.bitisTarihi}
                onChange={(e) => setFilters({...filters, bitisTarihi: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Numune Tipi</label>
              <select 
                value={filters.numuneTipi} 
                onChange={(e) => setFilters({...filters, numuneTipi: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
              >
                {NUMUNE_TIPI_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end mt-4 gap-2">
            <button 
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-sm"
            >
              <RotateCcw size={16} /> Sıfırla
            </button>
            <button 
              onClick={() => {}}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-sm"
            >
              <Search size={16} /> Filtrele
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-600">
            <span className="font-medium">{filteredData.length}</span> kayıt bulundu | 
            Toplam Miktar: <span className="font-medium">{filteredData.reduce((acc, n) => acc + n.miktar, 0)}</span> adet
          </p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th 
                  className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('numuneNo')}
                >
                  <div className="flex items-center gap-1">Numune No {getSortIcon('numuneNo')}</div>
                </th>
                <th 
                  className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('musteri')}
                >
                  <div className="flex items-center gap-1">Müşteri {getSortIcon('musteri')}</div>
                </th>
                <th 
                  className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('musteriArtikelNo')}
                >
                  <div className="flex items-center gap-1">Müşteri Artikel No {getSortIcon('musteriArtikelNo')}</div>
                </th>
                <th 
                  className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('termin')}
                >
                  <div className="flex items-center gap-1">Termin {getSortIcon('termin')}</div>
                </th>
                <th 
                  className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('miktar')}
                >
                  <div className="flex items-center gap-1">Miktar {getSortIcon('miktar')}</div>
                </th>
                <th 
                  className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('numuneTipi')}
                >
                  <div className="flex items-center gap-1">Numune Tipi {getSortIcon('numuneTipi')}</div>
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row) => (
                <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4 text-sm font-medium text-gray-900">{row.numuneNo}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{row.musteri}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{row.musteriArtikelNo || '-'}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{formatDate(row.termin)}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{row.miktar} adet</td>
                  <td className="py-4 px-4 text-sm text-gray-600">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                      {row.numuneTipi || '-'}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="relative">
                      <button 
                        onClick={() => setOpenMenuId(openMenuId === row.id ? null : row.id)}
                        className="text-gray-400 hover:text-gray-600 p-1"
                      >
                        <MoreVertical size={18} />
                      </button>
                      {openMenuId === row.id && (
                        <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                          <button 
                            onClick={() => navigate('/numune/yeni', { state: { editMode: true, numuneId: row.id } })}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <FileText size={14} /> Görüntüle
                          </button>
                          <button 
                            onClick={() => handlePDF(row)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 border-t border-gray-100"
                          >
                            <Download size={14} /> PDF Yap
                          </button>
                          <button 
                            onClick={() => handleEmail(row)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 border-t border-gray-100"
                          >
                            <Mail size={14} /> E-posta Gönder
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredData.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>Filtrelere uygun kayıt bulunamadı.</p>
          </div>
        )}
      </div>
    </div>
  );
}

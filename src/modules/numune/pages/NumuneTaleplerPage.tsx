import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Plus, Download, BarChart3, Search, MoreVertical, Users, Edit3, Trash2, ChevronRight, Check } from 'lucide-react';

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
}

const mockData: NumuneItem[] = [
  { id: 1, numuneNo: '55A1', musteri: 'ABC Tekstil', musteriArtikelNo: 'ART-001', refNo: 'REF-2025-001', durum: 'Beklemede', termin: '15.03.2026', miktar: 50, gonderim: 'Kargo', numuneTipi: 'İlk Geliştirme' },
  { id: 2, numuneNo: '55A2', musteri: 'XYZ Giyim', musteriArtikelNo: 'ART-002', refNo: 'PO-456', durum: 'Üretimde', termin: '10.03.2026', miktar: 100, gonderim: 'Elden', numuneTipi: 'Boy Seti' },
  { id: 3, numuneNo: '55A3', musteri: 'Global Socks', musteriArtikelNo: 'ART-003', refNo: '-', durum: 'Hazır', termin: '05.03.2026', miktar: 25, gonderim: 'Kurye', numuneTipi: 'Renk Seti' },
  { id: 4, numuneNo: '55A4', musteri: 'Premium Textile', musteriArtikelNo: 'ART-004', refNo: 'PT-2025-333', durum: 'Beklemede', termin: '25.03.2026', miktar: 20, gonderim: 'Kurye', numuneTipi: 'Kalite Numunesi' },
  { id: 5, numuneNo: '55A5', musteri: 'ABC Tekstil', musteriArtikelNo: 'ART-005', refNo: '-', durum: 'Üretimde', termin: '12.03.2026', miktar: 45, gonderim: 'Kargo', numuneTipi: 'Production' },
  { id: 6, numuneNo: '55A6', musteri: 'XYZ Giyim', musteriArtikelNo: 'ART-006', refNo: 'PO-789', durum: 'Hazır', termin: '07.03.2026', miktar: 80, gonderim: 'Elden', numuneTipi: 'Fuar' },
];

const DURUM_OPTIONS = ['Taslak', 'Beklemede', 'Üretimde', 'Hazır', 'Gönderildi', 'Tamamlandı', 'İptal'];
const GONDERIM_OPTIONS = ['Kargo', 'Elden', 'Kurye'];

export function NumuneTaleplerPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('Aktif');
  const [searchTerm, setSearchTerm] = useState('');
  const [numuneListesi, setNumuneListesi] = useState<NumuneItem[]>(mockData);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [openSubMenu, setOpenSubMenu] = useState<'durum' | 'gonderim' | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // localStorage'dan numune listesini yükle
  const loadData = () => {
    const storedList = localStorage.getItem('oys_numune_listesi');
    if (storedList) {
      const parsedList = JSON.parse(storedList);
      // Merge with mock data, avoiding duplicates
      const existingIds = new Set(parsedList.map((n: NumuneItem) => n.id));
      const filteredMock = mockData.filter(m => !existingIds.has(m.id));
      setNumuneListesi([...parsedList, ...filteredMock]);
    } else {
      setNumuneListesi(mockData);
    }
  };

  useEffect(() => {
    loadData();
    
    // YeniNumune'dan gelen state kontrolü
    if (location.state?.refresh) {
      loadData();
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Sayfa focus olduğunda güncelle
  useEffect(() => {
    const handleFocus = () => {
      loadData();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // Storage event listener (diğer sekmeler için)
  useEffect(() => {
    const handleStorage = () => {
      loadData();
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Dışarı tıklama ile menüyü kapat
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
        setOpenSubMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleEdit = (id: number) => {
    navigate('/numune/yeni', { state: { editMode: true, numuneId: id } });
    setOpenMenuId(null);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Bu numuneyi silmek istediğinize emin misiniz?')) {
      const mevcutListe = JSON.parse(localStorage.getItem('oys_numune_listesi') || '[]');
      const yeniListe = mevcutListe.filter((n: any) => n.id !== id);
      localStorage.setItem('oys_numune_listesi', JSON.stringify(yeniListe));
      loadData();
    }
    setOpenMenuId(null);
  };

  const handleDurumChange = (id: number, yeniDurum: string) => {
    const mevcutListe = JSON.parse(localStorage.getItem('oys_numune_listesi') || '[]');
    const yeniListe = mevcutListe.map((n: any) => n.id === id ? { ...n, durum: yeniDurum } : n);
    localStorage.setItem('oys_numune_listesi', JSON.stringify(yeniListe));
    loadData();
    setOpenMenuId(null);
    setOpenSubMenu(null);
    
    // Toast notification
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg bg-green-600 text-white flex items-center gap-2';
    toast.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>Durum "${yeniDurum}" olarak güncellendi`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  const handleGonderimChange = (id: number, yeniGonderim: string) => {
    const mevcutListe = JSON.parse(localStorage.getItem('oys_numune_listesi') || '[]');
    const yeniListe = mevcutListe.map((n: any) => n.id === id ? { ...n, gonderim: yeniGonderim } : n);
    localStorage.setItem('oys_numune_listesi', JSON.stringify(yeniListe));
    loadData();
    setOpenMenuId(null);
    setOpenSubMenu(null);
    
    // Toast notification
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg bg-green-600 text-white flex items-center gap-2';
    toast.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>Gönderim şekli "${yeniGonderim}" olarak güncellendi`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  const toggleMenu = (id: number) => {
    setOpenMenuId(openMenuId === id ? null : id);
    setOpenSubMenu(null);
  };

  const getDurumBadgeColor = (durum: string) => {
    switch (durum) {
      case 'Taslak': return 'bg-gray-100 text-gray-600';
      case 'Beklemede': return 'bg-yellow-100 text-yellow-800';
      case 'Üretimde': return 'bg-blue-100 text-blue-800';
      case 'Hazır': return 'bg-green-100 text-green-800';
      case 'Gönderildi': return 'bg-purple-100 text-purple-800';
      case 'Tamamlandı': return 'bg-emerald-100 text-emerald-800';
      case 'İptal': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <button 
              onClick={() => navigate('/numune')}
              className="text-sm text-gray-500 mb-2 flex items-center gap-1 hover:text-gray-700"
            >
              <ArrowLeft size={16} /> Ana Menüye Dön
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Numune Listesi</h1>
            <p className="text-gray-500 mt-1">Tüm numune taleplerinizi yönetin</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => navigate('/numune/musteri-analizi')}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
            >
              <Users size={18} /> Müşteri Analizi
            </button>
            <button 
              onClick={() => console.log('Analiz triggered')}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
            >
              <BarChart3 size={18} /> Analiz
            </button>
            <button 
              onClick={() => navigate('/numune/yeni')}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
            >
              <Plus size={18} /> Yeni Numune
            </button>
          </div>
        </div>

        <div className="inline-flex bg-gray-100 p-1 rounded-lg mb-6">
          {['Aktif', 'Gönderildi', 'Tamamlandı', 'İptal', 'Tümü'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Numune no veya müşteri adı..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select className="border border-gray-300 rounded-lg px-4 py-2 bg-white">
            <option>Tüm Durumlar</option>
            <option>Beklemede</option>
            <option>Üretimde</option>
            <option>Hazır</option>
          </select>
          <button 
            onClick={() => console.log('Excel export triggered')}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
          >
            <Download size={16} /> Excel İndir
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Sıra No</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Numune No</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Müşteri</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Müşteri Artikel No</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Termin</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Miktar</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Numune Tipi</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Durum</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {numuneListesi.map((row, index) => (
                <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4 text-sm text-gray-600">{index + 1}</td>
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
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDurumBadgeColor(row.durum)}`}>
                      {row.durum}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="relative" ref={openMenuId === row.id ? menuRef : null}>
                      <button 
                        onClick={() => toggleMenu(row.id)}
                        className="text-gray-400 hover:text-gray-600 p-1"
                      >
                        <MoreVertical size={18} />
                      </button>
                      {openMenuId === row.id && (
                        <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                          {/* Durum Değiştir - Submenu */}
                          <div className="relative group">
                            <button 
                              onClick={() => setOpenSubMenu(openSubMenu === 'durum' ? null : 'durum')}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-between"
                            >
                              <span>Durum Değiştir</span>
                              <ChevronRight size={14} />
                            </button>
                            {openSubMenu === 'durum' && (
                              <div className="absolute left-full top-0 ml-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg">
                                {DURUM_OPTIONS.map(durum => (
                                  <button
                                    key={durum}
                                    onClick={() => handleDurumChange(row.id, durum)}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-between"
                                  >
                                    <span>{durum}</span>
                                    {row.durum === durum && <Check size={14} className="text-green-600" />}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          {/* Gönderim Şekli Değiştir - Submenu */}
                          <div className="relative group">
                            <button 
                              onClick={() => setOpenSubMenu(openSubMenu === 'gonderim' ? null : 'gonderim')}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-between border-t border-gray-100"
                            >
                              <span>Gönderim Şekli Değiştir</span>
                              <ChevronRight size={14} />
                            </button>
                            {openSubMenu === 'gonderim' && (
                              <div className="absolute left-full top-0 ml-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg">
                                {GONDERIM_OPTIONS.map(gonderim => (
                                  <button
                                    key={gonderim}
                                    onClick={() => handleGonderimChange(row.id, gonderim)}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-between"
                                  >
                                    <span>{gonderim}</span>
                                    {row.gonderim === gonderim && <Check size={14} className="text-green-600" />}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          <button 
                            onClick={() => handleEdit(row.id)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 border-t border-gray-100"
                          >
                            <Edit3 size={14} /> Düzenle
                          </button>
                          <button 
                            onClick={() => handleDelete(row.id)}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                          >
                            <Trash2 size={14} /> Sil
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

        <div className="mt-4 text-sm text-gray-500">
          Toplam {numuneListesi.length} kayıt<br />
          Toplam Miktar: {numuneListesi.reduce((acc, curr) => acc + curr.miktar, 0)} adet
        </div>
      </div>
    </div>
  );
}

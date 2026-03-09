import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Download, Search, Users, MoreVertical, Edit3, Trash2, ChevronRight, Check, Eye } from 'lucide-react';
import { NumuneDetayModal } from '../components/NumuneDetayModal';

interface NumuneItem {
  id: number;
  numuneNo: string;
  musteri: string;
  musteriKodu?: string;
  musteriArtikelNo?: string;
  musteriArtikelKodu?: string;
  refNo: string;
  durum: string;
  termin: string;
  hedefTarih?: string;
  miktar: number;
  gonderim: string;
  gonderimSekli?: string;
  numuneTipi?: string;
}

const mockData: NumuneItem[] = [
  { id: 1, numuneNo: '55A1', musteri: 'ABC Tekstil', musteriKodu: 'ABC001', musteriArtikelNo: 'ART-001', refNo: 'REF-2025-001', durum: 'Beklemede', termin: '2026-03-15', miktar: 50, gonderim: 'Kargo', numuneTipi: 'İlk Geliştirme' },
  { id: 2, numuneNo: '55A2', musteri: 'XYZ Giyim', musteriKodu: 'XYZ002', musteriArtikelNo: 'ART-002', refNo: 'PO-456', durum: 'Üretimde', termin: '2026-03-10', miktar: 100, gonderim: 'Elden', numuneTipi: 'Boy Seti' },
  { id: 3, numuneNo: '55A3', musteri: 'Global Socks', musteriKodu: 'GSK003', musteriArtikelNo: 'ART-003', refNo: '-', durum: 'Hazır', termin: '2026-03-05', miktar: 25, gonderim: 'Kurye', numuneTipi: 'Renk Seti' },
  { id: 4, numuneNo: '55A4', musteri: 'Premium Textile', musteriKodu: 'PT004', musteriArtikelNo: 'ART-004', refNo: 'PT-2025-333', durum: 'Beklemede', termin: '2026-03-25', miktar: 20, gonderim: 'Kurye', numuneTipi: 'Kalite Numunesi' },
  { id: 5, numuneNo: '55A5', musteri: 'ABC Tekstil', musteriKodu: 'ABC001', musteriArtikelNo: 'ART-005', refNo: '-', durum: 'Üretimde', termin: '2026-03-12', miktar: 45, gonderim: 'Kargo', numuneTipi: 'Production' },
  { id: 6, numuneNo: '55A6', musteri: 'XYZ Giyim', musteriKodu: 'XYZ002', musteriArtikelNo: 'ART-006', refNo: 'PO-789', durum: 'Hazır', termin: '2026-03-07', miktar: 80, gonderim: 'Elden', numuneTipi: 'Fuar' },
];

const DURUM_OPTIONS = ['Taslak', 'Beklemede', 'Üretimde', 'Hazır', 'Gönderildi', 'Tamamlandı', 'İptal'];
const GONDERIM_OPTIONS = ['Kargo', 'Elden', 'Kurye'];

export function NumuneTaleplerPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Aktif');
  const [searchTerm, setSearchTerm] = useState('');
  const [numuneler, setNumuneler] = useState<NumuneItem[]>(mockData);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedNumuneId, setSelectedNumuneId] = useState<number | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [openSubMenu, setOpenSubMenu] = useState<'durum' | 'gonderim' | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('oys_numune_listesi') || '[]');
    if (data.length > 0) {
      setNumuneler(data);
    } else {
      localStorage.setItem('oys_numune_listesi', JSON.stringify(mockData));
      setNumuneler(mockData);
    }
  }, []);

  // Disari tiklama ile menüyü kapat
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

  // DURUM DEGISTIRME - KESIN CALISMALI
  const handleDurumChange = (id: number, yeniDurum: string) => {
    // State'i aninda guncelle (UI refresh)
    setNumuneler(prev => prev.map(n => n.id === id ? { ...n, durum: yeniDurum } : n));
    
    // localStorage'i guncelle (kalici)
    const liste = JSON.parse(localStorage.getItem('oys_numune_listesi') || '[]');
    const yeniListe = liste.map((n: NumuneItem) => n.id === id ? { ...n, durum: yeniDurum } : n);
    localStorage.setItem('oys_numune_listesi', JSON.stringify(yeniListe));
    
    alert(`Durum "${yeniDurum}" olarak guncellendi`);
    setOpenMenuId(null);
    setOpenSubMenu(null);
  };

  // GONDERIM SEKLI DEGISTIRME
  const handleGonderimChange = (id: number, yeniGonderim: string) => {
    setNumuneler(prev => prev.map(n => n.id === id ? { ...n, gonderim: yeniGonderim, gonderimSekli: yeniGonderim } : n));
    
    const liste = JSON.parse(localStorage.getItem('oys_numune_listesi') || '[]');
    const yeniListe = liste.map((n: NumuneItem) => n.id === id ? { ...n, gonderim: yeniGonderim, gonderimSekli: yeniGonderim } : n);
    localStorage.setItem('oys_numune_listesi', JSON.stringify(yeniListe));
    
    alert(`Gonderim "${yeniGonderim}" olarak guncellendi`);
    setOpenMenuId(null);
    setOpenSubMenu(null);
  };

  // GORUNTULE (Modal Ac - Navigate YASAK)
  const openDetailModal = (id: number) => {
    setSelectedNumuneId(id);
    setModalOpen(true);
    setOpenMenuId(null);
  };

  const handleEdit = (id: number) => {
    navigate('/numune/yeni', { state: { editMode: true, numuneId: id } });
    setOpenMenuId(null);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Bu numuneyi silmek istediginize emin misiniz?')) {
      const liste = JSON.parse(localStorage.getItem('oys_numune_listesi') || '[]');
      const yeniListe = liste.filter((n: NumuneItem) => n.id !== id);
      localStorage.setItem('oys_numune_listesi', JSON.stringify(yeniListe));
      setNumuneler(yeniListe);
    }
    setOpenMenuId(null);
  };

  const toggleMenu = (id: number) => {
    setOpenMenuId(openMenuId === id ? null : id);
    setOpenSubMenu(null);
  };

  const getDurumBadgeClass = (durum: string) => {
    switch (durum) {
      case 'Taslak': return 'bg-gray-200 text-gray-700';
      case 'Beklemede': return 'bg-yellow-200 text-yellow-800';
      case 'Üretimde': return 'bg-blue-200 text-blue-800';
      case 'Hazır': return 'bg-green-200 text-green-800';
      case 'Gönderildi': return 'bg-purple-200 text-purple-800';
      case 'Tamamlandı': return 'bg-emerald-200 text-emerald-800';
      case 'İptal': return 'bg-red-200 text-red-800';
      default: return 'bg-gray-200 text-gray-700';
    }
  };

  const filteredNumuneler = numuneler.filter(n => {
    const matchesSearch = n.numuneNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         n.musteri.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (n.musteriKodu && n.musteriKodu.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (activeTab === 'Tümü') return matchesSearch;
    if (activeTab === 'Aktif') return matchesSearch && ['Taslak', 'Beklemede', 'Üretimde', 'Hazır'].includes(n.durum);
    if (activeTab === 'Gönderildi') return matchesSearch && n.durum === 'Gönderildi';
    if (activeTab === 'Tamamlandı') return matchesSearch && n.durum === 'Tamamlandı';
    if (activeTab === 'İptal') return matchesSearch && n.durum === 'İptal';
    return matchesSearch;
  });

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
              {filteredNumuneler.map((numune, index) => (
                <tr key={numune.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4 text-sm text-gray-600">{index + 1}</td>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900">{numune.numuneNo}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{numune.musteriKodu || numune.musteri}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{numune.musteriArtikelKodu || numune.musteriArtikelNo || '-'}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{numune.hedefTarih || numune.termin}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{numune.miktar} adet</td>
                  <td className="py-4 px-4 text-sm text-gray-600">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                      {numune.numuneTipi || '-'}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDurumBadgeClass(numune.durum)}`}>
                      {numune.durum}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="relative" ref={openMenuId === numune.id ? menuRef : null}>
                      <button 
                        onClick={() => toggleMenu(numune.id)}
                        className="text-gray-400 hover:text-gray-600 p-1"
                      >
                        <MoreVertical size={18} />
                      </button>
                      {openMenuId === numune.id && (
                        <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                          {/* Durum Degistir - Submenu */}
                          <div className="relative group">
                            <button 
                              onClick={() => setOpenSubMenu(openSubMenu === 'durum' ? null : 'durum')}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-between"
                            >
                              <span>Durum Değiştir</span>
                              <ChevronRight size={14} />
                            </button>
                            {openSubMenu === 'durum' && (
                              <div className="absolute left-full top-0 ml-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                                {DURUM_OPTIONS.map(durum => (
                                  <button
                                    key={durum}
                                    onClick={() => handleDurumChange(numune.id, durum)}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-between"
                                  >
                                    <span>{durum}</span>
                                    {numune.durum === durum && <Check size={14} className="text-green-600" />}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          {/* Gonderim Sekli Degistir - Submenu */}
                          <div className="relative group">
                            <button 
                              onClick={() => setOpenSubMenu(openSubMenu === 'gonderim' ? null : 'gonderim')}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-between border-t border-gray-100"
                            >
                              <span>Gönderim Şekli Değiştir</span>
                              <ChevronRight size={14} />
                            </button>
                            {openSubMenu === 'gonderim' && (
                              <div className="absolute left-full top-0 ml-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                                {GONDERIM_OPTIONS.map(gonderim => (
                                  <button
                                    key={gonderim}
                                    onClick={() => handleGonderimChange(numune.id, gonderim)}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-between"
                                  >
                                    <span>{gonderim}</span>
                                    {numune.gonderim === gonderim && <Check size={14} className="text-green-600" />}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          {/* Goruntule - Modal Ac */}
                          <button 
                            onClick={() => openDetailModal(numune.id)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 border-t border-gray-100"
                          >
                            <Eye size={14} /> Görüntüle
                          </button>
                          
                          {/* Duzenle */}
                          <button 
                            onClick={() => handleEdit(numune.id)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 border-t border-gray-100"
                          >
                            <Edit3 size={14} /> Düzenle
                          </button>
                          
                          {/* Sil */}
                          <button 
                            onClick={() => handleDelete(numune.id)}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-gray-100"
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
          Toplam {filteredNumuneler.length} kayıt<br />
          Toplam Miktar: {filteredNumuneler.reduce((acc, curr) => acc + curr.miktar, 0)} adet
        </div>
      </div>

      <NumuneDetayModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        numuneId={selectedNumuneId} 
      />
    </div>
  );
}

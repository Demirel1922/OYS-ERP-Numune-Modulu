import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Save, CheckCircle, Plus, Trash2, Loader2, X, Check, Edit3 } from 'lucide-react';

interface MeasurementRow {
  id: number;
  bedenler: string;
  renk: string;
  lastikEni: string;
  lastikYuksekligi: string;
  koncEni: string;
  ayakEni: string;
  koncBoyu: string;
  tabanBoyu: string;
  lastikStreci: string;
  koncStreciAyakStreci: string;
  topukStreci: string;
  bord: string;
  miktar: number;
  birim: string;
}

interface YarnRow {
  id: number;
  kullanimYeri: string;
  detay: string;
  denye: string;
  cins: string;
  renkKodu: string;
  renk: string;
  tedarikci: string;
  not: string;
  isFixed: boolean;
}

interface Toast {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'info';
}

const CINSIYET_OPTIONS = [
  { value: '1', label: '1 - Erkek' },
  { value: '2', label: '2 - Kadın' },
  { value: '3', label: '3 - Çocuk' },
  { value: '4', label: '4 - Bebek' },
  { value: '5', label: '5 - Unisex' },
  { value: '6', label: '6 - Külotlu Çorap' },
];

const NUMUNE_TIPI_OPTIONS = [
  { value: '', label: 'Seçiniz' },
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

const SEBEP_OPTIONS = [
  { value: '', label: 'Seçiniz' },
  { value: 'MUSTERI_TALEBI', label: 'Müşteri Talebi' },
  { value: 'SATIS_EKIBI_TALEBI', label: 'Satış Ekibi Talebi' },
  { value: 'FUAR_SONRASI', label: 'Fuar Sonrası Talep' },
  { value: 'YENI_KOLEKSIYON', label: 'Yeni Koleksiyon Geliştirme' },
  { value: 'MEVCUT_REVIZE', label: 'Mevcut Ürünün Revizesi' },
  { value: 'KALITE_PROBLEMI', label: 'Kalite Problemi Sonrası Yeniden Numune' }
];

const CORAP_TIPI_OPTIONS = [
  { value: '', label: 'Seçiniz' },
  { value: 'PATIK', label: 'Patik' },
  { value: 'KISA_KONC', label: 'Kısa Konç' },
  { value: 'NORMAL_KONC', label: 'Normal Konç' },
  { value: 'CETIK', label: 'Çetik' },
  { value: 'DIZALTI', label: 'Dizaltı' },
  { value: 'DIZUSTU', label: 'Dizüstü' },
  { value: 'KULOTLU', label: 'Külotlu Çorap' }
];

const CORAP_DOKUSU_OPTIONS = [
  { value: '', label: 'Seçiniz' },
  { value: 'DUZ', label: 'Düz' },
  { value: 'HAVLU', label: 'Havlu' },
  { value: 'YARIM_HAVLU', label: 'Yarım Havlu' },
  { value: 'TEKNIK_HAVLU', label: 'Teknik Havlu' },
  { value: 'SECMELI_HAVLU', label: 'Seçmeli Havlu' },
  { value: 'DERBILI', label: 'Derbili' }
];

const YIKAMA_OPTIONS = ['Var', 'Yok', 'Hafif', 'Sert'];
const BIRIM_OPTIONS = ['Çift', 'Düzine', 'Adet'];

// Numune No üretim fonksiyonu
const generateNumuneNo = (cinsiyetKodu: string): string => {
  const yilHanesi = new Date().getFullYear().toString().slice(-1);
  const storedSira = localStorage.getItem('numune_sira') || 'A0';
  
  let harf = storedSira.charAt(0);
  let sayi = parseInt(storedSira.slice(1));
  
  sayi++;
  if (sayi > 9) {
    sayi = 1;
    harf = String.fromCharCode(harf.charCodeAt(0) + 1);
    if (harf > 'Z') harf = 'A';
  }
  
  const yeniSira = `${harf}${sayi}`;
  return `${cinsiyetKodu}${yilHanesi}${yeniSira}`;
};

const saveSira = (numuneNo: string) => {
  const sira = numuneNo.slice(2);
  localStorage.setItem('numune_sira', sira);
};

// Sabit iplik satırları (Desen hariç)
const getFixedYarnRows = (): YarnRow[] => [
  { id: 1, kullanimYeri: 'LASTİK', detay: 'Lastik Elastiği', denye: '', cins: '', renkKodu: '', renk: '', tedarikci: '', not: '', isFixed: true },
  { id: 2, kullanimYeri: 'LASTİK', detay: 'Lastik Zemin İpliği', denye: '', cins: '', renkKodu: '', renk: '', tedarikci: '', not: '', isFixed: true },
  { id: 3, kullanimYeri: 'LASTİK', detay: 'Lastik Takviyesi', denye: '', cins: '', renkKodu: '', renk: '', tedarikci: '', not: '', isFixed: true },
  { id: 4, kullanimYeri: 'LASTİK', detay: 'Astar', denye: '', cins: '', renkKodu: '', renk: '', tedarikci: '', not: '', isFixed: true },
  { id: 5, kullanimYeri: 'KONÇ', detay: 'Konç Zemin İpliği', denye: '', cins: '', renkKodu: '', renk: '', tedarikci: '', not: '', isFixed: true },
  { id: 6, kullanimYeri: 'KONÇ', detay: 'Konç Zemin İpliği', denye: '', cins: '', renkKodu: '', renk: '', tedarikci: '', not: '', isFixed: true },
  { id: 7, kullanimYeri: 'KONÇ', detay: 'Konç İplik Altı', denye: '', cins: '', renkKodu: '', renk: '', tedarikci: '', not: '', isFixed: true },
  { id: 8, kullanimYeri: 'TOPUK', detay: 'Topuk Zemin İpliği', denye: '', cins: '', renkKodu: '', renk: '', tedarikci: '', not: '', isFixed: true },
  { id: 9, kullanimYeri: 'TOPUK', detay: 'Topuk İplik Altı', denye: '', cins: '', renkKodu: '', renk: '', tedarikci: '', not: '', isFixed: true },
  { id: 10, kullanimYeri: 'TABAN', detay: 'Taban Zemin İpliği', denye: '', cins: '', renkKodu: '', renk: '', tedarikci: '', not: '', isFixed: true },
  { id: 11, kullanimYeri: 'TABAN', detay: 'Taban Zemin İpliği', denye: '', cins: '', renkKodu: '', renk: '', tedarikci: '', not: '', isFixed: true },
  { id: 12, kullanimYeri: 'TABAN', detay: 'Taban İplik Altı', denye: '', cins: '', renkKodu: '', renk: '', tedarikci: '', not: '', isFixed: true },
  { id: 13, kullanimYeri: 'TABAN ALTI', detay: 'Tabanaltı Zemin İpliği', denye: '', cins: '', renkKodu: '', renk: '', tedarikci: '', not: '', isFixed: true },
  { id: 14, kullanimYeri: 'TABAN ALTI', detay: 'Tabanaltı İplik Altı', denye: '', cins: '', renkKodu: '', renk: '', tedarikci: '', not: '', isFixed: true },
  { id: 15, kullanimYeri: 'BURUN', detay: 'Burun Zemin İpliği', denye: '', cins: '', renkKodu: '', renk: '', tedarikci: '', not: '', isFixed: true },
  { id: 16, kullanimYeri: 'BURUN', detay: 'Burun İplik Altı', denye: '', cins: '', renkKodu: '', renk: '', tedarikci: '', not: '', isFixed: true },
  { id: 17, kullanimYeri: 'BURUN DİKİŞ İPLİĞİ', detay: 'Rosso İşe', denye: '', cins: '', renkKodu: '', renk: '', tedarikci: '', not: '', isFixed: true },
  { id: 18, kullanimYeri: 'BURUN DİKİŞ İPLİĞİ', detay: 'Tek Sıra İşe', denye: '', cins: '', renkKodu: '', renk: '', tedarikci: '', not: '', isFixed: true },
];

const getInitialDesenRow = (id: number, num: number): YarnRow => ({
  id, kullanimYeri: 'DESEN İPLİĞİ', detay: `Desen ${num}`, denye: '', cins: '', renkKodu: '', renk: '', tedarikci: '', not: '', isFixed: false
});

const initialFormData = {
  generalInfo: {
    numuneNo: '',
    cinsiyet: '',
    numuneTipi: '',
    sebep: '',
    musteriKodu: '',
    musteriArtikelKodu: '',
    musteriMarkasi: '',
    corapTipi: '',
    corapDokusu: '',
    igneSayisi: '',
    kovanCapi: '',
    formaBilgisi: '',
    formaSekli: '',
    yikama: '',
    olcuSekli: '',
    corapTanimi: '',
    deseneVerilisTarihi: '',
    hedefTarih: ''
  },
  measurements: [{ 
    id: 1, 
    bedenler: '', 
    renk: '', 
    lastikEni: '', 
    lastikYuksekligi: '', 
    koncEni: '', 
    ayakEni: '', 
    koncBoyu: '', 
    tabanBoyu: '', 
    lastikStreci: '', 
    koncStreciAyakStreci: '', 
    topukStreci: '', 
    bord: '', 
    miktar: 1, 
    birim: 'Çift' 
  }] as MeasurementRow[],
  yarnInfo: [...getFixedYarnRows(), getInitialDesenRow(19, 1)] as YarnRow[],
  desenCount: 1
};

export function YeniNumune() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'general' | 'measurements' | 'yarn'>('general');
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<Toast>({ show: false, message: '', type: 'success' });
  const [status, setStatus] = useState<'TASLAK' | 'ONAYDA' | 'ONAYLI'>('TASLAK');
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState(initialFormData);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type }), 3000);
  }, []);

  // Edit modu kontrolü
  useEffect(() => {
    if (location.state?.editMode && location.state?.numuneId) {
      setIsEditMode(true);
      setEditId(location.state.numuneId);
      
      const liste = JSON.parse(localStorage.getItem('oys_numune_listesi') || '[]');
      const bulunan = liste.find((n: any) => n.id === location.state.numuneId);
      if (bulunan) {
        setFormData(prev => ({
          ...prev,
          generalInfo: { ...prev.generalInfo, ...bulunan.generalInfo },
          measurements: bulunan.measurements || prev.measurements,
          yarnInfo: bulunan.yarnInfo || prev.yarnInfo,
          desenCount: bulunan.desenCount || 1
        }));
        setStatus(bulunan.durum || 'TASLAK');
        showToast('Düzenleme modu aktif', 'info');
      }
    }
  }, [location, showToast]);

  // LocalStorage'dan yükleme (sadece yeni kayıt için)
  useEffect(() => {
    if (!isEditMode) {
      const saved = localStorage.getItem('yeniNumune_formData');
      const savedTime = localStorage.getItem('yeniNumune_lastSaved');
      if (saved) {
        const confirmLoad = window.confirm('Önceki kaydınızı geri yüklemek ister misiniz?');
        if (confirmLoad) {
          setFormData(JSON.parse(saved));
          if (savedTime) setLastSaved(savedTime);
          showToast('Önceki kayıt yüklendi', 'info');
        }
      }
    }
  }, [isEditMode, showToast]);

  // Otomatik kaydetme (30 saniyede bir)
  useEffect(() => {
    const interval = setInterval(() => {
      localStorage.setItem('yeniNumune_formData', JSON.stringify(formData));
      localStorage.setItem('yeniNumune_lastSaved', new Date().toISOString());
      setLastSaved(new Date().toISOString());
    }, 30000);
    return () => clearInterval(interval);
  }, [formData]);

  // Cinsiyet değişince Numune No güncelle
  useEffect(() => {
    if (formData.generalInfo.cinsiyet && !isEditMode) {
      const newNumuneNo = generateNumuneNo(formData.generalInfo.cinsiyet);
      setFormData(prev => ({
        ...prev,
        generalInfo: { ...prev.generalInfo, numuneNo: newNumuneNo }
      }));
    }
  }, [formData.generalInfo.cinsiyet, isEditMode]);

  const handleGeneralChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      generalInfo: { ...prev.generalInfo, [field]: value }
    }));
  };

  const handleMeasurementChange = (rowIndex: number, field: keyof MeasurementRow, value: string | number) => {
    setFormData(prev => {
      const newMeasurements = [...prev.measurements];
      newMeasurements[rowIndex] = { ...newMeasurements[rowIndex], [field]: value };
      return { ...prev, measurements: newMeasurements };
    });
  };

  const addMeasurementRow = () => {
    if (formData.measurements.length >= 10) {
      showToast('En fazla 10 ölçü satırı eklenebilir', 'error');
      return;
    }
    setFormData(prev => ({
      ...prev,
      measurements: [...prev.measurements, { 
        id: Date.now(), 
        bedenler: '', 
        renk: '', 
        lastikEni: '', 
        lastikYuksekligi: '', 
        koncEni: '', 
        ayakEni: '', 
        koncBoyu: '', 
        tabanBoyu: '', 
        lastikStreci: '', 
        koncStreciAyakStreci: '', 
        topukStreci: '', 
        bord: '', 
        miktar: 1, 
        birim: 'Çift' 
      }]
    }));
  };

  const removeMeasurementRow = (index: number) => {
    if (formData.measurements.length <= 1) {
      showToast('En az bir ölçü satırı kalmalıdır', 'error');
      return;
    }
    setFormData(prev => ({
      ...prev,
      measurements: prev.measurements.filter((_, i) => i !== index)
    }));
  };

  const handleYarnChange = (index: number, field: keyof YarnRow, value: string) => {
    setFormData(prev => {
      const newYarnInfo = [...prev.yarnInfo];
      newYarnInfo[index] = { ...newYarnInfo[index], [field]: value };
      return { ...prev, yarnInfo: newYarnInfo };
    });
  };

  const addDesenRow = () => {
    if (formData.desenCount >= 10) {
      showToast('En fazla 10 desen eklenebilir', 'error');
      return;
    }
    const newCount = formData.desenCount + 1;
    setFormData(prev => ({
      ...prev,
      yarnInfo: [...prev.yarnInfo, getInitialDesenRow(18 + newCount, newCount)],
      desenCount: newCount
    }));
  };

  const removeDesenRow = (index: number) => {
    if (formData.desenCount <= 1) {
      showToast('En az bir desen satırı kalmalıdır', 'error');
      return;
    }
    setFormData(prev => ({
      ...prev,
      yarnInfo: prev.yarnInfo.filter((_, i) => i !== index),
      desenCount: prev.desenCount - 1
    }));
  };

  const isGeneralInfoComplete = () => {
    const g = formData.generalInfo;
    return g.cinsiyet?.trim() &&
           g.numuneTipi?.trim() &&
           g.sebep?.trim() &&
           g.musteriKodu?.trim() &&
           g.hedefTarih;
  };

  const hasValidMeasurement = () => {
    return formData.measurements.some(row => 
      row.bedenler?.trim() &&
      row.renk?.trim() &&
      row.miktar >= 1
    );
  };

  const canAccessMeasurements = isGeneralInfoComplete();
  const canAccessYarn = canAccessMeasurements && hasValidMeasurement();

  const getMissingGeneralFields = () => {
    const g = formData.generalInfo;
    const missing = [];
    if (!g.cinsiyet?.trim()) missing.push('Cinsiyet');
    if (!g.numuneTipi?.trim()) missing.push('Numune Tipi');
    if (!g.sebep?.trim()) missing.push('Sebep');
    if (!g.musteriKodu?.trim()) missing.push('Müşteri Kodu');
    if (!g.hedefTarih) missing.push('Hedef Tarih');
    return missing;
  };

  const handleTabClick = (tab: 'general' | 'measurements' | 'yarn') => {
    if (tab === 'measurements') {
      const missing = getMissingGeneralFields();
      if (missing.length > 0) {
        showToast(`Önce şu alanları doldurun: ${missing.join(', ')}`, 'error');
        return;
      }
    }
    if (tab === 'yarn') {
      if (!hasValidMeasurement()) {
        showToast('Ölçüler sekmesinde en az bir satırda Beden, Renk ve Miktar girilmelidir', 'error');
        return;
      }
    }
    setActiveTab(tab);
  };

  const validate = () => {
    const g = formData.generalInfo;
    if (!g.cinsiyet?.trim()) { showToast('Cinsiyet zorunludur', 'error'); return false; }
    if (!g.numuneTipi?.trim()) { showToast('Numune Tipi zorunludur', 'error'); return false; }
    if (!g.sebep?.trim()) { showToast('Numunenin Sebebi zorunludur', 'error'); return false; }
    if (!g.musteriKodu?.trim()) { showToast('Müşteri Kodu zorunludur', 'error'); return false; }
    if (!g.hedefTarih) { showToast('Hedef Tarih zorunludur', 'error'); return false; }
    
    if (g.deseneVerilisTarihi && g.hedefTarih) {
      if (new Date(g.deseneVerilisTarihi) > new Date(g.hedefTarih)) {
        showToast('Desene veriliş tarihi, hedef tarihten sonra olamaz', 'error');
        return false;
      }
    }

    if (!hasValidMeasurement()) {
      showToast('Ölçüler sekmesinde en az bir satırda Beden, Renk ve Miktar girilmelidir', 'error');
      return false;
    }

    const hasYarnData = formData.yarnInfo.some(
      row => row.denye?.trim() || row.cins?.trim() || row.renkKodu?.trim() ||
             row.renk?.trim() || row.tedarikci?.trim() || row.not?.trim()
    );
    if (!hasYarnData) {
      showToast('İplik Bilgileri tamamen boş bırakılamaz', 'error');
      return false;
    }
    return true;
  };

  const calculateTotalMiktar = () => {
    return formData.measurements.reduce((acc, row) => acc + (row.miktar || 0), 0);
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 500));
    
    const yeniNumune = {
      id: isEditMode ? editId : Date.now(),
      numuneNo: formData.generalInfo.numuneNo,
      musteri: formData.generalInfo.musteriKodu,
      musteriArtikelNo: formData.generalInfo.musteriArtikelKodu,
      refNo: '-',
      durum: 'TASLAK',
      termin: formData.generalInfo.hedefTarih,
      miktar: calculateTotalMiktar(),
      gonderim: '-',
      numuneTipi: formData.generalInfo.numuneTipi,
      generalInfo: formData.generalInfo,
      measurements: formData.measurements,
      yarnInfo: formData.yarnInfo,
      desenCount: formData.desenCount,
      olusturmaTarihi: new Date().toISOString()
    };
    
    const mevcutListe = JSON.parse(localStorage.getItem('oys_numune_listesi') || '[]');
    let yeniListe;
    
    if (isEditMode) {
      yeniListe = mevcutListe.map((n: any) => n.id === editId ? yeniNumune : n);
    } else {
      yeniListe = [yeniNumune, ...mevcutListe];
    }
    
    localStorage.setItem('oys_numune_listesi', JSON.stringify(yeniListe));
    setStatus('TASLAK');
    localStorage.removeItem('yeniNumune_formData');
    localStorage.removeItem('yeniNumune_lastSaved');
    showToast(isEditMode ? 'Güncellendi' : 'Taslak olarak kaydedildi', 'success');
    setIsSaving(false);
    
    navigate('/numune/talepler', { state: { refresh: true, timestamp: Date.now() } });
  };

  const handleSaveAndApprove = async () => {
    if (!validate()) return;
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 500));
    
    if (formData.generalInfo.numuneNo && !isEditMode) {
      saveSira(formData.generalInfo.numuneNo);
    }
    
    const yeniNumune = {
      id: isEditMode ? editId : Date.now(),
      numuneNo: formData.generalInfo.numuneNo,
      musteri: formData.generalInfo.musteriKodu,
      musteriArtikelNo: formData.generalInfo.musteriArtikelKodu,
      refNo: '-',
      durum: 'ONAYDA',
      termin: formData.generalInfo.hedefTarih,
      miktar: calculateTotalMiktar(),
      gonderim: '-',
      numuneTipi: formData.generalInfo.numuneTipi,
      generalInfo: formData.generalInfo,
      measurements: formData.measurements,
      yarnInfo: formData.yarnInfo,
      desenCount: formData.desenCount,
      olusturmaTarihi: new Date().toISOString()
    };
    
    const mevcutListe = JSON.parse(localStorage.getItem('oys_numune_listesi') || '[]');
    let yeniListe;
    
    if (isEditMode) {
      yeniListe = mevcutListe.map((n: any) => n.id === editId ? yeniNumune : n);
    } else {
      yeniListe = [yeniNumune, ...mevcutListe];
    }
    
    localStorage.setItem('oys_numune_listesi', JSON.stringify(yeniListe));
    setStatus('ONAYDA');
    localStorage.removeItem('yeniNumune_formData');
    localStorage.removeItem('yeniNumune_lastSaved');
    showToast(isEditMode ? 'Güncellendi ve Onaylandı' : 'Kaydedildi ve Onaylandı', 'success');
    setIsSaving(false);
    
    navigate('/numune/talepler', { state: { refresh: true, timestamp: Date.now() } });
  };

  const getStatusBadgeColor = () => {
    switch (status) {
      case 'TASLAK': return 'bg-gray-100 text-gray-600';
      case 'ONAYDA': return 'bg-yellow-100 text-yellow-700';
      case 'ONAYLI': return 'bg-green-100 text-green-700';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Toast */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
          toast.type === 'success' ? 'bg-green-600 text-white' : 
          toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'
        }`}>
          {toast.type === 'success' ? <Check size={18} /> : toast.type === 'error' ? <X size={18} /> : <Check size={18} />}
          {toast.message}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {/* Üst Bilgi */}
        <div className="flex justify-between items-start mb-6 border-b border-gray-200 pb-4">
          <div>
            <button onClick={() => navigate(-1)} className="text-sm text-gray-500 mb-2 flex items-center gap-1 hover:text-gray-700">
              <ArrowLeft size={16} /> Geri
            </button>
            <h1 className="text-2xl font-bold text-gray-900">{isEditMode ? 'Numune Düzenle' : 'Yeni Numune'}</h1>
            <p className="text-gray-500 mt-1">{isEditMode ? 'Mevcut numuneyi düzenleyin' : 'Yeni bir numune oluşturun'}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor()}`}>
              Durum: {status}
            </span>
            {lastSaved && (
              <span className="text-xs text-gray-400">
                Son kayıt: {new Date(lastSaved).toLocaleTimeString()}
              </span>
            )}
            <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50">
              {isSaving ? <Loader2 size={18} className="animate-spin" /> : isEditMode ? <Edit3 size={18} /> : <Save size={18} />} 
              {isEditMode ? 'Güncelle' : 'Kaydet'}
            </button>
            <button onClick={handleSaveAndApprove} disabled={isSaving} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
              {isSaving ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />} 
              {isEditMode ? 'Güncelle & Onayla' : 'Kaydet & Onayla'}
            </button>
          </div>
        </div>

        {/* Sekmeler */}
        <div className="flex border-b border-gray-200 mb-6">
          <button onClick={() => handleTabClick('general')} className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${activeTab === 'general' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            Genel Bilgiler
          </button>
          <button onClick={() => handleTabClick('measurements')} className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${activeTab === 'measurements' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'} ${!canAccessMeasurements ? 'opacity-50' : ''}`}>
            Ölçüler
          </button>
          <button onClick={() => handleTabClick('yarn')} className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${activeTab === 'yarn' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'} ${!canAccessYarn ? 'opacity-50' : ''}`}>
            İplik Bilgileri
          </button>
        </div>

        {/* Genel Bilgiler */}
        {activeTab === 'general' && (
          <div className="space-y-4">
            {/* Satır 1: Numune No */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Numune No</label>
                <input type="text" disabled value={formData.generalInfo.numuneNo} placeholder="Cinsiyet seçince otomatik oluşur" className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-600" />
              </div>
            </div>

            {/* Satır 2: Cinsiyet */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cinsiyet *</label>
                <select value={formData.generalInfo.cinsiyet} onChange={(e) => handleGeneralChange('cinsiyet', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-900 focus:border-gray-900">
                  <option value="">Seçiniz</option>
                  {CINSIYET_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>

            {/* Satır 3: Numune Tipi */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Numune Tipi *</label>
                <select value={formData.generalInfo.numuneTipi} onChange={(e) => handleGeneralChange('numuneTipi', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-900 focus:border-gray-900">
                  {NUMUNE_TIPI_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>

            {/* Satır 4: Numunenin Sebebi */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Numunenin Sebebi *</label>
                <select value={formData.generalInfo.sebep} onChange={(e) => handleGeneralChange('sebep', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-900 focus:border-gray-900">
                  {SEBEP_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>

            {/* Satır 5: Müşteri Bilgileri (3'lü) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Müşteri Kodu *</label>
                <input type="text" value={formData.generalInfo.musteriKodu} onChange={(e) => handleGeneralChange('musteriKodu', e.target.value)} placeholder="Müşteri kodu" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-900 focus:border-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Müşteri Artikel Kodu</label>
                <input type="text" value={formData.generalInfo.musteriArtikelKodu} onChange={(e) => handleGeneralChange('musteriArtikelKodu', e.target.value)} placeholder="Artikel no" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-900 focus:border-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Müşteri Markası</label>
                <input type="text" value={formData.generalInfo.musteriMarkasi} onChange={(e) => handleGeneralChange('musteriMarkasi', e.target.value)} placeholder="Marka adı" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-900 focus:border-gray-900" />
              </div>
            </div>

            {/* Satır 6: Çorap Tipi ve Dokusu */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Çorap Tipi</label>
                <select value={formData.generalInfo.corapTipi} onChange={(e) => handleGeneralChange('corapTipi', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-900 focus:border-gray-900">
                  {CORAP_TIPI_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Çorap Dokusu</label>
                <select value={formData.generalInfo.corapDokusu} onChange={(e) => handleGeneralChange('corapDokusu', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-900 focus:border-gray-900">
                  {CORAP_DOKUSU_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>

            {/* Satır 7: İğne Sayısı ve Kovan Çapı */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">İğne Sayısı</label>
                <input type="number" value={formData.generalInfo.igneSayisi} onChange={(e) => handleGeneralChange('igneSayisi', e.target.value)} placeholder="örn: 168" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-900 focus:border-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kovan Çapı</label>
                <input type="number" step="0.1" value={formData.generalInfo.kovanCapi} onChange={(e) => handleGeneralChange('kovanCapi', e.target.value)} placeholder="örn: 3.5" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-900 focus:border-gray-900" />
              </div>
            </div>

            {/* Satır 8: Forma Bilgisi ve Forma Şekli (bitişik) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Forma Bilgisi</label>
                <input type="text" value={formData.generalInfo.formaBilgisi} onChange={(e) => handleGeneralChange('formaBilgisi', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-900 focus:border-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Forma Şekli</label>
                <input type="text" value={formData.generalInfo.formaSekli} onChange={(e) => handleGeneralChange('formaSekli', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-900 focus:border-gray-900" />
              </div>
            </div>

            {/* Satır 9: Yıkama */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Yıkama</label>
                <select value={formData.generalInfo.yikama} onChange={(e) => handleGeneralChange('yikama', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-900 focus:border-gray-900">
                  <option value="">Seçiniz</option>
                  {YIKAMA_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>

            {/* Satır 10: Ölçü Şekli */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ölçü Şekli</label>
                <input type="text" value={formData.generalInfo.olcuSekli} onChange={(e) => handleGeneralChange('olcuSekli', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-900 focus:border-gray-900" />
              </div>
            </div>

            {/* Satır 11: Çorap Tanımı */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Çorap Tanımı</label>
                <textarea value={formData.generalInfo.corapTanimi} onChange={(e) => handleGeneralChange('corapTanimi', e.target.value)} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-900 focus:border-gray-900" />
              </div>
            </div>

            {/* Satır 12: Tarihler (Desene Veriliş üstte, Hedef altta) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Desene Veriliş Tarihi (Talep Edilen Tarih)</label>
                <input type="date" value={formData.generalInfo.deseneVerilisTarihi} onChange={(e) => handleGeneralChange('deseneVerilisTarihi', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-900 focus:border-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hedef Tarih *</label>
                <input type="date" value={formData.generalInfo.hedefTarih} onChange={(e) => handleGeneralChange('hedefTarih', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-900 focus:border-gray-900" />
              </div>
            </div>
          </div>
        )}

        {/* Ölçüler */}
        {activeTab === 'measurements' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Ölçü Tablosu</h3>
              <button onClick={addMeasurementRow} className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                <Plus size={16} /> Yeni Beden Ekle
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-200">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-2 py-2 text-left font-medium text-gray-700 min-w-[80px]">İşlem</th>
                    <th className="px-2 py-2 text-left font-medium text-gray-700 min-w-[100px]">Bedenler *</th>
                    <th className="px-2 py-2 text-left font-medium text-gray-700 min-w-[80px]">Renk *</th>
                    <th className="px-2 py-2 text-left font-medium text-gray-700 min-w-[80px]">Lastik Eni</th>
                    <th className="px-2 py-2 text-left font-medium text-gray-700 min-w-[100px]">Lastik Yüksekliği</th>
                    <th className="px-2 py-2 text-left font-medium text-gray-700 min-w-[80px]">Konç Eni</th>
                    <th className="px-2 py-2 text-left font-medium text-gray-700 min-w-[80px]">Ayak Eni</th>
                    <th className="px-2 py-2 text-left font-medium text-gray-700 min-w-[80px]">Konç Boyu</th>
                    <th className="px-2 py-2 text-left font-medium text-gray-700 min-w-[80px]">Taban Boyu</th>
                    <th className="px-2 py-2 text-left font-medium text-gray-700 min-w-[80px]">Lastik Streçi</th>
                    <th className="px-2 py-2 text-left font-medium text-gray-700 min-w-[120px]">Konç Streçi / Ayak Streçi</th>
                    <th className="px-2 py-2 text-left font-medium text-gray-700 min-w-[80px]">Topuk Streçi</th>
                    <th className="px-2 py-2 text-left font-medium text-gray-700 min-w-[60px]">Bord</th>
                    <th className="px-2 py-2 text-left font-medium text-gray-700 min-w-[80px]">Miktar *</th>
                    <th className="px-2 py-2 text-left font-medium text-gray-700 min-w-[80px]">Birim</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.measurements.map((row, idx) => (
                    <tr key={row.id} className="border-b border-gray-100">
                      <td className="px-2 py-1">
                        <button onClick={() => removeMeasurementRow(idx)} className="text-red-500 hover:text-red-700 p-1">
                          <Trash2 size={16} />
                        </button>
                      </td>
                      <td className="px-2 py-1"><input type="text" value={row.bedenler} onChange={(e) => handleMeasurementChange(idx, 'bedenler', e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1 text-sm" /></td>
                      <td className="px-2 py-1"><input type="text" value={row.renk} onChange={(e) => handleMeasurementChange(idx, 'renk', e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1 text-sm" /></td>
                      <td className="px-2 py-1"><input type="text" value={row.lastikEni} onChange={(e) => handleMeasurementChange(idx, 'lastikEni', e.target.value)} placeholder="cm" className="w-full border border-gray-300 rounded px-2 py-1 text-sm" /></td>
                      <td className="px-2 py-1"><input type="text" value={row.lastikYuksekligi} onChange={(e) => handleMeasurementChange(idx, 'lastikYuksekligi', e.target.value)} placeholder="cm" className="w-full border border-gray-300 rounded px-2 py-1 text-sm" /></td>
                      <td className="px-2 py-1"><input type="text" value={row.koncEni} onChange={(e) => handleMeasurementChange(idx, 'koncEni', e.target.value)} placeholder="cm" className="w-full border border-gray-300 rounded px-2 py-1 text-sm" /></td>
                      <td className="px-2 py-1"><input type="text" value={row.ayakEni} onChange={(e) => handleMeasurementChange(idx, 'ayakEni', e.target.value)} placeholder="cm" className="w-full border border-gray-300 rounded px-2 py-1 text-sm" /></td>
                      <td className="px-2 py-1"><input type="text" value={row.koncBoyu} onChange={(e) => handleMeasurementChange(idx, 'koncBoyu', e.target.value)} placeholder="cm" className="w-full border border-gray-300 rounded px-2 py-1 text-sm" /></td>
                      <td className="px-2 py-1"><input type="text" value={row.tabanBoyu} onChange={(e) => handleMeasurementChange(idx, 'tabanBoyu', e.target.value)} placeholder="cm" className="w-full border border-gray-300 rounded px-2 py-1 text-sm" /></td>
                      <td className="px-2 py-1"><input type="text" value={row.lastikStreci} onChange={(e) => handleMeasurementChange(idx, 'lastikStreci', e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1 text-sm" /></td>
                      <td className="px-2 py-1"><input type="text" value={row.koncStreciAyakStreci} onChange={(e) => handleMeasurementChange(idx, 'koncStreciAyakStreci', e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1 text-sm" /></td>
                      <td className="px-2 py-1"><input type="text" value={row.topukStreci} onChange={(e) => handleMeasurementChange(idx, 'topukStreci', e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1 text-sm" /></td>
                      <td className="px-2 py-1"><input type="text" value={row.bord} onChange={(e) => handleMeasurementChange(idx, 'bord', e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1 text-sm" /></td>
                      <td className="px-2 py-1"><input type="number" min={1} value={row.miktar} onChange={(e) => handleMeasurementChange(idx, 'miktar', parseInt(e.target.value) || 1)} className="w-full border border-gray-300 rounded px-2 py-1 text-sm" /></td>
                      <td className="px-2 py-1">
                        <select value={row.birim} onChange={(e) => handleMeasurementChange(idx, 'birim', e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1 text-sm">
                          {BIRIM_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* İplik Bilgileri */}
        {activeTab === 'yarn' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">İplik Bilgileri</h3>
              <button 
                onClick={addDesenRow} 
                disabled={formData.desenCount >= 10} 
                title={formData.desenCount >= 10 ? 'Maksimum 10 desen eklenebilir' : ''}
                className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={16} /> Desen Ekle ({formData.desenCount}/10)
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-200">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-2 py-2 text-left font-medium text-gray-700 min-w-[140px]">İpliğin Kullanım Yeri</th>
                    <th className="px-2 py-2 text-left font-medium text-gray-700 min-w-[140px]">Detay</th>
                    <th className="px-2 py-2 text-left font-medium text-gray-700 min-w-[60px]">Denye</th>
                    <th className="px-2 py-2 text-left font-medium text-gray-700 min-w-[80px]">Cins</th>
                    <th className="px-2 py-2 text-left font-medium text-gray-700 min-w-[80px]">Renk Kodu</th>
                    <th className="px-2 py-2 text-left font-medium text-gray-700 min-w-[80px]">Renk</th>
                    <th className="px-2 py-2 text-left font-medium text-gray-700 min-w-[100px]">Tedarikçi</th>
                    <th className="px-2 py-2 text-left font-medium text-gray-700 min-w-[120px]">Not</th>
                    <th className="px-2 py-2 text-left font-medium text-gray-700 min-w-[60px]">İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.yarnInfo.map((row, idx) => (
                    <tr key={row.id} className="border-b border-gray-100">
                      <td className="px-2 py-1 text-gray-600 font-medium">{row.kullanimYeri}</td>
                      <td className="px-2 py-1 text-gray-600">{row.detay}</td>
                      <td className="px-2 py-1"><input type="text" value={row.denye} onChange={(e) => handleYarnChange(idx, 'denye', e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1 text-sm" /></td>
                      <td className="px-2 py-1"><input type="text" value={row.cins} onChange={(e) => handleYarnChange(idx, 'cins', e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1 text-sm" /></td>
                      <td className="px-2 py-1"><input type="text" value={row.renkKodu} onChange={(e) => handleYarnChange(idx, 'renkKodu', e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1 text-sm" /></td>
                      <td className="px-2 py-1"><input type="text" value={row.renk} onChange={(e) => handleYarnChange(idx, 'renk', e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1 text-sm" /></td>
                      <td className="px-2 py-1"><input type="text" value={row.tedarikci} onChange={(e) => handleYarnChange(idx, 'tedarikci', e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1 text-sm" /></td>
                      <td className="px-2 py-1"><input type="text" value={row.not} onChange={(e) => handleYarnChange(idx, 'not', e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1 text-sm" /></td>
                      <td className="px-2 py-1">
                        {!row.isFixed && (
                          <button onClick={() => removeDesenRow(idx)} className="text-red-500 hover:text-red-700 p-1">
                            <Trash2 size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

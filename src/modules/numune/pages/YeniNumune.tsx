import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, CheckCircle, Plus, Trash2 } from 'lucide-react';

interface Kalem {
  id: number;
  urunAdi: string;
  cinsiyet: string;
  tip: string;
  renk: string;
  beden: string;
  miktar: number;
  birim: string;
}

export function YeniNumune() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    musteri: '',
    refNo: '',
    termin: '',
    teslimSekli: '',
    tip: '',
    musteriNotu: '',
    dahiliNot: ''
  });
  
  const [kalemler, setKalemler] = useState<Kalem[]>([]);
  const [yeniKalem, setYeniKalem] = useState({
    urunAdi: '',
    cinsiyet: '',
    tip: '',
    renk: '',
    beden: '',
    miktar: 1,
    birim: 'Çift'
  });

  const kalemEkle = () => {
    if (!yeniKalem.urunAdi) {
      alert('Ürün adı zorunludur');
      return;
    }
    const yeniKalemObj: Kalem = {
      id: Date.now(),
      ...yeniKalem
    };
    setKalemler([...kalemler, yeniKalemObj]);
    setYeniKalem({
      urunAdi: '',
      cinsiyet: '',
      tip: '',
      renk: '',
      beden: '',
      miktar: 1,
      birim: 'Çift'
    });
  };

  const kalemSil = (id: number) => {
    setKalemler(kalemler.filter(k => k.id !== id));
  };

  const validateForm = () => {
    if (!formData.musteri) { 
      alert('Müşteri seçimi zorunludur'); 
      return false; 
    }
    if (!formData.termin) { 
      alert('İstenen termin zorunludur'); 
      return false; 
    }
    if (kalemler.length === 0) { 
      alert('En az bir kalem eklemelisiniz'); 
      return false; 
    }
    return true;
  };

  const handleSave = () => {
    if (!validateForm()) return;
    const tumVeri = { 
      ...formData, 
      kalemler, 
      toplamCift: kalemler.reduce((acc, k) => acc + (k.birim === 'Çift' ? k.miktar : 0), 0) 
    };
    console.log('KAYDEDİLEN NUMUNE:', tumVeri);
    alert('Numune başarıyla kaydedildi (sayfada kalındı)');
  };

  const handleSaveAndApprove = () => {
    if (!validateForm()) return;
    const tumVeri = { 
      ...formData, 
      kalemler, 
      toplamCift: kalemler.reduce((acc, k) => acc + (k.birim === 'Çift' ? k.miktar : 0), 0) 
    };
    console.log('KAYDEDİLEN VE ONAYLANAN NUMUNE:', tumVeri);
    alert('Numune kaydedildi ve onaylandı');
    navigate('/numune/talepler');
  };

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {/* Üst Bilgi Çubuğu */}
        <div className="flex justify-between items-start mb-6 border-b border-gray-200 pb-4">
          <div>
            <button 
              onClick={() => navigate(-1)}
              className="text-sm text-gray-500 mb-2 flex items-center gap-1 hover:text-gray-700"
            >
              <ArrowLeft size={16} /> Ana Menüye Dön
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Yeni Numune</h1>
            <p className="text-gray-500 mt-1">Yeni bir numune oluşturun</p>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={handleSave} 
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
            >
              <Save size={18} /> Kaydet
            </button>
            <button 
              onClick={handleSaveAndApprove} 
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
            >
              <CheckCircle size={18} /> Kaydet & Onayla
            </button>
          </div>
        </div>

        {/* Form Alanları - Satır 1 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Numune No</label>
            <input 
              type="text" 
              disabled 
              placeholder="Otomatik oluşturulacak" 
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-gray-500" 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Müşteri *</label>
            <select 
              value={formData.musteri} 
              onChange={(e) => setFormData({...formData, musteri: e.target.value})} 
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">Müşteri seçin...</option>
              <option value="ABC Tekstil">ABC Tekstil</option>
              <option value="XYZ Giyim">XYZ Giyim</option>
              <option value="Global Socks">Global Socks</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Müşteri Referans No</label>
            <input 
              type="text" 
              value={formData.refNo} 
              onChange={(e) => setFormData({...formData, refNo: e.target.value})} 
              placeholder="Müşteri PO / Referans numarası" 
              className="w-full border border-gray-300 rounded-lg px-3 py-2" 
            />
          </div>
        </div>

        {/* Form Alanları - Satır 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">İstenen Termin *</label>
            <input 
              type="date" 
              value={formData.termin} 
              onChange={(e) => setFormData({...formData, termin: e.target.value})} 
              className="w-full border border-gray-300 rounded-lg px-3 py-2" 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teslim Şekli</label>
            <select 
              value={formData.teslimSekli} 
              onChange={(e) => setFormData({...formData, teslimSekli: e.target.value})} 
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">Seçiniz</option>
              <option value="Kargo">Kargo</option>
              <option value="Elden">Elden</option>
              <option value="Kurye">Kurye</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Numune Tipi</label>
            <select 
              value={formData.tip} 
              onChange={(e) => setFormData({...formData, tip: e.target.value})} 
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">Seçiniz</option>
              <option value="Örme">Örme</option>
              <option value="Boyalı">Boyalı</option>
              <option value="Dikişli">Dikişli</option>
              <option value="Paketli">Paketli</option>
            </select>
          </div>
        </div>

        {/* Numune Kalemleri Bölümü */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Numune Kalemleri</h3>
          
          {/* Kalem giriş satırı */}
          <div className="grid grid-cols-12 gap-2 mb-4 items-end">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Ürün Adı</label>
              <input 
                type="text" 
                value={yeniKalem.urunAdi} 
                onChange={(e) => setYeniKalem({...yeniKalem, urunAdi: e.target.value})} 
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm" 
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Cinsiyet</label>
              <select 
                value={yeniKalem.cinsiyet} 
                onChange={(e) => setYeniKalem({...yeniKalem, cinsiyet: e.target.value})} 
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
              >
                <option value="">Seçiniz</option>
                <option value="Erkek">Erkek</option>
                <option value="Kadın">Kadın</option>
                <option value="Unisex">Unisex</option>
                <option value="Çocuk">Çocuk</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Tip</label>
              <select 
                value={yeniKalem.tip} 
                onChange={(e) => setYeniKalem({...yeniKalem, tip: e.target.value})} 
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
              >
                <option value="">Seçiniz</option>
                <option value="Patik">Patik</option>
                <option value="Kısa">Kısa</option>
                <option value="Yarım">Yarım</option>
                <option value="Dizaltı">Dizaltı</option>
                <option value="Dizüstü">Dizüstü</option>
              </select>
            </div>
            <div className="col-span-1">
              <label className="block text-xs font-medium text-gray-600 mb-1">Renk</label>
              <input 
                type="text" 
                value={yeniKalem.renk} 
                onChange={(e) => setYeniKalem({...yeniKalem, renk: e.target.value})} 
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm" 
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Beden</label>
              <select 
                value={yeniKalem.beden} 
                onChange={(e) => setYeniKalem({...yeniKalem, beden: e.target.value})} 
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
              >
                <option value="">Seçiniz</option>
                <option value="Tek Ebat">Tek Ebat</option>
                <option value="35-38">35-38</option>
                <option value="39-42">39-42</option>
                <option value="43-46">43-46</option>
              </select>
            </div>
            <div className="col-span-1">
              <label className="block text-xs font-medium text-gray-600 mb-1">Miktar</label>
              <input 
                type="number" 
                min="1" 
                value={yeniKalem.miktar} 
                onChange={(e) => setYeniKalem({...yeniKalem, miktar: parseInt(e.target.value) || 1})} 
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm" 
              />
            </div>
            <div className="col-span-1">
              <label className="block text-xs font-medium text-gray-600 mb-1">Birim</label>
              <select 
                value={yeniKalem.birim} 
                onChange={(e) => setYeniKalem({...yeniKalem, birim: e.target.value})} 
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
              >
                <option value="Çift">Çift</option>
                <option value="Adet">Adet</option>
              </select>
            </div>
            <div className="col-span-1">
              <button 
                onClick={kalemEkle} 
                className="w-full bg-green-600 text-white rounded py-1 px-2 hover:bg-green-700 flex items-center justify-center"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
          
          {/* Eklenen kalemler listesi */}
          {kalemler.length > 0 && (
            <div className="bg-white rounded border border-gray-200 mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-2 px-3 font-medium text-gray-600">Ürün Adı</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-600">Cinsiyet</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-600">Tip</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-600">Renk</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-600">Beden</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-600">Miktar</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-600">İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {kalemler.map((kalem) => (
                    <tr key={kalem.id} className="border-b border-gray-100">
                      <td className="py-2 px-3">{kalem.urunAdi}</td>
                      <td className="py-2 px-3">{kalem.cinsiyet}</td>
                      <td className="py-2 px-3">{kalem.tip}</td>
                      <td className="py-2 px-3">{kalem.renk}</td>
                      <td className="py-2 px-3">{kalem.beden}</td>
                      <td className="py-2 px-3">{kalem.miktar} {kalem.birim}</td>
                      <td className="py-2 px-3">
                        <button 
                          onClick={() => kalemSil(kalem.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Toplam bilgisi */}
          <div className="flex justify-between items-center text-sm text-gray-600 bg-white p-3 rounded border border-gray-200">
            <span>Toplam {kalemler.length} kalem</span>
            <span className="font-semibold">
              Toplam: {kalemler.reduce((acc, k) => acc + (k.birim === 'Çift' ? k.miktar : 0), 0)} çift
            </span>
          </div>
        </div>

        {/* Notlar Bölümü */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Müşteri Notları</label>
            <textarea 
              value={formData.musteriNotu} 
              onChange={(e) => setFormData({...formData, musteriNotu: e.target.value})} 
              rows={3} 
              className="w-full border border-gray-300 rounded-lg px-3 py-2" 
              placeholder="Müşteriye iletilecek notlar..." 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dahili Notlar</label>
            <textarea 
              value={formData.dahiliNot} 
              onChange={(e) => setFormData({...formData, dahiliNot: e.target.value})} 
              rows={3} 
              className="w-full border border-gray-300 rounded-lg px-3 py-2" 
              placeholder="Dahili kullanım için notlar..." 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

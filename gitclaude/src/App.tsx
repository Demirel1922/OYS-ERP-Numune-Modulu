import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Numune Modülü sayfaları
import { NumuneDashboard } from '@/modules/numune/pages/NumuneDashboard';
import { NumuneTaleplerPage } from '@/modules/numune/pages/NumuneTaleplerPage';
import { YeniNumune } from '@/modules/numune/pages/YeniNumune';
import { MusteriAnalizi } from '@/modules/numune/pages/MusteriAnalizi';

// Üretim Hazırlık Modülü sayfaları
import { UretimHazirlikListePage } from '@/modules/uretim-hazirlik/pages/UretimHazirlikListePage';
import { UretimHazirlikDetayPage } from '@/modules/uretim-hazirlik/pages/UretimHazirlikDetayPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Numune Modülü Routes */}
        <Route path="/numune" element={<NumuneDashboard />} />
        <Route path="/numune/talepler" element={<NumuneTaleplerPage />} />
        <Route path="/numune/yeni" element={<YeniNumune />} />
        <Route path="/numune/musteri-analizi" element={<MusteriAnalizi />} />
        
        {/* Üretim Hazırlık Modülü Routes */}
        <Route path="/uretim-hazirlik" element={<UretimHazirlikListePage />} />
        <Route path="/uretim-hazirlik/detay/:id" element={<UretimHazirlikDetayPage />} />
        
        {/* Eski route - yeni modüle yönlendir */}
        <Route path="/numune/uretim-hazirlik" element={<Navigate to="/uretim-hazirlik" replace />} />
        
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/numune" replace />} />
        <Route path="*" element={<Navigate to="/numune" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

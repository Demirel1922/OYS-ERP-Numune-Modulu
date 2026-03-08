import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Numune Modülü sayfaları
import { NumuneDashboard } from '@/modules/numune/pages/NumuneDashboard';
import { NumuneTaleplerPage } from '@/modules/numune/pages/NumuneTaleplerPage';
import { UretimHazirlikPage } from '@/modules/numune/pages/UretimHazirlikPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Numune Modülü Routes */}
        <Route path="/numune" element={<NumuneDashboard />} />
        <Route path="/numune/talepler" element={<NumuneTaleplerPage />} />
        <Route path="/numune/uretim-hazirlik" element={<UretimHazirlikPage />} />
        
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/numune" replace />} />
        <Route path="*" element={<Navigate to="/numune" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

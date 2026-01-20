// FSRU Simulator Main Application
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSimulatorStore } from './store/simulatorStore';
import { NavBar } from './components/common/NavBar';
import { AlarmBanner } from './components/common/AlarmBanner';
import { StatusBar } from './components/common/StatusBar';
import { OverviewPage } from './pages/OverviewPage';
import { GasExportPage } from './pages/GasExportPage';
import { HeatingWaterPage } from './pages/HeatingWaterPage';
import { ESDPage } from './pages/ESDPage';
import { AlarmsPage } from './pages/AlarmsPage';
import { TrendsPage } from './pages/TrendsPage';

function App() {
  const connect = useSimulatorStore(state => state.connect);
  const connected = useSimulatorStore(state => state.connected);

  useEffect(() => {
    connect();
  }, [connect]);

  return (
    <BrowserRouter>
      <div className="app-container">
        <NavBar />
        <AlarmBanner />

        <div className="main-content">
          <div className="page-content">
            {!connected ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <div style={{ fontSize: '24px' }}>Connecting to Simulator...</div>
                <div style={{ color: '#888' }}>Please ensure the backend is running on port 3001</div>
              </div>
            ) : (
              <Routes>
                <Route path="/" element={<Navigate to="/overview" replace />} />
                <Route path="/overview" element={<OverviewPage />} />
                <Route path="/gas-export" element={<GasExportPage />} />
                <Route path="/heating-water" element={<HeatingWaterPage />} />
                <Route path="/esd" element={<ESDPage />} />
                <Route path="/alarms" element={<AlarmsPage />} />
                <Route path="/trends" element={<TrendsPage />} />
              </Routes>
            )}
          </div>
        </div>

        <StatusBar />
      </div>
    </BrowserRouter>
  );
}

export default App;

// Navigation Bar Component
import { useLocation, useNavigate } from 'react-router-dom';
import { useSimulatorStore, useESD } from '../../store/simulatorStore';

const navItems = [
  { path: '/overview', label: 'Overview' },
  { path: '/gas-export', label: 'Gas Export' },
  { path: '/heating-water', label: 'Heating Water' },
  { path: '/esd', label: 'ESD' },
  { path: '/alarms', label: 'Alarms' },
  { path: '/trends', label: 'Trends' },
];

export function NavBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const esd = useESD();
  const simSpeed = useSimulatorStore(state => state.simSpeed);
  const frozen = useSimulatorStore(state => state.frozen);
  const freezeSim = useSimulatorStore(state => state.freezeSim);
  const unfreezeSim = useSimulatorStore(state => state.unfreezeSim);
  const setSimSpeed = useSimulatorStore(state => state.setSimSpeed);

  return (
    <nav className="nav-bar">
      <div className="logo">FSRU BRUNSBÜTTEL</div>

      {navItems.map(item => (
        <div
          key={item.path}
          className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
          onClick={() => navigate(item.path)}
        >
          {item.label}
          {item.path === '/esd' && esd.active && (
            <span style={{
              marginLeft: '8px',
              color: '#ff0000',
              fontWeight: 'bold',
              animation: 'alarm-flash 0.5s infinite'
            }}>
              ●
            </span>
          )}
        </div>
      ))}

      <div style={{ flex: 1 }} />

      {/* Simulation controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ color: '#888', fontSize: '12px' }}>Sim Speed:</span>
        <select
          value={simSpeed}
          onChange={(e) => setSimSpeed(parseFloat(e.target.value))}
          style={{
            padding: '4px 8px',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-primary)',
            borderRadius: '4px',
            color: 'white'
          }}
        >
          <option value="0.1">0.1x</option>
          <option value="0.5">0.5x</option>
          <option value="1">1x</option>
          <option value="2">2x</option>
          <option value="5">5x</option>
          <option value="10">10x</option>
        </select>

        <button
          className={`btn ${frozen ? 'btn-success' : 'btn-warning'}`}
          onClick={() => frozen ? unfreezeSim() : freezeSim()}
          style={{ padding: '4px 12px', fontSize: '12px' }}
        >
          {frozen ? '▶ Run' : '⏸ Freeze'}
        </button>
      </div>
    </nav>
  );
}

// Status Bar Component - Shows system status at bottom
import { useSimulatorStore, useTagValue } from '../../store/simulatorStore';

export function StatusBar() {
  const connected = useSimulatorStore(state => state.connected);
  const simTime = useSimulatorStore(state => state.simTime);
  const simSpeed = useSimulatorStore(state => state.simSpeed);
  const frozen = useSimulatorStore(state => state.frozen);

  const activeAlarms = useTagValue('OP.ACTIVE-ALARMS');
  const capacityMode = useTagValue('CFG.CAPACITY-MODE');
  const hwMode = useTagValue('HW.MODE');

  // Format simulation time
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="status-bar">
      <div className="status-item">
        <span style={{ color: connected ? '#00ff00' : '#ff0000' }}>●</span>
        <span>{connected ? 'Connected' : 'Disconnected'}</span>
      </div>

      <div className="status-item">
        <span>Sim Time:</span>
        <span style={{ fontFamily: 'Consolas, monospace' }}>{formatTime(simTime)}</span>
      </div>

      <div className="status-item">
        <span>Speed:</span>
        <span style={{ color: simSpeed !== 1 ? '#ffff00' : 'inherit' }}>{simSpeed}x</span>
        {frozen && <span style={{ color: '#ff8800', marginLeft: '8px' }}>FROZEN</span>}
      </div>

      <div className="status-item">
        <span>Mode:</span>
        <span style={{ color: '#00ff00' }}>Training</span>
      </div>

      <div className="status-item">
        <span>Capacity:</span>
        <span>{capacityMode === 1 ? '350' : '700'} Nm³/h</span>
      </div>

      <div className="status-item">
        <span>HW:</span>
        <span className={`mode-indicator ${hwMode === 1 ? 'auto' : 'manual'}`} style={{ padding: '2px 8px', fontSize: '11px' }}>
          {hwMode === 1 ? 'AUTO' : 'MANUAL'}
        </span>
      </div>

      <div className="status-item">
        <span>Alarms:</span>
        <span style={{ color: activeAlarms > 0 ? '#ff0000' : '#00ff00' }}>{activeAlarms}</span>
      </div>

      <div className="status-item">
        <span style={{ color: '#888' }}>{new Date().toLocaleTimeString()}</span>
      </div>
    </div>
  );
}

// Overview Page - Main Dashboard
import { useTagValue, useActiveAlarms, useESD, useSimulatorStore } from '../store/simulatorStore';
import { ValueDisplay, Bargraph, ControllerDisplay } from '../components/common/ValueDisplay';
import { useNavigate } from 'react-router-dom';

export function OverviewPage() {
  const navigate = useNavigate();
  const alarms = useActiveAlarms();
  const esd = useESD();

  // Gas Export values
  const exportFlow = useTagValue('FT-001');
  const exportPressure = useTagValue('PT-001');
  const exportTemp = useTagValue('TT-001');
  const capacityMode = useTagValue('CFG.CAPACITY-MODE');
  const maxCapacity = capacityMode === 1 ? 350 : 700;

  // Heating Water values
  const supplyTemp = useTagValue('TT-100');
  const heatersRunning = useTagValue('HW.HEATERS-RUNNING');
  const pumpsRunning = useTagValue('HW.PUMPS-RUNNING');
  const totalGas = useTagValue('HW.TOTAL-GAS');
  const hwMode = useTagValue('HW.MODE');

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', height: '100%' }}>
      {/* Gas Export Panel */}
      <div className="panel" onClick={() => navigate('/gas-export')} style={{ cursor: 'pointer' }}>
        <div className="panel-header">
          <span>GAS EXPORT</span>
          <span style={{ color: exportFlow > 50 ? '#00ff00' : '#888' }}>
            {exportFlow > 50 ? '● ACTIVE' : '○ IDLE'}
          </span>
        </div>
        <div className="panel-content">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '16px' }}>
            <ValueDisplay
              tagId="FT-001"
              label="Export Flow"
              unit="Nm³/h"
              decimals={0}
              alarmLimits={{ l: 50, h: maxCapacity * 0.95, hh: maxCapacity }}
              size="large"
            />
            <ValueDisplay
              tagId="PT-001"
              label="Export Pressure"
              unit="bar"
              decimals={1}
              alarmLimits={{ ll: 52, l: 55, h: 67, hh: 70 }}
              size="large"
            />
            <ValueDisplay
              tagId="TT-001"
              label="Export Temp"
              unit="°C"
              decimals={1}
              alarmLimits={{ ll: -5, l: 0, h: 40, hh: 45 }}
              size="large"
            />
          </div>

          <Bargraph
            tagId="FT-001"
            label="Flow Capacity"
            min={0}
            max={maxCapacity}
            unit="Nm³/h"
            alarmLimits={{ h: maxCapacity * 0.95, hh: maxCapacity }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
            <span>Capacity Mode: <strong>{capacityMode === 1 ? '350' : '700'} Nm³/h</strong></span>
            <span>Click for detail →</span>
          </div>
        </div>
      </div>

      {/* Heating Water Panel */}
      <div className="panel" onClick={() => navigate('/heating-water')} style={{ cursor: 'pointer' }}>
        <div className="panel-header">
          <span>HEATING WATER</span>
          <span className={`mode-indicator ${hwMode === 1 ? 'auto' : 'manual'}`}>
            {hwMode === 1 ? 'AUTO' : 'MANUAL'}
          </span>
        </div>
        <div className="panel-content">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '16px' }}>
            <ValueDisplay
              tagId="TT-100"
              label="Supply Temp"
              unit="°C"
              decimals={1}
              alarmLimits={{ ll: 10, l: 15, h: 25, hh: 30 }}
              size="large"
            />
            <ValueDisplay
              tagId="TT-101"
              label="Inlet Temp"
              unit="°C"
              decimals={1}
              alarmLimits={{ ll: 2, l: 3 }}
              size="large"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            <div style={{ textAlign: 'center', padding: '12px', backgroundColor: 'var(--bg-secondary)', borderRadius: '4px' }}>
              <div style={{ fontSize: '11px', color: '#888' }}>Heaters Running</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: heatersRunning > 0 ? '#00ff00' : '#888' }}>
                {heatersRunning}/5
              </div>
            </div>
            <div style={{ textAlign: 'center', padding: '12px', backgroundColor: 'var(--bg-secondary)', borderRadius: '4px' }}>
              <div style={{ fontSize: '11px', color: '#888' }}>Pumps Running</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: pumpsRunning > 0 ? '#00ff00' : '#888' }}>
                {pumpsRunning}/5
              </div>
            </div>
          </div>

          <div style={{ marginTop: '16px' }}>
            <Bargraph
              tagId="HW.TOTAL-GAS"
              label="Daily Gas Usage"
              min={0}
              max={120}
              unit="Nm³"
              alarmLimits={{ h: 100 }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
            <span>Click for detail →</span>
          </div>
        </div>
      </div>

      {/* ESD Status Panel */}
      <div className="panel" onClick={() => navigate('/esd')} style={{ cursor: 'pointer' }}>
        <div className="panel-header">
          <span>ESD STATUS</span>
        </div>
        <div className="panel-content" style={{ textAlign: 'center' }}>
          <div
            style={{
              padding: '24px',
              borderRadius: '8px',
              backgroundColor: esd.active ? '#ff0000' : '#00aa00',
              color: esd.active ? 'white' : 'black',
              fontWeight: 'bold',
              fontSize: '24px',
              animation: esd.active ? 'alarm-flash 0.5s infinite' : 'none'
            }}
          >
            {esd.active ? `ESD-${esd.level} ACTIVE` : 'ESD HEALTHY'}
          </div>

          {esd.active && (
            <div style={{ marginTop: '12px', color: '#ff8800' }}>
              Cause Code: {esd.causeCode}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
            <span>Click for detail →</span>
          </div>
        </div>
      </div>

      {/* Quick Status Panel */}
      <div className="panel">
        <div className="panel-header">
          <span>QUICK STATUS</span>
        </div>
        <div className="panel-content">
          {/* Active Alarms */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>Active Alarms ({alarms.length})</div>
            {alarms.length === 0 ? (
              <div style={{ color: '#00ff00' }}>No active alarms</div>
            ) : (
              <div style={{ maxHeight: '120px', overflow: 'auto' }}>
                {alarms.slice(0, 5).map(alarm => (
                  <div
                    key={alarm.id}
                    style={{
                      padding: '4px 8px',
                      backgroundColor: 'var(--bg-secondary)',
                      marginBottom: '4px',
                      borderRadius: '4px',
                      borderLeft: `3px solid ${alarm.priority === 'HH' || alarm.priority === 'LL' ? '#ff0000' : '#ff8800'}`
                    }}
                  >
                    <span style={{ marginRight: '8px', fontWeight: 'bold' }}>{alarm.priority}</span>
                    {alarm.message}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Valve Status */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
            <ValveStatus tagId="XV-001" label="XV-001" />
            <ValveStatus tagId="XV-002" label="XV-002" />
            <ValvePositionStatus tagId="PV-001" label="PV-001" />
            <ValvePositionStatus tagId="FV-001" label="FV-001" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Valve status indicator
function ValveStatus({ tagId, label }: { tagId: string; label: string }) {
  const zso = useTagValue(`${tagId}.ZSO`);
  const zsc = useTagValue(`${tagId}.ZSC`);

  let status = 'TRANSIT';
  let color = '#ffff00';

  if (zso > 0.5) {
    status = 'OPEN';
    color = '#00ff00';
  } else if (zsc > 0.5) {
    status = 'CLOSED';
    color = '#888888';
  }

  return (
    <div style={{ textAlign: 'center', padding: '8px', backgroundColor: 'var(--bg-secondary)', borderRadius: '4px' }}>
      <div style={{ fontSize: '10px', color: '#888' }}>{label}</div>
      <div style={{ color, fontWeight: 'bold', fontSize: '12px' }}>{status}</div>
    </div>
  );
}

// Control valve position status
function ValvePositionStatus({ tagId, label }: { tagId: string; label: string }) {
  const pos = useTagValue(`${tagId}.POS`);

  return (
    <div style={{ textAlign: 'center', padding: '8px', backgroundColor: 'var(--bg-secondary)', borderRadius: '4px' }}>
      <div style={{ fontSize: '10px', color: '#888' }}>{label}</div>
      <div style={{ color: '#00ff00', fontWeight: 'bold', fontSize: '12px' }}>{pos.toFixed(0)}%</div>
    </div>
  );
}

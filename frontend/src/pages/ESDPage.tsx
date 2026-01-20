// ESD Status Page
import { useTagValue, useESD, useSimulatorStore } from '../store/simulatorStore';

// ESD cause definitions
const ESD1_CAUSES = [
  { tag: 'ESD1-PB-001', name: 'Manual PB - Control Room', code: 1 },
  { tag: 'ESD1-PB-002', name: 'Manual PB - Field', code: 1 },
  { tag: 'FG-001', name: 'Fire/Gas Zone 1', code: 2 },
  { tag: 'FG-002', name: 'Fire/Gas Zone 2', code: 2 },
  { tag: 'PT-001', name: 'Export Pressure HHH (>70 bar)', code: 3, limit: 70, type: 'HH' },
  { tag: 'HW.PUMPS-RUNNING', name: 'All Pumps Lost', code: 4, limit: 0, type: 'LL' },
];

const ESD2_CAUSES = [
  { tag: 'ESD2-PB-001', name: 'Manual PB - Control Room', code: 10 },
  { tag: 'ESD2-PB-002', name: 'Manual PB - Field', code: 10 },
  { tag: 'PT-001', name: 'Export Pressure HH (>67 bar)', code: 11, limit: 67, type: 'HH' },
  { tag: 'TT-001', name: 'Export Temperature LL (<-5°C)', code: 12, limit: -5, type: 'LL' },
  { tag: 'TT-100', name: 'Supply Temperature LL (<10°C)', code: 13, limit: 10, type: 'LL' },
];

export function ESDPage() {
  const esd = useESD();
  const acknowledgeESD = useSimulatorStore(state => state.acknowledgeESD);
  const resetESD = useSimulatorStore(state => state.resetESD);
  const setTag = useSimulatorStore(state => state.setTag);

  const resetPerm = useTagValue('ESD.RESET-PERM');
  const hornActive = useTagValue('ESD.HORN');

  // Valve statuses
  const xv001Zso = useTagValue('XV-001.ZSO');
  const xv002Zso = useTagValue('XV-002.ZSO');
  const pv001Pos = useTagValue('PV-001.POS');
  const fv001Pos = useTagValue('FV-001.POS');

  const silenceHorn = () => {
    setTag('ESD.HORN', 0);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* ESD Status Banner */}
      <div
        className="panel"
        style={{
          backgroundColor: esd.active ? '#660000' : '#006600',
          animation: esd.active ? 'alarm-flash 0.5s infinite' : 'none'
        }}
      >
        <div style={{
          padding: '32px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '8px' }}>
            {esd.active ? `ESD-${esd.level} ACTIVE` : 'ESD SYSTEM HEALTHY'}
          </div>
          {esd.active && (
            <>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>
                Cause Code: {esd.causeCode}
              </div>
              <div style={{ fontSize: '18px', color: '#ccc' }}>
                {getCauseName(esd.causeCode)}
              </div>
            </>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* ESD-1 Causes */}
        <div className="panel">
          <div className="panel-header">
            <span>ESD-1 CAUSES</span>
          </div>
          <div className="panel-content">
            <table className="alarm-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Cause</th>
                  <th>Status</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {ESD1_CAUSES.map(cause => (
                  <CauseRow key={cause.tag + cause.code} cause={cause} />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ESD-2 Causes */}
        <div className="panel">
          <div className="panel-header">
            <span>ESD-2 CAUSES</span>
          </div>
          <div className="panel-content">
            <table className="alarm-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Cause</th>
                  <th>Status</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {ESD2_CAUSES.map(cause => (
                  <CauseRow key={cause.tag + cause.code} cause={cause} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Final Elements */}
      <div className="panel">
        <div className="panel-header">
          <span>FINAL ELEMENTS</span>
        </div>
        <div className="panel-content">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            <FinalElement
              name="XV-001"
              description="Export ESD Valve"
              status={xv001Zso > 0.5 ? 'OPEN' : 'CLOSED'}
              color={xv001Zso > 0.5 ? '#00ff00' : '#888888'}
            />
            <FinalElement
              name="XV-002"
              description="Upstream ESD Valve"
              status={xv002Zso > 0.5 ? 'OPEN' : 'CLOSED'}
              color={xv002Zso > 0.5 ? '#00ff00' : '#888888'}
            />
            <FinalElement
              name="PV-001"
              description="Pressure CV"
              status={`${pv001Pos.toFixed(0)}%`}
              color="#00ff00"
            />
            <FinalElement
              name="FV-001"
              description="Flow CV"
              status={`${fv001Pos.toFixed(0)}%`}
              color="#00ff00"
            />
          </div>
        </div>
      </div>

      {/* Reset Section */}
      <div className="panel">
        <div className="panel-header">
          <span>ESD RESET</span>
        </div>
        <div className="panel-content">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Reset Prerequisites */}
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: '12px' }}>Prerequisites</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Prerequisite
                  name="All causes cleared"
                  met={!hasActiveCause()}
                />
                <Prerequisite
                  name="ESD acknowledged"
                  met={!esd.active || true /* Would track acknowledgment */}
                />
                <Prerequisite
                  name="Reset permissive"
                  met={resetPerm > 0}
                />
              </div>
            </div>

            {/* Reset Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                className="btn btn-primary"
                onClick={acknowledgeESD}
                disabled={!esd.active}
                style={{ padding: '16px' }}
              >
                ACKNOWLEDGE ESD
              </button>

              <button
                className="btn btn-warning"
                onClick={silenceHorn}
                disabled={hornActive === 0}
                style={{ padding: '16px' }}
              >
                SILENCE HORN
              </button>

              <button
                className="btn btn-success"
                onClick={resetESD}
                disabled={!esd.active || resetPerm === 0}
                style={{ padding: '16px' }}
              >
                RESET ESD
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Test Section (Instructor) */}
      <div className="panel">
        <div className="panel-header">
          <span>TEST/INJECT (Instructor Mode)</span>
        </div>
        <div className="panel-content">
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              className="btn btn-danger"
              onClick={() => setTag('ESD1-PB-001', 1)}
              style={{ padding: '8px 16px' }}
            >
              Trigger ESD-1 PB
            </button>
            <button
              className="btn btn-warning"
              onClick={() => setTag('ESD2-PB-001', 1)}
              style={{ padding: '8px 16px' }}
            >
              Trigger ESD-2 PB
            </button>
            <button
              className="btn"
              onClick={() => {
                setTag('ESD1-PB-001', 0);
                setTag('ESD1-PB-002', 0);
                setTag('ESD2-PB-001', 0);
                setTag('ESD2-PB-002', 0);
                setTag('FG-001', 0);
                setTag('FG-002', 0);
              }}
              style={{ padding: '8px 16px', backgroundColor: '#444' }}
            >
              Clear All PBs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Cause Row Component
function CauseRow({ cause }: { cause: typeof ESD1_CAUSES[0] }) {
  const value = useTagValue(cause.tag);

  let triggered = false;
  let displayValue = '';

  if (cause.type === 'HH' && cause.limit !== undefined) {
    triggered = value > cause.limit;
    displayValue = `${value.toFixed(1)}`;
  } else if (cause.type === 'LL' && cause.limit !== undefined) {
    triggered = value <= cause.limit;
    displayValue = `${value.toFixed(cause.tag.includes('PUMPS') ? 0 : 1)}`;
  } else {
    triggered = value === 1;
    displayValue = value === 1 ? 'Activated' : 'Normal';
  }

  return (
    <tr style={{ backgroundColor: triggered ? 'rgba(255,0,0,0.2)' : 'transparent' }}>
      <td>{cause.name}</td>
      <td>
        <span style={{
          display: 'inline-block',
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          backgroundColor: triggered ? '#ff0000' : '#00ff00',
          marginRight: '8px'
        }} />
        {triggered ? 'ACTIVE' : 'CLEAR'}
      </td>
      <td style={{ fontFamily: 'Consolas' }}>{displayValue}</td>
    </tr>
  );
}

// Final Element Component
function FinalElement({ name, description, status, color }: {
  name: string;
  description: string;
  status: string;
  color: string;
}) {
  return (
    <div style={{
      textAlign: 'center',
      padding: '16px',
      backgroundColor: 'var(--bg-secondary)',
      borderRadius: '4px'
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{name}</div>
      <div style={{ fontSize: '11px', color: '#888', marginBottom: '8px' }}>{description}</div>
      <div style={{
        fontSize: '18px',
        fontWeight: 'bold',
        color,
        padding: '8px',
        backgroundColor: 'var(--bg-primary)',
        borderRadius: '4px'
      }}>
        {status}
      </div>
    </div>
  );
}

// Prerequisite Component
function Prerequisite({ name, met }: { name: string; met: boolean }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px',
      backgroundColor: 'var(--bg-secondary)',
      borderRadius: '4px'
    }}>
      <span style={{
        display: 'inline-block',
        width: '20px',
        height: '20px',
        borderRadius: '4px',
        backgroundColor: met ? '#00ff00' : '#ff0000',
        color: met ? 'black' : 'white',
        textAlign: 'center',
        lineHeight: '20px',
        fontWeight: 'bold'
      }}>
        {met ? '✓' : '✗'}
      </span>
      <span>{name}</span>
    </div>
  );
}

// Helper function to check if any cause is active
function hasActiveCause(): boolean {
  // This would need to be implemented properly by checking all causes
  return false;
}

// Helper function to get cause name from code
function getCauseName(code: number): string {
  const allCauses = [...ESD1_CAUSES, ...ESD2_CAUSES];
  const cause = allCauses.find(c => c.code === code);
  return cause?.name || 'Unknown';
}

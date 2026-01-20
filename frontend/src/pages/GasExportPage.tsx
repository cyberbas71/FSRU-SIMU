// Gas Export Page - P&ID Style Mimic
import { useState } from 'react';
import { useTagValue, useSimulatorStore } from '../store/simulatorStore';
import { ValueDisplay, Bargraph, ControllerDisplay } from '../components/common/ValueDisplay';

export function GasExportPage() {
  const [selectedController, setSelectedController] = useState<string | null>(null);

  const capacityMode = useTagValue('CFG.CAPACITY-MODE');
  const maxCapacity = capacityMode === 1 ? 350 : 700;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
      {/* Header */}
      <div className="panel">
        <div className="panel-header">
          <span>GAS EXPORT SYSTEM</span>
          <div style={{ display: 'flex', gap: '16px' }}>
            <span>Capacity: <strong style={{ color: '#00ff00' }}>{maxCapacity} Nm³/h</strong></span>
            <span>Mode: {capacityMode === 1 ? 'Current Terminal' : 'New Terminal'}</span>
          </div>
        </div>
      </div>

      {/* Main Mimic */}
      <div className="panel" style={{ flex: 1 }}>
        <div className="panel-content" style={{ height: '100%', position: 'relative' }}>
          <GasExportMimic onControllerClick={setSelectedController} />
        </div>
      </div>

      {/* Controllers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
        <ControllerDisplay
          controllerId="PIC-001"
          name="PIC-001 Export Pressure"
          pvUnit="bar"
          onClick={() => setSelectedController('PIC-001')}
        />
        <ControllerDisplay
          controllerId="FIC-001"
          name="FIC-001 Export Flow"
          pvUnit="Nm³/h"
          onClick={() => setSelectedController('FIC-001')}
        />
      </div>

      {/* Controller Faceplate */}
      {selectedController && (
        <ControllerFaceplate
          controllerId={selectedController}
          onClose={() => setSelectedController(null)}
        />
      )}
    </div>
  );
}

// Gas Export Mimic Component
function GasExportMimic({ onControllerClick }: { onControllerClick: (id: string) => void }) {
  // Tag values
  const pt002 = useTagValue('PT-002');
  const pt001 = useTagValue('PT-001');
  const pt003 = useTagValue('PT-003');
  const tt001 = useTagValue('TT-001');
  const ft001 = useTagValue('FT-001');
  const pv001Pos = useTagValue('PV-001.POS');
  const fv001Pos = useTagValue('FV-001.POS');
  const xv001Zso = useTagValue('XV-001.ZSO');
  const xv002Zso = useTagValue('XV-002.ZSO');

  return (
    <svg viewBox="0 0 800 400" style={{ width: '100%', height: '100%' }}>
      {/* Background grid */}
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#333355" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />

      {/* Title */}
      <text x="400" y="30" textAnchor="middle" fill="#888" fontSize="14">GAS EXPORT SYSTEM - P&ID VIEW</text>

      {/* Main pipeline */}
      <line x1="50" y1="200" x2="750" y2="200" stroke="#0066cc" strokeWidth="8" />

      {/* From Vaporizer label */}
      <text x="50" y="230" fill="#888" fontSize="12">FROM VAPORIZER</text>

      {/* To Network label */}
      <text x="700" y="230" fill="#888" fontSize="12">TO NETWORK</text>

      {/* PT-002 (Upstream) */}
      <g transform="translate(100, 120)">
        <rect x="-30" y="-15" width="60" height="45" fill="#1f4068" stroke="#333" />
        <text x="0" y="0" textAnchor="middle" fill="#888" fontSize="10">PT-002</text>
        <text x="0" y="18" textAnchor="middle" fill="#00ff00" fontSize="14" fontFamily="Consolas">
          {pt002.toFixed(1)}
        </text>
        <text x="0" y="32" textAnchor="middle" fill="#888" fontSize="10">bar</text>
        <line x1="0" y1="45" x2="0" y2="65" stroke="#0066cc" strokeWidth="2" />
      </g>

      {/* XV-002 (Upstream ESD Valve) */}
      <g transform="translate(200, 200)">
        <ValveSymbol open={xv002Zso > 0.5} label="XV-002" type="ball" />
      </g>

      {/* PT-001 (Export Header) */}
      <g transform="translate(350, 80)">
        <rect x="-35" y="-20" width="70" height="85" fill="#1f4068" stroke="#333" />
        <text x="0" y="-5" textAnchor="middle" fill="#888" fontSize="10">EXPORT HEADER</text>

        <text x="-20" y="12" fill="#888" fontSize="9">PT-001</text>
        <text x="20" y="12" fill={pt001 > 67 ? '#ff0000' : '#00ff00'} fontSize="12" fontFamily="Consolas">
          {pt001.toFixed(1)}
        </text>

        <text x="-20" y="30" fill="#888" fontSize="9">TT-001</text>
        <text x="20" y="30" fill={tt001 < 0 ? '#ff0000' : '#00ff00'} fontSize="12" fontFamily="Consolas">
          {tt001.toFixed(1)}
        </text>

        <text x="-20" y="48" fill="#888" fontSize="9">FT-001</text>
        <text x="20" y="48" fill="#00ff00" fontSize="12" fontFamily="Consolas">
          {ft001.toFixed(0)}
        </text>

        <line x1="0" y1="65" x2="0" y2="115" stroke="#0066cc" strokeWidth="2" />
      </g>

      {/* PV-001 (Pressure Control Valve) */}
      <g transform="translate(420, 280)">
        <ControlValveSymbol position={pv001Pos} label="PV-001" />
        <line x1="0" y1="-40" x2="0" y2="-80" stroke="#0066cc" strokeWidth="2" />
        <text x="0" y="55" textAnchor="middle" fill="#888" fontSize="10"
          style={{ cursor: 'pointer' }}
          onClick={() => onControllerClick('PIC-001')}>
          →PIC-001
        </text>
      </g>

      {/* FV-001 (Flow Control Valve) */}
      <g transform="translate(520, 280)">
        <ControlValveSymbol position={fv001Pos} label="FV-001" />
        <line x1="0" y1="-40" x2="0" y2="-80" stroke="#0066cc" strokeWidth="2" />
        <text x="0" y="55" textAnchor="middle" fill="#888" fontSize="10"
          style={{ cursor: 'pointer' }}
          onClick={() => onControllerClick('FIC-001')}>
          →FIC-001
        </text>
      </g>

      {/* XV-001 (Export ESD Valve) */}
      <g transform="translate(620, 200)">
        <ValveSymbol open={xv001Zso > 0.5} label="XV-001" type="ball" />
      </g>

      {/* PT-003 (Downstream) */}
      <g transform="translate(700, 120)">
        <rect x="-30" y="-15" width="60" height="45" fill="#1f4068" stroke="#333" />
        <text x="0" y="0" textAnchor="middle" fill="#888" fontSize="10">PT-003</text>
        <text x="0" y="18" textAnchor="middle" fill="#00ff00" fontSize="14" fontFamily="Consolas">
          {pt003.toFixed(1)}
        </text>
        <text x="0" y="32" textAnchor="middle" fill="#888" fontSize="10">bar</text>
        <line x1="0" y1="45" x2="0" y2="65" stroke="#0066cc" strokeWidth="2" />
      </g>

      {/* Flow arrow */}
      <polygon points="400,195 420,200 400,205" fill={ft001 > 10 ? '#00ff00' : '#888'} />
    </svg>
  );
}

// Valve Symbol Component
function ValveSymbol({ open, label, type }: { open: boolean; label: string; type: 'ball' | 'gate' }) {
  const color = open ? '#00ff00' : '#888888';

  return (
    <g>
      {/* Ball valve symbol */}
      <circle cx="0" cy="0" r="15" fill="none" stroke={color} strokeWidth="2" />
      <line x1="-10" y1={open ? 0 : -10} x2="10" y2={open ? 0 : 10} stroke={color} strokeWidth="3" />

      {/* Connections */}
      <line x1="-30" y1="0" x2="-15" y2="0" stroke="#0066cc" strokeWidth="8" />
      <line x1="15" y1="0" x2="30" y2="0" stroke="#0066cc" strokeWidth="8" />

      {/* Label */}
      <text x="0" y="30" textAnchor="middle" fill="#ccc" fontSize="10">{label}</text>
      <text x="0" y="42" textAnchor="middle" fill={color} fontSize="9">
        {open ? 'OPEN' : 'CLOSED'}
      </text>
    </g>
  );
}

// Control Valve Symbol Component
function ControlValveSymbol({ position, label }: { position: number; label: string }) {
  return (
    <g>
      {/* Globe valve symbol */}
      <polygon points="0,-15 15,0 0,15 -15,0" fill="none" stroke="#00ff00" strokeWidth="2" />

      {/* Position indicator */}
      <rect x="-20" y="20" width="40" height="15" fill="#1f4068" stroke="#333" />
      <text x="0" y="32" textAnchor="middle" fill="#00ff00" fontSize="11" fontFamily="Consolas">
        {position.toFixed(0)}%
      </text>

      {/* Label */}
      <text x="0" y="-25" textAnchor="middle" fill="#ccc" fontSize="10">{label}</text>
    </g>
  );
}

// Controller Faceplate
function ControllerFaceplate({ controllerId, onClose }: { controllerId: string; onClose: () => void }) {
  const pv = useTagValue(`${controllerId}.PV`);
  const sp = useTagValue(`${controllerId}.SP`);
  const out = useTagValue(`${controllerId}.OUT`);
  const mode = useTagValue(`${controllerId}.MODE`);

  const setControllerSP = useSimulatorStore(state => state.setControllerSP);
  const setControllerMode = useSimulatorStore(state => state.setControllerMode);
  const setValvePosition = useSimulatorStore(state => state.setValvePosition);

  const [newSP, setNewSP] = useState(sp.toString());
  const [newOut, setNewOut] = useState(out.toString());

  const isAuto = mode === 1;
  const isPressure = controllerId === 'PIC-001';
  const unit = isPressure ? 'bar' : 'Nm³/h';
  const valveId = isPressure ? 'PV-001' : 'FV-001';

  const handleSetSP = () => {
    const val = parseFloat(newSP);
    if (!isNaN(val)) {
      setControllerSP(controllerId, val);
    }
  };

  const handleSetOutput = () => {
    const val = parseFloat(newOut);
    if (!isNaN(val)) {
      setValvePosition(valveId, Math.max(0, Math.min(100, val)));
    }
  };

  return (
    <>
      <div className="overlay" onClick={onClose} />
      <div className="faceplate">
        <div className="faceplate-header">
          <h3>{controllerId}</h3>
          <button className="faceplate-close" onClick={onClose}>×</button>
        </div>

        <div className="faceplate-content">
          {/* PV Bar */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ color: '#888' }}>PV</span>
              <span style={{ fontFamily: 'Consolas', fontSize: '18px' }}>{pv.toFixed(1)} {unit}</span>
            </div>
            <div className="bargraph-container" style={{ height: '24px' }}>
              <div
                className="bargraph-fill"
                style={{
                  width: `${isPressure ? (pv / 100 * 100) : (pv / 700 * 100)}%`,
                  backgroundColor: '#00ff00'
                }}
              />
            </div>
          </div>

          {/* SP Bar */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ color: '#888' }}>SP</span>
              <span style={{ fontFamily: 'Consolas', fontSize: '18px', color: '#0088ff' }}>{sp.toFixed(1)} {unit}</span>
            </div>
            <div className="bargraph-container" style={{ height: '24px' }}>
              <div
                className="bargraph-fill"
                style={{
                  width: `${isPressure ? (sp / 100 * 100) : (sp / 700 * 100)}%`,
                  backgroundColor: '#0088ff'
                }}
              />
            </div>
          </div>

          {/* Output Bar */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ color: '#888' }}>Output</span>
              <span style={{ fontFamily: 'Consolas', fontSize: '18px' }}>{out.toFixed(1)} %</span>
            </div>
            <div className="bargraph-container" style={{ height: '24px' }}>
              <div
                className="bargraph-fill"
                style={{ width: `${out}%`, backgroundColor: '#ffff00' }}
              />
            </div>
          </div>

          {/* Mode Selection */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <button
              className={`btn ${isAuto ? 'btn-success' : ''}`}
              style={{ flex: 1 }}
              onClick={() => setControllerMode(controllerId, 1)}
            >
              AUTO
            </button>
            <button
              className={`btn ${!isAuto ? 'btn-warning' : ''}`}
              style={{ flex: 1 }}
              onClick={() => setControllerMode(controllerId, 0)}
            >
              MANUAL
            </button>
          </div>

          {/* Setpoint Entry (Auto mode) */}
          {isAuto && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ color: '#888', marginBottom: '4px' }}>Setpoint</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="number"
                  className="input-field"
                  style={{ flex: 1 }}
                  value={newSP}
                  onChange={e => setNewSP(e.target.value)}
                />
                <button className="btn btn-primary" onClick={handleSetSP}>SET</button>
              </div>
            </div>
          )}

          {/* Output Entry (Manual mode) */}
          {!isAuto && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ color: '#888', marginBottom: '4px' }}>Output %</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="number"
                  className="input-field"
                  style={{ flex: 1 }}
                  value={newOut}
                  onChange={e => setNewOut(e.target.value)}
                  min="0"
                  max="100"
                />
                <button className="btn btn-primary" onClick={handleSetOutput}>SET</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

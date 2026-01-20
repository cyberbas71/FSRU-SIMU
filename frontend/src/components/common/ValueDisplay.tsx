// Value Display Component - Shows a tag value with unit and alarm state
import { useTagValue, useSimulatorStore } from '../../store/simulatorStore';

interface ValueDisplayProps {
  tagId: string;
  label?: string;
  unit?: string;
  decimals?: number;
  alarmLimits?: {
    ll?: number;
    l?: number;
    h?: number;
    hh?: number;
  };
  onClick?: () => void;
  size?: 'small' | 'medium' | 'large';
}

export function ValueDisplay({
  tagId,
  label,
  unit,
  decimals = 1,
  alarmLimits,
  onClick,
  size = 'medium'
}: ValueDisplayProps) {
  const value = useTagValue(tagId);
  const alarmState = getAlarmState(value, alarmLimits);

  const sizeStyles = {
    small: { value: '16px', label: '10px', unit: '10px' },
    medium: { value: '24px', label: '11px', unit: '12px' },
    large: { value: '36px', label: '12px', unit: '14px' }
  };

  const styles = sizeStyles[size];

  return (
    <div
      className={`value-display ${alarmState}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {label && (
        <div className="label" style={{ fontSize: styles.label }}>{label}</div>
      )}
      <div
        className="value"
        style={{
          fontSize: styles.value,
          color: getAlarmColor(alarmState)
        }}
      >
        {value.toFixed(decimals)}
      </div>
      {unit && (
        <div className="unit" style={{ fontSize: styles.unit }}>{unit}</div>
      )}
    </div>
  );
}

// Bargraph component
interface BargraphProps {
  tagId: string;
  label?: string;
  min?: number;
  max?: number;
  unit?: string;
  alarmLimits?: {
    ll?: number;
    l?: number;
    h?: number;
    hh?: number;
  };
  showValue?: boolean;
  height?: number;
}

export function Bargraph({
  tagId,
  label,
  min = 0,
  max = 100,
  unit,
  alarmLimits,
  showValue = true,
  height = 20
}: BargraphProps) {
  const value = useTagValue(tagId);
  const percent = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
  const alarmState = getAlarmState(value, alarmLimits);

  return (
    <div className="bargraph">
      {label && <div className="bargraph-label">{label}</div>}
      <div className="bargraph-container" style={{ height }}>
        <div
          className={`bargraph-fill ${alarmState}`}
          style={{
            width: `${percent}%`,
            backgroundColor: getAlarmColor(alarmState)
          }}
        />
        {showValue && (
          <div className="bargraph-value">
            {value.toFixed(1)}{unit ? ` ${unit}` : ''}
          </div>
        )}
      </div>
    </div>
  );
}

// Controller Display
interface ControllerDisplayProps {
  controllerId: string;
  name: string;
  pvUnit: string;
  onClick?: () => void;
}

export function ControllerDisplay({
  controllerId,
  name,
  pvUnit,
  onClick
}: ControllerDisplayProps) {
  const pv = useTagValue(`${controllerId}.PV`);
  const sp = useTagValue(`${controllerId}.SP`);
  const out = useTagValue(`${controllerId}.OUT`);
  const mode = useTagValue(`${controllerId}.MODE`);

  const modeText = mode === 1 ? 'AUTO' : mode === 2 ? 'CAS' : 'MAN';
  const modeClass = mode === 1 ? 'auto' : 'manual';

  return (
    <div
      className="panel"
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default', padding: '8px' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontWeight: 'bold' }}>{name}</span>
        <span className={`mode-indicator ${modeClass}`}>{modeText}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <div>
          <div style={{ fontSize: '10px', color: '#888' }}>PV</div>
          <div style={{ fontSize: '18px', fontFamily: 'Consolas' }}>
            {pv.toFixed(1)} {pvUnit}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '10px', color: '#888' }}>SP</div>
          <div style={{ fontSize: '18px', fontFamily: 'Consolas', color: '#0088ff' }}>
            {sp.toFixed(1)} {pvUnit}
          </div>
        </div>
      </div>

      <div style={{ marginTop: '8px' }}>
        <div style={{ fontSize: '10px', color: '#888' }}>OUT</div>
        <div className="bargraph-container" style={{ height: '16px' }}>
          <div
            className="bargraph-fill"
            style={{ width: `${out}%`, backgroundColor: '#00ff00' }}
          />
          <div className="bargraph-value">{out.toFixed(0)}%</div>
        </div>
      </div>
    </div>
  );
}

// Helper functions
function getAlarmState(value: number, limits?: { ll?: number; l?: number; h?: number; hh?: number }): string {
  if (!limits) return 'normal';

  if (limits.hh !== undefined && value >= limits.hh) return 'alarm-hh';
  if (limits.ll !== undefined && value <= limits.ll) return 'alarm-ll';
  if (limits.h !== undefined && value >= limits.h) return 'alarm-h';
  if (limits.l !== undefined && value <= limits.l) return 'alarm-l';

  return 'normal';
}

function getAlarmColor(state: string): string {
  switch (state) {
    case 'alarm-hh': return '#ff0000';
    case 'alarm-h': return '#ff8800';
    case 'alarm-l': return '#ffff00';
    case 'alarm-ll': return '#ff0000';
    default: return '#00ff00';
  }
}

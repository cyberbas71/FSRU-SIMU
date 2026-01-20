// Alarm Banner Component - Shows active alarms at top of screen
import { useActiveAlarms, useSimulatorStore } from '../../store/simulatorStore';

export function AlarmBanner() {
  const alarms = useActiveAlarms();
  const acknowledgeAllAlarms = useSimulatorStore(state => state.acknowledgeAllAlarms);

  const hasAlarms = alarms.length > 0;

  return (
    <div className={`alarm-banner ${hasAlarms ? '' : 'no-alarms'}`}>
      {hasAlarms ? (
        <>
          <span style={{ fontWeight: 'bold' }}>
            ⚠ {alarms.length} ACTIVE ALARM{alarms.length !== 1 ? 'S' : ''}
          </span>

          {/* Show first 3 alarms */}
          {alarms.slice(0, 3).map(alarm => (
            <span key={alarm.id} style={{ marginLeft: '16px' }}>
              <span className={`priority ${alarm.priority.toLowerCase()}`} style={{
                padding: '2px 6px',
                borderRadius: '3px',
                marginRight: '6px',
                fontSize: '11px',
                fontWeight: 'bold',
                backgroundColor: getPriorityColor(alarm.priority)
              }}>
                {alarm.priority}
              </span>
              {alarm.message} ({alarm.value.toFixed(1)})
            </span>
          ))}

          {alarms.length > 3 && (
            <span style={{ marginLeft: '16px', color: '#ccc' }}>
              +{alarms.length - 3} more
            </span>
          )}

          <div style={{ flex: 1 }} />

          <button
            className="btn btn-primary"
            onClick={acknowledgeAllAlarms}
            style={{ padding: '4px 12px', fontSize: '12px' }}
          >
            ACK ALL
          </button>
        </>
      ) : (
        <span style={{ color: '#00ff00' }}>● No Active Alarms</span>
      )}
    </div>
  );
}

function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'HH': return '#ff0000';
    case 'H': return '#ff8800';
    case 'L': return '#ffff00';
    case 'LL': return '#ff0000';
    default: return '#888888';
  }
}

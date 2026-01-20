// Alarms Page - Alarm Summary and Event List
import { useState } from 'react';
import { useAlarms, useSimulatorStore } from '../store/simulatorStore';

type TabType = 'active' | 'history' | 'events';

export function AlarmsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [filter, setFilter] = useState('');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
      {/* Tab Header */}
      <div className="panel">
        <div style={{ display: 'flex', gap: '4px', padding: '8px' }}>
          <TabButton
            label="Active Alarms"
            active={activeTab === 'active'}
            onClick={() => setActiveTab('active')}
          />
          <TabButton
            label="Alarm History"
            active={activeTab === 'history'}
            onClick={() => setActiveTab('history')}
          />
          <TabButton
            label="Event Log"
            active={activeTab === 'events'}
            onClick={() => setActiveTab('events')}
          />

          <div style={{ flex: 1 }} />

          <input
            type="text"
            placeholder="Filter..."
            className="input-field"
            value={filter}
            onChange={e => setFilter(e.target.value)}
            style={{ width: '200px' }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="panel" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {activeTab === 'active' && <ActiveAlarmsTab filter={filter} />}
        {activeTab === 'history' && <AlarmHistoryTab filter={filter} />}
        {activeTab === 'events' && <EventLogTab filter={filter} />}
      </div>
    </div>
  );
}

function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      className={`btn ${active ? 'btn-primary' : ''}`}
      onClick={onClick}
      style={{
        padding: '8px 16px',
        backgroundColor: active ? undefined : 'var(--bg-secondary)'
      }}
    >
      {label}
    </button>
  );
}

function ActiveAlarmsTab({ filter }: { filter: string }) {
  const alarms = useAlarms();
  const acknowledgeAlarm = useSimulatorStore(state => state.acknowledgeAlarm);
  const acknowledgeAllAlarms = useSimulatorStore(state => state.acknowledgeAllAlarms);

  const activeAlarms = alarms.filter(a =>
    a.state === 'ACTIVE' &&
    (filter === '' || a.message.toLowerCase().includes(filter.toLowerCase()))
  );

  return (
    <>
      <div className="panel-header">
        <span>Active Alarms ({activeAlarms.length})</span>
        <button
          className="btn btn-primary"
          onClick={acknowledgeAllAlarms}
          disabled={activeAlarms.length === 0}
          style={{ padding: '4px 12px' }}
        >
          ACK ALL
        </button>
      </div>
      <div className="panel-content" style={{ flex: 1, overflow: 'auto' }}>
        {activeAlarms.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: '#00ff00' }}>
            No Active Alarms
          </div>
        ) : (
          <table className="alarm-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>Priority</th>
                <th style={{ width: '100px' }}>Time</th>
                <th>Description</th>
                <th style={{ width: '80px' }}>Value</th>
                <th style={{ width: '80px' }}>State</th>
                <th style={{ width: '80px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {activeAlarms.map(alarm => (
                <tr key={alarm.id}>
                  <td>
                    <span
                      className={`priority ${alarm.priority.toLowerCase()}`}
                      style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        backgroundColor: getPriorityColor(alarm.priority),
                        color: alarm.priority === 'H' || alarm.priority === 'L' ? 'black' : 'white'
                      }}
                    >
                      {alarm.priority}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'Consolas', fontSize: '12px' }}>
                    {formatTime(alarm.activatedAt)}
                  </td>
                  <td>{alarm.message}</td>
                  <td style={{ fontFamily: 'Consolas' }}>{alarm.value.toFixed(1)}</td>
                  <td>
                    <span style={{ color: alarm.acknowledgedAt ? '#ffff00' : '#ff0000' }}>
                      {alarm.acknowledgedAt ? 'ACKED' : 'UNACKED'}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-primary"
                      onClick={() => acknowledgeAlarm(alarm.id)}
                      disabled={!!alarm.acknowledgedAt}
                      style={{ padding: '2px 8px', fontSize: '11px' }}
                    >
                      ACK
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

function AlarmHistoryTab({ filter }: { filter: string }) {
  const alarms = useAlarms();

  const allAlarms = alarms.filter(a =>
    filter === '' || a.message.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <>
      <div className="panel-header">
        <span>Alarm History ({allAlarms.length})</span>
      </div>
      <div className="panel-content" style={{ flex: 1, overflow: 'auto' }}>
        <table className="alarm-table">
          <thead>
            <tr>
              <th style={{ width: '60px' }}>Priority</th>
              <th style={{ width: '100px' }}>Activated</th>
              <th>Description</th>
              <th style={{ width: '80px' }}>Value</th>
              <th style={{ width: '80px' }}>State</th>
              <th style={{ width: '100px' }}>Returned</th>
            </tr>
          </thead>
          <tbody>
            {allAlarms.map(alarm => (
              <tr key={alarm.id} style={{ opacity: alarm.state === 'RETURNED' ? 0.6 : 1 }}>
                <td>
                  <span
                    className={`priority ${alarm.priority.toLowerCase()}`}
                    style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      backgroundColor: getPriorityColor(alarm.priority),
                      color: alarm.priority === 'H' || alarm.priority === 'L' ? 'black' : 'white'
                    }}
                  >
                    {alarm.priority}
                  </span>
                </td>
                <td style={{ fontFamily: 'Consolas', fontSize: '12px' }}>
                  {formatTime(alarm.activatedAt)}
                </td>
                <td>{alarm.message}</td>
                <td style={{ fontFamily: 'Consolas' }}>{alarm.value.toFixed(1)}</td>
                <td>
                  <span style={{
                    color: alarm.state === 'ACTIVE' ? '#ff0000' :
                           alarm.state === 'ACKNOWLEDGED' ? '#ffff00' :
                           '#00ff00'
                  }}>
                    {alarm.state}
                  </span>
                </td>
                <td style={{ fontFamily: 'Consolas', fontSize: '12px' }}>
                  {alarm.returnedAt ? formatTime(alarm.returnedAt) : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function EventLogTab({ filter }: { filter: string }) {
  const events = useSimulatorStore(state => state.events);

  const filteredEvents = events.filter(e =>
    filter === '' || e.description.toLowerCase().includes(filter.toLowerCase())
  ).reverse(); // Most recent first

  return (
    <>
      <div className="panel-header">
        <span>Event Log ({filteredEvents.length})</span>
      </div>
      <div className="panel-content" style={{ flex: 1, overflow: 'auto' }}>
        <table className="alarm-table">
          <thead>
            <tr>
              <th style={{ width: '100px' }}>Time</th>
              <th style={{ width: '80px' }}>Type</th>
              <th>Description</th>
              <th style={{ width: '100px' }}>Operator</th>
            </tr>
          </thead>
          <tbody>
            {filteredEvents.map(event => (
              <tr key={event.id}>
                <td style={{ fontFamily: 'Consolas', fontSize: '12px' }}>
                  {formatTime(event.timestamp)}
                </td>
                <td>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    backgroundColor: getEventColor(event.type),
                    fontSize: '11px'
                  }}>
                    {event.type}
                  </span>
                </td>
                <td>{event.description}</td>
                <td>{event.operator || 'SYSTEM'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// Helper functions
function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
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

function getEventColor(type: string): string {
  switch (type) {
    case 'ALARM': return '#ff8800';
    case 'CMD': return '#0088ff';
    case 'MODE': return '#00ff88';
    case 'SYSTEM': return '#888888';
    case 'BYPASS': return '#ff00ff';
    case 'ESD': return '#ff0000';
    default: return '#444444';
  }
}

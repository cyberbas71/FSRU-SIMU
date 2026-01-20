// Trends Page - Real-time and Historical Trending
import { useState, useEffect, useRef } from 'react';
import { useSimulatorStore } from '../store/simulatorStore';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface TrendData {
  time: number;
  [key: string]: number;
}

const TREND_PRESETS = {
  'Gas Export': ['PT-001', 'FT-001', 'TT-001'],
  'Pressure Control': ['PT-001', 'PIC-001.SP', 'PIC-001.OUT'],
  'Flow Control': ['FT-001', 'FIC-001.SP', 'FIC-001.OUT'],
  'Heating Water': ['TT-100', 'TT-101', 'TIC-100.SP'],
  'Heater 1': ['TT-110', 'FT-110', 'FT-111.TOT'],
  'All Heater Temps': ['TT-110', 'TT-120', 'TT-130', 'TT-140', 'TT-150'],
};

const TAG_COLORS: Record<string, string> = {
  'PT-001': '#00ff00',
  'PT-002': '#00cc00',
  'PT-003': '#009900',
  'FT-001': '#00ffff',
  'TT-001': '#ff8800',
  'TT-100': '#ff0088',
  'TT-101': '#ff00ff',
  'TT-110': '#ff0000',
  'TT-120': '#ff4400',
  'TT-130': '#ff8800',
  'TT-140': '#ffcc00',
  'TT-150': '#ffff00',
  'PIC-001.SP': '#0088ff',
  'PIC-001.OUT': '#88ff00',
  'FIC-001.SP': '#0088ff',
  'FIC-001.OUT': '#88ff00',
  'TIC-100.SP': '#0088ff',
  'FT-110': '#00ffff',
  'FT-111.TOT': '#ff00ff',
};

export function TrendsPage() {
  const [selectedPreset, setSelectedPreset] = useState('Gas Export');
  const [selectedTags, setSelectedTags] = useState<string[]>(TREND_PRESETS['Gas Export']);
  const [timeRange, setTimeRange] = useState(60); // seconds
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [isPaused, setIsPaused] = useState(false);

  const tags = useSimulatorStore(state => state.tags);
  const simTime = useSimulatorStore(state => state.simTime);
  const dataRef = useRef<TrendData[]>([]);

  // Update trend data
  useEffect(() => {
    if (isPaused) return;

    const newPoint: TrendData = { time: simTime };
    selectedTags.forEach(tagId => {
      newPoint[tagId] = tags[tagId]?.value ?? 0;
    });

    dataRef.current = [...dataRef.current, newPoint].slice(-600); // Keep last 600 points (10 min at 1Hz)
    setTrendData(dataRef.current);
  }, [simTime, isPaused]);

  // Handle preset change
  const handlePresetChange = (preset: string) => {
    setSelectedPreset(preset);
    setSelectedTags(TREND_PRESETS[preset as keyof typeof TREND_PRESETS] || []);
    dataRef.current = [];
    setTrendData([]);
  };

  // Filter data for time range
  const displayData = trendData.filter(d => d.time > simTime - timeRange);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
      {/* Controls */}
      <div className="panel">
        <div className="panel-header">
          <span>TREND DISPLAY</span>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <select
              value={selectedPreset}
              onChange={e => handlePresetChange(e.target.value)}
              style={{
                padding: '4px 12px',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-primary)',
                borderRadius: '4px',
                color: 'white'
              }}
            >
              {Object.keys(TREND_PRESETS).map(preset => (
                <option key={preset} value={preset}>{preset}</option>
              ))}
            </select>

            <select
              value={timeRange}
              onChange={e => setTimeRange(parseInt(e.target.value))}
              style={{
                padding: '4px 12px',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-primary)',
                borderRadius: '4px',
                color: 'white'
              }}
            >
              <option value="30">30 sec</option>
              <option value="60">1 min</option>
              <option value="300">5 min</option>
              <option value="600">10 min</option>
            </select>

            <button
              className={`btn ${isPaused ? 'btn-success' : 'btn-warning'}`}
              onClick={() => setIsPaused(!isPaused)}
              style={{ padding: '4px 12px' }}
            >
              {isPaused ? '▶ LIVE' : '⏸ PAUSE'}
            </button>

            <button
              className="btn"
              onClick={() => { dataRef.current = []; setTrendData([]); }}
              style={{ padding: '4px 12px', backgroundColor: '#444' }}
            >
              CLEAR
            </button>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="panel" style={{ flex: 1, minHeight: '400px' }}>
        <div className="panel-content" style={{ height: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={displayData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333355" />
              <XAxis
                dataKey="time"
                stroke="#888"
                tickFormatter={(t) => formatTime(t)}
                domain={['auto', 'auto']}
              />
              <YAxis stroke="#888" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a2e',
                  border: '1px solid #333355'
                }}
                labelFormatter={(t) => `Time: ${formatTime(t as number)}`}
              />
              <Legend />
              {selectedTags.map(tagId => (
                <Line
                  key={tagId}
                  type="monotone"
                  dataKey={tagId}
                  stroke={TAG_COLORS[tagId] || '#ffffff'}
                  dot={false}
                  isAnimationActive={false}
                  strokeWidth={2}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Current Values */}
      <div className="panel">
        <div className="panel-header">
          <span>CURRENT VALUES</span>
        </div>
        <div className="panel-content">
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            {selectedTags.map(tagId => (
              <div key={tagId} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '16px',
                    height: '4px',
                    backgroundColor: TAG_COLORS[tagId] || '#ffffff'
                  }}
                />
                <span style={{ color: '#888' }}>{tagId}:</span>
                <span style={{
                  fontFamily: 'Consolas',
                  color: TAG_COLORS[tagId] || '#ffffff'
                }}>
                  {(tags[tagId]?.value ?? 0).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tag Selection */}
      <div className="panel">
        <div className="panel-header">
          <span>CUSTOM TAG SELECTION</span>
        </div>
        <div className="panel-content">
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {Object.keys(TAG_COLORS).map(tagId => (
              <label
                key={tagId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 8px',
                  backgroundColor: selectedTags.includes(tagId) ? 'var(--bg-panel)' : 'var(--bg-secondary)',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedTags.includes(tagId)}
                  onChange={e => {
                    if (e.target.checked) {
                      setSelectedTags([...selectedTags, tagId]);
                    } else {
                      setSelectedTags(selectedTags.filter(t => t !== tagId));
                    }
                  }}
                />
                <span style={{ color: TAG_COLORS[tagId] }}>{tagId}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

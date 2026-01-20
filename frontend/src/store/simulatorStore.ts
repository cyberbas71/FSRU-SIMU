// FSRU Simulator State Management
// Using Zustand for state management with WebSocket sync

import { create } from 'zustand';

export interface TagValue {
  id: string;
  value: number;
  quality: number;
  timestamp: number;
}

export interface Alarm {
  id: string;
  tagId: string;
  priority: 'LL' | 'L' | 'H' | 'HH';
  state: 'NORMAL' | 'ACTIVE' | 'ACKNOWLEDGED' | 'RETURNED' | 'SHELVED';
  value: number;
  limit: number;
  message: string;
  activatedAt: number;
  acknowledgedAt?: number;
  acknowledgedBy?: string;
}

export interface Event {
  id: string;
  timestamp: number;
  type: 'ALARM' | 'CMD' | 'MODE' | 'SYSTEM' | 'BYPASS' | 'ESD';
  description: string;
  operator?: string;
}

export interface ESDState {
  level: number;
  active: boolean;
  causeCode: number;
}

export interface SimulatorState {
  // Connection
  connected: boolean;
  ws: WebSocket | null;

  // Simulation
  simTime: number;
  simSpeed: number;
  frozen: boolean;

  // Data
  tags: Record<string, TagValue>;
  alarms: Alarm[];
  events: Event[];
  esd: ESDState;

  // UI State
  selectedScreen: string;
  selectedTag: string | null;
  faceplateOpen: string | null;

  // Actions
  connect: () => void;
  disconnect: () => void;
  setTag: (tagId: string, value: number) => void;
  sendCommand: (command: any) => void;
  acknowledgeAlarm: (alarmId: string) => void;
  acknowledgeAllAlarms: () => void;
  setScreen: (screen: string) => void;
  openFaceplate: (tagId: string) => void;
  closeFaceplate: () => void;

  // Controller actions
  setControllerSP: (controllerId: string, sp: number) => void;
  setControllerMode: (controllerId: string, mode: number) => void;
  setValvePosition: (valveId: string, position: number) => void;

  // Heater actions
  startPump: (trainId: number) => void;
  stopPump: (trainId: number) => void;
  enableHeater: (trainId: number) => void;
  disableHeater: (trainId: number) => void;

  // ESD actions
  acknowledgeESD: () => void;
  resetESD: () => void;

  // Simulation control
  setSimSpeed: (speed: number) => void;
  freezeSim: () => void;
  unfreezeSim: () => void;
  resetSim: () => void;
}

export const useSimulatorStore = create<SimulatorState>((set, get) => ({
  // Initial state
  connected: false,
  ws: null,
  simTime: 0,
  simSpeed: 1,
  frozen: false,
  tags: {},
  alarms: [],
  events: [],
  esd: { level: 0, active: false, causeCode: 0 },
  selectedScreen: 'overview',
  selectedTag: null,
  faceplateOpen: null,

  // Connection
  connect: () => {
    const wsUrl = `ws://${window.location.hostname}:3001`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('WebSocket connected');
      set({ connected: true, ws });
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        handleMessage(msg, set);
      } catch (e) {
        console.error('WebSocket message error:', e);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      set({ connected: false, ws: null });
      // Reconnect after 2 seconds
      setTimeout(() => get().connect(), 2000);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  },

  disconnect: () => {
    const { ws } = get();
    if (ws) {
      ws.close();
      set({ connected: false, ws: null });
    }
  },

  // Tag operations
  setTag: (tagId: string, value: number) => {
    const { ws } = get();
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'SET_TAG',
        data: { tagId, value }
      }));
    }
  },

  // Send command
  sendCommand: (command: any) => {
    const { ws } = get();
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'COMMAND',
        data: { ...command, operator: 'Operator', timestamp: Date.now() }
      }));
    }
  },

  // Alarm operations
  acknowledgeAlarm: (alarmId: string) => {
    get().sendCommand({ type: 'ACK_ALARM', tagId: alarmId });
  },

  acknowledgeAllAlarms: () => {
    get().sendCommand({ type: 'ACK_ALARM' });
  },

  // UI State
  setScreen: (screen: string) => set({ selectedScreen: screen }),
  openFaceplate: (tagId: string) => set({ faceplateOpen: tagId }),
  closeFaceplate: () => set({ faceplateOpen: null }),

  // Controller operations
  setControllerSP: (controllerId: string, sp: number) => {
    get().sendCommand({
      type: 'SET_SP',
      tagId: `${controllerId}.SP`,
      value: sp
    });
  },

  setControllerMode: (controllerId: string, mode: number) => {
    get().sendCommand({
      type: 'SET_MODE',
      tagId: `${controllerId}.MODE`,
      value: mode
    });
  },

  setValvePosition: (valveId: string, position: number) => {
    get().sendCommand({
      type: 'SET_OUTPUT',
      tagId: valveId,
      value: position
    });
  },

  // Heater operations
  startPump: (trainId: number) => {
    get().sendCommand({
      type: 'START',
      tagId: `PMP-${trainId * 10 + 100}`
    });
  },

  stopPump: (trainId: number) => {
    get().sendCommand({
      type: 'STOP',
      tagId: `PMP-${trainId * 10 + 100}`
    });
  },

  enableHeater: (trainId: number) => {
    get().sendCommand({
      type: 'ENABLE',
      tagId: `HTR-${trainId * 10 + 100}`
    });
  },

  disableHeater: (trainId: number) => {
    get().sendCommand({
      type: 'DISABLE',
      tagId: `HTR-${trainId * 10 + 100}`
    });
  },

  // ESD operations
  acknowledgeESD: () => {
    fetch('/api/esd/acknowledge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operator: 'Operator' })
    });
  },

  resetESD: () => {
    get().sendCommand({ type: 'RESET_ESD' });
  },

  // Simulation control
  setSimSpeed: (speed: number) => {
    fetch('/api/simulation/speed', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ speed })
    });
  },

  freezeSim: () => {
    fetch('/api/simulation/freeze', { method: 'POST' });
  },

  unfreezeSim: () => {
    fetch('/api/simulation/unfreeze', { method: 'POST' });
  },

  resetSim: () => {
    fetch('/api/simulation/reset', { method: 'POST' });
  }
}));

function handleMessage(msg: any, set: any) {
  switch (msg.type) {
    case 'INIT':
      set({
        tags: msg.data.tags,
        alarms: msg.data.alarms || [],
        simTime: msg.data.state?.time || 0,
        simSpeed: msg.data.state?.speed || 1,
        frozen: msg.data.state?.frozen || false,
        esd: msg.data.state?.esd || { level: 0, active: false, causeCode: 0 }
      });
      break;

    case 'UPDATE':
      set({
        tags: msg.data.tags,
        alarms: msg.data.alarms || [],
        simTime: msg.data.time || 0,
        esd: msg.data.esd || { level: 0, active: false, causeCode: 0 }
      });
      break;

    case 'EVENT':
      set((state: SimulatorState) => ({
        events: [...state.events.slice(-99), msg.data]
      }));
      break;
  }
}

// Helper hooks
export function useTag(tagId: string): TagValue | undefined {
  return useSimulatorStore(state => state.tags[tagId]);
}

export function useTagValue(tagId: string): number {
  return useSimulatorStore(state => state.tags[tagId]?.value ?? 0);
}

export function useAlarms(): Alarm[] {
  return useSimulatorStore(state => state.alarms);
}

export function useActiveAlarms(): Alarm[] {
  return useSimulatorStore(state =>
    state.alarms.filter(a => a.state === 'ACTIVE')
  );
}

export function useESD(): ESDState {
  return useSimulatorStore(state => state.esd);
}

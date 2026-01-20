// FSRU Simulator API Server
// REST + WebSocket API for HMI communication

import express, { Request, Response } from 'express';
import cors from 'cors';
import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';
import { simulationEngine } from '../simulation/SimulationEngine';
import { tagDefinitions, getTagDefinition, getTagsBySystem } from '../database/tags';
import { OperatorCommand, ControlMode, CapacityMode, CommFailMode } from '../types';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocketServer({ server });

// WebSocket connections
const clients = new Set<WebSocket>();

wss.on('connection', (ws: WebSocket) => {
  clients.add(ws);
  console.log('Client connected. Total clients:', clients.size);

  // Send initial state
  ws.send(JSON.stringify({
    type: 'INIT',
    data: {
      tags: Object.fromEntries(simulationEngine.getAllTags()),
      alarms: simulationEngine.getAlarms(),
      state: {
        time: simulationEngine.getState().time,
        speed: simulationEngine.getState().speed,
        frozen: simulationEngine.getState().frozen,
        esd: simulationEngine.getState().esd
      }
    }
  }));

  ws.on('message', (message: Buffer) => {
    try {
      const msg = JSON.parse(message.toString());
      handleWebSocketMessage(ws, msg);
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    console.log('Client disconnected. Total clients:', clients.size);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    clients.delete(ws);
  });
});

function handleWebSocketMessage(ws: WebSocket, msg: any): void {
  switch (msg.type) {
    case 'COMMAND':
      const result = simulationEngine.processCommand(msg.data as OperatorCommand);
      ws.send(JSON.stringify({ type: 'COMMAND_RESULT', data: result }));
      break;

    case 'GET_TAGS':
      ws.send(JSON.stringify({
        type: 'TAGS',
        data: Object.fromEntries(simulationEngine.getAllTags())
      }));
      break;

    case 'SET_TAG':
      simulationEngine.setTag(msg.data.tagId, msg.data.value);
      break;

    case 'SUBSCRIBE':
      // Client wants specific tags - handled by broadcast
      break;
  }
}

// Broadcast updates to all connected clients
simulationEngine.on('update', (state) => {
  const updateMessage = JSON.stringify({
    type: 'UPDATE',
    data: {
      time: state.time,
      tags: Object.fromEntries(state.tags),
      alarms: Array.from(state.alarms.values()),
      esd: {
        level: state.esd.level,
        active: state.esd.active,
        causeCode: state.esd.causeCode
      }
    }
  });

  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(updateMessage);
    }
  });
});

simulationEngine.on('event', (event) => {
  const eventMessage = JSON.stringify({
    type: 'EVENT',
    data: event
  });

  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(eventMessage);
    }
  });
});

// ==========================================
// REST API Endpoints
// ==========================================

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    time: Date.now(),
    simTime: simulationEngine.getState().time,
    clients: clients.size
  });
});

// Get all tag definitions
app.get('/api/tags/definitions', (req: Request, res: Response) => {
  res.json(tagDefinitions);
});

// Get tag definition by ID
app.get('/api/tags/definitions/:tagId', (req: Request, res: Response) => {
  const def = getTagDefinition(req.params.tagId);
  if (def) {
    res.json(def);
  } else {
    res.status(404).json({ error: 'Tag not found' });
  }
});

// Get tags by system
app.get('/api/tags/system/:system', (req: Request, res: Response) => {
  const tags = getTagsBySystem(req.params.system);
  res.json(tags);
});

// Get all current tag values
app.get('/api/tags/values', (req: Request, res: Response) => {
  res.json(Object.fromEntries(simulationEngine.getAllTags()));
});

// Get specific tag value
app.get('/api/tags/values/:tagId', (req: Request, res: Response) => {
  const tag = simulationEngine.getAllTags().get(req.params.tagId);
  if (tag) {
    res.json(tag);
  } else {
    res.status(404).json({ error: 'Tag not found' });
  }
});

// Set tag value
app.put('/api/tags/values/:tagId', (req: Request, res: Response) => {
  const { value, quality } = req.body;
  simulationEngine.setTag(req.params.tagId, value, quality);
  res.json({ success: true });
});

// Get alarms
app.get('/api/alarms', (req: Request, res: Response) => {
  res.json(simulationEngine.getAlarms());
});

// Acknowledge alarm
app.post('/api/alarms/:alarmId/acknowledge', (req: Request, res: Response) => {
  const { operator } = req.body;
  const result = simulationEngine.processCommand({
    type: 'ACK_ALARM',
    tagId: req.params.alarmId,
    operator: operator || 'API',
    timestamp: Date.now()
  });
  res.json(result);
});

// Acknowledge all alarms
app.post('/api/alarms/acknowledge-all', (req: Request, res: Response) => {
  const { operator } = req.body;
  const result = simulationEngine.processCommand({
    type: 'ACK_ALARM',
    operator: operator || 'API',
    timestamp: Date.now()
  });
  res.json(result);
});

// Get events
app.get('/api/events', (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 100;
  res.json(simulationEngine.getEvents(limit));
});

// Get simulation state
app.get('/api/simulation/state', (req: Request, res: Response) => {
  const state = simulationEngine.getState();
  res.json({
    time: state.time,
    speed: state.speed,
    frozen: state.frozen,
    scenarioId: state.scenarioId,
    config: state.config,
    esd: state.esd,
    commStatus: state.commStatus
  });
});

// Start simulation
app.post('/api/simulation/start', (req: Request, res: Response) => {
  simulationEngine.start();
  res.json({ success: true, message: 'Simulation started' });
});

// Stop simulation
app.post('/api/simulation/stop', (req: Request, res: Response) => {
  simulationEngine.stop();
  res.json({ success: true, message: 'Simulation stopped' });
});

// Freeze simulation
app.post('/api/simulation/freeze', (req: Request, res: Response) => {
  simulationEngine.freeze();
  res.json({ success: true, message: 'Simulation frozen' });
});

// Unfreeze simulation
app.post('/api/simulation/unfreeze', (req: Request, res: Response) => {
  simulationEngine.unfreeze();
  res.json({ success: true, message: 'Simulation unfrozen' });
});

// Set simulation speed
app.put('/api/simulation/speed', (req: Request, res: Response) => {
  const { speed } = req.body;
  simulationEngine.setSpeed(speed);
  res.json({ success: true, speed: simulationEngine.getState().speed });
});

// Reset simulation
app.post('/api/simulation/reset', (req: Request, res: Response) => {
  simulationEngine.reset();
  res.json({ success: true, message: 'Simulation reset' });
});

// Set configuration
app.put('/api/simulation/config', (req: Request, res: Response) => {
  simulationEngine.setConfig(req.body);
  res.json({ success: true, config: simulationEngine.getState().config });
});

// Process operator command
app.post('/api/command', (req: Request, res: Response) => {
  const command: OperatorCommand = {
    ...req.body,
    timestamp: Date.now()
  };
  const result = simulationEngine.processCommand(command);
  res.json(result);
});

// ESD operations
app.post('/api/esd/acknowledge', (req: Request, res: Response) => {
  const { operator } = req.body;
  simulationEngine.acknowledgeESD(operator || 'API');
  res.json({ success: true });
});

app.post('/api/esd/reset', (req: Request, res: Response) => {
  const { operator } = req.body;
  const result = simulationEngine.processCommand({
    type: 'RESET_ESD',
    operator: operator || 'API',
    timestamp: Date.now()
  });
  res.json(result);
});

// Fault injection (instructor mode)
app.post('/api/faults/inject', (req: Request, res: Response) => {
  const { faultType, tagId, value } = req.body;
  simulationEngine.injectFault(faultType, tagId, value);
  res.json({ success: true, message: `Fault ${faultType} injected` });
});

app.post('/api/faults/clear', (req: Request, res: Response) => {
  const { faultType, tagId } = req.body;
  simulationEngine.clearFault(faultType, tagId);
  res.json({ success: true, message: `Fault ${faultType} cleared` });
});

// Controller operations
app.get('/api/controllers', (req: Request, res: Response) => {
  const state = simulationEngine.getState();
  res.json(Object.fromEntries(state.controllers));
});

app.put('/api/controllers/:id/setpoint', (req: Request, res: Response) => {
  const { value, operator } = req.body;
  const result = simulationEngine.processCommand({
    type: 'SET_SP',
    tagId: `${req.params.id}.SP`,
    value,
    operator: operator || 'API',
    timestamp: Date.now()
  });
  res.json(result);
});

app.put('/api/controllers/:id/mode', (req: Request, res: Response) => {
  const { mode, operator } = req.body;
  const result = simulationEngine.processCommand({
    type: 'SET_MODE',
    tagId: `${req.params.id}.MODE`,
    value: mode,
    operator: operator || 'API',
    timestamp: Date.now()
  });
  res.json(result);
});

app.put('/api/controllers/:id/output', (req: Request, res: Response) => {
  const { value, operator } = req.body;
  const result = simulationEngine.processCommand({
    type: 'SET_OUTPUT',
    tagId: req.params.id,
    value,
    operator: operator || 'API',
    timestamp: Date.now()
  });
  res.json(result);
});

// Heater train operations
app.get('/api/heaters', (req: Request, res: Response) => {
  const state = simulationEngine.getState();
  res.json(state.heaterTrains);
});

app.post('/api/heaters/:id/pump/start', (req: Request, res: Response) => {
  const { operator } = req.body;
  const prefix = parseInt(req.params.id) * 10 + 100;
  const result = simulationEngine.processCommand({
    type: 'START',
    tagId: `PMP-${prefix}`,
    operator: operator || 'API',
    timestamp: Date.now()
  });
  res.json(result);
});

app.post('/api/heaters/:id/pump/stop', (req: Request, res: Response) => {
  const { operator } = req.body;
  const prefix = parseInt(req.params.id) * 10 + 100;
  const result = simulationEngine.processCommand({
    type: 'STOP',
    tagId: `PMP-${prefix}`,
    operator: operator || 'API',
    timestamp: Date.now()
  });
  res.json(result);
});

app.post('/api/heaters/:id/enable', (req: Request, res: Response) => {
  const { operator } = req.body;
  const prefix = parseInt(req.params.id) * 10 + 100;
  const result = simulationEngine.processCommand({
    type: 'ENABLE',
    tagId: `HTR-${prefix}`,
    operator: operator || 'API',
    timestamp: Date.now()
  });
  res.json(result);
});

app.post('/api/heaters/:id/disable', (req: Request, res: Response) => {
  const { operator } = req.body;
  const prefix = parseInt(req.params.id) * 10 + 100;
  const result = simulationEngine.processCommand({
    type: 'DISABLE',
    tagId: `HTR-${prefix}`,
    operator: operator || 'API',
    timestamp: Date.now()
  });
  res.json(result);
});

// Valve operations
app.post('/api/valves/:id/open', (req: Request, res: Response) => {
  const { operator } = req.body;
  simulationEngine.setTag(req.params.id, 1);
  simulationEngine.processCommand({
    type: 'SET_OUTPUT',
    tagId: req.params.id,
    value: 1,
    operator: operator || 'API',
    timestamp: Date.now()
  });
  res.json({ success: true });
});

app.post('/api/valves/:id/close', (req: Request, res: Response) => {
  const { operator } = req.body;
  simulationEngine.setTag(req.params.id, 0);
  simulationEngine.processCommand({
    type: 'SET_OUTPUT',
    tagId: req.params.id,
    value: 0,
    operator: operator || 'API',
    timestamp: Date.now()
  });
  res.json({ success: true });
});

app.put('/api/valves/:id/position', (req: Request, res: Response) => {
  const { position, operator } = req.body;
  const result = simulationEngine.processCommand({
    type: 'SET_OUTPUT',
    tagId: req.params.id,
    value: position,
    operator: operator || 'API',
    timestamp: Date.now()
  });
  res.json(result);
});

// Error handling
app.use((err: Error, req: Request, res: Response, next: Function) => {
  console.error('API Error:', err);
  res.status(500).json({ error: err.message });
});

export function startServer(): void {
  server.listen(PORT, () => {
    console.log(`FSRU Simulator API server running on port ${PORT}`);
    console.log(`WebSocket server ready for connections`);

    // Auto-start simulation
    simulationEngine.start();
    console.log('Simulation engine started');
  });
}

export { app, server, wss };

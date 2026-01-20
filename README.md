# FSRU Brunsbüttel Simulator

High-fidelity software simulator for the Brunsbüttel FSRU (Floating Storage and Regasification Unit) control system. This simulator provides operator training capability with realistic ICSS/SCADA/HMI behavior.

## Features

- **Gas Export Control**: Mixed pressure + flow control philosophy (~60 bar, 350/700 Nm³/h modes)
- **Heating Water System**: 5 identical heater trains, open loop, 19°C target supply temperature
- **ESD Behavior**: ESD-1 and ESD-2 with cause/effect logic and reset philosophy
- **Operator HMI**: Web-based interface with mimics, faceplates, trends, and alarms
- **Training Mode**: Scenario injection, fault simulation, and instructor controls

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        FSRU SIMULATOR                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────────┐          ┌─────────────────────┐          │
│  │   FRONTEND (HMI)    │◄────────►│   BACKEND (Engine)  │          │
│  │   React + TypeScript │   WS    │   Node.js + TypeScript│         │
│  │   Port: 3000         │         │   Port: 3001         │          │
│  └─────────────────────┘          └─────────────────────┘          │
│                                            │                        │
│                                   ┌────────┴────────┐              │
│                                   │                 │              │
│                            ┌──────▼──────┐  ┌──────▼──────┐       │
│                            │ Simulation  │  │  Database   │       │
│                            │   Engine    │  │  (SQLite)   │       │
│                            └─────────────┘  └─────────────┘       │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd FSRU-SIMU

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Running the Simulator

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
The backend will start on http://localhost:3001

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
The frontend will start on http://localhost:3000

### Access the HMI

Open your browser and navigate to: **http://localhost:3000**

## Project Structure

```
FSRU-SIMU/
├── docs/                      # Documentation
│   ├── requirements.md        # Requirements & assumptions
│   ├── tag-database.md        # Tag list table
│   ├── control-narratives/    # Control logic documentation
│   │   ├── gas-export.md
│   │   ├── heating-water.md
│   │   └── esd-cause-effect.md
│   ├── ui-screen-map.md       # HMI screen definitions
│   └── acceptance-tests.md    # Test scripts
├── backend/                   # Simulation engine
│   ├── src/
│   │   ├── simulation/        # Process models
│   │   ├── database/          # Tag database
│   │   ├── api/               # REST/WebSocket API
│   │   └── types/             # TypeScript types
│   └── package.json
├── frontend/                  # Operator HMI
│   ├── src/
│   │   ├── components/        # UI components
│   │   ├── pages/             # HMI screens
│   │   ├── store/             # State management
│   │   └── styles/            # CSS styles
│   └── package.json
├── scenarios/                 # Training scenarios
│   └── training-scenarios.md
├── PROGRESS.md               # Development progress
├── TODO.md                   # Task tracking
└── README.md                 # This file
```

## System Overview

### Gas Export System

The gas export system controls delivery to the ENTSOG/Gasunie network:

- **Export Pressure**: Nominal 60 bar (adjustable 55-65 bar)
- **Capacity Modes**:
  - Mode 1: 350 Nm³/h (current terminal)
  - Mode 2: 700 Nm³/h (new terminal)
- **Control**: Mixed pressure + flow with pressure priority

### Heating Water System

5 identical heater trains supply heated water for LNG vaporization:

- **Inlet Temperature**: 5°C (Elbe river source)
- **Supply Target**: 19°C
- **Heater Gas Limit**: 24 Nm³/day per heater
- **Pump Rating**: 1 MW per pump

### ESD System

Two-level Emergency Shutdown system:

- **ESD-1**: Facility shutdown (gas export + heating water)
- **ESD-2**: Process unit shutdown (gas export only)

## HMI Screens

| Screen | Description |
|--------|-------------|
| Overview | Plant-wide status dashboard |
| Gas Export | P&ID style mimic with controllers |
| Heating Water | 5 heater train view with staging |
| ESD Status | Cause/effect matrix and reset |
| Alarms | Active alarms and history |
| Trends | Real-time and historical data |

## API Reference

### REST Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/health | Health check |
| GET | /api/tags/values | All tag values |
| GET | /api/tags/values/:tagId | Single tag value |
| PUT | /api/tags/values/:tagId | Set tag value |
| GET | /api/alarms | All alarms |
| POST | /api/alarms/:id/acknowledge | Ack alarm |
| POST | /api/command | Send operator command |
| POST | /api/simulation/start | Start simulation |
| POST | /api/simulation/stop | Stop simulation |
| POST | /api/simulation/freeze | Freeze simulation |
| PUT | /api/simulation/speed | Set sim speed |
| POST | /api/esd/reset | Reset ESD |
| POST | /api/faults/inject | Inject fault |

### WebSocket Messages

Connect to `ws://localhost:3001` for real-time updates.

**Incoming Messages:**
- `INIT` - Initial state on connection
- `UPDATE` - Periodic state updates
- `EVENT` - New event notifications

**Outgoing Messages:**
- `COMMAND` - Send operator command
- `SET_TAG` - Set tag value

## Configuration

### Simulation Configuration Tags

| Tag | Description | Default |
|-----|-------------|---------|
| CFG.CAPACITY-MODE | Capacity mode (1=350, 2=700) | 1 |
| CFG.COMM-FAIL-MODE | Comm fail mode (0=Trip, 1=Hold, 2=Local) | 0 |
| CFG.COMM-HOLD-TIME | Hold time (minutes) | 5 |
| CFG.GAS-DAY-RESET | Gas day reset hour | 6 |
| CFG.TRANSPORT-DELAY | Transport delay (minutes) | 5 |
| CFG.HEAT-LOSS-COEF | Heat loss (°C/km) | 0.5 |

### Simulation Controls

| Tag | Description |
|-----|-------------|
| SIM.SPEED | Speed multiplier (0.1-10x) |
| SIM.FREEZE | Freeze simulation (0/1) |

## Training Scenarios

See `scenarios/training-scenarios.md` for detailed training exercises:

1. **Normal Operations**: Startup, steady-state, shutdown
2. **Fault Scenarios**: Heater trip, pump failure, sensor stuck
3. **Communication Failures**: Fail-safe, hold-last, local autonomy
4. **ESD Scenarios**: ESD-1, ESD-2, recovery
5. **Capacity Scenarios**: Mode switching, demand limits

## Testing

### Run Acceptance Tests

Execute tests as described in `docs/acceptance-tests.md`:

1. Control Logic Tests
2. Safety Tests (ESD, interlocks)
3. HMI Tests
4. Integration Tests

## Assumptions

Since reference PDF documents were not available, the following industry-standard assumptions were applied:

- Export pressure range: 55-65 bar
- Valve slew rate: 5%/sec
- ESD response time: < 3 seconds (ESD-1), < 5 seconds (ESD-2)
- Transport delay: 5 minutes
- Heat loss coefficient: 0.5°C/km
- Heater gas consumption: 24 Nm³/day per heater

All assumed values are clearly marked in the documentation with "**ASSUMED**".

## Technology Stack

- **Backend**: Node.js, TypeScript, Express, WebSocket
- **Frontend**: React 18, TypeScript, Vite, Zustand, Recharts
- **Database**: SQLite (for persistence)

## License

Proprietary - For Training Use Only

## Support

For issues and questions, contact the development team.

---

*FSRU Brunsbüttel Simulator v1.0.0*

# FSRU Simulator - Development Progress

## Project Overview
High-fidelity software simulator mimicking onboard FSRU control software for Brunsbüttel terminal.
- **Gas Export Control**: Mixed pressure + flow control (~60 bar, 350/700 Nm³/h capacity modes)
- **Heating-Water Subsystem**: 5 identical heater trains, open loop, 19°C target supply temp
- **ESD Behavior**: Levels 1 & 2 with cause/effect logic
- **Operator HMI**: Web-based with mimics, faceplates, trends, alarms

---

## Progress Log

### 2026-01-20 - Project Initialization
- [x] Created project repository structure
- [x] Created PROGRESS.md tracking file
- [x] Created TODO.md task tracking file
- [x] Requirements and assumptions documentation
- [x] Tag database creation (168 tags)
- [x] Control narratives (gas export, heating water, ESD)
- [x] UI screen map documentation
- [x] Backend simulation engine (TypeScript/Node.js)
- [x] Frontend HMI (React/TypeScript)
- [x] Training scenarios (5 categories, 15+ scenarios)
- [x] Acceptance tests (20 tests across 4 categories)

### Deliverables Completed
1. **Documentation**
   - docs/requirements.md - Full requirements with assumptions
   - docs/tag-database.md - 168 tags across all systems
   - docs/control-narratives/gas-export.md - Pressure/flow control
   - docs/control-narratives/heating-water.md - 5 heater trains
   - docs/control-narratives/esd-cause-effect.md - ESD matrix
   - docs/ui-screen-map.md - HMI screen specifications
   - docs/acceptance-tests.md - Test procedures

2. **Backend**
   - backend/src/types/index.ts - TypeScript type definitions
   - backend/src/database/tags.ts - Tag database
   - backend/src/simulation/SimulationEngine.ts - Core simulation
   - backend/src/api/server.ts - REST + WebSocket API
   - backend/src/index.ts - Entry point

3. **Frontend**
   - frontend/src/store/simulatorStore.ts - State management
   - frontend/src/components/ - Common UI components
   - frontend/src/pages/ - HMI screens (6 pages)
   - frontend/src/styles/global.css - SCADA styling

4. **Training**
   - scenarios/training-scenarios.md - 15+ scenarios

---

## Key Assumptions (No PDF References Available)
Since reference PDFs are not present in the repository, the following conservative industry defaults are applied:

1. **Gas Export**
   - Export pressure setpoint: 60 bar (adjustable 55-65 bar)
   - Capacity Mode 1: 350 Nm³/h (current terminal)
   - Capacity Mode 2: 700 Nm³/h (new terminal)
   - Ramp rate limits: 10% per minute

2. **Heating Water System**
   - Inlet water temperature: 5°C (Elbe river source)
   - Supply temperature target: 19°C
   - 5 identical heater trains
   - Per-heater gas consumption: 24 Nm³/day max
   - Pump rating: 1 MW per pump (one pump per heater train)
   - Transport delay: 5 minutes (configurable)
   - Heat loss coefficient: 0.5°C per km

3. **ESD Philosophy**
   - ESD-1: Full facility trip (gas export + heating water)
   - ESD-2: Process unit trip (selective)
   - Reset requires manual acknowledgment + permissives

4. **Communications Fallback**
   - Default: Fail-safe trip on comms loss
   - Configurable options: Hold-last, Local autonomy

---

## Milestones

| Milestone | Target | Status |
|-----------|--------|--------|
| Project Setup & Documentation | Day 1 | In Progress |
| Tag Database Complete | Day 1 | Pending |
| Control Narratives | Day 1 | Pending |
| Backend Simulation Engine | Day 2 | Pending |
| Frontend HMI | Day 3 | Pending |
| Training Scenarios | Day 4 | Pending |
| Acceptance Tests | Day 4 | Pending |
| Integration & Testing | Day 5 | Pending |

---

## Technical Stack
- **Backend**: Node.js / TypeScript
- **Frontend**: React with TypeScript
- **State Management**: Redux Toolkit
- **Simulation Engine**: Custom time-stepped state machine
- **Database**: SQLite for persistence (alarms, events, config)
- **API**: REST + WebSocket for real-time updates
- **Charts/Trends**: Recharts
- **UI Components**: Custom SCADA-style components

---

## File Structure
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
│   │   ├── control/           # Control logic
│   │   ├── alarms/            # Alarm management
│   │   ├── esd/               # ESD logic
│   │   ├── comms/             # Communications simulation
│   │   └── api/               # REST/WebSocket API
│   └── package.json
├── frontend/                  # Operator HMI
│   ├── src/
│   │   ├── components/        # UI components
│   │   ├── pages/             # HMI screens
│   │   ├── store/             # State management
│   │   └── utils/             # Utilities
│   └── package.json
├── scenarios/                 # Training scenarios
├── PROGRESS.md
├── TODO.md
└── README.md
```

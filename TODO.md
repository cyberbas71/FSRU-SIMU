# FSRU Simulator - Task List

## Legend
- [ ] Not started
- [~] In progress
- [x] Complete

---

## Phase 1: Documentation & Design

### 1.1 Requirements & Assumptions
- [~] Create requirements.md with explicit assumptions
- [ ] Document process parameters and constraints
- [ ] Document alarm philosophy
- [ ] Document ESD philosophy

### 1.2 Tag Database
- [ ] Create gas export tags (AI/AO/DI/DO)
- [ ] Create heating water tags (5 trains)
- [ ] Create ESD tags and contacts
- [ ] Create utility/communication tags
- [ ] Add assumed tags (clearly labeled)

### 1.3 Control Narratives
- [ ] Gas export pressure/flow control narrative
- [ ] Heating water subsystem narrative
- [ ] ESD cause and effect matrix
- [ ] Startup/shutdown sequences

### 1.4 UI Screen Map
- [ ] Define screen hierarchy
- [ ] Document navigation flow
- [ ] Define faceplate specifications
- [ ] Define trend configurations

---

## Phase 2: Backend Simulation Engine

### 2.1 Core Infrastructure
- [ ] Project setup (TypeScript, dependencies)
- [ ] Tag database implementation
- [ ] Time-stepped simulation loop
- [ ] Quality bits and status handling

### 2.2 Process Models
- [ ] Gas export process model
- [ ] Heating water process model (5 trains)
- [ ] Transport delay model
- [ ] Heat loss model
- [ ] Sensor noise generation

### 2.3 Control Logic
- [ ] Export pressure controller (PID)
- [ ] Export flow controller with constraints
- [ ] Mixed pressure/flow coordination
- [ ] Heater staging logic (auto mode)
- [ ] Pump start/stop logic
- [ ] Heater gas consumption tracking

### 2.4 ESD Logic
- [ ] ESD-1 cause and effect
- [ ] ESD-2 cause and effect
- [ ] Reset philosophy implementation
- [ ] Permissive checking

### 2.5 Alarm System
- [ ] Alarm priority levels (HH/H/L/LL)
- [ ] Deadband and delay implementation
- [ ] First-up trip logic
- [ ] Alarm shelving with audit trail

### 2.6 Communications Simulation
- [ ] Comms status modeling
- [ ] Fail-safe trip mode
- [ ] Hold-last-output mode
- [ ] Local autonomy mode

### 2.7 API Layer
- [ ] REST API endpoints
- [ ] WebSocket real-time updates
- [ ] Tag read/write operations
- [ ] Configuration endpoints

### 2.8 Persistence
- [ ] SQLite database setup
- [ ] Alarm history storage
- [ ] Event logging
- [ ] Configuration persistence

---

## Phase 3: Frontend HMI

### 3.1 Core Infrastructure
- [ ] React project setup
- [ ] Redux store configuration
- [ ] WebSocket client
- [ ] Routing setup

### 3.2 Common Components
- [ ] Value display widget
- [ ] Trend chart component
- [ ] Alarm banner
- [ ] Faceplate framework
- [ ] Valve symbol
- [ ] Pump symbol
- [ ] PID controller faceplate
- [ ] Analog indicator

### 3.3 HMI Screens
- [ ] Overview dashboard
- [ ] Gas export mimic
- [ ] Heating water mimic (5 trains)
- [ ] ESD status page
- [ ] Alarm summary
- [ ] Event list
- [ ] Trend display
- [ ] Permissive/interlock panel
- [ ] Maintenance bypass page
- [ ] Tag search/navigation
- [ ] Configuration screen

### 3.4 Operator Interactions
- [ ] Manual/Auto mode switching
- [ ] Setpoint entry
- [ ] Valve manual operation
- [ ] Pump start/stop commands
- [ ] Alarm acknowledgment
- [ ] ESD reset

---

## Phase 4: Training Scenarios

### 4.1 Normal Operations
- [ ] Startup sequence scenario
- [ ] Steady-state operation
- [ ] Load change scenarios
- [ ] Shutdown sequence

### 4.2 Fault Scenarios
- [ ] Heater trip scenario
- [ ] Pump fail-to-start scenario
- [ ] Sensor stuck scenario
- [ ] Multiple heater failure

### 4.3 Communication Failures
- [ ] Comms loss - fail-safe mode
- [ ] Comms loss - hold-last mode
- [ ] Comms loss - local autonomy mode

### 4.4 ESD Scenarios
- [ ] ESD-1 activation
- [ ] ESD-2 activation
- [ ] ESD recovery sequence

### 4.5 Capacity Scenarios
- [ ] Demand beyond 350 Nm³/h
- [ ] Demand beyond 700 Nm³/h
- [ ] Mode switching (350↔700)

---

## Phase 5: Acceptance Tests

### 5.1 Control Logic Tests
- [ ] Pressure control response
- [ ] Flow control response
- [ ] Constraint handling
- [ ] Heater staging logic

### 5.2 Safety Tests
- [ ] ESD activation tests
- [ ] Interlock tests
- [ ] Permissive verification

### 5.3 HMI Tests
- [ ] Screen navigation
- [ ] Operator command tests
- [ ] Alarm display tests
- [ ] Trend display tests

### 5.4 Integration Tests
- [ ] End-to-end scenarios
- [ ] Performance tests
- [ ] Persistence tests

---

## Phase 6: Final Integration

- [ ] Run all acceptance tests
- [ ] Documentation review
- [ ] Run instructions
- [ ] Final README update

---

## Notes & Blockers
- No PDF reference documents available - using industry standard assumptions
- All assumed values clearly marked in documentation
- Heater gas cap assumed as 24 Nm³/day (Normal cubic meters)
- Pump rating assumed as 1 MW per pump, one pump per heater train
- Export pressure adjustable 55-65 bar with 60 bar default

# FSRU Simulator - Requirements and Assumptions

## 1. Project Overview

### 1.1 Purpose
High-fidelity software simulator mimicking the onboard FSRU control software used at Brunsbüttel terminal. The simulator provides operator training capability with realistic ICSS/SCADA/HMI behavior.

### 1.2 Scope
- Gas export control to ENTSOG/Gasunie network
- Remote heating-water system (5 heater trains)
- ESD behavior simulation
- Operator HMI with training mode

---

## 2. Process Requirements

### 2.1 Gas Export System

| Parameter | Value | Source | Notes |
|-----------|-------|--------|-------|
| Export Pressure Nominal | 60 bar | USER-PROVIDED | Network delivery pressure |
| Export Pressure Range | 55-65 bar | **ASSUMED** | Operator-adjustable setpoint band |
| Capacity Mode 1 | 350 Nm³/h | USER-PROVIDED | Current terminal mode |
| Capacity Mode 2 | 700 Nm³/h | USER-PROVIDED | New terminal mode |
| Control Philosophy | Mixed P+F | USER-PROVIDED | Pressure priority with flow coordination |
| Ramp Rate Limit | 10%/min | **ASSUMED** | Rate of change constraint |
| Valve Slew Rate | 5%/sec | **ASSUMED** | Actuator speed limit |
| Min Export Temp | 0°C | **ASSUMED** | Offspec protection placeholder |
| Max dP/dt | 5 bar/min | **ASSUMED** | Pressure rate protection |

### 2.2 Heating Water System

| Parameter | Value | Source | Notes |
|-----------|-------|--------|-------|
| Inlet Temperature | 5°C | USER-PROVIDED | Elbe river source water |
| Supply Temperature Target | 19°C | USER-PROVIDED | Vaporization support |
| Number of Heater Trains | 5 | USER-PROVIDED | Identical trains |
| Heater Gas Consumption Limit | 24 Nm³/day | USER-PROVIDED | Per-heater daily cap |
| Pump Rating | 1 MW | USER-PROVIDED | Per pump |
| Pumps per Train | 1 | **ASSUMED** | One pump per heater train |
| Flow Rate per Train | 500 m³/h | **ASSUMED** | Water flow capacity |
| Heater Efficiency | 90% | **ASSUMED** | Thermal efficiency |
| Gas Day Reset Time | 06:00 local | **ASSUMED** | Daily consumption reset |

### 2.3 Transport and Heat Loss

| Parameter | Value | Source | Notes |
|-----------|-------|--------|-------|
| Pipeline Distance | 5 km | **ASSUMED** | Heater to FSRU distance |
| Transport Delay | 5 min | **ASSUMED** | Flow transit time |
| Temperature Lag τ | 2 min | **ASSUMED** | First-order time constant |
| Heat Loss Coefficient | 0.5°C/km | **ASSUMED** | Linear loss model |
| Ambient Temperature | 10°C | **ASSUMED** | Seasonal average |

### 2.4 ESD System

| Parameter | Value | Source | Notes |
|-----------|-------|--------|-------|
| ESD Levels | 2 | **ASSUMED** | ESD-1 (facility), ESD-2 (process unit) |
| ESD-1 Response Time | < 3 sec | **ASSUMED** | Full isolation time |
| ESD-2 Response Time | < 5 sec | **ASSUMED** | Unit isolation time |
| Reset Timeout | 30 min | **ASSUMED** | Manual reset window |
| Permissive Check Delay | 5 sec | **ASSUMED** | Pre-reset verification |

---

## 3. Control Requirements

### 3.1 Gas Export Control

#### 3.1.1 Pressure Control Loop
- **Controller Type**: PID with anti-windup
- **Setpoint**: 60 bar (adjustable 55-65 bar)
- **Output**: Export control valve position
- **Tuning (ASSUMED)**:
  - Kp = 2.0
  - Ki = 0.1 (repeats/min)
  - Kd = 0.05

#### 3.1.2 Flow Control Loop
- **Controller Type**: PID with rate limiting
- **Setpoint**: Operator-entered demand (0-350/700 Nm³/h)
- **Output**: Flow control valve or compressor speed
- **Constraints**:
  - Maximum ramp rate: 10%/min
  - High limit: Capacity mode dependent
  - Low limit: 50 Nm³/h minimum stable flow

#### 3.1.3 Mixed Mode Coordination
- Primary: Maintain export pressure at setpoint
- Secondary: Meet flow demand within pressure constraints
- Priority: If pressure cannot be maintained, reduce flow automatically

### 3.2 Heating Water Control

#### 3.2.1 Heater Staging (Auto Mode)
- Calculate required heating duty from flow and ΔT
- Stage heaters to meet duty while respecting gas limits
- Prefer lead heater rotation for wear leveling

#### 3.2.2 Heater Staging (Manual Mode)
- Operator selects which heaters to enable
- System enforces permissives and interlocks
- Alarms if supply temperature cannot be achieved

#### 3.2.3 Pump Control
- Auto start when associated heater enabled
- Auto stop when heater disabled (with delay)
- Interlock: No heater operation without pump running

### 3.3 Interlocks and Permissives

#### 3.3.1 Gas Export Permissives
- [ ] Export valve upstream pressure adequate (> 62 bar)
- [ ] Heating water supply temperature adequate (> 17°C)
- [ ] ESD system healthy and reset
- [ ] No active HH/LL alarms on export

#### 3.3.2 Heater Train Permissives
- [ ] Associated pump running and healthy
- [ ] Gas supply pressure adequate
- [ ] No active trips on train
- [ ] Daily gas consumption not exceeded

#### 3.3.3 Pump Permissives
- [ ] Electrical supply healthy
- [ ] No motor overload
- [ ] Inlet isolation valve open
- [ ] No ESD active

---

## 4. Alarm Requirements

### 4.1 Priority Levels

| Priority | Color | Response Time | Examples |
|----------|-------|---------------|----------|
| HH (Critical) | Red | Immediate | ESD trips, HH pressures |
| H (High) | Orange | < 5 min | High temperatures, deviations |
| L (Low) | Yellow | < 15 min | Low levels, minor deviations |
| LL (Critical Low) | Red | Immediate | LL pressures, LL temperatures |

### 4.2 Alarm Processing

| Feature | Setting | Notes |
|---------|---------|-------|
| Deadband | 2% of span | Chatter prevention |
| On-Delay | 3 seconds | Spike filtering |
| Off-Delay | 5 seconds | Clearing stability |
| First-Up Latching | Enabled | Trip cause identification |

### 4.3 Alarm Shelving

- Maximum shelf duration: 8 hours
- Shelving requires supervisor authorization
- All shelving logged with operator ID and reason
- Shelved alarms displayed differently (greyed)

---

## 5. ESD Requirements

### 5.1 ESD-1 (Facility Emergency Shutdown)

**Causes:**
- Manual ESD-1 pushbutton
- Fire/Gas confirmed alarm
- Export pressure HHH (> 70 bar)
- Loss of all heating water pumps

**Effects:**
- Close export ESD valve (XV-001)
- Close export control valve (PV-001) to 0%
- Trip all heaters
- Trip all pumps
- Activate audible alarm

### 5.2 ESD-2 (Process Unit Shutdown)

**Causes:**
- Manual ESD-2 pushbutton
- Export pressure HH (> 67 bar)
- Export temperature LL (< -5°C)
- Heating water supply temp LL (< 10°C)

**Effects:**
- Close export control valve (PV-001) to 0%
- Alarm notification
- Heater/pump status: Hold current (no trip)

### 5.3 Reset Philosophy

1. All ESD causes must be cleared
2. Operator acknowledges ESD
3. Permissive check passes (5 second scan)
4. Operator initiates reset command
5. 30-second reset timer
6. Manual valve opening required after reset

---

## 6. Communications Requirements

### 6.1 Network Architecture (ASSUMED)

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   FSRU      │────►│   Network   │────►│   Remote    │
│   ICSS      │◄────│   Switch    │◄────│   Heaters   │
└─────────────┘     └─────────────┘     └─────────────┘
      │                                        │
      ▼                                        ▼
 [PCS + ESD]                            [RTU + PLCs]
```

### 6.2 Comms Failure Policies

| Mode | Behavior | Application |
|------|----------|-------------|
| Fail-Safe Trip | Stop remote equipment immediately | Default |
| Hold-Last-Output | Maintain last commands for X minutes, then trip | Optional |
| Local Autonomy | Remote station maintains setpoints locally | Optional |

**Configuration:**
- Policy selectable in configuration
- Hold-last timeout: 5 minutes (configurable)
- Heartbeat interval: 1 second
- Comms failure detection: 3 missed heartbeats

---

## 7. HMI Requirements

### 7.1 Screen List

| Screen | Priority | Content |
|--------|----------|---------|
| Overview | High | Plant status summary |
| Gas Export Mimic | High | Export system P&ID style |
| Heating Water Mimic | High | 5 heater trains P&ID style |
| ESD Status | High | ESD state, causes, reset |
| Alarm Summary | High | Active alarms list |
| Event List | Medium | Historical events |
| Trends | Medium | Configurable trend display |
| Faceplates | High | Control loop detail |
| Permissives | Medium | Interlock status |
| Maintenance Bypass | Low | Bypass management |
| Tag Search | Medium | Tag navigation |
| Configuration | Low | System settings |

### 7.2 Navigation

- Hierarchical menu structure
- Direct tag search
- System groupings: Gas Export, Heating Water, ESD, Utilities
- One-click faceplate access from mimic

### 7.3 Operator Actions

- Manual/Auto mode switching
- Setpoint changes
- Valve manual operation
- Pump start/stop
- Alarm acknowledgment
- ESD reset
- Bypass enable/disable (with authentication)

---

## 8. Simulation Requirements

### 8.1 Time-Step Execution

| Parameter | Value |
|-----------|-------|
| Simulation Rate | 10 Hz (100ms steps) |
| HMI Update Rate | 1 Hz |
| Trend Logging | 1 Hz |
| Alarm Scan | 10 Hz |

### 8.2 Process Dynamics

| System | Time Constant | Notes |
|--------|---------------|-------|
| Pressure Response | 5 sec | Export header |
| Flow Response | 2 sec | Control valve |
| Temperature Response | 60 sec | Heater outlet |
| Transport Delay | 300 sec | Pipeline |

### 8.3 Noise and Realism

| Signal Type | Noise Level |
|-------------|-------------|
| Pressure AI | ±0.5% |
| Temperature AI | ±0.2°C |
| Flow AI | ±1% |
| Level AI | ±0.5% |

### 8.4 Quality Bits

- Good (0): Normal operation
- Uncertain (1): Value suspect
- Bad (2): Sensor failure
- Comms Fail (3): No communication

---

## 9. Training Requirements

### 9.1 Scenario Injection

The simulator must support injection of:
- Equipment failures (valve stuck, pump trip)
- Sensor faults (bias, stuck, noise increase)
- Process upsets (demand changes, inlet temp changes)
- Communication failures
- ESD activations

### 9.2 Scenario Categories

1. **Normal Operations**: Startup, steady-state, shutdown
2. **Fault Scenarios**: Equipment failures
3. **Communication Failures**: Various fallback modes
4. **ESD Scenarios**: Activation and recovery
5. **Capacity Scenarios**: Mode switching, demand limits

### 9.3 Instructor Features

- Scenario load/save
- Freeze/resume simulation
- Fast-forward (up to 10x)
- Fault injection panel
- Student action logging

---

## 10. Acceptance Criteria

### 10.1 Control Performance

- Pressure control: ±0.5 bar of setpoint in steady state
- Flow control: ±2% of setpoint in steady state
- Heater staging: Correct number of heaters for duty

### 10.2 Safety Response

- ESD-1: Full isolation in < 3 seconds
- ESD-2: Control valve closed in < 5 seconds
- All interlocks prevent unsafe operation

### 10.3 HMI Responsiveness

- Screen change: < 500ms
- Value update: < 1 second
- Alarm notification: < 2 seconds

---

## Appendix A: Glossary

| Term | Definition |
|------|------------|
| FSRU | Floating Storage and Regasification Unit |
| ICSS | Integrated Control and Safety System |
| PCS | Process Control System |
| ESD | Emergency Shutdown System |
| HMI | Human-Machine Interface |
| Nm³ | Normal cubic meters (at 0°C, 1 atm) |
| RTU | Remote Terminal Unit |

## Appendix B: Assumption Register

All items marked **ASSUMED** are engineering estimates based on industry practice.
These should be validated against actual plant documentation when available.

| Item | Assumed Value | Basis |
|------|---------------|-------|
| Export pressure range | 55-65 bar | Typical LNG regas delivery |
| Ramp rate | 10%/min | Conservative for control |
| Valve slew | 5%/sec | Typical actuator |
| Pipeline distance | 5 km | Representative for offshore |
| Transport delay | 5 min | Based on flow rate estimate |
| Heat loss | 0.5°C/km | Insulated pipeline |
| ESD response | 3-5 sec | API 14C guidance |
| Alarm deadband | 2% | ISA-18.2 guidance |

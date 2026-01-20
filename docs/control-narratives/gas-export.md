# Gas Export Control Narrative

## 1. Overview

The gas export system controls the delivery of regasified LNG to the ENTSOG/Gasunie network at Brunsbüttel. The system uses a mixed pressure and flow control philosophy where pressure control has priority to maintain network stability.

### 1.1 Design Basis

| Parameter | Value | Notes |
|-----------|-------|-------|
| Export Pressure Setpoint | 60 bar | Adjustable 55-65 bar |
| Capacity Mode 1 | 350 Nm³/h | Current terminal |
| Capacity Mode 2 | 700 Nm³/h | New terminal |
| Minimum Stable Flow | 50 Nm³/h | Below this, recirculation required |
| Maximum Ramp Rate | 10%/min | Of capacity mode limit |
| Valve Slew Rate | 5%/sec | Actuator limitation |

### 1.2 System Configuration

```
                    ┌─────────────┐
   From Vaporizer   │   Export    │    To Network
   ─────────────────►   Header    ├───────────────►
        PT-002      │             │     PT-003
                    └──────┬──────┘
                           │
                    ┌──────┴──────┐
                    │    PT-001   │ Export Header Pressure
                    │    TT-001   │ Export Gas Temperature
                    │    FT-001   │ Export Flow
                    └─────────────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
         ┌────┴────┐  ┌────┴────┐  ┌────┴────┐
         │  XV-001 │  │  PV-001 │  │  FV-001 │
         │   ESD   │  │ Pressure│  │  Flow   │
         │  Valve  │  │   CV    │  │   CV    │
         └─────────┘  └─────────┘  └─────────┘
```

---

## 2. Control Modes

### 2.1 Mode Definitions

| Mode | Description | Valve Control |
|------|-------------|---------------|
| AUTO | Automatic control by PIC-001/FIC-001 | Controllers drive valves |
| MANUAL | Operator direct control | Operator commands valve position |
| CASCADE | Flow follows pressure controller | FIC-001 SP from PIC-001 |
| TRIP | ESD or safety trip active | Valves driven to safe state |

### 2.2 Mode Transitions

```
         ┌────────────────────────────────────────┐
         │                                        │
         ▼                                        │
    ┌─────────┐     ┌─────────┐     ┌─────────┐  │
    │  TRIP   │────►│  MANUAL │────►│  AUTO   │──┘
    └─────────┘     └─────────┘     └─────────┘
         ▲               ▲               │
         │               │               │
         └───────────────┴───────────────┘
              (ESD or Interlock)
```

**Transition Rules:**
- TRIP → MANUAL: ESD reset complete and permissives satisfied
- MANUAL → AUTO: Operator command with no active alarms
- AUTO → MANUAL: Operator command (bumpless transfer)
- Any → TRIP: ESD activation or safety interlock

---

## 3. Pressure Control Loop (PIC-001)

### 3.1 Functional Description

PIC-001 maintains export header pressure at setpoint by modulating PV-001. The controller uses a reverse-acting PID algorithm where increasing pressure causes the valve to close.

### 3.2 Controller Configuration

| Parameter | Tag | Value | Notes |
|-----------|-----|-------|-------|
| Process Variable | PT-001 | 0-100 bar | 4-20mA scaled |
| Setpoint | PIC-001.SP | 60 bar | Adjustable 55-65 |
| Output | PIC-001.OUT | 0-100% | To PV-001 |
| Proportional Gain | PIC-001.KP | 2.0 | **ASSUMED** |
| Integral Time | PIC-001.KI | 0.1 /min | **ASSUMED** |
| Derivative Time | PIC-001.KD | 0.05 min | **ASSUMED** |
| Output High Limit | - | 100% | Full open |
| Output Low Limit | - | 0% | Full closed |

### 3.3 Control Algorithm

```
Error = SP - PV                    (Reverse acting)
P_term = Kp × Error
I_term = Ki × ∫Error dt            (With anti-windup)
D_term = Kd × d(PV)/dt             (Derivative on PV)
Output = P_term + I_term + D_term
```

### 3.4 Anti-Windup Logic

When output reaches limits:
- If Output ≥ 100%: Freeze integrator, no positive integration
- If Output ≤ 0%: Freeze integrator, no negative integration

### 3.5 Setpoint Limits and Rate

| Constraint | Value | Action |
|------------|-------|--------|
| SP High Limit | 65 bar | Clamp |
| SP Low Limit | 55 bar | Clamp |
| SP Rate Limit | 1 bar/min | Rate limit on operator entry |

---

## 4. Flow Control Loop (FIC-001)

### 4.1 Functional Description

FIC-001 controls export flow rate by modulating FV-001. The flow setpoint can be entered directly by the operator or received from the pressure controller in cascade mode.

### 4.2 Controller Configuration

| Parameter | Tag | Value | Notes |
|-----------|-----|-------|-------|
| Process Variable | FT-001 | 0-1000 Nm³/h | Scaled |
| Setpoint | FIC-001.SP | 0-700 Nm³/h | Capacity dependent |
| Output | FIC-001.OUT | 0-100% | To FV-001 |
| Proportional Gain | FIC-001.KP | 1.5 | **ASSUMED** |
| Integral Time | FIC-001.KI | 0.2 /min | **ASSUMED** |
| Derivative Time | FIC-001.KD | 0 | Flow loops typically P+I only |

### 4.3 Capacity Mode Limits

| Mode | Max SP | H Alarm | HH Alarm | Notes |
|------|--------|---------|----------|-------|
| Mode 1 (350) | 350 Nm³/h | 330 | 350 | Current terminal |
| Mode 2 (700) | 700 Nm³/h | 660 | 700 | New terminal |

### 4.4 Ramp Rate Limiting

```
SP_change_request = New_SP - Current_SP
Max_change_per_scan = (Capacity × 0.10) / 60 × scan_time
If |SP_change_request| > Max_change_per_scan:
    Actual_SP_change = sign(SP_change_request) × Max_change_per_scan
Else:
    Actual_SP_change = SP_change_request
Current_SP = Current_SP + Actual_SP_change
```

---

## 5. Mixed Mode Control Coordination

### 5.1 Philosophy

The pressure controller has priority over flow control. When pressure cannot be maintained, flow must be reduced to protect network integrity.

### 5.2 Coordination Logic

```
┌─────────────────────────────────────────────────────────┐
│                   PRESSURE CONTROL                       │
│  ┌─────────────┐                     ┌─────────────┐    │
│  │   PT-001    ├────────────────────►│   PIC-001   │    │
│  │   (60 bar)  │                     │   Output    ├────┼──► PV-001
│  └─────────────┘                     └──────┬──────┘    │
│                                             │           │
│  ┌──────────────────────────────────────────┼───────────┼─┐
│  │              FLOW CONSTRAINT             │           │ │
│  │                                          ▼           │ │
│  │  ┌─────────────┐     ┌─────────────┐  Flow          │ │
│  │  │   FT-001    ├────►│   FIC-001   │  Limit         │ │
│  │  │             │     │             │◄──────         │ │
│  │  └─────────────┘     └──────┬──────┘                │ │
│  │                             │                        │ │
│  └─────────────────────────────┼────────────────────────┼─┘
│                                │                        │
│                                ▼                        │
│                            FV-001                       │
└─────────────────────────────────────────────────────────┘
```

### 5.3 Flow Constraint Logic

```
IF (PT-001 < PIC-001.SP - 2.0 bar):       // Pressure falling below band
    Flow_Constraint_Active = TRUE
    Max_Flow = FIC-001.SP × 0.95          // Reduce flow 5% per scan
    Alarm: "PRESSURE LOW - FLOW REDUCING"

IF (PT-001 < PIC-001.SP - 5.0 bar):       // Pressure critically low
    Flow_Constraint_Active = TRUE
    Max_Flow = FIC-001.SP × 0.80          // Aggressive reduction
    Alarm: "PRESSURE CRITICAL - FLOW LIMITED"

IF (PT-001 > PIC-001.SP + 1.0 bar):       // Pressure recovered
    Flow_Constraint_Active = FALSE
    Max_Flow = Capacity_Limit
```

### 5.4 Heating Water Constraint

Flow is also limited by heating water availability:

```
IF (TT-100 < 17°C):                        // Supply temp too low
    HW_Constraint_Active = TRUE
    Achievable_Flow = Calculate_From_HW_Capacity()
    Max_Flow = MIN(Max_Flow, Achievable_Flow)
    Alarm: "HEATING WATER TEMP LOW - EXPORT LIMITED"

IF (HW.HEATERS-RUNNING == 0):
    Max_Flow = 0
    Alarm: "NO HEATING WATER - EXPORT BLOCKED"
```

---

## 6. Valve Control

### 6.1 PV-001 Pressure Control Valve

| Parameter | Value | Notes |
|-----------|-------|-------|
| Type | Globe | Linear characteristic |
| Size | DN150 | **ASSUMED** |
| Cv | 250 | **ASSUMED** |
| Fail Position | Closed | Fail-safe |
| Stroke Time | 20 sec | Full travel |
| Slew Rate Limit | 5%/sec | Actuator |

### 6.2 FV-001 Flow Control Valve

| Parameter | Value | Notes |
|-----------|-------|-------|
| Type | Globe | Equal percentage |
| Size | DN200 | **ASSUMED** |
| Cv | 400 | **ASSUMED** |
| Fail Position | Closed | Fail-safe |
| Stroke Time | 30 sec | Full travel |
| Slew Rate Limit | 5%/sec | Actuator |

### 6.3 XV-001 ESD Valve

| Parameter | Value | Notes |
|-----------|-------|-------|
| Type | Ball | Full bore |
| Size | DN200 | **ASSUMED** |
| Fail Position | Closed | Spring return |
| Close Time | < 3 sec | Emergency |
| Open Time | 10 sec | Controlled |

### 6.4 Valve Position Feedback

```
Position_Error = |Command - Feedback|
IF (Position_Error > 5% for > 10 sec):
    Alarm: "VALVE DEVIATION"
IF (Position_Error > 10% for > 30 sec):
    Alarm: "VALVE FAILED"
```

---

## 7. Alarms

### 7.1 Pressure Alarms

| Tag | Limit | Priority | Delay | Action |
|-----|-------|----------|-------|--------|
| PT-001.HHH | 70 bar | Critical | 0 sec | ESD-1 |
| PT-001.HH | 67 bar | High | 3 sec | ESD-2 |
| PT-001.H | 65 bar | Warning | 5 sec | Operator alert |
| PT-001.L | 55 bar | Warning | 5 sec | Operator alert |
| PT-001.LL | 52 bar | Low | 3 sec | Flow constraint |

### 7.2 Temperature Alarms

| Tag | Limit | Priority | Delay | Action |
|-----|-------|----------|-------|--------|
| TT-001.HH | 45°C | High | 3 sec | Operator alert |
| TT-001.H | 40°C | Warning | 5 sec | Operator alert |
| TT-001.L | 0°C | Warning | 5 sec | Operator alert |
| TT-001.LL | -5°C | Critical | 0 sec | ESD-2 |

### 7.3 Flow Alarms

| Tag | Limit | Priority | Delay | Action |
|-----|-------|----------|-------|--------|
| FT-001.HH | Mode limit | High | 3 sec | Constraint active |
| FT-001.H | 95% of limit | Warning | 5 sec | Operator alert |
| FT-001.L | 50 Nm³/h | Warning | 10 sec | Below minimum stable |
| FT-001.LL | 20 Nm³/h | Low | 5 sec | Flow failure |

---

## 8. Permissives and Interlocks

### 8.1 Export Start Permissives

Before export can be started (valves opened):

| # | Condition | Tag | Required State |
|---|-----------|-----|----------------|
| 1 | ESD not active | ESD.ACTIVE | = 0 |
| 2 | Export ESD valve ready | XV-001.ZSC | = 1 (closed) |
| 3 | Upstream pressure adequate | PT-002 | > 62 bar |
| 4 | Heating water available | TT-100 | > 17°C |
| 5 | At least 1 heater running | HW.HEATERS-RUNNING | ≥ 1 |
| 6 | No HH/LL alarms active | - | No critical alarms |

### 8.2 Export Run Interlocks

During export, these conditions will trip the system:

| # | Condition | Tag | Trip Limit | Action |
|---|-----------|-----|------------|--------|
| 1 | Export pressure very high | PT-001 | > 70 bar | ESD-1 |
| 2 | Export pressure high | PT-001 | > 67 bar | ESD-2 |
| 3 | Export temp very low | TT-001 | < -5°C | ESD-2 |
| 4 | All heating water lost | HW.PUMPS-RUNNING | = 0 | ESD-1 |
| 5 | Supply temp low | TT-100 | < 10°C | ESD-2 |

---

## 9. Operating Sequences

### 9.1 Startup Sequence

```
[PRE-START CHECKS]
1. Verify ESD reset
2. Verify heating water running (TT-100 > 17°C)
3. Verify upstream pressure adequate (PT-002 > 62 bar)
4. Verify network ready to receive

[STARTUP]
5. Select capacity mode (350 or 700 Nm³/h)
6. Enter initial flow setpoint (start at minimum stable, 50 Nm³/h)
7. Set pressure setpoint (default 60 bar)
8. Place PIC-001 in AUTO
9. Open XV-001 (ESD valve)
10. Wait for XV-001.ZSO = 1
11. Place FIC-001 in AUTO
12. Gradually increase flow setpoint to target

[VERIFICATION]
13. Verify pressure at setpoint ±0.5 bar
14. Verify flow tracking setpoint
15. Verify no alarms
```

### 9.2 Normal Shutdown Sequence

```
[PREPARATION]
1. Notify network operator
2. Reduce flow setpoint gradually (10%/min max)

[SHUTDOWN]
3. When flow < 50 Nm³/h, place FIC-001 in MANUAL
4. Close FV-001 to 0%
5. Place PIC-001 in MANUAL
6. Close PV-001 to 0%
7. Close XV-001

[POST-SHUTDOWN]
8. Verify all valves closed
9. Document shutdown
```

### 9.3 Emergency Response

```
[ON ESD ACTIVATION]
1. XV-001 closes automatically (< 3 sec)
2. PV-001 and FV-001 drive to 0%
3. Note first-up cause (ESD.CAUSE)
4. Notify network operator
5. Do NOT attempt reset until cause cleared

[RECOVERY]
6. Clear ESD cause
7. Reset ESD per philosophy (see ESD narrative)
8. Perform startup sequence
```

---

## 10. Operator Interface

### 10.1 Faceplate Elements

**PIC-001 Faceplate:**
- PV bargraph (PT-001)
- SP entry field (55-65 bar)
- Output bargraph (0-100%)
- Mode buttons (AUTO/MANUAL)
- Tuning access (restricted)
- Alarm status indicators

**FIC-001 Faceplate:**
- PV bargraph (FT-001)
- SP entry field (0-700 Nm³/h)
- Output bargraph (0-100%)
- Mode buttons (AUTO/MANUAL)
- Ramp status indicator
- Constraint indicator

### 10.2 Mimic Display Elements

- Animated valve symbols showing position
- Pressure, temperature, flow values with engineering units
- Alarm colors on values (green/yellow/orange/red)
- Controller status icons (AUTO=green, MANUAL=yellow, TRIP=red)
- Flow arrows indicating direction
- Equipment status indicators

---

## 11. Testing and Tuning

### 11.1 Loop Tuning Procedure

1. Place loop in MANUAL
2. Step output by 5%
3. Record PV response
4. Calculate time constant and dead time
5. Apply tuning rules (Ziegler-Nichols or Lambda)
6. Place in AUTO and verify response
7. Fine-tune as needed

### 11.2 Acceptance Criteria

| Test | Criteria |
|------|----------|
| Step response | No overshoot > 5% |
| Settling time | < 60 seconds |
| Steady-state error | < 0.5 bar / < 2% flow |
| Disturbance rejection | Return to SP in < 120 sec |

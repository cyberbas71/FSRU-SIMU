# Heating Water System Control Narrative

## 1. Overview

The heating water system provides heated water to support LNG vaporization on the FSRU. The system consists of 5 identical heater trains located kilometers away from the FSRU, connected via a supply pipeline. This is an open-loop system where heated water is supplied to the vaporizers and discharged to the Elbe river.

### 1.1 Design Basis

| Parameter | Value | Notes |
|-----------|-------|-------|
| Number of Heater Trains | 5 | Identical |
| Inlet Water Temperature | 5°C | Elbe river source |
| Supply Temperature Target | 19°C | To vaporizers |
| Temperature Rise per Train | ~14°C | Nominal |
| Flow Rate per Train | 500 m³/h | **ASSUMED** |
| Pump Rating | 1 MW | Per pump |
| Heater Gas Consumption | 24 Nm³/day max | Per heater |
| Pipeline Distance | 5 km | **ASSUMED** |
| Transport Delay | 5 min | **ASSUMED** |
| Heat Loss | 0.5°C/km | **ASSUMED** |

### 1.2 System Configuration

```
                                    REMOTE HEATER STATION
    ┌───────────────────────────────────────────────────────────────────┐
    │                                                                    │
    │   ELBE RIVER                                                       │
    │       │                                                            │
    │       ▼                                                            │
    │   ┌───────┐                                                        │
    │   │ INLET │ TT-101 (5°C)                                          │
    │   └───┬───┘                                                        │
    │       │                                                            │
    │   ┌───┴───┬───────┬───────┬───────┬───────┐                       │
    │   │       │       │       │       │       │                       │
    │   ▼       ▼       ▼       ▼       ▼       │                       │
    │ ┌───┐   ┌───┐   ┌───┐   ┌───┐   ┌───┐    │                       │
    │ │P-1│   │P-2│   │P-3│   │P-4│   │P-5│    │  Pumps (1 MW each)   │
    │ └─┬─┘   └─┬─┘   └─┬─┘   └─┬─┘   └─┬─┘    │                       │
    │   │       │       │       │       │       │                       │
    │   ▼       ▼       ▼       ▼       ▼       │                       │
    │ ┌───┐   ┌───┐   ┌───┐   ┌───┐   ┌───┐    │                       │
    │ │H-1│   │H-2│   │H-3│   │H-4│   │H-5│    │  Heaters (gas-fired) │
    │ └─┬─┘   └─┬─┘   └─┬─┘   └─┬─┘   └─┬─┘    │                       │
    │   │       │       │       │       │       │                       │
    │   └───────┴───────┴───────┴───────┴───────┤                       │
    │                                           │                       │
    │                                       TT-100 (Supply Header)      │
    └───────────────────────────────────────────┼───────────────────────┘
                                                │
                    ════════════════════════════╪════════════════
                         5 km PIPELINE          │  (Transport Delay)
                    ════════════════════════════╪════════════════
                                                │
                                                ▼
                                    ┌───────────────────┐
                                    │      FSRU         │
                                    │   VAPORIZERS      │
                                    │                   │
                                    │   Arrival Temp    │
                                    │   ~17°C           │
                                    │   (after losses)  │
                                    └───────────────────┘
                                                │
                                                ▼
                                          DISCHARGE
                                          TO ELBE
```

---

## 2. Control Modes

### 2.1 System Modes

| Mode | Description | Heater Selection |
|------|-------------|------------------|
| AUTO | Automatic staging | System selects heaters |
| MANUAL | Operator selection | Operator enables/disables |
| TRIP | Safety trip active | All heaters/pumps stopped |

### 2.2 Heater Train States

| State | Description | Indicators |
|-------|-------------|------------|
| STOPPED | Pump off, heater off | RUN=0 |
| STANDBY | Pump running, heater off | PMP.RUN=1, HTR.RUN=0 |
| RUNNING | Pump running, heater firing | PMP.RUN=1, HTR.RUN=1 |
| TRIPPED | Fault condition | TRIP=1 |
| LIMITED | Daily gas cap reached | AVAIL=0 |

---

## 3. Temperature Control (TIC-100)

### 3.1 Functional Description

TIC-100 controls supply header temperature by staging heaters on/off. The controller calculates required heating duty and determines the optimal number of heaters to operate.

### 3.2 Controller Configuration

| Parameter | Tag | Value | Notes |
|-----------|-----|-------|-------|
| Process Variable | TT-100 | 0-50°C | Supply header temp |
| Setpoint | TIC-100.SP | 19°C | Adjustable 15-25°C |
| Output | TIC-100.OUT | 0-5 | Number of heaters |

### 3.3 Duty Calculation

```
Required_Duty = m_dot × Cp × (T_target - T_inlet)

Where:
  m_dot = Total water mass flow (kg/s)
  Cp = Specific heat of water (4.186 kJ/kg·K)
  T_target = 19°C (supply setpoint)
  T_inlet = 5°C (measured inlet)

Example:
  For 2500 m³/h total flow (5 pumps × 500 m³/h):
  m_dot = 2500 × 1000 / 3600 = 694 kg/s
  Required_Duty = 694 × 4.186 × (19 - 5) = 40,700 kW
```

### 3.4 Heater Capacity

| Parameter | Per Heater | Notes |
|-----------|------------|-------|
| Thermal Output | ~8,500 kW | **ASSUMED** based on duty |
| Gas Consumption | 1.0 Nm³/h max | At full output |
| Daily Gas Limit | 24 Nm³/day | Constraint |
| Turndown | 30% | Minimum firing rate |

### 3.5 Staging Logic (AUTO Mode)

```
Heaters_Required = CEIL(Required_Duty / Heater_Capacity)
Heaters_Required = CLAMP(Heaters_Required, 0, Available_Heaters)

Staging Algorithm:
1. Calculate required duty
2. Determine heaters needed
3. If (Running < Required) AND (Available > Running):
   - Start next heater in rotation order
   - Wait stabilization time (60 sec)
4. If (Running > Required + 1):
   - Stop least-run heater
   - Wait stabilization time (60 sec)
5. Implement deadband: ±0.5 heaters equivalent
```

### 3.6 Lead/Lag Rotation

To ensure even wear across heaters:

```
Lead_Order = [1, 2, 3, 4, 5]  // Initial

Every 24 hours (at gas day reset):
  Rotate Lead_Order left by 1
  New: [2, 3, 4, 5, 1]

Start heaters in Lead_Order sequence
Stop heaters in reverse Lead_Order
```

---

## 4. Heater Train Control

### 4.1 Heater Enable Sequence

```
[PERMISSIVES]
1. Associated pump running (PMP-1x0.RUN = 1)
2. No trip active (HTR-1x0.TRIP = 0)
3. Daily gas limit not exceeded (FT-1x1.TOT < 24)
4. Gas supply available
5. ESD not active

[ENABLE SEQUENCE]
6. Issue enable command (HTR-1x0.CMD = 1)
7. Ignition sequence (internal to heater)
8. Wait for running confirmation (HTR-1x0.RUN = 1)
9. Verify outlet temp rising
10. Add to running count
```

### 4.2 Heater Disable Sequence

```
[NORMAL STOP]
1. Issue disable command (HTR-1x0.CMD = 0)
2. Heater ramps down firing
3. Wait for stop confirmation (HTR-1x0.RUN = 0)
4. Keep pump running for cooldown (60 sec)
5. Stop pump if no other requirement

[TRIP STOP]
1. Immediate disable (HTR-1x0.CMD = 0)
2. Trip flag set (HTR-1x0.TRIP = 1)
3. Pump continues for cooldown
4. Alarm generated
5. Manual reset required
```

### 4.3 Gas Consumption Tracking

```
For each heater (1-5):
  FT-1x1.TOT += FT-1x1 × scan_time / 3600  // Integrate Nm³/h to Nm³

  IF FT-1x1.TOT >= 22:
    Alarm: "HEATER x GAS LIMIT H"

  IF FT-1x1.TOT >= 24:
    Alarm: "HEATER x GAS LIMIT HH - DERATED"
    HTR-1x0.AVAIL = 0
    IF HTR-1x0.RUN = 1:
      Initiate normal stop sequence

Gas Day Reset (configurable, default 06:00):
  FOR each heater:
    FT-1x1.TOT = 0
    HTR-1x0.AVAIL = 1 (if no other faults)
```

---

## 5. Pump Control

### 5.1 Pump States

| State | PMP.CMD | PMP.RUN | PMP.TRIP | Description |
|-------|---------|---------|----------|-------------|
| STOPPED | 0 | 0 | 0 | Normal stop |
| STARTING | 1 | 0 | 0 | Start commanded |
| RUNNING | 1 | 1 | 0 | Normal run |
| TRIPPED | 0 | 0 | 1 | Fault condition |
| LOCAL | - | - | - | Local mode active |

### 5.2 Start Permissives

| # | Condition | Tag | Required |
|---|-----------|-----|----------|
| 1 | Not in local mode | PMP-1x0.LOCAL | = 0 |
| 2 | No active trip | PMP-1x0.TRIP | = 0 |
| 3 | Electrical supply healthy | - | = 1 |
| 4 | ESD not active | ESD.ACTIVE | = 0 |
| 5 | Inlet valve open | - | = 1 |

### 5.3 Start Sequence

```
[PRE-START]
1. Verify all permissives
2. Issue start command (PMP-1x0.CMD = 1)

[STARTING]
3. Motor energizes
4. Wait for running feedback (max 10 sec)
5. IF timeout: Alarm "PUMP x FAIL TO START", set TRIP

[RUNNING]
6. Monitor motor current (PMP-1x0.AMPS)
7. Monitor power (PMP-1x0.KW)
8. Verify flow established (FT-1x0 > min)
```

### 5.4 Stop Sequence

```
[NORMAL STOP]
1. Verify heater not running (or cooling down)
2. Issue stop command (PMP-1x0.CMD = 0)
3. Wait for stop confirmation
4. Verify motor de-energized

[TRIP STOP]
1. Immediate stop on:
   - Motor overload (PMP-1x0.AMPS > 1900A)
   - Power trip (PMP-1x0.KW > 1100 kW)
   - ESD activation
2. Set trip flag
3. Require manual reset
```

### 5.5 Interlocks

| Interlock | Condition | Action |
|-----------|-----------|--------|
| Heater lockout | PMP.RUN = 0 | Block heater start |
| Auto-stop | Heater stopped + 60 sec delay | Stop pump |
| Overload trip | AMPS > 1900A for 5 sec | Trip pump |
| Power trip | KW > 1100 kW for 5 sec | Trip pump |

---

## 6. Transport Delay and Heat Loss Model

### 6.1 Transport Delay

The supply header temperature at FSRU arrival is delayed from the heater station:

```
Pipeline_Volume = π × (D/2)² × Length
Transit_Time = Pipeline_Volume / Flow_Rate

For assumed values:
  D = 0.5 m (DN500)
  Length = 5000 m
  Flow_Rate = 0.69 m³/s (2500 m³/h total)

  Pipeline_Volume = 3.14 × 0.25² × 5000 = 982 m³
  Transit_Time = 982 / 0.69 = 1423 sec ≈ 24 min

Implementation uses first-order lag + dead time:
  T_arrival(t) = T_supply(t - τ_dead) filtered by τ_lag

Where:
  τ_dead = 5 min (configurable) - pure delay
  τ_lag = 2 min (configurable) - temperature mixing
```

### 6.2 Heat Loss Model

```
T_loss = k × Distance

Where:
  k = 0.5°C/km (configurable heat loss coefficient)
  Distance = 5 km

T_arrival = T_supply - T_loss = T_supply - 2.5°C

Example:
  Supply at heater station: 19°C
  Loss over 5 km: 2.5°C
  Arrival at FSRU: 16.5°C
```

### 6.3 Supply Temperature Setpoint Compensation

To achieve target arrival temperature, the supply setpoint must be higher:

```
T_supply_SP = T_arrival_target + T_loss
T_supply_SP = 17°C + 2.5°C = 19.5°C → rounded to 19°C

Operator can adjust TIC-100.SP to compensate for actual conditions
```

---

## 7. Alarms

### 7.1 Temperature Alarms

| Tag | Limit | Priority | Delay | Action |
|-----|-------|----------|-------|--------|
| TT-100.HH | 30°C | High | 3 sec | Reduce heating |
| TT-100.H | 25°C | Warning | 5 sec | Operator alert |
| TT-100.L | 15°C | Warning | 5 sec | Increase heating |
| TT-100.LL | 10°C | Critical | 3 sec | ESD-2 trigger |
| TT-101.HH | 20°C | High | 5 sec | Unusual inlet |
| TT-101.LL | 2°C | Critical | 3 sec | Near freezing |

### 7.2 Heater Train Alarms

For each heater (x = 1-5, tag prefix TT-1x0, etc.):

| Alarm | Condition | Priority | Action |
|-------|-----------|----------|--------|
| HTR-x TRIP | HTR-1x0.TRIP = 1 | High | Check cause |
| HTR-x GAS H | FT-1x1.TOT > 22 | Warning | Approaching limit |
| HTR-x GAS HH | FT-1x1.TOT ≥ 24 | High | Heater derated |
| HTR-x OUTLET H | TT-1x0 > 28°C | Warning | Check control |
| HTR-x OUTLET HH | TT-1x0 > 35°C | High | Heater issue |

### 7.3 Pump Alarms

For each pump (x = 1-5):

| Alarm | Condition | Priority | Action |
|-------|-----------|----------|--------|
| PMP-x TRIP | PMP-1x0.TRIP = 1 | High | Check cause |
| PMP-x FAIL START | Start timeout | High | Investigate |
| PMP-x AMPS H | > 1800A | Warning | Monitor |
| PMP-x AMPS HH | > 1900A | Critical | Trip imminent |
| PMP-x KW H | > 1050 kW | Warning | Monitor |
| PMP-x LOCAL | LOCAL = 1 | Info | In local mode |

### 7.4 System Alarms

| Alarm | Condition | Priority | Action |
|-------|-----------|----------|--------|
| ALL PUMPS STOPPED | HW.PUMPS-RUNNING = 0 | Critical | ESD-1 |
| LOW HEATERS AVAIL | HW.HEATERS-AVAIL < 2 | Warning | Limited capacity |
| HW COMM FAIL | COMM.FAIL = 1 | High | Check comms |
| TOTAL GAS H | HW.TOTAL-GAS > 100 | Warning | Monitor |

---

## 8. Manual Mode Operation

### 8.1 Manual Heater Control

When HW.MODE = 0 (MANUAL):

```
Operator can:
- Enable/disable individual heaters
- Start/stop individual pumps
- Override automatic staging

System still enforces:
- Permissives (pump must run for heater)
- Interlocks (gas limit, trips)
- ESD actions
```

### 8.2 Manual Mode Entry

```
1. Operator selects MANUAL mode
2. Current running heaters continue
3. Automatic staging disabled
4. Alarm: "HW CONTROL IN MANUAL"
5. Operator takes responsibility for temp control
```

### 8.3 Return to Auto

```
1. Operator selects AUTO mode
2. System evaluates current state
3. Staging logic resumes
4. May immediately add or remove heaters
5. Clear manual mode alarm
```

---

## 9. Communications Failure Handling

### 9.1 Detection

```
Heartbeat monitored every 1 second
IF (missed heartbeats > 3):
    COMM.FAIL = 1
    Alarm: "HW REMOTE COMM FAILURE"
```

### 9.2 Failure Mode Options

| Mode | CFG.COMM-FAIL-MODE | Behavior |
|------|-------------------|----------|
| Fail-Safe Trip | 0 | Stop all heaters and pumps |
| Hold Last | 1 | Maintain last state for X minutes |
| Local Autonomy | 2 | Remote station maintains locally |

### 9.3 Fail-Safe Trip (Default)

```
ON COMM.FAIL = 1:
    FOR each heater: Issue stop
    FOR each pump: Issue stop
    Alarm: "HW TRIPPED ON COMM LOSS"
    Gas export constrained (no HW available)
```

### 9.4 Hold Last Output

```
ON COMM.FAIL = 1:
    COMM.HOLDTIME = CFG.COMM-HOLD-TIME × 60  // seconds
    Maintain last commands to heaters/pumps

    WHILE COMM.HOLDTIME > 0:
        COMM.HOLDTIME -= scan_time
        IF (comms restored):
            Exit hold mode
            Resume normal control

    ON COMM.HOLDTIME = 0:
        Execute fail-safe trip
        Alarm: "HW TRIPPED - HOLD TIME EXPIRED"
```

### 9.5 Local Autonomy

```
ON COMM.FAIL = 1:
    Remote RTU maintains:
    - Current heater on/off states
    - Current pump on/off states
    - Local temperature control (if available)

    FSRU ICSS:
    - Marks values as COMM.FAIL quality
    - Cannot command changes
    - Monitors when comms restore

    ON comms restore:
        Resynchronize states
        Resume remote control
```

---

## 10. Integration with Gas Export

### 10.1 Coupling Logic

Gas export capacity depends on heating water availability:

```
Available_HW_Capacity =
    HW.HEATERS-RUNNING × Heater_Capacity × Efficiency

Max_Regas_Rate = f(Available_HW_Capacity, Inlet_Temp)

IF (TT-100 < 17°C):
    Export_Constraint = TRUE
    Max_Export = Reduced value based on actual temp
    Alarm: "EXPORT LIMITED BY HW TEMP"

IF (HW.PUMPS-RUNNING = 0):
    Export_Blocked = TRUE
    Max_Export = 0
    Alarm: "EXPORT BLOCKED - NO HW"
```

### 10.2 Capacity Calculation

```
Simplified model:
  Each heater supports approximately:
  - 70 Nm³/h gas export in Mode 1 (350 Nm³/h total / 5 heaters)
  - 140 Nm³/h gas export in Mode 2 (700 Nm³/h total / 5 heaters)

  Available_Export = HW.HEATERS-RUNNING × Export_Per_Heater

  Example:
    3 heaters running in Mode 1:
    Available_Export = 3 × 70 = 210 Nm³/h max
```

---

## 11. Operating Procedures

### 11.1 System Startup

```
[PRE-CHECKS]
1. Verify no active trips
2. Verify inlet water temperature (TT-101 > 3°C)
3. Verify gas supply available
4. Select control mode (AUTO recommended)

[STARTUP]
5. Start Pump 1 (lead pump)
6. Wait for flow confirmation
7. Enable Heater 1 (lead heater)
8. Wait for running confirmation
9. Verify outlet temp rising
10. Repeat for additional trains as needed

[AUTO MODE]
11. Place in AUTO mode
12. Set supply temp SP (19°C default)
13. System stages heaters automatically
```

### 11.2 Normal Shutdown

```
[PREPARATION]
1. Notify FSRU operator
2. Reduce gas export demand

[SHUTDOWN]
3. Place in MANUAL mode
4. Disable heaters one at a time
5. Wait for each to cool (outlet < 25°C)
6. Stop pumps after heater cooldown
7. Document shutdown
```

### 11.3 Emergency Response

```
[ON HEATER TRIP]
1. Note alarming heater
2. If in AUTO: System will start backup heater
3. If in MANUAL: Operator must enable backup
4. Check for cascading effects
5. Investigate trip cause before reset

[ON PUMP TRIP]
1. Associated heater will trip
2. System loses one train capacity
3. If AUTO: Increased duty on remaining
4. Monitor supply temperature
5. Investigate pump trip cause

[ON ALL PUMPS LOST]
1. ESD-1 triggered automatically
2. Gas export shuts down
3. Restore at least one pump before export restart
```

---

## 12. Maintenance Considerations

### 12.1 Heater Gas Counter Reset

The daily gas counters reset automatically at the configured gas day time. Manual reset should NOT be allowed except for maintenance purposes with appropriate authorization.

### 12.2 Lead/Lag Override

For maintenance, individual heaters can be removed from the lead/lag rotation:

```
To remove Heater X from rotation:
1. Place system in MANUAL
2. Disable Heater X
3. Mark as "Out of Service"
4. System will not include in AUTO staging
5. Document maintenance action
```

### 12.3 Pump Maintenance

```
To take Pump X out of service:
1. If heater running, disable heater first
2. Wait for cooldown
3. Stop pump
4. Place in "Local" mode at field
5. Perform maintenance
6. Return to "Remote" mode
7. Test start/stop before enabling heater
```

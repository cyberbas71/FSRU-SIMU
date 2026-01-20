# ESD Cause and Effect Narrative

## 1. Overview

The Emergency Shutdown (ESD) system provides automated protection for personnel, equipment, and the environment. The FSRU simulator implements two ESD levels following offshore oil and gas industry standards.

### 1.1 ESD Levels

| Level | Name | Scope | Severity |
|-------|------|-------|----------|
| ESD-1 | Facility Emergency Shutdown | Complete facility | Highest |
| ESD-2 | Process Unit Shutdown | Process section | Medium |

### 1.2 Design Philosophy

- **Fail-safe**: All ESD final elements fail to safe state on loss of power/signal
- **First-up capture**: System records initial cause of trip
- **Manual reset**: No automatic restart - requires operator intervention
- **Defense in depth**: Multiple independent barriers

---

## 2. ESD Architecture

### 2.1 System Block Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        ESD INITIATORS                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │ Manual PBs  │  │ F&G System  │  │ Process     │  │ Equipment   │ │
│  │ ESD1-PB-001 │  │ FG-001      │  │ Interlocks  │  │ Trips       │ │
│  │ ESD1-PB-002 │  │ FG-002      │  │ PT-001.HHH  │  │ All Pumps   │ │
│  │ ESD2-PB-001 │  │             │  │ PT-001.HH   │  │ Lost        │ │
│  │ ESD2-PB-002 │  │             │  │ TT-001.LL   │  │             │ │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘ │
│         │                │                │                │        │
│         └────────────────┴────────────────┴────────────────┘        │
│                                   │                                  │
│                                   ▼                                  │
│                        ┌─────────────────────┐                       │
│                        │    ESD LOGIC        │                       │
│                        │                     │                       │
│                        │  Level Determination│                       │
│                        │  First-Up Capture   │                       │
│                        │  Output Activation  │                       │
│                        └──────────┬──────────┘                       │
│                                   │                                  │
└───────────────────────────────────┼──────────────────────────────────┘
                                    │
┌───────────────────────────────────┼──────────────────────────────────┐
│                        ESD OUTPUTS│                                  │
├───────────────────────────────────┼──────────────────────────────────┤
│                                   ▼                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │ ESD Valves  │  │ Control     │  │ Heater      │  │ Alarms      │ │
│  │ XV-001      │  │ Valves      │  │ System      │  │ Horn        │ │
│  │ XV-002      │  │ PV-001→0%   │  │ HTR Trip    │  │ Beacon      │ │
│  │             │  │ FV-001→0%   │  │ PMP Trip    │  │             │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘ │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 3. ESD-1 Cause and Effect Matrix

### 3.1 ESD-1 Causes (Initiators)

| ID | Cause | Tag | Setpoint | Voting | Delay |
|----|-------|-----|----------|--------|-------|
| C1 | Manual ESD-1 Pushbutton (CR) | ESD1-PB-001 | Activate | 1oo1 | 0 sec |
| C2 | Manual ESD-1 Pushbutton (Field) | ESD1-PB-002 | Activate | 1oo1 | 0 sec |
| C3 | Fire/Gas Confirmed Zone 1 | FG-001 | Confirmed | 1oo1 | 0 sec |
| C4 | Fire/Gas Confirmed Zone 2 | FG-002 | Confirmed | 1oo1 | 0 sec |
| C5 | Export Pressure HHH | PT-001 | > 70 bar | 1oo1 | 0 sec |
| C6 | All Heating Water Pumps Lost | HW.PUMPS-RUNNING | = 0 | 1oo1 | 5 sec |

### 3.2 ESD-1 Effects (Outputs)

| ID | Effect | Tag | Action | Response Time |
|----|--------|-----|--------|---------------|
| E1 | Close Export ESD Valve | XV-001 | Close | < 3 sec |
| E2 | Close Upstream ESD Valve | XV-002 | Close | < 3 sec |
| E3 | Close Pressure Control Valve | PV-001 | 0% | < 5 sec |
| E4 | Close Flow Control Valve | FV-001 | 0% | < 5 sec |
| E5 | Trip All Heaters | ESD.HTR-TRIP-ALL | Active | Immediate |
| E6 | Trip All Pumps | ESD.PMP-TRIP-ALL | Active | Immediate |
| E7 | Activate ESD Horn | ESD.HORN | On | Immediate |
| E8 | Set ESD Active Flag | ESD.ACTIVE | = 1 | Immediate |
| E9 | Record Cause Code | ESD.CAUSE | First-up | Immediate |

### 3.3 ESD-1 Cause-Effect Matrix

```
                    │ Effects
Causes              │ E1  E2  E3  E4  E5  E6  E7  E8  E9
────────────────────┼─────────────────────────────────────
C1 Manual PB (CR)   │  X   X   X   X   X   X   X   X   1
C2 Manual PB (Field)│  X   X   X   X   X   X   X   X   1
C3 F&G Zone 1       │  X   X   X   X   X   X   X   X   2
C4 F&G Zone 2       │  X   X   X   X   X   X   X   X   2
C5 PT-001 HHH       │  X   X   X   X   X   X   X   X   3
C6 All Pumps Lost   │  X   X   X   X   -   -   X   X   4

X = Effect activated
- = Not applicable (already tripped)
Number = Cause code recorded
```

---

## 4. ESD-2 Cause and Effect Matrix

### 4.1 ESD-2 Causes (Initiators)

| ID | Cause | Tag | Setpoint | Voting | Delay |
|----|-------|-----|----------|--------|-------|
| C10 | Manual ESD-2 Pushbutton (CR) | ESD2-PB-001 | Activate | 1oo1 | 0 sec |
| C11 | Manual ESD-2 Pushbutton (Field) | ESD2-PB-002 | Activate | 1oo1 | 0 sec |
| C12 | Export Pressure HH | PT-001 | > 67 bar | 1oo1 | 3 sec |
| C13 | Export Temperature LL | TT-001 | < -5°C | 1oo1 | 3 sec |
| C14 | Supply Temperature LL | TT-100 | < 10°C | 1oo1 | 3 sec |

### 4.2 ESD-2 Effects (Outputs)

| ID | Effect | Tag | Action | Response Time |
|----|--------|-----|--------|---------------|
| E10 | Close Pressure Control Valve | PV-001 | 0% | < 5 sec |
| E11 | Close Flow Control Valve | FV-001 | 0% | < 5 sec |
| E12 | Activate ESD Horn | ESD.HORN | On | Immediate |
| E13 | Set ESD Active Flag | ESD.ACTIVE | = 1 | Immediate |
| E14 | Record Cause Code | ESD.CAUSE | First-up | Immediate |

**Note:** ESD-2 does NOT trip heaters/pumps or close ESD valves.

### 4.3 ESD-2 Cause-Effect Matrix

```
                    │ Effects
Causes              │ E10 E11 E12 E13 E14
────────────────────┼─────────────────────
C10 Manual PB (CR)  │  X   X   X   X   10
C11 Manual PB (Fld) │  X   X   X   X   10
C12 PT-001 HH       │  X   X   X   X   11
C13 TT-001 LL       │  X   X   X   X   12
C14 TT-100 LL       │  X   X   X   X   13

X = Effect activated
Number = Cause code recorded
```

---

## 5. First-Up Logic

### 5.1 Purpose

First-up logic captures the initial cause of a trip to aid in incident investigation. Multiple causes may occur in rapid succession, but only the first is recorded as the initiating event.

### 5.2 Implementation

```
OnAnyESDCauseActive():
    IF ESD.ACTIVE = 0:  // No active ESD
        ESD.CAUSE = GetFirstActiveCauseCode()
        ESD.ACTIVE = 1
        LogEvent("ESD ACTIVATED", ESD.CAUSE, timestamp)

    // Subsequent causes are logged but not recorded as first-up
    IF AnotherCauseActive AND ESD.CAUSE != this_cause:
        LogEvent("ADDITIONAL ESD CAUSE", this_cause, timestamp)
```

### 5.3 First-Up Display

The HMI displays:
- First-up cause code and description
- Timestamp of initial activation
- Current state of all causes
- Time since activation

---

## 6. Reset Philosophy

### 6.1 Reset Prerequisites

Before ESD reset can be initiated:

| # | Prerequisite | Verification |
|---|--------------|--------------|
| 1 | All initiating causes cleared | Each cause checked |
| 2 | ESD acknowledged by operator | ACK button pressed |
| 3 | Minimum hold time elapsed | 30 seconds |
| 4 | No sustained alarms in trip | Alarm scan clear |
| 5 | Manual reset authorized | Operator action |

### 6.2 Reset Sequence

```
[RESET INITIATION]
1. Operator presses ESD RESET button
2. System checks all prerequisites
3. IF any prerequisite fails:
   - Display blocking condition
   - Reset rejected
   - RETURN

[RESET TIMER]
4. Start 30-second reset timer
5. Display countdown on HMI
6. Horn silences after 5 seconds

[RESET COMPLETION]
7. IF all conditions remain clear during timer:
   - ESD.ACTIVE = 0
   - ESD.CAUSE = 0
   - ESD.RESET-TMR = 0
   - LogEvent("ESD RESET COMPLETE", timestamp)

8. IF any condition returns during timer:
   - Abort reset
   - Re-arm ESD
   - LogEvent("ESD RESET ABORTED", cause, timestamp)
```

### 6.3 Post-Reset State

After successful reset:

| Element | State | Operator Action Required |
|---------|-------|--------------------------|
| XV-001 | Closed | Manual open command |
| XV-002 | Closed | Manual open command |
| PV-001 | 0%, Manual | Place in Auto after XV open |
| FV-001 | 0%, Manual | Place in Auto after XV open |
| Heaters | Tripped (ESD-1) | Manual restart per train |
| Pumps | Tripped (ESD-1) | Manual restart per train |

---

## 7. Interlock Logic Details

### 7.1 ESD Valve Interlock

```
XV-001 (Export ESD Valve):

CLOSE INTERLOCK:
  IF ESD.LEVEL >= 1:
    XV-001 → CLOSE
    Override any open command

OPEN PERMISSIVE:
  XV-001 can open IF:
    AND ESD.ACTIVE = 0
    AND PT-002 > 58 bar (upstream pressure OK)
    AND XV-002.ZSO = 1 (upstream valve open)
    AND No HH/LL alarms active

OPEN SEQUENCE:
  1. Operator issues OPEN command
  2. System checks permissives (5 sec scan)
  3. IF OK: Issue open to valve
  4. Monitor for XV-001.ZSO = 1 within 15 sec
  5. IF timeout: Alarm "XV-001 FAIL TO OPEN"
```

### 7.2 Control Valve ESD Override

```
PV-001/FV-001 ESD Override:

ON ESD.LEVEL >= 1 OR ESD.LEVEL = 2:
  - Override output to 0%
  - Force MANUAL mode
  - Block Auto transfer
  - Display "ESD OVERRIDE" on faceplate

ON ESD.ACTIVE = 0:
  - Release override
  - Remain in MANUAL at 0%
  - Operator must manually open
  - Auto transfer permitted
```

### 7.3 Heater/Pump ESD Interlock (ESD-1 Only)

```
ON ESD.LEVEL = 1:
  FOR each heater:
    HTR-1x0.CMD = 0  (Disable)
    HTR-1x0.TRIP = 1 (Set trip)

  FOR each pump:
    PMP-1x0.CMD = 0  (Stop)
    PMP-1x0.TRIP = 1 (Set trip)

ON ESD.LEVEL = 2:
  Heaters and pumps: NO ACTION (hold current state)
```

---

## 8. Cause Code Reference

### 8.1 ESD-1 Cause Codes

| Code | Description | Tag | Setpoint |
|------|-------------|-----|----------|
| 0 | No ESD Active | - | - |
| 1 | Manual ESD-1 Pushbutton | ESD1-PB-001/002 | Activated |
| 2 | Fire/Gas Confirmed | FG-001/002 | Confirmed |
| 3 | Export Pressure HHH | PT-001 | > 70 bar |
| 4 | All Heating Pumps Lost | HW.PUMPS-RUNNING | = 0 |

### 8.2 ESD-2 Cause Codes

| Code | Description | Tag | Setpoint |
|------|-------------|-----|----------|
| 10 | Manual ESD-2 Pushbutton | ESD2-PB-001/002 | Activated |
| 11 | Export Pressure HH | PT-001 | > 67 bar |
| 12 | Export Temperature LL | TT-001 | < -5°C |
| 13 | Supply Temperature LL | TT-100 | < 10°C |

---

## 9. ESD Status Display

### 9.1 HMI Elements

```
┌─────────────────────────────────────────────────────────────────────┐
│                        ESD STATUS DISPLAY                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ESD LEVEL:  ████ ESD-1 ACTIVE ████     Time: 00:05:32              │
│                                                                      │
│  FIRST-UP CAUSE:  [3] Export Pressure HHH (PT-001 > 70 bar)         │
│  Time of Trip:    2026-01-20 10:15:23                               │
│                                                                      │
├─────────────────────────────────────────────────────────────────────┤
│  CURRENT CAUSE STATUS:                                               │
│  ┌─────────────────────────────┬────────┬──────────┐                │
│  │ Cause                       │ Status │ Value    │                │
│  ├─────────────────────────────┼────────┼──────────┤                │
│  │ ESD-1 PB (Control Room)     │ CLEAR  │ Normal   │                │
│  │ ESD-1 PB (Field)            │ CLEAR  │ Normal   │                │
│  │ Fire/Gas Zone 1             │ CLEAR  │ Normal   │                │
│  │ Fire/Gas Zone 2             │ CLEAR  │ Normal   │                │
│  │ PT-001 HHH (70 bar)         │ ACTIVE │ 71.2 bar │ ◄── First-up   │
│  │ All Pumps Lost              │ CLEAR  │ 3 Running│                │
│  └─────────────────────────────┴────────┴──────────┘                │
│                                                                      │
├─────────────────────────────────────────────────────────────────────┤
│  RESET STATUS:                                                       │
│  Prerequisites:  [✓] Causes Cleared  [✓] Acknowledged               │
│                  [✓] Hold Time       [✓] No Alarms                  │
│                                                                      │
│  [ ACK ESD ]         [ RESET ESD ]         [ SILENCE HORN ]         │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 9.2 Color Coding

| State | Color | Flashing |
|-------|-------|----------|
| ESD Active | Red | Yes |
| Cause Active | Red | No |
| Cause Clear | Green | No |
| Reset in Progress | Yellow | Yes |
| Reset Complete | Green | No |

---

## 10. Testing and Bypass

### 10.1 ESD Testing

ESD functions should be tested periodically:

| Test | Frequency | Method |
|------|-----------|--------|
| Pushbutton test | Monthly | Press to verify logic (bypass outputs) |
| Valve stroke | Quarterly | Close valves to verify operation |
| Full function | Annually | Complete ESD-1 and ESD-2 test |

### 10.2 Bypass Philosophy

For maintenance or testing, individual causes can be bypassed:

```
BYPASS RULES:
1. Maximum 1 cause per ESD level can be bypassed
2. Bypass requires supervisor authorization
3. Maximum bypass duration: 8 hours
4. All bypasses logged with reason and operator ID
5. Visual indication on HMI (yellow banner)
6. Alarm generated when bypass active

BYPASS PROCEDURE:
1. Enter authorization code
2. Select cause to bypass
3. Enter reason (mandatory)
4. Confirm bypass
5. System logs bypass start
6. Timer starts (8 hour max)
7. Automatic reset at expiry
```

### 10.3 Bypass Display

```
┌─────────────────────────────────────────────┐
│  ⚠ ACTIVE BYPASS                            │
│                                             │
│  Bypassed: PT-001 HHH Trip                  │
│  By:       Operator_001                     │
│  Reason:   Transmitter calibration          │
│  Time:     06:45 remaining                  │
│                                             │
│  [ REMOVE BYPASS ]                          │
└─────────────────────────────────────────────┘
```

---

## 11. Event Logging

### 11.1 Logged Events

| Event | Data Captured |
|-------|---------------|
| ESD Activation | Level, cause code, timestamp, all tag values |
| Cause Change | Cause ID, state (active/clear), timestamp |
| Reset Attempt | Operator, result (success/fail), blocking condition |
| Reset Complete | Timestamp, duration of ESD |
| Bypass Enable | Cause, operator, reason, timestamp |
| Bypass Disable | Cause, operator, method (manual/auto), timestamp |

### 11.2 Log Format

```
2026-01-20 10:15:23.456 | ESD | ACTIVATED | Level=1 | Cause=3 | PT-001=71.2bar
2026-01-20 10:15:23.460 | ESD | XV-001 | CLOSE COMMAND | ESD Override
2026-01-20 10:15:23.465 | ESD | XV-002 | CLOSE COMMAND | ESD Override
2026-01-20 10:15:23.470 | ESD | PV-001 | SET 0% | ESD Override
2026-01-20 10:15:26.123 | ESD | XV-001.ZSC | = 1 | Valve Closed
2026-01-20 10:20:55.789 | ESD | CAUSE CLEAR | Cause=3 | PT-001=66.8bar
2026-01-20 10:21:00.000 | ESD | ACKNOWLEDGED | By=Operator_001
2026-01-20 10:21:30.000 | ESD | RESET | INITIATED | By=Operator_001
2026-01-20 10:22:00.000 | ESD | RESET | COMPLETE | Duration=396.5sec
```

---

## 12. Integration with Process Control

### 12.1 Controller Behavior During ESD

| Controller | ESD-1 | ESD-2 |
|------------|-------|-------|
| PIC-001 | Forced MANUAL, output locked at 0% | Forced MANUAL, output locked at 0% |
| FIC-001 | Forced MANUAL, output locked at 0% | Forced MANUAL, output locked at 0% |
| TIC-100 | Output = 0 (no heaters) | Normal operation |

### 12.2 Recovery Sequence

After ESD-1 reset:
```
1. Restart heating water system first
   - Start at least 1 pump
   - Enable at least 1 heater
   - Wait for TT-100 > 17°C

2. Prepare gas export
   - Verify PT-002 > 62 bar
   - Verify no alarms

3. Open ESD valves
   - Open XV-002 first (upstream)
   - Wait for XV-002.ZSO = 1
   - Open XV-001 (export)
   - Wait for XV-001.ZSO = 1

4. Restart export control
   - Place PIC-001 in AUTO
   - Set FIC-001 SP to minimum (50 Nm³/h)
   - Place FIC-001 in AUTO
   - Gradually increase flow
```

After ESD-2 reset:
```
1. Verify cause cleared
2. Verify heating water OK (TT-100 > 17°C)
3. Open control valves gradually
   - Place PIC-001 in MANUAL
   - Slowly open to match pressure
   - Place in AUTO
4. Resume flow control
```

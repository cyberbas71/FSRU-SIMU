# FSRU Simulator Acceptance Tests

## Overview

This document defines acceptance tests for the FSRU Brunsbüttel simulator. Each test includes step-by-step procedures, expected results, and pass/fail criteria.

---

## Test Categories

1. **Control Logic Tests** - Verify controller behavior
2. **Safety Tests** - ESD and interlock verification
3. **HMI Tests** - User interface functionality
4. **Integration Tests** - End-to-end scenarios

---

## 1. Control Logic Tests

### Test 1.1: Pressure Controller Response

**Objective:** Verify PIC-001 maintains export pressure at setpoint.

**Preconditions:**
- Simulation running
- XV-001, XV-002 open
- FIC-001 in AUTO at 200 Nm³/h
- PIC-001 in MANUAL at 50%

**Test Steps:**

| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Record PT-001 initial value | Value noted | |
| 2 | Set PIC-001.SP = 60 bar | SP accepted | |
| 3 | Place PIC-001 in AUTO | Mode = AUTO | |
| 4 | Wait 60 seconds | Controller adjusting | |
| 5 | Verify PT-001 = 60 ± 0.5 bar | Pressure at setpoint | |
| 6 | Change PIC-001.SP to 62 bar | SP changes | |
| 7 | Wait 60 seconds | Controller adjusting | |
| 8 | Verify PT-001 = 62 ± 0.5 bar | New setpoint achieved | |
| 9 | Change PIC-001.SP to 58 bar | SP changes | |
| 10 | Wait 60 seconds | Controller adjusting | |
| 11 | Verify PT-001 = 58 ± 0.5 bar | Lower setpoint achieved | |

**Pass Criteria:**
- Steady-state error < 0.5 bar
- Settling time < 60 seconds
- No overshoot > 5% of step change

---

### Test 1.2: Flow Controller Response

**Objective:** Verify FIC-001 controls export flow with rate limiting.

**Preconditions:**
- Simulation running
- Export valves open
- PIC-001 in AUTO at 60 bar
- FIC-001 in MANUAL

**Test Steps:**

| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Set FIC-001.SP = 100 Nm³/h | SP accepted | |
| 2 | Place FIC-001 in AUTO | Mode = AUTO | |
| 3 | Wait for FT-001 = 100 ± 5 | Flow at setpoint | |
| 4 | Change SP to 300 Nm³/h | SP changes | |
| 5 | Observe ramp rate | ~10%/min max | |
| 6 | Verify flow ramps smoothly | No sudden jumps | |
| 7 | Wait for FT-001 = 300 ± 6 | Flow at new SP | |
| 8 | Set SP to 50 Nm³/h | SP changes | |
| 9 | Verify ramp down | Controlled reduction | |
| 10 | Wait for FT-001 = 50 ± 2 | Flow at minimum | |

**Pass Criteria:**
- Ramp rate enforced
- Steady-state error < 2%
- Smooth transitions

---

### Test 1.3: Mixed Pressure/Flow Control

**Objective:** Verify pressure priority over flow when constrained.

**Preconditions:**
- PIC-001 and FIC-001 in AUTO
- Normal operation at 200 Nm³/h

**Test Steps:**

| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Set FIC-001.SP = 400 Nm³/h | Flow demand high | |
| 2 | Monitor PT-001 | Pressure may drop | |
| 3 | If PT-001 < 58 bar | Constraint activates | |
| 4 | Verify flow limited | FT-001 reduced | |
| 5 | Observe "FLOW CONSTRAINED" | Indication visible | |
| 6 | Reduce FIC-001.SP to 200 | Demand reduced | |
| 7 | Verify pressure recovers | PT-001 → 60 bar | |
| 8 | Flow constraint clears | Normal operation | |

**Pass Criteria:**
- Pressure maintained > 55 bar
- Flow automatically constrained
- Recovery when demand reduced

---

### Test 1.4: Heater Staging Logic

**Objective:** Verify automatic heater staging in AUTO mode.

**Preconditions:**
- HW.MODE = AUTO
- TIC-100.SP = 19°C
- 2 heaters running, 3 available

**Test Steps:**

| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Record TT-100 initial | Value near 19°C | |
| 2 | Increase TIC-100.SP to 22°C | SP increases | |
| 3 | Wait 60 seconds | System responds | |
| 4 | Verify additional heater starts | HW.HEATERS-RUNNING increases | |
| 5 | Wait for TT-100 → 22°C | Temperature rises | |
| 6 | Decrease TIC-100.SP to 16°C | SP decreases | |
| 7 | Wait 60 seconds | System responds | |
| 8 | Verify heater stops | HW.HEATERS-RUNNING decreases | |
| 9 | Wait for TT-100 → 16°C | Temperature drops | |

**Pass Criteria:**
- Staging responds within 60 seconds
- Correct number of heaters for duty
- Temperature tracks setpoint

---

### Test 1.5: Daily Gas Limit Enforcement

**Objective:** Verify per-heater 24 Nm³/day gas consumption limit.

**Preconditions:**
- Heater 1 running
- Simulation speed increased (10x)

**Test Steps:**

| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Record FT-111.TOT initial | Value < 24 | |
| 2 | Wait for FT-111.TOT > 22 | Approaching limit | |
| 3 | Verify alarm | "HTR-1 GAS LIMIT H" | |
| 4 | Continue until FT-111.TOT ≥ 24 | Limit reached | |
| 5 | Verify alarm | "HTR-1 GAS LIMIT HH" | |
| 6 | Verify HTR-110.AVAIL = 0 | Heater unavailable | |
| 7 | Verify HTR-110.RUN = 0 | Heater stopped | |
| 8 | Advance to gas day reset time | Cross 06:00 | |
| 9 | Verify FT-111.TOT reset to 0 | Counter cleared | |
| 10 | Verify HTR-110.AVAIL = 1 | Heater available again | |

**Pass Criteria:**
- H alarm at 22 Nm³
- HH alarm and derate at 24 Nm³
- Automatic reset at gas day

---

## 2. Safety Tests

### Test 2.1: ESD-1 Activation

**Objective:** Verify ESD-1 causes complete facility shutdown.

**Preconditions:**
- System running normally
- No active alarms

**Test Steps:**

| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Activate ESD1-PB-001 | Pushbutton pressed | |
| 2 | Verify ESD.LEVEL = 1 | ESD-1 active | |
| 3 | Verify ESD.ACTIVE = 1 | Active flag set | |
| 4 | Verify XV-001 closes | ZSC = 1 within 3 sec | |
| 5 | Verify XV-002 closes | ZSC = 1 within 3 sec | |
| 6 | Verify PV-001 = 0% | CV closed | |
| 7 | Verify FV-001 = 0% | CV closed | |
| 8 | Verify all heaters tripped | HTR-xxx.TRIP = 1 | |
| 9 | Verify all pumps tripped | PMP-xxx.TRIP = 1 | |
| 10 | Verify ESD.HORN = 1 | Horn sounding | |

**Pass Criteria:**
- Full shutdown within 5 seconds
- All final elements in safe state
- First-up cause captured

---

### Test 2.2: ESD-2 Activation

**Objective:** Verify ESD-2 causes process unit shutdown only.

**Preconditions:**
- System running normally
- No active alarms

**Test Steps:**

| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Activate ESD2-PB-001 | Pushbutton pressed | |
| 2 | Verify ESD.LEVEL = 2 | ESD-2 active | |
| 3 | Verify XV-001 unchanged | Valve position same | |
| 4 | Verify XV-002 unchanged | Valve position same | |
| 5 | Verify PV-001 = 0% | CV closed | |
| 6 | Verify FV-001 = 0% | CV closed | |
| 7 | Verify heaters NOT tripped | HTR-xxx.TRIP unchanged | |
| 8 | Verify pumps NOT tripped | PMP-xxx.TRIP unchanged | |

**Pass Criteria:**
- Control valves closed
- ESD valves not affected
- HW system not affected

---

### Test 2.3: ESD Reset Philosophy

**Objective:** Verify ESD reset requires all prerequisites.

**Preconditions:**
- ESD-1 active
- Cause still present

**Test Steps:**

| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Attempt ESD reset | RESET BLOCKED | |
| 2 | Verify message | "Cause not cleared" | |
| 3 | Clear ESD cause | ESD1-PB-001 = 0 | |
| 4 | Attempt reset | May still be blocked | |
| 5 | Acknowledge ESD | ESD acknowledged | |
| 6 | Attempt reset | Reset initiates | |
| 7 | Wait 30 seconds | Timer completes | |
| 8 | Verify ESD.ACTIVE = 0 | Reset complete | |
| 9 | Verify equipment trips cleared | TRIP flags = 0 | |

**Pass Criteria:**
- Reset blocked if prerequisites not met
- 30-second reset timer enforced
- Clean state after reset

---

### Test 2.4: Pressure HHH Trip

**Objective:** Verify automatic ESD-1 on pressure HHH.

**Preconditions:**
- System running normally
- PT-001 at 60 bar

**Test Steps:**

| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Force PT-001 to 71 bar | Value injected | |
| 2 | Verify immediate ESD-1 | ESD.LEVEL = 1 | |
| 3 | Verify ESD.CAUSE = 3 | Pressure HHH code | |
| 4 | Verify all ESD-1 effects | Full shutdown | |
| 5 | Release PT-001 override | Value returns normal | |
| 6 | Verify cause clears | PT-001 < 70 | |
| 7 | Complete reset procedure | Normal state | |

**Pass Criteria:**
- No delay on HHH trip
- Correct cause code captured
- Recovery possible when cleared

---

### Test 2.5: Pump Interlock

**Objective:** Verify heater requires pump running.

**Preconditions:**
- Train 1 stopped
- PMP-110.RUN = 0

**Test Steps:**

| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Attempt to enable HTR-110 | Command issued | |
| 2 | Verify heater does NOT start | HTR-110.RUN = 0 | |
| 3 | Verify interlock message | "PUMP NOT RUNNING" | |
| 4 | Start PMP-110 | PMP-110.RUN = 1 | |
| 5 | Enable HTR-110 | HTR-110.CMD = 1 | |
| 6 | Verify heater starts | HTR-110.RUN = 1 | |
| 7 | Stop PMP-110 | PMP-110.CMD = 0 | |
| 8 | Verify heater trips | HTR-110 stops | |

**Pass Criteria:**
- Heater blocked without pump
- Heater trips if pump stops
- Interlock clearly indicated

---

## 3. HMI Tests

### Test 3.1: Screen Navigation

**Objective:** Verify all screens are accessible.

**Test Steps:**

| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Click Overview | Overview displays | |
| 2 | Click Gas Export | Gas Export displays | |
| 3 | Click Heating Water | HW screen displays | |
| 4 | Click ESD | ESD screen displays | |
| 5 | Click Alarms | Alarm list displays | |
| 6 | Click Trends | Trend screen displays | |
| 7 | Return to Overview | Overview displays | |

**Pass Criteria:**
- All screens accessible
- Navigation < 500ms
- No errors or crashes

---

### Test 3.2: Value Display Update

**Objective:** Verify real-time value updates.

**Test Steps:**

| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Observe PT-001 on Overview | Value displayed | |
| 2 | Via API, set PT-001 = 65 | Value injected | |
| 3 | Verify display updates | Shows 65 within 2 sec | |
| 4 | Verify color change | Yellow/orange for H | |
| 5 | Restore PT-001 to 60 | Value normal | |
| 6 | Verify display updates | Shows 60, green | |

**Pass Criteria:**
- Updates within 2 seconds
- Correct color coding
- Proper units displayed

---

### Test 3.3: Controller Faceplate

**Objective:** Verify controller faceplate operation.

**Test Steps:**

| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Click PIC-001 controller | Faceplate opens | |
| 2 | Verify PV, SP, OUT displayed | Values correct | |
| 3 | Enter new SP (62 bar) | Value accepted | |
| 4 | Click SET | SP changes | |
| 5 | Verify controller responds | Output adjusts | |
| 6 | Click MANUAL mode | Mode changes | |
| 7 | Enter output (30%) | Value accepted | |
| 8 | Click SET | Output changes | |
| 9 | Click AUTO mode | Mode returns | |
| 10 | Close faceplate | Faceplate closes | |

**Pass Criteria:**
- Faceplate displays correctly
- Commands execute properly
- Mode switching works

---

### Test 3.4: Alarm Acknowledgment

**Objective:** Verify alarm acknowledgment functionality.

**Preconditions:**
- Active alarm present

**Test Steps:**

| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Go to Alarm Summary | Alarms displayed | |
| 2 | Verify unacked alarm shown | State = UNACKED | |
| 3 | Click ACK on alarm | Alarm acknowledged | |
| 4 | Verify state changes | State = ACKED | |
| 5 | Trigger another alarm | New alarm appears | |
| 6 | Click ACK ALL | All alarms acked | |
| 7 | Clear alarm condition | Alarm returns | |
| 8 | Verify alarm clears | Removed from active | |

**Pass Criteria:**
- Individual ACK works
- ACK ALL works
- Returned alarms clear properly

---

### Test 3.5: Trend Display

**Objective:** Verify trend charting functionality.

**Test Steps:**

| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Open Trends page | Chart displays | |
| 2 | Select "Gas Export" preset | PT-001, FT-001, TT-001 shown | |
| 3 | Wait 30 seconds | Data accumulates | |
| 4 | Verify lines plotting | Values visible | |
| 5 | Change time range to 1 min | View adjusts | |
| 6 | Click PAUSE | Trend freezes | |
| 7 | Click LIVE | Trend resumes | |
| 8 | Click CLEAR | Data cleared | |
| 9 | Add custom tag | Tag appears on chart | |

**Pass Criteria:**
- Real-time plotting works
- Presets load correctly
- Pause/resume functional
- Time range selectable

---

## 4. Integration Tests

### Test 4.1: Full Startup Sequence

**Objective:** Verify complete system startup works end-to-end.

**Preconditions:**
- Fresh simulation (reset)
- All equipment stopped

**Test Steps:**
Execute Scenario 1.1 (System Startup) from training scenarios.

**Pass Criteria:**
- All steps complete successfully
- Final state: 200 Nm³/h export, 60 bar pressure
- No unexpected alarms

---

### Test 4.2: Full Shutdown Sequence

**Objective:** Verify complete system shutdown works end-to-end.

**Preconditions:**
- System running at 200 Nm³/h

**Test Steps:**
Execute Scenario 1.3 (Normal Shutdown) from training scenarios.

**Pass Criteria:**
- Controlled reduction of flow
- All equipment stopped cleanly
- No trips or alarms (other than expected)

---

### Test 4.3: ESD Recovery Sequence

**Objective:** Verify recovery from ESD-1 to normal operation.

**Preconditions:**
- ESD-1 active
- All equipment tripped

**Test Steps:**
Execute Scenario 4.3 (ESD Recovery) from training scenarios.

**Pass Criteria:**
- Full recovery achieved
- Normal operation restored
- Time < 30 minutes

---

### Test 4.4: Load Change Response

**Objective:** Verify system handles significant load changes.

**Preconditions:**
- System running at 150 Nm³/h
- 2 heater trains

**Test Steps:**

| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Increase flow to 300 Nm³/h | SP accepted | |
| 2 | Wait for flow stabilization | FT-001 = 300 | |
| 3 | Verify pressure maintained | PT-001 = 60 ± 1 bar | |
| 4 | Verify HW staging | Additional heater started | |
| 5 | Verify supply temp | TT-100 maintained | |
| 6 | Reduce flow to 100 Nm³/h | SP reduced | |
| 7 | Wait for stabilization | FT-001 = 100 | |
| 8 | Verify heater de-staging | Heater stopped | |
| 9 | Verify all values stable | No oscillation | |

**Pass Criteria:**
- Smooth transitions
- No pressure deviations > 2 bar
- Heater staging appropriate

---

### Test 4.5: Persistence and Recovery

**Objective:** Verify data persistence across restarts.

**Test Steps:**

| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Record current alarm count | Count noted | |
| 2 | Record current event count | Count noted | |
| 3 | Stop backend server | Server stopped | |
| 4 | Restart backend server | Server starts | |
| 5 | Verify alarms persisted | Same count | |
| 6 | Verify events persisted | Same count | |
| 7 | Verify config persisted | Same settings | |

**Pass Criteria:**
- Data survives restart
- No data loss
- Configuration retained

---

## Test Summary Sheet

| Test ID | Test Name | Category | Status | Tester | Date |
|---------|-----------|----------|--------|--------|------|
| 1.1 | Pressure Controller Response | Control | | | |
| 1.2 | Flow Controller Response | Control | | | |
| 1.3 | Mixed Pressure/Flow Control | Control | | | |
| 1.4 | Heater Staging Logic | Control | | | |
| 1.5 | Daily Gas Limit | Control | | | |
| 2.1 | ESD-1 Activation | Safety | | | |
| 2.2 | ESD-2 Activation | Safety | | | |
| 2.3 | ESD Reset Philosophy | Safety | | | |
| 2.4 | Pressure HHH Trip | Safety | | | |
| 2.5 | Pump Interlock | Safety | | | |
| 3.1 | Screen Navigation | HMI | | | |
| 3.2 | Value Display Update | HMI | | | |
| 3.3 | Controller Faceplate | HMI | | | |
| 3.4 | Alarm Acknowledgment | HMI | | | |
| 3.5 | Trend Display | HMI | | | |
| 4.1 | Full Startup Sequence | Integration | | | |
| 4.2 | Full Shutdown Sequence | Integration | | | |
| 4.3 | ESD Recovery Sequence | Integration | | | |
| 4.4 | Load Change Response | Integration | | | |
| 4.5 | Persistence and Recovery | Integration | | | |

---

## Acceptance Criteria

### Minimum Requirements

- All Safety Tests (2.x) must PASS
- All Integration Tests (4.x) must PASS
- 80% of Control Logic Tests must PASS
- 80% of HMI Tests must PASS

### Performance Requirements

- Screen response < 500ms
- Value updates < 2 seconds
- ESD response < 5 seconds
- API response < 100ms

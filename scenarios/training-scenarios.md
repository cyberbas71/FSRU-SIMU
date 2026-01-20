# FSRU Simulator Training Scenarios

## Overview

This document describes training scenarios for the FSRU Brunsbüttel simulator. Each scenario includes objectives, initial conditions, procedural steps, and expected outcomes.

---

## Scenario Categories

1. **Normal Operations** - Startup, steady-state, shutdown
2. **Fault Scenarios** - Equipment failures
3. **Communication Failures** - Various fallback modes
4. **ESD Scenarios** - Activation and recovery
5. **Capacity Scenarios** - Mode switching, demand limits

---

## 1. Normal Operations

### Scenario 1.1: System Startup

**Objective:** Start the FSRU gas export system from cold state.

**Initial Conditions:**
- All equipment stopped
- ESD reset
- Heating water system idle
- XV-001, XV-002 closed
- All alarms clear

**Procedure:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Start Pump 1 (PMP-110) | PMP-110.RUN = 1, FT-110 > 400 m³/h |
| 2 | Wait 60 seconds for flow stabilization | Flow steady |
| 3 | Enable Heater 1 (HTR-110) | HTR-110.RUN = 1, TT-110 rising |
| 4 | Wait for TT-100 > 17°C | Supply temperature adequate |
| 5 | Repeat steps 1-4 for Train 2 | Second train running |
| 6 | Set TIC-100.SP = 19°C, Mode = AUTO | HW system in auto control |
| 7 | Open XV-002 (upstream valve) | XV-002.ZSO = 1 |
| 8 | Open XV-001 (export valve) | XV-001.ZSO = 1 |
| 9 | Set PIC-001.SP = 60 bar, Mode = AUTO | Pressure control active |
| 10 | Set FIC-001.SP = 200 Nm³/h, Mode = AUTO | Flow control active |
| 11 | Verify steady state | PT-001 = 60 ± 0.5 bar, FT-001 = 200 ± 5 Nm³/h |

**Duration:** 15-20 minutes

**Pass Criteria:**
- Gas export flow at setpoint
- Export pressure at 60 bar
- Supply temperature at 19°C
- No alarms

---

### Scenario 1.2: Steady State Operation

**Objective:** Maintain normal operation and respond to demand changes.

**Initial Conditions:**
- System running per Scenario 1.1
- Flow at 200 Nm³/h
- 2 heater trains running

**Procedure:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Increase flow setpoint to 300 Nm³/h | FT-001 ramps to 300 |
| 2 | Observe pressure control | PT-001 maintained at 60 bar |
| 3 | Observe heating water staging | Additional heater may start |
| 4 | Decrease flow setpoint to 150 Nm³/h | FT-001 ramps down |
| 5 | Observe heater de-staging | Heater may stop |
| 6 | Increase pressure SP to 62 bar | PT-001 rises to 62 bar |
| 7 | Return pressure SP to 60 bar | PT-001 returns to 60 bar |

**Duration:** 10-15 minutes

**Pass Criteria:**
- Flow tracks setpoint within ±2%
- Pressure tracks setpoint within ±0.5 bar
- Heater staging responds correctly
- No unexpected alarms

---

### Scenario 1.3: Normal Shutdown

**Objective:** Perform controlled shutdown of gas export system.

**Initial Conditions:**
- System running at 200 Nm³/h
- 2-3 heater trains running

**Procedure:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Reduce flow setpoint to 100 Nm³/h | Flow decreases gradually |
| 2 | Wait for flow < 100 Nm³/h | Stable at reduced flow |
| 3 | Reduce flow setpoint to 50 Nm³/h | Approaching minimum |
| 4 | Place FIC-001 in MANUAL | Manual control active |
| 5 | Ramp FV-001 to 0% | Flow decreases to zero |
| 6 | Place PIC-001 in MANUAL | Manual control active |
| 7 | Ramp PV-001 to 0% | Valves closing |
| 8 | Close XV-001 | Export isolated |
| 9 | Close XV-002 | Upstream isolated |
| 10 | Stop heaters one at a time | Heaters cooling |
| 11 | Wait 60 sec, then stop pumps | Pumps stopped |

**Duration:** 15-20 minutes

**Pass Criteria:**
- Controlled flow reduction
- No pressure spikes
- Heaters cooled before pump stop
- Clean shutdown

---

## 2. Fault Scenarios

### Scenario 2.1: Heater Trip

**Objective:** Respond to sudden heater trip during normal operation.

**Initial Conditions:**
- System running at 250 Nm³/h
- 3 heater trains running (HW.MODE = AUTO)

**Fault Injection:**
- At T+5 min: Inject HTR-120 trip (Heater 2)

**Expected System Response:**
1. HTR-120.TRIP = 1, HTR-120.RUN = 0
2. Alarm: "HTR-120 TRIP"
3. If AUTO mode: System starts backup heater
4. TT-100 may dip temporarily
5. Supply temperature recovers

**Operator Actions:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Acknowledge alarm | Alarm acknowledged |
| 2 | Verify backup heater started | HW.HEATERS-RUNNING maintained |
| 3 | Monitor supply temperature | TT-100 returns to setpoint |
| 4 | Investigate trip cause | (Simulated - no real cause) |
| 5 | When ready, reset heater trip | HTR-120.TRIP = 0 |
| 6 | Re-enable heater if needed | System rebalances |

**Duration:** 10-15 minutes

**Pass Criteria:**
- Automatic backup heater start (if AUTO)
- Supply temperature maintained > 15°C
- Export flow maintained
- Trip properly acknowledged

---

### Scenario 2.2: Pump Fail-to-Start

**Objective:** Handle pump that fails to start when commanded.

**Initial Conditions:**
- System running at 200 Nm³/h
- 2 heater trains running
- Train 3 available but stopped

**Fault Injection:**
- Configure PMP-130 to fail-to-start

**Procedure:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Command PMP-130 START | Start command issued |
| 2 | Wait 10 seconds | No running feedback |
| 3 | Observe alarm | "PMP-130 FAIL TO START" |
| 4 | Acknowledge alarm | Alarm acknowledged |
| 5 | Attempt restart (once) | May fail again |
| 6 | Mark pump as unavailable | Remove from selection |
| 7 | Start alternate pump (PMP-140) | Successful start |
| 8 | Enable Heater 4 | Additional capacity online |

**Duration:** 10 minutes

**Pass Criteria:**
- Fail-to-start detected within 10 seconds
- Appropriate alarm generated
- Operator able to use alternate equipment
- System capacity maintained

---

### Scenario 2.3: Sensor Stuck

**Objective:** Identify and respond to stuck sensor condition.

**Initial Conditions:**
- System running at 200 Nm³/h
- All sensors functioning normally

**Fault Injection:**
- At T+3 min: PT-001 stuck at 65 bar

**Operator Response:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Observe PT-001 stuck at 65 bar | Value not changing |
| 2 | Compare with PT-002, PT-003 | Discrepancy noted |
| 3 | Alarm: PT-001 H (65 bar) | High alarm |
| 4 | Place PIC-001 in MANUAL | Prevent controller action |
| 5 | Control manually based on PT-003 | Stable operation |
| 6 | Report sensor failure | (Document action) |
| 7 | When sensor repaired, return to AUTO | Normal operation resumes |

**Duration:** 10-15 minutes

**Pass Criteria:**
- Operator identifies sensor anomaly
- Manual takeover prevents process upset
- System remains stable
- Proper documentation of issue

---

### Scenario 2.4: Multiple Heater Failure

**Objective:** Manage loss of multiple heaters with limited capacity.

**Initial Conditions:**
- System running at 300 Nm³/h
- 4 heater trains running

**Fault Injection:**
- T+2 min: HTR-110 trip
- T+4 min: HTR-130 trip
- T+6 min: HTR-150 gas limit reached (24 Nm³)

**Expected Response:**
1. Supply temperature drops
2. TT-100.L alarm
3. Export capacity limited
4. Flow constraint active

**Operator Actions:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Acknowledge alarms | Alarms acknowledged |
| 2 | Reduce export demand | FIC-001.SP reduced |
| 3 | Maximize remaining capacity | Heaters 2,4 at full |
| 4 | Monitor supply temperature | Stabilizes at lower value |
| 5 | Accept reduced export | Flow matches available HW |

**Duration:** 15-20 minutes

**Pass Criteria:**
- System degrades gracefully
- Export reduced proportionally
- No ESD activation
- Safe stable state achieved

---

## 3. Communication Failures

### Scenario 3.1: Comms Loss - Fail-Safe Trip Mode

**Objective:** Experience communications failure with default fail-safe response.

**Initial Conditions:**
- System running at 200 Nm³/h
- CFG.COMM-FAIL-MODE = 0 (Fail-Safe)
- 3 heater trains running

**Fault Injection:**
- At T+5 min: COMM.FAIL = 1

**Expected System Response:**
1. "HW REMOTE COMM FAILURE" alarm
2. All remote heaters trip immediately
3. All remote pumps stop
4. TT-100 drops (no heating)
5. Export constrained or ESD-1 triggered

**Operator Actions:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Note comm failure alarm | Acknowledge |
| 2 | Observe heater/pump trips | All remote equipment stopped |
| 3 | If ESD-1 triggered, follow recovery | See ESD scenarios |
| 4 | When comms restored: | COMM.FAIL = 0 |
| 5 | Restart heating water system | Per startup procedure |
| 6 | Resume export | Normal operation |

**Duration:** 15-20 minutes

**Pass Criteria:**
- Immediate fail-safe response
- Equipment reaches safe state
- Recovery possible when comms restored

---

### Scenario 3.2: Comms Loss - Hold-Last Mode

**Objective:** Experience communications failure with hold-last-output response.

**Initial Conditions:**
- CFG.COMM-FAIL-MODE = 1 (Hold-Last)
- CFG.COMM-HOLD-TIME = 5 (minutes)
- System running normally

**Fault Injection:**
- At T+2 min: COMM.FAIL = 1
- At T+6 min: Comms restored (or let timer expire)

**Expected System Response:**
1. "HW REMOTE COMM FAILURE" alarm
2. Heaters/pumps maintain last state
3. Hold timer counting down
4. If timer expires: Fail-safe trip

**Operator Actions:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Note alarm and hold timer | COMM.HOLDTIME visible |
| 2 | Monitor hold time remaining | Timer counting down |
| 3 | Prepare for potential trip | Be ready |
| 4 | If comms restored before timeout | Normal operation resumes |
| 5 | If timeout occurs | Fail-safe trip executes |

**Duration:** 10-15 minutes

**Pass Criteria:**
- Hold behavior maintained for configured time
- Timeout triggers trip as expected
- Quick recovery if comms restored early

---

### Scenario 3.3: Comms Loss - Local Autonomy Mode

**Objective:** Experience communications failure with local autonomy response.

**Initial Conditions:**
- CFG.COMM-FAIL-MODE = 2 (Local Autonomy)
- System running normally
- Remote RTU configured for local control

**Fault Injection:**
- At T+3 min: COMM.FAIL = 1

**Expected System Response:**
1. "HW REMOTE COMM FAILURE" alarm
2. Tag quality shows COMM_FAIL
3. Remote station maintains local control
4. FSRU cannot command changes
5. Local temp control (if available)

**Operator Actions:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Note alarm and quality status | Tags marked COMM_FAIL |
| 2 | Monitor values (unreliable) | Values may be stale |
| 3 | Cannot command remote equipment | Commands blocked |
| 4 | Coordinate with field personnel | (Simulated) |
| 5 | When comms restored | Resynchronize states |
| 6 | Verify remote status matches | Confirm alignment |

**Duration:** 10-15 minutes

**Pass Criteria:**
- System recognizes local autonomy state
- Operator understands limited control
- Recovery and resync successful

---

## 4. ESD Scenarios

### Scenario 4.1: ESD-1 Activation

**Objective:** Experience and recover from ESD-1 (facility shutdown).

**Initial Conditions:**
- System running at 250 Nm³/h
- 3 heater trains running
- All systems healthy

**Fault Injection:**
- At T+3 min: PT-001 > 70 bar (pressure spike)
- OR: Press ESD-1 pushbutton

**Expected System Response:**
1. ESD-1 activates immediately
2. XV-001, XV-002 close (< 3 sec)
3. PV-001, FV-001 to 0%
4. All heaters trip
5. All pumps trip
6. ESD horn sounds
7. First-up cause captured

**Recovery Procedure:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Note ESD cause code | Identify initiator |
| 2 | Acknowledge ESD | Horn can be silenced |
| 3 | Silence horn | ESD.HORN = 0 |
| 4 | Verify cause cleared | PT-001 < 70 bar |
| 5 | Clear any remaining causes | All causes clear |
| 6 | Press RESET ESD | Reset timer starts |
| 7 | Wait 30 seconds | Reset completes |
| 8 | Restart per startup procedure | Full startup sequence |

**Duration:** 20-30 minutes

**Pass Criteria:**
- ESD activates within 3 seconds
- All equipment reaches safe state
- Clear cause identification
- Successful reset and recovery

---

### Scenario 4.2: ESD-2 Activation

**Objective:** Experience and recover from ESD-2 (process unit shutdown).

**Initial Conditions:**
- System running at 200 Nm³/h
- All systems healthy

**Fault Injection:**
- At T+3 min: TT-001 < -5°C (low export temp)
- OR: Press ESD-2 pushbutton

**Expected System Response:**
1. ESD-2 activates
2. PV-001, FV-001 to 0% (< 5 sec)
3. XV-001, XV-002 remain as-is
4. Heaters and pumps NOT tripped
5. ESD horn sounds
6. First-up cause captured

**Recovery Procedure:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Note ESD-2 and cause | Identify initiator |
| 2 | Acknowledge ESD | Horn silenced |
| 3 | Verify cause cleared | TT-001 > -5°C |
| 4 | Press RESET ESD | Reset completes |
| 5 | Place controllers in MANUAL | Prepare for restart |
| 6 | Gradually open control valves | Resume flow |
| 7 | Return to AUTO control | Normal operation |

**Duration:** 15-20 minutes

**Pass Criteria:**
- ESD-2 response appropriate (no heater/pump trip)
- Quick recovery possible
- Export resumes within minutes

---

### Scenario 4.3: ESD Recovery Sequence

**Objective:** Practice complete ESD recovery from facility shutdown.

**Initial Conditions:**
- ESD-1 active (from previous scenario or triggered)
- All equipment tripped
- System cold

**Recovery Procedure:**

| Step | Time | Action | Verification |
|------|------|--------|--------------|
| 1 | T+0 | Identify and clear ESD cause | All causes clear |
| 2 | T+2 | Acknowledge ESD | ESD acknowledged |
| 3 | T+3 | Reset ESD | ESD.ACTIVE = 0 |
| 4 | T+5 | Start first pump | PMP-110.RUN = 1 |
| 5 | T+6 | Enable first heater | HTR-110.RUN = 1 |
| 6 | T+10 | Start second pump/heater | Two trains running |
| 7 | T+15 | Wait for TT-100 > 17°C | HW adequate |
| 8 | T+16 | Open XV-002 | Upstream open |
| 9 | T+17 | Open XV-001 | Export open |
| 10 | T+18 | Place controllers in AUTO | Control active |
| 11 | T+20 | Ramp to initial flow SP | Export resuming |
| 12 | T+25 | Verify steady state | Normal operation |

**Duration:** 25-30 minutes

**Pass Criteria:**
- Systematic recovery
- Temperature adequate before export
- No re-trip during recovery
- Full operation restored

---

## 5. Capacity Scenarios

### Scenario 5.1: Demand Beyond 350 Nm³/h (Mode 1)

**Objective:** Understand capacity limits in Mode 1 operation.

**Initial Conditions:**
- CFG.CAPACITY-MODE = 1 (350 Nm³/h)
- System running at 300 Nm³/h

**Procedure:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Set FIC-001.SP = 340 Nm³/h | Flow increases |
| 2 | Set FIC-001.SP = 350 Nm³/h | FT-001.H alarm |
| 3 | Attempt FIC-001.SP = 380 Nm³/h | SP clamped to 350 |
| 4 | Observe flow limit | Max flow = 350 Nm³/h |
| 5 | Return SP to 300 Nm³/h | Normal operation |

**Duration:** 10 minutes

**Pass Criteria:**
- Setpoint enforced at mode limit
- H/HH alarms at appropriate levels
- System remains stable at limit

---

### Scenario 5.2: Mode Switch 350 → 700 Nm³/h

**Objective:** Switch from current terminal mode to new terminal mode.

**Initial Conditions:**
- CFG.CAPACITY-MODE = 1 (350 Nm³/h)
- Running at 300 Nm³/h

**Procedure:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Verify adequate HW capacity | 4+ heaters available |
| 2 | Change CFG.CAPACITY-MODE = 2 | Mode changed to 700 |
| 3 | Alarm limits update | HH now at 700 |
| 4 | Increase FIC-001.SP to 400 Nm³/h | SP accepts higher value |
| 5 | Start additional heaters | Support higher demand |
| 6 | Ramp to 500 Nm³/h | Flow increases |
| 7 | Monitor HW temperature | TT-100 maintained |

**Duration:** 15-20 minutes

**Pass Criteria:**
- Mode switch successful
- Higher setpoints accepted
- HW system supports increased demand
- No process upsets during transition

---

### Scenario 5.3: Demand Beyond 700 Nm³/h (Mode 2)

**Objective:** Understand maximum capacity limits.

**Initial Conditions:**
- CFG.CAPACITY-MODE = 2 (700 Nm³/h)
- All 5 heater trains running
- Flow at 600 Nm³/h

**Procedure:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Increase flow SP to 680 Nm³/h | Flow increases |
| 2 | Observe HW temperature | TT-100 may drop |
| 3 | Increase to 700 Nm³/h | FT-001.HH alarm |
| 4 | Attempt 750 Nm³/h | SP clamped to 700 |
| 5 | Note pressure effects | PT-001 may deviate |
| 6 | Reduce to sustainable level | Return to stability |

**Duration:** 15 minutes

**Pass Criteria:**
- Physical limits demonstrated
- Alarm response appropriate
- Operator understands constraints

---

## Instructor Notes

### Scenario Injection Methods

1. **Manual Tag Override:**
   - Use API: PUT /api/tags/values/{tagId}
   - Example: Set PT-001 to 71 bar for ESD test

2. **Fault Injection API:**
   - POST /api/faults/inject
   - Types: SENSOR_STUCK, SENSOR_BIAS, PUMP_TRIP, HEATER_TRIP, COMM_FAIL

3. **ESD Test Buttons:**
   - Use HMI instructor panel
   - ESD1-PB-001, ESD2-PB-001 tags

### Assessment Criteria

| Criteria | Weight | Description |
|----------|--------|-------------|
| Response Time | 25% | Quick identification and action |
| Procedure Accuracy | 25% | Following correct steps |
| Process Understanding | 25% | Explanation of system behavior |
| Safety Awareness | 25% | Prioritizing safe operation |

### Debrief Topics

1. What happened and why?
2. What actions were taken?
3. Were actions effective?
4. What could be done differently?
5. What are the key learnings?

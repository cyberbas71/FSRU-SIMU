# FSRU Simulator - Tag Database

## Overview
This document contains all tags used in the FSRU simulator. Tags are organized by system and include I/O type, range, alarm limits, and source indication.

**Legend:**
- AI = Analog Input
- AO = Analog Output
- DI = Digital Input
- DO = Digital Output
- SOFT = Software/Calculated tag
- Source: PDF = Extracted from reference document (page/row)
- Source: ASSUMED = Engineering assumption

---

## 1. Gas Export System Tags

### 1.1 Pressure Measurements

| Tag | Description | Unit | Range | LL | L | H | HH | I/O Type | Source |
|-----|-------------|------|-------|----|----|----|----|----------|--------|
| PT-001 | Export Header Pressure | bar | 0-100 | 52 | 55 | 67 | 70 | AI | ASSUMED |
| PT-002 | Upstream Supply Pressure | bar | 0-100 | 58 | 60 | - | - | AI | ASSUMED |
| PT-003 | Downstream Network Pressure | bar | 0-100 | 50 | 55 | 65 | 68 | AI | ASSUMED |
| PDT-001 | Control Valve DP | bar | 0-20 | 0.5 | 1 | 15 | 18 | AI | ASSUMED |

### 1.2 Temperature Measurements

| Tag | Description | Unit | Range | LL | L | H | HH | I/O Type | Source |
|-----|-------------|------|-------|----|----|----|----|----------|--------|
| TT-001 | Export Gas Temperature | °C | -50-50 | -5 | 0 | 40 | 45 | AI | ASSUMED |
| TT-002 | Upstream Gas Temperature | °C | -50-50 | - | - | - | - | AI | ASSUMED |
| TT-003 | Vaporizer Outlet Temperature | °C | -50-50 | -5 | 0 | 35 | 40 | AI | ASSUMED |

### 1.3 Flow Measurements

| Tag | Description | Unit | Range | LL | L | H | HH | I/O Type | Source |
|-----|-------------|------|-------|----|----|----|----|----------|--------|
| FT-001 | Export Gas Flow | Nm³/h | 0-1000 | 20 | 50 | * | * | AI | ASSUMED |
| FT-002 | Totalizer Export Volume | Nm³ | 0-999999 | - | - | - | - | AI | ASSUMED |

*Note: FT-001 H/HH limits depend on capacity mode (350 or 700 Nm³/h)*

**Capacity Mode 1 (350 Nm³/h):** H=330, HH=350
**Capacity Mode 2 (700 Nm³/h):** H=660, HH=700

### 1.4 Control Valves

| Tag | Description | Unit | Range | I/O Type | Source |
|-----|-------------|------|-------|----------|--------|
| PV-001 | Export Pressure Control Valve | % | 0-100 | AO | ASSUMED |
| PV-001.POS | PV-001 Position Feedback | % | 0-100 | AI | ASSUMED |
| PV-001.MODE | PV-001 Mode (0=Auto, 1=Manual) | - | 0-1 | SOFT | ASSUMED |
| PV-001.SP | PV-001 Setpoint | % | 0-100 | SOFT | ASSUMED |
| FV-001 | Export Flow Control Valve | % | 0-100 | AO | ASSUMED |
| FV-001.POS | FV-001 Position Feedback | % | 0-100 | AI | ASSUMED |
| FV-001.MODE | FV-001 Mode (0=Auto, 1=Manual) | - | 0-1 | SOFT | ASSUMED |
| FV-001.SP | FV-001 Setpoint | % | 0-100 | SOFT | ASSUMED |

### 1.5 ESD Valves

| Tag | Description | Unit | Range | I/O Type | Source |
|-----|-------------|------|-------|----------|--------|
| XV-001 | Export ESD Isolation Valve | - | 0/1 | DO | ASSUMED |
| XV-001.ZSO | XV-001 Open Limit Switch | - | 0/1 | DI | ASSUMED |
| XV-001.ZSC | XV-001 Closed Limit Switch | - | 0/1 | DI | ASSUMED |
| XV-002 | Upstream ESD Isolation Valve | - | 0/1 | DO | ASSUMED |
| XV-002.ZSO | XV-002 Open Limit Switch | - | 0/1 | DI | ASSUMED |
| XV-002.ZSC | XV-002 Closed Limit Switch | - | 0/1 | DI | ASSUMED |

### 1.6 Control Parameters

| Tag | Description | Unit | Range | I/O Type | Source |
|-----|-------------|------|-------|----------|--------|
| PIC-001.PV | Pressure Controller PV | bar | 0-100 | SOFT | ASSUMED |
| PIC-001.SP | Pressure Controller SP | bar | 55-65 | SOFT | ASSUMED |
| PIC-001.OUT | Pressure Controller Output | % | 0-100 | SOFT | ASSUMED |
| PIC-001.MODE | Pressure Controller Mode | - | 0-2 | SOFT | ASSUMED |
| PIC-001.KP | Pressure Controller Gain | - | 0-10 | SOFT | ASSUMED |
| PIC-001.KI | Pressure Controller Reset | /min | 0-10 | SOFT | ASSUMED |
| PIC-001.KD | Pressure Controller Rate | min | 0-10 | SOFT | ASSUMED |
| FIC-001.PV | Flow Controller PV | Nm³/h | 0-1000 | SOFT | ASSUMED |
| FIC-001.SP | Flow Controller SP | Nm³/h | 0-700 | SOFT | ASSUMED |
| FIC-001.OUT | Flow Controller Output | % | 0-100 | SOFT | ASSUMED |
| FIC-001.MODE | Flow Controller Mode | - | 0-2 | SOFT | ASSUMED |
| FIC-001.RAMP | Flow Controller Ramp Rate | %/min | 0-100 | SOFT | ASSUMED |

### 1.7 System Status

| Tag | Description | Unit | Range | I/O Type | Source |
|-----|-------------|------|-------|----------|--------|
| GAS-EXPORT.READY | Export System Ready | - | 0/1 | SOFT | ASSUMED |
| GAS-EXPORT.ACTIVE | Export System Active | - | 0/1 | SOFT | ASSUMED |
| GAS-EXPORT.TRIP | Export System Tripped | - | 0/1 | SOFT | ASSUMED |
| GAS-EXPORT.MODE | Capacity Mode (1=350, 2=700) | - | 1/2 | SOFT | ASSUMED |

---

## 2. Heating Water System Tags

### 2.1 Common Header Tags

| Tag | Description | Unit | Range | LL | L | H | HH | I/O Type | Source |
|-----|-------------|------|-------|----|----|----|----|----------|--------|
| TT-100 | Supply Header Temperature | °C | 0-50 | 10 | 15 | 25 | 30 | AI | ASSUMED |
| TT-101 | Inlet Water Temperature | °C | 0-30 | 2 | 3 | 15 | 20 | AI | ASSUMED |
| PT-100 | Supply Header Pressure | bar | 0-20 | 2 | 3 | 15 | 17 | AI | ASSUMED |
| FT-100 | Total Supply Flow | m³/h | 0-3000 | 100 | 200 | 2800 | 3000 | AI | ASSUMED |
| TIC-100.PV | Temp Controller PV | °C | 0-50 | - | - | - | - | SOFT | ASSUMED |
| TIC-100.SP | Temp Controller SP | °C | 15-25 | - | - | - | - | SOFT | ASSUMED |
| TIC-100.OUT | Temp Controller Output | % | 0-100 | - | - | - | - | SOFT | ASSUMED |
| TIC-100.MODE | Temp Controller Mode | - | 0-2 | - | - | - | - | SOFT | ASSUMED |

### 2.2 Heater Train 1 Tags

| Tag | Description | Unit | Range | LL | L | H | HH | I/O Type | Source |
|-----|-------------|------|-------|----|----|----|----|----------|--------|
| TT-110 | Heater 1 Outlet Temperature | °C | 0-50 | 10 | 15 | 28 | 35 | AI | ASSUMED |
| TT-111 | Heater 1 Inlet Temperature | °C | 0-30 | - | - | - | - | AI | ASSUMED |
| FT-110 | Heater 1 Water Flow | m³/h | 0-600 | 50 | 100 | 550 | 580 | AI | ASSUMED |
| PT-110 | Heater 1 Outlet Pressure | bar | 0-20 | 2 | 3 | 15 | 17 | AI | ASSUMED |
| FT-111 | Heater 1 Gas Consumption | Nm³/h | 0-5 | - | - | 0.9 | 1.0 | AI | ASSUMED |
| FT-111.TOT | Heater 1 Daily Gas Total | Nm³ | 0-30 | - | - | 22 | 24 | SOFT | ASSUMED |
| HTR-110.CMD | Heater 1 Enable Command | - | 0/1 | - | - | - | - | DO | ASSUMED |
| HTR-110.RUN | Heater 1 Running Status | - | 0/1 | - | - | - | - | DI | ASSUMED |
| HTR-110.TRIP | Heater 1 Trip Status | - | 0/1 | - | - | - | - | DI | ASSUMED |
| HTR-110.AVAIL | Heater 1 Available | - | 0/1 | - | - | - | - | SOFT | ASSUMED |
| PMP-110.CMD | Pump 1 Start Command | - | 0/1 | - | - | - | - | DO | ASSUMED |
| PMP-110.RUN | Pump 1 Running Status | - | 0/1 | - | - | - | - | DI | ASSUMED |
| PMP-110.TRIP | Pump 1 Trip Status | - | 0/1 | - | - | - | - | DI | ASSUMED |
| PMP-110.AMPS | Pump 1 Motor Current | A | 0-2000 | 100 | 200 | 1800 | 1900 | AI | ASSUMED |
| PMP-110.KW | Pump 1 Power | kW | 0-1200 | - | - | 1050 | 1100 | AI | ASSUMED |
| PMP-110.LOCAL | Pump 1 Local Mode | - | 0/1 | - | - | - | - | DI | ASSUMED |

### 2.3 Heater Train 2 Tags

| Tag | Description | Unit | Range | LL | L | H | HH | I/O Type | Source |
|-----|-------------|------|-------|----|----|----|----|----------|--------|
| TT-120 | Heater 2 Outlet Temperature | °C | 0-50 | 10 | 15 | 28 | 35 | AI | ASSUMED |
| TT-121 | Heater 2 Inlet Temperature | °C | 0-30 | - | - | - | - | AI | ASSUMED |
| FT-120 | Heater 2 Water Flow | m³/h | 0-600 | 50 | 100 | 550 | 580 | AI | ASSUMED |
| PT-120 | Heater 2 Outlet Pressure | bar | 0-20 | 2 | 3 | 15 | 17 | AI | ASSUMED |
| FT-121 | Heater 2 Gas Consumption | Nm³/h | 0-5 | - | - | 0.9 | 1.0 | AI | ASSUMED |
| FT-121.TOT | Heater 2 Daily Gas Total | Nm³ | 0-30 | - | - | 22 | 24 | SOFT | ASSUMED |
| HTR-120.CMD | Heater 2 Enable Command | - | 0/1 | - | - | - | - | DO | ASSUMED |
| HTR-120.RUN | Heater 2 Running Status | - | 0/1 | - | - | - | - | DI | ASSUMED |
| HTR-120.TRIP | Heater 2 Trip Status | - | 0/1 | - | - | - | - | DI | ASSUMED |
| HTR-120.AVAIL | Heater 2 Available | - | 0/1 | - | - | - | - | SOFT | ASSUMED |
| PMP-120.CMD | Pump 2 Start Command | - | 0/1 | - | - | - | - | DO | ASSUMED |
| PMP-120.RUN | Pump 2 Running Status | - | 0/1 | - | - | - | - | DI | ASSUMED |
| PMP-120.TRIP | Pump 2 Trip Status | - | 0/1 | - | - | - | - | DI | ASSUMED |
| PMP-120.AMPS | Pump 2 Motor Current | A | 0-2000 | 100 | 200 | 1800 | 1900 | AI | ASSUMED |
| PMP-120.KW | Pump 2 Power | kW | 0-1200 | - | - | 1050 | 1100 | AI | ASSUMED |
| PMP-120.LOCAL | Pump 2 Local Mode | - | 0/1 | - | - | - | - | DI | ASSUMED |

### 2.4 Heater Train 3 Tags

| Tag | Description | Unit | Range | LL | L | H | HH | I/O Type | Source |
|-----|-------------|------|-------|----|----|----|----|----------|--------|
| TT-130 | Heater 3 Outlet Temperature | °C | 0-50 | 10 | 15 | 28 | 35 | AI | ASSUMED |
| TT-131 | Heater 3 Inlet Temperature | °C | 0-30 | - | - | - | - | AI | ASSUMED |
| FT-130 | Heater 3 Water Flow | m³/h | 0-600 | 50 | 100 | 550 | 580 | AI | ASSUMED |
| PT-130 | Heater 3 Outlet Pressure | bar | 0-20 | 2 | 3 | 15 | 17 | AI | ASSUMED |
| FT-131 | Heater 3 Gas Consumption | Nm³/h | 0-5 | - | - | 0.9 | 1.0 | AI | ASSUMED |
| FT-131.TOT | Heater 3 Daily Gas Total | Nm³ | 0-30 | - | - | 22 | 24 | SOFT | ASSUMED |
| HTR-130.CMD | Heater 3 Enable Command | - | 0/1 | - | - | - | - | DO | ASSUMED |
| HTR-130.RUN | Heater 3 Running Status | - | 0/1 | - | - | - | - | DI | ASSUMED |
| HTR-130.TRIP | Heater 3 Trip Status | - | 0/1 | - | - | - | - | DI | ASSUMED |
| HTR-130.AVAIL | Heater 3 Available | - | 0/1 | - | - | - | - | SOFT | ASSUMED |
| PMP-130.CMD | Pump 3 Start Command | - | 0/1 | - | - | - | - | DO | ASSUMED |
| PMP-130.RUN | Pump 3 Running Status | - | 0/1 | - | - | - | - | DI | ASSUMED |
| PMP-130.TRIP | Pump 3 Trip Status | - | 0/1 | - | - | - | - | DI | ASSUMED |
| PMP-130.AMPS | Pump 3 Motor Current | A | 0-2000 | 100 | 200 | 1800 | 1900 | AI | ASSUMED |
| PMP-130.KW | Pump 3 Power | kW | 0-1200 | - | - | 1050 | 1100 | AI | ASSUMED |
| PMP-130.LOCAL | Pump 3 Local Mode | - | 0/1 | - | - | - | - | DI | ASSUMED |

### 2.5 Heater Train 4 Tags

| Tag | Description | Unit | Range | LL | L | H | HH | I/O Type | Source |
|-----|-------------|------|-------|----|----|----|----|----------|--------|
| TT-140 | Heater 4 Outlet Temperature | °C | 0-50 | 10 | 15 | 28 | 35 | AI | ASSUMED |
| TT-141 | Heater 4 Inlet Temperature | °C | 0-30 | - | - | - | - | AI | ASSUMED |
| FT-140 | Heater 4 Water Flow | m³/h | 0-600 | 50 | 100 | 550 | 580 | AI | ASSUMED |
| PT-140 | Heater 4 Outlet Pressure | bar | 0-20 | 2 | 3 | 15 | 17 | AI | ASSUMED |
| FT-141 | Heater 4 Gas Consumption | Nm³/h | 0-5 | - | - | 0.9 | 1.0 | AI | ASSUMED |
| FT-141.TOT | Heater 4 Daily Gas Total | Nm³ | 0-30 | - | - | 22 | 24 | SOFT | ASSUMED |
| HTR-140.CMD | Heater 4 Enable Command | - | 0/1 | - | - | - | - | DO | ASSUMED |
| HTR-140.RUN | Heater 4 Running Status | - | 0/1 | - | - | - | - | DI | ASSUMED |
| HTR-140.TRIP | Heater 4 Trip Status | - | 0/1 | - | - | - | - | DI | ASSUMED |
| HTR-140.AVAIL | Heater 4 Available | - | 0/1 | - | - | - | - | SOFT | ASSUMED |
| PMP-140.CMD | Pump 4 Start Command | - | 0/1 | - | - | - | - | DO | ASSUMED |
| PMP-140.RUN | Pump 4 Running Status | - | 0/1 | - | - | - | - | DI | ASSUMED |
| PMP-140.TRIP | Pump 4 Trip Status | - | 0/1 | - | - | - | - | DI | ASSUMED |
| PMP-140.AMPS | Pump 4 Motor Current | A | 0-2000 | 100 | 200 | 1800 | 1900 | AI | ASSUMED |
| PMP-140.KW | Pump 4 Power | kW | 0-1200 | - | - | 1050 | 1100 | AI | ASSUMED |
| PMP-140.LOCAL | Pump 4 Local Mode | - | 0/1 | - | - | - | - | DI | ASSUMED |

### 2.6 Heater Train 5 Tags

| Tag | Description | Unit | Range | LL | L | H | HH | I/O Type | Source |
|-----|-------------|------|-------|----|----|----|----|----------|--------|
| TT-150 | Heater 5 Outlet Temperature | °C | 0-50 | 10 | 15 | 28 | 35 | AI | ASSUMED |
| TT-151 | Heater 5 Inlet Temperature | °C | 0-30 | - | - | - | - | AI | ASSUMED |
| FT-150 | Heater 5 Water Flow | m³/h | 0-600 | 50 | 100 | 550 | 580 | AI | ASSUMED |
| PT-150 | Heater 5 Outlet Pressure | bar | 0-20 | 2 | 3 | 15 | 17 | AI | ASSUMED |
| FT-151 | Heater 5 Gas Consumption | Nm³/h | 0-5 | - | - | 0.9 | 1.0 | AI | ASSUMED |
| FT-151.TOT | Heater 5 Daily Gas Total | Nm³ | 0-30 | - | - | 22 | 24 | SOFT | ASSUMED |
| HTR-150.CMD | Heater 5 Enable Command | - | 0/1 | - | - | - | - | DO | ASSUMED |
| HTR-150.RUN | Heater 5 Running Status | - | 0/1 | - | - | - | - | DI | ASSUMED |
| HTR-150.TRIP | Heater 5 Trip Status | - | 0/1 | - | - | - | - | DI | ASSUMED |
| HTR-150.AVAIL | Heater 5 Available | - | 0/1 | - | - | - | - | SOFT | ASSUMED |
| PMP-150.CMD | Pump 5 Start Command | - | 0/1 | - | - | - | - | DO | ASSUMED |
| PMP-150.RUN | Pump 5 Running Status | - | 0/1 | - | - | - | - | DI | ASSUMED |
| PMP-150.TRIP | Pump 5 Trip Status | - | 0/1 | - | - | - | - | DI | ASSUMED |
| PMP-150.AMPS | Pump 5 Motor Current | A | 0-2000 | 100 | 200 | 1800 | 1900 | AI | ASSUMED |
| PMP-150.KW | Pump 5 Power | kW | 0-1200 | - | - | 1050 | 1100 | AI | ASSUMED |
| PMP-150.LOCAL | Pump 5 Local Mode | - | 0/1 | - | - | - | - | DI | ASSUMED |

### 2.7 Heating Water System Status

| Tag | Description | Unit | Range | I/O Type | Source |
|-----|-------------|------|-------|----------|--------|
| HW.HEATERS-RUNNING | Count of Running Heaters | - | 0-5 | SOFT | ASSUMED |
| HW.HEATERS-AVAIL | Count of Available Heaters | - | 0-5 | SOFT | ASSUMED |
| HW.PUMPS-RUNNING | Count of Running Pumps | - | 0-5 | SOFT | ASSUMED |
| HW.TOTAL-POWER | Total Pump Power | kW | 0-6000 | SOFT | ASSUMED |
| HW.TOTAL-GAS | Total Daily Gas Usage | Nm³ | 0-150 | SOFT | ASSUMED |
| HW.MODE | Control Mode (0=Manual, 1=Auto) | - | 0/1 | SOFT | ASSUMED |
| HW.READY | Heating Water System Ready | - | 0/1 | SOFT | ASSUMED |
| HW.TRIP | Heating Water System Trip | - | 0/1 | SOFT | ASSUMED |

---

## 3. ESD System Tags

### 3.1 ESD Status

| Tag | Description | Unit | Range | I/O Type | Source |
|-----|-------------|------|-------|----------|--------|
| ESD.LEVEL | Active ESD Level (0=None, 1=ESD-1, 2=ESD-2) | - | 0-2 | SOFT | ASSUMED |
| ESD.ACTIVE | ESD Active | - | 0/1 | SOFT | ASSUMED |
| ESD.CAUSE | First-Up Cause Code | - | 0-99 | SOFT | ASSUMED |
| ESD.RESET-PERM | Reset Permissive | - | 0/1 | SOFT | ASSUMED |
| ESD.RESET-CMD | Reset Command | - | 0/1 | DO | ASSUMED |
| ESD.RESET-TMR | Reset Timer | sec | 0-30 | SOFT | ASSUMED |

### 3.2 ESD Initiators

| Tag | Description | Unit | Range | I/O Type | Source |
|-----|-------------|------|-------|----------|--------|
| ESD1-PB-001 | ESD-1 Pushbutton (Control Room) | - | 0/1 | DI | ASSUMED |
| ESD1-PB-002 | ESD-1 Pushbutton (Field) | - | 0/1 | DI | ASSUMED |
| ESD2-PB-001 | ESD-2 Pushbutton (Control Room) | - | 0/1 | DI | ASSUMED |
| ESD2-PB-002 | ESD-2 Pushbutton (Field) | - | 0/1 | DI | ASSUMED |
| FG-001 | Fire/Gas Detection Zone 1 | - | 0/1 | DI | ASSUMED |
| FG-002 | Fire/Gas Detection Zone 2 | - | 0/1 | DI | ASSUMED |
| PT-001.HHH | Export Pressure HHH (70 bar) | - | 0/1 | SOFT | ASSUMED |
| PT-001.HH | Export Pressure HH (67 bar) | - | 0/1 | SOFT | ASSUMED |
| TT-001.LL | Export Temperature LL (-5°C) | - | 0/1 | SOFT | ASSUMED |
| TT-100.LL | Supply Temp LL (10°C) | - | 0/1 | SOFT | ASSUMED |
| HW.ALL-PUMPS-TRIP | All Pumps Tripped | - | 0/1 | SOFT | ASSUMED |

### 3.3 ESD Outputs

| Tag | Description | Unit | Range | I/O Type | Source |
|-----|-------------|------|-------|----------|--------|
| ESD.XV-001-CLOSE | Close Export ESD Valve | - | 0/1 | DO | ASSUMED |
| ESD.XV-002-CLOSE | Close Upstream ESD Valve | - | 0/1 | DO | ASSUMED |
| ESD.PV-001-CLOSE | Close Pressure CV to 0% | - | 0/1 | DO | ASSUMED |
| ESD.FV-001-CLOSE | Close Flow CV to 0% | - | 0/1 | DO | ASSUMED |
| ESD.HTR-TRIP-ALL | Trip All Heaters | - | 0/1 | DO | ASSUMED |
| ESD.PMP-TRIP-ALL | Trip All Pumps | - | 0/1 | DO | ASSUMED |
| ESD.HORN | ESD Audible Alarm | - | 0/1 | DO | ASSUMED |

### 3.4 ESD Cause Codes

| Code | Description | ESD Level |
|------|-------------|-----------|
| 0 | No ESD | - |
| 1 | Manual ESD-1 Pushbutton | ESD-1 |
| 2 | Fire/Gas Confirmed | ESD-1 |
| 3 | Export Pressure HHH | ESD-1 |
| 4 | All Heating Pumps Lost | ESD-1 |
| 10 | Manual ESD-2 Pushbutton | ESD-2 |
| 11 | Export Pressure HH | ESD-2 |
| 12 | Export Temperature LL | ESD-2 |
| 13 | Supply Temperature LL | ESD-2 |

---

## 4. Communications Tags

### 4.1 Network Status

| Tag | Description | Unit | Range | I/O Type | Source |
|-----|-------------|------|-------|----------|--------|
| COMM.REMOTE-STATUS | Remote RTU Comm Status | - | 0-3 | SOFT | ASSUMED |
| COMM.HEARTBEAT | Heartbeat Counter | - | 0-65535 | SOFT | ASSUMED |
| COMM.LAST-RX | Time Since Last Receive | sec | 0-9999 | SOFT | ASSUMED |
| COMM.FAIL | Communication Failure | - | 0/1 | SOFT | ASSUMED |
| COMM.FAIL-MODE | Active Failure Mode | - | 0-2 | SOFT | ASSUMED |
| COMM.HOLDTIME | Hold-Last Remaining Time | sec | 0-600 | SOFT | ASSUMED |

### 4.2 Communication Quality

| Tag | Description | Unit | Range | I/O Type | Source |
|-----|-------------|------|-------|----------|--------|
| COMM.Q-PT001 | PT-001 Quality | - | 0-3 | SOFT | ASSUMED |
| COMM.Q-TT001 | TT-001 Quality | - | 0-3 | SOFT | ASSUMED |
| COMM.Q-FT001 | FT-001 Quality | - | 0-3 | SOFT | ASSUMED |
| COMM.Q-REMOTE | Remote Station Quality | - | 0-3 | SOFT | ASSUMED |

Quality Codes:
- 0 = Good
- 1 = Uncertain
- 2 = Bad
- 3 = Comm Fail

---

## 5. Utility Tags

### 5.1 System Configuration

| Tag | Description | Unit | Range | I/O Type | Source |
|-----|-------------|------|-------|----------|--------|
| CFG.CAPACITY-MODE | Capacity Mode (1=350, 2=700) | - | 1/2 | SOFT | ASSUMED |
| CFG.COMM-FAIL-MODE | Comm Fail Mode (0=Trip, 1=Hold, 2=Local) | - | 0-2 | SOFT | ASSUMED |
| CFG.COMM-HOLD-TIME | Comm Hold Time | min | 1-30 | SOFT | ASSUMED |
| CFG.GAS-DAY-RESET | Gas Day Reset Hour | hr | 0-23 | SOFT | ASSUMED |
| CFG.TRANSPORT-DELAY | Transport Delay Time | min | 1-30 | SOFT | ASSUMED |
| CFG.HEAT-LOSS-COEF | Heat Loss Coefficient | °C/km | 0-2 | SOFT | ASSUMED |
| CFG.PIPELINE-LENGTH | Pipeline Length | km | 1-20 | SOFT | ASSUMED |

### 5.2 Simulation Control

| Tag | Description | Unit | Range | I/O Type | Source |
|-----|-------------|------|-------|----------|--------|
| SIM.TIME | Simulation Time | sec | 0-∞ | SOFT | ASSUMED |
| SIM.SPEED | Simulation Speed Multiplier | x | 0.1-10 | SOFT | ASSUMED |
| SIM.FREEZE | Simulation Freeze | - | 0/1 | SOFT | ASSUMED |
| SIM.SCENARIO | Active Scenario ID | - | 0-99 | SOFT | ASSUMED |
| SIM.AMBIENT-TEMP | Ambient Temperature | °C | -20-40 | SOFT | ASSUMED |
| SIM.INLET-WATER-TEMP | Inlet Water Override | °C | 0-20 | SOFT | ASSUMED |

### 5.3 Operator Information

| Tag | Description | Unit | Range | I/O Type | Source |
|-----|-------------|------|-------|----------|--------|
| OP.ACTIVE-ALARMS | Count of Active Alarms | - | 0-999 | SOFT | ASSUMED |
| OP.UNACKED-ALARMS | Count of Unacknowledged Alarms | - | 0-999 | SOFT | ASSUMED |
| OP.SHELVED-ALARMS | Count of Shelved Alarms | - | 0-999 | SOFT | ASSUMED |
| OP.LAST-OPERATOR | Last Operator Action | - | text | SOFT | ASSUMED |

---

## 6. Tag Count Summary

| System | AI | AO | DI | DO | SOFT | Total |
|--------|----|----|----|----|------|-------|
| Gas Export | 8 | 2 | 4 | 2 | 20 | 36 |
| Heating Water | 35 | 0 | 15 | 10 | 18 | 78 |
| ESD | 0 | 0 | 6 | 8 | 12 | 26 |
| Communications | 0 | 0 | 0 | 0 | 10 | 10 |
| Utilities | 0 | 0 | 0 | 0 | 18 | 18 |
| **Total** | **43** | **2** | **25** | **20** | **78** | **168** |

---

## 7. Notes

1. All tags are **ASSUMED** as no PDF reference documents were available.
2. Tag naming follows ISA-5.1 conventions.
3. Heater trains 1-5 use 110, 120, 130, 140, 150 numbering scheme.
4. Quality bits follow OPC standard (0=Good, 1=Uncertain, 2=Bad, 3=CommFail).
5. Alarm limits to be configured in alarm system with appropriate deadbands and delays.

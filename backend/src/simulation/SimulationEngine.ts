// FSRU Simulator - Main Simulation Engine
// Time-stepped state machine for process simulation

import { EventEmitter } from 'events';
import {
  SimulationState,
  SimulationConfig,
  TagValue,
  Quality,
  ControlMode,
  ESDLevel,
  ESDState,
  PIDController,
  HeaterTrain,
  CapacityMode,
  CommFailMode,
  Event,
  Alarm,
  AlarmState,
  AlarmPriority,
  OperatorCommand
} from '../types';
import { tagDefinitions, getTagDefinition } from '../database/tags';
import { v4 as uuidv4 } from 'uuid';

const SCAN_RATE_MS = 100;  // 10 Hz simulation
const VALVE_SLEW_RATE = 5; // %/sec

export class SimulationEngine extends EventEmitter {
  private state: SimulationState;
  private intervalId: NodeJS.Timeout | null = null;
  private lastScanTime: number = Date.now();
  private transportDelayBuffer: Array<{ time: number; value: number }> = [];

  constructor() {
    super();
    this.state = this.initializeState();
  }

  private initializeState(): SimulationState {
    const config: SimulationConfig = {
      capacityMode: CapacityMode.MODE_350,
      commFailMode: CommFailMode.FAIL_SAFE_TRIP,
      commHoldTime: 5,
      gasDayResetHour: 6,
      transportDelay: 5,
      heatLossCoef: 0.5,
      pipelineLength: 5,
      ambientTemp: 10,
      inletWaterTemp: 5
    };

    const tags = new Map<string, TagValue>();

    // Initialize all tags with default values
    tagDefinitions.forEach(def => {
      let defaultValue = 0;

      // Set sensible initial values
      if (def.id === 'PT-001') defaultValue = 60;    // Export pressure at setpoint
      if (def.id === 'PT-002') defaultValue = 62;    // Upstream slightly higher
      if (def.id === 'PT-003') defaultValue = 59;    // Network pressure
      if (def.id === 'TT-001') defaultValue = 15;    // Export gas temp
      if (def.id === 'TT-100') defaultValue = 19;    // Supply header temp
      if (def.id === 'TT-101') defaultValue = 5;     // Inlet water temp
      if (def.id === 'PIC-001.SP') defaultValue = 60;
      if (def.id === 'FIC-001.SP') defaultValue = 200;
      if (def.id === 'TIC-100.SP') defaultValue = 19;
      if (def.id === 'CFG.CAPACITY-MODE') defaultValue = 1;
      if (def.id === 'SIM.SPEED') defaultValue = 1;
      if (def.id.includes('.AVAIL')) defaultValue = 1;
      if (def.id === 'GAS-EXPORT.MODE') defaultValue = 1;

      // Initialize heater train temperatures
      if (def.id.match(/TT-1[1-5]0$/)) defaultValue = config.inletWaterTemp;
      if (def.id.match(/TT-1[1-5]1$/)) defaultValue = config.inletWaterTemp;

      tags.set(def.id, {
        id: def.id,
        value: defaultValue,
        quality: Quality.GOOD,
        timestamp: Date.now()
      });
    });

    // Initialize PID controllers
    const controllers = new Map<string, PIDController>();

    controllers.set('PIC-001', {
      id: 'PIC-001',
      pv: 60,
      sp: 60,
      output: 50,
      mode: ControlMode.MANUAL,
      kp: 2.0,
      ki: 0.1,
      kd: 0.05,
      outputMin: 0,
      outputMax: 100,
      integral: 0,
      lastPv: 60,
      lastTime: Date.now()
    });

    controllers.set('FIC-001', {
      id: 'FIC-001',
      pv: 0,
      sp: 200,
      output: 0,
      mode: ControlMode.MANUAL,
      kp: 1.5,
      ki: 0.2,
      kd: 0,
      outputMin: 0,
      outputMax: 100,
      integral: 0,
      lastPv: 0,
      lastTime: Date.now()
    });

    controllers.set('TIC-100', {
      id: 'TIC-100',
      pv: 19,
      sp: 19,
      output: 60,
      mode: ControlMode.MANUAL,
      kp: 1.0,
      ki: 0.05,
      kd: 0,
      outputMin: 0,
      outputMax: 100,
      integral: 0,
      lastPv: 19,
      lastTime: Date.now()
    });

    // Initialize heater trains
    const heaterTrains: HeaterTrain[] = [];
    for (let i = 1; i <= 5; i++) {
      heaterTrains.push({
        id: i,
        pumpRunning: false,
        pumpTripped: false,
        pumpAmps: 0,
        pumpPower: 0,
        heaterEnabled: false,
        heaterRunning: false,
        heaterTripped: false,
        heaterFiring: 0,
        gasRate: 0,
        gasToday: 0,
        inletTemp: config.inletWaterTemp,
        outletTemp: config.inletWaterTemp,
        waterFlow: 0,
        available: true,
        localMode: false
      });
    }

    // Initialize ESD state
    const esd: ESDState = {
      level: ESDLevel.NONE,
      active: false,
      causeCode: 0,
      firstUpTimestamp: 0,
      resetPermissive: false,
      resetTimer: 0,
      acknowledged: false,
      causes: new Map()
    };

    return {
      time: 0,
      speed: 1,
      frozen: false,
      scenarioId: 0,
      tags,
      alarms: new Map(),
      events: [],
      controllers,
      heaterTrains,
      esd,
      config,
      commStatus: {
        healthy: true,
        lastHeartbeat: Date.now(),
        holdTimeRemaining: 0
      }
    };
  }

  start(): void {
    if (this.intervalId) return;

    this.lastScanTime = Date.now();
    this.intervalId = setInterval(() => this.scan(), SCAN_RATE_MS);
    this.emit('started');
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.emit('stopped');
  }

  freeze(): void {
    this.state.frozen = true;
    this.setTag('SIM.FREEZE', 1);
  }

  unfreeze(): void {
    this.state.frozen = false;
    this.setTag('SIM.FREEZE', 0);
    this.lastScanTime = Date.now();
  }

  setSpeed(speed: number): void {
    this.state.speed = Math.max(0.1, Math.min(10, speed));
    this.setTag('SIM.SPEED', this.state.speed);
  }

  private scan(): void {
    if (this.state.frozen) return;

    const now = Date.now();
    const realDt = (now - this.lastScanTime) / 1000; // seconds
    const dt = realDt * this.state.speed;
    this.lastScanTime = now;

    this.state.time += dt;
    this.setTag('SIM.TIME', this.state.time);

    // Execute simulation steps
    this.simulateProcessDynamics(dt);
    this.executeControlLogic(dt);
    this.simulateHeatingWater(dt);
    this.executeESDLogic();
    this.checkAlarms();
    this.simulateCommunications(dt);
    this.updateCalculatedTags();

    // Emit state update
    this.emit('update', this.getState());
  }

  private simulateProcessDynamics(dt: number): void {
    // Gas Export Process Model
    const pv001Pos = this.getTag('PV-001.POS');
    const fv001Pos = this.getTag('FV-001.POS');
    const xv001Open = this.getTag('XV-001.ZSO');
    const xv002Open = this.getTag('XV-002.ZSO');

    // Upstream pressure (slowly varying)
    let pt002 = this.getTag('PT-002');
    pt002 += (62 - pt002) * 0.01 * dt + this.noise(0.1);
    this.setTag('PT-002', Math.max(55, Math.min(70, pt002)));

    // Export header pressure
    // Depends on upstream, valve positions, and flow
    if (xv001Open > 0.5 && xv002Open > 0.5) {
      const effectiveValvePos = Math.min(pv001Pos, fv001Pos) / 100;
      const flowEffect = this.getTag('FT-001') / 700 * 5; // Flow causes pressure drop
      const supplyEffect = (pt002 - 60) * 0.3;

      let pt001 = this.getTag('PT-001');
      const targetPressure = 60 + supplyEffect - flowEffect * (1 - effectiveValvePos * 0.5);
      pt001 += (targetPressure - pt001) * 0.2 * dt + this.noise(0.2);
      this.setTag('PT-001', Math.max(50, Math.min(75, pt001)));
    } else {
      // ESD valves closed - pressure isolated
      let pt001 = this.getTag('PT-001');
      pt001 += (60 - pt001) * 0.05 * dt;
      this.setTag('PT-001', pt001);
    }

    // Export flow
    if (xv001Open > 0.5 && xv002Open > 0.5) {
      const capacityMax = this.state.config.capacityMode === CapacityMode.MODE_350 ? 350 : 700;
      const valveEffect = fv001Pos / 100;
      const pressureEffect = Math.max(0, (this.getTag('PT-001') - 55) / 10);

      let ft001 = this.getTag('FT-001');
      const targetFlow = capacityMax * valveEffect * pressureEffect;
      ft001 += (targetFlow - ft001) * 0.5 * dt + this.noise(2);
      this.setTag('FT-001', Math.max(0, Math.min(capacityMax * 1.1, ft001)));
    } else {
      let ft001 = this.getTag('FT-001');
      ft001 *= Math.exp(-2 * dt); // Rapid decay
      this.setTag('FT-001', Math.max(0, ft001));
    }

    // Export temperature (affected by heating water)
    const hwSupplyTemp = this.getTag('TT-100');
    const heatLoss = this.state.config.heatLossCoef * this.state.config.pipelineLength;
    const arrivalTemp = hwSupplyTemp - heatLoss;

    let tt001 = this.getTag('TT-001');
    const targetExportTemp = Math.min(arrivalTemp, 25); // Capped by vaporizer
    tt001 += (targetExportTemp - tt001) * 0.1 * dt + this.noise(0.1);
    this.setTag('TT-001', tt001);

    // Valve position feedback (with slew rate)
    this.updateValvePosition('PV-001', dt);
    this.updateValvePosition('FV-001', dt);
    this.updateESDValves(dt);

    // Update totalizer
    const ft002 = this.getTag('FT-002');
    this.setTag('FT-002', ft002 + this.getTag('FT-001') * dt / 3600);
  }

  private updateValvePosition(valveId: string, dt: number): void {
    const command = this.getTag(valveId);
    const feedback = this.getTag(`${valveId}.POS`);
    const maxChange = VALVE_SLEW_RATE * dt;

    let newPos = feedback;
    if (command > feedback) {
      newPos = Math.min(command, feedback + maxChange);
    } else if (command < feedback) {
      newPos = Math.max(command, feedback - maxChange);
    }

    this.setTag(`${valveId}.POS`, newPos);
  }

  private updateESDValves(dt: number): void {
    const esdActive = this.state.esd.active;

    // XV-001
    const xv001Cmd = this.getTag('XV-001');
    if (esdActive || xv001Cmd === 0) {
      // Close valve
      let zso = this.getTag('XV-001.ZSO');
      let zsc = this.getTag('XV-001.ZSC');
      zso = Math.max(0, zso - 0.5 * dt); // Fast close
      zsc = Math.min(1, zsc + 0.5 * dt);
      this.setTag('XV-001.ZSO', zso);
      this.setTag('XV-001.ZSC', zsc);
    } else {
      // Open valve
      let zso = this.getTag('XV-001.ZSO');
      let zsc = this.getTag('XV-001.ZSC');
      zso = Math.min(1, zso + 0.1 * dt); // Slower open
      zsc = Math.max(0, zsc - 0.1 * dt);
      this.setTag('XV-001.ZSO', zso);
      this.setTag('XV-001.ZSC', zsc);
    }

    // XV-002 (similar)
    const xv002Cmd = this.getTag('XV-002');
    if (esdActive || xv002Cmd === 0) {
      let zso = this.getTag('XV-002.ZSO');
      let zsc = this.getTag('XV-002.ZSC');
      zso = Math.max(0, zso - 0.5 * dt);
      zsc = Math.min(1, zsc + 0.5 * dt);
      this.setTag('XV-002.ZSO', zso);
      this.setTag('XV-002.ZSC', zsc);
    } else {
      let zso = this.getTag('XV-002.ZSO');
      let zsc = this.getTag('XV-002.ZSC');
      zso = Math.min(1, zso + 0.1 * dt);
      zsc = Math.max(0, zsc - 0.1 * dt);
      this.setTag('XV-002.ZSO', zso);
      this.setTag('XV-002.ZSC', zsc);
    }
  }

  private executeControlLogic(dt: number): void {
    // Skip if ESD active
    if (this.state.esd.active) {
      // Force valves to safe position
      this.setTag('PV-001', 0);
      this.setTag('FV-001', 0);
      return;
    }

    // Pressure Controller PIC-001
    const pic001 = this.state.controllers.get('PIC-001')!;
    pic001.pv = this.getTag('PT-001');
    this.setTag('PIC-001.PV', pic001.pv);

    if (pic001.mode === ControlMode.AUTO) {
      const output = this.executePID(pic001, dt);
      this.setTag('PV-001', output);
      this.setTag('PIC-001.OUT', output);
    }
    this.setTag('PIC-001.MODE', pic001.mode);
    this.setTag('PIC-001.SP', pic001.sp);

    // Flow Controller FIC-001
    const fic001 = this.state.controllers.get('FIC-001')!;
    fic001.pv = this.getTag('FT-001');
    this.setTag('FIC-001.PV', fic001.pv);

    if (fic001.mode === ControlMode.AUTO) {
      const output = this.executePID(fic001, dt);
      this.setTag('FV-001', output);
      this.setTag('FIC-001.OUT', output);
    }
    this.setTag('FIC-001.MODE', fic001.mode);
    this.setTag('FIC-001.SP', fic001.sp);
  }

  private executePID(controller: PIDController, dt: number): number {
    const error = controller.sp - controller.pv;

    // Proportional term
    const pTerm = controller.kp * error;

    // Integral term with anti-windup
    if (controller.output > controller.outputMin && controller.output < controller.outputMax) {
      controller.integral += error * dt;
    }
    const iTerm = controller.ki * controller.integral;

    // Derivative term (on PV to avoid derivative kick)
    const dPv = (controller.pv - controller.lastPv) / dt;
    const dTerm = -controller.kd * dPv;
    controller.lastPv = controller.pv;

    // Calculate output
    let output = pTerm + iTerm + dTerm;

    // Clamp output
    output = Math.max(controller.outputMin, Math.min(controller.outputMax, output));
    controller.output = output;

    return output;
  }

  private simulateHeatingWater(dt: number): void {
    const inletTemp = this.state.config.inletWaterTemp;
    this.setTag('TT-101', inletTemp + this.noise(0.1));

    let totalFlow = 0;
    let weightedTempSum = 0;
    let heatersRunning = 0;
    let heatersAvail = 0;
    let pumpsRunning = 0;
    let totalPower = 0;
    let totalGas = 0;

    // Process each heater train
    for (const train of this.state.heaterTrains) {
      const prefix = train.id * 10 + 100; // 110, 120, 130, 140, 150

      // Update train from commands
      train.pumpRunning = this.getTag(`PMP-${prefix}.CMD`) === 1 && !train.pumpTripped;
      train.heaterEnabled = this.getTag(`HTR-${prefix}.CMD`) === 1;

      // Heater can only run if pump is running and not tripped
      const canRun = train.pumpRunning && !train.heaterTripped && train.available && train.heaterEnabled;

      if (canRun && !train.heaterRunning) {
        // Starting heater
        train.heaterRunning = true;
        train.heaterFiring = 0;
      } else if (!canRun && train.heaterRunning) {
        // Stopping heater
        train.heaterRunning = false;
        train.heaterFiring = 0;
      }

      // Pump simulation
      if (train.pumpRunning) {
        train.pumpAmps = 800 + this.noise(50);
        train.pumpPower = train.pumpAmps * 0.95; // Approximate
        train.waterFlow = 500 + this.noise(10);
      } else {
        train.pumpAmps = 0;
        train.pumpPower = 0;
        train.waterFlow = 0;
      }

      // Heater simulation
      if (train.heaterRunning) {
        // Ramp up firing rate
        train.heaterFiring = Math.min(100, train.heaterFiring + 20 * dt);
        train.gasRate = train.heaterFiring / 100 * 1.0; // Max 1.0 Nm³/h

        // Calculate outlet temperature
        const heatInput = train.heaterFiring / 100 * 8500; // kW
        const waterMassFlow = train.waterFlow * 1000 / 3600; // kg/s
        const deltaT = heatInput / (waterMassFlow * 4.186); // °C
        train.outletTemp = inletTemp + deltaT;
      } else {
        train.heaterFiring = Math.max(0, train.heaterFiring - 30 * dt);
        train.gasRate = 0;
        train.outletTemp = inletTemp + (train.outletTemp - inletTemp) * Math.exp(-0.1 * dt);
      }

      // Gas consumption tracking
      train.gasToday += train.gasRate * dt / 3600;

      // Check gas limit
      if (train.gasToday >= 24) {
        train.available = false;
        if (train.heaterRunning) {
          train.heaterRunning = false;
          this.setTag(`HTR-${prefix}.CMD`, 0);
        }
      }

      // Update tags
      this.setTag(`PMP-${prefix}.RUN`, train.pumpRunning ? 1 : 0);
      this.setTag(`PMP-${prefix}.TRIP`, train.pumpTripped ? 1 : 0);
      this.setTag(`PMP-${prefix}.AMPS`, train.pumpAmps);
      this.setTag(`PMP-${prefix}.KW`, train.pumpPower);
      this.setTag(`HTR-${prefix}.RUN`, train.heaterRunning ? 1 : 0);
      this.setTag(`HTR-${prefix}.TRIP`, train.heaterTripped ? 1 : 0);
      this.setTag(`HTR-${prefix}.AVAIL`, train.available ? 1 : 0);
      this.setTag(`TT-${prefix}`, train.outletTemp + this.noise(0.1));
      this.setTag(`TT-${prefix + 1}`, inletTemp + this.noise(0.05));
      this.setTag(`FT-${prefix}`, train.waterFlow + this.noise(2));
      this.setTag(`FT-${prefix + 1}`, train.gasRate);
      this.setTag(`FT-${prefix + 1}.TOT`, train.gasToday);

      // Accumulate totals
      if (train.pumpRunning) {
        pumpsRunning++;
        totalFlow += train.waterFlow;
        weightedTempSum += train.outletTemp * train.waterFlow;
        totalPower += train.pumpPower;
      }
      if (train.heaterRunning) heatersRunning++;
      if (train.available) heatersAvail++;
      totalGas += train.gasToday;
    }

    // Calculate supply header temperature
    let supplyTemp = inletTemp;
    if (totalFlow > 0) {
      supplyTemp = weightedTempSum / totalFlow;
    }

    // Apply transport delay (simplified - just use current value with lag)
    let tt100 = this.getTag('TT-100');
    tt100 += (supplyTemp - tt100) * 0.05 * dt;
    this.setTag('TT-100', tt100 + this.noise(0.1));

    // Update system tags
    this.setTag('FT-100', totalFlow);
    this.setTag('HW.HEATERS-RUNNING', heatersRunning);
    this.setTag('HW.HEATERS-AVAIL', heatersAvail);
    this.setTag('HW.PUMPS-RUNNING', pumpsRunning);
    this.setTag('HW.TOTAL-POWER', totalPower);
    this.setTag('HW.TOTAL-GAS', totalGas);
    this.setTag('HW.READY', pumpsRunning > 0 && tt100 > 15 ? 1 : 0);

    // Temperature controller (staging logic)
    const tic100 = this.state.controllers.get('TIC-100')!;
    tic100.pv = tt100;
    this.setTag('TIC-100.PV', tic100.pv);
    this.setTag('TIC-100.SP', tic100.sp);
    this.setTag('TIC-100.MODE', tic100.mode);

    // Auto staging
    if (tic100.mode === ControlMode.AUTO && this.getTag('HW.MODE') === 1) {
      this.executeHeaterStaging(dt);
    }
  }

  private executeHeaterStaging(dt: number): void {
    const tic100 = this.state.controllers.get('TIC-100')!;
    const error = tic100.sp - tic100.pv;

    // Calculate required number of heaters
    // Each heater provides roughly 14°C rise at 500 m³/h
    const heatersRequired = Math.ceil(Math.max(0, (tic100.sp - this.state.config.inletWaterTemp) / 14));
    const currentRunning = this.getTag('HW.HEATERS-RUNNING');

    // Staging with hysteresis
    if (error > 1 && currentRunning < heatersRequired) {
      // Need more heat - start next available heater
      for (const train of this.state.heaterTrains) {
        if (train.available && !train.heaterRunning && train.pumpRunning) {
          const prefix = train.id * 10 + 100;
          this.setTag(`HTR-${prefix}.CMD`, 1);
          break;
        }
      }
    } else if (error < -1 && currentRunning > Math.max(1, heatersRequired - 1)) {
      // Too much heat - stop a heater
      for (let i = this.state.heaterTrains.length - 1; i >= 0; i--) {
        const train = this.state.heaterTrains[i];
        if (train.heaterRunning) {
          const prefix = train.id * 10 + 100;
          this.setTag(`HTR-${prefix}.CMD`, 0);
          break;
        }
      }
    }
  }

  private executeESDLogic(): void {
    const esd = this.state.esd;

    // Check ESD-1 causes
    const esd1Causes = [
      { id: 'ESD1-PB-001', code: 1 },
      { id: 'ESD1-PB-002', code: 1 },
      { id: 'FG-001', code: 2 },
      { id: 'FG-002', code: 2 },
      { id: 'PT-001', code: 3, limit: 70, type: 'HH' },
      { id: 'HW.PUMPS-RUNNING', code: 4, limit: 0, type: 'LL' }
    ];

    // Check ESD-2 causes
    const esd2Causes = [
      { id: 'ESD2-PB-001', code: 10 },
      { id: 'ESD2-PB-002', code: 10 },
      { id: 'PT-001', code: 11, limit: 67, type: 'HH' },
      { id: 'TT-001', code: 12, limit: -5, type: 'LL' },
      { id: 'TT-100', code: 13, limit: 10, type: 'LL' }
    ];

    let newLevel = ESDLevel.NONE;
    let triggerCode = 0;

    // Check ESD-1 causes
    for (const cause of esd1Causes) {
      let triggered = false;
      const value = this.getTag(cause.id);

      if (cause.type === 'HH' && cause.limit !== undefined) {
        triggered = value > cause.limit;
      } else if (cause.type === 'LL' && cause.limit !== undefined) {
        triggered = value <= cause.limit;
      } else {
        triggered = value === 1;
      }

      if (triggered && newLevel < ESDLevel.ESD1) {
        newLevel = ESDLevel.ESD1;
        if (triggerCode === 0) triggerCode = cause.code;
      }
    }

    // Check ESD-2 causes (only if not already ESD-1)
    if (newLevel < ESDLevel.ESD1) {
      for (const cause of esd2Causes) {
        let triggered = false;
        const value = this.getTag(cause.id);

        if (cause.type === 'HH' && cause.limit !== undefined) {
          triggered = value > cause.limit;
        } else if (cause.type === 'LL' && cause.limit !== undefined) {
          triggered = value < cause.limit;
        } else {
          triggered = value === 1;
        }

        if (triggered && newLevel < ESDLevel.ESD2) {
          newLevel = ESDLevel.ESD2;
          if (triggerCode === 0) triggerCode = cause.code;
        }
      }
    }

    // Update ESD state
    if (newLevel > ESDLevel.NONE && !esd.active) {
      // New ESD activation
      esd.active = true;
      esd.level = newLevel;
      esd.causeCode = triggerCode;
      esd.firstUpTimestamp = Date.now();
      esd.acknowledged = false;
      esd.resetTimer = 0;

      this.logEvent('ESD', `ESD-${newLevel} ACTIVATED - Cause ${triggerCode}`, 'SYSTEM');

      // Execute ESD effects
      if (newLevel >= ESDLevel.ESD1) {
        this.setTag('XV-001', 0);
        this.setTag('XV-002', 0);
        this.setTag('ESD.HTR-TRIP-ALL', 1);
        this.setTag('ESD.PMP-TRIP-ALL', 1);

        // Trip all heaters and pumps
        for (const train of this.state.heaterTrains) {
          train.heaterTripped = true;
          train.pumpTripped = true;
        }
      }

      this.setTag('ESD.HORN', 1);
    }

    // Update ESD tags
    this.setTag('ESD.LEVEL', esd.level);
    this.setTag('ESD.ACTIVE', esd.active ? 1 : 0);
    this.setTag('ESD.CAUSE', esd.causeCode);

    // Check reset permissive
    esd.resetPermissive = newLevel === ESDLevel.NONE && esd.acknowledged;
    this.setTag('ESD.RESET-PERM', esd.resetPermissive ? 1 : 0);
    this.setTag('ESD.RESET-TMR', esd.resetTimer);
  }

  private checkAlarms(): void {
    let activeCount = 0;
    let unackedCount = 0;
    let shelvedCount = 0;

    for (const def of tagDefinitions) {
      const value = this.getTag(def.id);
      const existingAlarm = this.state.alarms.get(def.id);

      // Check each alarm level
      for (const level of ['LL', 'L', 'H', 'HH'] as AlarmPriority[]) {
        const limitKey = `alarm${level}` as keyof typeof def;
        const limit = def[limitKey] as number | undefined;

        if (limit === undefined) continue;

        let inAlarm = false;
        const deadband = def.deadband || 0;

        if (level === 'HH' || level === 'H') {
          inAlarm = value > limit;
          if (existingAlarm?.state === AlarmState.ACTIVE) {
            inAlarm = value > (limit - deadband);
          }
        } else {
          inAlarm = value < limit;
          if (existingAlarm?.state === AlarmState.ACTIVE) {
            inAlarm = value < (limit + deadband);
          }
        }

        const alarmId = `${def.id}.${level}`;
        const existing = this.state.alarms.get(alarmId);

        if (inAlarm && (!existing || existing.state === AlarmState.RETURNED)) {
          // New alarm or re-alarm
          this.state.alarms.set(alarmId, {
            id: alarmId,
            tagId: def.id,
            priority: level,
            state: AlarmState.ACTIVE,
            value,
            limit,
            message: `${def.description} ${level}`,
            activatedAt: Date.now()
          });

          this.logEvent('ALARM', `${alarmId} ACTIVATED - ${value.toFixed(2)} ${def.unit}`, 'SYSTEM');
        } else if (!inAlarm && existing?.state === AlarmState.ACTIVE) {
          existing.state = AlarmState.RETURNED;
          existing.returnedAt = Date.now();

          this.logEvent('ALARM', `${alarmId} RETURNED`, 'SYSTEM');
        }

        const alarm = this.state.alarms.get(alarmId);
        if (alarm) {
          if (alarm.state === AlarmState.ACTIVE) activeCount++;
          if (alarm.state === AlarmState.ACTIVE && !alarm.acknowledgedAt) unackedCount++;
          if (alarm.state === AlarmState.SHELVED) shelvedCount++;
        }
      }
    }

    this.setTag('OP.ACTIVE-ALARMS', activeCount);
    this.setTag('OP.UNACKED-ALARMS', unackedCount);
    this.setTag('OP.SHELVED-ALARMS', shelvedCount);
  }

  private simulateCommunications(dt: number): void {
    // For simulation, communications are always healthy unless injected
    const comm = this.state.commStatus;

    if (!comm.healthy) {
      const mode = this.state.config.commFailMode;

      if (mode === CommFailMode.HOLD_LAST) {
        comm.holdTimeRemaining = Math.max(0, comm.holdTimeRemaining - dt);
        this.setTag('COMM.HOLDTIME', comm.holdTimeRemaining);

        if (comm.holdTimeRemaining <= 0) {
          // Hold time expired - trip
          this.setTag('ESD1-PB-001', 1); // Trigger ESD
        }
      } else if (mode === CommFailMode.FAIL_SAFE_TRIP) {
        // Immediate trip
        for (const train of this.state.heaterTrains) {
          train.heaterEnabled = false;
          train.pumpRunning = false;
        }
      }
    }

    this.setTag('COMM.FAIL', comm.healthy ? 0 : 1);
    this.setTag('COMM.REMOTE-STATUS', comm.healthy ? 0 : 3);
  }

  private updateCalculatedTags(): void {
    // Gas export system status
    const xv001Open = this.getTag('XV-001.ZSO') > 0.5;
    const xv002Open = this.getTag('XV-002.ZSO') > 0.5;
    const flowAboveMin = this.getTag('FT-001') > 50;

    this.setTag('GAS-EXPORT.READY', xv001Open && xv002Open && !this.state.esd.active ? 1 : 0);
    this.setTag('GAS-EXPORT.ACTIVE', flowAboveMin ? 1 : 0);
    this.setTag('GAS-EXPORT.TRIP', this.state.esd.active ? 1 : 0);
  }

  private noise(amplitude: number): number {
    return (Math.random() - 0.5) * 2 * amplitude;
  }

  // Public API methods
  getTag(tagId: string): number {
    return this.state.tags.get(tagId)?.value ?? 0;
  }

  setTag(tagId: string, value: number, quality: Quality = Quality.GOOD): void {
    const existing = this.state.tags.get(tagId);
    if (existing) {
      existing.value = value;
      existing.quality = quality;
      existing.timestamp = Date.now();
    } else {
      this.state.tags.set(tagId, {
        id: tagId,
        value,
        quality,
        timestamp: Date.now()
      });
    }
  }

  getAllTags(): Map<string, TagValue> {
    return this.state.tags;
  }

  getState(): SimulationState {
    return this.state;
  }

  getAlarms(): Alarm[] {
    return Array.from(this.state.alarms.values());
  }

  getEvents(limit: number = 100): Event[] {
    return this.state.events.slice(-limit);
  }

  // Operator commands
  processCommand(cmd: OperatorCommand): { success: boolean; message: string } {
    try {
      switch (cmd.type) {
        case 'SET_SP':
          if (cmd.tagId && cmd.value !== undefined) {
            const controller = this.state.controllers.get(cmd.tagId.replace('.SP', ''));
            if (controller) {
              controller.sp = cmd.value as number;
              this.setTag(`${cmd.tagId}`, cmd.value as number);
              this.logEvent('CMD', `${cmd.tagId} SP changed to ${cmd.value}`, cmd.operator);
            }
          }
          break;

        case 'SET_MODE':
          if (cmd.tagId && cmd.value !== undefined) {
            const controller = this.state.controllers.get(cmd.tagId.replace('.MODE', ''));
            if (controller) {
              controller.mode = cmd.value as ControlMode;
              this.setTag(`${cmd.tagId}`, cmd.value as number);
              this.logEvent('MODE', `${cmd.tagId} mode changed to ${cmd.value}`, cmd.operator);
            }
          }
          break;

        case 'SET_OUTPUT':
          if (cmd.tagId && cmd.value !== undefined) {
            this.setTag(cmd.tagId, cmd.value as number);
            this.logEvent('CMD', `${cmd.tagId} set to ${cmd.value}`, cmd.operator);
          }
          break;

        case 'START':
          if (cmd.tagId) {
            this.setTag(`${cmd.tagId}.CMD`, 1);
            this.logEvent('CMD', `${cmd.tagId} START`, cmd.operator);
          }
          break;

        case 'STOP':
          if (cmd.tagId) {
            this.setTag(`${cmd.tagId}.CMD`, 0);
            this.logEvent('CMD', `${cmd.tagId} STOP`, cmd.operator);
          }
          break;

        case 'ENABLE':
          if (cmd.tagId) {
            this.setTag(`${cmd.tagId}.CMD`, 1);
            this.logEvent('CMD', `${cmd.tagId} ENABLED`, cmd.operator);
          }
          break;

        case 'DISABLE':
          if (cmd.tagId) {
            this.setTag(`${cmd.tagId}.CMD`, 0);
            this.logEvent('CMD', `${cmd.tagId} DISABLED`, cmd.operator);
          }
          break;

        case 'ACK_ALARM':
          if (cmd.tagId) {
            const alarm = this.state.alarms.get(cmd.tagId);
            if (alarm) {
              alarm.acknowledgedAt = Date.now();
              alarm.acknowledgedBy = cmd.operator;
              if (alarm.state === AlarmState.RETURNED) {
                this.state.alarms.delete(cmd.tagId);
              } else {
                alarm.state = AlarmState.ACKNOWLEDGED;
              }
              this.logEvent('ALARM', `${cmd.tagId} acknowledged`, cmd.operator);
            }
          } else {
            // Acknowledge all
            for (const [id, alarm] of this.state.alarms) {
              alarm.acknowledgedAt = Date.now();
              alarm.acknowledgedBy = cmd.operator;
              if (alarm.state === AlarmState.RETURNED) {
                this.state.alarms.delete(id);
              }
            }
            this.logEvent('ALARM', 'All alarms acknowledged', cmd.operator);
          }
          break;

        case 'RESET_ESD':
          if (this.state.esd.resetPermissive) {
            this.state.esd.active = false;
            this.state.esd.level = ESDLevel.NONE;
            this.state.esd.causeCode = 0;
            this.setTag('ESD.HORN', 0);
            this.setTag('ESD.HTR-TRIP-ALL', 0);
            this.setTag('ESD.PMP-TRIP-ALL', 0);

            // Clear trips
            for (const train of this.state.heaterTrains) {
              train.heaterTripped = false;
              train.pumpTripped = false;
            }

            this.logEvent('ESD', 'ESD RESET', cmd.operator);
          } else {
            return { success: false, message: 'Reset permissive not satisfied' };
          }
          break;

        default:
          return { success: false, message: 'Unknown command type' };
      }

      return { success: true, message: 'Command executed' };
    } catch (error) {
      return { success: false, message: `Error: ${error}` };
    }
  }

  acknowledgeESD(operator: string): void {
    this.state.esd.acknowledged = true;
    this.setTag('ESD.HORN', 0);
    this.logEvent('ESD', 'ESD acknowledged', operator);
  }

  // Scenario injection
  injectFault(faultType: string, tagId?: string, value?: number): void {
    switch (faultType) {
      case 'SENSOR_STUCK':
        if (tagId) {
          const tag = this.state.tags.get(tagId);
          if (tag) tag.quality = Quality.BAD;
        }
        break;

      case 'SENSOR_BIAS':
        if (tagId && value) {
          const current = this.getTag(tagId);
          this.setTag(tagId, current + value);
        }
        break;

      case 'PUMP_TRIP':
        if (tagId) {
          const trainId = parseInt(tagId.replace('PMP-', '').slice(0, -1));
          const train = this.state.heaterTrains.find(t => t.id === trainId / 10 - 10);
          if (train) {
            train.pumpTripped = true;
            train.pumpRunning = false;
          }
        }
        break;

      case 'HEATER_TRIP':
        if (tagId) {
          const trainId = parseInt(tagId.replace('HTR-', '').slice(0, -1));
          const train = this.state.heaterTrains.find(t => t.id === trainId / 10 - 10);
          if (train) {
            train.heaterTripped = true;
            train.heaterRunning = false;
          }
        }
        break;

      case 'COMM_FAIL':
        this.state.commStatus.healthy = false;
        this.state.commStatus.failureStart = Date.now();
        this.state.commStatus.holdTimeRemaining = this.state.config.commHoldTime * 60;
        this.logEvent('SYSTEM', 'Communications failure injected', 'INSTRUCTOR');
        break;
    }
  }

  clearFault(faultType: string, tagId?: string): void {
    switch (faultType) {
      case 'SENSOR_STUCK':
      case 'SENSOR_BIAS':
        if (tagId) {
          const tag = this.state.tags.get(tagId);
          if (tag) tag.quality = Quality.GOOD;
        }
        break;

      case 'PUMP_TRIP':
        if (tagId) {
          const trainId = parseInt(tagId.replace('PMP-', '').slice(0, -1));
          const train = this.state.heaterTrains.find(t => t.id === trainId / 10 - 10);
          if (train) train.pumpTripped = false;
        }
        break;

      case 'HEATER_TRIP':
        if (tagId) {
          const trainId = parseInt(tagId.replace('HTR-', '').slice(0, -1));
          const train = this.state.heaterTrains.find(t => t.id === trainId / 10 - 10);
          if (train) train.heaterTripped = false;
        }
        break;

      case 'COMM_FAIL':
        this.state.commStatus.healthy = true;
        this.logEvent('SYSTEM', 'Communications restored', 'INSTRUCTOR');
        break;
    }
  }

  private logEvent(type: Event['type'], description: string, operator?: string): void {
    const event: Event = {
      id: uuidv4(),
      timestamp: Date.now(),
      type,
      description,
      operator
    };

    this.state.events.push(event);

    // Keep only last 10000 events
    if (this.state.events.length > 10000) {
      this.state.events = this.state.events.slice(-10000);
    }

    this.emit('event', event);
  }

  // Configuration
  setConfig(config: Partial<SimulationConfig>): void {
    Object.assign(this.state.config, config);

    // Update config tags
    if (config.capacityMode !== undefined) {
      this.setTag('CFG.CAPACITY-MODE', config.capacityMode);
      this.setTag('GAS-EXPORT.MODE', config.capacityMode);
    }
    if (config.commFailMode !== undefined) {
      this.setTag('CFG.COMM-FAIL-MODE', config.commFailMode);
    }
  }

  reset(): void {
    this.stop();
    this.state = this.initializeState();
    this.emit('reset');
  }
}

export const simulationEngine = new SimulationEngine();

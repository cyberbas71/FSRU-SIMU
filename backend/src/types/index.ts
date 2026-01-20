// FSRU Simulator Type Definitions

export enum IOType {
  AI = 'AI',   // Analog Input
  AO = 'AO',   // Analog Output
  DI = 'DI',   // Digital Input
  DO = 'DO',   // Digital Output
  SOFT = 'SOFT' // Software/Calculated
}

export enum Quality {
  GOOD = 0,
  UNCERTAIN = 1,
  BAD = 2,
  COMM_FAIL = 3
}

export enum AlarmPriority {
  LL = 'LL',   // Critical Low
  L = 'L',     // Low
  H = 'H',     // High
  HH = 'HH'    // Critical High
}

export enum AlarmState {
  NORMAL = 'NORMAL',
  ACTIVE = 'ACTIVE',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
  RETURNED = 'RETURNED',
  SHELVED = 'SHELVED'
}

export enum ControlMode {
  MANUAL = 0,
  AUTO = 1,
  CASCADE = 2
}

export enum ESDLevel {
  NONE = 0,
  ESD1 = 1,
  ESD2 = 2
}

export enum CommFailMode {
  FAIL_SAFE_TRIP = 0,
  HOLD_LAST = 1,
  LOCAL_AUTONOMY = 2
}

export enum CapacityMode {
  MODE_350 = 1,
  MODE_700 = 2
}

export interface TagDefinition {
  id: string;
  description: string;
  unit: string;
  ioType: IOType;
  rangeMin: number;
  rangeMax: number;
  alarmLL?: number;
  alarmL?: number;
  alarmH?: number;
  alarmHH?: number;
  deadband?: number;
  source: string;
}

export interface TagValue {
  id: string;
  value: number;
  quality: Quality;
  timestamp: number;
  alarmState?: AlarmState;
}

export interface AlarmConfig {
  tagId: string;
  priority: AlarmPriority;
  limit: number;
  deadband: number;
  onDelay: number;  // ms
  offDelay: number; // ms
  message: string;
}

export interface Alarm {
  id: string;
  tagId: string;
  priority: AlarmPriority;
  state: AlarmState;
  value: number;
  limit: number;
  message: string;
  activatedAt: number;
  acknowledgedAt?: number;
  returnedAt?: number;
  acknowledgedBy?: string;
}

export interface Event {
  id: string;
  timestamp: number;
  type: 'ALARM' | 'CMD' | 'MODE' | 'SYSTEM' | 'BYPASS' | 'ESD';
  description: string;
  operator?: string;
  tagId?: string;
  oldValue?: number | string;
  newValue?: number | string;
}

export interface PIDController {
  id: string;
  pv: number;       // Process variable
  sp: number;       // Setpoint
  output: number;   // Controller output
  mode: ControlMode;
  kp: number;       // Proportional gain
  ki: number;       // Integral gain (repeats/min)
  kd: number;       // Derivative gain
  outputMin: number;
  outputMax: number;
  integral: number; // Accumulated integral
  lastPv: number;   // Previous PV for derivative
  lastTime: number;
}

export interface HeaterTrain {
  id: number;
  pumpRunning: boolean;
  pumpTripped: boolean;
  pumpAmps: number;
  pumpPower: number;
  heaterEnabled: boolean;
  heaterRunning: boolean;
  heaterTripped: boolean;
  heaterFiring: number;
  gasRate: number;
  gasToday: number;
  inletTemp: number;
  outletTemp: number;
  waterFlow: number;
  available: boolean;
  localMode: boolean;
}

export interface ESDState {
  level: ESDLevel;
  active: boolean;
  causeCode: number;
  firstUpTimestamp: number;
  resetPermissive: boolean;
  resetTimer: number;
  acknowledged: boolean;
  causes: Map<string, boolean>;
}

export interface SimulationConfig {
  capacityMode: CapacityMode;
  commFailMode: CommFailMode;
  commHoldTime: number;     // minutes
  gasDayResetHour: number;  // 0-23
  transportDelay: number;   // minutes
  heatLossCoef: number;     // °C/km
  pipelineLength: number;   // km
  ambientTemp: number;      // °C
  inletWaterTemp: number;   // °C
}

export interface SimulationState {
  time: number;          // Simulation time in seconds
  speed: number;         // Speed multiplier
  frozen: boolean;
  scenarioId: number;
  tags: Map<string, TagValue>;
  alarms: Map<string, Alarm>;
  events: Event[];
  controllers: Map<string, PIDController>;
  heaterTrains: HeaterTrain[];
  esd: ESDState;
  config: SimulationConfig;
  commStatus: {
    healthy: boolean;
    lastHeartbeat: number;
    failureStart?: number;
    holdTimeRemaining: number;
  };
}

export interface ScenarioStep {
  time: number;
  action: 'SET_TAG' | 'INJECT_FAULT' | 'CLEAR_FAULT' | 'WAIT' | 'CHECK';
  tagId?: string;
  value?: number;
  faultType?: string;
  condition?: string;
  description: string;
}

export interface Scenario {
  id: number;
  name: string;
  description: string;
  category: string;
  steps: ScenarioStep[];
}

export interface OperatorCommand {
  type: 'SET_SP' | 'SET_MODE' | 'SET_OUTPUT' | 'START' | 'STOP' | 'ENABLE' | 'DISABLE' | 'ACK_ALARM' | 'RESET_ESD' | 'BYPASS';
  tagId?: string;
  value?: number | string;
  operator: string;
  timestamp: number;
}

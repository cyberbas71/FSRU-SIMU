// FSRU Simulator Tag Database
// All tags are ASSUMED as no PDF reference documents were available

import { TagDefinition, IOType } from '../types';

export const tagDefinitions: TagDefinition[] = [
  // ============================================
  // GAS EXPORT SYSTEM TAGS
  // ============================================

  // Pressure Measurements
  { id: 'PT-001', description: 'Export Header Pressure', unit: 'bar', ioType: IOType.AI, rangeMin: 0, rangeMax: 100, alarmLL: 52, alarmL: 55, alarmH: 67, alarmHH: 70, deadband: 0.5, source: 'ASSUMED' },
  { id: 'PT-002', description: 'Upstream Supply Pressure', unit: 'bar', ioType: IOType.AI, rangeMin: 0, rangeMax: 100, alarmLL: 58, alarmL: 60, deadband: 0.5, source: 'ASSUMED' },
  { id: 'PT-003', description: 'Downstream Network Pressure', unit: 'bar', ioType: IOType.AI, rangeMin: 0, rangeMax: 100, alarmLL: 50, alarmL: 55, alarmH: 65, alarmHH: 68, deadband: 0.5, source: 'ASSUMED' },
  { id: 'PDT-001', description: 'Control Valve DP', unit: 'bar', ioType: IOType.AI, rangeMin: 0, rangeMax: 20, alarmLL: 0.5, alarmL: 1, alarmH: 15, alarmHH: 18, deadband: 0.1, source: 'ASSUMED' },

  // Temperature Measurements
  { id: 'TT-001', description: 'Export Gas Temperature', unit: '°C', ioType: IOType.AI, rangeMin: -50, rangeMax: 50, alarmLL: -5, alarmL: 0, alarmH: 40, alarmHH: 45, deadband: 0.2, source: 'ASSUMED' },
  { id: 'TT-002', description: 'Upstream Gas Temperature', unit: '°C', ioType: IOType.AI, rangeMin: -50, rangeMax: 50, deadband: 0.2, source: 'ASSUMED' },
  { id: 'TT-003', description: 'Vaporizer Outlet Temperature', unit: '°C', ioType: IOType.AI, rangeMin: -50, rangeMax: 50, alarmLL: -5, alarmL: 0, alarmH: 35, alarmHH: 40, deadband: 0.2, source: 'ASSUMED' },

  // Flow Measurements
  { id: 'FT-001', description: 'Export Gas Flow', unit: 'Nm³/h', ioType: IOType.AI, rangeMin: 0, rangeMax: 1000, alarmLL: 20, alarmL: 50, deadband: 5, source: 'ASSUMED' },
  { id: 'FT-002', description: 'Totalizer Export Volume', unit: 'Nm³', ioType: IOType.AI, rangeMin: 0, rangeMax: 999999, source: 'ASSUMED' },

  // Control Valves
  { id: 'PV-001', description: 'Export Pressure Control Valve', unit: '%', ioType: IOType.AO, rangeMin: 0, rangeMax: 100, source: 'ASSUMED' },
  { id: 'PV-001.POS', description: 'PV-001 Position Feedback', unit: '%', ioType: IOType.AI, rangeMin: 0, rangeMax: 100, source: 'ASSUMED' },
  { id: 'PV-001.MODE', description: 'PV-001 Mode', unit: '', ioType: IOType.SOFT, rangeMin: 0, rangeMax: 2, source: 'ASSUMED' },
  { id: 'PV-001.SP', description: 'PV-001 Setpoint', unit: '%', ioType: IOType.SOFT, rangeMin: 0, rangeMax: 100, source: 'ASSUMED' },
  { id: 'FV-001', description: 'Export Flow Control Valve', unit: '%', ioType: IOType.AO, rangeMin: 0, rangeMax: 100, source: 'ASSUMED' },
  { id: 'FV-001.POS', description: 'FV-001 Position Feedback', unit: '%', ioType: IOType.AI, rangeMin: 0, rangeMax: 100, source: 'ASSUMED' },
  { id: 'FV-001.MODE', description: 'FV-001 Mode', unit: '', ioType: IOType.SOFT, rangeMin: 0, rangeMax: 2, source: 'ASSUMED' },
  { id: 'FV-001.SP', description: 'FV-001 Setpoint', unit: '%', ioType: IOType.SOFT, rangeMin: 0, rangeMax: 100, source: 'ASSUMED' },

  // ESD Valves
  { id: 'XV-001', description: 'Export ESD Isolation Valve', unit: '', ioType: IOType.DO, rangeMin: 0, rangeMax: 1, source: 'ASSUMED' },
  { id: 'XV-001.ZSO', description: 'XV-001 Open Limit Switch', unit: '', ioType: IOType.DI, rangeMin: 0, rangeMax: 1, source: 'ASSUMED' },
  { id: 'XV-001.ZSC', description: 'XV-001 Closed Limit Switch', unit: '', ioType: IOType.DI, rangeMin: 0, rangeMax: 1, source: 'ASSUMED' },
  { id: 'XV-002', description: 'Upstream ESD Isolation Valve', unit: '', ioType: IOType.DO, rangeMin: 0, rangeMax: 1, source: 'ASSUMED' },
  { id: 'XV-002.ZSO', description: 'XV-002 Open Limit Switch', unit: '', ioType: IOType.DI, rangeMin: 0, rangeMax: 1, source: 'ASSUMED' },
  { id: 'XV-002.ZSC', description: 'XV-002 Closed Limit Switch', unit: '', ioType: IOType.DI, rangeMin: 0, rangeMax: 1, source: 'ASSUMED' },

  // Controller Tags
  { id: 'PIC-001.PV', description: 'Pressure Controller PV', unit: 'bar', ioType: IOType.SOFT, rangeMin: 0, rangeMax: 100, source: 'ASSUMED' },
  { id: 'PIC-001.SP', description: 'Pressure Controller SP', unit: 'bar', ioType: IOType.SOFT, rangeMin: 55, rangeMax: 65, source: 'ASSUMED' },
  { id: 'PIC-001.OUT', description: 'Pressure Controller Output', unit: '%', ioType: IOType.SOFT, rangeMin: 0, rangeMax: 100, source: 'ASSUMED' },
  { id: 'PIC-001.MODE', description: 'Pressure Controller Mode', unit: '', ioType: IOType.SOFT, rangeMin: 0, rangeMax: 2, source: 'ASSUMED' },
  { id: 'FIC-001.PV', description: 'Flow Controller PV', unit: 'Nm³/h', ioType: IOType.SOFT, rangeMin: 0, rangeMax: 1000, source: 'ASSUMED' },
  { id: 'FIC-001.SP', description: 'Flow Controller SP', unit: 'Nm³/h', ioType: IOType.SOFT, rangeMin: 0, rangeMax: 700, source: 'ASSUMED' },
  { id: 'FIC-001.OUT', description: 'Flow Controller Output', unit: '%', ioType: IOType.SOFT, rangeMin: 0, rangeMax: 100, source: 'ASSUMED' },
  { id: 'FIC-001.MODE', description: 'Flow Controller Mode', unit: '', ioType: IOType.SOFT, rangeMin: 0, rangeMax: 2, source: 'ASSUMED' },

  // System Status
  { id: 'GAS-EXPORT.READY', description: 'Export System Ready', unit: '', ioType: IOType.SOFT, rangeMin: 0, rangeMax: 1, source: 'ASSUMED' },
  { id: 'GAS-EXPORT.ACTIVE', description: 'Export System Active', unit: '', ioType: IOType.SOFT, rangeMin: 0, rangeMax: 1, source: 'ASSUMED' },
  { id: 'GAS-EXPORT.TRIP', description: 'Export System Tripped', unit: '', ioType: IOType.SOFT, rangeMin: 0, rangeMax: 1, source: 'ASSUMED' },
  { id: 'GAS-EXPORT.MODE', description: 'Capacity Mode', unit: '', ioType: IOType.SOFT, rangeMin: 1, rangeMax: 2, source: 'ASSUMED' },

  // ============================================
  // HEATING WATER SYSTEM TAGS
  // ============================================

  // Common Header
  { id: 'TT-100', description: 'Supply Header Temperature', unit: '°C', ioType: IOType.AI, rangeMin: 0, rangeMax: 50, alarmLL: 10, alarmL: 15, alarmH: 25, alarmHH: 30, deadband: 0.2, source: 'ASSUMED' },
  { id: 'TT-101', description: 'Inlet Water Temperature', unit: '°C', ioType: IOType.AI, rangeMin: 0, rangeMax: 30, alarmLL: 2, alarmL: 3, alarmH: 15, alarmHH: 20, deadband: 0.2, source: 'ASSUMED' },
  { id: 'PT-100', description: 'Supply Header Pressure', unit: 'bar', ioType: IOType.AI, rangeMin: 0, rangeMax: 20, alarmLL: 2, alarmL: 3, alarmH: 15, alarmHH: 17, deadband: 0.1, source: 'ASSUMED' },
  { id: 'FT-100', description: 'Total Supply Flow', unit: 'm³/h', ioType: IOType.AI, rangeMin: 0, rangeMax: 3000, alarmLL: 100, alarmL: 200, alarmH: 2800, alarmHH: 3000, deadband: 20, source: 'ASSUMED' },
  { id: 'TIC-100.PV', description: 'Temp Controller PV', unit: '°C', ioType: IOType.SOFT, rangeMin: 0, rangeMax: 50, source: 'ASSUMED' },
  { id: 'TIC-100.SP', description: 'Temp Controller SP', unit: '°C', ioType: IOType.SOFT, rangeMin: 15, rangeMax: 25, source: 'ASSUMED' },
  { id: 'TIC-100.OUT', description: 'Temp Controller Output', unit: '%', ioType: IOType.SOFT, rangeMin: 0, rangeMax: 100, source: 'ASSUMED' },
  { id: 'TIC-100.MODE', description: 'Temp Controller Mode', unit: '', ioType: IOType.SOFT, rangeMin: 0, rangeMax: 2, source: 'ASSUMED' },

  // Heater Train 1
  { id: 'TT-110', description: 'Heater 1 Outlet Temperature', unit: '°C', ioType: IOType.AI, rangeMin: 0, rangeMax: 50, alarmLL: 10, alarmL: 15, alarmH: 28, alarmHH: 35, deadband: 0.2, source: 'ASSUMED' },
  { id: 'TT-111', description: 'Heater 1 Inlet Temperature', unit: '°C', ioType: IOType.AI, rangeMin: 0, rangeMax: 30, deadband: 0.2, source: 'ASSUMED' },
  { id: 'FT-110', description: 'Heater 1 Water Flow', unit: 'm³/h', ioType: IOType.AI, rangeMin: 0, rangeMax: 600, alarmLL: 50, alarmL: 100, alarmH: 550, alarmHH: 580, deadband: 5, source: 'ASSUMED' },
  { id: 'PT-110', description: 'Heater 1 Outlet Pressure', unit: 'bar', ioType: IOType.AI, rangeMin: 0, rangeMax: 20, alarmLL: 2, alarmL: 3, alarmH: 15, alarmHH: 17, deadband: 0.1, source: 'ASSUMED' },
  { id: 'FT-111', description: 'Heater 1 Gas Consumption', unit: 'Nm³/h', ioType: IOType.AI, rangeMin: 0, rangeMax: 5, alarmH: 0.9, alarmHH: 1.0, deadband: 0.02, source: 'ASSUMED' },
  { id: 'FT-111.TOT', description: 'Heater 1 Daily Gas Total', unit: 'Nm³', ioType: IOType.SOFT, rangeMin: 0, rangeMax: 30, alarmH: 22, alarmHH: 24, source: 'ASSUMED' },
  { id: 'HTR-110.CMD', description: 'Heater 1 Enable Command', unit: '', ioType: IOType.DO, rangeMin: 0, rangeMax: 1, source: 'ASSUMED' },
  { id: 'HTR-110.RUN', description: 'Heater 1 Running Status', unit: '', ioType: IOType.DI, rangeMin: 0, rangeMax: 1, source: 'ASSUMED' },
  { id: 'HTR-110.TRIP', description: 'Heater 1 Trip Status', unit: '', ioType: IOType.DI, rangeMin: 0, rangeMax: 1, source: 'ASSUMED' },
  { id: 'HTR-110.AVAIL', description: 'Heater 1 Available', unit: '', ioType: IOType.SOFT, rangeMin: 0, rangeMax: 1, source: 'ASSUMED' },
  { id: 'PMP-110.CMD', description: 'Pump 1 Start Command', unit: '', ioType: IOType.DO, rangeMin: 0, rangeMax: 1, source: 'ASSUMED' },
  { id: 'PMP-110.RUN', description: 'Pump 1 Running Status', unit: '', ioType: IOType.DI, rangeMin: 0, rangeMax: 1, source: 'ASSUMED' },
  { id: 'PMP-110.TRIP', description: 'Pump 1 Trip Status', unit: '', ioType: IOType.DI, rangeMin: 0, rangeMax: 1, source: 'ASSUMED' },
  { id: 'PMP-110.AMPS', description: 'Pump 1 Motor Current', unit: 'A', ioType: IOType.AI, rangeMin: 0, rangeMax: 2000, alarmLL: 100, alarmL: 200, alarmH: 1800, alarmHH: 1900, deadband: 20, source: 'ASSUMED' },
  { id: 'PMP-110.KW', description: 'Pump 1 Power', unit: 'kW', ioType: IOType.AI, rangeMin: 0, rangeMax: 1200, alarmH: 1050, alarmHH: 1100, deadband: 10, source: 'ASSUMED' },
  { id: 'PMP-110.LOCAL', description: 'Pump 1 Local Mode', unit: '', ioType: IOType.DI, rangeMin: 0, rangeMax: 1, source: 'ASSUMED' },

  // Heater Train 2
  { id: 'TT-120', description: 'Heater 2 Outlet Temperature', unit: '°C', ioType: IOType.AI, rangeMin: 0, rangeMax: 50, alarmLL: 10, alarmL: 15, alarmH: 28, alarmHH: 35, deadband: 0.2, source: 'ASSUMED' },
  { id: 'TT-121', description: 'Heater 2 Inlet Temperature', unit: '°C', ioType: IOType.AI, rangeMin: 0, rangeMax: 30, deadband: 0.2, source: 'ASSUMED' },
  { id: 'FT-120', description: 'Heater 2 Water Flow', unit: 'm³/h', ioType: IOType.AI, rangeMin: 0, rangeMax: 600, alarmLL: 50, alarmL: 100, alarmH: 550, alarmHH: 580, deadband: 5, source: 'ASSUMED' },
  { id: 'PT-120', description: 'Heater 2 Outlet Pressure', unit: 'bar', ioType: IOType.AI, rangeMin: 0, rangeMax: 20, alarmLL: 2, alarmL: 3, alarmH: 15, alarmHH: 17, deadband: 0.1, source: 'ASSUMED' },
  { id: 'FT-121', description: 'Heater 2 Gas Consumption', unit: 'Nm³/h', ioType: IOType.AI, rangeMin: 0, rangeMax: 5, alarmH: 0.9, alarmHH: 1.0, deadband: 0.02, source: 'ASSUMED' },
  { id: 'FT-121.TOT', description: 'Heater 2 Daily Gas Total', unit: 'Nm³', ioType: IOType.SOFT, rangeMin: 0, rangeMax: 30, alarmH: 22, alarmHH: 24, source: 'ASSUMED' },
  { id: 'HTR-120.CMD', description: 'Heater 2 Enable Command', unit: '', ioType: IOType.DO, rangeMin: 0, rangeMax: 1, source: 'ASSUMED' },
  { id: 'HTR-120.RUN', description: 'Heater 2 Running Status', unit: '', ioType: IOType.DI, rangeMin: 0, rangeMax: 1, source: 'ASSUMED' },
  { id: 'HTR-120.TRIP', description: 'Heater 2 Trip Status', unit: '', ioType: IOType.DI, rangeMin: 0, rangeMax: 1, source: 'ASSUMED' },
  { id: 'HTR-120.AVAIL', description: 'Heater 2 Available', unit: '', ioType: IOType.SOFT, rangeMin: 0, rangeMax: 1, source: 'ASSUMED' },
  { id: 'PMP-120.CMD', description: 'Pump 2 Start Command', unit: '', ioType: IOType.DO, rangeMin: 0, rangeMax: 1, source: 'ASSUMED' },
  { id: 'PMP-120.RUN', description: 'Pump 2 Running Status', unit: '', ioType: IOType.DI, rangeMin: 0, rangeMax: 1, source: 'ASSUMED' },
  { id: 'PMP-120.TRIP', description: 'Pump 2 Trip Status', unit: '', ioType: IOType.DI, rangeMin: 0, rangeMax: 1, source: 'ASSUMED' },
  { id: 'PMP-120.AMPS', description: 'Pump 2 Motor Current', unit: 'A', ioType: IOType.AI, rangeMin: 0, rangeMax: 2000, alarmLL: 100, alarmL: 200, alarmH: 1800, alarmHH: 1900, deadband: 20, source: 'ASSUMED' },
  { id: 'PMP-120.KW', description: 'Pump 2 Power', unit: 'kW', ioType: IOType.AI, rangeMin: 0, rangeMax: 1200, alarmH: 1050, alarmHH: 1100, deadband: 10, source: 'ASSUMED' },
  { id: 'PMP-120.LOCAL', description: 'Pump 2 Local Mode', unit: '', ioType: IOType.DI, rangeMin: 0, rangeMax: 1, source: 'ASSUMED' },

  // Heater Train 3
  { id: 'TT-130', description: 'Heater 3 Outlet Temperature', unit: '°C', ioType: IOType.AI, rangeMin: 0, rangeMax: 50, alarmLL: 10, alarmL: 15, alarmH: 28, alarmHH: 35, deadband: 0.2, source: 'ASSUMED' },
  { id: 'TT-131', description: 'Heater 3 Inlet Temperature', unit: '°C', ioType: IOType.AI, rangeMin: 0, rangeMax: 30, deadband: 0.2, source: 'ASSUMED' },
  { id: 'FT-130', description: 'Heater 3 Water Flow', unit: 'm³/h', ioType: IOType.AI, rangeMin: 0, rangeMax: 600, alarmLL: 50, alarmL: 100, alarmH: 550, alarmHH: 580, deadband: 5, source: 'ASSUMED' },
  { id: 'PT-130', description: 'Heater 3 Outlet Pressure', unit: 'bar', ioType: IOType.AI, rangeMin: 0, rangeMax: 20, alarmLL: 2, alarmL: 3, alarmH: 15, alarmHH: 17, deadband: 0.1, source: 'ASSUMED' },
  { id: 'FT-131', description: 'Heater 3 Gas Consumption', unit: 'Nm³/h', ioType: IOType.AI, rangeMin: 0, rangeMax: 5, alarmH: 0.9, alarmHH: 1.0, deadband: 0.02, source: 'ASSUMED' },
  { id: 'FT-131.TOT', description: 'Heater 3 Daily Gas Total', unit: 'Nm³', ioType: IOType.SOFT, rangeMin: 0, rangeMax: 30, alarmH: 22, alarmHH: 24, source: 'ASSUMED' },
  { id: 'HTR-130.CMD', description: 'Heater 3 Enable Command', unit: '', ioType: IOType.DO, rangeMin: 0, rangeMax: 1, source: 'ASSUMED' },
  { id: 'HTR-130.RUN', description: 'Heater 3 Running Status', unit: '', ioType: IOType.DI, rangeMin: 0, rangeMax: 1, source: 'ASSUMED' },
  { id: 'HTR-130.TRIP', description: 'Heater 3 Trip Status', unit: '', ioType: IOType.DI, rangeMin: 0, rangeMax: 1, source: 'ASSUMED' },
  { id: 'HTR-130.AVAIL', description: 'Heater 3 Available', unit: '', ioType: IOType.SOFT, rangeMin: 0, rangeMax: 1, source: 'ASSUMED' },
  { id: 'PMP-130.CMD', description: 'Pump 3 Start Command', unit: '', ioType: IOType.DO, rangeMin: 0, rangeMax: 1, source: 'ASSUMED' },
  { id: 'PMP-130.RUN', description: 'Pump 3 Running Status', unit: '', ioType: IOType.DI, rangeMin: 0, rangeMax: 1, source: 'ASSUMED' },
  { id: 'PMP-130.TRIP', description: 'Pump 3 Trip Status', unit: '', ioType: IOType.DI, rangeMin: 0, rangeMax: 1, source: 'ASSUMED' },
  { id: 'PMP-130.AMPS', description: 'Pump 3 Motor Current', unit: 'A', ioType: IOType.AI, rangeMin: 0, rangeMax: 2000, alarmLL: 100, alarmL: 200, alarmH: 1800, alarmHH: 1900, deadband: 20, source: 'ASSUMED' },
  { id: 'PMP-130.KW', description: 'Pump 3 Power', unit: 'kW', ioType: IOType.AI, rangeMin: 0, rangeMax: 1200, alarmH: 1050, alarmHH: 1100, deadband: 10, source: 'ASSUMED' },
  { id: 'PMP-130.LOCAL', description: 'Pump 3 Local Mode', unit: '', ioType: IOType.DI, rangeMin: 0, rangeMax: 1, source: 'ASSUMED' },

  // Heater Train 4
  { id: 'TT-140', description: 'Heater 4 Outlet Temperature', unit: '°C', ioType: IOType.AI, rangeMin: 0, rangeMax: 50, alarmLL: 10, alarmL: 15, alarmH: 28, alarmHH: 35, deadband: 0.2, source: 'ASSUMED' },
  { id: 'TT-141', description: 'Heater 4 Inlet Temperature', unit: '°C', ioType: IOType.AI, rangeMin: 0, rangeMax: 30, deadband: 0.2, source: 'ASSUMED' },
  { id: 'FT-140', description: 'Heater 4 Water Flow', unit: 'm³/h', ioType: IOType.AI, rangeMin: 0, rangeMax: 600, alarmLL: 50, alarmL: 100, alarmH: 550, alarmHH: 580, deadband: 5, source: 'ASSUMED' },
  { id: 'PT-140', description: 'Heater 4 Outlet Pressure', unit: 'bar', ioType: IOType.AI, rangeMin: 0, rangeMax: 20, alarmLL: 2, alarmL: 3, alarmH: 15, alarmHH: 17, deadband: 0.1, source: 'ASSUMED' },
  { id: 'FT-141', description: 'Heater 4 Gas Consumption', unit: 'Nm³/h', ioType: IOType.AI, rangeMin: 0, rangeMax: 5, alarmH: 0.9, alarmHH: 1.0, deadband: 0.02, source: 'ASSUMED' },
  { id: 'FT-141.TOT', description: 'Heater 4 Daily Gas Total', unit: 'Nm³', ioType: IOType.SOFT, rangeMin: 0, rangeMax: 30, alarmH: 22, alarmHH: 24, source: 'ASSUMED' },
  { id: 'HTR-140.CMD', description: 'Heater 4 Enable Command', unit: '', ioType: IOType.DO, rangeMin: 0, rangeMax: 1, source: 'ASSUMED' },
  { id: 'HTR-140.RUN', description: 'Heater 4 Running Status', unit: '', ioType: IOType.DI, rangeMin: 0, rangeMax: 1, source: 'ASSUMED' },
  { id: 'HTR-140.TRIP', description: 'Heater 4 Trip Status', unit: '', ioType: IOType.DI, rangeMin: 0, rangeMax: 1, source: 'ASSUMED' },
  { id: 'HTR-140.AVAIL', description: 'Heater 4 Available', unit: '', ioType: IOType.SOFT, rangeMin: 0, rangeMax: 1, source: 'ASSUMED' },
  { id: 'PMP-140.CMD', description: 'Pump 4 Start Command', unit: '', ioType: IOType.DO, rangeMin: 0, rangeMax: 1, source: 'ASSUMED' },
  { id: 'PMP-140.RUN', description: 'Pump 4 Running Status', unit: '', ioType: IOType.DI, rangeMin: 0, rangeMax: 1, source: 'ASSUMED' },
  { id: 'PMP-140.TRIP', description: 'Pump 4 Trip Status', unit: '', ioType: IOType.DI, rangeMin: 0, rangeMax: 1, source: 'ASSUMED' },
  { id: 'PMP-140.AMPS', description: 'Pump 4 Motor Current', unit: 'A', ioType: IOType.AI, rangeMin: 0, rangeMax: 2000, alarmLL: 100, alarmL: 200, alarmH: 1800, alarmHH: 1900, deadband: 20, source: 'ASSUMED' },
  { id: 'PMP-140.KW', description: 'Pump 4 Power', unit: 'kW', ioType: IOType.AI, rangeMin: 0, rangeMax: 1200, alarmH: 1050, alarmHH: 1100, deadband: 10, source: 'ASSUMED' },
  { id: 'PMP-140.LOCAL', description: 'Pump 4 Local Mode', unit: '', ioType: IOType.DI, rangeMin: 0, rangeMax: 1, source: 'ASSUMED' },

  // Heater Train 5
  { id: 'TT-150', description: 'Heater 5 Outlet Temperature', unit: '°C', ioType: IOType.AI, rangeMin: 0, rangeMax: 50, alarmLL: 10, alarmL: 15, alarmH: 28, alarmHH: 35, deadband: 0.2, source: 'ASSUMED' },
  { id: 'TT-151', description: 'Heater 5 Inlet Temperature', unit: '°C', ioType: IOType.AI, rangeMin: 0, rangeMax: 30, deadband: 0.2, source: 'ASSUMED' },
  { id: 'FT-150', description: 'Heater 5 Water Flow', unit: 'm³/h', ioType: IOType.AI, rangeMin: 0, rangeMax: 600, alarmLL: 50, alarmL: 100, alarmH: 550, alarmHH: 580, deadband: 5, source: 'ASSUMED' },
  { id: 'PT-150', description: 'Heater 5 Outlet Pressure', unit: 'bar', ioType: IOType.AI, rangeMin: 0, rangeMax: 20, alarmLL: 2, alarmL: 3, alarmH: 15, alarmHH: 17, deadband: 0.1, source: 'ASSUMED' },
  { id: 'FT-151', description: 'Heater 5 Gas Consumption', unit: 'Nm³/h', ioType: IOType.AI, rangeMin: 0, rangeMax: 5, alarmH: 0.9, alarmHH: 1.0, deadband: 0.02, source: 'ASSUMED' },
  { id: 'FT-151.TOT', description: 'Heater 5 Daily Gas Total', unit: 'Nm³', ioType: IOType.SOFT, rangeMin: 0, rangeMax: 30, alarmH: 22, alarmHH: 24, source: 'ASSUMED' },
  { id: 'HTR-150.CMD', description: 'Heater 5 Enable Command', unit: '', ioType: IOType.DO, rangeMin: 0, rangeMax: 1, source: 'ASSUMED' },
  { id: 'HTR-150.RUN', description: 'Heater 5 Running Status', unit: '', ioType: IOType.DI, rangeMin: 0, rangeMax: 1, source: 'ASSUMED' },
  { id: 'HTR-150.TRIP', description: 'Heater 5 Trip Status', unit: '', ioType: IOType.DI, rangeMin: 0, rangeMax: 1, source: 'ASSUMED' },
  { id: 'HTR-150.AVAIL', description: 'Heater 5 Available', unit: '', ioType: IOType.SOFT, rangeMin: 0, rangeMax: 1, source: 'ASSUMED' },
  { id: 'PMP-150.CMD', description: 'Pump 5 Start Command', unit: '', ioType: IOType.DO, rangeMin: 0, rangeMax: 1, source: 'ASSUMED' },
  { id: 'PMP-150.RUN', description: 'Pump 5 Running Status', unit: '', ioType: IOType.DI, rangeMin: 0, rangeMax: 1, source: 'ASSUMED' },
  { id: 'PMP-150.TRIP', description: 'Pump 5 Trip Status', unit: '', ioType: IOType.DI, rangeMin: 0, rangeMax: 1, source: 'ASSUMED' },
  { id: 'PMP-150.AMPS', description: 'Pump 5 Motor Current', unit: 'A', ioType: IOType.AI, rangeMin: 0, rangeMax: 2000, alarmLL: 100, alarmL: 200, alarmH: 1800, alarmHH: 1900, deadband: 20, source: 'ASSUMED' },
  { id: 'PMP-150.KW', description: 'Pump 5 Power', unit: 'kW', ioType: IOType.AI, rangeMin: 0, rangeMax: 1200, alarmH: 1050, alarmHH: 1100, deadband: 10, source: 'ASSUMED' },
  { id: 'PMP-150.LOCAL', description: 'Pump 5 Local Mode', unit: '', ioType: IOType.DI, rangeMin: 0, rangeMax: 1, source: 'ASSUMED' },

  // Heating Water System Status
  { id: 'HW.HEATERS-RUNNING', description: 'Count of Running Heaters', unit: '', ioType: IOType.SOFT, rangeMin: 0, rangeMax: 5, source: 'ASSUMED' },
  { id: 'HW.HEATERS-AVAIL', description: 'Count of Available Heaters', unit: '', ioType: IOType.SOFT, rangeMin: 0, rangeMax: 5, source: 'ASSUMED' },
  { id: 'HW.PUMPS-RUNNING', description: 'Count of Running Pumps', unit: '', ioType: IOType.SOFT, rangeMin: 0, rangeMax: 5, source: 'ASSUMED' },
  { id: 'HW.TOTAL-POWER', description: 'Total Pump Power', unit: 'kW', ioType: IOType.SOFT, rangeMin: 0, rangeMax: 6000, source: 'ASSUMED' },
  { id: 'HW.TOTAL-GAS', description: 'Total Daily Gas Usage', unit: 'Nm³', ioType: IOType.SOFT, rangeMin: 0, rangeMax: 150, alarmH: 100, source: 'ASSUMED' },
  { id: 'HW.MODE', description: 'Control Mode', unit: '', ioType: IOType.SOFT, rangeMin: 0, rangeMax: 1, source: 'ASSUMED' },
  { id: 'HW.READY', description: 'Heating Water System Ready', unit: '', ioType: IOType.SOFT, rangeMin: 0, rangeMax: 1, source: 'ASSUMED' },
  { id: 'HW.TRIP', description: 'Heating Water System Trip', unit: '', ioType: IOType.SOFT, rangeMin: 0, rangeMax: 1, source: 'ASSUMED' },

  // ============================================
  // ESD SYSTEM TAGS
  // ============================================

  { id: 'ESD.LEVEL', description: 'Active ESD Level', unit: '', ioType: IOType.SOFT, rangeMin: 0, rangeMax: 2, source: 'ASSUMED' },
  { id: 'ESD.ACTIVE', description: 'ESD Active', unit: '', ioType: IOType.SOFT, rangeMin: 0, rangeMax: 1, source: 'ASSUMED' },
  { id: 'ESD.CAUSE', description: 'First-Up Cause Code', unit: '', ioType: IOType.SOFT, rangeMin: 0, rangeMax: 99, source: 'ASSUMED' },
  { id: 'ESD.RESET-PERM', description: 'Reset Permissive', unit: '', ioType: IOType.SOFT, rangeMin: 0, rangeMax: 1, source: 'ASSUMED' },
  { id: 'ESD.RESET-CMD', description: 'Reset Command', unit: '', ioType: IOType.DO, rangeMin: 0, rangeMax: 1, source: 'ASSUMED' },
  { id: 'ESD.RESET-TMR', description: 'Reset Timer', unit: 'sec', ioType: IOType.SOFT, rangeMin: 0, rangeMax: 30, source: 'ASSUMED' },

  // ESD Initiators
  { id: 'ESD1-PB-001', description: 'ESD-1 Pushbutton (Control Room)', unit: '', ioType: IOType.DI, rangeMin: 0, rangeMax: 1, source: 'ASSUMED' },
  { id: 'ESD1-PB-002', description: 'ESD-1 Pushbutton (Field)', unit: '', ioType: IOType.DI, rangeMin: 0, rangeMax: 1, source: 'ASSUMED' },
  { id: 'ESD2-PB-001', description: 'ESD-2 Pushbutton (Control Room)', unit: '', ioType: IOType.DI, rangeMin: 0, rangeMax: 1, source: 'ASSUMED' },
  { id: 'ESD2-PB-002', description: 'ESD-2 Pushbutton (Field)', unit: '', ioType: IOType.DI, rangeMin: 0, rangeMax: 1, source: 'ASSUMED' },
  { id: 'FG-001', description: 'Fire/Gas Detection Zone 1', unit: '', ioType: IOType.DI, rangeMin: 0, rangeMax: 1, source: 'ASSUMED' },
  { id: 'FG-002', description: 'Fire/Gas Detection Zone 2', unit: '', ioType: IOType.DI, rangeMin: 0, rangeMax: 1, source: 'ASSUMED' },

  // ESD Outputs
  { id: 'ESD.XV-001-CLOSE', description: 'Close Export ESD Valve', unit: '', ioType: IOType.DO, rangeMin: 0, rangeMax: 1, source: 'ASSUMED' },
  { id: 'ESD.XV-002-CLOSE', description: 'Close Upstream ESD Valve', unit: '', ioType: IOType.DO, rangeMin: 0, rangeMax: 1, source: 'ASSUMED' },
  { id: 'ESD.PV-001-CLOSE', description: 'Close Pressure CV to 0%', unit: '', ioType: IOType.DO, rangeMin: 0, rangeMax: 1, source: 'ASSUMED' },
  { id: 'ESD.FV-001-CLOSE', description: 'Close Flow CV to 0%', unit: '', ioType: IOType.DO, rangeMin: 0, rangeMax: 1, source: 'ASSUMED' },
  { id: 'ESD.HTR-TRIP-ALL', description: 'Trip All Heaters', unit: '', ioType: IOType.DO, rangeMin: 0, rangeMax: 1, source: 'ASSUMED' },
  { id: 'ESD.PMP-TRIP-ALL', description: 'Trip All Pumps', unit: '', ioType: IOType.DO, rangeMin: 0, rangeMax: 1, source: 'ASSUMED' },
  { id: 'ESD.HORN', description: 'ESD Audible Alarm', unit: '', ioType: IOType.DO, rangeMin: 0, rangeMax: 1, source: 'ASSUMED' },

  // ============================================
  // COMMUNICATION TAGS
  // ============================================

  { id: 'COMM.REMOTE-STATUS', description: 'Remote RTU Comm Status', unit: '', ioType: IOType.SOFT, rangeMin: 0, rangeMax: 3, source: 'ASSUMED' },
  { id: 'COMM.HEARTBEAT', description: 'Heartbeat Counter', unit: '', ioType: IOType.SOFT, rangeMin: 0, rangeMax: 65535, source: 'ASSUMED' },
  { id: 'COMM.LAST-RX', description: 'Time Since Last Receive', unit: 'sec', ioType: IOType.SOFT, rangeMin: 0, rangeMax: 9999, source: 'ASSUMED' },
  { id: 'COMM.FAIL', description: 'Communication Failure', unit: '', ioType: IOType.SOFT, rangeMin: 0, rangeMax: 1, source: 'ASSUMED' },
  { id: 'COMM.FAIL-MODE', description: 'Active Failure Mode', unit: '', ioType: IOType.SOFT, rangeMin: 0, rangeMax: 2, source: 'ASSUMED' },
  { id: 'COMM.HOLDTIME', description: 'Hold-Last Remaining Time', unit: 'sec', ioType: IOType.SOFT, rangeMin: 0, rangeMax: 600, source: 'ASSUMED' },

  // ============================================
  // CONFIGURATION TAGS
  // ============================================

  { id: 'CFG.CAPACITY-MODE', description: 'Capacity Mode', unit: '', ioType: IOType.SOFT, rangeMin: 1, rangeMax: 2, source: 'ASSUMED' },
  { id: 'CFG.COMM-FAIL-MODE', description: 'Comm Fail Mode', unit: '', ioType: IOType.SOFT, rangeMin: 0, rangeMax: 2, source: 'ASSUMED' },
  { id: 'CFG.COMM-HOLD-TIME', description: 'Comm Hold Time', unit: 'min', ioType: IOType.SOFT, rangeMin: 1, rangeMax: 30, source: 'ASSUMED' },
  { id: 'CFG.GAS-DAY-RESET', description: 'Gas Day Reset Hour', unit: 'hr', ioType: IOType.SOFT, rangeMin: 0, rangeMax: 23, source: 'ASSUMED' },
  { id: 'CFG.TRANSPORT-DELAY', description: 'Transport Delay Time', unit: 'min', ioType: IOType.SOFT, rangeMin: 1, rangeMax: 30, source: 'ASSUMED' },
  { id: 'CFG.HEAT-LOSS-COEF', description: 'Heat Loss Coefficient', unit: '°C/km', ioType: IOType.SOFT, rangeMin: 0, rangeMax: 2, source: 'ASSUMED' },
  { id: 'CFG.PIPELINE-LENGTH', description: 'Pipeline Length', unit: 'km', ioType: IOType.SOFT, rangeMin: 1, rangeMax: 20, source: 'ASSUMED' },

  // ============================================
  // SIMULATION CONTROL TAGS
  // ============================================

  { id: 'SIM.TIME', description: 'Simulation Time', unit: 'sec', ioType: IOType.SOFT, rangeMin: 0, rangeMax: 999999999, source: 'ASSUMED' },
  { id: 'SIM.SPEED', description: 'Simulation Speed Multiplier', unit: 'x', ioType: IOType.SOFT, rangeMin: 0.1, rangeMax: 10, source: 'ASSUMED' },
  { id: 'SIM.FREEZE', description: 'Simulation Freeze', unit: '', ioType: IOType.SOFT, rangeMin: 0, rangeMax: 1, source: 'ASSUMED' },
  { id: 'SIM.SCENARIO', description: 'Active Scenario ID', unit: '', ioType: IOType.SOFT, rangeMin: 0, rangeMax: 99, source: 'ASSUMED' },
  { id: 'SIM.AMBIENT-TEMP', description: 'Ambient Temperature', unit: '°C', ioType: IOType.SOFT, rangeMin: -20, rangeMax: 40, source: 'ASSUMED' },
  { id: 'SIM.INLET-WATER-TEMP', description: 'Inlet Water Override', unit: '°C', ioType: IOType.SOFT, rangeMin: 0, rangeMax: 20, source: 'ASSUMED' },

  // ============================================
  // OPERATOR INFORMATION TAGS
  // ============================================

  { id: 'OP.ACTIVE-ALARMS', description: 'Count of Active Alarms', unit: '', ioType: IOType.SOFT, rangeMin: 0, rangeMax: 999, source: 'ASSUMED' },
  { id: 'OP.UNACKED-ALARMS', description: 'Count of Unacknowledged Alarms', unit: '', ioType: IOType.SOFT, rangeMin: 0, rangeMax: 999, source: 'ASSUMED' },
  { id: 'OP.SHELVED-ALARMS', description: 'Count of Shelved Alarms', unit: '', ioType: IOType.SOFT, rangeMin: 0, rangeMax: 999, source: 'ASSUMED' },
];

export function getTagDefinition(tagId: string): TagDefinition | undefined {
  return tagDefinitions.find(t => t.id === tagId);
}

export function getTagsBySystem(system: string): TagDefinition[] {
  const systemPrefixes: Record<string, string[]> = {
    'GAS_EXPORT': ['PT-00', 'TT-00', 'FT-00', 'PV-', 'FV-', 'XV-', 'PIC-', 'FIC-', 'PDT-', 'GAS-EXPORT'],
    'HEATING_WATER': ['TT-1', 'FT-1', 'PT-1', 'HTR-', 'PMP-', 'HW.', 'TIC-100'],
    'ESD': ['ESD', 'FG-'],
    'COMM': ['COMM.'],
    'CONFIG': ['CFG.'],
    'SIM': ['SIM.'],
    'OPERATOR': ['OP.']
  };

  const prefixes = systemPrefixes[system] || [];
  return tagDefinitions.filter(t => prefixes.some(p => t.id.startsWith(p)));
}

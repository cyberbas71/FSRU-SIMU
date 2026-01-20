// FSRU Simulator Backend Entry Point
// Brunsbüttel FSRU Training Simulator

import { startServer } from './api/server';

console.log('========================================');
console.log('  FSRU BRUNSBÜTTEL SIMULATOR');
console.log('  Backend Process Simulation Engine');
console.log('========================================');
console.log('');

// Handle process signals
process.on('SIGINT', () => {
  console.log('\nShutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nTerminating...');
  process.exit(0);
});

// Start the server
startServer();

export * from './types';
export * from './simulation/SimulationEngine';
export * from './database/tags';

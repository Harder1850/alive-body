/**
 * ALIVE Body - System Integration
 * 
 * This file wires the system connector to the observation handler.
 * Import and call initSystemIntegration() from your main entry point.
 */

import { startSystemConnector, setObservationHandler } from './system-connector.js';
import { handleObservation } from './observation-handler.js';

/**
 * Initialize the system integration.
 * Call this from your main entry point after other initialization.
 */
export function initSystemIntegration() {
  console.log('[body] Initializing system integration...');
  
  // Set the observation handler
  setObservationHandler(handleObservation);
  
  // Start the system connector
  startSystemConnector();
  
  console.log('[body] System integration initialized');
}

export default initSystemIntegration;

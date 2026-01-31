/**
 * ALIVE Body - Standalone Runner
 * 
 * Initializes all systems including self-site.
 */

import { startSystemConnector, setObservationHandler } from './nervous-system/system-connector.js';
import { handleObservation, initWithCore } from './nervous-system/observation-handler.js';
import selfSite from './adapters/self-site/index.js';
// import core from './core/index.js';

console.log(`
╔═══════════════════════════════════════════════════════╗
║                    ALIVE BODY                         ║
╠═══════════════════════════════════════════════════════╣
║  Connecting to alive-system...                        ║
║  System:     ws://localhost:7070/?type=body           ║
╠═══════════════════════════════════════════════════════╣
║  Role:       Execution & Adapters                     ║
╚═══════════════════════════════════════════════════════╝
`);

// Initialize everything
async function init() {
  console.log('[body] Starting initialization...');
  
  // Initialize Core first
  await initWithCore();
  
  // Initialize self-site
  await selfSite.init();
  await selfSite.logActivity('ALIVE Body started');
  
  // Set up observation handler
  setObservationHandler(async (observation) => {
    // Log to self-site
    await selfSite.logActivity(`Observation: ${observation.modality} - ${String(observation.raw).slice(0, 50)}`);
    
    // Process observation
    const result = await handleObservation(observation);
    
    // Log response
    await selfSite.logActivity(`Response: ${String(result?.content?.text || '').slice(0, 50)}`);
    
    return result;
  });
  
  // Connect to system
  startSystemConnector();
  
  // Update status periodically
  setInterval(async () => {
    try {
      const coreStatus = { identity: 'ALIVE', version: '1.0.0', memories: { factCount: 0, episodeCount: 0 }, experiences: { total: 0 } };
      
      await selfSite.updateStatus({
        system: { running: true },
        connections: { hosts: 1, bodies: 1 },
        core: {
          initialized: coreStatus.initialized,
          memories: coreStatus.memories,
          experiences: coreStatus.experiences
        }
      });
    } catch (err) {
      // Ignore errors during status update
    }
  }, 30000); // Every 30 seconds
  
  // Initial status update
  setTimeout(async () => {
    try {
      const coreStatus = { identity: 'ALIVE', version: '1.0.0', memories: { factCount: 0, episodeCount: 0 }, experiences: { total: 0 } };
      await selfSite.updateStatus({
        system: { running: true },
        connections: { hosts: 1, bodies: 1 },
        core: {
          initialized: coreStatus.initialized,
          memories: coreStatus.memories,
          experiences: coreStatus.experiences
        }
      });
      await selfSite.logActivity('Status updated');
    } catch (err) {
      console.error('[body] Status update error:', err);
    }
  }, 5000);
  
  console.log('[body] Initialization complete');
  console.log(`[body] Self-site available at: ${selfSite.getSitePath()}`);
}

// Start
init().catch(err => {
  console.error('[body] Init failed:', err);
  process.exit(1);
});

// Handle shutdown
process.on('SIGINT', async () => {
  console.log('\n[body] Shutting down...');
  await selfSite.logActivity('ALIVE Body shutting down');
  process.exit(0);
});


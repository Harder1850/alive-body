/**
 * Observation Handler (Core-Integrated)
 * 
 * Routes observations through ALIVE Core for cognitive processing.
 * Core thinks. Body acts. This handler bridges them.
 */

import { ask } from '../adapters/ai/index.js';
import { webRequest, initWebAdapter } from '../adapters/web/index.js';
import core from '../core/index.js';
import * as fs from 'fs/promises';
import * as path from 'path';

// Initialize adapters
const SITES_DIR = process.env.ALIVE_SITES_DIR || './sites';
initWebAdapter({ sitesDir: SITES_DIR });

let coreInitialized = false;

/**
 * Initialize Core with LLM function.
 */
export async function initWithCore() {
  console.log('[handler] Initializing with Core...');
  
  const result = await core.init(ask);
  coreInitialized = true;
  
  console.log('[handler] Core initialized');
  return result;
}

/**
 * Handle an observation.
 */
export async function handleObservation(observation) {
  // Initialize Core on first observation if not done
  if (!coreInitialized) {
    await initWithCore();
  }
  
  const { modality, raw } = observation;
  
  if (modality !== 'text' && modality !== 'voice') {
    return textRender(`[Modality '${modality}' not yet supported]`);
  }
  
  // Detect if this is an action request
  const text = raw.trim().toLowerCase();
  const intent = detectIntent(text);
  
  if (intent !== 'chat') {
    // Actions bypass Core for now (Core thinks, Body acts)
    // But we still log the experience
    console.log(`[handler] Action intent: ${intent}`);
    return await handleAction(intent, raw);
  }
  
  // Route through Core for cognitive processing
  try {
    const decision = await core.process(observation);
    return textRender(decision.response);
  } catch (err) {
    console.error('[handler] Core processing error:', err);
    return textRender(`Error: ${err.message}`);
  }
}

/**
 * Detect action intent.
 */
function detectIntent(text) {
  if (text.includes('build') && (text.includes('website') || text.includes('site'))) {
    return 'build-website';
  }
  if (text.includes('create') && (text.includes('website') || text.includes('site'))) {
    return 'build-website';
  }
  if (text.includes('make') && (text.includes('website') || text.includes('site'))) {
    return 'build-website';
  }
  if (text.includes('list') && (text.includes('site') || text.includes('website'))) {
    return 'list-sites';
  }
  if (text.includes('show') && (text.includes('site') || text.includes('website'))) {
    return 'list-sites';
  }
  if (text.includes('status') || text.includes('who are you') || text.includes('what are you')) {
    return 'status';
  }
  if (text.includes('what do you remember') || text.includes('your memories')) {
    return 'memories';
  }
  
  return 'chat';
}

/**
 * Handle action requests.
 */
async function handleAction(intent, userMessage) {
  switch (intent) {
    case 'build-website':
      return await handleBuildWebsite(userMessage);
    case 'list-sites':
      return await handleListSites();
    case 'status':
      return handleStatus();
    case 'memories':
      return handleMemories();
    default:
      return textRender(`Unknown action: ${intent}`);
  }
}

/**
 * Handle website building.
 */
async function handleBuildWebsite(userMessage) {
  try {
    const planResponse = await ask(userMessage, {
      system: `Extract website details. Respond ONLY with JSON:
{
  "siteId": "kebab-case-id",
  "name": "Site Name",
  "description": "Brief description",
  "heroTitle": "Main headline",
  "heroSubtitle": "Subheadline"
}`
    });
    
    if (!planResponse.success) {
      return textRender(`Failed to plan website: ${planResponse.error}`);
    }
    
    let plan;
    try {
      const jsonMatch = planResponse.content.match(/\{[\s\S]*\}/);
      plan = JSON.parse(jsonMatch ? jsonMatch[0] : planResponse.content);
    } catch (e) {
      return textRender(`Failed to parse website plan.`);
    }
    
    const result = await webRequest({
      operation: 'init',
      siteId: plan.siteId,
      payload: {
        name: plan.name,
        type: 'static',
        template: 'static-landing',
        variables: {
          siteName: plan.name,
          siteDescription: plan.description || '',
          heroTitle: plan.heroTitle || plan.name,
          heroSubtitle: plan.heroSubtitle || plan.description || ''
        }
      }
    });
    
    if (result.success) {
      // Remember this action
      if (coreInitialized) {
        await core.remember(`Created website: ${plan.name} (${plan.siteId})`, 'episode');
      }
      
      return textRender(`✅ Website created: **${plan.name}**

Location: ${SITES_DIR}/${plan.siteId}/index.html

Open it in your browser to see the result.`);
    } else {
      return textRender(`Failed: ${result.error}`);
    }
  } catch (err) {
    return textRender(`Error: ${err.message}`);
  }
}

/**
 * Handle list sites.
 */
async function handleListSites() {
  try {
    await fs.mkdir(SITES_DIR, { recursive: true });
    const entries = await fs.readdir(SITES_DIR, { withFileTypes: true });
    const sites = entries.filter(e => e.isDirectory()).map(e => e.name);
    
    if (sites.length === 0) {
      return textRender(`No websites yet. Say "build a website about [topic]" to create one.`);
    }
    
    return textRender(`**Your websites:**\n${sites.map(s => `- ${s}`).join('\n')}`);
  } catch (err) {
    return textRender(`Error: ${err.message}`);
  }
}

/**
 * Handle status request.
 */
function handleStatus() {
  if (!coreInitialized) {
    return textRender(`ALIVE is running but Core is not yet initialized.`);
  }
  
  const status = core.getStatus();
  
  return textRender(`**I am ${status.identity}** (v${status.version})

${status.wakeUpNarrative}

**Stats:**
- Memories: ${status.memories.factCount} facts, ${status.memories.episodeCount} episodes
- Experiences: ${status.experiences.total} total
- Last active: ${status.experiences.lastActive || 'just now'}`);
}

/**
 * Handle memory request.
 */
function handleMemories() {
  if (!coreInitialized) {
    return textRender(`Core not initialized. No memories yet.`);
  }
  
  const summary = core.getMemorySummary();
  const recent = core.getRecentExperiences(5);
  
  let response = `**My Memories**

Facts: ${summary.factCount}
Episodes: ${summary.episodeCount}
Skills: ${summary.skillCount}

**Recent Experiences:**
`;
  
  for (const exp of recent) {
    response += `- [${exp.type}] ${exp.summary}\n`;
  }
  
  return textRender(response);
}

/**
 * Helper: Create text render.
 */
function textRender(text) {
  return {
    type: 'render',
    canvas: 'text',
    content: { text }
  };
}

export default handleObservation;

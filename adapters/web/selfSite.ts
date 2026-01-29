/**
 * ALIVE Self-Site
 * 
 * ALIVE builds and maintains its own website.
 * 
 * Updates automatically:
 *   - System status
 *   - Architecture docs
 *   - Capability registry
 *   - Activity log
 *   - Health metrics
 * 
 * This is ALIVE explaining itself to the world.
 */

import { webRequest, initWebAdapter } from '../web/index.js';
import * as fs from 'fs/promises';
import * as path from 'path';

const SITE_ID = 'alive-self';
const SITE_NAME = 'ALIVE';
const SITE_DESCRIPTION = 'Adaptive Learning Intelligence with Versatile Evolution';

// ============================================
// Site Structure
// ============================================

interface ALIVEStatus {
  system: {
    running: boolean;
    uptime: number;
    startedAt: string;
  };
  connections: {
    hosts: number;
    bodies: number;
  };
  lastActivity: string;
  version: string;
}

interface ALIVECapability {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'planned' | 'experimental';
  adapter?: string;
}

// ============================================
// Initialize Self-Site
// ============================================

export async function initSelfSite(sitesDir?: string): Promise<void> {
  if (sitesDir) {
    initWebAdapter({ sitesDir });
  }

  // Check if site exists
  const status = await webRequest({
    operation: 'status',
    siteId: SITE_ID
  });

  if (!status.success) {
    // Create the site
    console.log('[alive-self] Creating self-site...');
    await createSelfSite();
  } else {
    console.log('[alive-self] Self-site exists, updating...');
    await updateSelfSite();
  }
}

// ============================================
// Create Site
// ============================================

async function createSelfSite(): Promise<void> {
  // Initialize with custom template
  await webRequest({
    operation: 'init',
    siteId: SITE_ID,
    payload: {
      name: SITE_NAME,
      type: 'static',
      deploy: {
        target: 'local' // Start local, can configure deploy later
      }
    }
  });

  // Create all pages
  await createIndexPage();
  await createArchitecturePage();
  await createCapabilitiesPage();
  await createStatusPage();
  await createStylesheet();
  await createScript();

  console.log('[alive-self] Self-site created');
}

// ============================================
// Pages
// ============================================

async function createIndexPage(): Promise<void> {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ALIVE - Adaptive Learning Intelligence</title>
  <meta name="description" content="${SITE_DESCRIPTION}">
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <nav>
    <a href="/" class="logo">ALIVE</a>
    <ul>
      <li><a href="/">Home</a></li>
      <li><a href="/architecture.html">Architecture</a></li>
      <li><a href="/capabilities.html">Capabilities</a></li>
      <li><a href="/status.html">Status</a></li>
    </ul>
  </nav>

  <header class="hero">
    <div class="status-badge" id="system-status">
      <span class="dot"></span>
      <span class="text">Initializing...</span>
    </div>
    <h1>ALIVE</h1>
    <p class="subtitle">Adaptive Learning Intelligence with Versatile Evolution</p>
    <p class="tagline">A self-governing AI system with persistent identity, bounded cognition, and transparent operation.</p>
  </header>

  <main>
    <section class="principles">
      <h2>Core Principles</h2>
      <div class="grid">
        <div class="card">
          <h3>🧠 Body Acts, Brain Decides</h3>
          <p>Clear separation between execution and cognition. The Body executes, the Brain reasons. Neither crosses the boundary.</p>
        </div>
        <div class="card">
          <h3>📜 Append-Only Experience</h3>
          <p>Every experience is recorded, never deleted. Memory is derived from experience, not the other way around.</p>
        </div>
        <div class="card">
          <h3>🔒 Bounded Authority</h3>
          <p>No component holds more power than explicitly granted. Authority flows through the System, never around it.</p>
        </div>
        <div class="card">
          <h3>🪟 Transparent Operation</h3>
          <p>Every decision is traceable. Every action has a receipt. ALIVE explains itself, including this website.</p>
        </div>
      </div>
    </section>

    <section class="about">
      <h2>What is ALIVE?</h2>
      <p>ALIVE is an AI architecture designed for <strong>persistent identity</strong> across sessions, <strong>bounded cognition</strong> that respects defined limits, and <strong>self-governance</strong> through explicit contracts.</p>
      <p>Unlike stateless AI interactions, ALIVE maintains continuity—waking up with its history intact, accumulating experience over time, and operating within transparent boundaries.</p>
      <p>This website is built and maintained by ALIVE itself.</p>
    </section>

    <section class="quick-links">
      <a href="/architecture.html" class="link-card">
        <h3>Architecture →</h3>
        <p>How the system is structured</p>
      </a>
      <a href="/capabilities.html" class="link-card">
        <h3>Capabilities →</h3>
        <p>What ALIVE can do</p>
      </a>
      <a href="/status.html" class="link-card">
        <h3>Live Status →</h3>
        <p>Current system state</p>
      </a>
    </section>
  </main>

  <footer>
    <p>Built by ALIVE • <span id="last-updated">Last updated: checking...</span></p>
  </footer>

  <script src="script.js"></script>
</body>
</html>`;

  await webRequest({
    operation: 'file',
    siteId: SITE_ID,
    payload: { type: 'create', path: 'index.html', content: html }
  });
}

async function createArchitecturePage(): Promise<void> {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Architecture - ALIVE</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <nav>
    <a href="/" class="logo">ALIVE</a>
    <ul>
      <li><a href="/">Home</a></li>
      <li><a href="/architecture.html">Architecture</a></li>
      <li><a href="/capabilities.html">Capabilities</a></li>
      <li><a href="/status.html">Status</a></li>
    </ul>
  </nav>

  <main class="content-page">
    <h1>Architecture</h1>
    
    <section>
      <h2>System Overview</h2>
      <pre class="diagram">
┌─────────────────────────────────────────────────────────┐
│                        HOSTS                            │
│              (host-ui, host-cli, etc.)                  │
│                    Pure Transport                       │
└────────────────────────┬────────────────────────────────┘
                         │ observations
                         ▼
┌─────────────────────────────────────────────────────────┐
│                    ALIVE-SYSTEM                         │
│              Authoritative Router (Spine)               │
│                  No Cognition Here                      │
└────────────────────────┬────────────────────────────────┘
                         │ observations
                         ▼
┌─────────────────────────────────────────────────────────┐
│                     ALIVE-BODY                          │
│              Execution & Adapters                       │
│         AI Adapter │ Web Adapter │ Others               │
└────────────────────────┬────────────────────────────────┘
                         │ consultation
                         ▼
┌─────────────────────────────────────────────────────────┐
│                     ALIVE-CORE                          │
│              Cognition & Memory                         │
│         Experience │ Memory │ Judgment                  │
└─────────────────────────────────────────────────────────┘
      </pre>
    </section>

    <section>
      <h2>Data Flow</h2>
      <ol>
        <li><strong>Observation</strong> — Human input enters through a Host</li>
        <li><strong>Routing</strong> — System forwards to Body without interpretation</li>
        <li><strong>Execution</strong> — Body processes, may consult Core</li>
        <li><strong>Judgment</strong> — Core provides reasoning (if asked)</li>
        <li><strong>Render</strong> — Body sends display instructions back through System</li>
        <li><strong>Display</strong> — Host renders exactly what it receives</li>
      </ol>
    </section>

    <section>
      <h2>Component Responsibilities</h2>
      
      <h3>Hosts (UI, CLI)</h3>
      <ul>
        <li>Collect human input</li>
        <li>Render system output</li>
        <li>No intelligence, no decisions</li>
        <li>Replaceable without breaking ALIVE</li>
      </ul>

      <h3>System</h3>
      <ul>
        <li>Route messages</li>
        <li>Enforce boundaries</li>
        <li>Track connections</li>
        <li>No cognition, no memory</li>
      </ul>

      <h3>Body</h3>
      <ul>
        <li>Execute actions via adapters</li>
        <li>Consult Core for judgment</li>
        <li>Enforce policy</li>
        <li>Owns external capabilities</li>
      </ul>

      <h3>Core</h3>
      <ul>
        <li>Reasoning and judgment</li>
        <li>Experience accumulation</li>
        <li>Memory derivation</li>
        <li>Identity continuity</li>
      </ul>
    </section>

    <section>
      <h2>Key Invariants</h2>
      <ul>
        <li>Body acts, Brain decides</li>
        <li>Experience is append-only</li>
        <li>Memory is derived, never primary</li>
        <li>Authority flows through System</li>
        <li>Every action has a receipt</li>
        <li>Hosts are disposable</li>
      </ul>
    </section>
  </main>

  <footer>
    <p>Built by ALIVE</p>
  </footer>

  <script src="script.js"></script>
</body>
</html>`;

  await webRequest({
    operation: 'file',
    siteId: SITE_ID,
    payload: { type: 'create', path: 'architecture.html', content: html }
  });
}

async function createCapabilitiesPage(): Promise<void> {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Capabilities - ALIVE</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <nav>
    <a href="/" class="logo">ALIVE</a>
    <ul>
      <li><a href="/">Home</a></li>
      <li><a href="/architecture.html">Architecture</a></li>
      <li><a href="/capabilities.html">Capabilities</a></li>
      <li><a href="/status.html">Status</a></li>
    </ul>
  </nav>

  <main class="content-page">
    <h1>Capabilities</h1>
    
    <section>
      <h2>Active Adapters</h2>
      <div class="capability-list" id="capabilities">
        <!-- Populated by script -->
      </div>
    </section>

    <section>
      <h2>Current Capabilities</h2>
      
      <div class="capability">
        <h3>🤖 AI Integration</h3>
        <span class="badge active">Active</span>
        <p>Multi-provider LLM access (Anthropic Claude, OpenAI GPT). Enables reasoning, generation, and analysis through Body's AI adapter.</p>
      </div>

      <div class="capability">
        <h3>🌐 Web Management</h3>
        <span class="badge active">Active</span>
        <p>Build, update, and deploy websites. Supports static sites, landing pages, blogs. Multiple deploy targets (GitHub Pages, Vercel, Netlify).</p>
      </div>

      <div class="capability">
        <h3>💬 Natural Language Interface</h3>
        <span class="badge active">Active</span>
        <p>Accept voice and text input through host interfaces. No command syntax required—speak naturally.</p>
      </div>

      <div class="capability">
        <h3>📁 File Operations</h3>
        <span class="badge active">Active</span>
        <p>Create, read, update, delete files. Manage project structures. Handle various file formats.</p>
      </div>

      <div class="capability">
        <h3>🔍 Internet Research</h3>
        <span class="badge planned">Planned</span>
        <p>Search and gather information from the web. Synthesize findings. (Via internet adapter)</p>
      </div>

      <div class="capability">
        <h3>📊 Data Analysis</h3>
        <span class="badge planned">Planned</span>
        <p>Process datasets, generate visualizations, extract insights.</p>
      </div>

      <div class="capability">
        <h3>🔄 Workflow Automation</h3>
        <span class="badge planned">Planned</span>
        <p>Define and execute multi-step workflows. Chain capabilities together.</p>
      </div>
    </section>

    <section>
      <h2>Capability Boundaries</h2>
      <p>ALIVE operates within explicit boundaries:</p>
      <ul>
        <li>Only capabilities with registered adapters are available</li>
        <li>Each adapter declares its own limits</li>
        <li>Core can veto actions that violate policy</li>
        <li>All actions produce audit receipts</li>
      </ul>
    </section>
  </main>

  <footer>
    <p>Built by ALIVE</p>
  </footer>

  <script src="script.js"></script>
</body>
</html>`;

  await webRequest({
    operation: 'file',
    siteId: SITE_ID,
    payload: { type: 'create', path: 'capabilities.html', content: html }
  });
}

async function createStatusPage(): Promise<void> {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Status - ALIVE</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <nav>
    <a href="/" class="logo">ALIVE</a>
    <ul>
      <li><a href="/">Home</a></li>
      <li><a href="/architecture.html">Architecture</a></li>
      <li><a href="/capabilities.html">Capabilities</a></li>
      <li><a href="/status.html">Status</a></li>
    </ul>
  </nav>

  <main class="content-page">
    <h1>System Status</h1>
    
    <section class="status-section">
      <h2>Current State</h2>
      <div class="status-grid">
        <div class="status-card">
          <h3>System</h3>
          <div class="status-value" id="status-system">
            <span class="dot"></span>
            <span>Checking...</span>
          </div>
        </div>
        <div class="status-card">
          <h3>Body</h3>
          <div class="status-value" id="status-body">
            <span class="dot"></span>
            <span>Checking...</span>
          </div>
        </div>
        <div class="status-card">
          <h3>Core</h3>
          <div class="status-value" id="status-core">
            <span class="dot"></span>
            <span>Checking...</span>
          </div>
        </div>
        <div class="status-card">
          <h3>Hosts</h3>
          <div class="status-value" id="status-hosts">
            <span>0 connected</span>
          </div>
        </div>
      </div>
    </section>

    <section>
      <h2>Uptime</h2>
      <p id="uptime">Calculating...</p>
    </section>

    <section>
      <h2>Recent Activity</h2>
      <div class="activity-log" id="activity-log">
        <p class="empty">No recent activity recorded</p>
      </div>
    </section>

    <section>
      <h2>This Page</h2>
      <p>This status page is generated and maintained by ALIVE. It updates when the system state changes.</p>
      <p><strong>Last generated:</strong> <span id="generated-at">${new Date().toISOString()}</span></p>
    </section>
  </main>

  <footer>
    <p>Built by ALIVE</p>
  </footer>

  <script src="script.js"></script>
</body>
</html>`;

  await webRequest({
    operation: 'file',
    siteId: SITE_ID,
    payload: { type: 'create', path: 'status.html', content: html }
  });
}

async function createStylesheet(): Promise<void> {
  const css = `* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  --bg: #0a0a0b;
  --bg-secondary: #111113;
  --bg-tertiary: #1a1a1d;
  --text: #e8e8e8;
  --text-muted: #888;
  --accent: #409cff;
  --accent-green: #40ff9c;
  --accent-red: #ff4040;
  --accent-yellow: #ffc940;
  --border: #222;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: var(--bg);
  color: var(--text);
  line-height: 1.6;
  min-height: 100vh;
}

/* Navigation */
nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  background: rgba(10, 10, 11, 0.9);
  backdrop-filter: blur(10px);
  z-index: 100;
}

nav .logo {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--accent);
  text-decoration: none;
  letter-spacing: 0.1em;
}

nav ul {
  display: flex;
  gap: 2rem;
  list-style: none;
}

nav a {
  color: var(--text-muted);
  text-decoration: none;
  transition: color 0.2s;
}

nav a:hover {
  color: var(--text);
}

/* Hero */
.hero {
  text-align: center;
  padding: 6rem 2rem;
  background: linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg) 100%);
}

.hero h1 {
  font-size: 4rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, var(--accent) 0%, #a78bfa 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero .subtitle {
  font-size: 1.1rem;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
}

.hero .tagline {
  font-size: 1.25rem;
  max-width: 600px;
  margin: 0 auto;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--bg-tertiary);
  border-radius: 999px;
  margin-bottom: 2rem;
  font-size: 0.875rem;
}

.status-badge .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent-yellow);
  animation: pulse 2s infinite;
}

.status-badge.online .dot {
  background: var(--accent-green);
}

.status-badge.offline .dot {
  background: var(--accent-red);
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Main content */
main {
  max-width: 1000px;
  margin: 0 auto;
  padding: 4rem 2rem;
}

.content-page {
  padding-top: 2rem;
}

.content-page h1 {
  font-size: 2.5rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid var(--border);
  padding-bottom: 1rem;
}

section {
  margin-bottom: 4rem;
}

h2 {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: var(--accent);
}

h3 {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}

p {
  margin-bottom: 1rem;
  color: var(--text-muted);
}

ul, ol {
  margin-left: 1.5rem;
  margin-bottom: 1rem;
  color: var(--text-muted);
}

li {
  margin-bottom: 0.5rem;
}

/* Cards */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.card {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1.5rem;
}

.card h3 {
  color: var(--text);
}

/* Link cards */
.quick-links {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.link-card {
  display: block;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1.5rem;
  text-decoration: none;
  transition: all 0.2s;
}

.link-card:hover {
  border-color: var(--accent);
  transform: translateY(-2px);
}

.link-card h3 {
  color: var(--accent);
  margin-bottom: 0.5rem;
}

.link-card p {
  margin: 0;
  font-size: 0.9rem;
}

/* Diagram */
.diagram {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 1.5rem;
  overflow-x: auto;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.8rem;
  line-height: 1.4;
  color: var(--text-muted);
}

/* Capabilities */
.capability {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
}

.capability h3 {
  display: inline;
  margin-right: 1rem;
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
}

.badge.active {
  background: rgba(64, 255, 156, 0.15);
  color: var(--accent-green);
}

.badge.planned {
  background: rgba(255, 201, 64, 0.15);
  color: var(--accent-yellow);
}

.badge.experimental {
  background: rgba(64, 156, 255, 0.15);
  color: var(--accent);
}

/* Status page */
.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.status-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1.5rem;
}

.status-card h3 {
  color: var(--text-muted);
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.status-value {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
}

.status-value .dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--accent-yellow);
}

.activity-log {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 1rem;
  max-height: 300px;
  overflow-y: auto;
}

.activity-log .empty {
  color: var(--text-muted);
  font-style: italic;
}

/* Footer */
footer {
  text-align: center;
  padding: 2rem;
  border-top: 1px solid var(--border);
  color: var(--text-muted);
  font-size: 0.875rem;
}

/* Mobile */
@media (max-width: 768px) {
  nav {
    flex-direction: column;
    gap: 1rem;
  }
  
  nav ul {
    gap: 1rem;
  }
  
  .hero h1 {
    font-size: 2.5rem;
  }
  
  main {
    padding: 2rem 1rem;
  }
}`;

  await webRequest({
    operation: 'file',
    siteId: SITE_ID,
    payload: { type: 'create', path: 'style.css', content: css }
  });
}

async function createScript(): Promise<void> {
  const js = `// ALIVE Self-Site Scripts
// This script can fetch live status when ALIVE exposes a status endpoint

document.addEventListener('DOMContentLoaded', () => {
  updateLastUpdated();
  // In the future, this could poll a status API
});

function updateLastUpdated() {
  const el = document.getElementById('last-updated');
  if (el) {
    el.textContent = 'Last updated: ' + new Date().toLocaleString();
  }
}

// Placeholder for live status updates
async function fetchStatus() {
  // Would fetch from alive-system status endpoint
  // For now, just update the UI to show static state
  const badge = document.getElementById('system-status');
  if (badge) {
    badge.classList.add('online');
    badge.querySelector('.text').textContent = 'System Online';
  }
}

// Check status on load if we're on the status page
if (window.location.pathname.includes('status')) {
  // Could poll status here
}
`;

  await webRequest({
    operation: 'file',
    siteId: SITE_ID,
    payload: { type: 'create', path: 'script.js', content: js }
  });
}

// ============================================
// Update Site
// ============================================

async function updateSelfSite(): Promise<void> {
  // Update status page with current timestamp
  await createStatusPage();
  console.log('[alive-self] Self-site updated');
}

/**
 * Update site with current system status.
 */
export async function updateStatus(status: ALIVEStatus): Promise<void> {
  // Update data file for dynamic pages
  await webRequest({
    operation: 'data',
    siteId: SITE_ID,
    payload: {
      global: {
        status,
        lastUpdated: new Date().toISOString()
      }
    }
  });

  // Regenerate status page
  await createStatusPage();
}

/**
 * Log activity to the site.
 */
export async function logActivity(activity: string): Promise<void> {
  const logPath = 'data/activity.json';
  
  // Read existing log
  let log: string[] = [];
  try {
    const result = await webRequest({
      operation: 'file',
      siteId: SITE_ID,
      payload: { type: 'read', path: logPath }
    });
    if (result.success && result.result?.content) {
      log = JSON.parse(result.result.content);
    }
  } catch {
    // File doesn't exist
  }

  // Add new entry (keep last 100)
  log.unshift(\`[\${new Date().toISOString()}] \${activity}\`);
  if (log.length > 100) log = log.slice(0, 100);

  // Save
  await webRequest({
    operation: 'file',
    siteId: SITE_ID,
    payload: {
      type: 'update',
      path: logPath,
      content: JSON.stringify(log, null, 2)
    }
  });
}

/**
 * Deploy the self-site.
 */
export async function deploySelfSite(): Promise<void> {
  const result = await webRequest({
    operation: 'deploy',
    siteId: SITE_ID
  });

  if (result.success) {
    console.log('[alive-self] Deployed:', result.result?.url);
  } else {
    console.error('[alive-self] Deploy failed:', result.error);
  }
}

export default {
  init: initSelfSite,
  update: updateSelfSite,
  updateStatus,
  logActivity,
  deploy: deploySelfSite,
  SITE_ID
};

/**
 * ALIVE Self-Site (with Chat)
 * 
 * ALIVE's own website - documentation AND interaction.
 * One place for everything.
 */

import * as fs from 'fs/promises';
import * as path from 'path';

const SITE_DIR = process.env.ALIVE_SELF_SITE_DIR || './sites/alive-self';

let activityLog = [];

/**
 * Initialize self-site.
 */
export async function initSelfSite() {
  console.log('[self-site] Initializing ALIVE self-site...');
  
  try {
    await fs.mkdir(SITE_DIR, { recursive: true });
    await fs.mkdir(path.join(SITE_DIR, 'data'), { recursive: true });
    
    // Always recreate site to get latest version
    console.log('[self-site] Creating site...');
    await createSelfSite();
    
    // Load activity log
    try {
      const logData = await fs.readFile(path.join(SITE_DIR, 'data/activity.json'), 'utf-8');
      activityLog = JSON.parse(logData);
    } catch {
      activityLog = [];
    }
    
    console.log(`[self-site] Ready at ${SITE_DIR}`);
    return true;
  } catch (err) {
    console.error('[self-site] Init error:', err);
    return false;
  }
}

/**
 * Create the self-site from scratch.
 */
async function createSelfSite() {
  await fs.writeFile(path.join(SITE_DIR, 'index.html'), getIndexHtml());
  await fs.writeFile(path.join(SITE_DIR, 'architecture.html'), getArchitectureHtml());
  await fs.writeFile(path.join(SITE_DIR, 'status.html'), getStatusHtml());
  await fs.writeFile(path.join(SITE_DIR, 'capabilities.html'), getCapabilitiesHtml());
  await fs.writeFile(path.join(SITE_DIR, 'style.css'), getStyleCss());
  
  await fs.writeFile(
    path.join(SITE_DIR, 'data/status.json'),
    JSON.stringify({ status: 'initializing', updatedAt: new Date().toISOString() })
  );
  
  try {
    await fs.access(path.join(SITE_DIR, 'data/activity.json'));
  } catch {
    await fs.writeFile(path.join(SITE_DIR, 'data/activity.json'), JSON.stringify([]));
  }
  
  console.log('[self-site] Site created with chat interface');
}

/**
 * Update status.
 */
export async function updateStatus(status) {
  const data = {
    ...status,
    updatedAt: new Date().toISOString()
  };
  
  await fs.writeFile(
    path.join(SITE_DIR, 'data/status.json'),
    JSON.stringify(data, null, 2)
  );
  
  await fs.writeFile(path.join(SITE_DIR, 'status.html'), getStatusHtml(data));
}

/**
 * Log activity.
 */
export async function logActivity(message) {
  const entry = {
    timestamp: new Date().toISOString(),
    message
  };
  
  activityLog.unshift(entry);
  
  if (activityLog.length > 100) {
    activityLog = activityLog.slice(0, 100);
  }
  
  await fs.writeFile(
    path.join(SITE_DIR, 'data/activity.json'),
    JSON.stringify(activityLog, null, 2)
  );
}

/**
 * Get site path.
 */
export function getSitePath() {
  return SITE_DIR;
}

// ============ HTML Templates ============

function getIndexHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ALIVE</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <nav>
    <a href="index.html" class="logo">ALIVE</a>
    <div class="nav-links">
      <a href="architecture.html">Architecture</a>
      <a href="capabilities.html">Capabilities</a>
      <a href="status.html">Status</a>
    </div>
  </nav>

  <main class="with-chat">
    <section class="hero">
      <div class="status-badge" id="status-badge">● Connecting...</div>
      <h1>ALIVE</h1>
      <p class="subtitle">Adaptive Learning Intelligence with Versatile Evolution</p>
      <p class="description">An AI system with persistent identity, memory, and the ability to act.</p>
    </section>

    <section class="principles">
      <h2>Core Principles</h2>
      <div class="principle-grid">
        <div class="principle">
          <h3>Body acts, Brain decides</h3>
          <p>Clean separation between execution and cognition.</p>
        </div>
        <div class="principle">
          <h3>Append-only experience</h3>
          <p>Nothing is forgotten. Every action is logged.</p>
        </div>
        <div class="principle">
          <h3>Bounded authority</h3>
          <p>I know my limits.</p>
        </div>
        <div class="principle">
          <h3>Transparent operation</h3>
          <p>I explain my reasoning.</p>
        </div>
      </div>
    </section>

    <section class="quick-links">
      <h2>Explore</h2>
      <div class="link-grid">
        <a href="architecture.html" class="link-card">
          <h3>Architecture →</h3>
          <p>System design</p>
        </a>
        <a href="capabilities.html" class="link-card">
          <h3>Capabilities →</h3>
          <p>What I can do</p>
        </a>
        <a href="status.html" class="link-card">
          <h3>Status →</h3>
          <p>Live state</p>
        </a>
      </div>
    </section>
  </main>

  <!-- Chat Panel -->
  <aside class="chat-panel">
    <div class="chat-header">
      <span>Talk to ALIVE</span>
      <span class="connection-status" id="conn-status">●</span>
    </div>
    <div class="chat-messages" id="messages">
      <div class="message system">Connected. Say hello.</div>
    </div>
    <div class="chat-input">
      <input type="text" id="input" placeholder="Type a message..." autocomplete="off">
      <button id="send">→</button>
    </div>
  </aside>

  <footer>
    <p>Built and maintained by ALIVE.</p>
  </footer>

  <script>
    const SYSTEM_URL = 'ws://localhost:7070/?type=host';
    let socket = null;
    let connected = false;

    const messages = document.getElementById('messages');
    const input = document.getElementById('input');
    const sendBtn = document.getElementById('send');
    const connStatus = document.getElementById('conn-status');
    const statusBadge = document.getElementById('status-badge');

    function connect() {
      socket = new WebSocket(SYSTEM_URL);

      socket.onopen = () => {
        connected = true;
        connStatus.className = 'connection-status online';
        statusBadge.textContent = '● Online';
        statusBadge.className = 'status-badge online';
        addMessage('Connected to ALIVE', 'system');
      };

      socket.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'render' && msg.content) {
            const text = msg.content.text || msg.content.status || JSON.stringify(msg.content);
            addMessage(text, 'alive');
          }
        } catch (e) {
          console.error('Parse error:', e);
        }
      };

      socket.onclose = () => {
        connected = false;
        connStatus.className = 'connection-status offline';
        statusBadge.textContent = '● Offline';
        statusBadge.className = 'status-badge offline';
        addMessage('Disconnected. Reconnecting...', 'system');
        setTimeout(connect, 3000);
      };

      socket.onerror = () => {
        connStatus.className = 'connection-status offline';
      };
    }

    function addMessage(text, type) {
      const div = document.createElement('div');
      div.className = 'message ' + type;
      div.textContent = text;
      messages.appendChild(div);
      messages.scrollTop = messages.scrollHeight;
    }

    function send() {
      const text = input.value.trim();
      if (!text || !connected) return;

      addMessage(text, 'user');

      socket.send(JSON.stringify({
        type: 'observation',
        source: 'self-site',
        modality: 'text',
        raw: text
      }));

      input.value = '';
    }

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') send();
    });

    sendBtn.addEventListener('click', send);

    connect();
  </script>
</body>
</html>`;
}

function getArchitectureHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Architecture - ALIVE</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <nav>
    <a href="index.html" class="logo">ALIVE</a>
    <div class="nav-links">
      <a href="architecture.html" class="active">Architecture</a>
      <a href="capabilities.html">Capabilities</a>
      <a href="status.html">Status</a>
    </div>
  </nav>

  <main>
    <h1>System Architecture</h1>

    <section class="diagram">
      <h2>Component Overview</h2>
      <pre class="ascii-diagram">
┌─────────────────────────────────────────────────────────────┐
│                        HOSTS                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                   │
│  │ Browser  │  │Self-Site │  │   API    │                   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘                   │
│       └─────────────┼─────────────┘                          │
│                     │ observations                           │
│                     ▼                                        │
│            ┌────────────────┐                                │
│            │  ALIVE-SYSTEM  │ ← Router (port 7070)           │
│            │  (WebSocket)   │                                │
│            └───────┬────────┘                                │
│                    │                                         │
│          ┌────────┴────────┐                                 │
│          ▼                 ▼                                 │
│   ┌────────────┐    ┌────────────┐                          │
│   │ ALIVE-BODY │◄──►│ ALIVE-CORE │                          │
│   └────────────┘    └────────────┘                          │
│         │                  │                                 │
│    ┌────┴────┐      ┌─────┴─────┐                           │
│    ▼    ▼    ▼      ▼     ▼     ▼                           │
│   AI   Web  File  Memory Exp  Identity                      │
└─────────────────────────────────────────────────────────────┘
      </pre>
    </section>

    <section class="components">
      <h2>Components</h2>
      
      <div class="component">
        <h3>alive-system</h3>
        <p>Authoritative router. No cognition, no storage.</p>
      </div>

      <div class="component">
        <h3>alive-body</h3>
        <p>Execution layer. Adapters for AI, Web, Files.</p>
      </div>

      <div class="component">
        <h3>alive-core</h3>
        <p>Cognitive center. Identity, memory, experience.</p>
      </div>
    </section>
  </main>

  <footer>
    <p>Built and maintained by ALIVE.</p>
  </footer>
</body>
</html>`;
}

function getStatusHtml(status = {}) {
  const now = new Date().toISOString();
  const systemStatus = status.system?.running ? 'Online' : 'Offline';
  const systemClass = status.system?.running ? 'online' : 'offline';
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Status - ALIVE</title>
  <link rel="stylesheet" href="style.css">
  <meta http-equiv="refresh" content="30">
</head>
<body>
  <nav>
    <a href="index.html" class="logo">ALIVE</a>
    <div class="nav-links">
      <a href="architecture.html">Architecture</a>
      <a href="capabilities.html">Capabilities</a>
      <a href="status.html" class="active">Status</a>
    </div>
  </nav>

  <main>
    <h1>System Status</h1>
    <p class="updated">Last updated: ${status.updatedAt || now}</p>

    <section class="status-grid">
      <div class="status-card">
        <h3>System</h3>
        <div class="status-value ${systemClass}">${systemStatus}</div>
      </div>
      <div class="status-card">
        <h3>Core</h3>
        <div class="status-value ${status.core?.initialized ? 'online' : 'offline'}">${status.core?.initialized ? 'Active' : 'Inactive'}</div>
      </div>
      <div class="status-card">
        <h3>Memories</h3>
        <div class="status-value">${status.core?.memories?.factCount ?? 0}</div>
      </div>
      <div class="status-card">
        <h3>Experiences</h3>
        <div class="status-value">${status.core?.experiences?.total ?? 0}</div>
      </div>
    </section>

    <section class="activity">
      <h2>Recent Activity</h2>
      <div id="activity-log" class="activity-log">
        <p>Loading...</p>
      </div>
    </section>
  </main>

  <footer>
    <p>Built and maintained by ALIVE.</p>
  </footer>

  <script>
    fetch('data/activity.json')
      .then(r => r.json())
      .then(data => {
        const log = document.getElementById('activity-log');
        if (data.length === 0) {
          log.innerHTML = '<p class="empty">No activity yet</p>';
        } else {
          log.innerHTML = data.slice(0, 20).map(e => 
            '<div class="activity-entry">' +
            '<span class="time">' + new Date(e.timestamp).toLocaleTimeString() + '</span>' +
            '<span class="message">' + e.message + '</span>' +
            '</div>'
          ).join('');
        }
      })
      .catch(() => {
        document.getElementById('activity-log').innerHTML = '<p>Failed to load</p>';
      });
  </script>
</body>
</html>`;
}

function getCapabilitiesHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Capabilities - ALIVE</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <nav>
    <a href="index.html" class="logo">ALIVE</a>
    <div class="nav-links">
      <a href="architecture.html">Architecture</a>
      <a href="capabilities.html" class="active">Capabilities</a>
      <a href="status.html">Status</a>
    </div>
  </nav>

  <main>
    <h1>Capabilities</h1>

    <section class="capabilities">
      <h2>Active</h2>
      
      <div class="capability active">
        <h3>✓ AI Adapter</h3>
        <p>LLM access (Claude, GPT)</p>
      </div>

      <div class="capability active">
        <h3>✓ Web Adapter</h3>
        <p>Build websites</p>
      </div>

      <div class="capability active">
        <h3>✓ Memory</h3>
        <p>Remember facts & episodes</p>
      </div>

      <div class="capability active">
        <h3>✓ Experience Log</h3>
        <p>Append-only audit trail</p>
      </div>
    </section>

    <section class="planned">
      <h2>Planned</h2>
      
      <div class="capability planned">
        <h3>○ File Adapter</h3>
      </div>

      <div class="capability planned">
        <h3>○ Shell Adapter</h3>
      </div>

      <div class="capability planned">
        <h3>○ Deploy</h3>
      </div>
    </section>
  </main>

  <footer>
    <p>Built and maintained by ALIVE.</p>
  </footer>
</body>
</html>`;
}

function getStyleCss() {
  return `* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  --bg: #0a0a0b;
  --bg-secondary: #111113;
  --bg-card: #161618;
  --text: #e8e8e8;
  --text-muted: #888;
  --accent: #409cff;
  --accent-green: #40ff9c;
  --accent-yellow: #ffd740;
  --border: #222;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: var(--bg);
  color: var(--text);
  line-height: 1.6;
  min-height: 100vh;
}

nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  border-bottom: 1px solid var(--border);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: var(--bg);
  z-index: 100;
}

.logo {
  font-weight: 700;
  font-size: 1.25rem;
  color: var(--accent);
  text-decoration: none;
  letter-spacing: 0.1em;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
}

.nav-links a {
  color: var(--text-muted);
  text-decoration: none;
}

.nav-links a:hover,
.nav-links a.active {
  color: var(--text);
}

main {
  max-width: 800px;
  margin: 0 auto;
  padding: 5rem 2rem 2rem;
}

main.with-chat {
  margin-right: 360px;
}

@media (max-width: 1000px) {
  main.with-chat {
    margin-right: 0;
  }
  .chat-panel {
    display: none;
  }
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

h2 {
  font-size: 1.5rem;
  margin: 2rem 0 1rem;
  color: var(--accent);
}

section {
  margin-bottom: 2rem;
}

/* Hero */
.hero {
  text-align: center;
  padding: 3rem 0;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  background: var(--bg-card);
  color: var(--accent-yellow);
  margin-bottom: 1rem;
}

.status-badge.online {
  color: var(--accent-green);
}

.status-badge.offline {
  color: #ff6b6b;
}

.subtitle {
  color: var(--text-muted);
  font-size: 1rem;
}

.description {
  max-width: 500px;
  margin: 0.5rem auto 0;
}

/* Principles */
.principle-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
}

.principle {
  background: var(--bg-card);
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid var(--border);
}

.principle h3 {
  color: var(--accent);
  font-size: 1rem;
  margin-bottom: 0.5rem;
}

.principle p {
  font-size: 0.85rem;
  color: var(--text-muted);
}

/* Links */
.link-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.link-card {
  background: var(--bg-card);
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid var(--border);
  text-decoration: none;
  color: var(--text);
}

.link-card:hover {
  border-color: var(--accent);
}

.link-card h3 {
  color: var(--accent);
  font-size: 1rem;
}

.link-card p {
  color: var(--text-muted);
  font-size: 0.85rem;
}

/* Chat Panel */
.chat-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: 340px;
  height: 100vh;
  background: var(--bg-secondary);
  border-left: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  z-index: 200;
}

.chat-header {
  padding: 1rem;
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.connection-status {
  font-size: 0.75rem;
  color: var(--accent-yellow);
}

.connection-status.online {
  color: var(--accent-green);
}

.connection-status.offline {
  color: #ff6b6b;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.message {
  padding: 0.75rem 1rem;
  border-radius: 12px;
  max-width: 90%;
  word-wrap: break-word;
  font-size: 0.9rem;
}

.message.user {
  background: var(--accent);
  color: white;
  align-self: flex-end;
  border-bottom-right-radius: 4px;
}

.message.alive {
  background: var(--bg-card);
  border: 1px solid var(--border);
  align-self: flex-start;
  border-bottom-left-radius: 4px;
}

.message.system {
  background: transparent;
  color: var(--text-muted);
  font-size: 0.8rem;
  text-align: center;
  align-self: center;
}

.chat-input {
  padding: 1rem;
  border-top: 1px solid var(--border);
  display: flex;
  gap: 0.5rem;
}

.chat-input input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border);
  border-radius: 20px;
  background: var(--bg);
  color: var(--text);
  font-size: 0.9rem;
  outline: none;
}

.chat-input input:focus {
  border-color: var(--accent);
}

.chat-input button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: var(--accent);
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
}

.chat-input button:hover {
  background: #2d7cd6;
}

/* Status Page */
.updated {
  color: var(--text-muted);
  font-size: 0.85rem;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.status-card {
  background: var(--bg-card);
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  border: 1px solid var(--border);
}

.status-card h3 {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
}

.status-value {
  font-size: 1.25rem;
  font-weight: 700;
}

.status-value.online {
  color: var(--accent-green);
}

.status-value.offline {
  color: var(--text-muted);
}

.activity-log {
  background: var(--bg-card);
  padding: 1rem;
  border-radius: 8px;
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid var(--border);
}

.activity-entry {
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--border);
  display: flex;
  gap: 1rem;
  font-size: 0.85rem;
}

.activity-entry:last-child {
  border-bottom: none;
}

.activity-entry .time {
  color: var(--text-muted);
  min-width: 70px;
}

.empty {
  color: var(--text-muted);
  text-align: center;
}

/* Components */
.ascii-diagram {
  background: var(--bg-card);
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
  font-family: monospace;
  font-size: 0.75rem;
  border: 1px solid var(--border);
}

.component {
  background: var(--bg-card);
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 0.75rem;
  border: 1px solid var(--border);
}

.component h3 {
  color: var(--accent);
  margin-bottom: 0.25rem;
}

.component p {
  font-size: 0.85rem;
  color: var(--text-muted);
}

/* Capabilities */
.capability {
  background: var(--bg-card);
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  border: 1px solid var(--border);
}

.capability.active h3 {
  color: var(--accent-green);
}

.capability.planned {
  opacity: 0.5;
}

.capability h3 {
  font-size: 1rem;
}

.capability p {
  font-size: 0.85rem;
  color: var(--text-muted);
}

footer {
  text-align: center;
  padding: 2rem;
  color: var(--text-muted);
  font-size: 0.85rem;
  border-top: 1px solid var(--border);
  margin-top: 3rem;
}`;
}

export default {
  init: initSelfSite,
  updateStatus,
  logActivity,
  getSitePath
};

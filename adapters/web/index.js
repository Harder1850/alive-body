/**
 * Web Adapter (JavaScript version)
 * 
 * Website building and maintenance for alive-body.
 * User defines scope. ALIVE executes.
 */

import * as fs from 'fs/promises';
import * as path from 'path';

let sitesDir = './sites';

// Site registry
const sites = new Map();

/**
 * Initialize the web adapter.
 */
export function initWebAdapter(config) {
  if (config?.sitesDir) {
    sitesDir = config.sitesDir;
  }
  console.log(`[web-adapter] Initialized. Sites: ${sitesDir}`);
}

/**
 * Process a web request.
 */
export async function webRequest(request) {
  const timestamp = new Date().toISOString();
  
  try {
    switch (request.operation) {
      case 'init':
        return await initSite(request.siteId, request.payload, timestamp);
      case 'page':
        return await updatePage(request.siteId, request.payload, timestamp);
      case 'file':
        return await fileOperation(request.siteId, request.payload, timestamp);
      case 'status':
        return await getSiteStatus(request.siteId, timestamp);
      case 'list':
        return await listSites(timestamp);
      default:
        return {
          success: false,
          operation: request.operation,
          siteId: request.siteId,
          error: `Unknown operation: ${request.operation}`,
          timestamp
        };
    }
  } catch (err) {
    return {
      success: false,
      operation: request.operation,
      siteId: request.siteId,
      error: err.message,
      timestamp
    };
  }
}

/**
 * Initialize a new site.
 */
async function initSite(siteId, payload, timestamp) {
  const sitePath = path.join(sitesDir, siteId);
  
  // Check if exists
  try {
    await fs.access(sitePath);
    return {
      success: false,
      operation: 'init',
      siteId,
      error: 'Site already exists',
      timestamp
    };
  } catch {
    // Doesn't exist, good
  }
  
  // Create directory
  await fs.mkdir(sitePath, { recursive: true });
  
  // Apply template
  const template = payload.template || 'static-landing';
  const vars = payload.variables || {};
  
  if (template === 'static-landing') {
    await createLandingPage(sitePath, vars);
  } else if (template === 'static-basic') {
    await createBasicSite(sitePath, vars);
  }
  
  // Save config
  const config = {
    id: siteId,
    name: payload.name,
    type: payload.type || 'static',
    createdAt: timestamp
  };
  
  await fs.writeFile(
    path.join(sitePath, 'site.config.json'),
    JSON.stringify(config, null, 2)
  );
  
  sites.set(siteId, config);
  
  return {
    success: true,
    operation: 'init',
    siteId,
    result: { path: sitePath, config },
    timestamp
  };
}

/**
 * Create a landing page site.
 */
async function createLandingPage(sitePath, vars) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${vars.siteName || 'My Site'}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --primary: #2563eb;
      --text: #1f2937;
      --bg: #ffffff;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: var(--text);
      line-height: 1.6;
    }
    header {
      padding: 1rem 2rem;
      position: fixed;
      width: 100%;
      background: rgba(255,255,255,0.95);
      backdrop-filter: blur(10px);
      z-index: 100;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .logo {
      font-weight: 700;
      font-size: 1.5rem;
      color: var(--primary);
    }
    .cta-btn {
      background: var(--primary);
      color: white;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 500;
    }
    .cta-btn:hover { background: #1d4ed8; }
    .hero {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      padding: 2rem;
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
    }
    .hero h1 {
      font-size: 3.5rem;
      margin-bottom: 1rem;
      max-width: 800px;
    }
    .hero p {
      font-size: 1.25rem;
      color: #4b5563;
      margin-bottom: 2rem;
      max-width: 600px;
    }
    .features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      padding: 6rem 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    .feature {
      padding: 2rem;
      border-radius: 12px;
      background: #f9fafb;
    }
    .feature h3 { margin-bottom: 0.5rem; color: var(--primary); }
    footer {
      padding: 3rem 2rem;
      text-align: center;
      background: #f9fafb;
      color: #6b7280;
    }
    @media (max-width: 768px) {
      .hero h1 { font-size: 2.5rem; }
    }
  </style>
</head>
<body>
  <header>
    <span class="logo">${vars.siteName || 'My Site'}</span>
    <a href="${vars.ctaLink || '#'}" class="cta-btn">${vars.ctaText || 'Get Started'}</a>
  </header>

  <section class="hero">
    <h1>${vars.heroTitle || vars.siteName || 'Welcome'}</h1>
    <p>${vars.heroSubtitle || vars.siteDescription || 'Your amazing project starts here.'}</p>
    <a href="${vars.ctaLink || '#'}" class="cta-btn">${vars.ctaText || 'Get Started'}</a>
  </section>

  <section class="features">
    <div class="feature">
      <h3>Feature One</h3>
      <p>Description of the first amazing feature of your project.</p>
    </div>
    <div class="feature">
      <h3>Feature Two</h3>
      <p>Description of the second amazing feature of your project.</p>
    </div>
    <div class="feature">
      <h3>Feature Three</h3>
      <p>Description of the third amazing feature of your project.</p>
    </div>
  </section>

  <footer>
    <p>&copy; ${new Date().getFullYear()} ${vars.siteName || 'My Site'}. All rights reserved.</p>
  </footer>
</body>
</html>`;

  await fs.writeFile(path.join(sitePath, 'index.html'), html);
}

/**
 * Create a basic multi-page site.
 */
async function createBasicSite(sitePath, vars) {
  // Create index
  await createLandingPage(sitePath, vars);
  
  // Create about page
  const about = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>About - ${vars.siteName || 'My Site'}</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>About ${vars.siteName || 'Us'}</h1>
  <p>${vars.siteDescription || 'Learn more about our project.'}</p>
  <a href="index.html">Back to Home</a>
</body>
</html>`;

  await fs.writeFile(path.join(sitePath, 'about.html'), about);
}

/**
 * Update a page.
 */
async function updatePage(siteId, payload, timestamp) {
  const sitePath = path.join(sitesDir, siteId);
  const filePath = path.join(sitePath, payload.path);
  
  await fs.writeFile(filePath, payload.content, 'utf-8');
  
  return {
    success: true,
    operation: 'page',
    siteId,
    result: { path: payload.path },
    timestamp
  };
}

/**
 * File operation.
 */
async function fileOperation(siteId, op, timestamp) {
  const sitePath = path.join(sitesDir, siteId);
  const fullPath = path.join(sitePath, op.path);
  
  switch (op.type) {
    case 'create':
    case 'update':
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.writeFile(fullPath, op.content || '', 'utf-8');
      return { success: true, operation: 'file', siteId, result: { path: op.path }, timestamp };
      
    case 'read':
      const content = await fs.readFile(fullPath, 'utf-8');
      return { success: true, operation: 'file', siteId, result: { path: op.path, content }, timestamp };
      
    case 'delete':
      await fs.unlink(fullPath);
      return { success: true, operation: 'file', siteId, result: { path: op.path }, timestamp };
      
    default:
      return { success: false, operation: 'file', siteId, error: `Unknown op: ${op.type}`, timestamp };
  }
}

/**
 * Get site status.
 */
async function getSiteStatus(siteId, timestamp) {
  const sitePath = path.join(sitesDir, siteId);
  
  try {
    const configPath = path.join(sitePath, 'site.config.json');
    const config = JSON.parse(await fs.readFile(configPath, 'utf-8'));
    
    return {
      success: true,
      operation: 'status',
      siteId,
      result: { config, path: sitePath },
      timestamp
    };
  } catch (err) {
    return {
      success: false,
      operation: 'status',
      siteId,
      error: 'Site not found',
      timestamp
    };
  }
}

/**
 * List all sites.
 */
async function listSites(timestamp) {
  try {
    await fs.mkdir(sitesDir, { recursive: true });
    const entries = await fs.readdir(sitesDir, { withFileTypes: true });
    const siteIds = entries.filter(e => e.isDirectory()).map(e => e.name);
    
    return {
      success: true,
      operation: 'list',
      result: { sites: siteIds },
      timestamp
    };
  } catch (err) {
    return {
      success: false,
      operation: 'list',
      error: err.message,
      timestamp
    };
  }
}

export default {
  init: initWebAdapter,
  request: webRequest
};

/**
 * WEB ADAPTER (Body → Website Management)
 *
 * Responsibilities:
 * - Initialize sites from templates
 * - Manage site files (CRUD)
 * - Handle deployments
 * - Bind host data to pages
 *
 * Prohibitions:
 * - No content decisions
 * - No design choices
 * - No SEO optimization
 * - No analytics
 *
 * Body owns adapters. User defines scope.
 */

import * as path from 'path';
import * as fs from 'fs/promises';
import {
  SiteConfig,
  SiteData,
  PageData,
  AssetData,
  WebRequest,
  WebResponse,
  FileOperation
} from './webTypes.js';
import fileManager from './fileManager.js';
import templateManager from './templateManager.js';
import deployManager from './deployManager.js';

// Site registry (in-memory, could be persisted)
const sites: Map<string, SiteConfig> = new Map();

// Base directory for all sites
let sitesBaseDir = process.env.ALIVE_SITES_DIR || './sites';

/**
 * Initialize the web adapter.
 */
export function initWebAdapter(config?: { sitesDir?: string }): void {
  if (config?.sitesDir) {
    sitesBaseDir = config.sitesDir;
  }
  console.log(`[web-adapter] Initialized. Sites directory: ${sitesBaseDir}`);
}

/**
 * Process a web request.
 */
export async function webRequest(request: WebRequest): Promise<WebResponse> {
  const timestamp = new Date().toISOString();
  
  try {
    switch (request.operation) {
      case 'init':
        return await initSite(request.siteId, request.payload, timestamp);
      case 'build':
        return await buildSite(request.siteId, timestamp);
      case 'deploy':
        return await deploySite(request.siteId, timestamp);
      case 'page':
        return await updatePage(request.siteId, request.payload, timestamp);
      case 'asset':
        return await updateAsset(request.siteId, request.payload, timestamp);
      case 'file':
        return await fileOperation(request.siteId, request.payload, timestamp);
      case 'data':
        return await updateSiteData(request.siteId, request.payload, timestamp);
      case 'preview':
        return await startPreview(request.siteId, timestamp);
      case 'status':
        return await getSiteStatus(request.siteId, timestamp);
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
      error: err instanceof Error ? err.message : 'Unknown error',
      timestamp
    };
  }
}

/**
 * Initialize a new site.
 */
async function initSite(
  siteId: string,
  payload: {
    name: string;
    type: SiteConfig['type'];
    template?: string;
    variables?: Record<string, string>;
    deploy?: SiteConfig['deploy'];
  },
  timestamp: string
): Promise<WebResponse> {
  const sitePath = path.join(sitesBaseDir, siteId);
  
  // Check if site already exists
  if (sites.has(siteId) || await fileManager.exists(sitePath)) {
    return {
      success: false,
      operation: 'init',
      siteId,
      error: 'Site already exists',
      timestamp
    };
  }
  
  // Create site directory
  await fileManager.ensureDir(sitePath);
  
  // Apply template if specified
  if (payload.template) {
    const template = templateManager.getTemplate(payload.template);
    if (template) {
      for (const file of template.files) {
        const content = templateManager.applyVariables(
          file.content,
          payload.variables || {}
        );
        await fileManager.executeFileOp(sitePath, {
          type: 'create',
          path: file.path,
          content
        });
      }
    }
  }
  
  // Create site config
  const config: SiteConfig = {
    id: siteId,
    name: payload.name,
    type: payload.type,
    localPath: sitePath,
    deploy: payload.deploy
  };
  
  sites.set(siteId, config);
  
  // Save config to disk
  await fs.writeFile(
    path.join(sitePath, 'site.config.json'),
    JSON.stringify(config, null, 2)
  );
  
  return {
    success: true,
    operation: 'init',
    siteId,
    result: { path: sitePath, config },
    timestamp
  };
}

/**
 * Build the site (for sites with build steps).
 */
async function buildSite(siteId: string, timestamp: string): Promise<WebResponse> {
  const site = sites.get(siteId);
  if (!site) {
    return {
      success: false,
      operation: 'build',
      siteId,
      error: 'Site not found',
      timestamp
    };
  }
  
  // For static sites, no build needed
  if (site.type === 'static') {
    return {
      success: true,
      operation: 'build',
      siteId,
      result: { message: 'Static site, no build required' },
      timestamp
    };
  }
  
  // For framework sites, run build command
  if (site.framework?.buildCommand) {
    try {
      const { exec } = await import('child_process');
      const { promisify } = await import('util');
      const execAsync = promisify(exec);
      
      await execAsync(site.framework.buildCommand, { cwd: site.localPath });
      
      return {
        success: true,
        operation: 'build',
        siteId,
        result: { message: 'Build completed' },
        timestamp
      };
    } catch (err) {
      return {
        success: false,
        operation: 'build',
        siteId,
        error: err instanceof Error ? err.message : 'Build failed',
        timestamp
      };
    }
  }
  
  return {
    success: true,
    operation: 'build',
    siteId,
    result: { message: 'No build configuration' },
    timestamp
  };
}

/**
 * Deploy the site.
 */
async function deploySite(siteId: string, timestamp: string): Promise<WebResponse> {
  const site = sites.get(siteId);
  if (!site) {
    return {
      success: false,
      operation: 'deploy',
      siteId,
      error: 'Site not found',
      timestamp
    };
  }
  
  if (!site.deploy) {
    return {
      success: false,
      operation: 'deploy',
      siteId,
      error: 'No deploy configuration',
      timestamp
    };
  }
  
  const result = await deployManager.deploy(site.localPath, site.deploy);
  
  return {
    success: result.success,
    operation: 'deploy',
    siteId,
    result,
    error: result.error,
    timestamp
  };
}

/**
 * Add or update a page.
 */
async function updatePage(
  siteId: string,
  page: PageData,
  timestamp: string
): Promise<WebResponse> {
  const site = sites.get(siteId);
  if (!site) {
    return {
      success: false,
      operation: 'page',
      siteId,
      error: 'Site not found',
      timestamp
    };
  }
  
  // Determine file path and content based on format
  let filePath: string;
  let content: string;
  
  if (page.format === 'markdown') {
    filePath = page.path.endsWith('.md') ? page.path : `${page.path}.md`;
    // Add frontmatter
    content = `---
title: ${page.title}
${page.meta ? Object.entries(page.meta).map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join('\n') : ''}
---

${page.content}`;
  } else if (page.format === 'html') {
    filePath = page.path.endsWith('.html') ? page.path : `${page.path}.html`;
    content = page.content;
  } else {
    // Template format - needs template processing
    filePath = page.path.endsWith('.html') ? page.path : `${page.path}.html`;
    content = templateManager.applyVariables(
      page.content,
      page.data || {}
    );
  }
  
  const result = await fileManager.executeFileOp(site.localPath, {
    type: 'update',
    path: filePath,
    content
  });
  
  return {
    success: result.success,
    operation: 'page',
    siteId,
    result: { path: filePath },
    error: result.error,
    timestamp
  };
}

/**
 * Add or update an asset.
 */
async function updateAsset(
  siteId: string,
  asset: AssetData,
  timestamp: string
): Promise<WebResponse> {
  const site = sites.get(siteId);
  if (!site) {
    return {
      success: false,
      operation: 'asset',
      siteId,
      error: 'Site not found',
      timestamp
    };
  }
  
  let content: string | Buffer;
  
  // Handle different source types
  if (asset.source.startsWith('data:')) {
    // Base64 data URL
    const match = asset.source.match(/^data:[^;]+;base64,(.+)$/);
    if (match) {
      content = Buffer.from(match[1], 'base64').toString('binary');
    } else {
      return {
        success: false,
        operation: 'asset',
        siteId,
        error: 'Invalid data URL',
        timestamp
      };
    }
  } else if (asset.source.startsWith('http')) {
    // URL - would need to fetch
    return {
      success: false,
      operation: 'asset',
      siteId,
      error: 'URL asset sources not yet implemented',
      timestamp
    };
  } else {
    // Raw content
    content = asset.source;
  }
  
  const result = await fileManager.executeFileOp(site.localPath, {
    type: 'update',
    path: asset.path,
    content: content as string
  });
  
  return {
    success: result.success,
    operation: 'asset',
    siteId,
    result: { path: asset.path },
    error: result.error,
    timestamp
  };
}

/**
 * Direct file operation.
 */
async function fileOperation(
  siteId: string,
  op: FileOperation,
  timestamp: string
): Promise<WebResponse> {
  const site = sites.get(siteId);
  if (!site) {
    return {
      success: false,
      operation: 'file',
      siteId,
      error: 'Site not found',
      timestamp
    };
  }
  
  const result = await fileManager.executeFileOp(site.localPath, op);
  
  return {
    success: result.success,
    operation: 'file',
    siteId,
    result,
    error: result.error,
    timestamp
  };
}

/**
 * Update site data (for data binding).
 */
async function updateSiteData(
  siteId: string,
  data: Partial<SiteData>,
  timestamp: string
): Promise<WebResponse> {
  const site = sites.get(siteId);
  if (!site) {
    return {
      success: false,
      operation: 'data',
      siteId,
      error: 'Site not found',
      timestamp
    };
  }
  
  // Load existing data
  const dataPath = path.join(site.localPath, 'site.data.json');
  let existingData: SiteData = { global: { name: site.name }, pages: {} };
  
  try {
    const content = await fs.readFile(dataPath, 'utf-8');
    existingData = JSON.parse(content);
  } catch {
    // File doesn't exist yet
  }
  
  // Merge data
  const newData: SiteData = {
    global: { ...existingData.global, ...data.global },
    pages: { ...existingData.pages, ...data.pages }
  };
  
  // Save
  await fs.writeFile(dataPath, JSON.stringify(newData, null, 2));
  
  return {
    success: true,
    operation: 'data',
    siteId,
    result: { data: newData },
    timestamp
  };
}

/**
 * Start preview server.
 */
async function startPreview(siteId: string, timestamp: string): Promise<WebResponse> {
  const site = sites.get(siteId);
  if (!site) {
    return {
      success: false,
      operation: 'preview',
      siteId,
      error: 'Site not found',
      timestamp
    };
  }
  
  // For static sites, could start a simple HTTP server
  // For framework sites, run dev command
  
  return {
    success: false,
    operation: 'preview',
    siteId,
    error: 'Preview not yet implemented',
    timestamp
  };
}

/**
 * Get site status.
 */
async function getSiteStatus(siteId: string, timestamp: string): Promise<WebResponse> {
  const site = sites.get(siteId);
  if (!site) {
    return {
      success: false,
      operation: 'status',
      siteId,
      error: 'Site not found',
      timestamp
    };
  }
  
  const files = await fileManager.listFiles(site.localPath);
  
  return {
    success: true,
    operation: 'status',
    siteId,
    result: {
      config: site,
      fileCount: files.length,
      files: files.slice(0, 50) // Limit to first 50
    },
    timestamp
  };
}

/**
 * Load existing sites from disk.
 */
export async function loadSites(): Promise<void> {
  try {
    const entries = await fs.readdir(sitesBaseDir, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const configPath = path.join(sitesBaseDir, entry.name, 'site.config.json');
        try {
          const content = await fs.readFile(configPath, 'utf-8');
          const config = JSON.parse(content) as SiteConfig;
          sites.set(config.id, config);
          console.log(`[web-adapter] Loaded site: ${config.id}`);
        } catch {
          // No config file, skip
        }
      }
    }
  } catch {
    // Sites directory doesn't exist yet
  }
}

/**
 * List all sites.
 */
export function listSites(): SiteConfig[] {
  return Array.from(sites.values());
}

/**
 * Get site by ID.
 */
export function getSite(siteId: string): SiteConfig | undefined {
  return sites.get(siteId);
}

export default {
  init: initWebAdapter,
  request: webRequest,
  loadSites,
  listSites,
  getSite,
  templates: templateManager
};

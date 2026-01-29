/**
 * Web Adapter Types
 * 
 * Flexible website building and maintenance.
 * Body owns adapters. Scope defined by user.
 */

// ============================================
// Site Configuration
// ============================================

export type SiteType = 
  | 'static'      // Plain HTML/CSS/JS
  | 'markdown'    // Markdown → HTML
  | 'react'       // React SPA
  | 'next'        // Next.js
  | 'hugo'        // Hugo static site
  | 'custom';     // User-defined

export type DeployTarget =
  | 'local'       // Generate files only
  | 'github'      // GitHub Pages
  | 'vercel'      // Vercel
  | 'netlify'     // Netlify
  | 'ftp'         // FTP/SFTP
  | 'custom';     // User-defined

export interface SiteConfig {
  /** Unique site identifier */
  id: string;
  
  /** Human-readable name */
  name: string;
  
  /** Site type */
  type: SiteType;
  
  /** Local directory for site files */
  localPath: string;
  
  /** Deployment configuration */
  deploy?: DeployConfig;
  
  /** Template/framework settings */
  framework?: FrameworkConfig;
  
  /** Custom metadata */
  meta?: Record<string, any>;
}

export interface DeployConfig {
  target: DeployTarget;
  
  // GitHub Pages
  repo?: string;
  branch?: string;
  
  // Vercel/Netlify
  projectId?: string;
  apiToken?: string;
  
  // FTP
  host?: string;
  username?: string;
  password?: string;
  remotePath?: string;
  
  // Custom
  customHandler?: string;
}

export interface FrameworkConfig {
  /** Build command */
  buildCommand?: string;
  
  /** Output directory after build */
  outputDir?: string;
  
  /** Dev server command */
  devCommand?: string;
  
  /** Package manager */
  packageManager?: 'npm' | 'yarn' | 'pnpm';
}

// ============================================
// File Operations
// ============================================

export interface FileOperation {
  type: 'create' | 'read' | 'update' | 'delete' | 'rename' | 'move';
  path: string;
  content?: string;
  newPath?: string;  // For rename/move
}

export interface FileResult {
  success: boolean;
  path: string;
  content?: string;
  error?: string;
}

// ============================================
// Page/Content Models
// ============================================

export interface PageData {
  /** Page path (e.g., '/about', '/projects/wind') */
  path: string;
  
  /** Page title */
  title: string;
  
  /** Page content (HTML, markdown, or template) */
  content: string;
  
  /** Content format */
  format: 'html' | 'markdown' | 'template';
  
  /** Template to use (if format is 'template') */
  template?: string;
  
  /** Data to inject into template */
  data?: Record<string, any>;
  
  /** Page metadata */
  meta?: {
    description?: string;
    keywords?: string[];
    ogImage?: string;
    [key: string]: any;
  };
}

export interface AssetData {
  /** Asset path */
  path: string;
  
  /** Asset type */
  type: 'image' | 'document' | 'video' | 'audio' | 'font' | 'other';
  
  /** Source (URL or base64) */
  source: string;
  
  /** Alt text (for images) */
  alt?: string;
}

export interface SiteData {
  /** Global site data */
  global: {
    name: string;
    description?: string;
    logo?: string;
    navigation?: NavItem[];
    footer?: Record<string, any>;
    [key: string]: any;
  };
  
  /** Page-specific data */
  pages: Record<string, Record<string, any>>;
}

export interface NavItem {
  label: string;
  path: string;
  children?: NavItem[];
}

// ============================================
// Requests & Responses
// ============================================

export interface WebRequest {
  /** Operation type */
  operation: 
    | 'init'        // Initialize new site
    | 'build'       // Build site
    | 'deploy'      // Deploy site
    | 'page'        // Add/update page
    | 'asset'       // Add/update asset
    | 'file'        // Direct file operation
    | 'data'        // Update site data
    | 'preview'     // Start dev server
    | 'status';     // Get site status
  
  /** Site ID */
  siteId: string;
  
  /** Operation-specific payload */
  payload?: any;
}

export interface WebResponse {
  success: boolean;
  operation: string;
  siteId: string;
  result?: any;
  error?: string;
  timestamp: string;
}

// ============================================
// Templates
// ============================================

export interface TemplateDefinition {
  id: string;
  name: string;
  type: SiteType;
  description: string;
  files: { path: string; content: string }[];
  variables: string[];
}

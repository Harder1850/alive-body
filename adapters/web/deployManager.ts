/**
 * Deploy Manager
 * 
 * Handles deployment to various targets.
 * Transport only. No deployment decisions.
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import { DeployConfig, DeployTarget } from './webTypes.js';
import { exists } from './fileManager.js';

const execAsync = promisify(exec);

export interface DeployResult {
  success: boolean;
  target: DeployTarget;
  url?: string;
  message?: string;
  error?: string;
}

/**
 * Deploy site to configured target.
 */
export async function deploy(
  sitePath: string,
  config: DeployConfig
): Promise<DeployResult> {
  switch (config.target) {
    case 'local':
      return deployLocal(sitePath);
    case 'github':
      return deployGitHub(sitePath, config);
    case 'vercel':
      return deployVercel(sitePath, config);
    case 'netlify':
      return deployNetlify(sitePath, config);
    case 'ftp':
      return deployFTP(sitePath, config);
    default:
      return {
        success: false,
        target: config.target,
        error: `Unsupported deploy target: ${config.target}`
      };
  }
}

/**
 * Local deployment (no-op, files already exist).
 */
async function deployLocal(sitePath: string): Promise<DeployResult> {
  const pathExists = await exists(sitePath);
  
  if (!pathExists) {
    return {
      success: false,
      target: 'local',
      error: `Site path does not exist: ${sitePath}`
    };
  }
  
  return {
    success: true,
    target: 'local',
    url: `file://${path.resolve(sitePath)}`,
    message: 'Site available locally'
  };
}

/**
 * GitHub Pages deployment via git.
 */
async function deployGitHub(
  sitePath: string,
  config: DeployConfig
): Promise<DeployResult> {
  if (!config.repo) {
    return {
      success: false,
      target: 'github',
      error: 'GitHub repo not configured'
    };
  }
  
  const branch = config.branch || 'gh-pages';
  
  try {
    // Initialize git if needed
    const gitExists = await exists(path.join(sitePath, '.git'));
    if (!gitExists) {
      await execAsync('git init', { cwd: sitePath });
      await execAsync(`git remote add origin ${config.repo}`, { cwd: sitePath });
    }
    
    // Commit and push
    await execAsync('git add -A', { cwd: sitePath });
    await execAsync('git commit -m "Deploy site" --allow-empty', { cwd: sitePath });
    await execAsync(`git push -f origin HEAD:${branch}`, { cwd: sitePath });
    
    // Extract username/repo for URL
    const match = config.repo.match(/github\.com[:/]([^/]+)\/([^/.]+)/);
    const url = match 
      ? `https://${match[1]}.github.io/${match[2]}/`
      : config.repo;
    
    return {
      success: true,
      target: 'github',
      url,
      message: `Deployed to ${branch} branch`
    };
  } catch (err) {
    return {
      success: false,
      target: 'github',
      error: err instanceof Error ? err.message : 'Git deployment failed'
    };
  }
}

/**
 * Vercel deployment via CLI.
 */
async function deployVercel(
  sitePath: string,
  config: DeployConfig
): Promise<DeployResult> {
  try {
    // Check if Vercel CLI is available
    await execAsync('vercel --version');
    
    // Deploy
    const tokenArg = config.apiToken ? `--token ${config.apiToken}` : '';
    const { stdout } = await execAsync(
      `vercel --yes --prod ${tokenArg}`,
      { cwd: sitePath }
    );
    
    // Extract URL from output
    const urlMatch = stdout.match(/https:\/\/[^\s]+/);
    
    return {
      success: true,
      target: 'vercel',
      url: urlMatch?.[0],
      message: 'Deployed to Vercel'
    };
  } catch (err) {
    return {
      success: false,
      target: 'vercel',
      error: err instanceof Error ? err.message : 'Vercel deployment failed'
    };
  }
}

/**
 * Netlify deployment via CLI.
 */
async function deployNetlify(
  sitePath: string,
  config: DeployConfig
): Promise<DeployResult> {
  try {
    // Check if Netlify CLI is available
    await execAsync('netlify --version');
    
    // Deploy
    const tokenArg = config.apiToken ? `--auth ${config.apiToken}` : '';
    const siteArg = config.projectId ? `--site ${config.projectId}` : '';
    const { stdout } = await execAsync(
      `netlify deploy --prod --dir . ${tokenArg} ${siteArg}`,
      { cwd: sitePath }
    );
    
    // Extract URL from output
    const urlMatch = stdout.match(/https:\/\/[^\s]+/);
    
    return {
      success: true,
      target: 'netlify',
      url: urlMatch?.[0],
      message: 'Deployed to Netlify'
    };
  } catch (err) {
    return {
      success: false,
      target: 'netlify',
      error: err instanceof Error ? err.message : 'Netlify deployment failed'
    };
  }
}

/**
 * FTP/SFTP deployment.
 */
async function deployFTP(
  sitePath: string,
  config: DeployConfig
): Promise<DeployResult> {
  // FTP deployment requires additional setup
  // This is a placeholder that would use something like basic-ftp
  
  if (!config.host || !config.username || !config.password) {
    return {
      success: false,
      target: 'ftp',
      error: 'FTP credentials not configured (host, username, password required)'
    };
  }
  
  return {
    success: false,
    target: 'ftp',
    error: 'FTP deployment not yet implemented. Install basic-ftp and configure.'
  };
}

/**
 * Get deployment status/info.
 */
export async function getDeployStatus(
  sitePath: string,
  config: DeployConfig
): Promise<{ deployed: boolean; url?: string; lastDeploy?: string }> {
  // This would check deployment status based on target
  // For now, return basic info
  return {
    deployed: false,
    url: undefined,
    lastDeploy: undefined
  };
}

export default {
  deploy,
  getDeployStatus
};

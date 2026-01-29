/**
 * File Manager
 * 
 * CRUD operations for site files.
 * Transport only. No content decisions.
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { FileOperation, FileResult } from './webTypes.js';

/**
 * Execute a file operation.
 */
export async function executeFileOp(
  basePath: string,
  op: FileOperation
): Promise<FileResult> {
  const fullPath = path.join(basePath, op.path);
  
  try {
    switch (op.type) {
      case 'create':
      case 'update':
        await ensureDir(path.dirname(fullPath));
        await fs.writeFile(fullPath, op.content || '', 'utf-8');
        return { success: true, path: op.path };
        
      case 'read':
        const content = await fs.readFile(fullPath, 'utf-8');
        return { success: true, path: op.path, content };
        
      case 'delete':
        await fs.unlink(fullPath);
        return { success: true, path: op.path };
        
      case 'rename':
      case 'move':
        if (!op.newPath) {
          return { success: false, path: op.path, error: 'newPath required' };
        }
        const newFullPath = path.join(basePath, op.newPath);
        await ensureDir(path.dirname(newFullPath));
        await fs.rename(fullPath, newFullPath);
        return { success: true, path: op.newPath };
        
      default:
        return { success: false, path: op.path, error: `Unknown operation: ${op.type}` };
    }
  } catch (err) {
    return {
      success: false,
      path: op.path,
      error: err instanceof Error ? err.message : 'Unknown error'
    };
  }
}

/**
 * Execute multiple file operations.
 */
export async function executeFileOps(
  basePath: string,
  ops: FileOperation[]
): Promise<FileResult[]> {
  const results: FileResult[] = [];
  for (const op of ops) {
    results.push(await executeFileOp(basePath, op));
  }
  return results;
}

/**
 * List files in directory.
 */
export async function listFiles(
  basePath: string,
  subPath: string = '',
  recursive: boolean = true
): Promise<string[]> {
  const fullPath = path.join(basePath, subPath);
  const files: string[] = [];
  
  try {
    const entries = await fs.readdir(fullPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const entryPath = path.join(subPath, entry.name);
      
      if (entry.isDirectory()) {
        if (recursive) {
          const subFiles = await listFiles(basePath, entryPath, true);
          files.push(...subFiles);
        }
      } else {
        files.push(entryPath);
      }
    }
  } catch (err) {
    // Directory doesn't exist
  }
  
  return files;
}

/**
 * Check if path exists.
 */
export async function exists(fullPath: string): Promise<boolean> {
  try {
    await fs.access(fullPath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Ensure directory exists.
 */
export async function ensureDir(dirPath: string): Promise<void> {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (err) {
    // Ignore if already exists
  }
}

/**
 * Copy directory recursively.
 */
export async function copyDir(src: string, dest: string): Promise<void> {
  await ensureDir(dest);
  const entries = await fs.readdir(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

/**
 * Delete directory recursively.
 */
export async function removeDir(dirPath: string): Promise<void> {
  try {
    await fs.rm(dirPath, { recursive: true, force: true });
  } catch (err) {
    // Ignore errors
  }
}

export default {
  executeFileOp,
  executeFileOps,
  listFiles,
  exists,
  ensureDir,
  copyDir,
  removeDir
};

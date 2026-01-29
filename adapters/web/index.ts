/**
 * Web Adapter - Public API
 */

export * from './webTypes.js';
export {
  initWebAdapter,
  webRequest,
  loadSites,
  listSites,
  getSite
} from './webAdapter.js';

export { getTemplate, listTemplates, applyVariables } from './templateManager.js';
export { deploy, getDeployStatus } from './deployManager.js';
export {
  executeFileOp,
  executeFileOps,
  listFiles,
  exists,
  ensureDir
} from './fileManager.js';

import adapter from './webAdapter.js';
export default adapter;

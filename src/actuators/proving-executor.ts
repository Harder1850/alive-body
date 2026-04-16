/**
 * Proving Executor — alive-body
 *
 * Executes the proving-scenario action types that go beyond the two constitution
 * action types (display_text, write_file).  This module is the ONLY place in
 * alive-body that knows about proving-scenario action names.
 *
 * Rules:
 *   - This executor is called ONLY by alive-runtime after whitelist approval.
 *   - It does NOT decide what to do — it executes what runtime already approved.
 *   - All writes go to alive-web/ (sandbox).
 *   - git_status_check is always read-only (--short flag, no network, no write).
 *   - cleanup_temp is scoped to alive-web/tmp/ only.
 *   - No constitution or runtime source files may be touched.
 *
 * Takes primitive arguments only (strings/arrays) — never imports from runtime or mind.
 */

import { execSync } from 'child_process';
import { existsSync, readdirSync, rmSync } from 'fs';
import { join } from 'path';
import { writeWebFile } from '../tools/file-manager';

// ── Types ─────────────────────────────────────────────────────────────────────

export type ProvingActionType =
  | 'git_status_check'
  | 'notify'
  | 'monitor'
  | 'cleanup_temp'
  | 'safe_file_edit'
  | 'safe_command_run'
  | 'recommend'
  | 'ignore';

export interface ProvingExecutionResult {
  action_type: ProvingActionType;
  success: boolean;
  output: string;
  artifact_path?: string;
  executed: boolean;   // false = recommendation recorded, nothing ran
}

// ── Path constants ─────────────────────────────────────────────────────────────

import { resolve as resolvePath } from 'path';

// Navigate from alive-body/src/actuators/ up to alive-repos/ then into alive-runtime/
// Each sub-repo has its own .git; alive-runtime is the primary demo target.
const ALIVE_REPOS_ROOT   = resolvePath(__dirname, '../../..');  // alive-repos/
const ALIVE_RUNTIME_ROOT = resolvePath(__dirname, '../../../alive-runtime');
const ALIVE_WEB_TMP      = resolvePath(__dirname, '../../../alive-web/tmp');

// ── Main dispatcher ───────────────────────────────────────────────────────────

/**
 * Execute an approved proving-scenario action.
 * @param actionType  The whitelisted action type to execute.
 * @param rationale   Human-readable reason (for logging and artifact content).
 * @param supportRefs Signal IDs and memory refs that informed this decision.
 */
export function executeProvingAction(
  actionType: ProvingActionType,
  rationale: string,
  supportRefs: string[],
): ProvingExecutionResult {
  switch (actionType) {
    case 'git_status_check':
      return runGitStatus(rationale, supportRefs);

    case 'notify':
      return runNotify(rationale);

    case 'monitor':
      return runMonitor(rationale);

    case 'cleanup_temp':
      return runCleanupTemp(rationale);

    case 'recommend':
    case 'safe_file_edit':
    case 'safe_command_run':
      // These are recommendation-only in the standard whitelist path.
      // If runtime calls us here it means the demo-path guard already cleared them.
      return runRecommendationRecord(actionType, rationale, supportRefs);

    case 'ignore':
      return {
        action_type: actionType,
        success: true,
        output: 'Signal below salience threshold — no action taken.',
        executed: false,
      };

    default:
      return {
        action_type: actionType as ProvingActionType,
        success: false,
        output: `Unknown proving action type: ${actionType}`,
        executed: false,
      };
  }
}

// ── Handlers ──────────────────────────────────────────────────────────────────

function runGitStatus(rationale: string, supportRefs: string[]): ProvingExecutionResult {
  try {
    const raw = execSync('git status --short', {
      cwd: ALIVE_RUNTIME_ROOT,
      timeout: 5_000,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    const lines = raw.split('\n').filter(Boolean);
    const ts    = new Date().toISOString();
    const refs  = supportRefs.length > 0 ? `\n# support_refs: ${supportRefs.slice(0, 3).join(', ')}` : '';

    const content =
      `# ALIVE git status — ${ts}\n` +
      `# rationale: ${rationale}\n` +
      refs + '\n\n' +
      (lines.length > 0
        ? lines.join('\n')
        : '(clean working tree — no uncommitted changes)') +
      '\n';

    const writeResult = writeWebFile('git-status.log', content);

    const summary = lines.length > 0
      ? `${lines.length} changed file${lines.length === 1 ? '' : 's'} detected`
      : 'clean working tree';

    return {
      action_type: 'git_status_check',
      success: writeResult.success,
      output: writeResult.success
        ? `git status: ${summary} → written to alive-web/git-status.log`
        : `git status ran (${summary}) but artifact write failed: ${writeResult.error}`,
      artifact_path: writeResult.path,
      executed: true,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      action_type: 'git_status_check',
      success: false,
      output: `git status failed: ${msg}`,
      executed: true,
    };
  }
}

function runNotify(rationale: string): ProvingExecutionResult {
  const ts  = new Date().toISOString();
  const msg = `[ALIVE notify ${ts}] ${rationale}`;
  console.log(msg);

  // Also persist to alive-web/ so Studio can see it
  const content = `${msg}\n`;
  const result  = writeWebFile('notifications.log', content);

  return {
    action_type: 'notify',
    success: true,
    output: msg,
    artifact_path: result.path,
    executed: true,
  };
}

function runMonitor(rationale: string): ProvingExecutionResult {
  // Passive — just log that we registered the monitoring intent
  const ts      = new Date().toISOString();
  const content = `[ALIVE monitor ${ts}] ${rationale}\n`;
  const result  = writeWebFile('monitor-log.txt', content);

  return {
    action_type: 'monitor',
    success: true,
    output: `Monitoring registered: ${rationale}`,
    artifact_path: result.path,
    executed: true,
  };
}

function runCleanupTemp(rationale: string): ProvingExecutionResult {
  const ts = new Date().toISOString();

  // Scope strictly: only alive-web/tmp/
  let cleaned = 0;
  if (existsSync(ALIVE_WEB_TMP)) {
    try {
      const files = readdirSync(ALIVE_WEB_TMP);
      for (const f of files) {
        rmSync(join(ALIVE_WEB_TMP, f), { recursive: true, force: true });
        cleaned++;
      }
    } catch {
      // Non-fatal — log and continue
    }
  }

  const content =
    `[ALIVE cleanup_temp ${ts}]\n` +
    `rationale: ${rationale}\n` +
    `scope: alive-web/tmp/ only\n` +
    `files_removed: ${cleaned}\n`;

  const result = writeWebFile('cleanup-log.txt', content);

  return {
    action_type: 'cleanup_temp',
    success: result.success,
    output: `Temp cleanup complete: ${cleaned} file(s) removed from alive-web/tmp/`,
    artifact_path: result.path,
    executed: true,
  };
}

function runRecommendationRecord(
  actionType: ProvingActionType,
  rationale: string,
  supportRefs: string[],
): ProvingExecutionResult {
  const ts      = new Date().toISOString();
  const refs    = supportRefs.slice(0, 3).join(', ');
  const content =
    `[ALIVE recommendation ${ts}]\n` +
    `action_type: ${actionType}\n` +
    `rationale: ${rationale}\n` +
    `support_refs: ${refs}\n`;

  const result = writeWebFile('recommendations.log', content);

  return {
    action_type: actionType,
    success: result.success,
    output: `Recommendation recorded: ${actionType} — ${rationale.slice(0, 100)}`,
    artifact_path: result.path,
    executed: false,
  };
}

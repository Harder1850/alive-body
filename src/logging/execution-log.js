"use strict";
/**
 * Experience Stream — alive-body
 * alive-body/src/logging/execution-log.ts
 *
 * Append-only, immutable record of every signal, STG decision,
 * action executed, and outcome observed.
 *
 * Rules (v16 §7B.5):
 *   - Append-only. No edits. No deletions. No retroactive changes.
 *   - STG decisions are written verbatim as passed by runtime.
 *     Body does NOT infer or synthesize them.
 *   - alive-mind does NOT write to this stream.
 *   - Every write is a single JSON line (JSONL format).
 *
 * File location: alive-body/logs/experience-stream.jsonl
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.appendToExperienceStream = appendToExperienceStream;
exports.logSignalReceived = logSignalReceived;
exports.logStgDecision = logStgDecision;
exports.logActionDispatched = logActionDispatched;
exports.logActionOutcome = logActionOutcome;
exports.logCycleComplete = logCycleComplete;
exports.getExperienceStreamPath = getExperienceStreamPath;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// ─── Log path ─────────────────────────────────────────────────────────────────
const LOG_DIR = path.resolve(__dirname, '../../logs');
const LOG_FILE = path.join(LOG_DIR, 'experience-stream.jsonl');
function ensureLogDir() {
    if (!fs.existsSync(LOG_DIR)) {
        fs.mkdirSync(LOG_DIR, { recursive: true });
    }
}
// ─── Core append ─────────────────────────────────────────────────────────────
function appendToExperienceStream(entry) {
    try {
        ensureLogDir();
        const line = JSON.stringify(entry) + '\n';
        fs.appendFileSync(LOG_FILE, line, { encoding: 'utf8', flag: 'a' });
    }
    catch (err) {
        console.error('[EXPERIENCE STREAM] Write failed:', err);
    }
}
// ─── Helpers ─────────────────────────────────────────────────────────────────
function logSignalReceived(signalId, 
// eslint-disable-next-line @typescript-eslint/no-explicit-any
signalData) {
    appendToExperienceStream({ kind: 'signal_received', timestamp: Date.now(), signal_id: signalId, data: signalData });
}
function logStgDecision(signalId, verdict, reason, 
// eslint-disable-next-line @typescript-eslint/no-explicit-any
context) {
    appendToExperienceStream({ kind: 'stg_decision', timestamp: Date.now(), signal_id: signalId, data: { verdict, reason, ...context } });
}
function logActionDispatched(signalId, decisionId, actionType, 
// eslint-disable-next-line @typescript-eslint/no-explicit-any
payload) {
    appendToExperienceStream({ kind: 'action_dispatched', timestamp: Date.now(), signal_id: signalId, data: { decision_id: decisionId, action_type: actionType, payload } });
}
function logActionOutcome(signalId, decisionId, success, detail) {
    appendToExperienceStream({ kind: 'action_outcome', timestamp: Date.now(), signal_id: signalId, data: { decision_id: decisionId, success, detail } });
}
function logCycleComplete(signalId, 
// eslint-disable-next-line @typescript-eslint/no-explicit-any
record) {
    appendToExperienceStream({ kind: 'cycle_complete', timestamp: Date.now(), signal_id: signalId, data: record });
}
function getExperienceStreamPath() {
    return LOG_FILE;
}

import fs from "fs";
import crypto from "crypto";
import { actionRegistry } from "./action-registry.js";

function loadJSON<T>(path: string): T {
  return JSON.parse(fs.readFileSync(path, "utf-8"));
}

function assertKillSwitch() {
  const kill = loadJSON<{ enabled: boolean }>("phase-32/kill-switch.json");
  if (!kill.enabled) {
    throw new Error("Kill switch engaged. Execution blocked.");
  }
}

function classifyBlockReason(err: unknown):
  | "expired_authority"
  | "kill_switch"
  | "invalid_authority"
  | "invalid_action" {
  const msg = err instanceof Error ? err.message : String(err);
  if (/kill switch/i.test(msg)) return "kill_switch";
  if (/expired/i.test(msg)) return "expired_authority";
  if (/authority/i.test(msg)) return "invalid_authority";
  return "invalid_action";
}

function assertAuthorization(auth: any) {
  if (!auth.authority?.validated) {
    throw new Error("Authority not validated.");
  }

  if (new Date(auth.authorization.expires_at) < new Date()) {
    throw new Error("Authorization expired.");
  }
}

function writeReceipt(entry: Record<string, unknown>) {
  fs.appendFileSync(
    "phase-32/execution-receipts.jsonl",
    JSON.stringify(entry) + "\n"
  );
}

// ---- main ----
const executionId = crypto.randomUUID();
let actionName = "";
let authoritySource = "";

try {
  const auth = loadJSON<any>("phase-32/execution-authorization.json");
  actionName = String(auth?.authorization?.action ?? "");
  authoritySource = String(auth?.authority?.source ?? "");

  assertKillSwitch();
  assertAuthorization(auth);

  const action = actionRegistry[auth.authorization.action];
  if (!action) {
    throw new Error("Action not registered.");
  }

  action(auth.authorization.parameters);

  writeReceipt({
    execution_id: executionId,
    action: actionName,
    authority: authoritySource,
    timestamp: new Date(0).toISOString(),
    result: "success",
  });
} catch (err) {
  // Receipt is mandatory even for blocked attempts.
  writeReceipt({
    execution_id: executionId,
    action: actionName,
    authority: authoritySource,
    timestamp: new Date(0).toISOString(),
    result: "blocked",
    reason: classifyBlockReason(err),
  });
  throw err;
}

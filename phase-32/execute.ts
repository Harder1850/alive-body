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
const auth = loadJSON<any>("phase-32/execution-authorization.json");

assertKillSwitch();
assertAuthorization(auth);

const action = actionRegistry[auth.authorization.action];
if (!action) {
  throw new Error("Action not registered.");
}

action(auth.authorization.parameters);

writeReceipt({
  execution_id: crypto.randomUUID(),
  action: auth.authorization.action,
  authority: auth.authority.source,
  timestamp: new Date(0).toISOString(),
  result: "success",
});

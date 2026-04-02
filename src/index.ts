export { ExternalFirewall } from "./nervous-system/external-firewall";
export { EmergencyStop } from "./nervous-system/emergency-stop";
export { executeAction, type ExecutorResult } from "./actuators/executor";

// Sensor adapters
export { CpuAdapter } from "./adapters/cpu-adapter";
export { DiskAdapter } from "./adapters/disk-adapter";
export { FsWatcherAdapter } from "./adapters/fs-watcher-adapter";

// Logging
export { appendSignalToStream } from "./logging/experience-stream";

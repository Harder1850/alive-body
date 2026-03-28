"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordExecution = recordExecution;
exports.getExecutionLog = getExecutionLog;
exports.getLog = getLog;
const log = [];
function recordExecution(entry) {
    log.push(entry);
}
function getExecutionLog() {
    return log;
}
function getLog() {
    return log;
}
//# sourceMappingURL=execution-log.js.map
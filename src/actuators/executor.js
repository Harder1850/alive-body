"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeAction = executeAction;
const execution_log_1 = require("../logging/execution-log");
const file_manager_1 = require("../tools/file-manager");
function executeAction(action) {
    let result;
    if (action.type === 'display_text') {
        result = action.payload;
    }
    else if (action.type === 'write_file') {
        const { success, path, error } = (0, file_manager_1.writeWebFile)(action.filename, action.content);
        result = success
            ? `FILE_WRITTEN: ${path}`
            : `FILE_WRITE_FAILED: ${error}`;
    }
    else {
        result = 'Unsupported action';
    }
    const signalId = 'executor-local';
    const decisionId = `exec-${Date.now()}`;
    (0, execution_log_1.logActionDispatched)(signalId, decisionId, action.type);
    (0, execution_log_1.logActionOutcome)(signalId, decisionId, !result.startsWith('FILE_WRITE_FAILED'), result);
    return result;
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ingestInput = ingestInput;
function ingestInput(input) {
    return {
        id: crypto.randomUUID(),
        source: 'system_api',
        raw_content: input,
        timestamp: Date.now(),
        threat_flag: false,
        firewall_status: 'pending',
    };
}
//# sourceMappingURL=ingestion.js.map
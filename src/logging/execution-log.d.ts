export interface ExecutionLogEntry {
    timestamp: number;
    signalId: string;
    decisionId: string;
    actionType: string;
    result: string;
}
export declare function recordExecution(entry: ExecutionLogEntry): void;
export declare function getExecutionLog(): ExecutionLogEntry[];
export declare function getLog(): ExecutionLogEntry[];
//# sourceMappingURL=execution-log.d.ts.map
/**
 * File Manager — alive-body tool for writing to the alive-web directory.
 *
 * ALIVE's only sanctioned filesystem write path. The Mind proposes file content
 * via a WriteFileAction; this actuator materialises it in alive-web/.
 *
 * Security invariant: writes are restricted to the alive-web directory.
 * Path traversal (e.g. "../") is rejected and the action is logged as blocked.
 */
export interface FileWriteResult {
    success: boolean;
    path?: string;
    error?: string;
}
/**
 * Write content to a file inside alive-web/.
 * Filename must be a plain filename with no directory separators.
 */
export declare function writeWebFile(filename: string, content: string): FileWriteResult;
//# sourceMappingURL=file-manager.d.ts.map
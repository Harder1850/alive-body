"use strict";
/**
 * File Manager — alive-body tool for writing to the alive-web directory.
 *
 * ALIVE's only sanctioned filesystem write path. The Mind proposes file content
 * via a WriteFileAction; this actuator materialises it in alive-web/.
 *
 * Security invariant: writes are restricted to the alive-web directory.
 * Path traversal (e.g. "../") is rejected and the action is logged as blocked.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeWebFile = writeWebFile;
const fs_1 = require("fs");
const path_1 = require("path");
const ALIVE_WEB_DIR = (0, path_1.join)('C:', 'Users', 'mikeh', 'dev', 'ALIVE', 'alive-repos', 'alive-web');
/**
 * Write content to a file inside alive-web/.
 * Filename must be a plain filename with no directory separators.
 */
function writeWebFile(filename, content) {
    // Sanitise: strip any path components, keep only the basename
    const safe = (0, path_1.basename)(filename);
    if (!safe || safe !== filename) {
        const error = `[file-manager] BLOCKED: filename "${filename}" contains path traversal or is invalid. Only plain filenames are allowed.`;
        console.error(error);
        return { success: false, error };
    }
    try {
        (0, fs_1.mkdirSync)(ALIVE_WEB_DIR, { recursive: true });
        const fullPath = (0, path_1.join)(ALIVE_WEB_DIR, safe);
        (0, fs_1.writeFileSync)(fullPath, content, 'utf-8');
        console.log(`[file-manager] ✓ Written: ${fullPath}`);
        return { success: true, path: fullPath };
    }
    catch (err) {
        const error = `[file-manager] Write failed: ${err instanceof Error ? err.message : String(err)}`;
        console.error(error);
        return { success: false, error };
    }
}
//# sourceMappingURL=file-manager.js.map
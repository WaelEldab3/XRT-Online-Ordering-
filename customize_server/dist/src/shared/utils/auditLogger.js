"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogger = exports.AuditAction = void 0;
const logger_1 = require("./logger");
var AuditAction;
(function (AuditAction) {
    AuditAction["IMPORT_PARSE"] = "import.parse";
    AuditAction["IMPORT_SAVE_DRAFT"] = "import.save_draft";
    AuditAction["IMPORT_DISCARD"] = "import.discard";
    AuditAction["IMPORT_FINAL_SAVE"] = "import.final_save";
    AuditAction["IMPORT_DOWNLOAD_ERRORS"] = "import.download_errors";
})(AuditAction || (exports.AuditAction = AuditAction = {}));
class AuditLogger {
    static log(entry) {
        logger_1.logger.info('AUDIT', {
            action: entry.action,
            user_id: entry.user_id,
            business_id: entry.business_id,
            session_id: entry.session_id,
            details: entry.details,
            timestamp: entry.timestamp.toISOString(),
        });
    }
    static logImport(action, user_id, business_id, session_id, details) {
        this.log({
            action,
            user_id,
            business_id,
            session_id,
            details,
            timestamp: new Date(),
        });
    }
}
exports.AuditLogger = AuditLogger;

import { logger } from './logger';

export enum AuditAction {
  IMPORT_PARSE = 'import.parse',
  IMPORT_SAVE_DRAFT = 'import.save_draft',
  IMPORT_DISCARD = 'import.discard',
  IMPORT_FINAL_SAVE = 'import.final_save',
  IMPORT_DOWNLOAD_ERRORS = 'import.download_errors',
}

export interface AuditLogEntry {
  action: AuditAction;
  user_id: string;
  business_id?: string;
  session_id?: string;
  details?: any;
  timestamp: Date;
}

export class AuditLogger {
  static log(entry: AuditLogEntry): void {
    logger.info('AUDIT', {
      action: entry.action,
      user_id: entry.user_id,
      business_id: entry.business_id,
      session_id: entry.session_id,
      details: entry.details,
      timestamp: entry.timestamp.toISOString(),
    });
  }

  static logImport(action: AuditAction, user_id: string, business_id: string, session_id?: string, details?: any): void {
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

export type PrintLogStatus = 'pending' | 'sent' | 'failed';

export interface PrintLog {
  id: string;
  order_id: string;
  printer_id: string;
  status: PrintLogStatus;
  error: string | null;
  attempt_count: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreatePrintLogDTO {
  order_id: string;
  printer_id: string;
  status: PrintLogStatus;
  error?: string | null;
  attempt_count: number;
}

export interface PrintLogFilters {
  order_id?: string;
  printer_id?: string;
  status?: PrintLogStatus;
}

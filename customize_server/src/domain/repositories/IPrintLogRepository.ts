import { PrintLog, CreatePrintLogDTO, PrintLogFilters } from '../entities/PrintLog';

export interface IPrintLogRepository {
  create(data: CreatePrintLogDTO): Promise<PrintLog>;
  findByOrderAndPrinter(orderId: string, printerId: string): Promise<PrintLog | null>;
  findByOrderId(orderId: string): Promise<PrintLog[]>;
  findAll(filters: PrintLogFilters, limit?: number): Promise<PrintLog[]>;
}

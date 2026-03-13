import { IPrintLogRepository } from '../../domain/repositories/IPrintLogRepository';
import {
  PrintLog,
  CreatePrintLogDTO,
  PrintLogFilters,
} from '../../domain/entities/PrintLog';
import { PrintLogModel, PrintLogDocument } from '../database/models/PrintLogModel';

export class PrintLogRepository implements IPrintLogRepository {
  private toDomain(doc: PrintLogDocument): PrintLog {
    return {
      id: doc._id.toString(),
      order_id: doc.order_id,
      printer_id: doc.printer_id,
      status: doc.status as PrintLog['status'],
      error: doc.error ?? null,
      attempt_count: doc.attempt_count,
      created_at: doc.created_at,
      updated_at: doc.updated_at,
    };
  }

  async create(data: CreatePrintLogDTO): Promise<PrintLog> {
    const doc = await PrintLogModel.create(data);
    return this.toDomain(doc);
  }

  async findByOrderAndPrinter(orderId: string, printerId: string): Promise<PrintLog | null> {
    const doc = await PrintLogModel.findOne({ order_id: orderId, printer_id: printerId })
      .sort({ updated_at: -1 })
      .exec();
    return doc ? this.toDomain(doc) : null;
  }

  async findByOrderId(orderId: string): Promise<PrintLog[]> {
    const docs = await PrintLogModel.find({ order_id: orderId })
      .sort({ updated_at: -1 })
      .exec();
    return docs.map((d) => this.toDomain(d));
  }

  async findAll(filters: PrintLogFilters, limit: number = 100): Promise<PrintLog[]> {
    const query: Record<string, unknown> = {};
    if (filters.order_id) query.order_id = filters.order_id;
    if (filters.printer_id) query.printer_id = filters.printer_id;
    if (filters.status) query.status = filters.status;
    const docs = await PrintLogModel.find(query).sort({ created_at: -1 }).limit(limit).exec();
    return docs.map((d) => this.toDomain(d));
  }

  /** Create or update: find latest log for order+printer; if exists update it, else create. */
  async logAttempt(
    orderId: string,
    printerId: string,
    status: PrintLog['status'],
    error: string | null,
    attemptCount: number
  ): Promise<PrintLog> {
    const existing = await PrintLogModel.findOne({ order_id: orderId, printer_id: printerId })
      .sort({ updated_at: -1 })
      .exec();
    if (existing) {
      existing.status = status;
      existing.error = error;
      existing.attempt_count = attemptCount;
      await existing.save();
      return this.toDomain(existing);
    }
    return this.create({
      order_id: orderId,
      printer_id: printerId,
      status,
      error,
      attempt_count: attemptCount,
    });
  }
}

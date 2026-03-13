import mongoose, { Schema, Document, Types } from 'mongoose';
import { PrintLog } from '../../../domain/entities/PrintLog';

export interface PrintLogDocument extends Omit<PrintLog, 'id'>, Document {
  _id: Types.ObjectId;
}

const PrintLogSchema = new Schema<PrintLogDocument>(
  {
    order_id: { type: String, required: true, index: true },
    printer_id: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: ['pending', 'sent', 'failed'],
      required: true,
      index: true,
    },
    error: { type: String, default: null },
    attempt_count: { type: Number, required: true, default: 1 },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

PrintLogSchema.index({ order_id: 1, printer_id: 1 });
PrintLogSchema.index({ created_at: -1 });

export const PrintLogModel = mongoose.model<PrintLogDocument>('PrintLog', PrintLogSchema);

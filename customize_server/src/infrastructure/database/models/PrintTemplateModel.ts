import mongoose, { Schema, Document, Types } from 'mongoose';
import { PrintTemplate, TemplateLayout } from '../../../domain/entities/PrintTemplate';

export interface PrintTemplateDocument extends Omit<PrintTemplate, 'id' | 'created_by'>, Document {
  _id: Types.ObjectId;
  created_by: Types.ObjectId | null;
  layout: TemplateLayout;
}

const PrintTemplateSchema = new Schema<PrintTemplateDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['kitchen', 'cashier', 'generic'],
      required: true,
      index: true,
    },
    layout: {
      type: Schema.Types.Mixed,
      required: true,
      default: () => ({ header: [], body: [], footer: [] }),
    },
    paper_width: {
      type: String,
      enum: ['58mm', '80mm'],
      default: '80mm',
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
    autoCut: {
      type: Boolean,
      default: true,
    },
    sections: {
      type: [String],
      default: [],
    },
    created_by: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

PrintTemplateSchema.index({ type: 1 });
PrintTemplateSchema.index({ active: 1 });

export const PrintTemplateModel = mongoose.model<PrintTemplateDocument>(
  'PrintTemplate',
  PrintTemplateSchema
);

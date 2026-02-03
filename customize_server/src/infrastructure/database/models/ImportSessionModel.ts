import mongoose, { Schema, Document } from 'mongoose';
import { ImportSession, ImportSessionStatus } from '../../../domain/entities/ImportSession';

export interface ImportSessionDocument extends Omit<ImportSession, 'id'>, Document {
  _id: mongoose.Types.ObjectId;
}

const ImportValidationErrorSchema = new Schema(
  {
    file: { type: String, required: true },
    row: { type: Number, required: true },
    entity: { type: String, required: true },
    field: { type: String, required: true },
    message: { type: String, required: true },
    value: { type: Schema.Types.Mixed },
  },
  { _id: false }
);

const ImportValidationWarningSchema = new Schema(
  {
    file: { type: String, required: true },
    row: { type: Number, required: true },
    entity: { type: String, required: true },
    field: { type: String, required: true },
    message: { type: String, required: true },
    value: { type: Schema.Types.Mixed },
  },
  { _id: false }
);

const ImportSessionSchema = new Schema<ImportSessionDocument>(
  {
    user_id: {
      type: String,
      required: true,
      index: true,
    },
    business_id: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['draft', 'validated', 'confirmed', 'discarded', 'rolled_back'],
      default: 'draft',
      index: true,
    },
    parsedData: {
      type: Schema.Types.Mixed,
      required: true,
    },
    validationErrors: {
      type: [ImportValidationErrorSchema],
      default: [],
    },
    validationWarnings: {
      type: [ImportValidationWarningSchema],
      default: [],
    },
    originalFiles: {
      type: [String],
      default: [],
    },
    rollbackData: {
      type: [
        new Schema(
          {
            entityType: { type: String, required: true },
            action: { type: String, required: true },
            id: { type: String, required: true },
            previousData: { type: Schema.Types.Mixed },
          },
          { _id: false }
        ),
      ],
      default: [],
    },
    expires_at: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 }, // TTL index - auto-delete expired sessions
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// TTL: Sessions expire after 7 days
ImportSessionSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

// Index for user sessions
ImportSessionSchema.index({ user_id: 1, business_id: 1, status: 1 });

export const ImportSessionModel = mongoose.model<ImportSessionDocument>(
  'ImportSession',
  ImportSessionSchema
);

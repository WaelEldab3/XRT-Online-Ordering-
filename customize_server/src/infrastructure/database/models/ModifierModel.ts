import mongoose, { Schema, Document } from 'mongoose';
import { Modifier } from '../../../domain/entities/Modifier';

export interface ModifierDocument extends Omit<Modifier, 'id' | 'modifier_group_id'>, Document {
  _id: mongoose.Types.ObjectId;
  modifier_group_id: mongoose.Types.ObjectId | string;
}

const ModifierSchema = new Schema<ModifierDocument>(
  {
    modifier_group_id: {
      type: Schema.Types.ObjectId,
      ref: 'ModifierGroup',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    is_default: {
      type: Boolean,
      default: false,
    },
    max_quantity: {
      type: Number,
      min: 1,
    },
    display_order: {
      type: Number,
      default: 0,
      min: 0,
    },
    is_active: {
      type: Boolean,
      default: true,
      index: true,
    },
    sides_config: {
      enabled: {
        type: Boolean,
        default: false,
      },
      allowed_sides: {
        type: [String],
        enum: ['LEFT', 'RIGHT', 'WHOLE'],
        default: [],
      },
    },
    deleted_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Note: Default modifier validation is handled in the repository/use case layer
// to avoid circular dependencies in Mongoose pre-hooks

ModifierSchema.index({ modifier_group_id: 1, name: 1 }, { unique: true });
ModifierSchema.index({ modifier_group_id: 1, is_active: 1 });
ModifierSchema.index({ modifier_group_id: 1, deleted_at: 1 });

export const ModifierModel = mongoose.model<ModifierDocument>('Modifier', ModifierSchema);

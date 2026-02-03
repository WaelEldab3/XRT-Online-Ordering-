import mongoose, { Schema, Document } from 'mongoose';
import { KitchenSection } from '../../../domain/entities/KitchenSection';

export interface KitchenSectionDocument extends Omit<KitchenSection, 'id'>, Document {
  _id: mongoose.Types.ObjectId;
}

const KitchenSectionSchema = new Schema<KitchenSectionDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    business_id: {
      type: String,
      required: true,
      index: true,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Unique name per business
KitchenSectionSchema.index({ business_id: 1, name: 1 }, { unique: true });

export const KitchenSectionModel = mongoose.model<KitchenSectionDocument>(
  'KitchenSection',
  KitchenSectionSchema
);

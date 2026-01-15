import mongoose, { Schema, Document } from 'mongoose';
import { ItemSize } from '../../../domain/entities/ItemSize';

export interface ItemSizeDocument extends Omit<ItemSize, 'id' | 'item_id'>, Document {
  _id: mongoose.Types.ObjectId;
  item_id: mongoose.Types.ObjectId;
}

const ItemSizeSchema = new Schema<ItemSizeDocument>(
  {
    item_id: {
      type: Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
      index: true,
    },
    restaurant_id: {
      type: String,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    display_order: {
      type: Number,
      default: 0,
    },
    is_active: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Unique constraint: code must be unique per item
ItemSizeSchema.index({ item_id: 1, code: 1 }, { unique: true });

// Index for filtering by restaurant
ItemSizeSchema.index({ restaurant_id: 1, is_active: 1 });

// Index for filtering active sizes by item
ItemSizeSchema.index({ item_id: 1, is_active: 1 });

export const ItemSizeModel = mongoose.model<ItemSizeDocument>('ItemSize', ItemSizeSchema);

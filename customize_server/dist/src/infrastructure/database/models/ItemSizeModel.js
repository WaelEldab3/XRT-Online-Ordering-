"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemSizeModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const ItemSizeSchema = new mongoose_1.Schema({
    item_id: {
        type: mongoose_1.Schema.Types.ObjectId,
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
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});
// Unique constraint: code must be unique per item
ItemSizeSchema.index({ item_id: 1, code: 1 }, { unique: true });
// Index for filtering by restaurant
ItemSizeSchema.index({ restaurant_id: 1, is_active: 1 });
// Index for filtering active sizes by item
ItemSizeSchema.index({ item_id: 1, is_active: 1 });
exports.ItemSizeModel = mongoose_1.default.model('ItemSize', ItemSizeSchema);

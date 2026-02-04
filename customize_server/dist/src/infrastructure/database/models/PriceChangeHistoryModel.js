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
exports.PriceChangeHistoryModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const PriceChangeHistory_1 = require("../../../domain/entities/PriceChangeHistory");
const PriceChangeHistorySchema = new mongoose_1.Schema({
    business_id: {
        type: String,
        required: true,
        index: true,
    },
    admin_id: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    type: {
        type: String,
        enum: Object.values(PriceChangeHistory_1.PriceChangeType),
        required: true,
    },
    value_type: {
        type: String,
        enum: Object.values(PriceChangeHistory_1.PriceValueType),
        required: true,
    },
    value: {
        type: Number,
        required: true,
    },
    affected_items_count: {
        type: Number,
        required: true,
    },
    target: {
        type: String,
        enum: ['ITEMS', 'MODIFIERS'],
        default: 'ITEMS',
    },
    snapshot: {
        type: mongoose_1.Schema.Types.Mixed, // Storing as Mixed to avoid TS array issues, but logic ensures it's an array
        required: true,
        select: false,
    },
    status: {
        type: String,
        enum: Object.values(PriceChangeHistory_1.PriceChangeStatus),
        default: PriceChangeHistory_1.PriceChangeStatus.COMPLETED,
        required: true,
    },
    rolled_back_at: {
        type: Date,
    },
    rolled_back_by: {
        type: String,
    },
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});
PriceChangeHistorySchema.index({ business_id: 1, created_at: -1 });
exports.PriceChangeHistoryModel = mongoose_1.default.model('PriceChangeHistory', PriceChangeHistorySchema);

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
exports.ImportSessionModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const ImportValidationErrorSchema = new mongoose_1.Schema({
    file: { type: String, required: true },
    row: { type: Number, required: true },
    entity: { type: String, required: true },
    field: { type: String, required: true },
    message: { type: String, required: true },
    value: { type: mongoose_1.Schema.Types.Mixed },
}, { _id: false });
const ImportValidationWarningSchema = new mongoose_1.Schema({
    file: { type: String, required: true },
    row: { type: Number, required: true },
    entity: { type: String, required: true },
    field: { type: String, required: true },
    message: { type: String, required: true },
    value: { type: mongoose_1.Schema.Types.Mixed },
}, { _id: false });
const ImportSessionSchema = new mongoose_1.Schema({
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
        type: mongoose_1.Schema.Types.Mixed,
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
            new mongoose_1.Schema({
                entityType: { type: String, required: true },
                action: { type: String, required: true },
                id: { type: String, required: true },
                previousData: { type: mongoose_1.Schema.Types.Mixed },
            }, { _id: false }),
        ],
        default: [],
    },
    expires_at: {
        type: Date,
        required: true,
        index: { expireAfterSeconds: 0 }, // TTL index - auto-delete expired sessions
    },
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});
// TTL: Sessions expire after 7 days
ImportSessionSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });
// Index for user sessions
ImportSessionSchema.index({ user_id: 1, business_id: 1, status: 1 });
exports.ImportSessionModel = mongoose_1.default.model('ImportSession', ImportSessionSchema);

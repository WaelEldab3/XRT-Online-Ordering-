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
exports.PermissionModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const PermissionSchema = new mongoose_1.Schema({
    key: {
        type: String,
        required: [true, 'Permission key is required'],
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
        validate: {
            validator: function (v) {
                // Format: module:action (e.g., users:read)
                return /^[a-z_]+:[a-z_]+$/.test(v);
            },
            message: 'Permission key must be in format module:action (e.g., users:read)',
        },
    },
    module: {
        type: String,
        required: [true, 'Module is required'],
        lowercase: true,
        trim: true,
        index: true,
    },
    action: {
        type: String,
        required: [true, 'Action is required'],
        lowercase: true,
        trim: true,
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
        maxlength: [500, 'Description cannot be more than 500 characters'],
    },
    isSystem: {
        type: Boolean,
        default: false,
    },
    isActive: {
        type: Boolean,
        default: false, // New permissions are disabled by default
    },
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});
// Indexes for efficient querying
PermissionSchema.index({ module: 1, action: 1 });
PermissionSchema.index({ isSystem: 1 });
PermissionSchema.index({ isActive: 1 });
// Prevent deletion of system permissions
PermissionSchema.pre('deleteOne', { document: true, query: false }, function (next) {
    if (this.isSystem) {
        return next(new Error('Cannot delete system permission'));
    }
    next();
});
// Static method to find by key
PermissionSchema.statics.findByKey = function (key) {
    return this.findOne({ key: key.toLowerCase() });
};
// Static method to find all by module
PermissionSchema.statics.findByModule = function (module) {
    return this.find({ module: module.toLowerCase() });
};
// Static method to get all active permissions
PermissionSchema.statics.findActive = function () {
    return this.find({ isActive: true });
};
exports.PermissionModel = mongoose_1.default.model('Permission', PermissionSchema);

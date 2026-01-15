import mongoose, { Schema, Document } from 'mongoose';
import { Permission } from '../../../domain/entities/Permission';

export interface PermissionDocument extends Omit<Permission, 'id'>, Document {
    _id: mongoose.Types.ObjectId;
}

const PermissionSchema = new Schema<PermissionDocument>(
    {
        key: {
            type: String,
            required: [true, 'Permission key is required'],
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
            validate: {
                validator: function (v: string) {
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
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    }
);

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
PermissionSchema.statics.findByKey = function (key: string) {
    return this.findOne({ key: key.toLowerCase() });
};

// Static method to find all by module
PermissionSchema.statics.findByModule = function (module: string) {
    return this.find({ module: module.toLowerCase() });
};

// Static method to get all active permissions
PermissionSchema.statics.findActive = function () {
    return this.find({ isActive: true });
};

export const PermissionModel = mongoose.model<PermissionDocument>('Permission', PermissionSchema);

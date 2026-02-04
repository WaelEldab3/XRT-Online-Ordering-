"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionRepository = void 0;
const PermissionModel_1 = require("../database/models/PermissionModel");
const AppError_1 = require("../../shared/errors/AppError");
class PermissionRepository {
    mapToEntity(doc) {
        return {
            id: doc._id.toString(),
            key: doc.key,
            module: doc.module,
            action: doc.action,
            description: doc.description,
            isSystem: doc.isSystem,
            isActive: doc.isActive,
            created_at: doc.created_at,
            updated_at: doc.updated_at,
        };
    }
    async findAll(filters) {
        const query = {};
        if (filters?.module) {
            query.module = filters.module.toLowerCase();
        }
        if (filters?.isActive !== undefined) {
            query.isActive = filters.isActive;
        }
        if (filters?.isSystem !== undefined) {
            query.isSystem = filters.isSystem;
        }
        if (filters?.search) {
            query.$or = [
                { key: { $regex: filters.search, $options: 'i' } },
                { description: { $regex: filters.search, $options: 'i' } },
            ];
        }
        const docs = await PermissionModel_1.PermissionModel.find(query).sort({ module: 1, key: 1 });
        return docs.map((doc) => this.mapToEntity(doc));
    }
    async findById(id) {
        const doc = await PermissionModel_1.PermissionModel.findById(id);
        return doc ? this.mapToEntity(doc) : null;
    }
    async findByKey(key) {
        const doc = await PermissionModel_1.PermissionModel.findOne({ key: key.toLowerCase() });
        return doc ? this.mapToEntity(doc) : null;
    }
    async findByModule(module) {
        const docs = await PermissionModel_1.PermissionModel.find({ module: module.toLowerCase() }).sort({ key: 1 });
        return docs.map((doc) => this.mapToEntity(doc));
    }
    async findActive() {
        const docs = await PermissionModel_1.PermissionModel.find({ isActive: true }).sort({ module: 1, key: 1 });
        return docs.map((doc) => this.mapToEntity(doc));
    }
    async create(data) {
        const doc = await PermissionModel_1.PermissionModel.create({
            key: data.key.toLowerCase(),
            module: data.module.toLowerCase(),
            action: data.action.toLowerCase(),
            description: data.description,
            isSystem: data.isSystem ?? false,
            isActive: data.isActive ?? false, // New permissions disabled by default
        });
        return this.mapToEntity(doc);
    }
    async createMany(data) {
        const docs = await PermissionModel_1.PermissionModel.insertMany(data.map((item) => ({
            key: item.key.toLowerCase(),
            module: item.module.toLowerCase(),
            action: item.action.toLowerCase(),
            description: item.description,
            isSystem: item.isSystem ?? false,
            isActive: item.isActive ?? false,
        })), { ordered: false } // Continue even if some fail (duplicates)
        );
        return docs.map((doc) => this.mapToEntity(doc));
    }
    async update(id, data) {
        const doc = await PermissionModel_1.PermissionModel.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true });
        return doc ? this.mapToEntity(doc) : null;
    }
    async delete(id) {
        const doc = await PermissionModel_1.PermissionModel.findById(id);
        if (!doc) {
            throw new AppError_1.NotFoundError('Permission not found');
        }
        if (doc.isSystem) {
            throw new Error('Cannot delete system permission');
        }
        await PermissionModel_1.PermissionModel.findByIdAndDelete(id);
        return true;
    }
    async existsByKey(key) {
        const count = await PermissionModel_1.PermissionModel.countDocuments({ key: key.toLowerCase() });
        return count > 0;
    }
    async getModules() {
        const modules = await PermissionModel_1.PermissionModel.distinct('module');
        return modules.sort();
    }
    /**
     * Upsert permissions - insert if not exists, skip if exists
     * Used for syncing permissions from code definitions
     */
    async upsertMany(data) {
        const keys = data.map((d) => d.key.toLowerCase());
        // Batch check existence
        const existingDocs = await PermissionModel_1.PermissionModel.find({
            key: { $in: keys },
        }).select('key');
        const existingKeys = new Set(existingDocs.map((d) => d.key));
        const newPermissions = data.filter((d) => !existingKeys.has(d.key.toLowerCase()));
        if (newPermissions.length > 0) {
            await this.createMany(newPermissions);
        }
        return {
            inserted: newPermissions.length,
            skipped: data.length - newPermissions.length,
        };
    }
}
exports.PermissionRepository = PermissionRepository;

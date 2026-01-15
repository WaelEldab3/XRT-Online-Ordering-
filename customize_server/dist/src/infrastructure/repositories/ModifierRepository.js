"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModifierRepository = void 0;
const ModifierModel_1 = require("../database/models/ModifierModel");
const AppError_1 = require("../../shared/errors/AppError");
class ModifierRepository {
    toDomain(document) {
        return {
            id: document._id.toString(),
            modifier_group_id: typeof document.modifier_group_id === 'string'
                ? document.modifier_group_id
                : document.modifier_group_id.toString(),
            name: document.name,
            is_default: document.is_default,
            max_quantity: document.max_quantity,
            display_order: document.display_order,
            is_active: document.is_active,
            created_at: document.created_at,
            updated_at: document.updated_at,
            deleted_at: document.deleted_at,
        };
    }
    async create(data) {
        // If setting as default, unset other defaults in the group
        if (data.is_default) {
            await ModifierModel_1.ModifierModel.updateMany({ modifier_group_id: data.modifier_group_id, deleted_at: null }, { $set: { is_default: false } });
        }
        const modifierDoc = new ModifierModel_1.ModifierModel({
            ...data,
            is_default: data.is_default ?? false,
            display_order: data.display_order ?? 0,
            is_active: data.is_active ?? true,
        });
        await modifierDoc.save();
        return this.toDomain(modifierDoc);
    }
    async findById(id, modifier_group_id) {
        const query = { _id: id, deleted_at: null };
        if (modifier_group_id) {
            query.modifier_group_id = modifier_group_id;
        }
        const modifierDoc = await ModifierModel_1.ModifierModel.findOne(query);
        return modifierDoc ? this.toDomain(modifierDoc) : null;
    }
    async findActiveById(id, modifier_group_id) {
        const query = { _id: id, is_active: true, deleted_at: null };
        if (modifier_group_id) {
            query.modifier_group_id = modifier_group_id;
        }
        const modifierDoc = await ModifierModel_1.ModifierModel.findOne(query);
        return modifierDoc ? this.toDomain(modifierDoc) : null;
    }
    async findAll(filters) {
        const query = { deleted_at: null };
        if (filters.modifier_group_id) {
            query.modifier_group_id = filters.modifier_group_id;
        }
        if (filters.name) {
            query.name = { $regex: filters.name, $options: 'i' };
        }
        if (filters.is_active !== undefined) {
            query.is_active = filters.is_active;
        }
        if (filters.is_default !== undefined) {
            query.is_default = filters.is_default;
        }
        const modifierDocs = await ModifierModel_1.ModifierModel.find(query).sort({ display_order: 1, created_at: 1 });
        return modifierDocs.map((doc) => this.toDomain(doc));
    }
    async findByGroupId(modifier_group_id) {
        const modifierDocs = await ModifierModel_1.ModifierModel.find({
            modifier_group_id,
            deleted_at: null,
        }).sort({ display_order: 1, created_at: 1 });
        return modifierDocs.map((doc) => this.toDomain(doc));
    }
    async update(id, modifier_group_id, data) {
        // If setting as default, unset other defaults in the group
        if (data.is_default === true) {
            await ModifierModel_1.ModifierModel.updateMany({
                modifier_group_id,
                _id: { $ne: id },
                deleted_at: null
            }, { $set: { is_default: false } });
        }
        const modifierDoc = await ModifierModel_1.ModifierModel.findOneAndUpdate({ _id: id, modifier_group_id, deleted_at: null }, data, {
            new: true,
            runValidators: true,
        });
        if (!modifierDoc) {
            throw new AppError_1.NotFoundError('Modifier');
        }
        return this.toDomain(modifierDoc);
    }
    async delete(id, modifier_group_id) {
        // Soft delete - set deleted_at timestamp
        const modifierDoc = await ModifierModel_1.ModifierModel.findOneAndUpdate({ _id: id, modifier_group_id, deleted_at: null }, { deleted_at: new Date() }, { new: true });
        if (!modifierDoc) {
            throw new AppError_1.NotFoundError('Modifier');
        }
    }
    async exists(name, modifier_group_id, excludeId) {
        const query = {
            name,
            modifier_group_id,
            deleted_at: null,
        };
        if (excludeId) {
            query._id = { $ne: excludeId };
        }
        const count = await ModifierModel_1.ModifierModel.countDocuments(query);
        return count > 0;
    }
}
exports.ModifierRepository = ModifierRepository;

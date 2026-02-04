"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemSizeRepository = void 0;
const ItemSizeModel_1 = require("../database/models/ItemSizeModel");
class ItemSizeRepository {
    toDomain(document) {
        return {
            id: document._id.toString(),
            business_id: document.business_id,
            name: document.name,
            code: document.code,
            display_order: document.display_order,
            is_active: document.is_active,
            created_at: document.created_at,
            updated_at: document.updated_at,
            deleted_at: document.deleted_at,
        };
    }
    async create(data) {
        const itemSizeDoc = new ItemSizeModel_1.ItemSizeModel(data);
        await itemSizeDoc.save();
        return this.toDomain(itemSizeDoc);
    }
    async findById(id) {
        const itemSizeDoc = await ItemSizeModel_1.ItemSizeModel.findOne({ _id: id });
        return itemSizeDoc ? this.toDomain(itemSizeDoc) : null;
    }
    async findAll(filters) {
        const query = {};
        if (filters.business_id) {
            query.business_id = filters.business_id;
        }
        if (filters.is_active !== undefined) {
            query.is_active = filters.is_active;
        }
        const itemSizeDocs = await ItemSizeModel_1.ItemSizeModel.find(query).sort({ display_order: 1, created_at: 1 });
        return itemSizeDocs.map((doc) => this.toDomain(doc));
    }
    async update(id, data) {
        const itemSizeDoc = await ItemSizeModel_1.ItemSizeModel.findOneAndUpdate({ _id: id }, data, {
            new: true,
            runValidators: true,
        });
        if (!itemSizeDoc) {
            throw new Error('Item size not found');
        }
        return this.toDomain(itemSizeDoc);
    }
    async delete(id) {
        // Soft delete usually preferred, but UseCase might enforce checks.
        // If we want soft delete:
        // await ItemSizeModel.findOneAndUpdate({ _id: id }, { deleted_at: new Date() });
        // For now, sticking to interface contract which implies deletion.
        const result = await ItemSizeModel_1.ItemSizeModel.findOneAndDelete({ _id: id });
        if (!result) {
            throw new Error('Item size not found');
        }
    }
    async exists(code, business_id, excludeId) {
        const query = { code, business_id };
        if (excludeId) {
            query._id = { $ne: excludeId };
        }
        const count = await ItemSizeModel_1.ItemSizeModel.countDocuments(query);
        return count > 0;
    }
    async updateSortOrder(items) {
        if (!items || items.length === 0)
            return;
        const operations = items.map((item) => ({
            updateOne: {
                filter: { _id: item.id },
                update: { display_order: item.order },
            },
        }));
        await ItemSizeModel_1.ItemSizeModel.bulkWrite(operations);
    }
}
exports.ItemSizeRepository = ItemSizeRepository;

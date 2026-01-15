"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemSizeRepository = void 0;
const ItemSizeModel_1 = require("../database/models/ItemSizeModel");
class ItemSizeRepository {
    toDomain(document) {
        return {
            id: document._id.toString(),
            item_id: document.item_id.toString(),
            restaurant_id: document.restaurant_id,
            name: document.name,
            code: document.code,
            price: document.price,
            display_order: document.display_order,
            is_active: document.is_active,
            created_at: document.created_at,
            updated_at: document.updated_at,
        };
    }
    async create(data) {
        const itemSizeDoc = new ItemSizeModel_1.ItemSizeModel(data);
        await itemSizeDoc.save();
        return this.toDomain(itemSizeDoc);
    }
    async findById(id, item_id) {
        const query = { _id: id };
        if (item_id) {
            query.item_id = item_id;
        }
        const itemSizeDoc = await ItemSizeModel_1.ItemSizeModel.findOne(query);
        return itemSizeDoc ? this.toDomain(itemSizeDoc) : null;
    }
    async findAll(filters) {
        const query = {};
        if (filters.item_id) {
            query.item_id = filters.item_id;
        }
        if (filters.restaurant_id) {
            query.restaurant_id = filters.restaurant_id;
        }
        if (filters.is_active !== undefined) {
            query.is_active = filters.is_active;
        }
        const itemSizeDocs = await ItemSizeModel_1.ItemSizeModel.find(query)
            .sort({ display_order: 1, created_at: 1 });
        return itemSizeDocs.map((doc) => this.toDomain(doc));
    }
    async findByItemId(item_id) {
        const itemSizeDocs = await ItemSizeModel_1.ItemSizeModel.find({ item_id, is_active: true })
            .sort({ display_order: 1, created_at: 1 });
        return itemSizeDocs.map((doc) => this.toDomain(doc));
    }
    async update(id, item_id, data) {
        const itemSizeDoc = await ItemSizeModel_1.ItemSizeModel.findOneAndUpdate({ _id: id, item_id }, data, {
            new: true,
            runValidators: true,
        });
        if (!itemSizeDoc) {
            throw new Error('Item size not found');
        }
        return this.toDomain(itemSizeDoc);
    }
    async delete(id, item_id) {
        const result = await ItemSizeModel_1.ItemSizeModel.findOneAndDelete({ _id: id, item_id });
        if (!result) {
            throw new Error('Item size not found');
        }
    }
    async exists(code, item_id, excludeId) {
        const query = { code, item_id };
        if (excludeId) {
            query._id = { $ne: excludeId };
        }
        const count = await ItemSizeModel_1.ItemSizeModel.countDocuments(query);
        return count > 0;
    }
    async countByItemId(item_id) {
        return await ItemSizeModel_1.ItemSizeModel.countDocuments({ item_id, is_active: true });
    }
}
exports.ItemSizeRepository = ItemSizeRepository;

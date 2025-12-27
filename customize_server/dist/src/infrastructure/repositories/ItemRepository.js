"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemRepository = void 0;
const ItemModel_1 = require("../database/models/ItemModel");
class ItemRepository {
    toDomain(document) {
        return {
            id: document._id.toString(),
            business_id: document.business_id,
            name: document.name,
            description: document.description,
            sort_order: document.sort_order,
            is_active: document.is_active,
            base_price: document.base_price,
            category_id: document.category_id
                ? (document.category_id._id
                    ? document.category_id._id.toString()
                    : document.category_id.toString())
                : '',
            category: (document.category_id && document.category_id.name) ? {
                id: document.category_id._id.toString(),
                name: document.category_id.name
            } : undefined,
            image: document.image,
            image_public_id: document.image_public_id,
            is_available: document.is_available,
            is_signature: document.is_signature,
            max_per_order: document.max_per_order,
            created_at: document.created_at,
            updated_at: document.updated_at,
        };
    }
    async create(itemData) {
        const itemDoc = new ItemModel_1.ItemModel(itemData);
        await itemDoc.save();
        return this.toDomain(itemDoc);
    }
    async findById(id, business_id) {
        const query = { _id: id };
        if (business_id) {
            query.business_id = business_id;
        }
        const itemDoc = await ItemModel_1.ItemModel.findOne(query).populate('category_id');
        return itemDoc ? this.toDomain(itemDoc) : null;
    }
    async findAll(filters) {
        const query = {};
        if (filters.business_id) {
            query.business_id = filters.business_id;
        }
        if (filters.category_id) {
            query.category_id = filters.category_id;
        }
        if (filters.is_active !== undefined) {
            query.is_active = filters.is_active;
        }
        if (filters.is_available !== undefined) {
            query.is_available = filters.is_available;
        }
        if (filters.is_signature !== undefined) {
            query.is_signature = filters.is_signature;
        }
        if (filters.search) {
            query.name = { $regex: filters.search, $options: 'i' };
        }
        const itemDocs = await ItemModel_1.ItemModel.find(query).sort({ sort_order: 1 }).populate('category_id');
        return itemDocs.map((doc) => this.toDomain(doc));
    }
    async update(id, business_id, itemData) {
        const itemDoc = await ItemModel_1.ItemModel.findOneAndUpdate({ _id: id, business_id }, itemData, {
            new: true,
            runValidators: true,
        }).populate('category_id');
        if (!itemDoc) {
            throw new Error('Item not found');
        }
        return this.toDomain(itemDoc);
    }
    async delete(id, business_id) {
        await ItemModel_1.ItemModel.findOneAndDelete({ _id: id, business_id });
    }
}
exports.ItemRepository = ItemRepository;

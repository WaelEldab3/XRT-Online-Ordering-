"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KitchenSectionRepository = void 0;
const KitchenSectionModel_1 = require("../database/models/KitchenSectionModel");
class KitchenSectionRepository {
    toDomain(doc) {
        return {
            id: doc._id.toString(),
            name: doc.name,
            business_id: doc.business_id,
            is_active: doc.is_active,
            created_at: doc.created_at,
            updated_at: doc.updated_at,
        };
    }
    async create(data) {
        const doc = await KitchenSectionModel_1.KitchenSectionModel.create(data);
        return this.toDomain(doc);
    }
    async findAll(filters) {
        const query = {};
        if (filters.business_id)
            query.business_id = filters.business_id;
        if (filters.name)
            query.name = new RegExp(`^${filters.name}$`, 'i'); // Case insensitive exact match
        const docs = await KitchenSectionModel_1.KitchenSectionModel.find(query);
        return docs.map((doc) => this.toDomain(doc));
    }
    async findByName(name, business_id) {
        const doc = await KitchenSectionModel_1.KitchenSectionModel.findOne({
            business_id,
            name: { $regex: new RegExp(`^${name}$`, 'i') },
        });
        return doc ? this.toDomain(doc) : null;
    }
    async findById(id) {
        const doc = await KitchenSectionModel_1.KitchenSectionModel.findById(id);
        return doc ? this.toDomain(doc) : null;
    }
}
exports.KitchenSectionRepository = KitchenSectionRepository;

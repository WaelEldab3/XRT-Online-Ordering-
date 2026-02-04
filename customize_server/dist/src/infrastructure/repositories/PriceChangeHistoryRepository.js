"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PriceChangeHistoryRepository = void 0;
const PriceChangeHistory_1 = require("../../domain/entities/PriceChangeHistory");
const PriceChangeHistoryModel_1 = require("../database/models/PriceChangeHistoryModel");
class PriceChangeHistoryRepository {
    toDomain(document) {
        return {
            id: document._id.toString(),
            business_id: document.business_id,
            admin_id: document.admin_id?.name || document.admin_id, // Use name if populated, else ID
            type: document.type,
            value_type: document.value_type,
            value: document.value,
            affected_items_count: document.affected_items_count,
            snapshot: document.snapshot,
            status: document.status,
            created_at: document.created_at,
            updated_at: document.updated_at,
            rolled_back_at: document.rolled_back_at,
            rolled_back_by: document.rolled_back_by,
            target: document.target,
        };
    }
    async create(data) {
        const historyDoc = new PriceChangeHistoryModel_1.PriceChangeHistoryModel(data);
        await historyDoc.save();
        return this.toDomain(historyDoc);
    }
    async findById(id) {
        const historyDoc = await PriceChangeHistoryModel_1.PriceChangeHistoryModel.findById(id).select('+snapshot');
        return historyDoc ? this.toDomain(historyDoc) : null;
    }
    async findAll(businessId, page, limit) {
        const skip = (page - 1) * limit;
        const query = {};
        if (Array.isArray(businessId)) {
            query.business_id = { $in: businessId };
        }
        else {
            // Create flexible query for business_id (string or possibly ObjectId if schema allowed mixed)
            // Since schema is String, we should just use the string.
            // But let's support array check just in case.
            query.business_id = businessId;
        }
        const [docs, total] = await Promise.all([
            PriceChangeHistoryModel_1.PriceChangeHistoryModel.find(query)
                .sort({ created_at: -1 })
                .skip(skip)
                .limit(limit)
                .populate('admin_id', 'name email'), // Populate user details
            PriceChangeHistoryModel_1.PriceChangeHistoryModel.countDocuments(query),
        ]);
        return {
            history: docs.map((doc) => this.toDomain(doc)),
            total,
        };
    }
    async markAsRolledBack(id, rolledBackBy) {
        await PriceChangeHistoryModel_1.PriceChangeHistoryModel.findByIdAndUpdate(id, {
            status: PriceChangeHistory_1.PriceChangeStatus.ROLLED_BACK,
            rolled_back_at: new Date(),
            rolled_back_by: rolledBackBy,
        });
    }
    async markAsFailed(id) {
        await PriceChangeHistoryModel_1.PriceChangeHistoryModel.findByIdAndUpdate(id, {
            status: PriceChangeHistory_1.PriceChangeStatus.FAILED,
        });
    }
    async delete(id) {
        await PriceChangeHistoryModel_1.PriceChangeHistoryModel.findByIdAndDelete(id);
    }
    async deleteAll(businessId) {
        await PriceChangeHistoryModel_1.PriceChangeHistoryModel.deleteMany({ business_id: businessId });
    }
}
exports.PriceChangeHistoryRepository = PriceChangeHistoryRepository;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessRepository = void 0;
const BusinessModel_1 = require("../database/models/BusinessModel");
const AppError_1 = require("../../shared/errors/AppError");
const crypto_1 = require("crypto");
class BusinessRepository {
    toDomain(document) {
        return {
            id: document._id.toString(),
            business_id: document.id,
            owner: document.owner.toString(),
            name: document.name,
            legal_name: document.legal_name,
            primary_content_name: document.primary_content_name,
            primary_content_email: document.primary_content_email,
            primary_content_phone: document.primary_content_phone,
            description: document.description,
            website: document.website,
            address: document.address,
            logo: document.logo,
            location: document.location,
            google_maps_verification: document.google_maps_verification,
            social_media: document.social_media,
            header_info: document.header_info,
            footer_text: document.footer_text,
            messages: document.messages,
            timezone: document.timezone,
            isActive: document.isActive,
            created_at: document.created_at,
            updated_at: document.updated_at,
        };
    }
    async create(businessData) {
        const businessDoc = new BusinessModel_1.BusinessModel({
            ...businessData,
            id: (0, crypto_1.randomUUID)(),
        });
        await businessDoc.save();
        return this.toDomain(businessDoc);
    }
    async findOne() {
        const businessDoc = await BusinessModel_1.BusinessModel.findOne();
        return businessDoc ? this.toDomain(businessDoc) : null;
    }
    /** First business by _id (bypasses isActive filter) - for import when system has one business */
    async findOneForImport() {
        const docs = await BusinessModel_1.BusinessModel.aggregate([{ $sort: { _id: 1 } }, { $limit: 1 }]);
        const raw = docs[0];
        if (!raw)
            return null;
        const businessDoc = { ...raw, owner: raw.owner?.toString?.() ?? raw.owner };
        return this.toDomain(businessDoc);
    }
    async update(id, businessData) {
        const businessDoc = await BusinessModel_1.BusinessModel.findOneAndUpdate({ _id: id }, businessData, {
            new: true,
            runValidators: true,
        });
        if (!businessDoc) {
            throw new AppError_1.NotFoundError('Business');
        }
        return this.toDomain(businessDoc);
    }
    async delete(id) {
        const result = await BusinessModel_1.BusinessModel.findOneAndDelete({ _id: id });
        if (!result) {
            throw new AppError_1.NotFoundError('Business');
        }
    }
}
exports.BusinessRepository = BusinessRepository;

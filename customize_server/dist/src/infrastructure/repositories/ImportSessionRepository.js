"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportSessionRepository = void 0;
const ImportSessionModel_1 = require("../database/models/ImportSessionModel");
class ImportSessionRepository {
    toDomain(document) {
        return {
            id: document._id.toString(),
            user_id: document.user_id,
            business_id: document.business_id,
            status: document.status,
            parsedData: document.parsedData,
            validationErrors: document.validationErrors || [],
            validationWarnings: document.validationWarnings || [],
            originalFiles: document.originalFiles || [],
            expires_at: document.expires_at,
            created_at: document.created_at,
            updated_at: document.updated_at,
        };
    }
    async create(data) {
        // Set expiration to 7 days from now
        const expires_at = new Date();
        expires_at.setDate(expires_at.getDate() + 7);
        const sessionDoc = new ImportSessionModel_1.ImportSessionModel({
            ...data,
            expires_at,
        });
        await sessionDoc.save();
        return this.toDomain(sessionDoc);
    }
    async findById(id, user_id) {
        const query = { _id: id };
        if (user_id) {
            query.user_id = user_id;
        }
        const sessionDoc = await ImportSessionModel_1.ImportSessionModel.findOne(query);
        return sessionDoc ? this.toDomain(sessionDoc) : null;
    }
    async findByUser(user_id, business_id) {
        const query = { user_id };
        if (business_id) {
            query.business_id = business_id;
        }
        const sessionDocs = await ImportSessionModel_1.ImportSessionModel.find(query)
            .sort({ created_at: -1 });
        return sessionDocs.map((doc) => this.toDomain(doc));
    }
    async update(id, user_id, data) {
        const sessionDoc = await ImportSessionModel_1.ImportSessionModel.findOneAndUpdate({ _id: id, user_id }, data, { new: true, runValidators: true });
        if (!sessionDoc) {
            throw new Error('Import session not found');
        }
        return this.toDomain(sessionDoc);
    }
    async delete(id, user_id) {
        const result = await ImportSessionModel_1.ImportSessionModel.findOneAndDelete({ _id: id, user_id });
        if (!result) {
            throw new Error('Import session not found');
        }
    }
    async deleteExpired() {
        const result = await ImportSessionModel_1.ImportSessionModel.deleteMany({
            expires_at: { $lt: new Date() },
        });
        return result.deletedCount || 0;
    }
}
exports.ImportSessionRepository = ImportSessionRepository;

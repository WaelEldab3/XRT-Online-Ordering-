"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateItemSizeUseCase = void 0;
const AppError_1 = require("../../../shared/errors/AppError");
class UpdateItemSizeUseCase {
    constructor(itemSizeRepository) {
        this.itemSizeRepository = itemSizeRepository;
    }
    async execute(id, sizeData) {
        // Retrieve existing size to get business_id for uniqueness check
        // Assuming retrieval is fast, or we could pass business_id. 
        // Ideally we should verify the existing size but for now let's rely on repository to handle update or throw.
        // However, to check uniqueness matching `exists(code, business_id, excludeId)`, we need `business_id`.
        // Since `UpdateItemSizeDTO` is partial, it might not have business_id (and shouldn't change).
        // Let's fetch the item first.
        const existing = await this.itemSizeRepository.findById(id);
        if (!existing) {
            throw new AppError_1.ValidationError('Item size not found');
        }
        // If code is being updated, check for uniqueness
        if (sizeData.code && sizeData.code !== existing.code) {
            const codeExists = await this.itemSizeRepository.exists(sizeData.code, existing.business_id, id);
            if (codeExists) {
                throw new AppError_1.ValidationError(`Size code '${sizeData.code}' already exists`);
            }
        }
        return await this.itemSizeRepository.update(id, sizeData);
    }
}
exports.UpdateItemSizeUseCase = UpdateItemSizeUseCase;

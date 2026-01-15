"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateItemSizeUseCase = void 0;
const AppError_1 = require("../../../shared/errors/AppError");
class UpdateItemSizeUseCase {
    constructor(itemSizeRepository) {
        this.itemSizeRepository = itemSizeRepository;
    }
    async execute(id, item_id, sizeData) {
        // If code is being updated, check for uniqueness
        if (sizeData.code) {
            const codeExists = await this.itemSizeRepository.exists(sizeData.code, item_id, id);
            if (codeExists) {
                throw new AppError_1.ValidationError(`Size code '${sizeData.code}' already exists for this item`);
            }
        }
        return await this.itemSizeRepository.update(id, item_id, sizeData);
    }
}
exports.UpdateItemSizeUseCase = UpdateItemSizeUseCase;

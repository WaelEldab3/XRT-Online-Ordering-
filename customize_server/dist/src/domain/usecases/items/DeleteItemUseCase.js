"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteItemUseCase = void 0;
class DeleteItemUseCase {
    constructor(itemRepository, imageStorage, itemSizeRepository) {
        this.itemRepository = itemRepository;
        this.imageStorage = imageStorage;
        this.itemSizeRepository = itemSizeRepository;
    }
    async execute(id) {
        const item = await this.itemRepository.findById(id);
        if (!item) {
            throw new Error('Item not found');
        }
        if (item.image_public_id) {
            await this.imageStorage.deleteImage(item.image_public_id);
        }
        await this.itemRepository.delete(id);
    }
}
exports.DeleteItemUseCase = DeleteItemUseCase;

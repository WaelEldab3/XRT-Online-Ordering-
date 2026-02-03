import { IItemRepository } from '../../repositories/IItemRepository';
import { IImageStorage } from '../../services/IImageStorage';
import { IItemSizeRepository } from '../../repositories/IItemSizeRepository';

export class DeleteItemUseCase {
  constructor(
    private itemRepository: IItemRepository,
    private imageStorage: IImageStorage,
    private itemSizeRepository: IItemSizeRepository
  ) {}

  async execute(id: string): Promise<void> {
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

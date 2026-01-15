import { IItemSizeRepository } from '../../repositories/IItemSizeRepository';
import { ItemSize, UpdateItemSizeDTO } from '../../entities/ItemSize';
import { ValidationError } from '../../../shared/errors/AppError';

export class UpdateItemSizeUseCase {
  constructor(private itemSizeRepository: IItemSizeRepository) { }

  async execute(
    id: string,
    item_id: string,
    sizeData: UpdateItemSizeDTO
  ): Promise<ItemSize> {
    // If code is being updated, check for uniqueness
    if (sizeData.code) {
      const codeExists = await this.itemSizeRepository.exists(sizeData.code, item_id, id);
      if (codeExists) {
        throw new ValidationError(`Size code '${sizeData.code}' already exists for this item`);
      }
    }

    return await this.itemSizeRepository.update(id, item_id, sizeData);
  }
}

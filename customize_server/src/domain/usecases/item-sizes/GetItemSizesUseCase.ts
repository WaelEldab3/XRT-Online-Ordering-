import { IItemSizeRepository } from '../../repositories/IItemSizeRepository';
import { ItemSize, ItemSizeFilters } from '../../entities/ItemSize';

export class GetItemSizesUseCase {
  constructor(private itemSizeRepository: IItemSizeRepository) { }

  async execute(filters: ItemSizeFilters): Promise<ItemSize[]> {
    return await this.itemSizeRepository.findAll(filters);
  }
}

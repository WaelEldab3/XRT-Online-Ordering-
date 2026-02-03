import { IModifierRepository } from '../../repositories/IModifierRepository';

export class UpdateModifierSortOrderUseCase {
  constructor(private modifierRepository: IModifierRepository) {}

  async execute(items: { id: string; order: number }[]): Promise<void> {
    return this.modifierRepository.updateSortOrder(items);
  }
}

import { IModifierGroupRepository } from '../../repositories/IModifierGroupRepository';
import { NotFoundError, ValidationError } from '../../../shared/errors/AppError';

export class DeleteModifierGroupUseCase {
  constructor(
    private modifierGroupRepository: IModifierGroupRepository
  ) {}

  async execute(id: string, business_id: string): Promise<void> {
    const modifierGroup = await this.modifierGroupRepository.findById(id, business_id);

    if (!modifierGroup) {
      throw new NotFoundError('Modifier Group');
    }

    // Check if modifier group is used by any items
    const isUsed = await this.modifierGroupRepository.isUsedByItems(id);
    if (isUsed) {
      throw new ValidationError('Cannot delete modifier group that is assigned to items. Please remove all item assignments first.');
    }

    await this.modifierGroupRepository.delete(id, business_id);
  }
}

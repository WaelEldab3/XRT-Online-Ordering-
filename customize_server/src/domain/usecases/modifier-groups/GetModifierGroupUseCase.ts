import { IModifierGroupRepository } from '../../repositories/IModifierGroupRepository';
import { ModifierGroup } from '../../entities/ModifierGroup';
import { NotFoundError } from '../../../shared/errors/AppError';

export class GetModifierGroupUseCase {
  constructor(
    private modifierGroupRepository: IModifierGroupRepository
  ) {}

  async execute(id: string, business_id?: string): Promise<ModifierGroup> {
    const modifierGroup = await this.modifierGroupRepository.findById(id, business_id);
    
    if (!modifierGroup) {
      throw new NotFoundError('Modifier Group');
    }

    return modifierGroup;
  }
}

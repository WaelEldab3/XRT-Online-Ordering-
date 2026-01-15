import { IModifierGroupRepository, PaginatedModifierGroups } from '../../repositories/IModifierGroupRepository';
import { ModifierGroupFilters } from '../../entities/ModifierGroup';

export class GetModifierGroupsUseCase {
  constructor(
    private modifierGroupRepository: IModifierGroupRepository
  ) {}

  async execute(filters: ModifierGroupFilters): Promise<PaginatedModifierGroups> {
    return await this.modifierGroupRepository.findAll(filters);
  }
}

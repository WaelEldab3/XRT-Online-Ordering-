import { IModifierGroupRepository } from '../../repositories/IModifierGroupRepository';
import { ModifierGroup, CreateModifierGroupDTO } from '../../entities/ModifierGroup';
import { ValidationError } from '../../../shared/errors/AppError';

export class CreateModifierGroupUseCase {
  constructor(
    private modifierGroupRepository: IModifierGroupRepository
  ) { }

  async execute(data: CreateModifierGroupDTO): Promise<ModifierGroup> {
    // Validate min/max rules
    if (data.max_select < data.min_select) {
      throw new ValidationError('max_select must be greater than or equal to min_select');
    }

    if (data.min_select < 0) {
      throw new ValidationError('min_select must be greater than or equal to 0');
    }

    if (data.max_select < 1) {
      throw new ValidationError('max_select must be greater than or equal to 1');
    }

    // Validate quantity levels
    if (data.quantity_levels && data.quantity_levels.length > 0) {
      const defaultCount = data.quantity_levels.filter(ql => ql.is_default).length;
      if (defaultCount > 1) {
        throw new ValidationError('Only one quantity level can be marked as default');
      }

      // Validate unique quantities
      const quantities = data.quantity_levels.map(ql => ql.quantity);
      const uniqueQuantities = new Set(quantities);
      if (quantities.length !== uniqueQuantities.size) {
        throw new ValidationError('Quantity levels must have unique quantities');
      }
    }

    // Validate prices by size
    if (data.prices_by_size && data.prices_by_size.length > 0) {
      const sizeIds = data.prices_by_size.map(ps => ps.size_id);
      const uniqueSizeIds = new Set(sizeIds);
      if (sizeIds.length !== uniqueSizeIds.size) {
        throw new ValidationError('Prices by size must have unique size IDs');
      }
    }

    // Check if name already exists
    const nameExists = await this.modifierGroupRepository.exists(data.name, data.business_id);
    if (nameExists) {
      throw new ValidationError('Modifier group name already exists for this business');
    }

    return await this.modifierGroupRepository.create(data);
  }
}

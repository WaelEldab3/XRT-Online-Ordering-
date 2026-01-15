import { IModifierRepository } from '../../repositories/IModifierRepository';
import { NotFoundError } from '../../../shared/errors/AppError';

export class DeleteModifierUseCase {
  constructor(
    private modifierRepository: IModifierRepository
  ) {}

  async execute(id: string, modifier_group_id: string): Promise<void> {
    const modifier = await this.modifierRepository.findById(id, modifier_group_id);

    if (!modifier) {
      throw new NotFoundError('Modifier');
    }

    await this.modifierRepository.delete(id, modifier_group_id);
  }
}

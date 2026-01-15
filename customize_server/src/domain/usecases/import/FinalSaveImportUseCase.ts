import { IImportSessionRepository } from '../../repositories/IImportSessionRepository';
import { ImportSaveService } from '../../../shared/services/ImportSaveService';
import { ImportSession } from '../../entities/ImportSession';
import { ValidationError } from '../../../shared/errors/AppError';
import { ItemRepository } from '../../../infrastructure/repositories/ItemRepository';
import { ItemSizeRepository } from '../../../infrastructure/repositories/ItemSizeRepository';
import { ModifierGroupRepository } from '../../../infrastructure/repositories/ModifierGroupRepository';
import { ModifierRepository } from '../../../infrastructure/repositories/ModifierRepository';
import { CategoryRepository } from '../../../infrastructure/repositories/CategoryRepository';

export class FinalSaveImportUseCase {
  private importSaveService: ImportSaveService;

  constructor(private importSessionRepository: IImportSessionRepository) {
    const itemRepository = new ItemRepository();
    const itemSizeRepository = new ItemSizeRepository();
    const modifierGroupRepository = new ModifierGroupRepository();
    const modifierRepository = new ModifierRepository();
    const categoryRepository = new CategoryRepository();

    this.importSaveService = new ImportSaveService(
      itemRepository,
      itemSizeRepository,
      modifierGroupRepository,
      modifierRepository,
      categoryRepository
    );
  }

  async execute(sessionId: string, user_id: string): Promise<void> {
    const session = await this.importSessionRepository.findById(sessionId, user_id);
    if (!session) {
      throw new ValidationError('Import session not found');
    }

    // Re-validate before saving
    if (session.validationErrors.length > 0) {
      throw new ValidationError('Cannot save import session with validation errors. Please fix all errors first.');
    }

    // Save all data in transaction
    await this.importSaveService.saveAll(session.parsedData, session.business_id);

    // Mark session as confirmed
    await this.importSessionRepository.update(sessionId, user_id, {
      status: 'confirmed',
    });
  }
}

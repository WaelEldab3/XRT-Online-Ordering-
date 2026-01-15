import { IImportSessionRepository } from '../../repositories/IImportSessionRepository';
import { ValidationError } from '../../../shared/errors/AppError';

export class DiscardImportSessionUseCase {
  constructor(private importSessionRepository: IImportSessionRepository) { }

  async execute(sessionId: string, user_id: string): Promise<void> {
    const session = await this.importSessionRepository.findById(sessionId, user_id);
    if (!session) {
      throw new ValidationError('Import session not found');
    }

    if (session.status === 'confirmed') {
      throw new ValidationError('Cannot discard a confirmed import session');
    }

    await this.importSessionRepository.update(sessionId, user_id, {
      status: 'discarded',
    });
  }
}

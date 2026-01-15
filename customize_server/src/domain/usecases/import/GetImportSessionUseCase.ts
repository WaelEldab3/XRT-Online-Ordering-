import { IImportSessionRepository } from '../../repositories/IImportSessionRepository';
import { ImportSession } from '../../entities/ImportSession';

export class GetImportSessionUseCase {
  constructor(private importSessionRepository: IImportSessionRepository) { }

  async execute(sessionId: string, user_id: string): Promise<ImportSession | null> {
    return await this.importSessionRepository.findById(sessionId, user_id);
  }
}

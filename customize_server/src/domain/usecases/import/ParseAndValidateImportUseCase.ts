import { IImportSessionRepository } from '../../repositories/IImportSessionRepository';
import { ImportSession, ParsedImportData } from '../../entities/ImportSession';
import { ImportValidationService } from '../../../shared/services/ImportValidationService';
import { CSVParser } from '../../../shared/utils/csvParser';

export class ParseAndValidateImportUseCase {
  constructor(private importSessionRepository: IImportSessionRepository) { }

  async execute(
    file: Express.Multer.File,
    user_id: string,
    business_id: string
  ): Promise<ImportSession> {
    // Parse CSV/ZIP
    const { data, files } = await CSVParser.parseUpload(file);

    // Validate data
    const validation = ImportValidationService.validate(data, business_id, files[0] || 'import.csv');

    // Create ImportSession
    const session = await this.importSessionRepository.create({
      user_id,
      business_id,
      parsedData: data,
      validationErrors: validation.errors,
      validationWarnings: validation.warnings,
      originalFiles: files,
    });

    // Update status based on validation results
    const status = validation.errors.length > 0 ? 'draft' : 'validated';
    return await this.importSessionRepository.update(session.id, user_id, { status });
  }
}

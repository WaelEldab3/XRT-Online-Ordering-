"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParseAndValidateImportUseCase = void 0;
const ImportValidationService_1 = require("../../../shared/services/ImportValidationService");
const csvParser_1 = require("../../../shared/utils/csvParser");
class ParseAndValidateImportUseCase {
    constructor(importSessionRepository) {
        this.importSessionRepository = importSessionRepository;
    }
    async execute(file, user_id, business_id) {
        // Parse CSV/ZIP
        const { data, files } = await csvParser_1.CSVParser.parseUpload(file);
        // Validate data
        const validation = ImportValidationService_1.ImportValidationService.validate(data, business_id, files[0] || 'import.csv');
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
exports.ParseAndValidateImportUseCase = ParseAndValidateImportUseCase;

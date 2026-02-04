"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinalSaveImportUseCase = void 0;
const ImportSaveService_1 = require("../../../shared/services/ImportSaveService");
const AppError_1 = require("../../../shared/errors/AppError");
const ItemRepository_1 = require("../../../infrastructure/repositories/ItemRepository");
const ItemSizeRepository_1 = require("../../../infrastructure/repositories/ItemSizeRepository");
const ModifierGroupRepository_1 = require("../../../infrastructure/repositories/ModifierGroupRepository");
const ModifierRepository_1 = require("../../../infrastructure/repositories/ModifierRepository");
const CategoryRepository_1 = require("../../../infrastructure/repositories/CategoryRepository");
const KitchenSectionRepository_1 = require("../../../infrastructure/repositories/KitchenSectionRepository");
class FinalSaveImportUseCase {
    constructor(importSessionRepository) {
        this.importSessionRepository = importSessionRepository;
        const itemRepository = new ItemRepository_1.ItemRepository();
        const itemSizeRepository = new ItemSizeRepository_1.ItemSizeRepository();
        const modifierGroupRepository = new ModifierGroupRepository_1.ModifierGroupRepository();
        const modifierRepository = new ModifierRepository_1.ModifierRepository();
        const categoryRepository = new CategoryRepository_1.CategoryRepository();
        const kitchenSectionRepository = new KitchenSectionRepository_1.KitchenSectionRepository();
        this.importSaveService = new ImportSaveService_1.ImportSaveService(itemRepository, itemSizeRepository, modifierGroupRepository, modifierRepository, categoryRepository, kitchenSectionRepository);
    }
    async execute(sessionId, user_id) {
        const session = await this.importSessionRepository.findById(sessionId, user_id);
        if (!session) {
            throw new AppError_1.ValidationError('Import session not found');
        }
        // Re-validate before saving
        if (session.validationErrors.length > 0) {
            throw new AppError_1.ValidationError('Cannot save import session with validation errors. Please fix all errors first.');
        }
        // Save all data in transaction
        const rollbackOps = await this.importSaveService.saveAll(session.parsedData, session.business_id);
        // Mark session as confirmed
        await this.importSessionRepository.update(sessionId, user_id, {
            status: 'confirmed',
            rollbackData: rollbackOps,
        });
    }
}
exports.FinalSaveImportUseCase = FinalSaveImportUseCase;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KitchenSectionController = void 0;
const KitchenSectionRepository_1 = require("../../infrastructure/repositories/KitchenSectionRepository");
const GetKitchenSectionsUseCase_1 = require("../../domain/usecases/kitchen-sections/GetKitchenSectionsUseCase");
const response_1 = require("../../shared/utils/response");
const asyncHandler_1 = require("../../shared/utils/asyncHandler");
const AppError_1 = require("../../shared/errors/AppError");
const roles_1 = require("../../shared/constants/roles");
class KitchenSectionController {
    constructor() {
        this.getAll = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const business_id = req.user?.business_id || req.query.business_id;
            if (!business_id && req.user?.role !== roles_1.UserRole.SUPER_ADMIN) {
                throw new AppError_1.ValidationError('business_id is required');
            }
            // Allow looking up by specific business_id if provided, otherwise fail or restricted?
            // Using cast for simplicity as repository handles string
            const sections = await this.getKitchenSectionsUseCase.execute(business_id);
            return (0, response_1.sendSuccess)(res, 'Kitchen sections retrieved successfully', sections);
        });
        const kitchenSectionRepository = new KitchenSectionRepository_1.KitchenSectionRepository();
        this.getKitchenSectionsUseCase = new GetKitchenSectionsUseCase_1.GetKitchenSectionsUseCase(kitchenSectionRepository);
    }
}
exports.KitchenSectionController = KitchenSectionController;

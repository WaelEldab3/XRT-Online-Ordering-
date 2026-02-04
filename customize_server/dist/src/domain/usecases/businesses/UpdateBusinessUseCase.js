"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateBusinessUseCase = void 0;
const AppError_1 = require("../../../shared/errors/AppError");
class UpdateBusinessUseCase {
    constructor(businessRepository) {
        this.businessRepository = businessRepository;
    }
    async execute(businessData) {
        const existingBusiness = await this.businessRepository.findOne();
        if (!existingBusiness) {
            throw new AppError_1.NotFoundError('Business');
        }
        return await this.businessRepository.update(existingBusiness.id, businessData);
    }
}
exports.UpdateBusinessUseCase = UpdateBusinessUseCase;

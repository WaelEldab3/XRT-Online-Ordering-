"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetBusinessUseCase = void 0;
const AppError_1 = require("../../../shared/errors/AppError");
class GetBusinessUseCase {
    constructor(businessRepository) {
        this.businessRepository = businessRepository;
    }
    async execute() {
        const business = await this.businessRepository.findOne();
        if (!business) {
            throw new AppError_1.NotFoundError('Business');
        }
        return business;
    }
}
exports.GetBusinessUseCase = GetBusinessUseCase;

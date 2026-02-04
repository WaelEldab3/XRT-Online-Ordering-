"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetKitchenSectionsUseCase = void 0;
class GetKitchenSectionsUseCase {
    constructor(kitchenSectionRepository) {
        this.kitchenSectionRepository = kitchenSectionRepository;
    }
    async execute(business_id) {
        return this.kitchenSectionRepository.findAll({ business_id });
    }
}
exports.GetKitchenSectionsUseCase = GetKitchenSectionsUseCase;

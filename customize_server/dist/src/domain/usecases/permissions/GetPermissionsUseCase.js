"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetPermissionsUseCase = void 0;
class GetPermissionsUseCase {
    constructor(permissionRepository) {
        this.permissionRepository = permissionRepository;
    }
    /**
     * Get all permissions, optionally filtered
     */
    async execute(filters) {
        return this.permissionRepository.findAll(filters);
    }
    /**
     * Get all permissions grouped by module
     */
    async executeGrouped() {
        const permissions = await this.permissionRepository.findAll();
        const grouped = {};
        for (const perm of permissions) {
            if (!grouped[perm.module]) {
                grouped[perm.module] = [];
            }
            grouped[perm.module].push(perm);
        }
        return grouped;
    }
    /**
     * Get all unique module names
     */
    async getModules() {
        return this.permissionRepository.getModules();
    }
}
exports.GetPermissionsUseCase = GetPermissionsUseCase;

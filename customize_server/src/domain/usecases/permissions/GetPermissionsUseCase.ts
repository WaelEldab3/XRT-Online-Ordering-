import { IPermissionRepository } from '../../repositories/IPermissionRepository';
import { Permission, PermissionsByModule } from '../../entities/Permission';

export class GetPermissionsUseCase {
    constructor(private permissionRepository: IPermissionRepository) { }

    /**
     * Get all permissions, optionally filtered
     */
    async execute(filters?: {
        module?: string;
        isActive?: boolean;
        search?: string;
    }): Promise<Permission[]> {
        return this.permissionRepository.findAll(filters);
    }

    /**
     * Get all permissions grouped by module
     */
    async executeGrouped(): Promise<PermissionsByModule> {
        const permissions = await this.permissionRepository.findAll();
        const grouped: PermissionsByModule = {};

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
    async getModules(): Promise<string[]> {
        return this.permissionRepository.getModules();
    }
}

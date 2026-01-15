import { Permission, CreatePermissionDTO, UpdatePermissionDTO, PermissionFilters } from '../entities/Permission';

export interface IPermissionRepository {
    findAll(filters?: PermissionFilters): Promise<Permission[]>;
    findById(id: string): Promise<Permission | null>;
    findByKey(key: string): Promise<Permission | null>;
    findByModule(module: string): Promise<Permission[]>;
    findActive(): Promise<Permission[]>;
    create(data: CreatePermissionDTO): Promise<Permission>;
    createMany(data: CreatePermissionDTO[]): Promise<Permission[]>;
    update(id: string, data: UpdatePermissionDTO): Promise<Permission | null>;
    delete(id: string): Promise<boolean>;
    existsByKey(key: string): Promise<boolean>;
    getModules(): Promise<string[]>;
}

/**
 * Permission Entity
 * 
 * Represents a single permission in the system.
 * Permissions are automatically synced from code definitions on startup.
 */

export interface Permission {
    id: string;
    key: string;           // Unique key, e.g., 'modifier_groups:create'
    module: string;        // Module name, e.g., 'modifier_groups'
    action: string;        // Action name, e.g., 'create'
    description: string;   // Human-readable description
    isSystem: boolean;     // If true, cannot be deleted (system permission)
    isActive: boolean;     // If false, permission is disabled
    created_at: Date;
    updated_at: Date;
}

export interface CreatePermissionDTO {
    key: string;
    module: string;
    action: string;
    description: string;
    isSystem?: boolean;
    isActive?: boolean;
}

export interface UpdatePermissionDTO {
    description?: string;
    isActive?: boolean;
}

export interface PermissionFilters {
    module?: string;
    isActive?: boolean;
    isSystem?: boolean;
    search?: string;
}

/**
 * Permission grouped by module for UI display
 */
export interface PermissionsByModule {
    [module: string]: Permission[];
}

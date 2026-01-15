import { CreatePermissionDTO } from '../../domain/entities/Permission';

/**
 * Permission Definition Interface
 * Used to define permissions in code with full metadata
 */
export interface PermissionDefinition {
    key: string;
    module: string;
    action: string;
    description: string;
    isSystem?: boolean;
}

/**
 * All permission definitions for the system
 * These are automatically synced to the database on startup
 */
export const PERMISSION_DEFINITIONS: PermissionDefinition[] = [
    // ============================================================
    // USERS MODULE
    // ============================================================
    {
        key: 'users:read',
        module: 'users',
        action: 'read',
        description: 'View users list and user details',
        isSystem: true,
    },
    {
        key: 'users:create',
        module: 'users',
        action: 'create',
        description: 'Create new users',
        isSystem: true,
    },
    {
        key: 'users:update',
        module: 'users',
        action: 'update',
        description: 'Update user information',
        isSystem: true,
    },
    {
        key: 'users:delete',
        module: 'users',
        action: 'delete',
        description: 'Delete users',
        isSystem: true,
    },
    {
        key: 'users:approve',
        module: 'users',
        action: 'approve',
        description: 'Approve user accounts',
        isSystem: true,
    },
    {
        key: 'users:ban',
        module: 'users',
        action: 'ban',
        description: 'Ban or unban users',
        isSystem: true,
    },

    // ============================================================
    // ROLES MODULE (Super Admin Only)
    // ============================================================
    {
        key: 'roles:read',
        module: 'roles',
        action: 'read',
        description: 'View roles list and role details',
        isSystem: true,
    },
    {
        key: 'roles:create',
        module: 'roles',
        action: 'create',
        description: 'Create new custom roles',
        isSystem: true,
    },
    {
        key: 'roles:update',
        module: 'roles',
        action: 'update',
        description: 'Update roles and their permissions',
        isSystem: true,
    },
    {
        key: 'roles:delete',
        module: 'roles',
        action: 'delete',
        description: 'Delete custom roles',
        isSystem: true,
    },

    // ============================================================
    // PERMISSIONS MODULE (Super Admin Only)
    // ============================================================
    {
        key: 'permissions:read',
        module: 'permissions',
        action: 'read',
        description: 'View all available permissions',
        isSystem: true,
    },
    {
        key: 'permissions:update',
        module: 'permissions',
        action: 'update',
        description: 'Enable or disable permissions',
        isSystem: true,
    },

    // ============================================================
    // CATEGORIES MODULE
    // ============================================================
    {
        key: 'categories:read',
        module: 'categories',
        action: 'read',
        description: 'View categories list and details',
    },
    {
        key: 'categories:create',
        module: 'categories',
        action: 'create',
        description: 'Create new categories',
    },
    {
        key: 'categories:update',
        module: 'categories',
        action: 'update',
        description: 'Update category information',
    },
    {
        key: 'categories:delete',
        module: 'categories',
        action: 'delete',
        description: 'Delete categories',
    },

    // ============================================================
    // ITEMS MODULE
    // ============================================================
    {
        key: 'items:read',
        module: 'items',
        action: 'read',
        description: 'View items list and details',
    },
    {
        key: 'items:create',
        module: 'items',
        action: 'create',
        description: 'Create new items',
    },
    {
        key: 'items:update',
        module: 'items',
        action: 'update',
        description: 'Update item information',
    },
    {
        key: 'items:delete',
        module: 'items',
        action: 'delete',
        description: 'Delete items',
    },

    // ============================================================
    // MODIFIER GROUPS MODULE
    // ============================================================
    {
        key: 'modifier_groups:read',
        module: 'modifier_groups',
        action: 'read',
        description: 'View modifier groups list and details',
    },
    {
        key: 'modifier_groups:create',
        module: 'modifier_groups',
        action: 'create',
        description: 'Create new modifier groups',
    },
    {
        key: 'modifier_groups:update',
        module: 'modifier_groups',
        action: 'update',
        description: 'Update modifier group information',
    },
    {
        key: 'modifier_groups:delete',
        module: 'modifier_groups',
        action: 'delete',
        description: 'Delete modifier groups',
    },

    // ============================================================
    // MODIFIERS MODULE
    // ============================================================
    {
        key: 'modifiers:read',
        module: 'modifiers',
        action: 'read',
        description: 'View modifiers list and details',
    },
    {
        key: 'modifiers:create',
        module: 'modifiers',
        action: 'create',
        description: 'Create new modifiers',
    },
    {
        key: 'modifiers:update',
        module: 'modifiers',
        action: 'update',
        description: 'Update modifier information',
    },
    {
        key: 'modifiers:delete',
        module: 'modifiers',
        action: 'delete',
        description: 'Delete modifiers',
    },

    // ============================================================
    // CUSTOMERS MODULE
    // ============================================================
    {
        key: 'customers:read',
        module: 'customers',
        action: 'read',
        description: 'View customers list and details',
    },
    {
        key: 'customers:create',
        module: 'customers',
        action: 'create',
        description: 'Create new customers',
    },
    {
        key: 'customers:update',
        module: 'customers',
        action: 'update',
        description: 'Update customer information',
    },
    {
        key: 'customers:delete',
        module: 'customers',
        action: 'delete',
        description: 'Delete customers',
    },

    // ============================================================
    // SETTINGS MODULE
    // ============================================================
    {
        key: 'settings:read',
        module: 'settings',
        action: 'read',
        description: 'View business settings',
    },
    {
        key: 'settings:update',
        module: 'settings',
        action: 'update',
        description: 'Update business settings',
    },

    // ============================================================
    // BUSINESS MODULE
    // ============================================================
    {
        key: 'business:read',
        module: 'business',
        action: 'read',
        description: 'View business information',
    },
    {
        key: 'business:update',
        module: 'business',
        action: 'update',
        description: 'Update business information',
    },

    // ============================================================
    // WITHDRAWALS MODULE
    // ============================================================
    {
        key: 'withdraws:read',
        module: 'withdraws',
        action: 'read',
        description: 'View withdrawal requests',
    },
    {
        key: 'withdraws:create',
        module: 'withdraws',
        action: 'create',
        description: 'Create withdrawal requests',
    },
    {
        key: 'withdraws:update',
        module: 'withdraws',
        action: 'update',
        description: 'Update withdrawal requests',
    },
    {
        key: 'withdraws:delete',
        module: 'withdraws',
        action: 'delete',
        description: 'Delete withdrawal requests',
    },

    // ============================================================
    // CONTENT MODULE
    // ============================================================
    {
        key: 'content:read',
        module: 'content',
        action: 'read',
        description: 'View content',
    },
    {
        key: 'content:create',
        module: 'content',
        action: 'create',
        description: 'Create new content',
    },
    {
        key: 'content:update',
        module: 'content',
        action: 'update',
        description: 'Update content',
    },
    {
        key: 'content:delete',
        module: 'content',
        action: 'delete',
        description: 'Delete content',
    },
    {
        key: 'content:publish',
        module: 'content',
        action: 'publish',
        description: 'Publish content',
    },

    // ============================================================
    // SYSTEM MODULE (Super Admin Only)
    // ============================================================
    {
        key: 'system:read',
        module: 'system',
        action: 'read',
        description: 'View system information',
        isSystem: true,
    },
    {
        key: 'system:update',
        module: 'system',
        action: 'update',
        description: 'Update system configuration',
        isSystem: true,
    },
    {
        key: 'system:backup',
        module: 'system',
        action: 'backup',
        description: 'Create and manage backups',
        isSystem: true,
    },
    {
        key: 'system:logs',
        module: 'system',
        action: 'logs',
        description: 'View system logs',
        isSystem: true,
    },

    // ============================================================
    // PROFILE MODULE (Self)
    // ============================================================
    {
        key: 'profile:read',
        module: 'profile',
        action: 'read',
        description: 'View own profile',
    },
    {
        key: 'profile:update',
        module: 'profile',
        action: 'update',
        description: 'Update own profile',
    },

    // ============================================================
    // ADMIN MODULE
    // ============================================================
    {
        key: 'admin:dashboard',
        module: 'admin',
        action: 'dashboard',
        description: 'Access admin dashboard',
    },
    {
        key: 'admin:settings',
        module: 'admin',
        action: 'settings',
        description: 'Access admin settings',
    },
    {
        key: 'admin:analytics',
        module: 'admin',
        action: 'analytics',
        description: 'View analytics and reports',
    },
];

/**
 * Convert permission definitions to CreatePermissionDTO format
 */
export function getPermissionDTOs(): CreatePermissionDTO[] {
    return PERMISSION_DEFINITIONS.map((def) => ({
        key: def.key,
        module: def.module,
        action: def.action,
        description: def.description,
        isSystem: def.isSystem ?? false,
        isActive: def.isSystem ? true : false, // System permissions active by default
    }));
}

/**
 * Get all unique modules from permission definitions
 */
export function getModules(): string[] {
    const modules = new Set(PERMISSION_DEFINITIONS.map((p) => p.module));
    return Array.from(modules).sort();
}

/**
 * Get permission definitions grouped by module
 */
export function getPermissionsByModule(): Record<string, PermissionDefinition[]> {
    const grouped: Record<string, PermissionDefinition[]> = {};

    for (const perm of PERMISSION_DEFINITIONS) {
        if (!grouped[perm.module]) {
            grouped[perm.module] = [];
        }
        grouped[perm.module].push(perm);
    }

    return grouped;
}

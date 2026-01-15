/**
 * System Roles & Permissions Constants
 * 
 * IMPORTANT: Only SUPER_ADMIN is a built-in system role.
 * All other roles are CUSTOM ROLES created by super_admin and stored in the database.
 */

// ============================================================
// SYSTEM ROLE (Built-in, immutable)
// ============================================================

export const SYSTEM_ROLES = {
  SUPER_ADMIN: 'super_admin',
} as const;

export type SystemRole = typeof SYSTEM_ROLES[keyof typeof SYSTEM_ROLES];

/**
 * @deprecated Use SYSTEM_ROLES.SUPER_ADMIN instead.
 * This enum is kept for backward compatibility during migration.
 * Custom roles should be fetched from the database.
 */
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  // Legacy roles - these should be created as custom roles by super_admin
  BUSINESS_ADMIN = 'admin',
  STAFF = 'manager',
  CLIENT = 'client',
  USER = 'user',
}

/**
 * @deprecated Use SYSTEM_ROLES instead
 */
export const ROLES = {
  SUPER_ADMIN: UserRole.SUPER_ADMIN,
  BUSINESS_ADMIN: UserRole.BUSINESS_ADMIN,
  STAFF: UserRole.STAFF,
  CLIENT: UserRole.CLIENT,
  USER: UserRole.USER,
} as const;

// ============================================================
// PERMISSIONS
// ============================================================

/**
 * Permission key format: module:action
 * Examples: users:read, users:create, items:delete
 */
export const PERMISSIONS = {
  // ----------------------
  // User Management
  // ----------------------
  USERS_READ: 'users:read',
  USERS_CREATE: 'users:create',
  USERS_UPDATE: 'users:update',
  USERS_DELETE: 'users:delete',
  USERS_APPROVE: 'users:approve',
  USERS_BAN: 'users:ban',

  // ----------------------
  // Categories
  // ----------------------
  CATEGORIES_READ: 'categories:read',
  CATEGORIES_CREATE: 'categories:create',
  CATEGORIES_UPDATE: 'categories:update',
  CATEGORIES_DELETE: 'categories:delete',

  // ----------------------
  // Items
  // ----------------------
  ITEMS_READ: 'items:read',
  ITEMS_CREATE: 'items:create',
  ITEMS_UPDATE: 'items:update',
  ITEMS_DELETE: 'items:delete',

  // ----------------------
  // Modifier Groups
  // ----------------------
  MODIFIER_GROUPS_READ: 'modifier_groups:read',
  MODIFIER_GROUPS_CREATE: 'modifier_groups:create',
  MODIFIER_GROUPS_UPDATE: 'modifier_groups:update',
  MODIFIER_GROUPS_DELETE: 'modifier_groups:delete',

  // ----------------------
  // Modifiers
  // ----------------------
  MODIFIERS_READ: 'modifiers:read',
  MODIFIERS_CREATE: 'modifiers:create',
  MODIFIERS_UPDATE: 'modifiers:update',
  MODIFIERS_DELETE: 'modifiers:delete',

  // ----------------------
  // Customers
  // ----------------------
  CUSTOMERS_READ: 'customers:read',
  CUSTOMERS_CREATE: 'customers:create',
  CUSTOMERS_UPDATE: 'customers:update',
  CUSTOMERS_DELETE: 'customers:delete',

  // ----------------------
  // Roles (Super Admin Only)
  // ----------------------
  ROLES_READ: 'roles:read',
  ROLES_CREATE: 'roles:create',
  ROLES_UPDATE: 'roles:update',
  ROLES_DELETE: 'roles:delete',

  // ----------------------
  // Permissions (Super Admin Only)
  // ----------------------
  PERMISSIONS_READ: 'permissions:read',
  PERMISSIONS_UPDATE: 'permissions:update',

  // ----------------------
  // Settings
  // ----------------------
  SETTINGS_READ: 'settings:read',
  SETTINGS_UPDATE: 'settings:update',

  // ----------------------
  // Business
  // ----------------------
  BUSINESS_READ: 'business:read',
  BUSINESS_UPDATE: 'business:update',

  // ----------------------
  // Withdrawals
  // ----------------------
  WITHDRAWS_READ: 'withdraws:read',
  WITHDRAWS_CREATE: 'withdraws:create',
  WITHDRAWS_UPDATE: 'withdraws:update',
  WITHDRAWS_DELETE: 'withdraws:delete',

  // ----------------------
  // Content Management
  // ----------------------
  CONTENT_READ: 'content:read',
  CONTENT_CREATE: 'content:create',
  CONTENT_UPDATE: 'content:update',
  CONTENT_DELETE: 'content:delete',
  CONTENT_PUBLISH: 'content:publish',

  // ----------------------
  // System (Super Admin Only)
  // ----------------------
  SYSTEM_READ: 'system:read',
  SYSTEM_UPDATE: 'system:update',
  SYSTEM_BACKUP: 'system:backup',
  SYSTEM_LOGS: 'system:logs',

  // ----------------------
  // Profile (Self)
  // ----------------------
  PROFILE_READ: 'profile:read',
  PROFILE_UPDATE: 'profile:update',

  // ----------------------
  // Admin
  // ----------------------
  ADMIN_DASHBOARD: 'admin:dashboard',
  ADMIN_SETTINGS: 'admin:settings',
  ADMIN_ANALYTICS: 'admin:analytics',
} as const;

export type PermissionKey = typeof PERMISSIONS[keyof typeof PERMISSIONS];

export const ALL_PERMISSIONS = Object.values(PERMISSIONS);

/**
 * Check if a role is the super_admin system role
 */
export function isSuperAdmin(role: string | null | undefined): boolean {
  return role === SYSTEM_ROLES.SUPER_ADMIN;
}

/**
 * Permissions that only super_admin can have/assign
 * These are system-level permissions that should never be assigned to custom roles
 */
export const SUPER_ADMIN_ONLY_PERMISSIONS: string[] = [
  PERMISSIONS.ROLES_CREATE,
  PERMISSIONS.ROLES_UPDATE,
  PERMISSIONS.ROLES_DELETE,
  PERMISSIONS.PERMISSIONS_UPDATE,
  PERMISSIONS.SYSTEM_UPDATE,
  PERMISSIONS.SYSTEM_BACKUP,
  PERMISSIONS.SYSTEM_LOGS,
  PERMISSIONS.USERS_APPROVE,
  PERMISSIONS.USERS_BAN,
];

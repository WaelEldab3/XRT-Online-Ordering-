"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.permissionRegistry = void 0;
const PermissionRepository_1 = require("../../infrastructure/repositories/PermissionRepository");
const permissionDefinitions_1 = require("./permissionDefinitions");
/**
 * Permission Registry
 *
 * Manages the automatic registration and synchronization of permissions
 * from code definitions to the database.
 *
 * Features:
 * - Auto-sync on startup
 * - Never deletes existing permissions
 * - New permissions are disabled by default (except system permissions)
 * - Logs all changes
 */
class PermissionRegistry {
    constructor() {
        this.registeredPermissions = new Map();
        this.synced = false;
        this.permissionRepository = new PermissionRepository_1.PermissionRepository();
        // Pre-register all defined permissions
        for (const perm of permissionDefinitions_1.PERMISSION_DEFINITIONS) {
            this.registeredPermissions.set(perm.key, perm);
        }
    }
    /**
     * Get all registered permission definitions
     */
    getAll() {
        return Array.from(this.registeredPermissions.values());
    }
    /**
     * Check if a permission key is registered
     */
    isRegistered(key) {
        return this.registeredPermissions.has(key);
    }
    /**
     * Get a specific permission definition
     */
    get(key) {
        return this.registeredPermissions.get(key);
    }
    /**
     * Register a new permission at runtime (for dynamic permissions)
     * Note: This only adds to the in-memory registry, not the database
     */
    register(permission) {
        if (!this.registeredPermissions.has(permission.key)) {
            this.registeredPermissions.set(permission.key, permission);
        }
    }
    /**
     * Sync all registered permissions with the database
     *
     * Rules:
     * 1. INSERT new permissions that don't exist in DB
     * 2. NEVER delete existing permissions
     * 3. NEVER modify existing permissions (except enable if system)
     * 4. New non-system permissions are DISABLED by default
     * 5. Log all new permissions added
     */
    async syncWithDatabase() {
        const permissionDTOs = (0, permissionDefinitions_1.getPermissionDTOs)();
        const result = await this.permissionRepository.upsertMany(permissionDTOs);
        this.synced = true;
        return {
            inserted: result.inserted,
            skipped: result.skipped,
            total: permissionDTOs.length,
        };
    }
    /**
     * Check if permissions have been synced with database
     */
    isSynced() {
        return this.synced;
    }
    /**
     * Get all permissions grouped by module
     */
    getByModule() {
        const grouped = {};
        for (const perm of this.registeredPermissions.values()) {
            if (!grouped[perm.module]) {
                grouped[perm.module] = [];
            }
            grouped[perm.module].push(perm);
        }
        return grouped;
    }
    /**
     * Validate an array of permission keys
     * Returns true if all keys are valid registered permissions
     */
    validatePermissionKeys(keys) {
        const invalid = [];
        for (const key of keys) {
            if (!this.registeredPermissions.has(key)) {
                invalid.push(key);
            }
        }
        return {
            valid: invalid.length === 0,
            invalid,
        };
    }
    /**
     * Get all system permission keys
     * These can only be used by super_admin
     */
    getSystemPermissionKeys() {
        return Array.from(this.registeredPermissions.values())
            .filter((p) => p.isSystem)
            .map((p) => p.key);
    }
    /**
     * Check if a permission is a system-only permission
     */
    isSystemPermission(key) {
        const perm = this.registeredPermissions.get(key);
        return perm?.isSystem ?? false;
    }
}
// Singleton instance
exports.permissionRegistry = new PermissionRegistry();

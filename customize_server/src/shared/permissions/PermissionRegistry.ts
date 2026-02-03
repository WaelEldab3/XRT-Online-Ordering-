import { PermissionRepository } from '../../infrastructure/repositories/PermissionRepository';
import {
  getPermissionDTOs,
  PERMISSION_DEFINITIONS,
  PermissionDefinition,
} from './permissionDefinitions';
import { CreatePermissionDTO } from '../../domain/entities/Permission';

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
  private permissionRepository: PermissionRepository;
  private registeredPermissions: Map<string, PermissionDefinition> = new Map();
  private synced: boolean = false;

  constructor() {
    this.permissionRepository = new PermissionRepository();

    // Pre-register all defined permissions
    for (const perm of PERMISSION_DEFINITIONS) {
      this.registeredPermissions.set(perm.key, perm);
    }
  }

  /**
   * Get all registered permission definitions
   */
  getAll(): PermissionDefinition[] {
    return Array.from(this.registeredPermissions.values());
  }

  /**
   * Check if a permission key is registered
   */
  isRegistered(key: string): boolean {
    return this.registeredPermissions.has(key);
  }

  /**
   * Get a specific permission definition
   */
  get(key: string): PermissionDefinition | undefined {
    return this.registeredPermissions.get(key);
  }

  /**
   * Register a new permission at runtime (for dynamic permissions)
   * Note: This only adds to the in-memory registry, not the database
   */
  register(permission: PermissionDefinition): void {
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
  async syncWithDatabase(): Promise<{ inserted: number; skipped: number; total: number }> {
    const permissionDTOs = getPermissionDTOs();
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
  isSynced(): boolean {
    return this.synced;
  }

  /**
   * Get all permissions grouped by module
   */
  getByModule(): Record<string, PermissionDefinition[]> {
    const grouped: Record<string, PermissionDefinition[]> = {};

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
  validatePermissionKeys(keys: string[]): { valid: boolean; invalid: string[] } {
    const invalid: string[] = [];

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
  getSystemPermissionKeys(): string[] {
    return Array.from(this.registeredPermissions.values())
      .filter((p) => p.isSystem)
      .map((p) => p.key);
  }

  /**
   * Check if a permission is a system-only permission
   */
  isSystemPermission(key: string): boolean {
    const perm = this.registeredPermissions.get(key);
    return perm?.isSystem ?? false;
  }
}

// Singleton instance
export const permissionRegistry = new PermissionRegistry();

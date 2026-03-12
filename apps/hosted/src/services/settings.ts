import { eq } from 'drizzle-orm';
import type { Database } from '../db/index';
import { settings } from '../db/schema';

/**
 * Application settings interface
 */
export interface AppSettings {
  // Tier limits (writes per day)
  anonymous_daily_limit: number;
  authenticated_daily_limit: number;
  admin_daily_limit: number; // -1 = unlimited

  // Request rate limiting
  rate_limit_window_seconds: number;
  rate_limit_max_requests: number;

  // Session settings
  anonymous_session_ttl_days: number;

  // Feature flags
  maintenance_mode: boolean;
  registration_enabled: boolean;
}

/**
 * Default settings values
 */
export const DEFAULT_SETTINGS: AppSettings = {
  anonymous_daily_limit: 100,
  authenticated_daily_limit: 1000,
  admin_daily_limit: -1, // unlimited
  rate_limit_window_seconds: 60,
  rate_limit_max_requests: 100,
  anonymous_session_ttl_days: 30,
  maintenance_mode: false,
  registration_enabled: true,
};

/**
 * Type guard for valid setting keys
 */
function isValidSettingKey(key: string): key is keyof AppSettings {
  return key in DEFAULT_SETTINGS;
}

/**
 * Settings service for managing application configuration
 */
export class SettingsService {
  private cache: AppSettings | null = null;
  private cacheExpiry = 0;
  private readonly CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

  constructor(
    private readonly db: Database,
    private readonly kv: KVNamespace,
  ) {}

  /**
   * Get a single setting value
   */
  async get<K extends keyof AppSettings>(key: K): Promise<AppSettings[K]> {
    const all = await this.getAll();
    return all[key];
  }

  /**
   * Set a single setting value
   */
  async set<K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K],
    updatedBy?: string,
  ): Promise<void> {
    const now = new Date();

    // Check if setting exists
    const existing = await this.db.select().from(settings).where(eq(settings.key, key)).get();

    if (existing) {
      // Update existing setting
      await this.db
        .update(settings)
        .set({
          value: JSON.stringify(value),
          updatedAt: now,
          updatedBy: updatedBy ?? null,
        })
        .where(eq(settings.key, key));
    } else {
      // Insert new setting
      await this.db.insert(settings).values({
        key,
        value: JSON.stringify(value),
        updatedAt: now,
        updatedBy: updatedBy ?? null,
      });
    }

    // Invalidate cache
    this.invalidateCache();
  }

  /**
   * Get all settings (with caching)
   */
  async getAll(): Promise<AppSettings> {
    // Check memory cache first
    if (this.cache && Date.now() < this.cacheExpiry) {
      return this.cache;
    }

    // Check KV cache
    const kvCached = await this.kv.get<AppSettings>('settings:all', 'json');
    if (kvCached) {
      this.cache = kvCached;
      this.cacheExpiry = Date.now() + this.CACHE_TTL_MS;
      return this.cache;
    }

    // Load from database
    const rows = await this.db.select().from(settings);
    const result: AppSettings = { ...DEFAULT_SETTINGS };

    for (const row of rows) {
      if (isValidSettingKey(row.key)) {
        try {
          const parsed = JSON.parse(row.value) as AppSettings[typeof row.key];
          // Type-safe assignment using a helper
          this.assignSetting(result, row.key, parsed);
        } catch {
          // Keep default if JSON parsing fails
        }
      }
    }

    // Cache the result
    this.cache = result;
    this.cacheExpiry = Date.now() + this.CACHE_TTL_MS;
    await this.kv.put('settings:all', JSON.stringify(result), {
      expirationTtl: 300, // 5 minutes
    });

    return result;
  }

  /**
   * Type-safe setting assignment helper
   */
  private assignSetting<K extends keyof AppSettings>(
    target: AppSettings,
    key: K,
    value: AppSettings[K],
  ): void {
    target[key] = value;
  }

  /**
   * Update multiple settings at once
   */
  async updateMany(updates: Partial<AppSettings>, updatedBy?: string): Promise<void> {
    const now = new Date();

    for (const [key, value] of Object.entries(updates)) {
      if (!isValidSettingKey(key) || value === undefined) {
        continue;
      }

      const existing = await this.db.select().from(settings).where(eq(settings.key, key)).get();

      if (existing) {
        await this.db
          .update(settings)
          .set({
            value: JSON.stringify(value),
            updatedAt: now,
            updatedBy: updatedBy ?? null,
          })
          .where(eq(settings.key, key));
      } else {
        await this.db.insert(settings).values({
          key,
          value: JSON.stringify(value),
          updatedAt: now,
          updatedBy: updatedBy ?? null,
        });
      }
    }

    // Invalidate cache
    this.invalidateCache();
  }

  /**
   * Reset a setting to its default value
   */
  async reset<K extends keyof AppSettings>(key: K, updatedBy?: string): Promise<void> {
    await this.set(key, DEFAULT_SETTINGS[key], updatedBy);
  }

  /**
   * Reset all settings to defaults
   */
  async resetAll(updatedBy?: string): Promise<void> {
    await this.updateMany(DEFAULT_SETTINGS, updatedBy);
  }

  /**
   * Invalidate all caches
   */
  private invalidateCache(): void {
    this.cache = null;
    this.cacheExpiry = 0;
    // Fire and forget KV deletion
    void this.kv.delete('settings:all');
  }
}

import { DataAccessError, DataErrorKind } from "../domain/errors";

export interface CacheStore {
  get(key: string): Promise<unknown | null>;
  set(key: string, value: unknown[], ttlSeconds: number): Promise<void>;
}

interface CacheEntry {
  expiresAt: number;
  value: unknown[];
}

export class MemoryCacheStore implements CacheStore {
  private entries = new Map<string, CacheEntry>();

  async get(key: string): Promise<unknown | null> {
    const entry = this.entries.get(key);
    if (!entry) {
      return null;
    }
    if (entry.expiresAt < Date.now()) {
      this.entries.delete(key);
      return null;
    }
    return structuredClone(entry.value);
  }

  async set(key: string, value: unknown[], ttlSeconds: number): Promise<void> {
    this.entries.set(key, {
      expiresAt: Date.now() + ttlSeconds * 1000,
      value: structuredClone(value),
    });
  }

  clear(): void {
    this.entries.clear();
  }
}

export class CloudflareCacheStore implements CacheStore {
  constructor(private readonly cache: Cache = (caches as unknown as { default: Cache }).default) {}

  private requestFor(key: string): Request {
    return new Request(`https://cache.cookpropertytax.local/socrata/${encodeURIComponent(key)}`);
  }

  async get(key: string): Promise<unknown | null> {
    const response = await this.cache.match(this.requestFor(key));
    if (!response) {
      return null;
    }
    const data = await response.json().catch(() => {
      throw new DataAccessError("Cached Socrata response was invalid.", DataErrorKind.InvalidCache);
    });
    if (!Array.isArray(data)) {
      throw new DataAccessError("Cached Socrata response was invalid.", DataErrorKind.InvalidCache);
    }
    return data;
  }

  async set(key: string, value: unknown[], ttlSeconds: number): Promise<void> {
    const response = Response.json(value, {
      headers: {
        "cache-control": `public, max-age=${ttlSeconds}`,
      },
    });
    await this.cache.put(this.requestFor(key), response);
  }
}

export const sharedMemoryCache = new MemoryCacheStore();

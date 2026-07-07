import { DataAccessError, DataErrorKind } from "../domain/errors";
import type { JsonValue } from "../domain/serdeTypes";
import { type CacheStore, sharedMemoryCache } from "./cache";
import { ConcurrencyLimiter } from "./limiter";

export const SOCRATA_DOMAIN = "https://datacatalog.cookcountyil.gov/resource";
export const DATASETS = {
  parcel_universe: "nj4t-kc8j",
  assessed_values: "uzyt-m557",
  res_characteristics: "x54s-btds",
  parcel_sales: "wvhk-k5uv",
} as const;

export type DatasetKey = keyof typeof DATASETS;
export type JsonRecord = Record<string, JsonValue>;

export interface SocrataResponse {
  rows: JsonRecord[];
  warnings: string[];
}

export interface SocrataClientOptions {
  appToken?: string;
  cache?: CacheStore;
  fetcher?: typeof fetch;
  sleep?: (ms: number) => Promise<void>;
  timeoutMs?: number;
  maxRetries?: number;
  pageSize?: number;
  ttlSeconds?: number;
  concurrency?: number;
  random?: () => number;
}

export interface FetchAllOptions {
  maxRows?: number;
}

const DEFAULT_TTL_SECONDS = 12 * 60 * 60;
const TRANSIENT_STATUSES = new Set([429, 500, 502, 503, 504]);

function normalizeParams(params: Record<string, string>): Record<string, string> {
  return Object.fromEntries(Object.entries(params).sort(([a], [b]) => a.localeCompare(b)));
}

function cacheKey(datasetKey: string, params: Record<string, string>): string {
  return JSON.stringify({ dataset: datasetKey, params: normalizeParams(params) });
}

function rowsFromUnknown(data: unknown, datasetKey: string): JsonRecord[] {
  if (!Array.isArray(data)) {
    throw new DataAccessError(
      `Socrata returned non-list JSON for ${datasetKey}.`,
      DataErrorKind.InvalidJson,
    );
  }
  return data.filter(
    (row): row is JsonRecord => Boolean(row) && typeof row === "object" && !Array.isArray(row),
  );
}

function retryAfterMs(response: Response): number | null {
  const header = response.headers.get("retry-after");
  if (!header) {
    return null;
  }
  const seconds = Number(header);
  if (Number.isFinite(seconds)) {
    return Math.max(0, seconds * 1000);
  }
  const dateMs = Date.parse(header);
  return Number.isFinite(dateMs) ? Math.max(0, dateMs - Date.now()) : null;
}

export class SocrataClient {
  readonly limiter: ConcurrencyLimiter;
  private readonly cache: CacheStore;
  private readonly fetcher: typeof fetch;
  private readonly sleep: (ms: number) => Promise<void>;
  private readonly timeoutMs: number;
  private readonly maxRetries: number;
  private readonly pageSize: number;
  private readonly ttlSeconds: number;
  private readonly random: () => number;
  private readonly inFlight = new Map<string, Promise<JsonRecord[]>>();

  constructor(private readonly options: SocrataClientOptions = {}) {
    this.cache = options.cache ?? sharedMemoryCache;
    this.fetcher = options.fetcher ?? fetch;
    this.sleep = options.sleep ?? ((ms) => new Promise((resolve) => setTimeout(resolve, ms)));
    this.timeoutMs = options.timeoutMs ?? 30_000;
    this.maxRetries = options.maxRetries ?? 3;
    this.pageSize = options.pageSize ?? 5000;
    this.ttlSeconds = options.ttlSeconds ?? DEFAULT_TTL_SECONDS;
    this.random = options.random ?? Math.random;
    this.limiter = new ConcurrencyLimiter(options.concurrency ?? 2);
  }

  async fetchAll(
    datasetKey: DatasetKey | string,
    params: Record<string, string>,
    options: FetchAllOptions = {},
  ): Promise<SocrataResponse> {
    if (!(datasetKey in DATASETS)) {
      throw new DataAccessError(
        `Unknown Socrata dataset '${datasetKey}'.`,
        DataErrorKind.UnknownDataset,
      );
    }

    const rows: JsonRecord[] = [];
    const warnings: string[] = [];
    let offset = 0;
    let paginated = false;
    while (true) {
      const remaining =
        options.maxRows === undefined
          ? this.pageSize
          : Math.min(this.pageSize, options.maxRows - rows.length);
      if (remaining <= 0) {
        warnings.push(
          `Socrata row cap reached for ${datasetKey}; additional upstream rows were not requested.`,
        );
        break;
      }
      const pageParams = {
        ...params,
        $limit: String(remaining),
        $offset: String(offset),
      };
      const page = await this.fetchPage(datasetKey as DatasetKey, pageParams);
      rows.push(...page);
      if (page.length < remaining) {
        break;
      }
      offset += remaining;
      paginated = true;
    }
    if (paginated) {
      warnings.push(
        `Socrata pagination fetched ${rows.length.toLocaleString("en-US")} rows for ${datasetKey}; all available pages were requested.`,
      );
    }
    return { rows, warnings };
  }

  private async fetchPage(
    datasetKey: DatasetKey,
    params: Record<string, string>,
  ): Promise<JsonRecord[]> {
    const key = cacheKey(datasetKey, params);
    const cached = await this.cache.get(key);
    if (cached !== null) {
      if (!Array.isArray(cached)) {
        throw new DataAccessError(
          `Cached Socrata response was invalid for ${datasetKey}.`,
          DataErrorKind.InvalidCache,
        );
      }
      return rowsFromUnknown(cached, datasetKey);
    }

    const existing = this.inFlight.get(key);
    if (existing) {
      return existing;
    }

    const pending = this.limiter.run(() => this.fetchPageFromUpstream(datasetKey, params));
    this.inFlight.set(key, pending);
    try {
      const rows = await pending;
      await this.cache.set(key, rows, this.ttlSeconds);
      return rows;
    } finally {
      this.inFlight.delete(key);
    }
  }

  private async fetchPageFromUpstream(
    datasetKey: DatasetKey,
    params: Record<string, string>,
  ): Promise<JsonRecord[]> {
    const datasetId = DATASETS[datasetKey];
    const url = new URL(`${SOCRATA_DOMAIN}/${datasetId}.json`);
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }

    let lastError: unknown = null;
    for (let attempt = 0; attempt < this.maxRetries; attempt += 1) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
      try {
        const headers = new Headers();
        if (this.options.appToken) {
          headers.set("X-App-Token", this.options.appToken);
        }
        const response = await this.fetcher(url, { headers, signal: controller.signal });
        if (TRANSIENT_STATUSES.has(response.status)) {
          const delay = retryAfterMs(response) ?? 500 * 2 ** attempt + this.random() * 250;
          lastError = new DataAccessError(
            `Socrata transient HTTP ${response.status} for ${datasetKey}.`,
            DataErrorKind.TransientHttp,
          );
          if (attempt < this.maxRetries - 1) {
            await this.sleep(delay);
            continue;
          }
          break;
        }
        if (!response.ok) {
          throw new DataAccessError(
            `Socrata HTTP error for ${datasetKey}: ${response.status}.`,
            DataErrorKind.HttpError,
          );
        }
        const data = await response.json().catch((error: unknown) => {
          throw new DataAccessError(
            `Socrata returned invalid JSON for ${datasetKey}: ${String(error)}`,
            DataErrorKind.InvalidJson,
          );
        });
        return rowsFromUnknown(data, datasetKey);
      } catch (error) {
        lastError = error;
        if (error instanceof DataAccessError && error.kind === DataErrorKind.InvalidJson) {
          throw error;
        }
        if (error instanceof DataAccessError && error.kind === DataErrorKind.HttpError) {
          throw error;
        }
        if (attempt < this.maxRetries - 1) {
          await this.sleep(500 * 2 ** attempt + this.random() * 250);
        }
      } finally {
        clearTimeout(timeout);
      }
    }

    const kind = lastError instanceof DataAccessError ? lastError.kind : DataErrorKind.Network;
    throw new DataAccessError(
      `Socrata request failed for ${datasetKey}: ${String(lastError)}`,
      kind,
    );
  }
}

export function friendlyDataError(error: unknown): { kind: string; message: string } {
  if (error instanceof DataAccessError) {
    if (error.kind === DataErrorKind.TransientHttp || error.kind === DataErrorKind.Network) {
      return {
        kind: error.kind,
        message: "The county data source is busy right now. Try again in a minute.",
      };
    }
    if (error.kind === DataErrorKind.UnknownDataset) {
      return {
        kind: error.kind,
        message: "The county data source configuration is incomplete.",
      };
    }
    return {
      kind: error.kind,
      message: "The county data source returned data this app could not use.",
    };
  }
  return {
    kind: "unknown",
    message: "Something went wrong while loading the case.",
  };
}

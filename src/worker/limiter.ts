export class QueueTimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "QueueTimeoutError";
  }
}

interface QueueEntry {
  resolve: () => void;
  reject: (error: Error) => void;
  timer: ReturnType<typeof setTimeout> | null;
}

export interface QueueOptions {
  maxQueueWaitMs?: number;
  onQueued?: (position: number) => void;
}

export class ConcurrencyLimiter {
  private active = 0;
  private queue: QueueEntry[] = [];
  maxObserved = 0;

  constructor(readonly limit: number) {}

  get activeCount(): number {
    return this.active;
  }

  get pendingCount(): number {
    return this.queue.length;
  }

  async run<T>(task: () => Promise<T>, options: QueueOptions = {}): Promise<T> {
    if (this.active >= this.limit) {
      await new Promise<void>((resolve, reject) => {
        const entry: QueueEntry = {
          resolve: () => {
            if (entry.timer !== null) {
              clearTimeout(entry.timer);
            }
            resolve();
          },
          reject,
          timer: null,
        };
        this.queue.push(entry);
        options.onQueued?.(this.queue.length);
        if (options.maxQueueWaitMs !== undefined) {
          entry.timer = setTimeout(() => {
            const index = this.queue.indexOf(entry);
            if (index >= 0) {
              this.queue.splice(index, 1);
              entry.reject(
                new QueueTimeoutError(
                  `Queued task waited longer than ${options.maxQueueWaitMs}ms.`,
                ),
              );
            }
          }, options.maxQueueWaitMs);
        }
      });
    }
    this.active += 1;
    this.maxObserved = Math.max(this.maxObserved, this.active);
    try {
      return await task();
    } finally {
      this.active -= 1;
      this.queue.shift()?.resolve();
    }
  }
}

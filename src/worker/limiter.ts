export class ConcurrencyLimiter {
  private active = 0;
  private queue: Array<() => void> = [];
  maxObserved = 0;

  constructor(readonly limit: number) {}

  async run<T>(task: () => Promise<T>): Promise<T> {
    if (this.active >= this.limit) {
      await new Promise<void>((resolve) => {
        this.queue.push(resolve);
      });
    }
    this.active += 1;
    this.maxObserved = Math.max(this.maxObserved, this.active);
    try {
      return await task();
    } finally {
      this.active -= 1;
      this.queue.shift()?.();
    }
  }
}

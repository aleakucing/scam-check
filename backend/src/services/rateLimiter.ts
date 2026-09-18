export class SlidingWindowRateLimiter {
  private requestsPerMinute: number;
  private windowSeconds: number;
  private ipHistory: Map<string, number[]> = new Map();

  constructor(requestsPerMinute: number = 60, windowSeconds: number = 60) {
    this.requestsPerMinute = requestsPerMinute;
    this.windowSeconds = windowSeconds;
  }

  isAllowed(clientIp: string): boolean {
    const now = Date.now() / 1000;
    const windowStart = now - this.windowSeconds;

    const history = this.ipHistory.get(clientIp) || [];
    const validHistory = history.filter((t) => t > windowStart);

    if (validHistory.length >= this.requestsPerMinute) {
      this.ipHistory.set(clientIp, validHistory);
      return false;
    }

    validHistory.push(now);
    this.ipHistory.set(clientIp, validHistory);
    return true;
  }

  getRemaining(clientIp: string): number {
    const now = Date.now() / 1000;
    const windowStart = now - this.windowSeconds;
    const history = (this.ipHistory.get(clientIp) || []).filter((t) => t > windowStart);
    return Math.max(0, this.requestsPerMinute - history.length);
  }

  cleanup() {
    const now = Date.now() / 1000;
    const windowStart = now - this.windowSeconds;
    for (const [ip, history] of this.ipHistory.entries()) {
      const valid = history.filter((t) => t > windowStart);
      if (valid.length === 0) {
        this.ipHistory.delete(ip);
      } else {
        this.ipHistory.set(ip, valid);
      }
    }
  }

  reset() {
    this.ipHistory.clear();
  }
}

export const rateLimiter = new SlidingWindowRateLimiter(60, 60);
export const uploadRateLimiter = new SlidingWindowRateLimiter(15, 60);

// Prune stale rate-limiter entries every 5 minutes to prevent memory leaks
setInterval(() => {
  rateLimiter.cleanup();
  uploadRateLimiter.cleanup();
}, 5 * 60 * 1000).unref();

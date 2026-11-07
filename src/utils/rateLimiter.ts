/**
 * Sliding Window In-Memory Rate Limiter
 * 
 * Prevents abuse of external APIs, email triggers, WhatsApp ETA generation,
 * and brute-force attacks against student referral codes.
 */

interface RateLimitRecord {
  timestamps: number[];
}

class RateLimiter {
  private records: Map<string, RateLimitRecord> = new Map();

  /**
   * Evaluates whether an action key is permitted under the rate limit window.
   * 
   * @param actionKey Unique identifier for the client action (e.g. "whatsapp_share_user123")
   * @param maxAttempts Maximum allowed events within the window
   * @param windowMs Duration of the sliding window in milliseconds
   * @returns Object indicating whether the attempt is allowed, and retry delay if blocked.
   */
  public checkLimit(
    actionKey: string,
    maxAttempts: number = 5,
    windowMs: number = 60000
  ): { allowed: boolean; remaining: number; retryAfterSeconds: number } {
    const now = Date.now();
    const record = this.records.get(actionKey) || { timestamps: [] };

    // Prune timestamps older than window
    const validTimestamps = record.timestamps.filter((ts) => now - ts < windowMs);

    if (validTimestamps.length >= maxAttempts) {
      const oldestValid = validTimestamps[0];
      const retryAfterMs = windowMs - (now - oldestValid);
      const retryAfterSeconds = Math.max(1, Math.ceil(retryAfterMs / 1000));

      // Update record with pruned timestamps
      this.records.set(actionKey, { timestamps: validTimestamps });

      return {
        allowed: false,
        remaining: 0,
        retryAfterSeconds,
      };
    }

    // Record this attempt
    validTimestamps.push(now);
    this.records.set(actionKey, { timestamps: validTimestamps });

    return {
      allowed: true,
      remaining: maxAttempts - validTimestamps.length,
      retryAfterSeconds: 0,
    };
  }

  /**
   * Resets rate limit records (useful for unit tests)
   */
  public resetForTesting(): void {
    this.records.clear();
  }
}

export const rateLimiter = new RateLimiter();

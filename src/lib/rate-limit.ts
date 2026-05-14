type RateBucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, RateBucket>();
const HOUR = 60 * 60 * 1000;

// Lightweight MVP guard. This is per serverless instance; move to Redis/Upstash
// when traffic gets real enough for cross-region persistence to matter.
export function checkRateLimit(key: string, limit: number) {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + HOUR });
    return { allowed: true, remaining: limit - 1 };
  }

  if (existing.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  buckets.set(key, existing);
  return { allowed: true, remaining: Math.max(0, limit - existing.count) };
}

export function getRateLimitKey(request: Request, anonSessionId: string) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip");
  return `${anonSessionId}:${forwarded ?? realIp ?? "unknown"}`;
}

export const FREE_GENERATION_LIMIT = 5;
export const REFILL_CREDITS = 10;
export const EXTRA_CRISPY_CREDITS = 25;

export type PaywallStage = "refill" | "extra_crispy" | "unlimited";

export type UsageState = {
  anonSessionId: string;
  generationCount: number;
  paidCredits: number;
  unlockTier: "free" | "refill" | "extra_crispy" | "unlimited";
  unlimitedUntil?: string;
  noWatermark?: boolean;
  purchaseSessionIds: string[];
  updatedAt: string;
};

export type UsageStatus = {
  canGenerate: boolean;
  freeRemaining: number;
  paidRemaining: number;
  generationCount: number;
  hasUnlimited: boolean;
  noWatermark: boolean;
  label: string;
  paywallStage: PaywallStage;
};

export type ServerUsagePayload = {
  canGenerate: boolean;
  anonSessionId: string;
  generationCount: number;
  freeRemaining: number;
  paidCredits: number;
  hasUnlimited: boolean;
  noWatermark: boolean;
  paywallStage: PaywallStage;
  source?: "supabase" | "cookie";
};

const STORAGE_KEY = "cookedmeter_usage_state";
const COOKIE_KEY = "cookedmeter_usage";
const ANON_COOKIE_KEY = "cookedmeter_anon_session_id";

export function createAnonSessionId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `anon_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function createInitialUsage(): UsageState {
  return {
    anonSessionId: createAnonSessionId(),
    generationCount: 0,
    paidCredits: 0,
    unlockTier: "free",
    purchaseSessionIds: [],
    updatedAt: new Date().toISOString(),
  };
}

export function hasUnlimitedAccess(usage: UsageState) {
  if (usage.unlockTier !== "unlimited") return false;
  if (!usage.unlimitedUntil) return true;
  return new Date(usage.unlimitedUntil).getTime() > Date.now();
}

export function getPaywallStage(generationCount: number): PaywallStage {
  if (generationCount <= 15) return "refill";
  if (generationCount <= 30) return "extra_crispy";
  return "unlimited";
}

export function getUsageStatus(usage: UsageState): UsageStatus {
  const hasUnlimited = hasUnlimitedAccess(usage);
  const freeRemaining = Math.max(0, FREE_GENERATION_LIMIT - usage.generationCount);
  const paidRemaining = Math.max(0, usage.paidCredits);
  const canGenerate = hasUnlimited || paidRemaining > 0 || freeRemaining > 0;
  const label = hasUnlimited
    ? "Unlimited active"
    : paidRemaining > 0
      ? `${paidRemaining} paid checks left`
      : `${freeRemaining} free checks left`;

  return {
    canGenerate,
    freeRemaining,
    paidRemaining,
    generationCount: usage.generationCount,
    hasUnlimited,
    noWatermark: Boolean(usage.noWatermark || hasUnlimited),
    label,
    paywallStage: getPaywallStage(usage.generationCount),
  };
}

export function recordGeneration(usage: UsageState): UsageState {
  const hasUnlimited = hasUnlimitedAccess(usage);
  return {
    ...usage,
    generationCount: usage.generationCount + 1,
    paidCredits: hasUnlimited ? usage.paidCredits : Math.max(0, usage.paidCredits - 1),
    updatedAt: new Date().toISOString(),
  };
}

export function applyPurchase(
  usage: UsageState,
  productType: "refill" | "extra_crispy" | "unlimited",
  stripeSessionId: string,
): UsageState {
  if (usage.purchaseSessionIds.includes(stripeSessionId)) return usage;

  if (productType === "unlimited") {
    const until = new Date();
    until.setMonth(until.getMonth() + 1);
    return {
      ...usage,
      unlockTier: "unlimited",
      unlimitedUntil: until.toISOString(),
      noWatermark: true,
      purchaseSessionIds: [...usage.purchaseSessionIds, stripeSessionId],
      updatedAt: new Date().toISOString(),
    };
  }

  const credits = productType === "refill" ? REFILL_CREDITS : EXTRA_CRISPY_CREDITS;
  return {
    ...usage,
    paidCredits: usage.paidCredits + credits,
    unlockTier: productType,
    noWatermark: usage.noWatermark || productType === "extra_crispy",
    purchaseSessionIds: [...usage.purchaseSessionIds, stripeSessionId],
    updatedAt: new Date().toISOString(),
  };
}

export function readClientUsage(): UsageState {
  if (typeof window === "undefined") return createInitialUsage();
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const next = createInitialUsage();
    writeClientUsage(next);
    return next;
  }
  try {
    const parsed = JSON.parse(raw) as UsageState;
    if (!parsed.anonSessionId) parsed.anonSessionId = createAnonSessionId();
    return {
      ...createInitialUsage(),
      ...parsed,
      purchaseSessionIds: parsed.purchaseSessionIds ?? [],
    };
  } catch {
    const next = createInitialUsage();
    writeClientUsage(next);
    return next;
  }
}

export function writeClientUsage(usage: UsageState) {
  if (typeof window === "undefined") return;
  const serialized = JSON.stringify(usage);
  localStorage.setItem(STORAGE_KEY, serialized);
  const expires = new Date();
  expires.setFullYear(expires.getFullYear() + 1);
  document.cookie = `${COOKIE_KEY}=${encodeURIComponent(serialized)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
  document.cookie = `${ANON_COOKIE_KEY}=${usage.anonSessionId}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
}

export function mergeServerUsage(
  current: UsageState,
  server: ServerUsagePayload,
): UsageState {
  return {
    ...current,
    anonSessionId: server.anonSessionId || current.anonSessionId,
    generationCount: server.generationCount,
    paidCredits: server.paidCredits,
    unlockTier: server.hasUnlimited
      ? "unlimited"
      : server.noWatermark
        ? "extra_crispy"
        : current.unlockTier,
    noWatermark: server.noWatermark,
    updatedAt: new Date().toISOString(),
  };
}

export function readUsageCookie(cookieHeader: string | null): UsageState | null {
  if (!cookieHeader) return null;
  const cookies = Object.fromEntries(
    cookieHeader.split(";").map((part) => {
      const [key, ...rest] = part.trim().split("=");
      return [key, rest.join("=")];
    }),
  );
  const raw = cookies[COOKIE_KEY];
  if (!raw) return null;
  try {
    return JSON.parse(decodeURIComponent(raw)) as UsageState;
  } catch {
    return null;
  }
}

export function serializeUsageCookie(usage: UsageState) {
  return `${COOKIE_KEY}=${encodeURIComponent(JSON.stringify(usage))}; Path=/; Max-Age=31536000; SameSite=Lax`;
}

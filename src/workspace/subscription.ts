/** Per-workspace subscription tier helpers (mirrors core/subscriptions.py). */

export type SubscriptionTier =
  | 'free'
  | 'plus'
  | 'ai_plus'
  | 'basic'
  | 'pro'
  | 'enterprise';

export interface WorkspaceSubscription {
  tier: SubscriptionTier;
  tier_label: string;
  limits: {
    seats?: number | null;
    integrated_seats: number | null;
    tides_only_seats: number | null;
  };
  usage: {
    seats?: number;
    integrated_seats: number;
    tides_only_seats: number;
  };
}

export type SeatType = 'tides' | 'integrated';

const TIER_LABELS: Record<SubscriptionTier, string> = {
  free: 'Free',
  plus: 'Plus',
  ai_plus: 'AI Plus',
  basic: 'Basic',
  pro: 'Pro',
  enterprise: 'Enterprise',
};

export function tierLabel(tier: SubscriptionTier): string {
  if (tier === 'basic' || tier === 'pro') return 'Plus';
  return TIER_LABELS[tier] ?? 'Free';
}

export function resolveSubscriptionTier(
  workspace:
    | {
        subscription?: { tier?: string } | null;
        subscription_tier?: string | null;
      }
    | null
    | undefined,
): SubscriptionTier {
  const tier = workspace?.subscription?.tier ?? workspace?.subscription_tier;
  if (
    tier === 'plus' ||
    tier === 'ai_plus' ||
    tier === 'basic' ||
    tier === 'pro' ||
    tier === 'enterprise' ||
    tier === 'free'
  ) {
    return tier === 'basic' || tier === 'pro' ? 'plus' : tier;
  }
  return 'free';
}

export function tierAllowsTurtletime(tier: SubscriptionTier): boolean {
  return tier !== 'free';
}

export function defaultInviteSeatType(tier: SubscriptionTier): SeatType {
  return tierAllowsTurtletime(tier) ? 'integrated' : 'tides';
}

export function tierAllowsTidesOnlySeats(): boolean {
  return false;
}

export function seatTypeFromFlags(
  canAccessTurtletime: boolean,
  canAccessTides: boolean,
): SeatType {
  if (canAccessTurtletime && canAccessTides) return 'integrated';
  return 'tides';
}

export function flagsFromSeatType(seatType: SeatType): {
  can_access_turtletime: boolean;
  can_access_tides: boolean;
} {
  if (seatType === 'integrated') {
    return { can_access_turtletime: true, can_access_tides: true };
  }
  return { can_access_turtletime: false, can_access_tides: true };
}

export function seatTypeLabel(seatType: SeatType): string {
  return seatType === 'integrated' ? 'Tides + TurtleTime' : 'Tides';
}

export function seatTypeDescription(
  tier: SubscriptionTier,
  seatType: SeatType,
): string {
  if (seatType === 'integrated') {
    return 'Project management and time tracking with TT↔Tides integration.';
  }
  if (!tierAllowsTidesOnlySeats()) {
    return 'Project management included on the Free plan.';
  }
  return 'Project management only — no TurtleTime time tracking.';
}

export function planSeatSummary(
  subscription: WorkspaceSubscription | null | undefined,
): string {
  if (!subscription) return '';
  const { tier, limits, usage } = subscription;
  const seatCap = limits.seats ?? limits.integrated_seats;
  const seatCount = usage.seats ?? usage.integrated_seats;
  if (tier === 'enterprise') {
    return 'Unlimited seats';
  }
  if (seatCap != null) {
    return `${seatCount}/${seatCap} seats`;
  }
  return '';
}

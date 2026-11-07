import { GamePhysicsConfig, LevelPlatform, ReachabilityMetrics } from '../types';

export interface ReachabilityCheckResult {
  metrics: ReachabilityMetrics;
  isFullyReachable: boolean;
  unreachablePlatforms: {
    fromPlatformId?: string;
    toPlatformId: string;
    horizontalDistance: number;
    maxAllowedDistance: number;
    verticalHeight: number;
    maxAllowedHeight: number;
    reason: string;
  }[];
  adjustedPlatforms?: LevelPlatform[];
}

/**
 * Calculates theoretical kinematics and maximum jump boundaries.
 */
export function calculateReachabilityMetrics(physics: GamePhysicsConfig): ReachabilityMetrics {
  const g = Math.max(10, physics.gravityY);
  const vy = Math.max(0, physics.jumpVelocity);
  const vx = Math.max(0, physics.playerSpeed);

  // Maximum jump height: h = v^2 / (2 * g)
  const maxJumpHeight = (vy * vy) / (2 * g);

  // Time to apex: t_apex = v / g
  const timeToApex = vy / g;

  // Total hang time until returning to jump altitude: t_air = 2 * t_apex
  const totalAirTime = 2 * timeToApex;

  // Maximum horizontal travel distance while airborne
  const maxJumpDistance = vx * totalAirTime;

  return {
    maxJumpHeight: Math.round(maxJumpHeight * 10) / 10,
    timeToApex: Math.round(timeToApex * 1000) / 1000,
    totalAirTime: Math.round(totalAirTime * 1000) / 1000,
    maxJumpDistance: Math.round(maxJumpDistance * 10) / 10,
    isReachable: true,
  };
}

/**
 * Validates whether a sequence of platforms can be traversed by the player.
 * Applies a 15% safety margin so players don't need pixel-perfect frame-1 inputs.
 */
export function validateLevelReachability(
  platforms: LevelPlatform[],
  physics: GamePhysicsConfig,
  safetyMargin = 0.85
): ReachabilityCheckResult {
  const metrics = calculateReachabilityMetrics(physics);
  const allowedHeight = metrics.maxJumpHeight * safetyMargin;
  const allowedDistance = metrics.maxJumpDistance * safetyMargin;

  const unreachable: ReachabilityCheckResult['unreachablePlatforms'] = [];
  if (!platforms || platforms.length <= 1) {
    return { metrics, isFullyReachable: true, unreachablePlatforms: [] };
  }

  // Sort platforms roughly left to right to check sequential traversal
  const sorted = [...platforms].sort((a, b) => a.x - b.x);

  for (let i = 0; i < sorted.length - 1; i++) {
    const current = sorted[i]!;
    const next = sorted[i + 1]!;

    // Horizontal gap: distance between right edge of current and left edge of next
    const currentRight = current.x + current.width;
    const nextLeft = next.x;
    const hGap = Math.max(0, nextLeft - currentRight);

    // Vertical climb: if next is higher (smaller Y value in screen coordinates)
    const vClimb = Math.max(0, current.y - next.y);

    if (vClimb > allowedHeight) {
      unreachable.push({
        fromPlatformId: current.id,
        toPlatformId: next.id,
        horizontalDistance: Math.round(hGap),
        maxAllowedDistance: Math.round(allowedDistance),
        verticalHeight: Math.round(vClimb),
        maxAllowedHeight: Math.round(allowedHeight),
        reason: `Vertical climb (${Math.round(vClimb)}px) exceeds maximum safe jump height (${Math.round(allowedHeight)}px)`,
      });
    } else if (hGap > allowedDistance) {
      unreachable.push({
        fromPlatformId: current.id,
        toPlatformId: next.id,
        horizontalDistance: Math.round(hGap),
        maxAllowedDistance: Math.round(allowedDistance),
        verticalHeight: Math.round(vClimb),
        maxAllowedHeight: Math.round(allowedHeight),
        reason: `Horizontal gap (${Math.round(hGap)}px) exceeds maximum safe jump distance (${Math.round(allowedDistance)}px)`,
      });
    }
  }

  return {
    metrics: {
      ...metrics,
      isReachable: unreachable.length === 0,
      warnings: unreachable.map((u) => u.reason),
    },
    isFullyReachable: unreachable.length === 0,
    unreachablePlatforms: unreachable,
  };
}

/**
 * Automatically adjusts platform elevations and positions to guarantee reachability.
 */
export function guaranteeLevelReachability(
  platforms: LevelPlatform[],
  physics: GamePhysicsConfig,
  safetyMargin = 0.82
): LevelPlatform[] {
  const metrics = calculateReachabilityMetrics(physics);
  const maxClimb = metrics.maxJumpHeight * safetyMargin;
  const maxHGap = metrics.maxJumpDistance * safetyMargin;

  const adjusted: LevelPlatform[] = [];
  const sorted = [...platforms].sort((a, b) => a.x - b.x);

  let prevY = sorted[0]?.y ?? 480;
  let prevRight = (sorted[0]?.x ?? 40) + (sorted[0]?.width ?? 200);

  for (let i = 0; i < sorted.length; i++) {
    const plat = { ...sorted[i]! };

    if (i > 0) {
      // Check horizontal distance
      const hGap = plat.x - prevRight;
      if (hGap > maxHGap) {
        // Pull platform closer
        plat.x = prevRight + Math.min(hGap, maxHGap * 0.9);
      }

      // Check vertical climb
      const climb = prevY - plat.y;
      if (climb > maxClimb) {
        // Lower the platform so it's safely reachable
        plat.y = prevY - maxClimb * 0.88;
      }
    }

    adjusted.push(plat);
    prevY = plat.y;
    prevRight = plat.x + plat.width;
  }

  return adjusted;
}


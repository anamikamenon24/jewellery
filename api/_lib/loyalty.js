import { TIERS } from '../../shared/constants.js'

export function loyaltyFor(points) {
  const current = [...TIERS].reverse().find((t) => points >= t.min)
  const next = TIERS.find((t) => t.min > points) || null
  return {
    points,
    tier: current.name,
    tierFloor: current.min,
    nextTier: next?.name ?? null,
    nextTierAt: next?.min ?? null,
    pointsToNext: next ? next.min - points : 0,
  }
}

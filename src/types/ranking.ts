export enum TierRank {
  Iron = 'Iron',
  Bronze = 'Bronze',
  Silver = 'Silver',
  Gold = 'Gold',
  Platinum = 'Platinum',
  Diamond = 'Diamond',
  Elite = 'Elite',
}

export interface RankState {
  id: 'singleton'
  tier: TierRank
  subTierProgress: number
  lastUpdatedAt: number
}

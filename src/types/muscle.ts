import type { Brand } from './branded'

export type MuscleId = Brand<string, 'MuscleId'>
export type MuscleSlug = Brand<string, 'MuscleSlug'>

export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'arms'
  | 'forearms'
  | 'core'
  | 'legs'
  | 'glutes'
  | 'calves'

export interface Muscle {
  id: MuscleId
  slug: MuscleSlug
  displayName: string
  group: MuscleGroup
  svgRegion: string
}

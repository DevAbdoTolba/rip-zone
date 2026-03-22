import type { Brand } from './branded'
import type { MuscleSlug } from './muscle'

export type WorkoutSessionId = Brand<string, 'WorkoutSessionId'>
export type ExerciseLogId = Brand<string, 'ExerciseLogId'>
export type SetLogId = Brand<string, 'SetLogId'>
export type ExerciseSlug = Brand<string, 'ExerciseSlug'>
export type WorkoutPlanId = Brand<string, 'WorkoutPlanId'>

export type EquipmentType =
  | 'barbell'
  | 'dumbbell'
  | 'cable'
  | 'machine'
  | 'bodyweight'
  | 'kettlebell'
  | 'band'
  | 'other'

export type Difficulty = 'beginner' | 'intermediate' | 'advanced'

export interface Exercise {
  slug: ExerciseSlug
  name: string
  primaryMuscles: MuscleSlug[]
  secondaryMuscles: MuscleSlug[]
  equipment: EquipmentType
  difficulty: Difficulty
  description: string
  formCues: string[]
}

export interface WorkoutSession {
  id: WorkoutSessionId
  startedAt: number
  completedAt: number | null
  planId: WorkoutPlanId | null
}

export interface ExerciseLog {
  id: ExerciseLogId
  sessionId: WorkoutSessionId
  exerciseSlug: ExerciseSlug
  orderIndex: number
}

export interface SetLog {
  id: SetLogId
  exerciseLogId: ExerciseLogId
  setNumber: number
  reps: number
  weightKg: number
  completedAt: number
}

export interface WorkoutPlan {
  id: WorkoutPlanId
  name: string
  slug: string
  goal: string
  difficulty: Difficulty
  daysPerWeek: number
  exercises: WorkoutPlanExercise[]
}

export interface WorkoutPlanExercise {
  exerciseSlug: ExerciseSlug
  sets: number
  repsMin: number
  repsMax: number
  restSeconds: number
  orderIndex: number
  dayLabel: string
}

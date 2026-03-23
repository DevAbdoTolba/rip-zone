import { describe, it, expect } from 'vitest'
import { filterExercises } from '@/lib/exercise-filter'

const mockExercises = [
  {
    name: 'Flat Bench Press',
    equipment: 'barbell',
    primaryMuscles: ['pectoralis-major'],
  },
  {
    name: 'Incline Bench Press',
    equipment: 'barbell',
    primaryMuscles: ['pectoralis-major', 'anterior-deltoid'],
  },
  {
    name: 'Dumbbell Bench Press',
    equipment: 'dumbbell',
    primaryMuscles: ['pectoralis-major'],
  },
  {
    name: 'Pull-up',
    equipment: 'bodyweight',
    primaryMuscles: ['latissimus-dorsi'],
  },
  {
    name: 'Barbell Row',
    equipment: 'barbell',
    primaryMuscles: ['latissimus-dorsi'],
  },
  {
    name: 'Lateral Raise',
    equipment: 'dumbbell',
    primaryMuscles: ['medial-deltoid'],
  },
]

describe('filterExercises', () => {
  it('returns all exercises when no filters are provided', () => {
    const result = filterExercises({ exercises: mockExercises })
    expect(result).toHaveLength(mockExercises.length)
    expect(result).toEqual(mockExercises)
  })

  it('filters by name substring (case-insensitive)', () => {
    const result = filterExercises({ exercises: mockExercises, query: 'bench' })
    expect(result).toHaveLength(3)
    expect(result.every(ex => ex.name.toLowerCase().includes('bench'))).toBe(true)
  })

  it('filters by name substring case-insensitively (uppercase query)', () => {
    const result = filterExercises({ exercises: mockExercises, query: 'BENCH' })
    expect(result).toHaveLength(3)
    expect(result.every(ex => ex.name.toLowerCase().includes('bench'))).toBe(true)
  })

  it('filters by equipment', () => {
    const result = filterExercises({ exercises: mockExercises, equipment: 'barbell' })
    expect(result).toHaveLength(3)
    expect(result.every(ex => ex.equipment === 'barbell')).toBe(true)
  })

  it('filters by primary muscle', () => {
    const result = filterExercises({ exercises: mockExercises, muscle: 'pectoralis-major' })
    expect(result).toHaveLength(3)
    expect(result.every(ex => ex.primaryMuscles.includes('pectoralis-major'))).toBe(true)
  })

  it('applies query and equipment filters together (AND logic)', () => {
    const result = filterExercises({
      exercises: mockExercises,
      query: 'bench',
      equipment: 'barbell',
    })
    expect(result).toHaveLength(2)
    expect(result.every(ex => ex.name.toLowerCase().includes('bench') && ex.equipment === 'barbell')).toBe(true)
  })

  it('returns empty array when no exercises match query', () => {
    const result = filterExercises({ exercises: mockExercises, query: 'xyznonexistent' })
    expect(result).toHaveLength(0)
    expect(result).toEqual([])
  })

  it('returns empty array when no exercises match equipment filter', () => {
    const result = filterExercises({ exercises: mockExercises, equipment: 'kettlebell' })
    expect(result).toHaveLength(0)
  })

  it('filters by muscle in combination with query', () => {
    const result = filterExercises({
      exercises: mockExercises,
      muscle: 'pectoralis-major',
      equipment: 'dumbbell',
    })
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Dumbbell Bench Press')
  })
})

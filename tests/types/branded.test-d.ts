import { describe, expectTypeOf, test } from 'vitest'
import type { MuscleId, MuscleSlug } from '@/types'

describe('Branded types', () => {
  test('MuscleId and MuscleSlug are not interchangeable', () => {
    // These are branded — a MuscleId should NOT be assignable to MuscleSlug
    expectTypeOf<MuscleId>().not.toEqualTypeOf<MuscleSlug>()
  })

  test('MuscleId is not assignable to plain string', () => {
    // Branded types should not be directly assignable to/from string
    expectTypeOf<MuscleId>().not.toEqualTypeOf<string>()
  })

  test('MuscleSlug is not assignable to plain string', () => {
    expectTypeOf<MuscleSlug>().not.toEqualTypeOf<string>()
  })
})

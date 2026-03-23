import { describe, test } from 'vitest'

describe('useWorkoutStore', () => {
  test.todo('startSession creates a new WorkoutSessionRecord with unique ID and sets activeSession')
  test.todo('startSession resets activeExercises to empty array')
  test.todo('startSession accepts optional planId and dayLabel')
  test.todo('addExercise creates ExerciseInSessionRecord and appends to activeExercises')
  test.todo('addExercise pre-fills pendingSet with suggestedReps and suggestedWeightKg')
  test.todo('confirmSet creates SetLogRecord and updates sets array in matching exercise')
  test.todo('confirmSet pre-fills next pendingSet with same reps and weightKg')
  test.todo('finishSession sets completedAt and clears activeSession and activeExercises')
  test.todo('startTimer sets timer to running state with given seconds and exerciseSlug')
  test.todo('pauseTimer sets timer.running to false')
  test.todo('resumeTimer sets timer.running to true')
  test.todo('adjustTimer adds delta to remaining (clamped to 0 minimum)')
  test.todo('dismissTimer resets timer to initial state')
  test.todo('tickTimer decrements timer.remaining by 1')
  test.todo('tickElapsed increments elapsedSeconds by 1')
})

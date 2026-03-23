export interface ExerciseFilterParams {
  exercises: Array<{
    name: string
    equipment: string
    primaryMuscles: string[]
  }>
  query?: string
  equipment?: string
  muscle?: string
}

export function filterExercises({ exercises, query, equipment, muscle }: ExerciseFilterParams) {
  return exercises.filter(ex => {
    const matchesQuery = !query || ex.name.toLowerCase().includes(query.toLowerCase())
    const matchesEquipment = !equipment || ex.equipment === equipment
    const matchesMuscle = !muscle || ex.primaryMuscles.includes(muscle)
    return matchesQuery && matchesEquipment && matchesMuscle
  })
}

import mongoose, { Schema, type InferSchemaType } from 'mongoose'

const WorkoutPlanExerciseSchema = new Schema({
  exerciseSlug: { type: String, required: true },
  sets: { type: Number, required: true },
  repsMin: { type: Number, required: true },
  repsMax: { type: Number, required: true },
  restSeconds: { type: Number, required: true },
  orderIndex: { type: Number, required: true },
  dayLabel: { type: String, required: true },
}, { _id: false })

const WorkoutPlanSchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  goal: { type: String, required: true },
  difficulty: {
    type: String,
    required: true,
    enum: ['beginner', 'intermediate', 'advanced'],
  },
  daysPerWeek: { type: Number, required: true },
  exercises: { type: [WorkoutPlanExerciseSchema], required: true },
})

export type WorkoutPlanDocument = InferSchemaType<typeof WorkoutPlanSchema>

// HMR guard
const WorkoutPlan = mongoose.models.WorkoutPlan ?? mongoose.model('WorkoutPlan', WorkoutPlanSchema)
export default WorkoutPlan

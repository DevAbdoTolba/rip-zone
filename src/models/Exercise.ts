import mongoose, { Schema, type InferSchemaType } from 'mongoose'

const ExerciseSchema = new Schema({
  slug: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  primaryMuscles: { type: [String], required: true },
  secondaryMuscles: { type: [String], default: [] },
  equipment: {
    type: String,
    required: true,
    enum: ['barbell', 'dumbbell', 'cable', 'machine', 'bodyweight', 'kettlebell', 'band', 'other'],
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['beginner', 'intermediate', 'advanced'],
  },
  description: { type: String, required: true },
  formCues: { type: [String], default: [] },
})

export type ExerciseDocument = InferSchemaType<typeof ExerciseSchema>

// HMR guard
const Exercise = mongoose.models.Exercise ?? mongoose.model('Exercise', ExerciseSchema)
export default Exercise

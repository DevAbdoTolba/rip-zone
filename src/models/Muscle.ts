import mongoose, { Schema, type InferSchemaType } from 'mongoose'

const MuscleSchema = new Schema({
  slug: { type: String, required: true, unique: true },
  displayName: { type: String, required: true },
  group: {
    type: String,
    required: true,
    enum: ['chest', 'back', 'shoulders', 'arms', 'forearms', 'core', 'legs', 'glutes', 'calves'],
  },
  svgRegion: { type: String, required: true },
})

export type MuscleDocument = InferSchemaType<typeof MuscleSchema>

// HMR guard — prevent "Cannot overwrite model" error
const Muscle = mongoose.models.Muscle ?? mongoose.model('Muscle', MuscleSchema)
export default Muscle

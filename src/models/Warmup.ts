import mongoose, { Schema, type InferSchemaType } from 'mongoose'

const WarmupMovementSchema = new Schema({
  name: { type: String, required: true },
  instruction: { type: String, required: true },
  duration: { type: String, required: true },
})

const WarmupSchema = new Schema({
  muscleGroup: {
    type: String,
    required: true,
    enum: ['chest', 'back', 'shoulders', 'arms', 'forearms', 'core', 'legs', 'glutes', 'calves'],
    unique: true,
  },
  movements: { type: [WarmupMovementSchema], required: true },
})

export type WarmupDocument = InferSchemaType<typeof WarmupSchema>

// HMR guard — prevent "Cannot overwrite model" error
const Warmup = mongoose.models.Warmup ?? mongoose.model('Warmup', WarmupSchema)
export default Warmup

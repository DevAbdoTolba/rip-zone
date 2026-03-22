import mongoose, { Schema, type InferSchemaType } from 'mongoose'

const FaqEntrySchema = new Schema({
  slug: { type: String, required: true, unique: true },
  question: { type: String, required: true },
  answer: { type: String, required: true },
  category: {
    type: String,
    required: true,
    enum: ['muscle-pain', 'progress', 'misconceptions', 'nutrition-basics', 'training-form', 'recovery'],
  },
  tags: { type: [String], default: [] },
})

export type FaqEntryDocument = InferSchemaType<typeof FaqEntrySchema>

// HMR guard
const FaqEntry = mongoose.models.FaqEntry ?? mongoose.model('FaqEntry', FaqEntrySchema)
export default FaqEntry

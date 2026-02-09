import mongoose from 'mongoose'

const alertSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },

    message: {
      type: String,
      required: true
    },

    severity: {
      type: String,
      enum: ['INFO', 'WARNING', 'CRITICAL'],
      required: true
    },

    target: {
      state: String,
      lga: String
    },

    channels: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true }
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },

    status: {
      type: String,
      enum: ['DRAFT', 'SENT'],
      default: 'DRAFT'
    }
  },
  { timestamps: true }
)

export default mongoose.model('Alert', alertSchema)

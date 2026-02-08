import mongoose from 'mongoose'

const reportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    title: {
      type: String,
      required: true
    },

    description: {
      type: String,
      required: true
    },

    severity: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH'],
      required: true
    },

    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true
      }
    },

    state: {
      type: String,
      required: true
    },

    lga: {
      type: String,
      required: true
    },

    images: [
      {
        url: String,
        publicId: String
      }
    ],

    status: {
      type: String,
      enum: ['PENDING', 'VERIFIED', 'REJECTED'],
      default: 'PENDING'
    },

    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
)

reportSchema.index({ location: '2dsphere' })

export default mongoose.model('Report', reportSchema)

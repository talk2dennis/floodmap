import { Schema, model } from 'mongoose'

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },

    phone: {
      type: String
    },

    password: {
      type: String,
      required: true,
      select: false
    },

    state: {
      type: String
    },

    lga: {
      type: String
    },

    role: {
      type: String,
      enum: ['USER', 'ADMIN'],
      default: 'USER'
    },

    location: {
      state: {
        lga: String,
        coordinates: {
          type: [Number], // [lng, lat]
          index: '2dsphere'
        }
      }
    },

    resetPasswordToken: String,
    resetPasswordExpires: Date
  },
  { timestamps: true }
)

export default model('User', userSchema)

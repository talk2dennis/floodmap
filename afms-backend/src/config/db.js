import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const { MONGO_URI } = process.env

// Check if MONGO_URI is defined
if (!MONGO_URI) {
  console.error('Error: MONGO_URI is not defined in environment variables.')
  process.exit(1)
}
// Function to connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGO_URI)
    // Log the connection host
    console.log('connecting to MongoDB...')

    console.log(`MongoDB Connected: ${conn.connection.host}`)
  } catch (error) {
    console.error(`Error: ${error.message}`)
    // Exit process with failure
    process.exit(1)
  }
}

export default connectDB

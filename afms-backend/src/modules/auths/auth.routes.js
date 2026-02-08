import express from 'express'
import {
  login,
  register,
  forgotPassword,
  resetPassword,
  getCurrentUser
} from './auth.controller.js'
import { protect } from '../../middleware/auth.middleware.js'

const authRouter = express.Router()

// auth routes
authRouter.post('/register', register)
authRouter.post('/login', login)
authRouter.get('/me', protect, getCurrentUser)
authRouter.post('/forgot-password', forgotPassword)
authRouter.post('/reset-password/:token', resetPassword)

export default authRouter

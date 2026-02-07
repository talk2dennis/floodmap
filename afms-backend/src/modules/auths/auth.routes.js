import express from 'express'
import {
  login,
  register,
  forgotPassword,
  resetPassword
} from './auth.controller.js'

const authRouter = express.Router()

// auth routes
authRouter.post('/register', register)
authRouter.post('/login', login)
authRouter.post('/forgot-password', forgotPassword)
authRouter.post('/reset-password', resetPassword)

export default authRouter

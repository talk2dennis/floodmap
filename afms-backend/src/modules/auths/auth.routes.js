import express from 'express'
import {
  login,
  register,
  forgotPassword,
  resetPassword,
  getCurrentUser,
  updateUserDetails,
  adminLogin,
  getAllUsers,
  deleteUser,
  updateUserRole,
  getStatistics
} from './auth.controller.js'
import { protect } from '../../middleware/auth.middleware.js'
import protectAdmin from '../../middleware/role.middleware.js'

const authRouter = express.Router()

// auth routes
authRouter.post('/register', register)
authRouter.post('/login', login)
authRouter.get('/me', protect, getCurrentUser)
authRouter.post('/forgot-password', forgotPassword)
authRouter.post('/reset-password/:token', resetPassword)
authRouter.put('/me', protect, updateUserDetails)
// admin routes
authRouter.post('/admin/login', adminLogin)
authRouter.get('/admin/users', protect, getAllUsers)
authRouter.delete('/admin/users/:id', protect, protectAdmin, deleteUser)
authRouter.put('/admin/users/:id/role', protect, protectAdmin, updateUserRole)
authRouter.get('/admin/statistics', protect, protectAdmin, getStatistics)
export default authRouter

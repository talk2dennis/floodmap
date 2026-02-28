import express from 'express'
import { protect } from '../../middleware/auth.middleware.js'
import protectAdmin from '../../middleware/role.middleware.js'
import {
  createAlert,
  getAlerts,
  getAlertById,
  updateAlert,
  deleteAlert,
  sendAlert
} from './alert.controller.js'

const alertRouter = express.Router()
// User routes
alertRouter.post('/', protect, protectAdmin, createAlert)
alertRouter.get('/', protect, getAlerts)
alertRouter.get('/:id', protect, getAlertById)
alertRouter.put('/:id', protect, protectAdmin, updateAlert)
alertRouter.delete('/:id', protect, protectAdmin, deleteAlert)
alertRouter.post('/:id/send', protect, protectAdmin, sendAlert)

export default alertRouter

import { Router } from 'express'
import { protect } from '../../middleware/auth.middleware.js'
import protectAdmin from '../../middleware/role.middleware.js'
import upload from '../../middleware/upload.middleware.js'
import {
  createReport,
  getUserReports,
  getAllReports,
  getReportById,
  deleteReport,
  updateReport,
  rejectReport,
  verifyReport
} from './report.controller.js'

const reportRouter = Router()

// User routes
reportRouter.post('/', protect, upload.array('images', 3), createReport)
reportRouter.get('/my-reports', protect, getUserReports)
reportRouter.get('/:id', protect, getReportById)
reportRouter.put('/:id', protect, upload.array('images', 3), updateReport)
reportRouter.delete('/:id', protect, deleteReport)

// Admin routes
reportRouter.get('/', protect, protectAdmin, getAllReports)
reportRouter.put('/:id/reject', protect, protectAdmin, rejectReport)
reportRouter.put('/:id/verify', protect, protectAdmin, verifyReport)

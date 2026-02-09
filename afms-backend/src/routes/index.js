import express from 'express'
import authRouter from '../modules/auths/auth.routes.js'
import reportRouter from '../modules/reports/report.routes.js'
import alertRouter from '../modules/alerts/alert.routes.js'

const router = express.Router()
// test route
router.get('/', (req, res) => {
  res.json({ message: 'Welcome to AFMS API' })
})

// ping route for health check
router.get('/api/ping', (req, res) => {
  res.json({ message: 'pong' })
})

// auth routes
router.use('/api/auth', authRouter)

// report routes
router.use('/api/reports', reportRouter)

// alert routes
router.use('/api/alerts', alertRouter)

export default router

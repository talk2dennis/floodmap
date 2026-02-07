import express from 'express'
import authRouter from '../modules/auths/auth.routes.js'

const router = express.Router()
// test route
router.get('/', (req, res) => {
  res.json({ message: 'Welcome to AFMS API' })
})

// ping route for health check
router.get('/ping', (req, res) => {
  res.json({ message: 'pong' })
})

// auth routes
router.use('/auth', authRouter)

export default router

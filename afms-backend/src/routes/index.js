import express from 'express'
import register from '../modules/auths/register.js'
import login from '../modules/auths/login.js'

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
router.post('/auth/register', register)
router.post('/auth/login', login)

export default router

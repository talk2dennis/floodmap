import express from 'express'
import { protect } from '../../middleware/auth.middleware.js'
import { chat } from './chatbot.controller.js'

const chatbotRouter = express.Router()

chatbotRouter.post('/chat', protect, chat)

export default chatbotRouter

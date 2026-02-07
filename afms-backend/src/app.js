import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import routes from './routes/index.js'
import errorHandler from './middleware/error.middleware.js'

const app = express()

app.use(cors())
app.use(helmet())
app.use(express.json())

app.use('/api', routes)

app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`)
  error.status = 404
  next(error)
})

app.use(errorHandler)

export { app }

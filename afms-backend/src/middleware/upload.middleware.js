import multer from 'multer'
import path from 'path'

// Multer configuration
const storage = multer.memoryStorage()
const upload = multer({ storage })

export default upload

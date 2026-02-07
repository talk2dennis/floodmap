import bcrypt from 'bcryptjs'
import User from '../users/user.model.js'
import { generateToken } from '../../utils/jwt.js'

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email }).select('+password')
    if (!user) {
      const error = new Error('Invalid credentials')
      error.status = 401
      throw error
    }

    const match = await bcrypt.compare(password, user.password)
    if (!match) {
      const error = new Error('Invalid credentials')
      error.status = 401
      throw error
    }

    const token = generateToken({
      id: user._id,
      role: user.role
    })

    res.json({
      token,
      user
    })
  } catch (err) {
    next(err)
  }
}

export default login

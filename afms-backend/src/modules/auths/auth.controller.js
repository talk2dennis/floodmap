import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import User from '../users/user.model.js'
import { generateToken } from '../../utils/jwt.js'
import sendEmail from '../../utils/sendEmail.js'

export const login = async (req, res, next) => {
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
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        location: user.location,
        state: user.state,
        role: user.role,
        lga: user.lga
      }
    })
  } catch (err) {
    next(err)
  }
}

export const register = async (req, res) => {
  const { name, email, password, phone, location } = req.body

  const exists = await User.findOne({ email })
  if (exists)
    return res.status(400).json({ message: 'Email already registered' })

  const hashed = await bcrypt.hash(password, 12)

  const user = await User.create({
    name,
    email,
    phone,
    password: hashed,
    location
  })

  res.status(201).json({
    message: 'Registration successful',
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      location: user.location
    }
  })
}

export const forgotPassword = async (req, res, next) => {
  try {
    console.log('Forgot password request received')
    const { email } = req.body
    const user = await User.findOne({ email })
    if (!user) {
      const error = new Error('No user found with that email')
      error.status = 404
      throw error
    }

    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenHash = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex')

    user.resetPasswordToken = resetTokenHash
    // Token expires in 1 hour
    user.resetPasswordExpires = Date.now() + 3600000
    await user.save()

    // reset link
    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`

    await sendEmail({
      to: user.email,
      subject: 'AFMS Password Reset',
      html: `
      <p>You requested a password reset.</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>This link expires in 15 minutes.</p>
    `
    })

    res.json({ message: 'Password reset email sent' })
  } catch (err) {
    next(err)
  }
}

// reset password controller
export const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params
    const { password } = req.body

    const resetTokenHash = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex')
    const user = await User.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpires: { $gt: Date.now() }
    })
    if (!user) {
      const error = new Error('Invalid or expired token')
      error.status = 400
      throw error
    }
    user.password = await bcrypt.hash(password, 12)
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined
    await user.save()
    res.json({ message: 'Password reset successful' })
  } catch (err) {
    next(err)
  }
}

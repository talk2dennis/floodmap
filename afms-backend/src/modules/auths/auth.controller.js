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

// return current user details exclude password
export const getCurrentUser = async (req, res) => {
  // confirm that user is authenticated and has a valid token
  if (!req.user || !req.user.id) {
    const error = new Error('Unauthorized')
    error.status = 401
    throw error
  }
  const user = await User.findById(req.user.id).select('-password')
  res.json({ user })
}

export const forgotPassword = async (req, res, next) => {
  try {
    // get the current year
    const currentYear = new Date().getFullYear()
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
    const resetLink = `${process.env.FRONTEND_URL}/auth/reset-password/${resetToken}`

    await sendEmail({
      to: user.email,
      subject: 'AFMS (FloodMap) Password Reset',
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <img src="https://res.cloudinary.com/dhtwzgd0x/image/upload/v1770545734/afms_logo_ci5vlw.png" alt="AFMS Logo" style="width: 150px; height: auto; margin-bottom: 10px;" />
        <h1 style="color: white; margin: 0; font-size: 20px;">Password Reset Request</h1>
      </div>
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #eee;">
        <p style="color: #333; font-size: 16px; line-height: 1.6;">Hi ${user.name},</p>
        <p style="color: #555; font-size: 14px; line-height: 1.6;">We received a request to reset your password. Click the button below to create a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <p style="color: #555; font-size: 14px; line-height: 1.6;">Copy and paste the link below if the button doesn't work:</p>
          <a href="${resetLink}" style="color: #667eea; word-break: break-all;">${resetLink}</a>
        </div>
        <p style="color: #777; font-size: 13px; line-height: 1.6; background: #fff3cd; padding: 12px; border-radius: 4px; border-left: 4px solid #ffc107;">
        <strong>Security:</strong> This link expires in 1 hour. If you didn't request this, please ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="color: #999; font-size: 12px; text-align: center;">© ${currentYear} AFMS-FLOODMAP. All rights reserved.</p>
      </div>
      </div>
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

// update user details controller
export const updateUserDetails = async (req, res, next) => {
  try {
    const userId = req.user.id
    const { name, phone, location, state, lga } = req.body
    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ message: 'User not found' })

    user.name = name || user.name
    user.phone = phone || user.phone
    user.location = location || user.location
    user.state = state || user.state
    user.lga = lga || user.lga
    await user.save()
    res.json({ message: 'User details updated successfully' })
  } catch (err) {
    next(err)
  }
}

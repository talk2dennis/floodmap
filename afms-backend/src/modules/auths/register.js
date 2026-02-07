import bcrypt from 'bcryptjs'
import User from '../users/user.model.js'

const register = async (req, res) => {
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

export default register

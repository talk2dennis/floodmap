const protectAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    // throw error if not admin
    return res.status(403).json({ message: 'Forbidden, admin only' })
  }
  next()
}

export default protectAdmin

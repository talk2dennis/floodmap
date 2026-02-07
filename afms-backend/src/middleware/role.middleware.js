export default (...roles) => {
  return (req, res, next) => {
    // Check if user's role is in allowed roles
    if (!roles.includes(req.user.role))
      return res.status(403).json({ message: 'Access denied' })
    next()
  }
}

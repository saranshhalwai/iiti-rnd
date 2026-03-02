import jwt from "jsonwebtoken"

export default (req, res, next) => {
  const token = req.cookies.adKey
  if (!token) {
    res.status(401).json({ success: false, message: "No token" })
    return null
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    if (!decoded.id) {
      res.status(403).json({ success: false, message: "Admins only" })
      return null
    }
    req.admin = decoded
    next()
  } catch {
    res.status(403).json({ success: false, message: "Invalid token" })
    return null
  }
}
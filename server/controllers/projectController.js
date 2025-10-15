import express from "express"
import jwt from "jsonwebtoken"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()
const router = express.Router()

router.get("/user-projects", async (req, res) => {
  const token = req.cookies.acKey
  if (!token) return res.status(401).json({ success: false, message: "No token" })

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const projects = await prisma.project.findMany({
      where: { userEmail: decoded.email },
      include: { forms: true }
    })
    res.json({ success: true, projects })
  } catch (err) {
    console.error(err)
    res.status(403).json({ success: false, message: "Invalid token" })
  }
})

export default router

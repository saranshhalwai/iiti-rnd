import express from "express"
import { OAuth2Client } from "google-auth-library"
import jwt from "jsonwebtoken"
import { PrismaClient } from "@prisma/client"
import { client, server} from "../lib/client.js"

const prisma = new PrismaClient()
const router = express.Router()

const clientId = process.env.GOOGLE_CLIENT_ID
const clientSecret = process.env.GOOGLE_CLIENT_SECRET
const redirectUri = `${server}/api/auth/admin/google/callback`

router.get("/verify", (req, res) => {
  const token = req.cookies.acKey
  if (!token) return res.status(401).json({ success: false, message: "No token" })

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    res.json({ success: true, admin: decoded })
  } catch (err) {
    res.status(403).json({ success: false, message: "Invalid token" })
  }
})

router.get("/google/redirect", (req, res) => {
  const scope = ["openid", "email", "profile"].join(" ")
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&prompt=select_account`
  res.redirect(url)
})

router.get("/google/callback", async (req, res) => {
  const code = req.query.code
  if (!code) return res.status(400).send("No code provided")

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code"
    })
  })
  const tokens = await tokenRes.json()
  const idToken = tokens.id_token

  const client = new OAuth2Client(clientId)
  const ticket = await client.verifyIdToken({
    idToken,
    audience: clientId
  })
  const payload = ticket.getPayload()
  const email = payload.email

  const admin = await prisma.admin.findUnique({ where: { email } })
  if (!admin) return res.status(403).send("You are not an admin")

  const jwtToken = jwt.sign({ id: admin.id, email: admin.email, name: admin.name }, process.env.JWT_SECRET, { expiresIn: "7d" })
  res.cookie("adKey", jwtToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000
  })

  res.redirect(`${client}/admin/panel`)
})

export default router
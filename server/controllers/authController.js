import express from "express"
import { OAuth2Client } from "google-auth-library"
import jwt from "jsonwebtoken"
import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()
const router = express.Router()

const clientId = process.env.GOOGLE_CLIENT_ID
const clientSecret = process.env.GOOGLE_CLIENT_SECRET
const redirectUri = "http://localhost:5000/api/auth/google/callback"

router.get("/google/redirect", (req, res) => {
  const scope = [
    "openid",
    "email",
    "profile"
  ].join(" ")
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&prompt=select_account`
  res.redirect(url)
})

router.get("/google/callback", async (req, res) => {
  const code = req.query.code
  if (!code) return res.status(400).send("No code provided")

  // Exchange code for tokens
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

  if (!email.endsWith("@iiti.ac.in")) return res.status(403).send("Use institute email only")

  const user = await prisma.user.upsert({
    where: { email },
    update: { name: payload.name || "Unnamed", lastVisit: new Date() },
    create: { email, name: payload.name || "Unnamed" }
  })

  const jwtToken = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "7d" })

  res.redirect(`http://localhost:5173/dashboard?token=${jwtToken}`)
})

export default router

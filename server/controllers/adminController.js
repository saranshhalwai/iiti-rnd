import express from "express"
import prisma from "../db/prisma.js"

const router = express.Router()

router.get("/department-authority/suggest", async (req, res) => {
  try {
    const { role, q } = req.query

    if (!role || !["HOD", "DEAN"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "role must be HOD or DEAN",
      })
    }

    const whereClause =
      role === "HOD"
        ? q
          ? { hod_email: { contains: q, mode: "insensitive" } }
          : {}
        : q
        ? { dean_email: { contains: q, mode: "insensitive" } }
        : {}

    const results =
      role === "HOD"
        ? await prisma.departmentAuthority.findMany({
            where: whereClause,
            select: { hod_email: true },
            orderBy: { hod_email: "asc" },
          })
        : await prisma.departmentAuthority.findMany({
            where: whereClause,
            select: { dean_email: true },
            orderBy: { dean_email: "asc" },
          })

    res.json({
      success: true,
      emails: [...new Set(results.map(r =>
        role === "HOD" ? r.hod_email : r.dean_email
      ))],
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: "Server error" })
  }
})

router.post("/department-authority/create", async (req, res) => {
  try {
    const { dept_name, hod_email, dean_email } = req.body

    if (!dept_name || !hod_email || !dean_email) {
      return res.status(400).json({
        success: false,
        message: "dept_name, hod_email and dean_email are required",
      })
    }

    const existing = await prisma.departmentAuthority.findUnique({
      where: { dept_name },
    })

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Department already exists",
      })
    }

    const authority = await prisma.departmentAuthority.create({
      data: { dept_name, hod_email, dean_email },
    })

    res.status(201).json({ success: true, authority })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: "Server error" })
  }
})

router.put("/department-authority/edit/:dept_name", async (req, res) => {
  try {
    const { dept_name } = req.params
    const { hod_email, dean_email } = req.body

    if (!hod_email && !dean_email) {
      return res.status(400).json({
        success: false,
        message: "At least one field required",
      })
    }

    const existing = await prisma.departmentAuthority.findUnique({
      where: { dept_name },
    })

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      })
    }

    const updated = await prisma.departmentAuthority.update({
      where: { dept_name },
      data: {
        hod_email: hod_email ?? existing.hod_email,
        dean_email: dean_email ?? existing.dean_email,
      },
    })

    res.json({ success: true, authority: updated })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: "Server error" })
  }
})

router.get("/department-authority/all", async (req, res) => {
  try {
    const departments = await prisma.departmentAuthority.findMany({
      orderBy: { dept_name: "asc" },
    })

    res.json({ success: true, departments })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: "Server error" })
  }
})

router.delete("/department-authority/delete/:dept_name", async (req, res) => {
  try {
    const { dept_name } = req.params

    const existing = await prisma.departmentAuthority.findUnique({
      where: { dept_name },
    })

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      })
    }

    await prisma.departmentAuthority.delete({
      where: { dept_name },
    })

    res.json({
      success: true,
      message: "Department deleted successfully",
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: "Server error" })
  }
})

export default router;
import express from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const router = express.Router();

router.get("/user-projects", async (req, res) => {
  const token = req.cookies.acKey;
  if (!token)
    return res.status(401).json({ success: false, message: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const projects = await prisma.project.findMany({
      where: { userEmail: decoded.email },
      include: { forms: true },
    });
    res.json({ success: true, projects });
  } catch (err) {
    console.error(err);
    res.status(403).json({ success: false, message: "Invalid token" });
  }
});

const verifyUser = (req, res, next) => {
  const token = req.cookies.acKey;
  if (!token)
    return res.status(401).json({ success: false, message: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ success: false, message: "Invalid token" });
  }
};

router.get("/:id", async (req, res) => {
  const userEmail = req.user.email;
  if (!userEmail) return res.status(403).json({ message: "Unauthorized" });
  const { id } = req.params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!project || project.userEmail !== userEmail)
    return res.status(403).json({ message: "Unauthorized" });
  res.json(project);
});

router.post("/:id/staffRecruitmentForm", async (req, res) => {
  try {
    const { id } = req.params;
    const { members } = req.body;
    const userEmail = req.user?.email;

    if (!userEmail) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project || project.userEmail !== userEmail) {
      return res
        .status(403)
        .json({ message: "You are not allowed to submit this form" });
    }

    await prisma.staffRecruitmentForm.create({
      data: {
        projectId: id,
        selectionCommittee: members,
        status: "PENDING",
      },
    });
    res.json({ message: "Form submitted successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/add", async (req, res) => {
  try {
    const token = req.cookies.acKey;
    if (!token)
      return res.status(401).json({ success: false, message: "No token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "ADMIN")
      return res
        .status(403)
        .json({ success: false, message: "Access denied. Admins only." });

    const { userEmail, title, fundingAgency, projectDuration } = req.body;

    if (!userEmail || !title || !fundingAgency || !projectDuration) {
      return res.status(400).json({
        success: false,
        message:
          "All fields (userEmail, title, fundingAgency, projectDuration) are required",
      });
    }

    const newProject = await prisma.project.create({
      data: {
        userEmail,
        title,
        fundingAgency,
        projectDuration,
      },
    });

    res.status(201).json({
      success: true,
      message: "Project added successfully",
      project: newProject,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;

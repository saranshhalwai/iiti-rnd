import express from "express";
import jwt from "jsonwebtoken";
import prisma from "../db/prisma.js";
const router = express.Router();

router.get("/all-projects", async (req, res) => {
  const token = req.cookies.adKey;

  if (!token)
    return res.status(401).json({success: false, message: "No token"});

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  if (!decoded.id)
    return res
        .status(403)
        .json({ success: false, message: "Access denied. Admins only." });

  try {
    const projects = await prisma.project.findMany({
      include: { forms: false },
    });
    res.json({success: true, projects: projects});
  } catch (err) {
    console.error(err);
  }
})

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

router.post("/:id/staffRecruitmentForm", verifyUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { chair, members } = req.body;
    const userEmail = req.user.email;

    if (!chair || !Array.isArray(members))
      return res.status(400).json({ message: "Chair + Members required" });

    const project = await prisma.project.findUnique({ where: { id }});
    if (!project || project.userEmail !== userEmail)
      return res.status(403).json({ message: "Not allowed" });

    const existing = await prisma.staffRecruitmentForm.findFirst({
      where: { projectId: id }
    });

    if (existing) {
      await prisma.staffRecruitmentForm.update({
        where: { id: existing.id },
        data: {
          selectionCommittee: { chair, members },
          status: "SAVED"
        }
      });
    } else {
      await prisma.staffRecruitmentForm.create({
        data: {
          projectId: id,
          selectionCommittee: { chair, members },
          status: "SAVED"
        }
      });
    }

    // also sync project status
    await prisma.project.update({
      where: { id },
      data: { status: "SAVED" }
    });

    res.json({ success: true, message: "Form saved" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


router.post("/add", async (req, res) => {
  try {
    const token = req.cookies.adKey;
    if (!token)
      return res.status(401).json({ success: false, message: "No token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.id)
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

router.get("/:id/staffRecruitmentForm", verifyUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userEmail = req.user.email;

    const project = await prisma.project.findUnique({
      where: { id }
    });
    if (!project || project.userEmail !== userEmail)
      return res.status(403).json({ message: "Unauthorized" });

    const form = await prisma.staffRecruitmentForm.findFirst({
      where: { projectId: id }
    });
    if (!form)
      return res.status(404).json({ message: "Form not submitted" });
    res.json({
      selectionCommittee: form.selectionCommittee,
      status: form.status
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});



export default router;

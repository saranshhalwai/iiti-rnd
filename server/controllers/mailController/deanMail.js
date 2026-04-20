import express from "express";
import prisma from "../../db/prisma.js";
import nodemailer from "nodemailer";
import crypto from "crypto";
import { server } from "../../lib/client.js";
import { createSubmitterUpdateEmail } from "./SubmitterUpdateEmail.js";

const router = express.Router();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.RND_EMAIL,
    pass: process.env.RND_APP_PASSWD,
  },
});

const createDecisionToken = async (projId, action) => {
  const token = crypto.randomBytes(32).toString("hex");
  await prisma.decisionToken.create({
    data: { token, projId, action },
  });
  return token;
};

const buildCommittee = (form) => {
  const raw = form?.selectionCommittee || {};
  return {
    chair: raw.chair || "",
    members: Array.isArray(raw.members) ? raw.members : [],
  };
};

export const createDeanNotificationEmail = async (project) => {
  const form = await prisma.staffRecruitmentForm.findFirst({
    where: { projectId: project.id },
  });
  const committee = buildCommittee(form);

  const acceptToken = await createDecisionToken(project.id, "ACCEPT");
  const rejectToken = await createDecisionToken(project.id, "REJECT");

  const acceptLink = `${server}/api/mail/dean/decision?token=${acceptToken}`;
  const rejectLink = `${server}/api/mail/dean/decision?token=${rejectToken}`;

  return `
  <div style="font-family:Inter,Arial,sans-serif;margin:0;padding:0;background-color:#f8fafc;color:#374151;text-align:left;">
    <table width="100%" cellspacing="0" cellpadding="0" style="background-color:#f8fafc;">
      <tr>
        <td align="left" style="padding:40px 24px;">
          <div style="max-width:640px;margin:0 auto;text-align:left;">
            <h2 style="margin:0 0 12px 0;font-size:24px;font-weight:700;color:#0f766e;">Final Approval Required</h2>
            <p style="margin:0 0 26px 0;font-size:15px;font-weight:500;color:#6b7280;">This project has been approved by the Head of Department and now requires your final decision.</p>

            <div style="margin-bottom:26px;font-size:14.5px;line-height:1.9;color:#4b5563;">
              <div style="margin-bottom:8px;"><span style="font-weight:600;color:#6b7280;">Title:</span><span style="font-weight:600;color:#374151;margin-left:6px;">${project.title}</span></div>
              <div style="margin-bottom:8px;"><span style="font-weight:600;color:#6b7280;">Funding Agency:</span><span style="font-weight:600;color:#374151;margin-left:6px;">${project.fundingAgency}</span></div>
              <div style="margin-bottom:8px;"><span style="font-weight:600;color:#6b7280;">Duration:</span><span style="font-weight:600;color:#374151;margin-left:6px;">${project.projectDuration}</span></div>
              <div style="margin-bottom:8px;"><span style="font-weight:600;color:#6b7280;">Submitted By:</span><span style="font-weight:600;color:#374151;margin-left:6px;">${project.userEmail}</span></div>
              <div><span style="font-weight:600;color:#6b7280;">HOD Email:</span><span style="font-weight:600;color:#374151;margin-left:6px;">${project.hodEmail}</span></div>
            </div>

            <div style="margin-bottom:28px;font-size:14.5px;line-height:1.9;color:#4b5563;">
              <div style="margin-bottom:10px;font-size:15px;font-weight:600;color:#0d9488;">Selection Committee</div>
              <div style="margin-bottom:8px;"><span style="font-weight:600;color:#6b7280;">Chair:</span><span style="font-weight:600;color:#374151;margin-left:6px;">${committee.chair || "N/A"}</span></div>
              <div><span style="font-weight:600;color:#6b7280;">Members:</span><span style="margin-left:6px;color:#374151;font-weight:500;">${committee.members.length ? committee.members.join(", ") : "N/A"}</span></div>
            </div>

            <div style="margin-top:22px;">
              <a href="${acceptLink}" style="display:inline-block;padding:11px 22px;font-size:14.5px;font-weight:600;color:#ffffff;background-color:#0d9488;border-radius:8px;text-decoration:none;margin-right:12px;">Final Approve</a>
              <a href="${rejectLink}" style="display:inline-block;padding:11px 22px;font-size:14.5px;font-weight:600;color:#374151;background-color:#e5e7eb;border-radius:8px;text-decoration:none;">Request Changes</a>
            </div>

            <p style="margin-top:34px;font-size:12.5px;color:#9ca3af;">This decision will be recorded as final in the system.</p>
          </div>
        </td>
      </tr>
    </table>
  </div>
  `;
};

router.get("/decision", async (req, res) => {
  const { token } = req.query;
  if (!token) return res.send("Invalid link");

  const record = await prisma.decisionToken.findUnique({ where: { token } });
  if (!record || record.used) {
    return res.send(`<html><body style="margin:0;background:#f8fafc;font-family:Inter,Arial;"><div style="max-width:640px;margin:80px auto;padding:40px 24px;"><h2 style="color:#6b7280;">Link Not Available</h2><p style="color:#6b7280;">This link has expired or already been used.</p></div></body></html>`);
  }

  const project = await prisma.project.findUnique({ where: { id: record.projId } });

  if (record.action === "ACCEPT") {
    return res.send(`
      <html><body style="margin:0;background:#f8fafc;font-family:Inter,Arial;color:#374151;">
      <div style="max-width:640px;margin:80px auto;padding:40px 24px;">
        <h2 style="font-size:24px;font-weight:700;color:#0f766e;">Confirm Final Approval</h2>
        <p style="color:#6b7280;">You are about to finalize this project.</p>
        <div style="margin-top:20px;"><span style="font-weight:600;color:#6b7280;">Project:</span><span style="font-weight:600;color:#374151;margin-left:6px;">${project.title}</span></div>
        <form method="POST" action="/api/mail/dean/accept">
          <input type="hidden" name="token" value="${token}" />
          <button style="margin-top:20px;padding:12px 24px;background:#0d9488;color:#fff;border:none;border-radius:8px;">Confirm Final Approval</button>
        </form>
      </div></body></html>
    `);
  }

  return res.redirect(`/api/mail/dean/reject-form?token=${token}`);
});

router.post("/accept", async (req, res) => {
  const { token } = req.body;
  if (!token) return res.send("Invalid request");

  const result = await prisma.decisionToken.updateMany({
    where: { token, used: false },
    data: { used: true },
  });

  if (result.count === 0) return res.send("Already used or invalid");

  const record = await prisma.decisionToken.findUnique({ where: { token } });

  const project = await prisma.project.update({
    where: { id: record.projId },
    data: { status: "APPROVED" },
  });

  const form = await prisma.staffRecruitmentForm.findFirst({
    where: { projectId: record.projId },
  });

  if (form) {
    await prisma.staffRecruitmentForm.update({
      where: { id: form.id },
      data: { status: "APPROVED" },
    });
  }

  await transporter.sendMail({
    from: `"Rnd Department" <${process.env.RND_EMAIL}>`,
    to: project.userEmail,
    subject: `Final Project Decision: Approved - ${project.title}`,
    html: `<p>Your project has been approved.</p>`,
  });

  res.send(`<html><body style="margin:0;background:#f8fafc;font-family:Inter,Arial;"><div style="max-width:640px;margin:80px auto;padding:40px 24px;"><h2 style="color:#0f766e;">Final Approval Recorded</h2></div></body></html>`);
});

router.get("/reject-form", async (req, res) => {
  const { token } = req.query;

  const record = await prisma.decisionToken.findUnique({ where: { token } });
  if (!record || record.used) return res.send("Invalid link");

  const project = await prisma.project.findUnique({ where: { id: record.projId } });

    const html = `
    <html>
      <body style="margin:0;padding:0;background:#f8fafc;font-family:Inter,Arial,sans-serif;color:#374151;">
        
        <div style="max-width:640px;margin:0;padding:40px 24px;">

          <h2 style="margin:0 0 10px 0;font-size:24px;font-weight:700;color:#0f766e;">
            Request Changes
          </h2>

          <p style="margin:0 0 24px 0;font-size:15px;color:#6b7280;">
            Provide feedback for the following project before it can proceed.
          </p>

          <div style="margin-bottom:24px;font-size:14.5px;line-height:1.8;">
            <span style="font-weight:600;color:#6b7280;">Project:</span>
            <span style="font-weight:600;color:#374151;margin-left:6px;">${project.title}</span>
          </div>

          <form method="POST" action="/api/mail/dean/reject">

            <input type="hidden" name="token" value="${token}" />

            <textarea 
              name="comment" 
              required 
              placeholder="Describe the required changes clearly..."
              style="width:100%;height:140px;padding:14px;border-radius:10px;border:1px solid #d1d5db;font-size:14.5px;resize:none;outline:none;color:#374151;margin-bottom:18px;"
            ></textarea>

            <button 
              type="submit"
              style="display:inline-block;padding:12px 24px;font-size:14.5px;font-weight:600;color:#ffffff;background-color:#0d9488;border:none;border-radius:8px;cursor:pointer;"
            >
              Submit Changes
            </button>

          </form>

          <p style="margin-top:30px;font-size:12.5px;color:#9ca3af;">
            Your feedback will be shared with the submitter for revision.
          </p>

        </div>

      </body>
    </html>
  `;
  res.send(html);
});

router.post("/reject", async (req, res) => {
  const { token, comment } = req.body;

  if (!comment) return res.send("Comment required");

  const result = await prisma.decisionToken.updateMany({
    where: { token, used: false },
    data: { used: true },
  });

  if (result.count === 0) return res.send("Invalid");

  const record = await prisma.decisionToken.findUnique({
    where: { token },
  });

  if (!record || record.action !== "REJECT") return res.send("Invalid token");

  const project = await prisma.project.update({
    where: { id: record.projId },
    data: {
      status: "REJECTED_DEAN",
      deanRemark: comment,
      logs: {
        create: {
          action: "REJECTED_DEAN",
          comment,
        },
      },
    },
  });

  const form = await prisma.staffRecruitmentForm.findFirst({
    where: { projectId: record.projId },
  });

  if (form) {
    await prisma.staffRecruitmentForm.update({
      where: { id: form.id },
      data: { status: "REJECTED_DEAN" },
    });
  }

  await transporter.sendMail({
    from: `"Rnd Department" <${process.env.RND_EMAIL}>`,
    to: project.userEmail,
    subject: `Project Needs Changes: ${project.title}`,
    html: createSubmitterUpdateEmail(project, "REJECTED", comment),
  });

  return res.send(`
    <body style="margin:0;background:#fef2f2;font-family:Inter,Arial;">
      <div style="max-width:500px;margin:80px auto;padding:30px;text-align:center;">
        <h1 style="color:#dc2626;">Rejected</h1>
        <p>Your feedback has been recorded and sent.</p>
      </div>
    </body>
  `);
});

export default router;
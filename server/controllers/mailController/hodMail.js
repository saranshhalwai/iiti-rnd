import express from "express";
import prisma from "../../db/prisma.js";
import nodemailer from "nodemailer";
import crypto from "crypto";
import { createSubmitterUpdateEmail } from "./SubmitterUpdateEmail.js";
import { server } from "../../lib/client.js";
import { createDeanNotificationEmail } from "./DeanNotificationEmail.js";

const router = express.Router();
const DEAN_EMAIL = process.env.DEAN_EMAIL

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.RND_EMAIL,
    pass: process.env.RND_APP_PASSWD,
  },
});

async function createDecisionToken(projId, action) {
  const token = crypto.randomBytes(32).toString("hex");

  await prisma.decisionToken.create({
    data: {
      token,
      projId,
      action,
    },
  });

  return token;
}

router.post("/confirmation", async (req, res) => {
  const { dept, projId } = req.body;
  if (!dept || !projId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const project = await prisma.project.findUnique({
      where: { id: projId },
      include: { forms: true }
    });

    if (!project) return res.status(400).json({ error: "Project not found" });
    if (!project.hodEmail) return res.status(400).json({ error: "HOD email missing" });

    const form = project.forms?.[0];
    if (!form) return res.status(400).json({ error: "Form not found" });

    const committeeRaw = form.selectionCommittee || {};
    const committee = {
      chair: committeeRaw.chair || "",
      members: Array.isArray(committeeRaw.members) ? committeeRaw.members : []
    };

    await prisma.$transaction([
      prisma.project.update({
        where: { id: projId },
        data: { status: "PENDING_HOD" },
      }),
      prisma.staffRecruitmentForm.update({
        where: { id: form.id },
        data: { status: "PENDING_HOD" },
      }),
    ]);

    const acceptToken = await createDecisionToken(projId, "ACCEPT");
    const rejectToken = await createDecisionToken(projId, "REJECT");

    const acceptLink = `${server}/api/mail/hod/decision?token=${acceptToken}`;
    const rejectLink = `${server}/api/mail/hod/decision?token=${rejectToken}`;

    const html = `
      <div style="font-family:'Inter',Arial,sans-serif; margin:0; padding:0; background-color:#f8fafc; color:#374151; text-align:left;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f8fafc;">
          <tr>
            <td align="left" style="padding: 40px 24px;">
              <div style="width:100%; text-align:left;">
                <h2 style="margin:0 0 12px 0; font-size:24px; font-weight:700; color:#0f766e; text-align:left;">
                  Project Approval Request
                </h2>
                <p style="margin:0 0 26px 0; font-size:15px; font-weight:500; color:#6b7280; text-align:left;">
                  A project submission requires your review. Please examine the details below and take an appropriate action.
                </p>
                <div style="margin-bottom:26px; font-size:14.5px; line-height:1.9; color:#4b5563; text-align:left;">
                  <div style="margin-bottom:8px;">
                    <span style="font-weight:600; color:#6b7280;">Title:</span>
                    <span style="font-weight:600; color:#374151; margin-left:6px;">${project.title}</span>
                  </div>
                  <div style="margin-bottom:8px;">
                    <span style="font-weight:600; color:#6b7280;">Funding Agency:</span>
                    <span style="font-weight:600; color:#374151; margin-left:6px;">${project.fundingAgency}</span>
                  </div>
                  <div style="margin-bottom:8px;">
                    <span style="font-weight:600; color:#6b7280;">Duration:</span>
                    <span style="font-weight:600; color:#374151; margin-left:6px;">${project.projectDuration}</span>
                  </div>
                  <div>
                    <span style="font-weight:600; color:#6b7280;">Submitted By:</span>
                    <span style="font-weight:600; color:#374151; margin-left:6px;">${project.userEmail}</span>
                  </div>
                </div>
                <div style="margin-bottom:28px; font-size:14.5px; line-height:1.9; color:#4b5563; text-align:left;">
                  <div style="margin-bottom:10px; font-size:15px; font-weight:600; color:#0d9488;">
                    Selection Committee
                  </div>
                  <div style="margin-bottom:8px;">
                    <span style="font-weight:600; color:#6b7280;">Chair:</span>
                    <span style="font-weight:600; color:#374151; margin-left:6px;">${committee?.chair || "N/A"}</span>
                  </div>
                  <div>
                    <span style="font-weight:600; color:#6b7280;">Members:</span>
                    <span style="margin-left:6px; color:#374151; font-weight:500;">
                      ${
                        Array.isArray(committee?.members) && committee.members.length
                          ? committee.members.join(", ")
                          : "N/A"
                      }
                    </span>
                  </div>
                </div>
                <div style="margin-top:22px; text-align:left;">
                  <a href="${acceptLink}" style="display:inline-block; padding:11px 22px; font-size:14.5px; font-weight:600; color:#ffffff; background-color:#0d9488; border-radius:8px; text-decoration:none; margin-right:12px;">
                    Approve
                  </a>
                  <a href="${rejectLink}" style="display:inline-block; padding:11px 22px; font-size:14.5px; font-weight:600; color:#374151; background-color:#e5e7eb; border-radius:8px; text-decoration:none;">
                    Request Changes
                  </a>
                </div>
                <p style="margin-top:34px; font-size:12.5px; color:#9ca3af; text-align:left;">
                  This action will be recorded in the system. You may review or update your decision using the provided link.
                </p>
              </div>
            </td>
          </tr>
        </table>
      </div>
    `;
    await transporter.sendMail({
      from: `"Rnd Department" <${process.env.RND_EMAIL}>`,
      to: project.hodEmail,
      subject: `Project Approval Required: ${project.title}`,
      html,
    });
    return res.status(202).json({ message: "Email sent" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal error" });
  }
});

router.get("/decision", async (req, res) => {
  const { token } = req.query;
  if (!token) return res.send("Invalid link");
  const record = await prisma.decisionToken.findUnique({ where: { token } });
  if (!record || record.used) {
    const errorHtml = `
      <html>
        <body style="margin:0;padding:0;background:#f8fafc;font-family:Inter,Arial,sans-serif;">
          <div style="max-width:640px;margin:80px auto;padding:40px 24px;">
            <h2 style="margin:0 0 12px 0;font-size:22px;font-weight:700;color:#dc2626;">
              Link Not Available
            </h2>
            <p style="margin:0 0 20px 0;font-size:15px;color:#6b7280;">
              This decision link has already been used or is no longer valid.
            </p>
            <div style="font-size:14.5px;color:#4b5563;">
              If you believe this is a mistake, please contact the system administrator.
            </div>
          </div>
        </body>
      </html>
    `;
    return res.send(errorHtml);
  }

  const project = await prisma.project.findUnique({
    where: { id: record.projId }
  });

  if (record.action === "ACCEPT") {
    const html = `
      <html>
        <body style="margin:0;padding:0;background:#f8fafc;font-family:Inter,Arial,sans-serif;color:#374151;">
          <div style="max-width:640px;margin:0 auto;padding:40px 24px;">
            <h2 style="margin:0 0 10px 0;font-size:24px;font-weight:700;color:#0f766e;">Confirm Approval</h2>
            <p style="margin:0 0 24px 0;font-size:15px;color:#6b7280;">
              You are about to approve the following project.
            </p>

            <div style="margin-bottom:28px;font-size:14.5px;line-height:1.9;color:#4b5563;">
              <span style="font-weight:600;color:#6b7280;">Project Title:</span>
              <span style="font-weight:600;color:#374151;margin-left:6px;">${project.title}</span>
            </div>
            <form method="POST" action="/api/mail/hod/accept">
              <input type="hidden" name="token" value="${token}" />
              <button style="display:inline-block;padding:11px 24px;font-size:14.5px;font-weight:600;color:#ffffff;background-color:#0d9488;border:none;border-radius:8px;cursor:pointer;">
                Confirm Approval
              </button>
            </form>
            <p style="margin-top:30px;font-size:12.5px;color:#9ca3af;">
              This action will be recorded and cannot be undone.
            </p>
          </div>
        </body>
      </html>
    `;
    return res.send(html);
  }
  return res.redirect(`/api/mail/hod/reject-form?token=${token}`);
});

router.get("/reject-form", async (req, res) => {
  const { token } = req.query;

  const record = await prisma.decisionToken.findUnique({ where: { token } });
  if (!record || record.used) {
    return res.send(`
      <html>
        <body style="margin:0;background:#f8fafc;font-family:Inter,Arial;">
          <div style="max-width:640px;margin:80px auto;padding:40px 24px;">
            <h2 style="margin:0 0 12px 0;font-size:22px;font-weight:700;color:#6b7280;">
              Link Not Available
            </h2>
            <p style="font-size:15px;color:#6b7280;">
              This link is no longer valid or has already been used.
            </p>
          </div>
        </body>
      </html>
    `);
  }

  const project = await prisma.project.findUnique({
    where: { id: record.projId },
  });

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

          <form method="POST" action="/api/mail/hod/reject">

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

  return res.send(html);
});

router.post("/accept", async (req, res) => {
  const { token } = req.body;
  if (!token) return res.send("Invalid request");

  try {
    const result = await prisma.decisionToken.updateMany({
      where: { token, used: false },
      data: { used: true },
    });

    if (result.count === 0) {
      return res.send("Already used or invalid");
    }

    const record = await prisma.decisionToken.findUnique({
      where: { token },
    });

    const project = await prisma.project.findUnique({
      where: { id: record.projId },
    });

    if (!project) return res.send("Project not found");

    const form = await prisma.staffRecruitmentForm.findFirst({
      where: { projectId: record.projId },
    });

    const confirmedProject = await prisma.project.update({
      where: { id: record.projId },
      data: {
        status: "CONFIRMED_HOD",
        logs: {
          create: {
            action: "CONFIRMED_HOD",
            comment: "HOD approved the project.",
          },
        },
      },
    });

    if (form) {
      await prisma.staffRecruitmentForm.update({
        where: { id: form.id },
        data: { status: "CONFIRMED_HOD" },
      });
    }

    const committeeRaw = form?.selectionCommittee || {};
    const committee = {
      chair: committeeRaw.chair || "",
      members: Array.isArray(committeeRaw.members) ? committeeRaw.members : [],
    };

    const acceptToken = await createDecisionToken(confirmedProject.id, "ACCEPT");
    const rejectToken = await createDecisionToken(confirmedProject.id, "REJECT");

    try {
      await transporter.sendMail({
        from: `"Rnd Department" <${process.env.RND_EMAIL}>`,
        to: DEAN_EMAIL,
        subject: `Project Approval Required: ${confirmedProject.title}`,
        html: createDeanNotificationEmail(confirmedProject, committee, acceptToken, rejectToken),
      });
    } catch (err) {
      console.error("Dean mail failed:", err);
    }

    const pendingDeanProject = await prisma.project.update({
      where: { id: record.projId },
      data: { status: "PENDING_DEAN" },
    });

    if (form) {
      await prisma.staffRecruitmentForm.update({
        where: { id: form.id },
        data: { status: "PENDING_DEAN" },
      });
    }

    try {
      await transporter.sendMail({
        from: `"Rnd Department" <${process.env.RND_EMAIL}>`,
        to: pendingDeanProject.userEmail,
        subject: `Project Status Update: HOD Accepted - ${pendingDeanProject.title}`,
        html: createSubmitterUpdateEmail(pendingDeanProject, "ACCEPTED", null),
      });
    } catch (err) {
      console.error("Submitter mail failed:", err);
    }

    const successHtml = `
      <html>
        <body style="margin:0;background:#f8fafc;font-family:Inter,Arial;">
          <div style="max-width:640px;margin:80px auto;padding:40px 24px;">
            <h2 style="margin:0 0 10px 0;font-size:24px;font-weight:700;color:#0f766e;">
              Approval Recorded
            </h2>
            <p style="margin:0 0 20px 0;font-size:15px;color:#6b7280;">
              The project has been successfully approved and forwarded for Dean review.
            </p>
            <div style="font-size:14.5px;color:#4b5563;">
              <span style="font-weight:600;color:#6b7280;">Project:</span>
              <span style="font-weight:600;color:#374151;margin-left:6px;">${project.title}</span>
            </div>
            <p style="margin-top:30px;font-size:12.5px;color:#9ca3af;">
              You can safely close this window.
            </p>
          </div>
        </body>
      </html>
    `;

    return res.send(successHtml);
  } catch (err) {
    console.error(err);
    return res.status(500).send("Internal error");
  }
});

router.post("/reject", async (req, res) => {
  const { token, comment } = req.body;
  if (!comment) return res.send("Comment required");
  const result = await prisma.decisionToken.updateMany({
    where: { token, used: false },
    data: { used: true },
  });
  if (result.count === 0) return res.send("Already used");
  const record = await prisma.decisionToken.findUnique({ where: { token } });
  if (!record || record.action !== "REJECT") return res.send("Invalid token");
  const project = await prisma.project.update({
    where: { id: record.projId },
    data: {
      status: "REJECTED_HOD",
      hodRemark: comment,
      logs: { create: { action: "REJECTED_HOD", comment } },
    },
  });

  const form = await prisma.staffRecruitmentForm.findFirst({
    where: { projectId: record.projId },
  });

  if (form) {
    await prisma.staffRecruitmentForm.update({
      where: { id: form.id },
      data: { status: "REJECTED_HOD" },
    });
  }
  await transporter.sendMail({
    from: `"Rnd Department" <${process.env.RND_EMAIL}>`,
    to: project.userEmail,
    subject: `Project Rejected: ${project.title}`,
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
import express from "express";
import prisma from "../db/prisma.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { HOD_EMAILS } from "../lib/hodEmails.js";

const mailRouter = express.Router();
dotenv.config();

const DEAN_RND_EMAIL = process.env.DEAN_EMAIL;

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.RND_EMAIL,
    pass: process.env.RND_APP_PASSWD,
  },
});

const createSubmitterUpdateEmail = (project, decision) => {
  const isAccepted = decision === "ACCEPTED";
  const color = isAccepted ? "#10B981" : "#EF4444";
  const tag = isAccepted ? "Approved" : "Rejected";
  const icon = isAccepted ? "&#10003; Accepted" : "&#10007; Rejected";
  const background = isAccepted ? "#f0fdf4" : "#fef2f2";
  const message = isAccepted
    ? "Congratulations! Your project has been officially ACCEPTED by the Head of Department and has moved to the next approval stage."
    : "Your project request has been officially REJECTED by the Head of Department. Please review the reasons and resubmit if necessary.";

  return `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
        <div style="background-color: ${color}; padding: 20px; color: white; text-align: center; border-top-left-radius: 12px; border-top-right-radius: 12px;">
            <h1 style="margin: 0; font-size: 24px; font-weight: bold;">Project Status Update: ${tag}</h1>
        </div>
        <div style="padding: 25px 25px 15px 25px; line-height: 1.6; color: #333;">
            <p style="margin-bottom: 20px;">Dear ${
              project.userEmail.split("@")[0]
            },</p>
            <p>${message}</p>
            <hr style="border: 0; border-top: 1px solid #f0f0f0; margin: 25px 0;">
            <h3 style="margin-top: 0; color: ${color}; font-size: 18px;">Project Details (ID: ${
    project.id
  })</h3>
            <ul style="list-style: none; padding: 15px 20px; margin: 0 0 20px 0; background-color: ${background}; border-radius: 8px; border-left: 5px solid ${color};">
              <li style="margin-bottom: 8px;"><strong>Title:</strong> ${
                project.title
              }</li>
              <li style="margin-bottom: 8px;"><strong>HOD Decision:</strong> <span style="font-weight: bold; color: ${color};">${icon}</span></li>
              <li style="margin-bottom: 0;"><strong>New Status:</strong> <span style="font-weight: bold; color: ${color};">${
    project.status
  }</span></li>
            </ul>
            <p style="font-size: 0.9em; color: #777; text-align: center;">Thank you for using the R&D Portal.</p>
        </div>
    </div>
  `;
};

const createDeanNotificationEmail = (project) => {
  const decisionBaseUrl = "http://localhost:5000";
  const acceptLink = `${decisionBaseUrl}/api/mail/dean-decision/accept?projId=${project.id}`;
  const rejectLink = `${decisionBaseUrl}/api/mail/dean-decision/reject?projId=${project.id}`;

  return `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
        <div style="background-color: #3B82F6; padding: 20px; color: white; text-align: center; border-top-left-radius: 12px; border-top-right-radius: 12px;">
            <h1 style="margin: 0; font-size: 24px; font-weight: bold;">&#9989; Next Stage Approval Required</h1>
        </div>
        <div style="padding: 25px 25px 15px 25px; line-height: 1.6; color: #333;">
            <p style="margin-bottom: 20px;">Dear Dean RND,</p>
            <p>A project has been successfully confirmed by the Head of Department and is now pending your final review and decision.</p>
            <hr style="border: 0; border-top: 1px solid #f0f0f0; margin: 25px 0;">
            <h3 style="margin-top: 0; color: #1D4ED8; font-size: 18px;">Project Summary (ID: ${project.id})</h3>
            <ul style="list-style: none; padding: 15px 20px; margin: 0 0 20px 0; background-color: #EFF6FF; border-radius: 8px; border-left: 5px solid #60A5FA;">
              <li style="margin-bottom: 8px;"><strong>Title:</strong> ${project.title}</li>
              <li style="margin-bottom: 8px;"><strong>Submitted By:</strong> ${project.userEmail}</li>
              <li style="margin-bottom: 8px;"><strong>HOD Status:</strong> <span style="font-weight: bold; color: #065F46;">${project.status}</span></li>
              <li style="margin-bottom: 0;"><strong>Action Required:</strong> Dean Approval</li>
            </ul>
            <p style="text-align: center; font-weight: bold; margin-top: 30px;">
                Click one of the buttons below to record your official decision:
            </p>
            <table width="100%" cellspacing="0" cellpadding="0" style="margin-top: 15px; margin-bottom: 30px;">
              <tr>
                <td align="center" style="padding-right: 15px;">
                  <a href="${acceptLink}" target="_blank" style="display: inline-block; padding: 12px 25px; font-size: 16px; color: #ffffff; background-color: #3B82F6; border-radius: 6px; text-decoration: none; font-weight: bold; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); transition: background-color 0.3s;">
                    &#10003; Final Accept
                  </a>
                </td>
                <td align="center" style="padding-left: 15px;">
                  <a href="${rejectLink}" target="_blank" style="display: inline-block; padding: 12px 25px; font-size: 16px; color: #ffffff; background-color: #F87171; border-radius: 6px; text-decoration: none; font-weight: bold; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); transition: background-color 0.3s;">
                    &#10007; Final Reject
                  </a>
                </td>
              </tr>
            </table>
        </div>
        <div style="background-color: #f4f4f4; padding: 15px 25px; text-align: center; border-top: 1px solid #e0e0e0; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px;">
            <p style="font-size: 0.8em; color: #777; margin: 0;">
                By clicking, you submit your decision directly to the system.
            </p>
        </div>
    </div>
  `;
};

const createFinalDecisionEmail = (project, decision) => {
  const isApproved = decision === "APPROVED";
  const color = isApproved ? "#10B981" : "#EF4444";
  const tag = isApproved ? "Approved by Dean" : "Rejected by Dean";
  const background = isApproved ? "#f0fdf4" : "#fef2f2";
  const message = isApproved
    ? "Good news! Your project has been APPROVED by the Dean (R&D)."
    : "We regret to inform you that your project has been REJECTED at the Dean (R&D) level.";

  return `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
        <div style="background-color: ${color}; padding: 20px; color: white; text-align: center; border-top-left-radius: 12px; border-top-right-radius: 12px;">
            <h1 style="margin: 0; font-size: 24px; font-weight: bold;">Final Project Decision: ${tag}</h1>
        </div>
        <div style="padding: 25px 25px 15px 25px; line-height: 1.6; color: #333;">
            <p style="margin-bottom: 20px;">Dear ${
              project.userEmail.split("@")[0]
            },</p>
            <p>${message}</p>
            <hr style="border: 0; border-top: 1px solid #f0f0f0; margin: 25px 0;">
            <h3 style="margin-top: 0; color: ${color}; font-size: 18px;">Project Details (ID: ${
    project.id
  })</h3>
            <ul style="list-style: none; padding: 15px 20px; margin: 0 0 20px 0; background-color: ${background}; border-radius: 8px; border-left: 5px solid ${color};">
              <li style="margin-bottom: 8px;"><strong>Title:</strong> ${
                project.title
              }</li>
              <li style="margin-bottom: 8px;"><strong>Final Status:</strong> <span style="font-weight: bold; color: ${color};">${
    project.status
  }</span></li>
            </ul>
            <p style="font-size: 0.9em; color: #777; text-align: center;">Thank you for using the R&D Portal.</p>
        </div>
    </div>
  `;
};

mailRouter.post("/hod-confirmation", async (req, res) => {
  const { dept, projId } = req.body;

  if (!dept || !projId) {
    return res.status(400).json({
      error: "Missing required fields: dept or projId.",
    });
  }

  const hodEmail = HOD_EMAILS[dept.toLowerCase()] || HOD_EMAILS.default;

  try {
    const projectDetails = await prisma.project.findUnique({
      where: { id: projId },
    });

    if (!projectDetails) {
      return res
        .status(400)
        .json({ error: "Project with given ID does not exist." });
    }

    const form = await prisma.staffRecruitmentForm.findFirst({
      where: { projectId: projId },
    });

    if (!form) {
      return res.status(400).json({
        error: "Selection committee form does not exist for this project.",
      });
    }

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

    const confirmationDetails = {
      ...projectDetails,
      status: "PENDING_HOD",
    };

    const decisionBaseUrl = "http://localhost:5000";
    const acceptLink = `${decisionBaseUrl}/api/mail/hod-decision/accept?projId=${projId}`;
    const rejectLink = `${decisionBaseUrl}/api/mail/hod-decision/reject?projId=${projId}`;

    const mailOptions = {
      from: `"Department System" <${transporter.options.auth.user}>`,
      to: hodEmail,
      subject: `Project Approval Required: Review Project`,
      text: `Action Required: Please visit the links below to approve or reject project (ID: ${projId}).\n\nDetails:\n${JSON.stringify(
        confirmationDetails
      )}\n\nAccept: ${acceptLink}\nReject: ${rejectLink}`,
      html: `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
          <div style="background-color: #10B981; padding: 20px; color: white; text-align: center; border-top-left-radius: 12px; border-top-right-radius: 12px;">
            <h1 style="margin: 0; font-size: 24px; font-weight: bold;">&#9888; Action Required: Project Decision</h1>
          </div>

          <div style="padding: 25px 25px 15px 25px; line-height: 1.6; color: #333;">
            <p style="margin-bottom: 20px;">Dear Head of Department,</p>
            <p>A new project funding request has been submitted and requires your approval. Please review the details below and make your decision.</p>

            <hr style="border: 0; border-top: 1px solid #f0f0f0; margin: 25px 0;">

            <h3 style="margin-top: 0; color: #10B981; font-size: 18px;">Project Summary (ID: ${projId})</h3>

            <ul style="list-style: none; padding: 15px 20px; margin: 0 0 20px 0; background-color: #f0fdf4; border-radius: 8px; border-left: 5px solid #34D399;">
              <li style="margin-bottom: 8px;"><strong>Title:</strong> ${confirmationDetails.title}</li>
              <li style="margin-bottom: 8px;"><strong>Funding Agency:</strong> ${confirmationDetails.fundingAgency}</li>
              <li style="margin-bottom: 8px;"><strong>Duration:</strong> ${confirmationDetails.projectDuration}</li>
              <li style="margin-bottom: 8px;"><strong>Submitted By:</strong> ${confirmationDetails.userEmail}</li>
              <li style="margin-bottom: 0;"><strong>Current Status:</strong> <span style="font-weight: bold; color: #065F46;">${confirmationDetails.status}</span></li>
            </ul>

            <p style="text-align: center; font-weight: bold; margin-top: 30px;">
              Click one of the buttons below to record your official decision:
            </p>

            <table width="100%" cellspacing="0" cellpadding="0" style="margin-top: 15px; margin-bottom: 30px;">
              <tr>
                <td align="center" style="padding-right: 15px;">
                  <a href="${acceptLink}" target="_blank" 
                    style="display: inline-block; padding: 12px 25px; font-size: 16px; color: #ffffff; background-color: #059669; border-radius: 6px; text-decoration: none; font-weight: bold;">
                  &#10003; Accept Project
                  </a>
                </td>
                <td align="center" style="padding-left: 15px;">
                  <a href="${rejectLink}" target="_blank" 
                    style="display: inline-block; padding: 12px 25px; font-size: 16px; color: #ffffff; background-color: #EF4444; border-radius: 6px; text-decoration: none; font-weight: bold;">
                  &#10007; Reject Project
                  </a>
                </td>
              </tr>
            </table>
          </div>

          <div style="background-color: #f4f4f4; padding: 15px 25px; text-align: center; border-top: 1px solid #e0e0e0;">
            <p style="font-size: 0.8em; color: #777; margin: 0;">
              By clicking, you submit your decision directly to the system.  
              If you have questions, contact the project submitter (${confirmationDetails.userEmail}).
            </p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    return res.status(202).json({
      message: `Email sent to HOD (${hodEmail})`,
      messageId: info.messageId,
      acceptLinkExample: acceptLink,
      rejectLinkExample: rejectLink,
    });
  } catch (error) {
    console.error("Error sending HOD confirmation email:", error);
    return res.status(500).json({ error: "Failed to send email." });
  }
});

/**
 * STEP 2: HOD ACCEPTS
 * Flow:
 *  - Project & Form: PENDING_HOD -> CONFIRMED_HOD -> PENDING_DEAN
 *  - Send Dean email
 *  - Send submitter email (status will be PENDING_DEAN)
 */
mailRouter.get("/hod-decision/accept", async (req, res) => {
  const projId = req.query.projId;

  if (!projId) {
    return res.status(400).send(`
 <div style="font-family: Arial, sans-serif; text-align: center; padding: 30px; max-width: 400px; margin: 40px auto; background-color: #fff; border-radius: 8px; border: 1px solid #F59E0B; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);">
 <h1 style="color: #F59E0B; font-size: 1.8em;">URL Error</h1>
 <p style="font-size: 1em; color: #333;">The request URL is incomplete or corrupted.</p>
 <p style="font-size: 0.9em; color: #777;">Missing projId parameter.</p>
 </div>
 `);
  }

  try {
    const form = await prisma.staffRecruitmentForm.findFirst({
      where: { projectId: projId },
    });
    // 1) Set CONFIRMED_HOD (for dean email content)
    const confirmedProject = await prisma.project.update({
      where: { id: projId },
      data: { status: "CONFIRMED_HOD" },
    });

    if (form) {
      await prisma.staffRecruitmentForm.update({
        where: { id: form.id },
        data: { status: "CONFIRMED_HOD" },
      });
    }

    // 2) Send email to Dean (using CONFIRMED_HOD status)
    const deanMailOptions = {
      from: `"Department System" <${transporter.options.auth.user}>`,
      to: DEAN_RND_EMAIL,
      subject: `[ACTION REQUIRED] Project HOD Confirmed: ${confirmedProject.title}`,
      html: createDeanNotificationEmail(confirmedProject),
    };
    await transporter.sendMail(deanMailOptions);

    // 3) Move both to PENDING_DEAN after dean email is sent
    const pendingDeanProject = await prisma.project.update({
      where: { id: projId },
      data: { status: "PENDING_DEAN" },
    });

    if (form) {
      await prisma.staffRecruitmentForm.update({
        where: { id: form.id },
        data: { status: "PENDING_DEAN" },
      });
    }

    // 4) Send email to submitter (shows status PENDING_DEAN)
    const submitterMailOptions = {
      from: `"Department System" <${transporter.options.auth.user}>`,
      to: pendingDeanProject.userEmail,
      subject: `Project Status Update: HOD Accepted - ${pendingDeanProject.title}`,
      html: createSubmitterUpdateEmail(pendingDeanProject, "ACCEPTED"),
    };
    await transporter.sendMail(submitterMailOptions);

    res.send(`
 <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: Arial, sans-serif;">
 <div style="max-width: 500px; margin: 40px auto; padding: 30px; background-color: white; border-radius: 10px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1); text-align: center; border-top: 5px solid #10B981;">
<h1 style="color: #10B981; margin-bottom: 10px; font-size: 2.5em;">✅ Accepted!</h1>
<p style="font-size: 1.1em; color: #333; margin-top: 0;">The project decision has been successfully recorded.</p>

<div style="background-color: #f0fdf4; padding: 15px; border-radius: 6px; margin: 20px 0;">
<p style="font-size: 1.3em; font-weight: bold; color: #065F46; margin: 0;">Project ID: ${projId}</p>
<p style="color: #4CAF50; font-size: 1.1em; margin: 5px 0 0 0;">Status: HOD CONFIRMED & PENDING DEAN</p>
</div>

<p style="font-size: 0.95em; color: #666; margin-top: 30px;">
The system has been updated. You can safely close this window.
 </p>
  </div>
 </body>
`);
  } catch (error) {
    console.error("Error processing HOD acceptance:", error);
    res.status(500).send(`
 <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: Arial, sans-serif;">
 <div style="max-width: 500px; margin: 40px auto; padding: 30px; background-color: white; border-radius: 10px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1); text-align: center; border-top: 5px solid #F59E0B;">
<h1 style="color: #F59E0B; margin-bottom: 10px; font-size: 2.5em;">⚠️ Error!</h1>
<p style="font-size: 1.1em; color: #333; margin-top: 0;">
An internal server error occurred while processing your decision.
</p>

<div style="background-color: #fefce8; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #FDE68A;">
<p style="font-size: 1.2em; font-weight: bold; color: #B45309; margin: 0;">Request ID: ${projId}</p>
</div>

<p style="font-size: 0.95em; color: #666; margin-top: 30px;">
Please try again later. If the issue persists, contact IT support and provide them with the Request ID for details.
 </p>
 <p style="font-size: 0.8em; color: #999;">Error details are logged on the server.</p>
</div>
 </body>
 `);
  }
});

/**
 * STEP 2: HOD REJECTS
 * Flow:
 *  - Project & Form: PENDING_HOD -> REJECTED_HOD
 *  - Send submitter email
 */
mailRouter.get("/hod-decision/reject", async (req, res) => {
  const projId = req.query.projId;

  if (!projId) {
    return res.status(400).send(`
 <div style="font-family: Arial, sans-serif; text-align: center; padding: 30px; max-width: 400px; margin: 40px auto; background-color: #fff; border-radius: 8px; border: 1px solid #F59E0B; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);">
<h1 style="color: #F59E0B; font-size: 1.8em;">URL Error</h1>
<p style="font-size: 1em; color: #333;">The request URL is incomplete or corrupted.</p>
<p style="font-size: 0.9em; color: #777;">Missing projId parameter.</p>
 </div>
 `);
  }

  try {
    const form = await prisma.staffRecruitmentForm.findFirst({
      where: { projectId: projId },
    });

    const updatedProject = await prisma.project.update({
      where: { id: projId },
      data: { status: "REJECTED_HOD" },
    });

    if (form) {
      await prisma.staffRecruitmentForm.update({
        where: { id: form.id },
        data: { status: "REJECTED_HOD" },
      });
    }

    const submitterMailOptions = {
      from: `"Department System" <${transporter.options.auth.user}>`,
      to: updatedProject.userEmail,
      subject: `Project Status Update: HOD Rejected - ${updatedProject.title}`,
      html: createSubmitterUpdateEmail(updatedProject, "REJECTED"),
    };
    await transporter.sendMail(submitterMailOptions);

    res.send(`
 <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: Arial, sans-serif;">
<div style="max-width: 500px; margin: 40px auto; padding: 30px; background-color: white; border-radius: 10px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1); text-align: center; border-top: 5px solid #EF4444;">
<h1 style="color: #EF4444; margin-bottom: 10px; font-size: 2.5em;">🛑 Rejected!</h1>
<p style="font-size: 1.1em; color: #333; margin-top: 0;">The project decision has been successfully recorded.</p>

<div style="background-color: #fef2f2; padding: 15px; border-radius: 6px; margin: 20px 0;">
 <p style="font-size: 1.3em; font-weight: bold; color: #991B1B; margin: 0;">Project ID: ${projId}</p>
 <p style="color: #EF4444; font-size: 1.1em; margin: 5px 0 0 0;">Status: HOD REJECTED</p>
</div>

<p style="font-size: 0.95em; color: #666; margin-top: 30px;">
The system has been updated. You can safely close this window.
</p>
</div>
 </body>
 `);
  } catch (error) {
    console.error("Error processing HOD rejection:", error);
    res.status(500).send(`
 <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: Arial, sans-serif;">
 <div style="max-width: 500px; margin: 40px auto; padding: 30px; background-color: white; border-radius: 10px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1); text-align: center; border-top: 5px solid #F59E0B;">
<h1 style="color: #F59E0B; margin-bottom: 10px; font-size: 2.5em;">⚠️ Error!</h1>
<p style="font-size: 1.1em; color: #333; margin-top: 0;">
An internal server error occurred while processing your decision.
</p>

<div style="background-color: #fefce8; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #FDE68A;">
<p style="font-size: 1.2em; font-weight: bold; color: #B45309; margin: 0;">Request ID: ${projId}</p>
</div>

<p style="font-size: 0.95em; color: #666; margin-top: 30px;">
 Please try again later. If the issue persists, contact IT support and provide them with the Request ID for details.
</p>
<p style="font-size: 0.8em; color: #999;">Error details are logged on the server.</p>
</div>
</body>
 `);
  }
});

/**
 * STEP 3: DEAN ACCEPTS
 * Flow:
 *  - Project & Form: PENDING_DEAN -> APPROVED
 *  - Send final email to submitter
 */
mailRouter.get("/dean-decision/accept", async (req, res) => {
  const projId = req.query.projId;

  if (!projId) {
    return res.status(400).send(`
 <div style="font-family: Arial, sans-serif; text-align: center; padding: 30px; max-width: 400px; margin: 40px auto; background-color: #fff; border-radius: 8px; border: 1px solid #F59E0B; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);">
 <h1 style="color: #F59E0B; font-size: 1.8em;">URL Error</h1>
 <p style="font-size: 1em; color: #333;">The request URL is incomplete or corrupted.</p>
 <p style="font-size: 0.9em; color: #777;">Missing projId parameter.</p>
 </div>
 `);
  }

  try {
    const form = await prisma.staffRecruitmentForm.findFirst({
      where: { projectId: projId },
    });

    const approvedProject = await prisma.project.update({
      where: { id: projId },
      data: { status: "APPROVED" },
    });

    if (form) {
      await prisma.staffRecruitmentForm.update({
        where: { id: form.id },
        data: { status: "APPROVED" },
      });
    }

    const submitterMailOptions = {
      from: `"Department System" <${transporter.options.auth.user}>`,
      to: approvedProject.userEmail,
      subject: `Final Project Decision: Approved - ${approvedProject.title}`,
      html: createFinalDecisionEmail(approvedProject, "APPROVED"),
    };
    await transporter.sendMail(submitterMailOptions);

    res.send(`
 <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: Arial, sans-serif;">
 <div style="max-width: 500px; margin: 40px auto; padding: 30px; background-color: white; border-radius: 10px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1); text-align: center; border-top: 5px solid #10B981;">
<h1 style="color: #10B981; margin-bottom: 10px; font-size: 2.5em;">✅ Final Approval Recorded!</h1>
<p style="font-size: 1.1em; color: #333; margin-top: 0;">The final project decision has been successfully recorded.</p>

<div style="background-color: #f0fdf4; padding: 15px; border-radius: 6px; margin: 20px 0;">
<p style="font-size: 1.3em; font-weight: bold; color: #065F46; margin: 0;">Project ID: ${projId}</p>
<p style="color: #4CAF50; font-size: 1.1em; margin: 5px 0 0 0;">Status: APPROVED</p>
</div>

<p style="font-size: 0.95em; color: #666; margin-top: 30px;">
The system has been updated. You can safely close this window.
 </p>
  </div>
 </body>
`);
  } catch (error) {
    console.error("Error processing Dean acceptance:", error);
    res.status(500).send(`
 <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: Arial, sans-serif;">
 <div style="max-width: 500px; margin: 40px auto; padding: 30px; background-color: white; border-radius: 10px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1); text-align: center; border-top: 5px solid #F59E0B;">
<h1 style="color: #F59E0B; margin-bottom: 10px; font-size: 2.5em;">⚠️ Error!</h1>
<p style="font-size: 1.1em; color: #333; margin-top: 0;">
An internal server error occurred while processing your decision.
</p>

<div style="background-color: #fefce8; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #FDE68A;">
<p style="font-size: 1.2em; font-weight: bold; color: #B45309; margin: 0;">Request ID: ${projId}</p>
</div>

<p style="font-size: 0.95em; color: #666; margin-top: 30px;">
Please try again later. If the issue persists, contact IT support and provide them with the Request ID for details.
 </p>
 <p style="font-size: 0.8em; color: #999;">Error details are logged on the server.</p>
</div>
 </body>
 `);
  }
});

/**
 * STEP 3: DEAN REJECTS
 * Flow:
 *  - Project & Form: PENDING_DEAN -> REJECTED_DEAN
 *  - Send final email to submitter
 */
mailRouter.get("/dean-decision/reject", async (req, res) => {
  const projId = req.query.projId;

  if (!projId) {
    return res.status(400).send(`
 <div style="font-family: Arial, sans-serif; text-align: center; padding: 30px; max-width: 400px; margin: 40px auto; background-color: #fff; border-radius: 8px; border: 1px solid #F59E0B; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);">
 <h1 style="color: #F59E0B; font-size: 1.8em;">URL Error</h1>
 <p style="font-size: 1em; color: #333;">The request URL is incomplete or corrupted.</p>
 <p style="font-size: 0.9em; color: #777;">Missing projId parameter.</p>
 </div>
 `);
  }

  try {
    const form = await prisma.staffRecruitmentForm.findFirst({
      where: { projectId: projId },
    });

    const rejectedProject = await prisma.project.update({
      where: { id: projId },
      data: { status: "REJECTED_DEAN" },
    });

    if (form) {
      await prisma.staffRecruitmentForm.update({
        where: { id: form.id },
        data: { status: "REJECTED_DEAN" },
      });
    }

    const submitterMailOptions = {
      from: `"Department System" <${transporter.options.auth.user}>`,
      to: rejectedProject.userEmail,
      subject: `Final Project Decision: Rejected by Dean - ${rejectedProject.title}`,
      html: createFinalDecisionEmail(rejectedProject, "REJECTED"),
    };
    await transporter.sendMail(submitterMailOptions);

    res.send(`
 <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: Arial, sans-serif;">
<div style="max-width: 500px; margin: 40px auto; padding: 30px; background-color: white; border-radius: 10px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1); text-align: center; border-top: 5px solid #EF4444;">
<h1 style="color: #EF4444; margin-bottom: 10px; font-size: 2.5em;">🛑 Final Rejection Recorded!</h1>
<p style="font-size: 1.1em; color: #333; margin-top: 0;">The final project decision has been successfully recorded.</p>

<div style="background-color: #fef2f2; padding: 15px; border-radius: 6px; margin: 20px 0;">
 <p style="font-size: 1.3em; font-weight: bold; color: #991B1B; margin: 0;">Project ID: ${projId}</p>
 <p style="color: #EF4444; font-size: 1.1em; margin: 5px 0 0 0;">Status: REJECTED_DEAN</p>
</div>

<p style="font-size: 0.95em; color: #666; margin-top: 30px;">
The system has been updated. You can safely close this window.
</p>
</div>
 </body>
 `);
  } catch (error) {
    console.error("Error processing Dean rejection:", error);
    res.status(500).send(`
 <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: Arial, sans-serif;">
 <div style="max-width: 500px; margin: 40px auto; padding: 30px; background-color: white; border-radius: 10px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1); text-align: center; border-top: 5px solid #F59E0B;">
<h1 style="color: #F59E0B; margin-bottom: 10px; font-size: 2.5em;">⚠️ Error!</h1>
<p style="font-size: 1.1em; color: #333; margin-top: 0;">
An internal server error occurred while processing your decision.
</p>

<div style="background-color: #fefce8; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #FDE68A;">
<p style="font-size: 1.2em; font-weight: bold; color: #B45309; margin: 0;">Request ID: ${projId}</p>
</div>

<p style="font-size: 0.95em; color: #666; margin-top: 30px;">
 Please try again later. If the issue persists, contact IT support and provide them with the Request ID for details.
</p>
<p style="font-size: 0.8em; color: #999;">Error details are logged on the server.</p>
</div>
</body>
 `);
  }
});

mailRouter.post("/dean-retry", async (req, res) => {
  const { projId } = req.body;

  if (!projId) return res.status(400).json({ error: "Missing projId" });

  try {
    const project = await prisma.project.findUnique({
      where: { id: projId }
    });

    if (!project) return res.status(404).json({ error: "Project not found" });

    if (project.status !== "CONFIRMED_HOD") {
      return res.status(400).json({
        error: "Retry only allowed when status is CONFIRMED_HOD"
      });
    }

    // Attempt sending email
    await transporter.sendMail({
      from: `"Department System" <${transporter.options.auth.user}>`,
      to: DEAN_RND_EMAIL,
      subject: `[ACTION REQUIRED] Project HOD Confirmed: ${project.title}`,
      html: createDeanNotificationEmail(project),
    });

    // Success → update to PENDING_DEAN
    await prisma.project.update({
      where: { id: projId },
      data: { status: "PENDING_DEAN" }
    });

    const form = await prisma.staffRecruitmentForm.findFirst({
      where: { projectId: projId }
    });

    if (form) {
      await prisma.staffRecruitmentForm.update({
        where: { id: form.id },
        data: { status: "PENDING_DEAN" }
      });
    }

    return res.json({ success: true, message: "Dean email sent" });

  } catch (err) {
    console.error("Dean retry failed:", err);
    return res.status(500).json({ success: false, error: "Failed to send email" });
  }
});


export default mailRouter;

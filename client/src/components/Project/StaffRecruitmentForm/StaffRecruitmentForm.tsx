import { useState, useEffect } from "react";
import { api } from "../../../lib/api";
import StageForm from "./StageForm";
import StageUploaded from "./StageUploaded";
import StagePendingHOD from "./StagePendingHOD";

interface StaffRecruitmentFormProps {
  projectId: string;
}

export default function StaffRecruitmentForm({ projectId }: StaffRecruitmentFormProps) {
  const [members, setMembers] = useState<string[]>([""]);
  const [uploadedMembers, setUploadedMembers] = useState<string[]>([]);
  const [stage, setStage] = useState<"loading" | "form" | "uploaded" | "pending_hod">("loading");

  const [emailSent, setEmailSent] = useState(false);
  const [emailFailed, setEmailFailed] = useState(false);

  const department = "cse";

  // ⭐ Normalize backend data
  const normalize = (data: any) => {
    return Array.isArray(data.members)
      ? data.members
      : data.members?.members || [];
  };

  // ⭐ Fetch existing form on refresh
  useEffect(() => {
    const fetchExisting = async () => {
      try {
        const res = await fetch(`${api}/api/project/${projectId}/staffRecruitmentForm`, {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) {
          setStage("form");
          return;
        }

        const data = await res.json();
        const extracted = normalize(data);

        if (extracted.length > 0) {
          setUploadedMembers(extracted);

          if (data.status === "PENDING") {
            setStage("pending_hod");
          } else {
            setStage("uploaded");
          }
        } else {
          setStage("form");
        }

      } catch (err) {
        console.error(err);
        setStage("form");
      }
    };

    fetchExisting();
  }, [projectId]);

  // ⭐ Trigger HOD mail with retry support
  const triggerHODMail = async () => {
    setEmailFailed(false);

    try {
      const res = await fetch(`${api}/api/mail/hod-confirmation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          dept: department,
          subject: "HOD Approval Required",
          projId: projectId,
        }),
      });

      if (res.ok) {
        setEmailSent(true);
        setStage("pending_hod");
        return true;
      } else {
        setEmailFailed(true);
        return false;
      }

    } catch (err) {
      console.error(err);
      setEmailFailed(true);
      return false;
    }
  };

  // ⭐ Submit members initially
  const handleSubmitMembers = async () => {
    try {
      const res = await fetch(`${api}/api/project/${projectId}/staffRecruitmentForm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          members,
          chair: members[0] // optional
        }),
      });

      if (res.ok) {
        setUploadedMembers(members);
        setStage("uploaded");

        const emailOK = await triggerHODMail();
        if (!emailOK) {
          // Stay in uploaded stage with retry button
          setStage("uploaded");
        }
      }

    } catch (err) {
      console.error(err);
    }
  };

  if (stage === "loading") {
    return (
      <div className="p-6 text-center text-blue-700 font-semibold">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-4 bg-blue-50 p-6 rounded-2xl shadow-sm">

      {stage === "form" && (
        <StageForm
          members={members}
          setMembers={setMembers}
          onSubmit={handleSubmitMembers}
        />
      )}

      {stage === "uploaded" && (
        <StageUploaded
          uploaded={uploadedMembers}
          emailFailed={emailFailed}
          onRetry={triggerHODMail}
        />
      )}

      {stage === "pending_hod" && (
        <StagePendingHOD uploaded={uploadedMembers} emailSent={emailSent} />
      )}
    </div>
  );
}

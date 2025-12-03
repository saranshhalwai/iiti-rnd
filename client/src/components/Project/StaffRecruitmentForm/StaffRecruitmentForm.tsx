import { useState, useEffect } from "react";
import { api } from "../../../lib/api";

import StageForm from "./StageForm";
import StageUploaded from "./StageUploaded";
import StagePendingHOD from "./StagePendingHOD";
import StagePendingDean from "./StagePendingDean";
import StageApproved from "./StageApproved";
import StageRejected from "./StageRejected";

interface StaffRecruitmentFormProps {
  projectId: string;
}

interface CommitteeData {
  chair: string;
  members: string[];
}

type Stage =
  | "loading"
  | "form"
  | "saved"
  | "pending_hod"
  | "rejected_hod"
  | "pending_dean"
  | "rejected_dean"
  | "approved";

const mapStatusToStage = (status?: string): Stage => {
  switch (status) {
    case "SAVED": return "saved";
    case "PENDING_HOD": return "pending_hod";
    case "REJECTED_HOD": return "rejected_hod";
    case "PENDING_DEAN": return "pending_dean";
    case "REJECTED_DEAN": return "rejected_dean";
    case "APPROVED": return "approved";
    default: return "form";
  }
};

export default function StaffRecruitmentForm({ projectId }: StaffRecruitmentFormProps) {
  const [members, setMembers] = useState<string[]>([""]);
  const [chair, setChair] = useState("");
  const [committeeData, setCommitteeData] = useState<CommitteeData | null>(null);

  const [stage, setStage] = useState<Stage>("loading");
  const [sendingMail, setSendingMail] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    const f = async () => {
      try {
        const r = await api.get(`/api/project/${projectId}/staffRecruitmentForm`);
        const data = r.data;

        const sc = data.selectionCommittee || {};
        const loadedChair = sc.chair || "";
        const loadedMembers = Array.isArray(sc.members) ? sc.members : [];

        const committee = { chair: loadedChair, members: loadedMembers };
        setCommitteeData(committee);
        setChair(loadedChair);
        setMembers(loadedMembers);

        if (data.reason) setRejectionReason(data.reason);

        setStage(mapStatusToStage(data.status));
      } catch {
        setStage("form");
      }
    };
    f();
  }, [projectId]);

const triggerHOD = async () => {
  setSendingMail(true);

  try {
    const r = await api.post(`/api/mail/hod-confirmation`, {
      dept: "cse",
      projId: projectId
    });

    if (r.status === 202) {
      setSendingMail(false);
      setStage("pending_hod");
      return true;
    }

    setSendingMail(false);
    return false;

  } catch {
    setSendingMail(false);
    return false;
  }
};


  const triggerDean = async () => {
    try {
      const r = await api.post(`/api/mail/dean-confirmation`, {
        dept: "cse",
        projId: projectId
      });

      if (r.status === 200) {
        setStage("pending_dean");
        return true;
      }

      return false;
    } catch {
      return false;
    }
  };

const submitCommittee = async () => {
  try {
    const r = await api.post(
      `/api/project/${projectId}/staffRecruitmentForm`,
      { chair, members }
    );

    if (r.status === 200) {
      const committee = { chair, members };
      setCommitteeData(committee);

      setStage("saved");
      setSendingMail(true);

      const ok = await triggerHOD();
      if (!ok) setSendingMail(false);
    }
  } catch {}
};


  if (stage === "loading") {
    return (
      <div className="p-6 text-center text-blue-700 font-semibold">
        Loading...
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6 rounded-2xl shadow-sm">
      {stage === "form" && (
        <StageForm
          chair={chair}
          members={members}
          setMembers={setMembers}
          setChair={setChair}
          onSubmit={submitCommittee}
        />
      )}

      {stage === "saved" && committeeData && !sendingMail && (
        <StageUploaded
          uploadedData={committeeData}
          sendingMail={sendingMail}
          onRetry={async () => {
            setSendingMail(true);
            const ok = await triggerHOD();
            if (!ok) setSendingMail(false);
          }}
        />
      )}

      {stage === "saved" && committeeData && sendingMail && (
        <StageUploaded
          uploadedData={committeeData}
          sendingMail={true}
          onRetry={() => {}}
        />
      )}

      {stage === "pending_hod" && committeeData && (
        <StagePendingHOD uploadedData={committeeData} />
      )}

      {stage === "rejected_hod" && committeeData && (
        <StageRejected
          level="HOD"
          uploadedData={committeeData}
          reason={rejectionReason}
        />
      )}

      {stage === "pending_dean" && committeeData && (
        <StagePendingDean uploadedData={committeeData} />
      )}

      {stage === "rejected_dean" && committeeData && (
        <StageRejected
          level="DEAN"
          uploadedData={committeeData}
          reason={rejectionReason}
        />
      )}

      {stage === "approved" && committeeData && (
        <StageApproved uploadedData={committeeData} />
      )}
    </div>
  );
}

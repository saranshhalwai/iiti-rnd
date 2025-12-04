import { FiClock, FiRefreshCw } from "react-icons/fi";
import { api } from "../../../lib/api";
import { useState } from "react";

interface StagePendingDeanProps {
  uploadedData: {
    chair: string;
    members: string[];
  };
  projId: string;
  showRetry?: boolean;
}

export default function StagePendingDean({ uploadedData, projId, showRetry = false }: StagePendingDeanProps) {
  const { chair, members } = uploadedData;

  const [retryLoading, setRetryLoading] = useState(false);
  const [retryMessage, setRetryMessage] = useState("");

  const retryDeanEmail = async () => {
    setRetryLoading(true);
    setRetryMessage("");

    try {
      const res = await api.post(`/api/mail/dean-retry`, {
        projId,
      });

      if (res.data?.success) {
        setRetryMessage("Dean email sent successfully. Status updated.");
      } else {
        setRetryMessage("Failed to send email. Try again.");
      }
    } catch (err) {
      console.error(err);
      setRetryMessage("Error sending email. Try again.");
    }

    setRetryLoading(false);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg space-y-5">

      <div className="flex items-center gap-2 text-purple-700">
        <FiClock size={22} />
        <h2 className="text-lg font-semibold">Awaiting Dean Approval</h2>
      </div>

      <p className="text-gray-600">
        Your committee was approved by the HOD and is now waiting for final approval by the Dean.
      </p>

      <div className="bg-purple-50 border border-purple-200 p-4 rounded-xl space-y-4">

        <div>
          <h3 className="font-semibold text-purple-700 mb-1">Chairperson</h3>
          <p className="text-gray-800 font-medium pl-1 bg-white/50 p-2 rounded-md inline-block min-w-[200px]">
            {chair}
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-purple-700 mb-2">Committee Members</h3>
          {members.length === 0 ? (
            <p className="text-gray-700 pl-1">No members added</p>
          ) : (
            <ul className="space-y-2 text-gray-800">
              {members.map((m, i) => (
                <li key={i} className="flex items-center gap-2 pl-1">
                  {m}
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>

      {showRetry && (
        <div className="pt-3">
          <button
            onClick={retryDeanEmail}
            disabled={retryLoading}
            className="px-4 py-2 rounded-lg bg-purple-600 text-white flex items-center gap-2 hover:bg-purple-700 transition disabled:opacity-50"
          >
            <FiRefreshCw />
            {retryLoading ? "Retrying..." : "Retry Sending to Dean"}
          </button>

          {retryMessage && (
            <p className="text-sm mt-2 text-purple-700">{retryMessage}</p>
          )}
        </div>
      )}

    </div>
  );
}

import { FiXCircle } from "react-icons/fi";

interface StageRejectedProps {
  level: "HOD" | "DEAN";
  uploadedData: {
    chair: string;
    members: string[];
  };
  reason?: string;
}

export default function StageRejected({ level, uploadedData, reason }: StageRejectedProps) {
  const { chair, members } = uploadedData;

  const color = level === "HOD" ? "red" : "orange";

  return (
    <div className={`bg-white p-6 rounded-2xl shadow-lg space-y-5 border border-${color}-300`}>
      
      <div className={`flex items-center gap-2 text-${color}-700`}>
        <FiXCircle size={22} />
        <h2 className="text-lg font-semibold">
          {level} Rejected Your Submission
        </h2>
      </div>

      <p className="text-gray-600">
        Your committee has been reviewed by the {level} and was{" "}
        <span className={`font-semibold text-${color}-700`}>not approved</span>.
      </p>

      {reason && (
        <div className={`bg-${color}-50 border border-${color}-300 p-3 rounded-xl text-${color}-700`}>
          <span className="font-semibold">Reason:</span> {reason}
        </div>
      )}

      <div className={`bg-${color}-50 border border-${color}-200 p-4 rounded-xl space-y-4`}>
        
        <div>
          <h3 className={`font-semibold text-${color}-700 mb-1`}>Chairperson</h3>
          <p className="text-gray-800 font-medium pl-1 bg-white/70 p-2 rounded-md inline-block min-w-[200px]">
            {chair}
          </p>
        </div>

        <div>
          <h3 className={`font-semibold text-${color}-700 mb-2`}>Committee Members</h3>
          <ul className="space-y-2 text-gray-800">
            {members.map((m, i) => (
              <li key={i} className="flex items-center gap-2 pl-1">
                <span className={`w-1.5 h-1.5 bg-${color}-400 rounded-full`}></span>
                {m}
              </li>
            ))}
          </ul>
        </div>

      </div>

      <p className="text-sm text-gray-500">You may update and resubmit the committee.</p>
    </div>
  );
}

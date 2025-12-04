import { FiCheckCircle } from "react-icons/fi";

interface StageApprovedProps {
  uploadedData: {
    chair: string;
    members: string[];
  };
}

export default function StageApproved({ uploadedData }: StageApprovedProps) {
  const { chair, members } = uploadedData;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg space-y-5">

      <div className="flex items-center gap-2 text-green-700">
        <FiCheckCircle size={24} />
        <h2 className="text-lg font-semibold">Committee Approved</h2>
      </div>

      <p className="text-gray-600">
        The Dean has <span className="font-semibold text-green-700">approved</span> your committee.  
        You may now proceed to the next workflow steps.
      </p>

      <div className="bg-green-50 border border-green-200 p-4 rounded-xl space-y-4">

        {/* Chair */}
        <div>
          <h3 className="font-semibold text-green-700 mb-1">Chairperson</h3>
          <p className="text-gray-800 font-medium pl-1 bg-white/50 p-2 rounded-md inline-block min-w-[200px]">
            {chair}
          </p>
        </div>

        {/* Members */}
        <div>
          <h3 className="font-semibold text-green-700 mb-2">Committee Members</h3>
          {(members.length === 0) ? (
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

      <p className="text-sm text-gray-500">
        All approvals complete. Your form is finalized.
      </p>
    </div>
  );
}

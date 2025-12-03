import { FiClock } from "react-icons/fi";

interface StagePendingDeanProps {
  uploadedData: {
    chair: string;
    members: string[];
  };
}

export default function StagePendingDean({ uploadedData }: StagePendingDeanProps) {
  const { chair, members } = uploadedData;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg space-y-5">

      <div className="flex items-center gap-2 text-purple-700">
        <FiClock size={22} />
        <h2 className="text-lg font-semibold">Awaiting Dean Approval</h2>
      </div>

      <p className="text-gray-600">
        Your committee was approved by the HOD and has now been forwarded to the Dean
        for final approval.
      </p>

      <div className="bg-purple-50 border border-purple-200 p-4 rounded-xl space-y-4">

        {/* Chair */}
        <div>
          <h3 className="font-semibold text-purple-700 mb-1">Chairperson</h3>
          <p className="text-gray-800 font-medium pl-1 bg-white/50 p-2 rounded-md inline-block min-w-[200px]">
            {chair}
          </p>
        </div>

        {/* Members */}
        <div>
          <h3 className="font-semibold text-purple-700 mb-2">Committee Members</h3>
          {(members.length === 0) ? (
            <p className="text-gray-700 pl-1">No members added</p>
          ) : (
            <ul className="space-y-2 text-gray-800">
              {members.map((m, i) => (
                <li key={i} className="flex items-center gap-2 pl-1">
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
                  {m}
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </div>
  );
}

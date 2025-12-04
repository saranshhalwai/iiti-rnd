import { FiClock } from "react-icons/fi";

interface StagePendingProps {
  uploadedData: {
    chair: string;
    members: string[];
  };
}

export default function StagePendingHOD({ uploadedData }: StagePendingProps) {
  const { chair, members } = uploadedData;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg space-y-5">
      <div className="flex items-center gap-2 text-blue-700">
        <FiClock size={22} />
        <h2 className="text-lg font-semibold">Awaiting HOD Approval</h2>
      </div>

      <p className="text-gray-600">
        Your committee has been submitted and the email was successfully sent.
      </p>

      <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl space-y-4">
        
        <div>
          <h3 className="font-semibold text-blue-700 mb-1">Chairperson</h3>
          <p className="text-gray-800 font-medium pl-1 bg-white/50 p-2 rounded-md inline-block min-w-[200px]">
            {chair || "N/A"}
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-blue-700 mb-2">Committee Members</h3>
          {(!members || members.length === 0) ? (
            <p className="text-gray-700 pl-1">No additional members</p>
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
    </div>
  );
}
import { FiClock } from "react-icons/fi";

export default function StagePendingHOD({ uploaded, emailSent }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg space-y-5">
      <div className="flex items-center gap-2 text-blue-700">
        <FiClock size={22} />
        <h2 className="text-lg font-semibold">Awaiting HOD Approval</h2>
      </div>

      <p className="text-gray-600">
        Your committee has been submitted and email was successfully sent.
      </p>

      <div className="bg-blue-50 border p-4 rounded-xl">
        <h3 className="font-semibold text-blue-700 mb-2">Committee Members</h3>
        <ul className="space-y-1 text-gray-800">
          {uploaded.map((m: any, i: any) => (
            <li key={i}>• {m}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

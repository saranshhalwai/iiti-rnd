import { FiXCircle, FiRefreshCw, FiLoader } from "react-icons/fi";

interface StageUploadedProps {
  uploadedData: {
    chair: string;
    members: string[];
  };
  sendingMail: boolean;
  onRetry: () => void;
}

export default function StageUploaded({
  uploadedData,
  sendingMail,
  onRetry,
}: StageUploadedProps) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg space-y-5">

      <div className="flex items-center gap-2">
        {sendingMail ? (
          <FiLoader size={22} className="text-blue-600 animate-spin" />
        ) : (
          <FiXCircle size={22} className="text-red-600" />
        )}

        <h2 className="text-lg font-semibold">
          {sendingMail ? "Sending Email…" : "Email Failed"}
        </h2>
      </div>

      <div className="bg-gray-50 border p-4 rounded-xl space-y-4">

        <div>
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide">
            Chairperson
          </h3>
          <p className="text-gray-900 font-semibold mt-1">
            {uploadedData.chair}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide">
            Members
          </h3>

          {uploadedData.members.length > 0 ? (
            <ul className="mt-2 space-y-1">
              {uploadedData.members.map((m, i) => (
                <li
                  key={i}
                  className="px-3 py-2 bg-white border rounded-lg shadow-sm text-gray-800"
                >
                  {m}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic mt-1">
              No additional members.
            </p>
          )}
        </div>
      </div>

      {!sendingMail && (
        <button
          onClick={onRetry}
          className="max-w-md w-full flex items-center justify-center gap-2 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 font-medium"
        >
          <FiRefreshCw size={18} />
          Retry Sending Email
        </button>
      )}
    </div>
  );
}

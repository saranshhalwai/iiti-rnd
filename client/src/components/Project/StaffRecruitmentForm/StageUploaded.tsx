import { FiXCircle, FiCheckCircle, FiRefreshCw } from "react-icons/fi";

export default function StageUploaded({
  uploaded,
  emailFailed,
  onRetry,
}: {
  uploaded: string[];
  emailFailed: boolean;
  onRetry: () => void;
}) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg space-y-5">

      {/* HEADER */}
      <div className="flex items-center gap-2">
        {emailFailed ? (
          <FiXCircle size={22} className="text-red-600" />
        ) : (
          <FiCheckCircle size={22} className="text-green-600" />
        )}

        <h2 className="text-lg font-semibold">
          {emailFailed ? "Committee Saved (Email Failed)" : "Committee Uploaded"}
        </h2>
      </div>

      {/* MEMBERS LIST */}
      <div className="bg-gray-50 border p-4 rounded-xl space-y-2">
        {uploaded.map((m, i) => (
          <div
            key={i}
            className="px-3 py-2 bg-white border rounded-lg shadow-sm"
          >
            {m}
          </div>
        ))}
      </div>

      {/* Retry Button */}
      {emailFailed && (
        <button
          onClick={onRetry}
          className="w-full flex items-center justify-center gap-2 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 font-medium"
        >
          <FiRefreshCw size={18} /> Retry Sending Email
        </button>
      )}

      {!emailFailed && (
        <p className="text-sm text-gray-600 text-center">
          Awaiting email confirmation…
        </p>
      )}
    </div>
  );
}

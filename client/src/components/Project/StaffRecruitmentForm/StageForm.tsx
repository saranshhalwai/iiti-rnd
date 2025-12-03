import { useState } from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";

interface Props {
  members: string[];
  chair: string;
  setMembers: (m: string[]) => void;
  onSubmit: () => void;
  setChair: (chair: string) => void;
}

export default function StageForm({ members, setMembers, onSubmit, chair, setChair }: Props) {
  const [showConfirm, setShowConfirm] = useState(false);

  const updateMember = (i: number, val: string) => {
    const arr = [...members];
    arr[i] = val;
    setMembers(arr);
  };

  const removeMember = (i: number) => {
    setMembers(members.filter((_, idx) => idx !== i));
  };

  return (
    <div className="bg-white shadow-lg rounded-2xl p-6 space-y-6">
      <h2 className="text-xl font-semibold text-blue-700">Staff Recruitment Committee</h2>
      <div>
        <label className="block font-semibold text-gray-700 mb-1">Chairperson</label>
        <input
          type="text"
          value={chair}
          onChange={(e) => setChair(e.target.value)}
          placeholder="Enter Chairperson Name"
          className="w-full border border-gray-300 font-bold rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="space-y-3">
        <label className="block font-semibold text-gray-700">Committee Members</label>
        {members.map((m, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="text"
              value={m}
              onChange={(e) => updateMember(i, e.target.value)}
              placeholder={`Member ${i + 1}`}
              className="flex-1 border border-gray-300 font-semibold rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
            {members.length > 1 && (
              <button
                type="button"
                onClick={() => removeMember(i)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
              >
                <FiTrash2 size={18} />
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={() => setMembers([...members, ""])}
          className="flex items-center gap-1 text-blue-600 hover:underline"
        >
          <FiPlus /> Add Member
        </button>
      </div>

      <button
        onClick={() => setShowConfirm(true)}
        className="max-w-md w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold"
      >
        Review & Submit
      </button>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-[420px] space-y-5">
            <h3 className="text-xl font-semibold text-gray-800">Review Committee Details</h3>

            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div>
                <p className="text-gray-500 text-sm font-medium">Chairperson</p>
                <p className="text-blue-700 font-semibold text-base">{chair || "Not Provided"}</p>
              </div>

              <div>
                <p className="text-gray-500 text-sm font-medium">Members</p>
                <ul className="pl-4 list-disc text-gray-700 font-medium">
                  {members.map((m, i) => (
                    <li key={i}>{m || "Unnamed Member"}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
            <button
              onClick={() => {
                onSubmit();
                setShowConfirm(false);
              }}
              className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700"
            >
              Confirm & Submit
            </button>

            <button
              onClick={() => setShowConfirm(false)}
              className="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
          </div>
        </div>
      )}
    </div>
  );
}
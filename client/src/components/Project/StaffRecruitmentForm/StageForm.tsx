import { useState } from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";

interface Props {
  members: string[];
  setMembers: (m: string[]) => void;
  onSubmit: () => void;
}

export default function StageForm({ members, setMembers, onSubmit }: Props) {
  const [chair, setChair] = useState("");
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

      {/* CHAIR INPUT */}
      <div>
        <label className="block font-medium text-gray-700 mb-1">Chairperson</label>
        <input
          type="text"
          value={chair}
          onChange={(e) => setChair(e.target.value)}
          placeholder="Enter Chairperson Name"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* MEMBERS */}
      <div className="space-y-3">
        <label className="block font-medium text-gray-700">Committee Members</label>

        {members.map((m, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="text"
              value={m}
              onChange={(e) => updateMember(i, e.target.value)}
              placeholder={`Member ${i + 1}`}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
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

      {/* Submit Button */}
      <button
        onClick={() => setShowConfirm(true)}
        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold"
      >
        Review & Submit
      </button>

      {/* CONFIRMATION MODAL */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-[400px] space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Confirm Submission</h3>

            <p className="text-gray-600 text-sm">
              Please confirm you want to submit the committee details.
            </p>

            <button
              onClick={() => {
                onSubmit();
                setShowConfirm(false);
              }}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
            >
              Submit
            </button>

            <button
              onClick={() => setShowConfirm(false)}
              className="w-full bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

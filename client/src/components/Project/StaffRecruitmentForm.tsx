import { useState } from "react"
import { api } from "../../lib/api";

interface StaffRecruitmentFormProps {
  projectId: string;
}

export default function StaffRecruitmentForm({ projectId }: StaffRecruitmentFormProps) {
  const [members, setMembers] = useState([""])
  const [loading, setLoading] = useState(false)

  const addMember = () => setMembers([...members, ""])
interface UpdateMemberFn {
    (i: number, value: string): void;
}

const updateMember: UpdateMemberFn = (i, value) => {
    const updated = [...members];
    updated[i] = value;
    setMembers(updated);
};
  const removeMember = (i: any) => setMembers(members.filter((_, idx) => idx !== i))

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch(`${api}/api/project/${projectId}/staffRecruitmentForm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ members: members }),
    })
      const data = await res.json()
      alert(data.message || "Form submitted successfully!")
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-4 bg-blue-50 p-6 rounded-2xl shadow-sm">
      <h2 className="text-lg font-semibold text-blue-700">Staff Recruitment</h2>

      {members.map((m, i) => (
        <div key={i} className="flex gap-2 items-center">
          <input
            type="text"
            value={m}
            onChange={(e) => updateMember(i, e.target.value)}
            placeholder={`Member ${i + 1} name`}
            className="flex-1 border border-blue-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          {members.length > 1 && (
            <button type="button" onClick={() => removeMember(i)} className="text-red-500 text-sm">
              ✕
            </button>
          )}
        </div>
      ))}

      <div className="flex justify-between items-center mt-4">
        <button
          type="button"
          onClick={addMember}
          className="text-blue-600 text-sm hover:underline"
        >
          + Add Member
        </button>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
      </div>
    </form>
  )
}
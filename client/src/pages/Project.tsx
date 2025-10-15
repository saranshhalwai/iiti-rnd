import { useState } from "react"
import { api } from "../lib/api"

const ProjectForm = () => {
  const [projectTitle, setProjectTitle] = useState("")
  const [fundingAgency, setFundingAgency] = useState("")
  const [projectDuration, setProjectDuration] = useState("")
  const [committee, setCommittee] = useState<string[]>([""])
  const [loading, setLoading] = useState(false)

  const handleCommitteeChange = (index: number, value: string) => {
    const newCommittee = [...committee]
    newCommittee[index] = value
    setCommittee(newCommittee)
  }

  const addCommitteeMember = () => setCommittee([...committee, ""])
  const removeCommitteeMember = (index: number) =>
    setCommittee(committee.filter((_, i) => i !== index))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch(`${api}/api/project/form`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectTitle,
          fundingAgency,
          projectDuration,
          selectionCommittee: committee.filter(c => c.trim() !== ""),
        }),
      })
      const data = await res.json()
      if (data.success) alert("Form submitted successfully!")
      else alert("Submission failed")
    } catch (err) {
      console.error(err)
      alert("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white/90 backdrop-blur-md rounded-3xl shadow-lg mt-8">
      <h2 className="text-2xl font-bold text-blue-800 mb-6 text-center">
        Staff Recruitment Form
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Project Title
          </label>
          <input
            type="text"
            value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            placeholder="Enter project title"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Funding Agency
          </label>
          <input
            type="text"
            value={fundingAgency}
            onChange={(e) => setFundingAgency(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            placeholder="Enter funding agency"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Project Duration
          </label>
          <input
            type="text"
            value={projectDuration}
            onChange={(e) => setProjectDuration(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            placeholder="E.g., 6 months / 1 year"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Selection Committee
          </label>
          {committee.map((member, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <input
                type="text"
                value={member}
                onChange={(e) => handleCommitteeChange(index, e.target.value)}
                required
                placeholder={`Member ${index + 1}`}
                className="flex-1 px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              />
              {committee.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeCommitteeMember(index)}
                  className="text-red-500 font-bold text-lg hover:text-red-700 transition"
                >
                  &times;
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addCommitteeMember}
            className="text-blue-600 font-medium hover:text-blue-800 transition"
          >
            + Add Member
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg"
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  )
}

export default ProjectForm

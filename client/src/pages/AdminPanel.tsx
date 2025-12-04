import { useEffect, useState } from "react"
import Navbar from "../components/Navbar"
import { apiLink } from "../lib/api"

const AdminPanel = () => {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // form state
  const [title, setTitle] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [status, setStatus] = useState("PENDING")
  const [fundingAgency, setFundingAgency] = useState("")
  const [projectDuration, setProjectDuration] = useState("")

  const [showCreate, setShowCreate] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const fetchProjects = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${apiLink}/api/project/all-projects`, {
        method: "GET",
        credentials: "include",
      })
      const data = await res.json()
      if (!data.success) {
        setError(data.message || "Failed to load projects")
        setProjects([])
      } else {
        setProjects(data.projects || [])
      }
    } catch (err: any) {
      setError(err.message || "Network error")
      setProjects([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleCreate = async () => {
    if (!userEmail || !title || !fundingAgency || !projectDuration) {
      alert("Please fill all required fields")
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch(`${apiLink}/api/project/add`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, userEmail, fundingAgency, projectDuration }),
      })
      const data = await res.json()
      if (data.success) {
        alert("Project created!")
        setShowCreate(false)
        // clear form
        setTitle("")
        setUserEmail("")
        setFundingAgency("")
        setProjectDuration("")
        setStatus("PENDING")
        // refresh
        await fetchProjects()
      } else {
        alert(data.message || "Error creating project")
      }
    } catch (err: any) {
      alert(err.message || "Network error")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <p className="text-sm text-gray-600">Manage projects and create new ones</p>
          </div>
          <div>
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded shadow"
            >
              + Create Project
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-medium mb-4">All Projects</h2>

          {loading ? (
            <div className="text-center py-10 text-gray-500">Loading projects...</div>
          ) : error ? (
            <div className="text-center py-10 text-red-500">{error}</div>
          ) : projects.length === 0 ? (
            <div className="text-center py-8 text-gray-600">No projects found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="text-left text-sm text-gray-500 border-b">
                    <th className="py-3 px-2">Title</th>
                    <th className="py-3 px-2">Professor</th>
                    <th className="py-3 px-2">Funding Agency</th>
                    <th className="py-3 px-2">Duration</th>
                    <th className="py-3 px-2">Status</th>
                    <th className="py-3 px-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map(p => (
                    <tr key={p.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-2 align-top">
                        <div className="font-medium">{p.title}</div>
                        <div className="text-xs text-gray-500">ID: {p.id}</div>
                      </td>
                      <td className="py-3 px-2 align-top">{p.userEmail}</td>
                      <td className="py-3 px-2 align-top">{p.fundingAgency}</td>
                      <td className="py-3 px-2 align-top">{p.projectDuration}</td>
                      <td className="py-3 px-2 align-top">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          p.status === "APPROVED"
                            ? "bg-green-100 text-green-700"
                            : p.status === "REJECTED_HOD" || p.status === "REJECTED_DEAN"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 px-2 align-top">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              // navigate to project page if needed
                              window.location.href = `/project/${p.id}`
                            }}
                            className="text-sm text-blue-600 hover:underline"
                          >
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create Project Modal */}
      {showCreate && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowCreate(false)}></div>
          <div className="bg-white rounded-xl shadow-lg z-10 w-full max-w-lg mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Create New Project</h3>
              <button className="text-gray-500 hover:text-gray-700" onClick={() => setShowCreate(false)}>Close</button>
            </div>

            <div className="space-y-3">
              <input
                placeholder="Project Title"
                className="border p-2 w-full rounded"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />

              <input
                placeholder="Professor Email"
                className="border p-2 w-full rounded"
                value={userEmail}
                onChange={e => setUserEmail(e.target.value)}
              />

              <input
                placeholder="Funding Agency"
                className="border p-2 w-full rounded"
                value={fundingAgency}
                onChange={e => setFundingAgency(e.target.value)}
              />

              <input
                placeholder="Project Duration"
                className="border p-2 w-full rounded"
                value={projectDuration}
                onChange={e => setProjectDuration(e.target.value)}
              />

              <div>
                <label className="text-sm text-gray-600">Status</label>
                <select
                  className="block w-full border p-2 rounded mt-1"
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                >
                  <option value="PENDING">PENDING</option>
                  <option value="SAVED">SAVED</option>
                  <option value="APPROVED">APPROVED</option>
                </select>
              </div>

              <div className="flex gap-3 justify-end mt-4">
                <button
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 rounded border hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={submitting}
                  className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-60"
                >
                  {submitting ? "Creating..." : "Create Project"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminPanel

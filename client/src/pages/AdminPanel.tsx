import { useEffect, useState } from "react"
import Navbar from "../components/Navbar"
import { apiLink } from "../lib/api"
import CreateProjectModal from "../components/Project/CreateProject"

const AdminPanel = () => {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [showCreate, setShowCreate] = useState(false)

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

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <p className="text-sm text-gray-600">
              Manage projects and create new ones
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => (window.location.href = "/admin/dept-head-mails")}
              className="inline-flex items-center gap-2 bg-gray-700 hover:bg-gray-800 text-white font-semibold py-2 px-4 rounded shadow"
            >
              Edit Dept Head Mails
            </button>

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
            <div className="text-center py-10 text-gray-500">
              Loading projects...
            </div>
          ) : error ? (
            <div className="text-center py-10 text-red-500">{error}</div>
          ) : projects.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              No projects found.
            </div>
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
                      <td className="py-3 px-2">
                        <div className="font-medium">{p.title}</div>
                      </td>
                      <td className="py-3 px-2">{p.userEmail}</td>
                      <td className="py-3 px-2">{p.fundingAgency}</td>
                      <td className="py-3 px-2">{p.projectDuration}</td>
                      <td className="py-3 px-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            p.status === "APPROVED"
                              ? "bg-green-100 text-green-700"
                              : p.status === "REJECTED_HOD" ||
                                p.status === "REJECTED_DEAN"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <button
                          onClick={() =>
                            (window.location.href = `/project/${p.id}`)
                          }
                          className="text-sm text-blue-600 hover:underline"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <CreateProjectModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={fetchProjects}
      />
    </div>
  )
}

export default AdminPanel
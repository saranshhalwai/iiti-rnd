import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { api } from "../../lib/api"
import { FiArrowUpRight } from "react-icons/fi"

const ProjectList = () => {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch(`${api}/api/project/user-projects`, {
          credentials: "include"
        })
        const data = await res.json()
        if (data.success) setProjects(data.projects)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchProjects()
  }, [])

  if (loading) {
    return <p className="p-6 text-gray-500">Loading projects...</p>
  }

  return (
    <div className="p-6 mt-4">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Your Projects</h2>
      <ul className="space-y-4">
        {projects.length > 0 ? (
          projects.map((proj: any) => (
            <li
              key={proj.id}
              onClick={() => navigate(`/project/${proj.id}`)}
              className={`p-5 border rounded-xl cursor-pointer transition flex justify-between items-center ${
                proj.status === "Pending"
                  ? "hover:bg-yellow-50 border-yellow-300"
                  : "hover:bg-blue-50 border-blue-300"
              }`}
            >
              <div>
                <p className="font-semibold text-lg text-gray-800">{proj.title}</p>
                <p
                  className={`text-sm mt-1 ${
                    proj.status === "Pending"
                      ? "text-yellow-600"
                      : "text-green-600"
                  }`}
                >
                  Status: {proj.status}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  navigate(`/project/${proj.id}`)
                }}
                className="text-blue-600 hover:text-blue-800 font-medium transition"
              >
                <FiArrowUpRight className="ml-1" />
              </button>
            </li>
          ))
        ) : (
          <p className="text-gray-600">No projects found.</p>
        )}
      </ul>
    </div>
  )
}

export default ProjectList
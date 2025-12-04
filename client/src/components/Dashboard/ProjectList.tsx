import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { apiLink } from "../../lib/api"
import { FiArrowUpRight } from "react-icons/fi"

const statusStyles: Record<string, any> = {
  PENDING: {
    border: "border-gray-300",
    hover: "hover:bg-gray-50",
    text: "text-gray-600"
  },
  SAVED: {
    border: "border-blue-300",
    hover: "hover:bg-blue-50",
    text: "text-blue-600"
  },
  PENDING_HOD: {
    border: "border-yellow-400",
    hover: "hover:bg-yellow-50",
    text: "text-yellow-600"
  },
  CONFIRMED_HOD: {
    border: "border-green-400",
    hover: "hover:bg-green-50",
    text: "text-green-600"
  },
  REJECTED_HOD: {
    border: "border-red-400",
    hover: "hover:bg-red-50",
    text: "text-red-600"
  },
  PENDING_DEAN: {
    border: "border-indigo-400",
    hover: "hover:bg-indigo-50",
    text: "text-indigo-600"
  },
  REJECTED_DEAN: {
    border: "border-red-400",
    hover: "hover:bg-red-50",
    text: "text-red-600"
  },
  APPROVED: {
    border: "border-green-500",
    hover: "hover:bg-green-50",
    text: "text-green-700"
  }
}

const ProjectList = () => {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch(`${apiLink}/api/project/user-projects`, {
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
          projects.map((proj: any) => {
            const s = statusStyles[proj.status] || statusStyles["PENDING"]

            return (
              <li
                key={proj.id}
                onClick={() => navigate(`/project/${proj.id}`)}
                className={`p-5 border rounded-xl cursor-pointer transition flex justify-between items-center 
                  ${s.border} ${s.hover}`}
              >
                <div>
                  <p className="font-semibold text-lg text-gray-800">{proj.title}</p>
                  <p className={`text-sm mt-1 ${s.text}`}>
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
            )
          })
        ) : (
          <p className="text-gray-600">No projects found.</p>
        )}
      </ul>
    </div>
  )
}

export default ProjectList
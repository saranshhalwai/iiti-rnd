import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import StaffRecruitmentForm from "../components/Project/StaffRecruitmentForm/StaffRecruitmentForm"
import { api } from "../lib/api"

const tabs = [
  { id: 1, title: "Staff Recruitment" },
  { id: 2, title: "Progress Report" },
  { id: 3, title: "Completion" },
]

export default function Project() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(1)
  type ProjectType = {
    id: string
    title: string
    fundingAgency?: string
    duration?: string
    status?: string
  }

  const [project, setProject] = useState<ProjectType | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await fetch(`${api}/api/project/${id}`, {
          credentials: "include",
        });
        console.log(res)
        if (res.status === 403) {
          navigate("/unauthorized")
          return
        }
        const data = await res.json()
        setProject(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchProject()
  }, [id, navigate])

  if (loading) return <div className="text-center text-gray-500 mt-10">Loading...</div>

  if (!project) return <div className="text-center text-red-500 mt-10">Project not found</div>

  return (
    <div className="min-h-screen bg-white text-gray-900 p-8">
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8 shadow-sm">
        <h1 className="text-2xl font-bold text-blue-700 mb-2">{project.title}</h1>
        <div className="text-sm text-gray-700 space-y-1">
          <p><strong>Funding Agency:</strong> {project.fundingAgency || "N/A"}</p>
          <p><strong>Duration:</strong> {project.duration || "N/A"}</p>
          <p><strong>Status:</strong> {project.status}</p>
        </div>
      </div>

      <div className="flex justify-around border-b border-gray-200 mb-6 w-full">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 px-4 text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-blue-600"
            }`}
          >
            <div className="flex flex-col items-center">
            <span className="w-8 h-8 flex items-center justify-center text-lg border border-blue-200 bg-blue-800 text-white rounded-full">
            {tab.id}
            </span>
              <span className="text-sm">{tab.title}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-6">
        {activeTab === 1 && <StaffRecruitmentForm projectId={String(project.id)} />}
        {activeTab === 2 && <div className="text-gray-500 text-center">Progress report coming soon</div>}
        {activeTab === 3 && <div className="text-gray-500 text-center">Completion stage coming soon</div>}
      </div>
    </div>
  )
}

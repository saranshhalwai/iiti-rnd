import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import StaffRecruitmentForm from "../components/Project/StaffRecruitmentForm/StaffRecruitmentForm"
import RecruitmentDetailsForm from "../components/Project/RecruitmentDetailsForm.tsx"
// Import the new component (we will create this next)

import { apiLink } from "../lib/api"
const tabs = [
  { id: 1, title: "Staff Recruitment" },
  { id: 2, title: "Recruitment Details" }, // New Section
  { id: 3, title: "Progress Report" },
  { id: 4, title: "Completion" },
]

export default function Project() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(1)
  type ProjectLogType = {
    id: string
    action: string
    comment: string | null
    createdAt: string
  }

  type ProjectType = {
    id: string
    title: string
    fundingAgency?: string
    projectDuration?: string
    status?: string
    logs?: ProjectLogType[]
  }

  const [project, setProject] = useState<ProjectType | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await fetch(`${apiLink}/api/project/${id}`, {
          credentials: "include",
        });
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

  const isRejected = project.status === "REJECTED_HOD" || project.status === "REJECTED_DEAN";
  const latestRejectionLog = isRejected && project.logs ? project.logs.slice().reverse().find(log => log.action.startsWith("REJECTED")) : null;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-3">{project.title}</h1>
              <div className="text-sm text-gray-600 space-y-1.5 flex flex-col sm:flex-row sm:space-y-0 sm:space-x-6">
                <p><span className="font-semibold text-gray-700">Funding Agency:</span> {project.fundingAgency || "N/A"}</p>
                <p><span className="font-semibold text-gray-700">Duration:</span> {project.projectDuration || "N/A"}</p>
                <p><span className="font-semibold text-gray-700">Status:</span> 
                  <span className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                    isRejected ? "bg-red-100 text-red-800 border-red-200" 
                    : project.status?.includes("CONFIRMED") || project.status?.includes("APPROVED") ? "bg-green-100 text-green-800 border-green-200"
                    : "bg-blue-100 text-blue-800 border-blue-200"
                  }`}>
                    {project.status?.replace(/_/g, " ")}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {isRejected && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-r-xl p-5 mb-6 shadow-sm">
            <h3 className="text-red-800 font-bold flex items-center gap-2 text-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Project Rejected
            </h3>
            <p className="text-red-700 mt-2 text-sm">
              <strong>Reason:</strong> {latestRejectionLog?.comment || "No specific reason provided."}
            </p>
            <p className="text-red-600 mt-1 text-xs">
              Please use the <strong>Staff Recruitment</strong> tab below to edit your committee details and resubmit.
            </p>
          </div>
        )}

      <div className="flex bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden w-full">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-4 px-4 text-sm font-medium transition-colors border-b-2 ${
              activeTab === tab.id
                ? "text-blue-600 border-blue-600 bg-blue-50/50"
                : "text-gray-500 border-transparent hover:text-blue-600 hover:bg-gray-50"
            }`}
          >
            <div className="flex flex-col items-center justify-center gap-2">
              <span className={`w-8 h-8 flex items-center justify-center text-sm font-bold rounded-full transition-colors ${
                activeTab === tab.id 
                  ? "bg-blue-600 text-white shadow-md shadow-blue-200" 
                  : "bg-gray-100 text-gray-500 border border-gray-200"
              }`}>
                {index + 1}
              </span>
              <span className="hidden sm:inline">{tab.title}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6 min-h-[400px]">
        {activeTab === 1 && <StaffRecruitmentForm projectId={String(project.id)} />}
        
        {/* New Component Rendered Here */}
        {activeTab === 2 && <RecruitmentDetailsForm projectId={String(project.id)} />}
        
        {activeTab === 3 && <div className="text-gray-500 text-center">Progress report coming soon</div>}
        {activeTab === 4 && <div className="text-gray-500 text-center">Completion stage coming soon</div>}
      </div>
    </div>
  )
}
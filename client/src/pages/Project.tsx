import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import StaffRecruitmentForm from "../components/Project/StaffRecruitmentForm/StaffRecruitmentForm"
import RecruitmentDetailsForm from "../components/Project/RecruitmentDetailsForm.tsx"
import { apiLink } from "../lib/api"

const tabs = [
  { id: 1, title: "Staff Recruitment" },
  { id: 2, title: "Recruitment Details" },
  { id: 3, title: "Progress Report" },
  { id: 4, title: "Completion" },
]

export default function Project() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(1)

  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await fetch(`${apiLink}/api/project/${id}`, {
          credentials: "include",
        })

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

  // 🔥 HARD NAVIGATION CONTROL
  useEffect(() => {
    if (!project) return

    if (project.status === "APPROVED") {
      setActiveTab(2)
    }

    if (project.status === "RECRUITMENT_VACANCY") {
      setActiveTab(3)
    }

    if (
      project.status !== "APPROVED" &&
      project.status !== "RECRUITMENT_VACANCY"
    ) {
      setActiveTab(1)
    }
  }, [project])

  if (loading) return <div className="text-center text-gray-500 mt-10">Loading...</div>
  if (!project) return <div className="text-center text-red-500 mt-10">Project not found</div>

  const isRejected =
    project.status === "REJECTED_HOD" || project.status === "REJECTED_DEAN"

  // 🔒 HARD CLICK CONTROL
  const handleTabClick = (tabId: number) => {
    if (!project) return

    // Step 1 locked forever after approval
    if (
      tabId === 1 &&
      (project.status === "APPROVED" || project.status === "RECRUITMENT_VACANCY")
    ) return

    // Step 2 locked before approval
    if (tabId === 2 && project.status !== "APPROVED") return

    // Step 2 locked after completion
    if (tabId === 2 && project.status === "RECRUITMENT_VACANCY") return

    // Step 3 only after step 2
    if (tabId === 3 && project.status !== "RECRUITMENT_VACANCY") return

    // Step 4 always locked (for now)
    if (tabId === 4) return

    setActiveTab(tabId)
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-8">
      <div className="max-w-5xl mx-auto">

        {/* HEADER */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-800 mb-3">{project.title}</h1>

          <div className="text-sm text-gray-600 flex flex-wrap gap-6">
            <p><span className="font-semibold text-gray-700">Funding:</span> {project.fundingAgency || "N/A"}</p>
            <p><span className="font-semibold text-gray-700">Duration:</span> {project.projectDuration || "N/A"}</p>

            <p>
              <span className="font-semibold text-gray-700">Status:</span>
              <span className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                isRejected
                  ? "bg-red-100 text-red-800 border-red-200"
                  : project.status === "APPROVED" || project.status === "RECRUITMENT_VACANCY"
                  ? "bg-green-100 text-green-800 border-green-200"
                  : "bg-blue-100 text-blue-800 border-blue-200"
              }`}>
                {project.status?.replace(/_/g, " ")}
              </span>
            </p>
          </div>
        </div>

        {/* TABS */}
        <div className="flex bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          {tabs.map((tab, index) => {

            const isLocked =
              (tab.id === 1 && (project.status === "APPROVED" || project.status === "RECRUITMENT_VACANCY")) ||
              (tab.id === 2 && project.status !== "APPROVED") ||
              (tab.id === 2 && project.status === "RECRUITMENT_VACANCY") ||
              (tab.id === 3 && project.status !== "RECRUITMENT_VACANCY") ||
              (tab.id === 4)

            const isCompleted =
              tab.id === 1 && (project.status === "APPROVED" || project.status === "RECRUITMENT_VACANCY")

            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`flex-1 py-4 px-4 text-sm font-medium border-b-2 transition-all ${
                  isLocked
                    ? "text-gray-300 cursor-not-allowed"
                    : activeTab === tab.id
                    ? "text-blue-600 border-blue-600 bg-blue-50/50"
                    : "text-gray-500 hover:text-blue-600 hover:bg-gray-50"
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <span className={`w-8 h-8 flex items-center justify-center text-sm font-bold rounded-full ${
                    isCompleted
                      ? "bg-green-500 text-white"
                      : activeTab === tab.id
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-500 border"
                  }`}>
                    {isCompleted ? "✓" : index + 1}
                  </span>

                  <span className="hidden sm:inline">
                    {tab.title}
                    {isLocked && " 🔒"}
                  </span>
                </div>
              </button>
            )
          })}
        </div>

        {/* CONTENT */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 min-h-[400px]">

          {/* STEP 1 */}
          {activeTab === 1 &&
            project.status !== "APPROVED" &&
            project.status !== "RECRUITMENT_VACANCY" && (
              <StaffRecruitmentForm projectId={String(project.id)} />
          )}

          {/* STEP 2 */}
          {activeTab === 2 && project.status === "APPROVED" && (
            <RecruitmentDetailsForm projectId={String(project.id)} />
          )}

          {/* STEP 3 */}
          {activeTab === 3 && project.status === "RECRUITMENT_VACANCY" && (
            <div className="text-gray-500 text-center">
              Next stage coming soon
            </div>
          )}

        </div>

      </div>
    </div>
  )
}
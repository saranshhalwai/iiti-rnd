import { useEffect, useState } from "react"
import ProjectList from "../components/Dashboard/ProjectList"
import { api } from "../lib/api"

const Dashboard = () => {
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("Projects")

  useEffect(() => {
    fetch(`${api}/api/auth/user`, { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        if (data.success) setUser(data.user)
        else window.location.href = "/"
      })
  }, [])

  const tabs = ["Projects", "Might be anything", "Analytics", "Settings"]

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="bg-white border-b shadow-inner flex justify-center">
        <div className="flex gap-8 w-full">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-4 text-center font-medium rounded-t-lg transition-all duration-200 ${
                activeTab === tab
                  ? "text-blue-600 border-b-4 border-blue-600 bg-blue-50"
                  : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-center mt-8 px-6">
        <div className="bg-white rounded-2xl shadow-md w-full max-w-6xl p-8">
          {activeTab === "Projects" && (
            <div>
              <ProjectList/>
            </div>
          )}

          {activeTab === "Forms" && (
            <div className="text-gray-600 text-center py-20">
              <p>📝 Forms section coming soon...</p>
            </div>
          )}

          {activeTab === "Analytics" && (
            <div className="text-gray-600 text-center py-20">
              <p>📊 Analytics dashboard under development...</p>
            </div>
          )}

          {activeTab === "Settings" && (
            <div className="text-gray-600 text-center py-20">
              <p>⚙️ Settings will be available soon...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard

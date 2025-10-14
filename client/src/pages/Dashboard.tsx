import { useEffect, useState } from "react"
import Navbar from "../components/Navbar"

const Dashboard = () => {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    fetch("http://localhost:5000/api/auth/user", { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        if (data.success) setUser(data.user)
        else window.location.href = "/"
      })
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="p-8">
        <h1 className="text-3xl font-semibold">Welcome, {user?.email}</h1>
      </div>
    </div>
  )
}

export default Dashboard

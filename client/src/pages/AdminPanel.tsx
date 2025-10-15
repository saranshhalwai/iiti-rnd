import { useState } from "react"
import { api } from "../lib/api"

const AdminPanel = () => {
  const [title, setTitle] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [status, setStatus] = useState("Pending")

  const handleCreate = async () => {
    const token = localStorage.getItem("acKey")
    const res = await fetch(`${api}/admin/create-project`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, userEmail, status }),
    })
    const data = await res.json()
    alert(data.id ? "Project created!" : "Error creating project")
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-lg mx-auto bg-white shadow-lg rounded p-6">
        <h2 className="text-2xl font-semibold mb-6 text-center">
          Create New Project
        </h2>
        <input
          placeholder="Project Title"
          className="border p-2 w-full mb-3"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <input
          placeholder="Professor Email"
          className="border p-2 w-full mb-3"
          value={userEmail}
          onChange={e => setUserEmail(e.target.value)}
        />
        <select
          className="border p-2 w-full mb-4"
          value={status}
          onChange={e => setStatus(e.target.value)}
        >
          <option>Pending</option>
          <option>Active</option>
          <option>Completed</option>
        </select>
        <button
          className="bg-green-600 text-white w-full py-2 rounded"
          onClick={handleCreate}
        >
          Create Project
        </button>
      </div>
    </div>
  )
}

export default AdminPanel

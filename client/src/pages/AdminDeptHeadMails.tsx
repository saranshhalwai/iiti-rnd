import { useEffect, useState } from "react"
import Navbar from "../components/Navbar"
import { apiLink } from "../lib/api"

type Dept = {
  dept_name: string
  hod_email: string
}

const AdminDeptHeadMails = () => {
  const [departments, setDepartments] = useState<Dept[]>([])
  const [loading, setLoading] = useState(false)
  const [allHods, setAllHods] = useState<string[]>([])
  const [editingDept, setEditingDept] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    hod_email: "",
  })

  const [addForm, setAddForm] = useState({
    dept_name: "",
    hod_email: "",
  })

  const fetchDepartments = async () => {
    setLoading(true)
    try {
      const res = await fetch(
        `${apiLink}/api/admin/department-authority/all`,
        { credentials: "include" }
      )
      const data = await res.json()
      if (data.success) setDepartments(data.departments)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDepartments()
  }, [])

  const saveEdit = async () => {
    if (!editingDept) return

    await fetch(
      `${apiLink}/api/admin/department-authority/edit/${editingDept}`,
      {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      }
    )

    setEditingDept(null)
    fetchDepartments()
  }

  const addDepartment = async () => {
    const { dept_name, hod_email } = addForm
    if (!dept_name || !hod_email) {
      alert("All fields required")
      return
    }

    await fetch(
      `${apiLink}/api/admin/department-authority/create`,
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addForm),
      }
    )

    setAddForm({ dept_name: "", hod_email: ""})
    fetchDepartments()
  }

  const deleteDepartment = async (dept: string) => {
    const ok = window.confirm(
      `Are you sure you want to delete "${dept}"?\nThis action cannot be undone.`
    )
    if (!ok) return
    await fetch(
      `${apiLink}/api/admin/department-authority/delete/${dept}`,
      {
        method: "DELETE",
        credentials: "include",
      }
    )
    fetchDepartments()
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-slate-800 mb-8">
          Edit Department Head Emails
        </h1>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-10">
          <h2 className="text-lg font-semibold text-slate-700 mb-4">
            Add Department
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              placeholder="Department"
              className="border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              value={addForm.dept_name}
              onChange={e =>
                setAddForm(f => ({ ...f, dept_name: e.target.value }))
              }
            />
            <input
              placeholder="HOD Email"
              className="border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              value={addForm.hod_email}
              onChange={e =>
                setAddForm(f => ({ ...f, hod_email: e.target.value }))
              }
            />
          </div>

          <button
            onClick={addDepartment}
            className="mt-5 bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg shadow-sm"
          >
            Add Department
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-700 mb-6">
            Department Head Emails
          </h2>

          {loading ? (
            <div className="text-slate-500">Loading...</div>
          ) : (
            <div className="space-y-4">
              {departments.map(d => (
                <div
                  key={d.dept_name}
                  className="border border-slate-200 rounded-xl p-5 hover:shadow-sm transition"
                >
                  <div className="font-semibold text-slate-800 mb-3">
                    {d.dept_name}
                  </div>

                  {editingDept === d.dept_name ? (
                    <div className="space-y-3">
                      <input
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        value={editForm.hod_email}
                        onChange={e =>
                          setEditForm(f => ({
                            ...f,
                            hod_email: e.target.value,
                          }))
                        }
                      />

                      <div className="flex gap-3">
                        <button
                          onClick={saveEdit}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingDept(null)}
                          className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-slate-600">
                      <div>
                        <b>HOD:</b> {d.hod_email}
                      </div>
                      <div className="mt-4 flex gap-4">
                      <button
                        onClick={() => {
                          setEditingDept(d.dept_name)
                          setEditForm({
                            hod_email: d.hod_email,
                          })
                        }}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => deleteDepartment(d.dept_name)}
                        className="text-red-600 hover:underline font-medium"
                      >
                        Delete
                      </button>
                    </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminDeptHeadMails
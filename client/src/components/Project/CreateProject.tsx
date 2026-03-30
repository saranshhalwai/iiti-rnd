import { useEffect, useState, useRef } from "react"
import { apiLink } from "../../lib/api"

interface Props {
  open: boolean
  onClose: () => void
  onCreated: () => Promise<void>
}

const CreateProjectModal = ({ open, onClose, onCreated }: Props) => {
  const [title, setTitle] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [hodEmail, setHodEmail] = useState("")
  const [fundingAgency, setFundingAgency] = useState("")
  const [projectDuration, setProjectDuration] = useState("")
  const [status, setStatus] = useState("PENDING")
  const [submitting, setSubmitting] = useState(false)

  const [allHods, setAllHods] = useState<string[]>([])
  const [showHodDropdown, setShowHodDropdown] = useState(false)

  const hodRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const fetchAll = async () => {
      try {
        const res = await fetch(
          `${apiLink}/api/admin/department-authority/suggest?role=HOD`,
          { credentials: "include" }
        )

        const data = await res.json()

        if (data.success) setAllHods(data.emails)
      } catch (err) {
        console.error("Failed to fetch HOD list", err)
      }
    }

    fetchAll()
  }, [open])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        hodRef.current &&
        !hodRef.current.contains(e.target as Node)
      ) {
        setShowHodDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () =>
      document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleCreate = async () => {
    if (
      !title ||
      !userEmail ||
      !hodEmail ||
      !fundingAgency ||
      !projectDuration
    ) {
      alert("Please fill all required fields")
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch(`${apiLink}/api/project/add`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          userEmail,
          hodEmail,
          fundingAgency,
          projectDuration,
          status,
        }),
      })

      const data = await res.json()
      if (data.success) {
        onClose()
        setTitle("")
        setUserEmail("")
        setHodEmail("")
        setFundingAgency("")
        setProjectDuration("")
        setStatus("PENDING")
        await onCreated()
      } else {
        alert(data.message || "Error creating project")
      }
    } catch {
      alert("Network error")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          <div className="relative z-10 w-full max-w-xl mx-4">
            <div className="bg-white/90 backdrop-blur rounded-[28px] shadow-[0_25px_70px_rgba(0,0,0,0.25)] overflow-hidden">
              
              <div className="px-8 pt-6 pb-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-slate-800">
                    Create New Project
                  </h3>
                  <button
                    onClick={onClose}
                    className="text-slate-400 hover:text-slate-600 transition text-lg"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="px-8 py-6 space-y-4">
                <input
                  placeholder="Project Title"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />

                <input
                  placeholder="Professor Email"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={userEmail}
                  onChange={e => setUserEmail(e.target.value)}
                />

                <div className="relative" ref={hodRef}>
                  <input
                    placeholder="HOD Email"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={hodEmail}
                    onChange={e => setHodEmail(e.target.value)}
                    onFocus={() => setShowHodDropdown(true)}
                  />

                  {showHodDropdown && allHods.length > 0 && (
                    <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-md max-h-40 overflow-y-auto">
                      {allHods.map(email => (
                        <div
                          key={email}
                          className="px-4 py-2 text-sm cursor-pointer hover:bg-slate-100"
                          onClick={() => {
                            setHodEmail(email)
                            setShowHodDropdown(false)
                          }}
                        >
                          {email}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <input
                  placeholder="Funding Agency"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={fundingAgency}
                  onChange={e => setFundingAgency(e.target.value)}
                />

                <input
                  placeholder="Project Duration"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={projectDuration}
                  onChange={e => setProjectDuration(e.target.value)}
                />

                <select
                  className="w-full border border-slate-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                >
                  <option value="PENDING">PENDING</option>
                  <option value="SAVED">SAVED</option>
                  <option value="APPROVED">APPROVED</option>
                </select>
              </div>

              <div className="px-8 py-5 flex justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-5 py-2 rounded-full border border-slate-300 text-slate-600 hover:bg-white transition"
                >
                  Cancel
                </button>

                <button
                  onClick={handleCreate}
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-md hover:shadow-lg transition disabled:opacity-60"
                >
                  {submitting ? "Creating..." : "Create Project"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default CreateProjectModal
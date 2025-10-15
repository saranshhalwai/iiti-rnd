import { Navigate } from "react-router-dom"

const ProtectedAdminRoute = ({ children, role }: any) => {
  const token = localStorage.getItem("acKey")
  if (!token) return <Navigate to="/login" />

  const payload = JSON.parse(atob(token.split(".")[1]))
  if (role && payload.role !== role) return <Navigate to="/" />

  return children
}

export default ProtectedAdminRoute

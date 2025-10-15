import "./App.css"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import ProtectedRoute from "./components/ProtectedRoute"
import ProtectedAdminRoute from "./components/ProtectedAdminRoute"
import AdminPanel from "./pages/AdminPanel"
import ProjectForm from "./pages/Project"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>}/>
        <Route
          path="/admin/panel"
          element={
            <ProtectedAdminRoute role="admin">
              <AdminPanel/>
            // </ProtectedAdminRoute>
          }
        />
        <Route path="/project" element={<ProjectForm/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App

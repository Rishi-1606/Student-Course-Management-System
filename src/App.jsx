import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import StudentDashboard from './pages/StudentDashboard'
import AdminDashboard from './pages/AdminDashboard'
import './App.css'

function App() {
  return (
    <Routes>
      {/* Public routes — no Layout wrapper so they get the full-screen auth design */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Student-only route */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute role="student">
            <Layout>
              <StudentDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Admin-only route */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <Layout>
              <AdminDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Catch-all → login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App

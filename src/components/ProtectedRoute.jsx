import { Navigate } from 'react-router-dom'
import { loadSession } from '../utils/localStorage'

/**
 * Wraps a route so only authenticated users (optionally of a specific role)
 * can access it. Unauthenticated users are redirected to /login.
 */
function ProtectedRoute({ children, role }) {
  const session = loadSession()

  if (!session) return <Navigate to="/login" replace />
  if (role && session.role !== role) return <Navigate to="/login" replace />

  return children
}

export default ProtectedRoute

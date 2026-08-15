import { useNavigate } from 'react-router-dom'
import { loadSession, clearSession } from '../utils/localStorage'

function Layout({ children }) {
  const navigate = useNavigate()
  const session = loadSession()

  const handleLogout = () => {
    clearSession()
    navigate('/login', { replace: true })
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-top">
          <div>
            <h1>Student Course Management System</h1>
            <p>Manage student registration and course enrollments</p>
          </div>
          {session && (
            <div className="header-user">
              <span className="header-role-badge">
                {session.role === 'admin' ? '🛡 Admin' : '🎓 Student'}
              </span>
              <button type="button" className="btn btn-logout" onClick={handleLogout}>
                Sign Out
              </button>
            </div>
          )}
        </div>
      </header>
      <main className="main">{children}</main>
    </div>
  )
}

export default Layout

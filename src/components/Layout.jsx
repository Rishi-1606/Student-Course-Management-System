import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { loadSession, clearSession } from '../utils/localStorage'

const STUDENT_NAV = [
  { icon: '🏠', label: 'Dashboard', href: '/dashboard' },
]

const ADMIN_NAV = [
  { icon: '👥', label: 'Students', href: '/admin' },
]

function Layout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const session  = loadSession()
  const [collapsed, setCollapsed] = useState(false)

  // ── Force light mode — wipe any stored dark theme ──
  useEffect(() => {
    document.documentElement.removeAttribute('data-theme')
    localStorage.removeItem('scms.theme')
  }, [])

  const handleLogout = () => {
    clearSession()
    navigate('/login', { replace: true })
  }

  const isAdmin   = session?.role === 'admin'
  const navItems  = isAdmin ? ADMIN_NAV : STUDENT_NAV
  const initials  = session?.name
    ? session.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : (isAdmin ? 'AD' : 'ST')

  return (
    <div className={`app-shell ${collapsed ? 'sidebar-collapsed' : ''}`}>
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="sidebar-logo">🏛</span>
          {!collapsed && (
            <div className="sidebar-brand-text">
              <span className="sidebar-title">CourseFlow</span>
              <span className="sidebar-subtitle">Academic Portal</span>
            </div>
          )}
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.href}
              type="button"
              className={`sidebar-link ${location.pathname === item.href ? 'sidebar-link-active' : ''}`}
              onClick={() => navigate(item.href)}
              title={collapsed ? item.label : ''}
            >
              <span className="sidebar-link-icon">{item.icon}</span>
              {!collapsed && <span className="sidebar-link-label">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          {/* User info */}
          <div className={`sidebar-user ${collapsed ? 'sidebar-user-compact' : ''}`}>
            <div className="sidebar-avatar">{initials}</div>
            {!collapsed && (
              <div className="sidebar-user-info">
                <p className="sidebar-user-role">{session?.name || (isAdmin ? 'Administrator' : 'Student')}</p>
                <p className="sidebar-user-hint">{isAdmin ? 'Admin' : 'Student'} · Logged in</p>
              </div>
            )}
          </div>

          {/* Logout */}
          <button
            type="button"
            className="sidebar-logout"
            onClick={handleLogout}
            title="Sign Out"
          >
            <span>↩</span>
            {!collapsed && <span>Sign Out</span>}
          </button>

          {/* Collapse toggle */}
          <button
            type="button"
            className="sidebar-collapse-btn"
            onClick={() => setCollapsed((v) => !v)}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? '›' : '‹'}
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="content-area">
        <header className="topbar">
          <div className="topbar-left">
            <h1 className="topbar-title">CourseFlow</h1>
            <p className="topbar-sub">Student Course Management System</p>
          </div>
          <div className="topbar-right">
            <span className={`role-pill ${isAdmin ? 'role-pill-admin' : 'role-pill-student'}`}>
              {isAdmin ? '🛡 Admin' : '🎓 Student'}
            </span>
          </div>
        </header>
        <main className="main">{children}</main>
      </div>
    </div>
  )
}

export default Layout

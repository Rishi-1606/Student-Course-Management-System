import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login } from '../utils/api'
import { saveSession } from '../utils/localStorage'

function LoginPage() {
  const navigate = useNavigate()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword]     = useState('')
  const [error, setError]           = useState('')
  const [loading, setLoading]       = useState(false)
  const [showForgot, setShowForgot] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!identifier.trim()) { setError('Please enter your PRN or username.'); return }
    if (!password)           { setError('Please enter your password.'); return }
    setLoading(true)
    try {
      const session = await login(identifier.trim(), password)
      saveSession(session)
      navigate(session.role === 'admin' ? '/admin' : '/dashboard', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">

      {/* ── Left brand panel ── */}
      <div className="auth-brand-panel">
        <div className="auth-brand-inner">
          {/* Institution mark */}
          <div className="auth-crest">
            <span className="auth-crest-icon">🏛</span>
          </div>
          <p className="auth-inst-label">Institute of Technology</p>
          <h1 className="auth-brand-title">Student Course<br />Management System</h1>
          <p className="auth-brand-tagline">Academic Year 2024 – 25</p>

          <div className="auth-brand-divider" />

          {/* Feature points */}
          <ul className="auth-feature-list">
            <li><span className="auth-feat-icon">📋</span>Course registration &amp; enrollment</li>
            <li><span className="auth-feat-icon">🗓</span>Semester-wise curriculum planning</li>
            <li><span className="auth-feat-icon">📊</span>Real-time seat availability</li>
            <li><span className="auth-feat-icon">🔒</span>Secure student portal access</li>
          </ul>

          {/* Quick help */}
          <div className="auth-brand-help">
            <span>Admin login: <code>admin</code> / <code>admin123</code></span>
          </div>
        </div>

        {/* Decorative grid */}
        <div className="auth-brand-grid" aria-hidden="true" />
      </div>

      {/* ── Right form panel ── */}
      <div className="auth-card">
        <div className="auth-header">
          <span className="auth-icon">🎓</span>
          <h2 className="auth-form-title">Welcome back</h2>
          <p>Sign in to access your academic portal</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="identifier">PRN / Username</label>
            <input
              id="identifier" type="text" value={identifier}
              onChange={(e) => { setIdentifier(e.target.value); setError('') }}
              placeholder="e.g. PRN-1001 or admin"
              autoFocus autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password" type="password" value={password}
              onChange={(e) => { setPassword(e.target.value); setError('') }}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </div>

          {error && <p className="auth-error" role="alert">{error}</p>}

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In →'}
          </button>

          <button type="button" className="forgot-link"
            onClick={() => setShowForgot((v) => !v)}>
            {showForgot ? 'Hide' : 'Forgot password?'}
          </button>
        </form>

        {showForgot && (
          <div className="forgot-panel" role="alert">
            <p className="forgot-title">🔑 Can't access your account?</p>
            <p>Passwords are reset by the system admin. Contact your admin with your <strong>name</strong> and <strong>PRN</strong>.</p>
          </div>
        )}

        <p className="auth-footer">
          New student? <Link to="/register">Create an account &amp; get your PRN</Link>
        </p>

        <p className="auth-disclaimer">
          This portal is for registered students and staff of the institute only.
          Unauthorised access is prohibited.
        </p>
      </div>
    </div>
  )
}

export default LoginPage

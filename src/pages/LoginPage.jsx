import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login } from '../utils/api'
import { saveSession } from '../utils/localStorage'

function LoginPage() {
  const navigate = useNavigate()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!identifier.trim()) { setError('Enter your roll number or username.'); return }
    if (!password) { setError('Enter your password.'); return }

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
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon">🎓</div>
          <h1>Student Course Management</h1>
          <p>Sign in to access your account</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="identifier">Roll Number / Username</label>
            <input
              id="identifier"
              type="text"
              value={identifier}
              onChange={(e) => { setIdentifier(e.target.value); setError('') }}
              placeholder="e.g. CS2024001 or admin"
              autoFocus
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError('') }}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </div>

          {error && <p className="auth-error" role="alert">{error}</p>}

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="auth-footer">
          New student? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  )
}

export default LoginPage

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createStudent } from '../utils/api'

const initialForm = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
}

function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)
  const [generatedPRN, setGeneratedPRN] = useState(null) // Show PRN after success

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
    setServerError('')
  }

  const validate = () => {
    const next = {}
    if (!form.name.trim()) next.name = 'Enter your full name.'
    if (!form.email.trim()) {
      next.email = 'Enter your email.'
    } else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      next.email = 'Enter a valid email address.'
    }
    if (!form.password) {
      next.password = 'Enter a password.'
    } else if (form.password.length < 6) {
      next.password = 'Password must be at least 6 characters.'
    }
    if (!form.confirmPassword) {
      next.confirmPassword = 'Confirm your password.'
    } else if (form.password !== form.confirmPassword) {
      next.confirmPassword = 'Passwords do not match.'
    }
    return next
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const nextErrors = validate()
    if (Object.values(nextErrors).some(Boolean)) { setErrors(nextErrors); return }

    setLoading(true)
    try {
      const { confirmPassword, ...studentData } = form
      const saved = await createStudent({
        ...studentData,
        name: studentData.name.trim(),
        email: studentData.email.trim(),
      })
      // Don't auto-login — show PRN first so student can save it
      setGeneratedPRN(saved.prn)
    } catch (err) {
      setServerError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // ── PRN reveal screen ─────────────────────────────────────
  if (generatedPRN) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-icon">🎉</div>
            <h1>Account Created!</h1>
            <p>Your Permanent Registration Number (PRN) has been generated. <strong>Save it — you will need it to log in every time.</strong></p>
          </div>

          <div className="prn-display">
            <p className="prn-label">Your PRN</p>
            <p className="prn-value">{generatedPRN}</p>
            <p className="prn-hint">📋 Write this down or take a screenshot before continuing.</p>
          </div>

          <button
            type="button"
            className="btn btn-primary btn-full"
            style={{ marginTop: '1.5rem' }}
            onClick={() => navigate('/login', { replace: true })}
          >
            Proceed to Login →
          </button>
        </div>
      </div>
    )
  }

  // ── Registration form ─────────────────────────────────────
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon">📝</div>
          <h1>Create Account</h1>
          <p>Register to get your PRN and access the course portal</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="reg-name">Full Name</label>
            <input
              id="reg-name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              autoFocus
              autoComplete="name"
              aria-invalid={Boolean(errors.name)}
            />
            {errors.name && <p className="field-error">{errors.name}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="reg-email">Email</label>
            <input
              id="reg-email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="student@college.edu"
              autoComplete="email"
              aria-invalid={Boolean(errors.email)}
            />
            {errors.email && <p className="field-error">{errors.email}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Min. 6 characters"
              autoComplete="new-password"
              aria-invalid={Boolean(errors.password)}
            />
            {errors.password && <p className="field-error">{errors.password}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="reg-confirm">Confirm Password</label>
            <input
              id="reg-confirm"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter password"
              autoComplete="new-password"
              aria-invalid={Boolean(errors.confirmPassword)}
            />
            {errors.confirmPassword && <p className="field-error">{errors.confirmPassword}</p>}
          </div>

          {serverError && <p className="auth-error" role="alert">{serverError}</p>}

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already registered? <Link to="/login">Sign in with PRN</Link>
        </p>
      </div>
    </div>
  )
}

export default RegisterPage

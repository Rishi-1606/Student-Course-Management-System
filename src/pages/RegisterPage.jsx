import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { createStudent } from '../utils/api'
import { saveSession } from '../utils/localStorage'

const DEPARTMENTS = [
  'Computer Science',
  'Information Technology',
  'Electronics',
  'Mechanical',
  'Civil',
]

const SEMESTERS = ['1', '2', '3', '4', '5', '6', '7', '8']

const initialForm = {
  name: '',
  rollNumber: '',
  department: '',
  semester: '',
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

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
    setServerError('')
  }

  const validate = () => {
    const next = {}
    if (!form.name.trim()) next.name = 'Enter your full name.'
    if (!form.rollNumber.trim()) next.rollNumber = 'Enter your roll number.'
    if (!form.department) next.department = 'Select a department.'
    if (!SEMESTERS.includes(form.semester)) next.semester = 'Select a semester.'
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
      // Strip confirmPassword before saving
      const { confirmPassword, ...studentData } = form
      const saved = await createStudent({
        ...studentData,
        name: studentData.name.trim(),
        rollNumber: studentData.rollNumber.trim(),
        email: studentData.email.trim(),
      })
      saveSession({ role: 'student', studentId: saved.id })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setServerError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide">
        <div className="auth-header">
          <div className="auth-icon">📝</div>
          <h1>Create Account</h1>
          <p>Register as a new student</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input id="name" name="name" type="text" value={form.name}
                onChange={handleChange} placeholder="Enter full name"
                aria-invalid={Boolean(errors.name)} />
              {errors.name && <p className="field-error">{errors.name}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="rollNumber">Roll Number</label>
              <input id="rollNumber" name="rollNumber" type="text" value={form.rollNumber}
                onChange={handleChange} placeholder="e.g. CS2024001"
                aria-invalid={Boolean(errors.rollNumber)} />
              {errors.rollNumber && <p className="field-error">{errors.rollNumber}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="department">Department</label>
              <select id="department" name="department" value={form.department}
                onChange={handleChange} aria-invalid={Boolean(errors.department)}>
                <option value="">Select department</option>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              {errors.department && <p className="field-error">{errors.department}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="semester">Semester</label>
              <select id="semester" name="semester" value={form.semester}
                onChange={handleChange} aria-invalid={Boolean(errors.semester)}>
                <option value="">Select semester</option>
                {SEMESTERS.map((s) => <option key={s} value={s}>Semester {s}</option>)}
              </select>
              {errors.semester && <p className="field-error">{errors.semester}</p>}
            </div>

            <div className="form-group form-group-full">
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" value={form.email}
                onChange={handleChange} placeholder="student@college.edu"
                aria-invalid={Boolean(errors.email)} />
              {errors.email && <p className="field-error">{errors.email}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="reg-password">Password</label>
              <input id="reg-password" name="password" type="password" value={form.password}
                onChange={handleChange} placeholder="Min. 6 characters"
                autoComplete="new-password" aria-invalid={Boolean(errors.password)} />
              {errors.password && <p className="field-error">{errors.password}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input id="confirmPassword" name="confirmPassword" type="password"
                value={form.confirmPassword} onChange={handleChange}
                placeholder="Re-enter password" autoComplete="new-password"
                aria-invalid={Boolean(errors.confirmPassword)} />
              {errors.confirmPassword && <p className="field-error">{errors.confirmPassword}</p>}
            </div>
          </div>

          {serverError && <p className="auth-error" role="alert">{serverError}</p>}

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}

export default RegisterPage

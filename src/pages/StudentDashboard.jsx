import { useState, useEffect } from 'react'
import { loadSession } from '../utils/localStorage'
import {
  getStudentById, getCourses, createCourse, updateCourse, deleteCourse,
  updateStudent, changePassword,
} from '../utils/api'
import CourseForm, { initialCourse } from '../components/CourseForm'
import CourseList from '../components/CourseList'
import { useToast } from '../components/Toast'

const CREDIT_LIMIT = 24
const DEPARTMENTS = ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil']
const SEMESTERS = ['1', '2', '3', '4', '5', '6', '7', '8']

// ── Edit Profile Form ─────────────────────────────────────
function EditProfileForm({ student, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    name: student.name,
    email: student.email,
    department: student.department,
    semester: student.semester,
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const next = {}
    if (!form.name.trim()) next.name = 'Name is required.'
    if (!form.email.trim()) {
      next.email = 'Email is required.'
    } else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      next.email = 'Enter a valid email.'
    }
    if (!form.department) next.department = 'Select a department.'
    if (!SEMESTERS.includes(form.semester)) next.semester = 'Select a semester.'
    return next
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const nextErrors = validate()
    if (Object.values(nextErrors).some(Boolean)) { setErrors(nextErrors); return }
    setLoading(true)
    await onSubmit({ name: form.name.trim(), email: form.email.trim(), department: form.department, semester: form.semester })
    setLoading(false)
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="edit-name">Full Name</label>
          <input id="edit-name" name="name" type="text" value={form.name}
            onChange={handleChange} aria-invalid={Boolean(errors.name)} />
          {errors.name && <p className="field-error">{errors.name}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="edit-email">Email</label>
          <input id="edit-email" name="email" type="email" value={form.email}
            onChange={handleChange} aria-invalid={Boolean(errors.email)} />
          {errors.email && <p className="field-error">{errors.email}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="edit-department">Department</label>
          <select id="edit-department" name="department" value={form.department}
            onChange={handleChange} aria-invalid={Boolean(errors.department)}>
            <option value="">Select department</option>
            {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          {errors.department && <p className="field-error">{errors.department}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="edit-semester">Semester</label>
          <select id="edit-semester" name="semester" value={form.semester}
            onChange={handleChange} aria-invalid={Boolean(errors.semester)}>
            <option value="">Select semester</option>
            {SEMESTERS.map((s) => <option key={s} value={s}>Semester {s}</option>)}
          </select>
          {errors.semester && <p className="field-error">{errors.semester}</p>}
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving…' : 'Save Changes'}
        </button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  )
}

// ── Change Password Form ──────────────────────────────────
function ChangePasswordForm({ onSubmit, onCancel }) {
  const [form, setForm] = useState({ current: '', next: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '', server: '' }))
  }

  const validate = () => {
    const next = {}
    if (!form.current) next.current = 'Enter your current password.'
    if (!form.next) {
      next.next = 'Enter a new password.'
    } else if (form.next.length < 6) {
      next.next = 'Password must be at least 6 characters.'
    }
    if (!form.confirm) {
      next.confirm = 'Confirm your new password.'
    } else if (form.next !== form.confirm) {
      next.confirm = 'Passwords do not match.'
    }
    return next
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const nextErrors = validate()
    if (Object.values(nextErrors).some(Boolean)) { setErrors(nextErrors); return }
    setLoading(true)
    try {
      await onSubmit(form.current, form.next)
    } catch (err) {
      setErrors({ server: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <div className="form-grid">
        <div className="form-group form-group-full">
          <label htmlFor="pwd-current">Current Password</label>
          <input id="pwd-current" name="current" type="password" value={form.current}
            onChange={handleChange} autoComplete="current-password"
            aria-invalid={Boolean(errors.current)} />
          {errors.current && <p className="field-error">{errors.current}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="pwd-next">New Password</label>
          <input id="pwd-next" name="next" type="password" value={form.next}
            onChange={handleChange} placeholder="Min. 6 characters"
            autoComplete="new-password" aria-invalid={Boolean(errors.next)} />
          {errors.next && <p className="field-error">{errors.next}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="pwd-confirm">Confirm New Password</label>
          <input id="pwd-confirm" name="confirm" type="password" value={form.confirm}
            onChange={handleChange} autoComplete="new-password"
            aria-invalid={Boolean(errors.confirm)} />
          {errors.confirm && <p className="field-error">{errors.confirm}</p>}
        </div>
      </div>

      {errors.server && <p className="auth-error" role="alert">{errors.server}</p>}

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Updating…' : 'Update Password'}
        </button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  )
}

// ── Credit Meter ──────────────────────────────────────────
function CreditMeter({ used, limit }) {
  const percent = Math.min((used / limit) * 100, 100)
  const remaining = limit - used
  const isOver = remaining <= 0
  const isWarn = !isOver && percent >= 75

  return (
    <div className="credit-meter">
      <div className="credit-meter-labels">
        <span className="credit-meter-used">{used} / {limit} credits used</span>
        <span className={isOver ? 'credit-text-danger' : isWarn ? 'credit-text-warning' : 'credit-text-safe'}>
          {isOver ? '🚫 Limit reached' : `${remaining} remaining`}
        </span>
      </div>
      <div className="credit-bar">
        <div
          className={`credit-bar-fill ${isOver ? 'credit-bar-full' : isWarn ? 'credit-bar-warn' : ''}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}

// ── Student Dashboard ─────────────────────────────────────
function StudentDashboard() {
  const session = loadSession()
  const toast = useToast()
  const [student, setStudent] = useState(null)
  const [courses, setCourses] = useState([])
  const [course, setCourse] = useState(initialCourse)
  const [editingCourseId, setEditingCourseId] = useState(null)
  const [courseError, setCourseError] = useState('')
  const [profileMode, setProfileMode] = useState('view') // 'view' | 'edit' | 'password'

  useEffect(() => {
    getStudentById(session.studentId)
      .then((s) => { setStudent(s); return getCourses(s.id) })
      .then(setCourses)
      .catch((err) => toast(err.message, 'error'))
  }, [session.studentId])

  const totalCredits = courses.reduce((sum, c) => sum + Number(c.credits), 0)
  const creditsRemaining = CREDIT_LIMIT - totalCredits

  // ── Course handlers ──
  const handleCourseSubmit = async (courseData) => {
    const newCredits = Number(courseData.credits)

    // Credit limit check
    if (editingCourseId) {
      const prev = courses.find((c) => c.id === editingCourseId)
      const creditDiff = newCredits - Number(prev?.credits ?? 0)
      if (totalCredits + creditDiff > CREDIT_LIMIT) {
        setCourseError(`Exceeds the ${CREDIT_LIMIT}-credit limit. You can increase by at most ${CREDIT_LIMIT - totalCredits + Number(prev?.credits ?? 0)} credits.`)
        return
      }
    } else {
      if (totalCredits + newCredits > CREDIT_LIMIT) {
        setCourseError(`Exceeds the ${CREDIT_LIMIT}-credit limit. You have ${creditsRemaining} credits remaining.`)
        return
      }
    }

    const duplicate = courses.find(
      (c) => c.courseCode.toLowerCase() === courseData.courseCode.toLowerCase() && c.id !== editingCourseId
    )
    if (duplicate) { setCourseError('A course with this code is already registered.'); return }

    try {
      if (editingCourseId) {
        const saved = await updateCourse(editingCourseId, courseData)
        setCourses((prev) => prev.map((c) => (c.id === editingCourseId ? saved : c)))
        setEditingCourseId(null)
        setCourse(initialCourse)
        toast('Course updated successfully.')
      } else {
        const saved = await createCourse({ ...courseData, studentId: session.studentId })
        setCourses((prev) => [...prev, saved])
        setCourse(initialCourse)
        toast('Course registered successfully.')
      }
      setCourseError('')
    } catch (err) {
      setCourseError(err.message)
    }
  }

  const handleEditCourse = (c) => {
    setCourse({ courseCode: c.courseCode, courseName: c.courseName, facultyName: c.facultyName, credits: c.credits })
    setEditingCourseId(c.id)
    setCourseError('')
  }

  const handleCancelCourse = () => {
    setCourse(initialCourse)
    setEditingCourseId(null)
    setCourseError('')
  }

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Delete this course?')) return
    try {
      await deleteCourse(courseId)
      setCourses((prev) => prev.filter((c) => c.id !== courseId))
      toast('Course deleted.')
      if (editingCourseId === courseId) handleCancelCourse()
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  // ── Profile handlers ──
  const handleProfileSave = async (data) => {
    try {
      const updated = await updateStudent(session.studentId, data)
      setStudent(updated)
      setProfileMode('view')
      toast('Profile updated successfully.')
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  const handlePasswordSave = async (currentPassword, newPassword) => {
    await changePassword(session.studentId, currentPassword, newPassword)
    setProfileMode('view')
    toast('Password changed successfully.')
  }

  if (!student) return <div className="section empty-state"><p>Loading…</p></div>

  const creditsUsed = totalCredits
  const creditsLeft = CREDIT_LIMIT - creditsUsed

  return (
    <>

      {/* ── Profile section ── */}
      <section className="section student-summary">
        <div className="profile-header">
          <h2>My Profile</h2>
          <div className="profile-actions">
            <button
              type="button"
              className={`btn ${profileMode === 'edit' ? 'btn-secondary' : 'btn-edit'}`}
              onClick={() => setProfileMode(profileMode === 'edit' ? 'view' : 'edit')}
            >
              {profileMode === 'edit' ? '✕ Cancel' : '✏ Edit Profile'}
            </button>
            <button
              type="button"
              className={`btn ${profileMode === 'password' ? 'btn-secondary' : 'btn-edit'}`}
              onClick={() => setProfileMode(profileMode === 'password' ? 'view' : 'password')}
            >
              {profileMode === 'password' ? '✕ Cancel' : '🔑 Change Password'}
            </button>
          </div>
        </div>

        {profileMode === 'view' && (
          <div className="summary-card">
            <div className="summary-row"><span className="label">Name</span><span className="value">{student.name}</span></div>
            <div className="summary-row"><span className="label">Roll Number</span><span className="value">{student.rollNumber}</span></div>
            <div className="summary-row"><span className="label">Department</span><span className="value">{student.department}</span></div>
            <div className="summary-row"><span className="label">Semester</span><span className="value">Semester {student.semester}</span></div>
            <div className="summary-row"><span className="label">Email</span><span className="value">{student.email}</span></div>
          </div>
        )}

        {profileMode === 'edit' && (
          <EditProfileForm
            student={student}
            onSubmit={handleProfileSave}
            onCancel={() => setProfileMode('view')}
          />
        )}

        {profileMode === 'password' && (
          <ChangePasswordForm
            onSubmit={handlePasswordSave}
            onCancel={() => setProfileMode('view')}
          />
        )}
      </section>

      {/* ── Stats cards ── */}
      <section className="section">
        <h2>Overview</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-icon">📚</span>
            <div>
              <p className="stat-value">{courses.length}</p>
              <p className="stat-label">Courses Registered</p>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">⚡</span>
            <div>
              <p className="stat-value">{creditsUsed}</p>
              <p className="stat-label">Credits Used</p>
            </div>
          </div>
          <div className={`stat-card ${creditsLeft <= 0 ? 'stat-card-danger' : creditsLeft <= 6 ? 'stat-card-warn' : 'stat-card-safe'}`}>
            <span className="stat-icon">{creditsLeft <= 0 ? '🚫' : '✅'}</span>
            <div>
              <p className="stat-value">{Math.max(creditsLeft, 0)}</p>
              <p className="stat-label">Credits Remaining</p>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">🎓</span>
            <div>
              <p className="stat-value">Sem {student.semester}</p>
              <p className="stat-label">{student.department}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Course registration section ── */}
      <section className="section">
        <div className="section-title-row">
          <h2>{editingCourseId ? 'Edit Course' : 'Register a Course'}</h2>
        </div>

        <CreditMeter used={totalCredits} limit={CREDIT_LIMIT} />

        {creditsRemaining <= 0 && !editingCourseId ? (
          <p className="credit-limit-msg">
            🚫 You have reached the <strong>{CREDIT_LIMIT}-credit</strong> limit. Delete a course to register a new one.
          </p>
        ) : (
          <>
            <p className="section-desc" style={{ marginTop: '1rem' }}>
              {editingCourseId ? 'Update the course details below.' : 'Add a new course to your semester.'}
            </p>
            <CourseForm
              course={course}
              error={courseError}
              isEditing={Boolean(editingCourseId)}
              setCourse={setCourse}
              onCancel={handleCancelCourse}
              onSubmit={handleCourseSubmit}
            />
          </>
        )}
      </section>

      {/* ── Course list section ── */}
      <section className="section">
        <h2>My Courses</h2>
        <p className="section-desc">All courses registered for this semester.</p>
        <CourseList
          courses={courses}
          onDelete={handleDeleteCourse}
          onEdit={handleEditCourse}
          studentName={student.name}
        />
      </section>
    </>
  )
}

export default StudentDashboard

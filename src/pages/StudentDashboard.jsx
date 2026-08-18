import { useState, useEffect } from 'react'
import { loadSession } from '../utils/localStorage'
import {
  getStudentById, getCourses, createCourse, deleteCourse,
  updateStudent, changePassword, getCatalog, getSettings, getEnrollmentCounts,
} from '../utils/api'
import CourseList from '../components/CourseList'
import { useToast } from '../components/Toast'

const DEPARTMENTS = ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil']
const SEMESTERS = ['1', '2', '3', '4', '5', '6', '7', '8']

// ── Edit Profile Form ─────────────────────────────────────
function EditProfileForm({ student, onSubmit, onCancel }) {
  const [form, setForm] = useState({ name: student.name, email: student.email })
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
    return next
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const nextErrors = validate()
    if (Object.values(nextErrors).some(Boolean)) { setErrors(nextErrors); return }
    setLoading(true)
    await onSubmit({ name: form.name.trim(), email: form.email.trim() })
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

// ── Catalog Course Row ────────────────────────────────────
function CatalogCourseRow({ course, enrolled, onEnroll, disabled, seatsLeft, regClosed }) {
  const typeLabel = {
    core: 'Core', aptitude: 'Aptitude', project: 'Project',
    elective_a: 'Elective A', elective_b: 'Elective B',
  }
  const isElective = course.type === 'elective_a' || course.type === 'elective_b'
  const isFull = isElective && seatsLeft != null && seatsLeft <= 0
  const isDisabled = enrolled || disabled || isFull || regClosed

  let btnLabel = 'Enroll'
  if (enrolled)   btnLabel = '\u2705 Enrolled'
  else if (regClosed) btnLabel = 'Closed'
  else if (isFull)    btnLabel = 'Full'
  else if (disabled)  btnLabel = 'Unavailable'

  let btnTitle = ''
  if (regClosed)   btnTitle = 'Registration is currently closed.'
  else if (isFull) btnTitle = 'No seats remaining for this elective.'
  else if (disabled) btnTitle = 'You already enrolled in one elective from this pool.'

  return (
    <div className={`catalog-row${enrolled ? ' catalog-row-enrolled' : ''}${isDisabled && !enrolled ? ' catalog-row-disabled' : ''}`}>
      <div className="catalog-row-info">
        <span className="course-code-badge">{course.courseCode}</span>
        <div className="catalog-row-text">
          <p className="catalog-course-name">{course.courseName}</p>
          <p className="catalog-course-meta">
            {course.facultyName} &middot; {course.credits} credit{course.credits !== 1 ? 's' : ''}
            {' \u00b7 '}<span className="catalog-type-tag">{typeLabel[course.type] || course.type}</span>
            {isElective && !enrolled && seatsLeft != null && (
              <span className={`seats-badge ${isFull ? 'seats-full' : seatsLeft <= 10 ? 'seats-low' : 'seats-ok'}`}>
                {isFull ? 'No seats left' : `${seatsLeft} seat${seatsLeft !== 1 ? 's' : ''} left`}
              </span>
            )}
          </p>
        </div>
      </div>
      <button
        type="button"
        className={`btn ${enrolled ? 'btn-enrolled' : isDisabled ? 'btn-enroll btn-enroll-disabled' : 'btn-enroll'}`}
        onClick={() => !isDisabled && onEnroll(course)}
        disabled={isDisabled}
        title={btnTitle}
      >
        {btnLabel}
      </button>
    </div>
  )
}

// ── Student Dashboard ─────────────────────────────────────
function StudentDashboard() {
  const session = loadSession()
  const toast = useToast()

  const [student, setStudent] = useState(null)
  const [enrollments, setEnrollments] = useState([])
  const [profileMode, setProfileMode] = useState('view')
  const [settings, setSettings] = useState(null)

  // Term selection
  const [department, setDepartment] = useState('')
  const [semester, setSemester] = useState('')
  const [catalogCourses, setCatalogCourses] = useState([])
  const [termLoaded, setTermLoaded] = useState(false)
  const [seatCounts, setSeatCounts] = useState({}) // { catalogId: seatsLeft }

  useEffect(() => {
    getStudentById(session.studentId)
      .then((s) => {
        setStudent(s)
        if (s.department) setDepartment(s.department)
        if (s.semester) setSemester(s.semester)
        return getCourses(s.id)
      })
      .then(setEnrollments)
      .catch((err) => toast(err.message, 'error'))
    // Load system settings
    getSettings().then(setSettings)
  }, [session.studentId])

  // Auto-load catalog if student already has a saved term
  useEffect(() => {
    if (department && semester && student && !termLoaded) {
      getCatalog(department, semester).then((courses) => {
        setCatalogCourses(courses)
        setTermLoaded(true)
      })
    }
  }, [department, semester, student])

  // Refresh seat counts whenever catalog or enrollments change
  useEffect(() => {
    if (!department || !semester || catalogCourses.length === 0) return
    getEnrollmentCounts(department, semester).then((counts) => {
      const seats = {}
      catalogCourses.forEach((c) => {
        if (c.capacity != null) seats[c.id] = c.capacity - (counts[c.id] || 0)
      })
      setSeatCounts(seats)
    })
  }, [catalogCourses, enrollments])

  const handleLoadTerm = async () => {
    if (!department || !semester) return
    // Save term to student profile
    try {
      const updated = await updateStudent(session.studentId, { department, semester })
      setStudent(updated)
    } catch { /* non-critical */ }
    const courses = await getCatalog(department, semester)
    setCatalogCourses(courses)
    setTermLoaded(true)
  }

  // ── Enrollment helpers ──
  const isEnrolled = (catalogId) => enrollments.some((e) => e.catalogId === catalogId)
  const enrolledElectiveA = enrollments.find((e) => e.type === 'elective_a')
  const enrolledElectiveB = enrollments.find((e) => e.type === 'elective_b')
  const regClosed = settings ? !settings.registrationOpen : false

  const handleEnroll = async (catalogCourse) => {
    if (isEnrolled(catalogCourse.id)) return
    try {
      const saved = await createCourse({
        courseCode: catalogCourse.courseCode,
        courseName: catalogCourse.courseName,
        facultyName: catalogCourse.facultyName,
        credits: catalogCourse.credits,
        studentId: session.studentId,
        catalogId: catalogCourse.id,
        type: catalogCourse.type,
      })
      setEnrollments((prev) => [...prev, saved])
      toast(`Enrolled in "${catalogCourse.courseName}"!`)
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  const handleUnenroll = async (courseId) => {
    if (!window.confirm('Unenroll from this course?')) return
    try {
      await deleteCourse(courseId)
      setEnrollments((prev) => prev.filter((e) => e.id !== courseId))
      toast('Unenrolled successfully.')
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  // ── Catalog sections ──
  const mandatory = catalogCourses.filter((c) => ['core', 'aptitude', 'project'].includes(c.type))
  const electivesA = catalogCourses.filter((c) => c.type === 'elective_a')
  const electivesB = catalogCourses.filter((c) => c.type === 'elective_b')

  const totalCredits = enrollments.reduce((sum, e) => sum + Number(e.credits), 0)

  if (!student) return <div className="section empty-state"><p>Loading…</p></div>

  return (
    <>
      {/* ── Student Identity Card ── */}
      <section className="section student-id-card">
        <div className="sid-left">
          <div className="sid-avatar">{student.name?.charAt(0).toUpperCase()}</div>
          <div className="sid-info">
            <p className="sid-label">Student</p>
            <h2 className="sid-name">{student.name}</h2>
            <div className="sid-chips">
              <span className="sid-chip sid-chip-prn">{student.prn}</span>
              {student.department && <span className="sid-chip">{student.department}</span>}
              {student.semester && <span className="sid-chip">Sem {student.semester}</span>}
              <span className="sid-chip">AY 2024–25</span>
            </div>
          </div>
        </div>

        <div className="sid-right">
          <div className="sid-stats">
            <div className="sid-stat">
              <span className="sid-stat-val">{enrollments.length}</span>
              <span className="sid-stat-lbl">Courses</span>
            </div>
            <div className="sid-stat-sep" />
            <div className="sid-stat">
              <span className="sid-stat-val">{totalCredits}</span>
              <span className="sid-stat-lbl">Credits</span>
            </div>
            <div className="sid-stat-sep" />
            <div className="sid-stat">
              <span className="sid-stat-val">{student.email?.split('@')[0] ?? '—'}</span>
              <span className="sid-stat-lbl">Username</span>
            </div>
          </div>

          <div className="sid-actions">
            <button type="button"
              className={`btn ${profileMode === 'edit' ? 'btn-secondary' : 'btn-edit'}`}
              onClick={() => setProfileMode(profileMode === 'edit' ? 'view' : 'edit')}>
              {profileMode === 'edit' ? '× Cancel' : '✏ Edit Profile'}
            </button>
            <button type="button"
              className={`btn ${profileMode === 'password' ? 'btn-secondary' : 'btn-edit'}`}
              onClick={() => setProfileMode(profileMode === 'password' ? 'view' : 'password')}>
              {profileMode === 'password' ? '× Cancel' : '🔑 Password'}
            </button>
          </div>
        </div>

        {profileMode === 'edit' && (
          <div className="sid-form-panel">
            <EditProfileForm
              student={student}
              onSubmit={async (data) => {
                try {
                  const updated = await updateStudent(session.studentId, data)
                  setStudent(updated)
                  setProfileMode('view')
                  toast('Profile updated successfully.')
                } catch (err) {
                  toast(err.message, 'error')
                }
              }}
              onCancel={() => setProfileMode('view')}
            />
          </div>
        )}

        {profileMode === 'password' && (
          <div className="sid-form-panel">
            <ChangePasswordForm
              onSubmit={async (currentPassword, newPassword) => {
                await changePassword(session.studentId, currentPassword, newPassword)
                setProfileMode('view')
                toast('Password changed successfully.')
              }}
              onCancel={() => setProfileMode('view')}
            />
          </div>
        )}
      </section>

      {/* ── Stats cards ── */}
      <section className="section">
        <h2>Overview</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-icon">📚</span>
            <div>
              <p className="stat-value">{enrollments.length}</p>
              <p className="stat-label">Enrolled Courses</p>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">⚡</span>
            <div>
              <p className="stat-value">{totalCredits}</p>
              <p className="stat-label">Total Credits</p>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">🎓</span>
            <div>
              <p className="stat-value">{student.semester ? `Sem ${student.semester}` : '\u2014'}</p>
              <p className="stat-label">{student.department || 'No branch set'}</p>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">🪩</span>
            <div>
              <p className="stat-value" style={{ fontSize: '1.1rem' }}>{student.prn}</p>
              <p className="stat-label">Your PRN</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Course Enrollment section ── */}
      <section className="section">
        <h2>Course Enrollment</h2>
        <p className="section-desc">Select your branch and semester to view available courses and enroll.</p>

        {/* Registration closed banner */}
        {regClosed && (
          <div className="reg-closed-banner" role="alert">
            <span className="reg-closed-icon">🔒</span>
            <div>
              <p className="reg-closed-title">Registration is currently closed</p>
              <p className="reg-closed-sub">
                The admin has closed course registration.
                {settings?.registrationStart && settings?.registrationEnd
                  ? ` Next window: ${settings.registrationStart} – ${settings.registrationEnd}.`
                  : ' Please check back later or contact your admin.'}
              </p>
            </div>
          </div>
        )}

        <div className="term-selector">
          <div className="term-select-group">
            <label htmlFor="select-dept">Branch</label>
            <select
              id="select-dept"
              value={department}
              onChange={(e) => { setDepartment(e.target.value); setTermLoaded(false) }}
            >
              <option value="">Select branch</option>
              {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="term-select-group">
            <label htmlFor="select-sem">Semester</label>
            <select
              id="select-sem"
              value={semester}
              onChange={(e) => { setSemester(e.target.value); setTermLoaded(false) }}
            >
              <option value="">Select semester</option>
              {SEMESTERS.map((s) => <option key={s} value={s}>Semester {s}</option>)}
            </select>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            disabled={!department || !semester}
            onClick={async () => {
              if (!department || !semester) return
              try {
                const updated = await updateStudent(session.studentId, { department, semester })
                setStudent(updated)
              } catch { /* non-critical */ }
              const courses = await getCatalog(department, semester)
              setCatalogCourses(courses)
              setTermLoaded(true)
            }}
          >
            Load Courses
          </button>
        </div>

        {termLoaded && catalogCourses.length > 0 && (
          <div className="catalog-panel">
            {/* Mandatory */}
            <div className="catalog-section">
              <div className="catalog-section-header">
                <h3>📌 Mandatory Courses</h3>
                <span className="catalog-section-badge">{mandatory.length} courses</span>
              </div>
              <p className="section-desc">You must enroll in all of the following courses.</p>
              {mandatory.map((course) => (
                <CatalogCourseRow
                  key={course.id}
                  course={course}
                  enrolled={isEnrolled(course.id)}
                  onEnroll={handleEnroll}
                  disabled={false}
                  regClosed={regClosed}
                />
              ))}
            </div>

            {/* Elective A */}
            <div className="catalog-section">
              <div className="catalog-section-header">
                <h3>🌐 Elective A — Trending Topics</h3>
                <span className={`catalog-section-badge ${enrolledElectiveA ? 'badge-done' : ''}`}>
                  {enrolledElectiveA ? '\u2713 Done' : 'Choose 1 of 5'}
                </span>
              </div>
              <p className="section-desc">Select <strong>one</strong> course from the list below.</p>
              {electivesA.map((course) => (
                <CatalogCourseRow
                  key={course.id}
                  course={course}
                  enrolled={isEnrolled(course.id)}
                  onEnroll={handleEnroll}
                  disabled={Boolean(enrolledElectiveA) && !isEnrolled(course.id)}
                  seatsLeft={seatCounts[course.id]}
                  regClosed={regClosed}
                />
              ))}
            </div>

            {/* Elective B */}
            <div className="catalog-section">
              <div className="catalog-section-header">
                <h3>🎨 Elective B — Open / Extra-Curricular</h3>
                <span className={`catalog-section-badge ${enrolledElectiveB ? 'badge-done' : ''}`}>
                  {enrolledElectiveB ? '\u2713 Done' : 'Choose 1 of 5'}
                </span>
              </div>
              <p className="section-desc">Select <strong>one</strong> course from the list below.</p>
              {electivesB.map((course) => (
                <CatalogCourseRow
                  key={course.id}
                  course={course}
                  enrolled={isEnrolled(course.id)}
                  onEnroll={handleEnroll}
                  disabled={Boolean(enrolledElectiveB) && !isEnrolled(course.id)}
                  seatsLeft={seatCounts[course.id]}
                  regClosed={regClosed}
                />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ── Enrolled courses ── */}
      <section className="section">
        <h2>My Enrolled Courses</h2>
        <p className="section-desc">All courses you are currently enrolled in this semester.</p>
        <CourseList
          courses={enrollments}
          onDelete={handleUnenroll}
          studentName={student.name}
          showYear
        />
      </section>
    </>
  )
}

export default StudentDashboard

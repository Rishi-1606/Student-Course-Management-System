import { useState, useEffect } from 'react'
import {
  getStudents, getAllCourses, deleteCourse, deleteStudent,
  getCatalog, addCatalogCourse, updateCatalogCourse, deleteCatalogCourse,
  getSettings, updateSettings,
} from '../utils/api'
import { useToast } from '../components/Toast'

const DEPARTMENTS = ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil']
const SEMESTERS   = ['1', '2', '3', '4', '5', '6', '7', '8']
const TYPES       = ['core', 'aptitude', 'project', 'elective_a', 'elective_b']
const TYPE_LABEL  = { core: 'Core', aptitude: 'Aptitude', project: 'Project', elective_a: 'Elective A', elective_b: 'Elective B' }
const TYPE_COLOR  = { core: 'tag-core', aptitude: 'tag-aptitude', project: 'tag-project', elective_a: 'tag-elective-a', elective_b: 'tag-elective-b' }

const EMPTY_CATALOG_FORM = {
  courseCode: '', courseName: '', facultyName: '', credits: 3,
  type: 'core', capacity: 60, department: 'Computer Science', semester: '1',
}

// ── Inline catalog add/edit form ─────────────────────────
function CatalogForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial)
  const [loading, setLoading] = useState(false)
  const isElective = form.type === 'elective_a' || form.type === 'elective_b'

  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.courseCode.trim() || !form.courseName.trim()) return
    setLoading(true)
    await onSave({ ...form, credits: Number(form.credits), capacity: Number(form.capacity) })
    setLoading(false)
  }

  return (
    <form className="catalog-edit-form" onSubmit={handleSubmit}>
      <h3>{initial.id ? 'Edit Course' : 'Add New Catalog Course'}</h3>
      <div className="form-grid">
        <div className="form-group">
          <label>Department</label>
          <select value={form.department} onChange={(e) => set('department', e.target.value)}>
            {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Semester</label>
          <select value={form.semester} onChange={(e) => set('semester', e.target.value)}>
            {SEMESTERS.map((s) => <option key={s} value={s}>Semester {s}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Type</label>
          <select value={form.type} onChange={(e) => set('type', e.target.value)}>
            {TYPES.map((t) => <option key={t} value={t}>{TYPE_LABEL[t]}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Course Code</label>
          <input value={form.courseCode} onChange={(e) => set('courseCode', e.target.value)}
            placeholder="e.g. CS301" required />
        </div>
        <div className="form-group form-group-full">
          <label>Course Name</label>
          <input value={form.courseName} onChange={(e) => set('courseName', e.target.value)}
            placeholder="e.g. Operating Systems" required />
        </div>
        <div className="form-group">
          <label>Faculty Name</label>
          <input value={form.facultyName} onChange={(e) => set('facultyName', e.target.value)}
            placeholder="e.g. Dr. Sharma" />
        </div>
        <div className="form-group">
          <label>Credits</label>
          <input type="number" min={1} max={6} value={form.credits}
            onChange={(e) => set('credits', e.target.value)} />
        </div>
        {isElective && (
          <div className="form-group">
            <label>Seat Capacity</label>
            <input type="number" min={1} max={300} value={form.capacity}
              onChange={(e) => set('capacity', e.target.value)} />
          </div>
        )}
      </div>
      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving…' : initial.id ? 'Update Course' : 'Add Course'}
        </button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  )
}

// ── Main AdminDashboard ───────────────────────────────────
function AdminDashboard() {
  const toast = useToast()
  const [activeTab, setActiveTab] = useState('students')

  // Students tab
  const [students, setStudents]     = useState([])
  const [allCourses, setAllCourses] = useState([])
  const [expandedId, setExpandedId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Catalog tab
  const [catalogDept, setCatalogDept]       = useState('Computer Science')
  const [catalogSem, setCatalogSem]         = useState('1')
  const [catalogCourses, setCatalogCourses] = useState([])
  const [catalogLoading, setCatalogLoading] = useState(false)
  const [editingCourse, setEditingCourse]   = useState(null) // { ...course } or null
  const [showAddForm, setShowAddForm]       = useState(false)

  // Settings tab
  const [settingsForm, setSettingsForm]     = useState(null)
  const [settingsSaving, setSettingsSaving] = useState(false)

  // Load students + all enrollments once
  useEffect(() => {
    Promise.all([getStudents(), getAllCourses()])
      .then(([s, c]) => { setStudents(s); setAllCourses(c) })
      .catch((err) => toast(err.message, 'error'))
  }, [])

  // Load catalog when tab/filters change
  useEffect(() => {
    if (activeTab !== 'catalog') return
    setCatalogLoading(true)
    getCatalog(catalogDept, catalogSem)
      .then((c) => { setCatalogCourses(c); setCatalogLoading(false) })
      .catch(() => setCatalogLoading(false))
  }, [activeTab, catalogDept, catalogSem])

  // Load settings when settings tab opens
  useEffect(() => {
    if (activeTab !== 'settings') return
    getSettings().then((s) => setSettingsForm({ ...s }))
  }, [activeTab])

  // ── Student handlers ──
  const coursesFor = (studentId) => allCourses.filter((c) => c.studentId === studentId)

  const handleDeleteEnrollment = async (courseId) => {
    if (!window.confirm('Remove this enrollment?')) return
    try {
      await deleteCourse(courseId)
      setAllCourses((prev) => prev.filter((c) => c.id !== courseId))
      toast('Enrollment removed.')
    } catch (err) { toast(err.message, 'error') }
  }

  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm('Delete this student and ALL their enrollments? This cannot be undone.')) return
    try {
      await deleteStudent(studentId)
      setStudents((prev) => prev.filter((s) => s.id !== studentId))
      setAllCourses((prev) => prev.filter((c) => c.studentId !== studentId))
      if (expandedId === studentId) setExpandedId(null)
      toast('Student deleted.')
    } catch (err) { toast(err.message, 'error') }
  }

  const handleResetPassword = async (student) => {
    const newPwd = window.prompt(`Set a new password for ${student.name} (${student.prn}):`)
    if (!newPwd || newPwd.trim().length < 6) {
      toast('Password must be at least 6 characters.', 'error'); return
    }
    try {
      const { updateStudent } = await import('../utils/api')
      await updateStudent(student.id, { password: newPwd.trim() })
      toast(`Password for ${student.prn} has been reset.`)
    } catch (err) { toast(err.message, 'error') }
  }

  // ── Catalog handlers ──
  const reloadCatalog = () => {
    setCatalogLoading(true)
    getCatalog(catalogDept, catalogSem)
      .then((c) => { setCatalogCourses(c); setCatalogLoading(false) })
      .catch(() => setCatalogLoading(false))
  }

  const handleAddCourse = async (formData) => {
    try {
      await addCatalogCourse(formData)
      toast('Course added to catalog.')
      setShowAddForm(false)
      reloadCatalog()
    } catch (err) { toast(err.message, 'error') }
  }

  const handleUpdateCourse = async (formData) => {
    try {
      await updateCatalogCourse(editingCourse.id, formData)
      toast('Catalog course updated.')
      setEditingCourse(null)
      reloadCatalog()
    } catch (err) { toast(err.message, 'error') }
  }

  const handleDeleteCatalogEntry = async (courseId) => {
    if (!window.confirm('Delete this course from the catalog? This cannot be undone.')) return
    try {
      await deleteCatalogCourse(courseId)
      toast('Course removed from catalog.')
      reloadCatalog()
    } catch (err) { toast(err.message, 'error') }
  }

  // ── Settings handler ──
  const handleSaveSettings = async () => {
    setSettingsSaving(true)
    try {
      await updateSettings(settingsForm)
      toast('Settings saved successfully.')
    } catch (err) { toast(err.message, 'error') }
    setSettingsSaving(false)
  }

  // ── Filtered students ──
  const normalized = searchQuery.trim().toLowerCase()
  const filteredStudents = students.filter(
    (s) =>
      s.name?.toLowerCase().includes(normalized) ||
      s.prn?.toLowerCase().includes(normalized) ||
      s.email?.toLowerCase().includes(normalized) ||
      s.department?.toLowerCase().includes(normalized)
  )

  // Catalog grouped
  const mandatory  = catalogCourses.filter((c) => ['core', 'aptitude', 'project'].includes(c.type))
  const electivesA = catalogCourses.filter((c) => c.type === 'elective_a')
  const electivesB = catalogCourses.filter((c) => c.type === 'elective_b')

  const CourseRow = ({ course }) => (
    <tr>
      <td><span className="course-code-badge">{course.courseCode}</span></td>
      <td>{course.courseName}</td>
      <td><span className={`catalog-type-tag ${TYPE_COLOR[course.type] || ''}`}>{TYPE_LABEL[course.type]}</span></td>
      <td>{course.facultyName}</td>
      <td><strong>{course.credits}</strong></td>
      {course.capacity != null ? <td>{course.capacity} seats</td> : <td>—</td>}
      <td>
        <div className="course-actions">
          <button type="button" className="btn btn-edit" style={{ fontSize: '0.78rem' }}
            onClick={() => { setShowAddForm(false); setEditingCourse(course) }}>
            ✏ Edit
          </button>
          <button type="button" className="btn btn-delete" style={{ fontSize: '0.78rem' }}
            onClick={() => handleDeleteCatalogEntry(course.id)}>
            Delete
          </button>
        </div>
      </td>
    </tr>
  )

  return (
    <>
      {/* ── Tab nav ── */}
      <section className="section" style={{ paddingBottom: 0 }}>
        <div className="admin-tabs">
          <button type="button" className={`admin-tab ${activeTab === 'students' ? 'admin-tab-active' : ''}`}
            onClick={() => setActiveTab('students')}>
            👥 Students <span className="admin-tab-badge">{students.length}</span>
          </button>
          <button type="button" className={`admin-tab ${activeTab === 'catalog' ? 'admin-tab-active' : ''}`}
            onClick={() => setActiveTab('catalog')}>
            📚 Master Catalog
          </button>
          <button type="button" className={`admin-tab ${activeTab === 'settings' ? 'admin-tab-active' : ''}`}
            onClick={() => setActiveTab('settings')}>
            ⚙️ Settings
          </button>
        </div>
      </section>

      {/* ── Students tab ── */}
      {activeTab === 'students' && (
        <section className="section">
          <h2>All Students</h2>
          <p className="section-desc">{students.length} student{students.length !== 1 ? 's' : ''} registered.</p>
          <div className="search-field">
            <label htmlFor="adminSearch">Search students</label>
            <input id="adminSearch" type="search" value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, PRN, email or branch…" />
          </div>
          {filteredStudents.length === 0 ? (
            <div className="empty-state">
              <p>{normalized ? 'No students match your search.' : 'No students registered yet.'}</p>
            </div>
          ) : (
            <div className="admin-student-list">
              {filteredStudents.map((student) => {
                const isExpanded = expandedId === student.id
                const courses = coursesFor(student.id)
                return (
                  <div key={student.id} className="admin-student-card">
                    <div className="admin-student-header">
                      <div className="admin-student-info">
                        <div className="admin-student-avatar">{student.name?.charAt(0).toUpperCase() || '?'}</div>
                        <div>
                          <p className="admin-student-name">{student.name}</p>
                          <p className="admin-student-meta">
                            <span className="prn-inline" style={{ fontSize: '0.78rem', padding: '0.1rem 0.45rem' }}>{student.prn}</span>
                            {student.department && ` · ${student.department}`}
                            {student.semester && ` · Sem ${student.semester}`}
                          </p>
                          <p className="admin-student-email">{student.email}</p>
                        </div>
                      </div>
                      <div className="admin-student-actions">
                        <span className="course-badge">{courses.length} enrolled</span>
                        <button type="button" className="btn btn-edit"
                          onClick={() => setExpandedId(isExpanded ? null : student.id)}>
                          {isExpanded ? 'Hide ▲' : 'View Enrollments ▼'}
                        </button>
                        <button type="button" className="btn btn-edit"
                          style={{ background: '#fef3c7', color: '#92400e', borderColor: '#fde68a' }}
                          onClick={() => handleResetPassword(student)}>
                          🔑 Reset Pwd
                        </button>
                        <button type="button" className="btn btn-delete"
                          onClick={() => handleDeleteStudent(student.id)}>
                          Delete
                        </button>
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="admin-courses">
                        {courses.length === 0 ? (
                          <p className="admin-no-courses">No courses enrolled yet.</p>
                        ) : (
                          <div className="table-wrapper">
                            <table className="course-table">
                              <thead>
                                <tr><th>#</th><th>Code</th><th>Course Name</th><th>Type</th><th>Year</th><th>Credits</th><th>Actions</th></tr>
                              </thead>
                              <tbody>
                                {courses.map((course, idx) => (
                                  <tr key={course.id}>
                                    <td>{idx + 1}</td>
                                    <td><span className="course-code-badge">{course.courseCode}</span></td>
                                    <td>{course.courseName}</td>
                                    <td><span className={`catalog-type-tag ${TYPE_COLOR[course.type] || ''}`}>{TYPE_LABEL[course.type] || '—'}</span></td>
                                    <td>{course.academicYear || '—'}</td>
                                    <td><strong>{course.credits}</strong></td>
                                    <td>
                                      <button type="button" className="btn btn-delete"
                                        style={{ fontSize: '0.78rem', padding: '0.3rem 0.7rem' }}
                                        onClick={() => handleDeleteEnrollment(course.id)}>
                                        Remove
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </section>
      )}

      {/* ── Catalog tab ── */}
      {activeTab === 'catalog' && (
        <section className="section">
          <h2>Master Course Catalog</h2>
          <p className="section-desc">Browse, add, edit or delete courses in the curriculum.</p>

          {/* Filter row + Add button */}
          <div className="term-selector" style={{ marginBottom: '1rem' }}>
            <div className="term-select-group">
              <label htmlFor="cat-dept">Branch</label>
              <select id="cat-dept" value={catalogDept}
                onChange={(e) => { setCatalogDept(e.target.value); setEditingCourse(null); setShowAddForm(false) }}>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="term-select-group">
              <label htmlFor="cat-sem">Semester</label>
              <select id="cat-sem" value={catalogSem}
                onChange={(e) => { setCatalogSem(e.target.value); setEditingCourse(null); setShowAddForm(false) }}>
                {SEMESTERS.map((s) => <option key={s} value={s}>Semester {s}</option>)}
              </select>
            </div>
            <button type="button" className="btn btn-primary"
              style={{ marginTop: 'auto' }}
              onClick={() => { setEditingCourse(null); setShowAddForm((v) => !v) }}>
              {showAddForm ? '✕ Cancel' : '+ Add Course'}
            </button>
          </div>

          {/* Add form */}
          {showAddForm && (
            <CatalogForm
              initial={{ ...EMPTY_CATALOG_FORM, department: catalogDept, semester: catalogSem }}
              onSave={handleAddCourse}
              onCancel={() => setShowAddForm(false)}
            />
          )}

          {/* Edit form */}
          {editingCourse && (
            <CatalogForm
              initial={editingCourse}
              onSave={handleUpdateCourse}
              onCancel={() => setEditingCourse(null)}
            />
          )}

          {catalogLoading ? (
            <p className="section-desc">Loading…</p>
          ) : (
            <div className="catalog-panel">
              {/* Mandatory */}
              <div className="catalog-section">
                <div className="catalog-section-header">
                  <h3>📌 Mandatory Courses</h3>
                  <span className="catalog-section-badge">{mandatory.length} courses</span>
                </div>
                <div className="table-wrapper">
                  <table className="course-table">
                    <thead><tr><th>Code</th><th>Name</th><th>Type</th><th>Faculty</th><th>Credits</th><th>Capacity</th><th>Actions</th></tr></thead>
                    <tbody>{mandatory.map((c) => <CourseRow key={c.id} course={c} />)}</tbody>
                  </table>
                </div>
              </div>

              {/* Elective A */}
              <div className="catalog-section">
                <div className="catalog-section-header">
                  <h3>🌐 Elective A — Trending Topics</h3>
                  <span className="catalog-section-badge">Pick 1 of {electivesA.length}</span>
                </div>
                <div className="table-wrapper">
                  <table className="course-table">
                    <thead><tr><th>Code</th><th>Name</th><th>Type</th><th>Faculty</th><th>Credits</th><th>Capacity</th><th>Actions</th></tr></thead>
                    <tbody>{electivesA.map((c) => <CourseRow key={c.id} course={c} />)}</tbody>
                  </table>
                </div>
              </div>

              {/* Elective B */}
              <div className="catalog-section">
                <div className="catalog-section-header">
                  <h3>🎨 Elective B — Open / Extra-Curricular</h3>
                  <span className="catalog-section-badge">Pick 1 of {electivesB.length}</span>
                </div>
                <div className="table-wrapper">
                  <table className="course-table">
                    <thead><tr><th>Code</th><th>Name</th><th>Type</th><th>Faculty</th><th>Credits</th><th>Capacity</th><th>Actions</th></tr></thead>
                    <tbody>{electivesB.map((c) => <CourseRow key={c.id} course={c} />)}</tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ── Settings tab ── */}
      {activeTab === 'settings' && (
        <section className="section">
          <h2>System Settings</h2>
          <p className="section-desc">Control the academic year and course registration window.</p>

          {!settingsForm ? (
            <p className="section-desc">Loading settings…</p>
          ) : (
            <div className="settings-panel">
              {/* Academic Year */}
              <div className="settings-card">
                <div className="settings-card-header">
                  <h3>🎓 Academic Year</h3>
                  <p>Set the current academic year. This is stamped on every new enrollment.</p>
                </div>
                <div className="form-group" style={{ maxWidth: '220px' }}>
                  <label htmlFor="acad-year">Academic Year</label>
                  <input id="acad-year" type="text" value={settingsForm.academicYear}
                    onChange={(e) => setSettingsForm((p) => ({ ...p, academicYear: e.target.value }))}
                    placeholder="e.g. 2024-25" />
                </div>
              </div>

              {/* Registration Window */}
              <div className="settings-card">
                <div className="settings-card-header">
                  <h3>📅 Registration Window</h3>
                  <p>When closed, students cannot enroll in any courses. Optionally set start and end dates.</p>
                </div>
                <div className="settings-toggle-row">
                  <span className="settings-label">Registration Status</span>
                  <button
                    type="button"
                    className={`toggle-btn ${settingsForm.registrationOpen ? 'toggle-open' : 'toggle-closed'}`}
                    onClick={() => setSettingsForm((p) => ({ ...p, registrationOpen: !p.registrationOpen }))}
                  >
                    {settingsForm.registrationOpen ? '✅ Open' : '🔒 Closed'}
                  </button>
                </div>
                <div className="form-grid" style={{ marginTop: '1rem' }}>
                  <div className="form-group">
                    <label htmlFor="reg-start">Start Date</label>
                    <input id="reg-start" type="date"
                      value={settingsForm.registrationStart || ''}
                      onChange={(e) => setSettingsForm((p) => ({ ...p, registrationStart: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="reg-end">End Date</label>
                    <input id="reg-end" type="date"
                      value={settingsForm.registrationEnd || ''}
                      onChange={(e) => setSettingsForm((p) => ({ ...p, registrationEnd: e.target.value }))} />
                  </div>
                </div>
              </div>

              <button type="button" className="btn btn-primary"
                disabled={settingsSaving} onClick={handleSaveSettings}>
                {settingsSaving ? 'Saving…' : '💾 Save Settings'}
              </button>
            </div>
          )}
        </section>
      )}
    </>
  )
}

export default AdminDashboard

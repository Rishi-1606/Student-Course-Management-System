import { useState, useEffect } from 'react'
import { getStudents, getAllCourses, deleteCourse, deleteStudent, getCatalog } from '../utils/api'
import { useToast } from '../components/Toast'

const DEPARTMENTS = ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil']
const SEMESTERS = ['1', '2', '3', '4', '5', '6', '7', '8']
const TYPE_LABEL = { core: 'Core', aptitude: 'Aptitude', project: 'Project', elective_a: 'Elective A', elective_b: 'Elective B' }
const TYPE_COLOR = { core: 'tag-core', aptitude: 'tag-aptitude', project: 'tag-project', elective_a: 'tag-elective-a', elective_b: 'tag-elective-b' }

function AdminDashboard() {
  const toast = useToast()
  const [activeTab, setActiveTab] = useState('students') // 'students' | 'catalog'

  // ── Students tab state ──
  const [students, setStudents] = useState([])
  const [allCourses, setAllCourses] = useState([])
  const [expandedId, setExpandedId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  // ── Catalog tab state ──
  const [catalogDept, setCatalogDept] = useState('Computer Science')
  const [catalogSem, setCatalogSem] = useState('1')
  const [catalogCourses, setCatalogCourses] = useState([])
  const [catalogLoading, setCatalogLoading] = useState(false)

  useEffect(() => {
    Promise.all([getStudents(), getAllCourses()])
      .then(([s, c]) => { setStudents(s); setAllCourses(c) })
      .catch((err) => toast(err.message, 'error'))
  }, [])

  // Auto-load catalog when tab is switched or filters change
  useEffect(() => {
    if (activeTab !== 'catalog') return
    setCatalogLoading(true)
    getCatalog(catalogDept, catalogSem)
      .then((c) => { setCatalogCourses(c); setCatalogLoading(false) })
      .catch(() => setCatalogLoading(false))
  }, [activeTab, catalogDept, catalogSem])

  const coursesFor = (studentId) => allCourses.filter((c) => c.studentId === studentId)

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Remove this enrollment?')) return
    try {
      await deleteCourse(courseId)
      setAllCourses((prev) => prev.filter((c) => c.id !== courseId))
      toast('Enrollment removed.')
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm('Delete this student and ALL their enrollments? This cannot be undone.')) return
    try {
      await deleteStudent(studentId)
      setStudents((prev) => prev.filter((s) => s.id !== studentId))
      setAllCourses((prev) => prev.filter((c) => c.studentId !== studentId))
      if (expandedId === studentId) setExpandedId(null)
      toast('Student deleted.')
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  const normalizedQuery = searchQuery.trim().toLowerCase()
  const filteredStudents = students.filter(
    (s) =>
      s.name?.toLowerCase().includes(normalizedQuery) ||
      s.prn?.toLowerCase().includes(normalizedQuery) ||
      s.email?.toLowerCase().includes(normalizedQuery) ||
      s.department?.toLowerCase().includes(normalizedQuery)
  )

  // Group catalog courses by type for display
  const mandatory = catalogCourses.filter((c) => ['core', 'aptitude', 'project'].includes(c.type))
  const electivesA = catalogCourses.filter((c) => c.type === 'elective_a')
  const electivesB = catalogCourses.filter((c) => c.type === 'elective_b')

  return (
    <>
      {/* ── Tab Navigation ── */}
      <section className="section" style={{ paddingBottom: 0 }}>
        <div className="admin-tabs">
          <button
            type="button"
            className={`admin-tab ${activeTab === 'students' ? 'admin-tab-active' : ''}`}
            onClick={() => setActiveTab('students')}
          >
            👥 Students
            <span className="admin-tab-badge">{students.length}</span>
          </button>
          <button
            type="button"
            className={`admin-tab ${activeTab === 'catalog' ? 'admin-tab-active' : ''}`}
            onClick={() => setActiveTab('catalog')}
          >
            📚 Master Catalog
          </button>
        </div>
      </section>

      {/* ── Students Tab ── */}
      {activeTab === 'students' && (
        <section className="section">
          <h2>All Students</h2>
          <p className="section-desc">
            {students.length} student{students.length !== 1 ? 's' : ''} registered in the system.
          </p>

          <div className="search-field">
            <label htmlFor="adminSearch">Search students</label>
            <input
              id="adminSearch"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, PRN, email or branch…"
            />
          </div>

          {filteredStudents.length === 0 ? (
            <div className="empty-state">
              <p>{normalizedQuery ? 'No students match your search.' : 'No students registered yet.'}</p>
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
                        <div className="admin-student-avatar">
                          {student.name?.charAt(0).toUpperCase() || '?'}
                        </div>
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
                        <button
                          type="button"
                          className="btn btn-edit"
                          onClick={() => setExpandedId(isExpanded ? null : student.id)}
                        >
                          {isExpanded ? 'Hide ▲' : 'View Enrollments ▼'}
                        </button>
                        <button
                          type="button"
                          className="btn btn-delete"
                          onClick={() => handleDeleteStudent(student.id)}
                        >
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
                                <tr>
                                  <th>#</th>
                                  <th>Code</th>
                                  <th>Course Name</th>
                                  <th>Type</th>
                                  <th>Faculty</th>
                                  <th>Credits</th>
                                  <th>Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {courses.map((course, idx) => (
                                  <tr key={course.id}>
                                    <td>{idx + 1}</td>
                                    <td><span className="course-code-badge">{course.courseCode}</span></td>
                                    <td>{course.courseName}</td>
                                    <td>
                                      <span className={`catalog-type-tag ${TYPE_COLOR[course.type] || ''}`}>
                                        {TYPE_LABEL[course.type] || course.type || '—'}
                                      </span>
                                    </td>
                                    <td>{course.facultyName}</td>
                                    <td><strong>{course.credits}</strong></td>
                                    <td>
                                      <button
                                        type="button"
                                        className="btn btn-delete"
                                        style={{ fontSize: '0.78rem', padding: '0.3rem 0.7rem' }}
                                        onClick={() => handleDeleteCourse(course.id)}
                                      >
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

      {/* ── Master Catalog Tab ── */}
      {activeTab === 'catalog' && (
        <section className="section">
          <h2>Master Course Catalog</h2>
          <p className="section-desc">Browse the auto-generated curriculum for any branch and semester.</p>

          <div className="term-selector" style={{ marginBottom: '1.5rem' }}>
            <div className="term-select-group">
              <label htmlFor="cat-dept">Branch</label>
              <select id="cat-dept" value={catalogDept} onChange={(e) => setCatalogDept(e.target.value)}>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="term-select-group">
              <label htmlFor="cat-sem">Semester</label>
              <select id="cat-sem" value={catalogSem} onChange={(e) => setCatalogSem(e.target.value)}>
                {SEMESTERS.map((s) => <option key={s} value={s}>Semester {s}</option>)}
              </select>
            </div>
          </div>

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
                    <thead>
                      <tr><th>Code</th><th>Course Name</th><th>Type</th><th>Faculty</th><th>Credits</th></tr>
                    </thead>
                    <tbody>
                      {mandatory.map((c) => (
                        <tr key={c.id}>
                          <td><span className="course-code-badge">{c.courseCode}</span></td>
                          <td>{c.courseName}</td>
                          <td><span className={`catalog-type-tag ${TYPE_COLOR[c.type] || ''}`}>{TYPE_LABEL[c.type]}</span></td>
                          <td>{c.facultyName}</td>
                          <td><strong>{c.credits}</strong></td>
                        </tr>
                      ))}
                    </tbody>
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
                    <thead>
                      <tr><th>Code</th><th>Course Name</th><th>Faculty</th><th>Credits</th></tr>
                    </thead>
                    <tbody>
                      {electivesA.map((c) => (
                        <tr key={c.id}>
                          <td><span className="course-code-badge">{c.courseCode}</span></td>
                          <td>{c.courseName}</td>
                          <td>{c.facultyName}</td>
                          <td><strong>{c.credits}</strong></td>
                        </tr>
                      ))}
                    </tbody>
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
                    <thead>
                      <tr><th>Code</th><th>Course Name</th><th>Faculty</th><th>Credits</th></tr>
                    </thead>
                    <tbody>
                      {electivesB.map((c) => (
                        <tr key={c.id}>
                          <td><span className="course-code-badge">{c.courseCode}</span></td>
                          <td>{c.courseName}</td>
                          <td>{c.facultyName}</td>
                          <td><strong>{c.credits}</strong></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </section>
      )}
    </>
  )
}

export default AdminDashboard

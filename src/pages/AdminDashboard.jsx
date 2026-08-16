import { useState, useEffect } from 'react'
import { getStudents, getAllCourses, deleteCourse, deleteStudent } from '../utils/api'
import { useToast } from '../components/Toast'

function AdminDashboard() {
  const toast = useToast()
  const [students, setStudents] = useState([])
  const [allCourses, setAllCourses] = useState([])
  const [expandedId, setExpandedId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')


  useEffect(() => {
    Promise.all([getStudents(), getAllCourses()])
      .then(([s, c]) => { setStudents(s); setAllCourses(c) })
      .catch((err) => toast(err.message, 'error'))
  }, [])

  const coursesFor = (studentId) => allCourses.filter((c) => c.studentId === studentId)

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Delete this course?')) return
    try {
      await deleteCourse(courseId)
      setAllCourses((prev) => prev.filter((c) => c.id !== courseId))
      toast('Course deleted.')
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm('Delete this student and ALL their courses? This cannot be undone.')) return
    try {
      await deleteStudent(studentId)
      setStudents((prev) => prev.filter((s) => s.id !== studentId))
      setAllCourses((prev) => prev.filter((c) => c.studentId !== studentId))
      if (expandedId === studentId) setExpandedId(null)
      toast('Student and their courses deleted.')
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  const normalizedQuery = searchQuery.trim().toLowerCase()
  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(normalizedQuery) ||
      s.rollNumber.toLowerCase().includes(normalizedQuery) ||
      s.department.toLowerCase().includes(normalizedQuery)
  )

  return (
    <>

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
            placeholder="Search by name, roll number, or department"
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
                        {student.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="admin-student-name">{student.name}</p>
                        <p className="admin-student-meta">
                          {student.rollNumber} · {student.department} · Sem {student.semester}
                        </p>
                        <p className="admin-student-email">{student.email}</p>
                      </div>
                    </div>
                    <div className="admin-student-actions">
                      <span className="course-badge">{courses.length} course{courses.length !== 1 ? 's' : ''}</span>
                      <button
                        type="button"
                        className="btn btn-edit"
                        onClick={() => setExpandedId(isExpanded ? null : student.id)}
                      >
                        {isExpanded ? 'Hide Courses ▲' : 'View Courses ▼'}
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
                        <p className="admin-no-courses">No courses registered by this student.</p>
                      ) : (
                        <div className="table-wrapper">
                          <table className="course-table">
                            <thead>
                              <tr>
                                <th>#</th>
                                <th>Code</th>
                                <th>Course Name</th>
                                <th>Faculty</th>
                                <th>Credits</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {courses.map((course, idx) => (
                                <tr key={course.id}>
                                  <td>{idx + 1}</td>
                                  <td>{course.courseCode}</td>
                                  <td>{course.courseName}</td>
                                  <td>{course.facultyName}</td>
                                  <td>{course.credits}</td>
                                  <td>
                                    <button
                                      type="button"
                                      className="btn btn-delete course-actions"
                                      onClick={() => handleDeleteCourse(course.id)}
                                    >
                                      Delete
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
    </>
  )
}

export default AdminDashboard

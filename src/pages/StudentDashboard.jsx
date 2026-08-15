import { useState, useEffect } from 'react'
import { loadSession } from '../utils/localStorage'
import { getStudentById, getCourses, createCourse, updateCourse, deleteCourse } from '../utils/api'
import CourseForm, { initialCourse } from '../components/CourseForm'
import CourseList from '../components/CourseList'

function StudentDashboard() {
  const session = loadSession()

  const [student, setStudent] = useState(null)
  const [courses, setCourses] = useState([])
  const [course, setCourse] = useState(initialCourse)
  const [editingCourseId, setEditingCourseId] = useState(null)
  const [courseError, setCourseError] = useState('')
  const [feedback, setFeedback] = useState(null)

  // Load student + courses on mount
  useEffect(() => {
    getStudentById(session.studentId)
      .then((s) => {
        setStudent(s)
        return getCourses(s.id)
      })
      .then(setCourses)
      .catch((err) => setFeedback({ type: 'error', message: err.message }))
  }, [session.studentId])

  const handleCourseSubmit = async (courseData) => {
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
        setFeedback({ type: 'success', message: 'Course updated.' })
      } else {
        const saved = await createCourse({ ...courseData, studentId: session.studentId })
        setCourses((prev) => [...prev, saved])
        setCourse(initialCourse)
        setFeedback({ type: 'success', message: 'Course registered.' })
      }
      setCourseError('')
    } catch (err) {
      setCourseError(err.message)
    }
  }

  const handleEdit = (c) => {
    setCourse({ courseCode: c.courseCode, courseName: c.courseName, facultyName: c.facultyName, credits: c.credits })
    setEditingCourseId(c.id)
    setCourseError('')
  }

  const handleCancel = () => {
    setCourse(initialCourse)
    setEditingCourseId(null)
    setCourseError('')
  }

  const handleDelete = async (courseId) => {
    if (!window.confirm('Delete this course?')) return
    try {
      await deleteCourse(courseId)
      setCourses((prev) => prev.filter((c) => c.id !== courseId))
      setFeedback({ type: 'success', message: 'Course deleted.' })
      if (editingCourseId === courseId) handleCancel()
    } catch (err) {
      setFeedback({ type: 'error', message: err.message })
    }
  }

  if (!student) return <div className="section empty-state"><p>Loading…</p></div>

  return (
    <>
      {feedback && (
        <div className={`feedback feedback-${feedback.type}`} role="status">
          <span>{feedback.message}</span>
          <button type="button" onClick={() => setFeedback(null)}>Dismiss</button>
        </div>
      )}

      {/* Student info card */}
      <section className="section student-summary">
        <h2>My Profile</h2>
        <div className="summary-card">
          <div className="summary-row"><span className="label">Name</span><span className="value">{student.name}</span></div>
          <div className="summary-row"><span className="label">Roll Number</span><span className="value">{student.rollNumber}</span></div>
          <div className="summary-row"><span className="label">Department</span><span className="value">{student.department}</span></div>
          <div className="summary-row"><span className="label">Semester</span><span className="value">Semester {student.semester}</span></div>
          <div className="summary-row"><span className="label">Email</span><span className="value">{student.email}</span></div>
        </div>
      </section>

      {/* Course registration form */}
      <section className="section">
        <h2>{editingCourseId ? 'Edit Course' : 'Register a Course'}</h2>
        <p className="section-desc">
          {editingCourseId ? 'Update the course details below.' : 'Add a new course to your semester.'}
        </p>
        <CourseForm
          course={course}
          error={courseError}
          isEditing={Boolean(editingCourseId)}
          setCourse={setCourse}
          onCancel={handleCancel}
          onSubmit={handleCourseSubmit}
        />
      </section>

      {/* Course list */}
      <section className="section">
        <h2>My Courses</h2>
        <p className="section-desc">All courses registered for this semester.</p>
        <CourseList courses={courses} onDelete={handleDelete} onEdit={handleEdit} />
      </section>
    </>
  )
}

export default StudentDashboard

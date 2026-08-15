import { useEffect, useState } from 'react'
import { Link, Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import StudentForm from './components/StudentForm'
import CourseForm, { initialCourse } from './components/CourseForm'
import CourseList from './components/CourseList'
import { createCourse, createStudent, deleteCourse, getCourses, getStudents, updateCourse } from './utils/api'
import './App.css'

const initialStudent = {
  name: '',
  rollNumber: '',
  department: '',
  semester: '',
  email: '',
}

function App() {
  const [student, setStudent] = useState(initialStudent)
  const [registeredStudent, setRegisteredStudent] = useState(null)
  const [students, setStudents] = useState([])
  const [course, setCourse] = useState(initialCourse)
  const [courses, setCourses] = useState([])
  const [editingCourseId, setEditingCourseId] = useState(null)
  const [courseError, setCourseError] = useState('')
  const [feedback, setFeedback] = useState(null)

  useEffect(() => {
    getStudents().then((records) => {
      setStudents(records)
      setRegisteredStudent(records[0] ?? null)
    }).catch((error) => setFeedback({ type: 'error', message: error.message }))
  }, [])

  useEffect(() => {
    if (!registeredStudent) {
      setCourses([])
      return
    }
    getCourses(registeredStudent.id).then(setCourses)
      .catch((error) => setFeedback({ type: 'error', message: error.message }))
  }, [registeredStudent])

  const handleStudentSubmit = async (studentData) => {
    try {
      const savedStudent = await createStudent(studentData)
      setStudents((previous) => [...previous, savedStudent].sort((a, b) => a.name.localeCompare(b.name)))
      setRegisteredStudent(savedStudent)
      setStudent(initialStudent)
      setFeedback({ type: 'success', message: 'Student registered permanently.' })
    } catch (error) {
      setFeedback({ type: 'error', message: error.message })
    }
  }

  const handleCourseSubmit = async (courseData) => {
    const duplicateCourse = courses.find((existingCourse) => (
      existingCourse.courseCode.toLowerCase() === courseData.courseCode.toLowerCase()
      && existingCourse.id !== editingCourseId
    ))

    if (duplicateCourse) {
      setCourseError('A course with this course code is already registered.')
      return
    }

    if (editingCourseId) {
      try {
        const savedCourse = await updateCourse(editingCourseId, courseData)
        setCourses((previous) => previous.map((item) => (item.id === editingCourseId ? savedCourse : item)))
        setEditingCourseId(null)
        setCourse(initialCourse)
        setCourseError('')
        setFeedback({ type: 'success', message: 'Course updated permanently.' })
      } catch (error) {
        setCourseError(error.message)
      }
      return
    }
    try {
      const savedCourse = await createCourse({ ...courseData, studentId: registeredStudent.id })
      setCourses((previous) => [...previous, savedCourse])
      setCourse(initialCourse)
      setCourseError('')
      setFeedback({ type: 'success', message: 'Course registered permanently.' })
    } catch (error) {
      setCourseError(error.message)
    }
  }

  const handleEditCourse = (courseToEdit) => {
    setCourse({
      courseCode: courseToEdit.courseCode,
      courseName: courseToEdit.courseName,
      facultyName: courseToEdit.facultyName,
      credits: courseToEdit.credits,
    })
    setEditingCourseId(courseToEdit.id)
    setCourseError('')
  }

  const handleCancelCourseEdit = () => {
    setCourse(initialCourse)
    setEditingCourseId(null)
    setCourseError('')
  }

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Delete this course?')) {
      return
    }

    try {
      await deleteCourse(courseId)
      setCourses((prev) => prev.filter((course) => course.id !== courseId))
      setFeedback({ type: 'success', message: 'Course deleted successfully.' })
    } catch (error) {
      setFeedback({ type: 'error', message: error.message })
      return
    }

    if (editingCourseId === courseId) {
      handleCancelCourseEdit()
    }
  }

  return (
    <Layout>
      {feedback && (
        <div className={`feedback feedback-${feedback.type}`} role="status">
          <span>{feedback.message}</span>
          <button type="button" onClick={() => setFeedback(null)}>Dismiss</button>
        </div>
      )}
      <Routes>
        <Route path="/" element={<Dashboard registeredStudent={registeredStudent} courses={courses} />} />
        <Route
          path="/register-student"
          element={(
            <StudentRegistration
              registeredStudent={registeredStudent}
              students={students}
              student={student}
              setStudent={setStudent}
              onStudentSelect={setRegisteredStudent}
              onSubmit={handleStudentSubmit}
            />
          )}
        />
        <Route
          path="/courses"
          element={(
            <CourseManagement
              course={course}
              courseError={courseError}
              courses={courses}
              editingCourseId={editingCourseId}
              registeredStudent={registeredStudent}
              setCourse={setCourse}
              onCancel={handleCancelCourseEdit}
              onDelete={handleDeleteCourse}
              onEdit={handleEditCourse}
              onSubmit={handleCourseSubmit}
            />
          )}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}

function Dashboard({ courses, registeredStudent }) {
  if (!registeredStudent) {
    return (
      <section className="section empty-state">
        <p>No student registered yet. <Link to="/register-student">Register a student</Link> to get started.</p>
      </section>
    )
  }

  return (
    <>
      <StudentSummary student={registeredStudent} />
      <section className="section dashboard-status">
        <h2>Course Overview</h2>
        <p><strong>{courses.length}</strong> courses registered for this student.</p>
        <Link className="btn btn-primary" to="/courses">Manage Courses</Link>
      </section>
    </>
  )
}

function StudentRegistration({ registeredStudent, students, student, setStudent, onStudentSelect, onSubmit }) {
  return (
    <>
      <section className="section">
        <h2>Student Registration</h2>
        <p className="section-desc">Register your student details before adding courses.</p>
        {students.length > 0 && (
          <label className="field-group">Selected student
            <select value={registeredStudent?.id ?? ''} onChange={(event) => onStudentSelect(students.find((item) => item.id === Number(event.target.value)))}>
              {students.map((item) => <option key={item.id} value={item.id}>{item.name} ({item.rollNumber})</option>)}
            </select>
          </label>
        )}
        <StudentForm student={student} setStudent={setStudent} onSubmit={onSubmit} />
      </section>
      {registeredStudent && <StudentSummary student={registeredStudent} />}
    </>
  )
}

function StudentSummary({ student }) {
  return (
    <section className="section student-summary">
      <h2>Registered Student</h2>
      <div className="summary-card">
        <div className="summary-row"><span className="label">Name</span><span className="value">{student.name}</span></div>
        <div className="summary-row"><span className="label">Roll Number</span><span className="value">{student.rollNumber}</span></div>
        <div className="summary-row"><span className="label">Department</span><span className="value">{student.department}</span></div>
        <div className="summary-row"><span className="label">Semester</span><span className="value">{student.semester}</span></div>
        <div className="summary-row"><span className="label">Email</span><span className="value">{student.email}</span></div>
      </div>
    </section>
  )
}

function CourseManagement({
  course,
  courseError,
  courses,
  editingCourseId,
  registeredStudent,
  setCourse,
  onCancel,
  onDelete,
  onEdit,
  onSubmit,
}) {
  if (!registeredStudent) {
    return (
      <section className="section empty-state">
        <p><Link to="/register-student">Register a student</Link> before adding courses.</p>
      </section>
    )
  }

  return (
    <>
      <section className="section">
        <h2>{editingCourseId ? 'Edit Course' : 'Course Registration'}</h2>
        <p className="section-desc">Add courses for {registeredStudent.name} (Roll: {registeredStudent.rollNumber}).</p>
        <CourseForm
          course={course}
          error={courseError}
          isEditing={Boolean(editingCourseId)}
          setCourse={setCourse}
          onCancel={onCancel}
          onSubmit={onSubmit}
        />
      </section>
      <section className="section">
        <h2>Registered Courses</h2>
        <p className="section-desc">All courses currently registered for this student.</p>
        <CourseList courses={courses} onDelete={onDelete} onEdit={onEdit} />
      </section>
    </>
  )
}

export default App

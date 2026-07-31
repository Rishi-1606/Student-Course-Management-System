import { useEffect, useState } from 'react'
import { Link, Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import StudentForm from './components/StudentForm'
import CourseForm, { initialCourse } from './components/CourseForm'
import CourseList from './components/CourseList'
import { loadCourses, loadStudent, saveCourses, saveStudent } from './utils/localStorage'
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
  const [course, setCourse] = useState(initialCourse)
  const [courses, setCourses] = useState([])
  const [editingCourseId, setEditingCourseId] = useState(null)
  const [courseError, setCourseError] = useState('')
  const [isDataLoaded, setIsDataLoaded] = useState(false)

  useEffect(() => {
    setRegisteredStudent(loadStudent())
    setCourses(loadCourses())
    setIsDataLoaded(true)
  }, [])

  useEffect(() => {
    if (!isDataLoaded) {
      return
    }

    saveStudent(registeredStudent)
    saveCourses(courses)
  }, [courses, isDataLoaded, registeredStudent])

  const handleStudentSubmit = (studentData) => {
    setRegisteredStudent(studentData)
    setStudent(initialStudent)
  }

  const handleCourseSubmit = (courseData) => {
    const duplicateCourse = courses.find((existingCourse) => (
      existingCourse.courseCode.toLowerCase() === courseData.courseCode.toLowerCase()
      && existingCourse.id !== editingCourseId
    ))

    if (duplicateCourse) {
      setCourseError('A course with this course code is already registered.')
      return
    }

    if (editingCourseId) {
      setCourses((prev) => prev.map((existingCourse) => (
        existingCourse.id === editingCourseId
          ? { ...courseData, id: existingCourse.id }
          : existingCourse
      )))
      setEditingCourseId(null)
    } else {
      setCourses((prev) => [...prev, { ...courseData, id: crypto.randomUUID() }])
    }

    setCourse(initialCourse)
    setCourseError('')
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

  const handleDeleteCourse = (courseId) => {
    if (!window.confirm('Delete this course?')) {
      return
    }

    setCourses((prev) => prev.filter((course) => course.id !== courseId))

    if (editingCourseId === courseId) {
      handleCancelCourseEdit()
    }
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard registeredStudent={registeredStudent} courses={courses} />} />
        <Route
          path="/register-student"
          element={(
            <StudentRegistration
              registeredStudent={registeredStudent}
              student={student}
              setStudent={setStudent}
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

function StudentRegistration({ registeredStudent, student, setStudent, onSubmit }) {
  return (
    <>
      <section className="section">
        <h2>Student Registration</h2>
        <p className="section-desc">Register your student details before adding courses.</p>
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

import { useEffect, useState } from 'react'
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

  const handleAddCourse = (courseData) => {
    setCourses((prev) => [...prev, courseData])
  }

  return (
    <Layout>
      <section className="section">
        <h2>Student Registration</h2>
        <p className="section-desc">
          Register your student details before adding courses.
        </p>
        <StudentForm
          student={student}
          setStudent={setStudent}
          onSubmit={handleStudentSubmit}
        />
      </section>

      {registeredStudent ? (
        <section className="section student-summary">
          <h2>Registered Student</h2>
          <div className="summary-card">
            <div className="summary-row">
              <span className="label">Name</span>
              <span className="value">{registeredStudent.name}</span>
            </div>
            <div className="summary-row">
              <span className="label">Roll Number</span>
              <span className="value">{registeredStudent.rollNumber}</span>
            </div>
            <div className="summary-row">
              <span className="label">Department</span>
              <span className="value">{registeredStudent.department}</span>
            </div>
            <div className="summary-row">
              <span className="label">Semester</span>
              <span className="value">{registeredStudent.semester}</span>
            </div>
            <div className="summary-row">
              <span className="label">Email</span>
              <span className="value">{registeredStudent.email}</span>
            </div>
          </div>
        </section>
      ) : (
        <section className="section empty-state">
          <p>No student registered yet. Fill the form above to get started.</p>
        </section>
      )}

      {registeredStudent && (
        <>
          <section className="section">
            <h2>Course Registration</h2>
            <p className="section-desc">
              Add courses for {registeredStudent.name} (Roll: {registeredStudent.rollNumber}).
            </p>
            <CourseForm
              course={course}
              setCourse={setCourse}
              onSubmit={handleAddCourse}
            />
          </section>

          <section className="section">
            <h2>Registered Courses</h2>
            <p className="section-desc">
              All courses currently registered for this student.
            </p>
            <CourseList courses={courses} />
          </section>
        </>
      )}
    </Layout>
  )
}

export default App

import { useState } from 'react'
import Layout from './components/Layout'
import StudentForm from './components/StudentForm'
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

  const handleStudentSubmit = (studentData) => {
    setRegisteredStudent(studentData)
    setStudent(initialStudent)
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
    </Layout>
  )
}

export default App

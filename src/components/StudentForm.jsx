import { useState } from 'react'

const DEPARTMENTS = [
  'Computer Science',
  'Information Technology',
  'Electronics',
  'Mechanical',
  'Civil',
]

const SEMESTERS = ['1', '2', '3', '4', '5', '6', '7', '8']

function StudentForm({ student, setStudent, onSubmit }) {
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setStudent((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const nextErrors = validateStudent(student)

    if (Object.values(nextErrors).some(Boolean)) {
      setErrors(nextErrors)
      return
    }

    onSubmit({
      ...student,
      name: student.name.trim(),
      rollNumber: student.rollNumber.trim(),
      email: student.email.trim(),
    })
  }

  return (
    <form className="form" noValidate onSubmit={handleSubmit}>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="name">Student Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={student.name}
            onChange={handleChange}
            placeholder="Enter full name"
            aria-describedby={errors.name ? 'name-error' : undefined}
            aria-invalid={Boolean(errors.name)}
          />
          {errors.name && <p id="name-error" className="field-error">{errors.name}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="rollNumber">Roll Number</label>
          <input
            type="text"
            id="rollNumber"
            name="rollNumber"
            value={student.rollNumber}
            onChange={handleChange}
            placeholder="e.g. CS2024001"
            aria-describedby={errors.rollNumber ? 'rollNumber-error' : undefined}
            aria-invalid={Boolean(errors.rollNumber)}
          />
          {errors.rollNumber && <p id="rollNumber-error" className="field-error">{errors.rollNumber}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="department">Department</label>
          <select
            id="department"
            name="department"
            value={student.department}
            onChange={handleChange}
            aria-describedby={errors.department ? 'department-error' : undefined}
            aria-invalid={Boolean(errors.department)}
          >
            <option value="">Select department</option>
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
          {errors.department && <p id="department-error" className="field-error">{errors.department}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="semester">Semester</label>
          <select
            id="semester"
            name="semester"
            value={student.semester}
            onChange={handleChange}
            aria-describedby={errors.semester ? 'semester-error' : undefined}
            aria-invalid={Boolean(errors.semester)}
          >
            <option value="">Select semester</option>
            {SEMESTERS.map((sem) => (
              <option key={sem} value={sem}>
                Semester {sem}
              </option>
            ))}
          </select>
          {errors.semester && <p id="semester-error" className="field-error">{errors.semester}</p>}
        </div>

        <div className="form-group form-group-full">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={student.email}
            onChange={handleChange}
            placeholder="student@college.edu"
            aria-describedby={errors.email ? 'email-error' : undefined}
            aria-invalid={Boolean(errors.email)}
          />
          {errors.email && <p id="email-error" className="field-error">{errors.email}</p>}
        </div>
      </div>

      <button type="submit" className="btn btn-primary">
        Register Student
      </button>
    </form>
  )
}

function validateStudent(student) {
  const errors = {}

  if (!student.name.trim()) errors.name = 'Enter the student name.'
  if (!student.rollNumber.trim()) errors.rollNumber = 'Enter the roll number.'
  if (!student.department) errors.department = 'Select a department.'
  if (!SEMESTERS.includes(student.semester)) errors.semester = 'Select a valid semester.'
  if (!student.email.trim()) {
    errors.email = 'Enter an email address.'
  } else if (!/^\S+@\S+\.\S+$/.test(student.email.trim())) {
    errors.email = 'Enter a valid email address.'
  }

  return errors
}

export default StudentForm

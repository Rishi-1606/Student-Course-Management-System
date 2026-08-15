import { useState } from 'react'

const initialCourse = {
  courseCode: '',
  courseName: '',
  facultyName: '',
  credits: '',
}

function CourseForm({ course, setCourse, onCancel, onSubmit, isEditing, error }) {
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setCourse((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const nextErrors = validateCourse(course)

    if (Object.values(nextErrors).some(Boolean)) {
      setErrors(nextErrors)
      return
    }

    onSubmit({
      courseCode: course.courseCode.trim(),
      courseName: course.courseName.trim(),
      facultyName: course.facultyName.trim(),
      credits: course.credits,
    })
  }

  const handleCancel = () => {
    setErrors({})
    onCancel()
  }

  return (
    <form className="form" noValidate onSubmit={handleSubmit}>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="courseCode">Course Code</label>
          <input
            type="text"
            id="courseCode"
            name="courseCode"
            value={course.courseCode}
            onChange={handleChange}
            placeholder="e.g. CS101"
            aria-describedby={errors.courseCode ? 'courseCode-error' : undefined}
            aria-invalid={Boolean(errors.courseCode)}
          />
          {errors.courseCode && <p id="courseCode-error" className="field-error">{errors.courseCode}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="courseName">Course Name</label>
          <input
            type="text"
            id="courseName"
            name="courseName"
            value={course.courseName}
            onChange={handleChange}
            placeholder="e.g. Data Structures"
            aria-describedby={errors.courseName ? 'courseName-error' : undefined}
            aria-invalid={Boolean(errors.courseName)}
          />
          {errors.courseName && <p id="courseName-error" className="field-error">{errors.courseName}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="facultyName">Faculty Name</label>
          <input
            type="text"
            id="facultyName"
            name="facultyName"
            value={course.facultyName}
            onChange={handleChange}
            placeholder="e.g. Dr. Smith"
            aria-describedby={errors.facultyName ? 'facultyName-error' : undefined}
            aria-invalid={Boolean(errors.facultyName)}
          />
          {errors.facultyName && <p id="facultyName-error" className="field-error">{errors.facultyName}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="credits">Credits</label>
          <input
            type="number"
            id="credits"
            name="credits"
            value={course.credits}
            onChange={handleChange}
            placeholder="e.g. 4"
            min="1"
            max="10"
            aria-describedby={errors.credits ? 'credits-error' : undefined}
            aria-invalid={Boolean(errors.credits)}
          />
          {errors.credits && <p id="credits-error" className="field-error">{errors.credits}</p>}
        </div>
      </div>

      {error && <p className="form-error" role="alert">{error}</p>}

      <div className="form-actions">
        <button type="submit" className="btn btn-primary">
          {isEditing ? 'Update Course' : 'Add Course'}
        </button>
        {isEditing && (
          <button type="button" className="btn btn-secondary" onClick={handleCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}

function validateCourse(course) {
  const errors = {}
  const credits = Number(course.credits)

  if (!course.courseCode.trim()) errors.courseCode = 'Enter the course code.'
  if (!course.courseName.trim()) errors.courseName = 'Enter the course name.'
  if (!course.facultyName.trim()) errors.facultyName = 'Enter the faculty name.'
  if (!Number.isInteger(credits) || credits < 1 || credits > 10) {
    errors.credits = 'Credits must be a whole number from 1 to 10.'
  }

  return errors
}

export { initialCourse }
export default CourseForm

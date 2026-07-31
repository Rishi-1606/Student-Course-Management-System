const initialCourse = {
  courseCode: '',
  courseName: '',
  facultyName: '',
  credits: '',
}

function CourseForm({ course, setCourse, onCancel, onSubmit, isEditing, error }) {
  const handleChange = (e) => {
    const { name, value } = e.target
    setCourse((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      courseCode: course.courseCode.trim(),
      courseName: course.courseName.trim(),
      facultyName: course.facultyName.trim(),
      credits: course.credits,
    })
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
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
            required
          />
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
            required
          />
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
            required
          />
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
            required
          />
        </div>
      </div>

      {error && <p className="form-error" role="alert">{error}</p>}

      <div className="form-actions">
        <button type="submit" className="btn btn-primary">
          {isEditing ? 'Update Course' : 'Add Course'}
        </button>
        {isEditing && (
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}

export { initialCourse }
export default CourseForm

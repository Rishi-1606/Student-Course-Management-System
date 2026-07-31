function CourseList({ courses }) {
  if (courses.length === 0) {
    return (
      <div className="empty-state">
        <p>No courses registered yet. Add a course using the form above.</p>
      </div>
    )
  }

  return (
    <div className="table-wrapper">
      <table className="course-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Course Code</th>
            <th>Course Name</th>
            <th>Faculty Name</th>
            <th>Credits</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course, index) => (
            <tr key={course.id}>
              <td>{index + 1}</td>
              <td>{course.courseCode}</td>
              <td>{course.courseName}</td>
              <td>{course.facultyName}</td>
              <td>{course.credits}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="course-count">
        Total courses: <strong>{courses.length}</strong>
      </p>
    </div>
  )
}

export default CourseList

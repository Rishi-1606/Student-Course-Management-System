import { useState } from 'react'

function CourseList({ courses, onDelete, onEdit }) {
  const [searchQuery, setSearchQuery] = useState('')
  const normalizedQuery = searchQuery.trim().toLowerCase()
  const filteredCourses = courses.filter((course) => (
    course.courseCode.toLowerCase().includes(normalizedQuery)
    || course.courseName.toLowerCase().includes(normalizedQuery)
  ))

  if (courses.length === 0) {
    return (
      <div className="empty-state">
        <p>No courses registered yet. Add a course using the form above.</p>
      </div>
    )
  }

  return (
    <>
      <div className="search-field">
        <label htmlFor="courseSearch">Search courses</label>
        <input
          id="courseSearch"
          type="search"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search by course name or code"
        />
      </div>

      <div className="table-wrapper">
        <table className="course-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Course Code</th>
              <th>Course Name</th>
              <th>Faculty Name</th>
              <th>Credits</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCourses.map((course, index) => (
              <tr key={course.id}>
                <td>{index + 1}</td>
                <td>{course.courseCode}</td>
                <td>{course.courseName}</td>
                <td>{course.facultyName}</td>
                <td>{course.credits}</td>
                <td>
                  <div className="course-actions">
                    <button type="button" className="btn btn-edit" onClick={() => onEdit(course)}>
                      Edit
                    </button>
                    <button type="button" className="btn btn-delete" onClick={() => onDelete(course.id)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredCourses.length === 0 && (
          <div className="empty-state search-empty-state">
            <p>No courses match your search.</p>
          </div>
        )}
      </div>
      <p className="course-count">
        {normalizedQuery ? 'Matching courses' : 'Total courses'}: <strong>{filteredCourses.length}</strong>
      </p>
    </>
  )
}

export default CourseList

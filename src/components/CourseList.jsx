import { useState, useMemo } from 'react'

// ── CSV export helper ──────────────────────────────────────
function exportToCSV(courses, studentName) {
  const header = ['#', 'Course Code', 'Course Name', 'Faculty Name', 'Credits']
  const rows = courses.map((c, i) => [
    i + 1,
    c.courseCode,
    `"${c.courseName.replace(/"/g, '""')}"`,
    `"${c.facultyName.replace(/"/g, '""')}"`,
    c.credits,
  ])
  const csvContent = [header.join(','), ...rows.map((r) => r.join(','))].join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${studentName || 'courses'}_courses.csv`
  link.click()
  URL.revokeObjectURL(url)
}

// ── Sort arrow indicator ───────────────────────────────────
function SortArrow({ column, sortKey, direction }) {
  if (sortKey !== column) return <span className="sort-arrow sort-neutral">⇅</span>
  return <span className="sort-arrow sort-active">{direction === 'asc' ? '↑' : '↓'}</span>
}

// ── CourseList ─────────────────────────────────────────────
function CourseList({ courses, onDelete, onEdit, studentName }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortKey, setSortKey] = useState(null)      // null | 'courseCode' | 'courseName' | 'credits'
  const [sortDir, setSortDir] = useState('asc')

  const normalizedQuery = searchQuery.trim().toLowerCase()

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const displayCourses = useMemo(() => {
    let list = courses.filter(
      (c) =>
        c.courseCode.toLowerCase().includes(normalizedQuery) ||
        c.courseName.toLowerCase().includes(normalizedQuery)
    )
    if (sortKey) {
      list = [...list].sort((a, b) => {
        const va = sortKey === 'credits' ? Number(a[sortKey]) : a[sortKey].toLowerCase()
        const vb = sortKey === 'credits' ? Number(b[sortKey]) : b[sortKey].toLowerCase()
        if (va < vb) return sortDir === 'asc' ? -1 : 1
        if (va > vb) return sortDir === 'asc' ? 1 : -1
        return 0
      })
    }
    return list
  }, [courses, normalizedQuery, sortKey, sortDir])

  if (courses.length === 0) {
    return (
      <div className="empty-state">
        <p>No courses registered yet. Add a course using the form above.</p>
      </div>
    )
  }

  return (
    <>
      <div className="course-list-toolbar">
        <div className="search-field">
          <label htmlFor="courseSearch">Search courses</label>
          <input
            id="courseSearch"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by course name or code"
          />
        </div>
        {onDelete && (
          <button
            type="button"
            className="btn btn-export"
            onClick={() => exportToCSV(displayCourses, studentName)}
            title="Download course list as CSV"
          >
            📥 Export CSV
          </button>
        )}
      </div>

      <div className="table-wrapper">
        <table className="course-table">
          <thead>
            <tr>
              <th>#</th>
              <th
                className="sortable-th"
                onClick={() => handleSort('courseCode')}
                aria-sort={sortKey === 'courseCode' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
              >
                Course Code <SortArrow column="courseCode" sortKey={sortKey} direction={sortDir} />
              </th>
              <th
                className="sortable-th"
                onClick={() => handleSort('courseName')}
                aria-sort={sortKey === 'courseName' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
              >
                Course Name <SortArrow column="courseName" sortKey={sortKey} direction={sortDir} />
              </th>
              <th>Faculty Name</th>
              <th
                className="sortable-th"
                onClick={() => handleSort('credits')}
                aria-sort={sortKey === 'credits' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
              >
                Credits <SortArrow column="credits" sortKey={sortKey} direction={sortDir} />
              </th>
              {onEdit && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {displayCourses.map((course, index) => (
              <tr key={course.id}>
                <td>{index + 1}</td>
                <td><span className="course-code-badge">{course.courseCode}</span></td>
                <td>{course.courseName}</td>
                <td>{course.facultyName}</td>
                <td><strong>{course.credits}</strong></td>
                {onEdit && (
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
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {displayCourses.length === 0 && (
          <div className="empty-state search-empty-state">
            <p>No courses match your search.</p>
          </div>
        )}
      </div>
      <p className="course-count">
        {normalizedQuery ? 'Matching courses' : 'Total courses'}: <strong>{displayCourses.length}</strong>
      </p>
    </>
  )
}

export default CourseList

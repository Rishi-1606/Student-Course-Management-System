const STUDENTS_KEY = 'scms.students'
const COURSES_KEY = 'scms.courses'

function read(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function write(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value))
}

export function loadStudents() {
  const data = read(STUDENTS_KEY, [])
  return Array.isArray(data) ? data : []
}

export function saveStudents(students) {
  write(STUDENTS_KEY, students)
}

export function loadCourses() {
  const data = read(COURSES_KEY, [])
  return Array.isArray(data) ? data : []
}

export function saveCourses(courses) {
  write(COURSES_KEY, courses)
}

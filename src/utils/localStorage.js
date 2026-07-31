const STUDENT_STORAGE_KEY = 'student-course-management.student'
const COURSES_STORAGE_KEY = 'student-course-management.courses'

function readStoredValue(key, fallback) {
  try {
    const storedValue = window.localStorage.getItem(key)
    return storedValue ? JSON.parse(storedValue) : fallback
  } catch {
    return fallback
  }
}

export function saveStudent(student) {
  window.localStorage.setItem(STUDENT_STORAGE_KEY, JSON.stringify(student))
}

export function loadStudent() {
  const student = readStoredValue(STUDENT_STORAGE_KEY, null)
  return student && typeof student === 'object' && !Array.isArray(student) ? student : null
}

export function saveCourses(courses) {
  window.localStorage.setItem(COURSES_STORAGE_KEY, JSON.stringify(courses))
}

export function loadCourses() {
  const courses = readStoredValue(COURSES_STORAGE_KEY, [])
  return Array.isArray(courses) ? courses : []
}

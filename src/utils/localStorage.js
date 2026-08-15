const STUDENTS_KEY = 'scms.students'
const COURSES_KEY = 'scms.courses'
const SESSION_KEY = 'scms.session'

function read(key, fallback, storage = window.localStorage) {
  try {
    const raw = storage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function write(key, value, storage = window.localStorage) {
  storage.setItem(key, JSON.stringify(value))
}

// ── Students ──────────────────────────────────────────────
export function loadStudents() {
  const data = read(STUDENTS_KEY, [])
  return Array.isArray(data) ? data : []
}

export function saveStudents(students) {
  write(STUDENTS_KEY, students)
}

// ── Courses ───────────────────────────────────────────────
export function loadCourses() {
  const data = read(COURSES_KEY, [])
  return Array.isArray(data) ? data : []
}

export function saveCourses(courses) {
  write(COURSES_KEY, courses)
}

// ── Session (sessionStorage — clears on tab close) ────────
export function loadSession() {
  return read(SESSION_KEY, null, window.sessionStorage)
}

export function saveSession(session) {
  write(SESSION_KEY, session, window.sessionStorage)
}

export function clearSession() {
  window.sessionStorage.removeItem(SESSION_KEY)
}

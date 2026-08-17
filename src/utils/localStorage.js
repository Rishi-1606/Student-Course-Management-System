const STUDENTS_KEY = 'scms.students'
const COURSES_KEY  = 'scms.courses'
const CATALOG_KEY  = 'scms.catalog'
const SETTINGS_KEY = 'scms.settings'
const SESSION_KEY  = 'scms.session'

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

// ── Courses (Enrollments) ─────────────────────────────────
export function loadCourses() {
  const data = read(COURSES_KEY, [])
  return Array.isArray(data) ? data : []
}

export function saveCourses(courses) {
  write(COURSES_KEY, courses)
}

// ── Master Catalog ────────────────────────────────────────
export function loadCatalog() {
  const data = read(CATALOG_KEY, null)
  return Array.isArray(data) ? data : null
}

export function saveCatalog(catalog) {
  write(CATALOG_KEY, catalog)
}

// ── System Settings ───────────────────────────────────────
const DEFAULT_SETTINGS = {
  academicYear: '2024-25',
  registrationOpen: true,
  registrationStart: null,
  registrationEnd: null,
}

export function loadSettings() {
  return read(SETTINGS_KEY, DEFAULT_SETTINGS)
}

export function saveSettings(settings) {
  write(SETTINGS_KEY, settings)
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

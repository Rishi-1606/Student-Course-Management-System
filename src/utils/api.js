import { loadStudents, saveStudents, loadCourses, saveCourses } from './localStorage'

const ADMIN_USERNAME = 'admin'
const ADMIN_PASSWORD = 'admin123'

function nextId(items) {
  return items.length === 0 ? 1 : Math.max(...items.map((item) => item.id)) + 1
}

// ── Auth ──────────────────────────────────────────────────

/**
 * Attempt login. Returns { role, studentId? } on success or throws.
 */
export function login(identifier, password) {
  // Admin check
  if (identifier === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    return Promise.resolve({ role: 'admin' })
  }

  // Student check (identifier = rollNumber)
  const students = loadStudents()
  const student = students.find(
    (s) => s.rollNumber.toLowerCase() === identifier.toLowerCase() && s.password === password
  )
  if (!student) return Promise.reject(new Error('Invalid roll number or password.'))
  return Promise.resolve({ role: 'student', studentId: student.id })
}

// ── Students ──────────────────────────────────────────────

export function getStudents() {
  return Promise.resolve(loadStudents())
}

export function createStudent(student) {
  const students = loadStudents()
  const duplicate = students.find(
    (s) => s.rollNumber.toLowerCase() === student.rollNumber.toLowerCase()
  )
  if (duplicate) return Promise.reject(new Error('A student with this roll number already exists.'))
  const newStudent = { ...student, id: nextId(students) }
  saveStudents([...students, newStudent])
  return Promise.resolve(newStudent)
}

export function getStudentById(studentId) {
  const students = loadStudents()
  const student = students.find((s) => s.id === studentId)
  if (!student) return Promise.reject(new Error('Student not found.'))
  return Promise.resolve(student)
}

export function updateStudent(studentId, data) {
  const students = loadStudents()
  let updated = null
  const next = students.map((s) => {
    if (s.id === studentId) {
      updated = { ...s, ...data }
      return updated
    }
    return s
  })
  if (!updated) return Promise.reject(new Error('Student not found.'))
  saveStudents(next)
  return Promise.resolve(updated)
}

export function changePassword(studentId, currentPassword, newPassword) {
  const students = loadStudents()
  const student = students.find((s) => s.id === studentId)
  if (!student) return Promise.reject(new Error('Student not found.'))
  if (student.password !== currentPassword)
    return Promise.reject(new Error('Current password is incorrect.'))
  const updated = { ...student, password: newPassword }
  saveStudents(students.map((s) => (s.id === studentId ? updated : s)))
  return Promise.resolve(updated)
}

export function deleteStudent(studentId) {
  saveStudents(loadStudents().filter((s) => s.id !== studentId))
  // Also remove all their courses
  saveCourses(loadCourses().filter((c) => c.studentId !== studentId))
  return Promise.resolve()
}

// ── Courses ───────────────────────────────────────────────

export function getCourses(studentId) {
  return Promise.resolve(loadCourses().filter((c) => c.studentId === studentId))
}

export function getAllCourses() {
  return Promise.resolve(loadCourses())
}

export function createCourse(course) {
  const courses = loadCourses()
  const newCourse = { ...course, id: nextId(courses) }
  saveCourses([...courses, newCourse])
  return Promise.resolve(newCourse)
}

export function updateCourse(courseId, courseData) {
  const courses = loadCourses()
  let updated = null
  const nextCourses = courses.map((course) => {
    if (course.id === courseId) {
      updated = { ...course, ...courseData }
      return updated
    }
    return course
  })
  if (!updated) return Promise.reject(new Error('Course not found.'))
  saveCourses(nextCourses)
  return Promise.resolve(updated)
}

export function deleteCourse(courseId) {
  saveCourses(loadCourses().filter((c) => c.id !== courseId))
  return Promise.resolve()
}

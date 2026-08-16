import { loadStudents, saveStudents, loadCourses, saveCourses, loadCatalog, saveCatalog } from './localStorage'

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

  // Student check (identifier = prn)
  const students = loadStudents()
  const student = students.find(
    (s) => s.prn.toLowerCase() === identifier.toLowerCase() && s.password === password
  )
  if (!student) return Promise.reject(new Error('Invalid PRN or password.'))
  return Promise.resolve({ role: 'student', studentId: student.id })
}

// ── Students ──────────────────────────────────────────────

export function getStudents() {
  return Promise.resolve(loadStudents())
}

export function createStudent(student) {
  const students = loadStudents()
  const newId = nextId(students)
  const prn = `PRN-${1000 + newId}`
  
  const duplicate = students.find(
    (s) => s.email.toLowerCase() === student.email.toLowerCase()
  )
  if (duplicate) return Promise.reject(new Error('A student with this email already exists.'))
  
  const newStudent = { ...student, id: newId, prn }
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

// ── Catalog ───────────────────────────────────────────────

export function seedCatalog() {
  const existing = loadCatalog()
  if (existing) return existing

  const catalog = []
  let id = 1

  const branches = ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil']
  const branchCores = {
    'Computer Science': ['Programming', 'Data Structures', 'Operating Systems', 'Databases', 'Algorithms', 'Networking', 'AI Fundamentals', 'Cyber Security'],
    'Information Technology': ['Web Dev', 'IT Infrastructure', 'Cloud Computing', 'Data Analytics', 'Software Eng', 'Mobile Apps', 'Information Systems', 'IT Security'],
    'Electronics': ['Circuit Design', 'Digital Logic', 'Microprocessors', 'Signals & Systems', 'Control Systems', 'VLSI', 'Embedded Systems', 'Communication'],
    'Mechanical': ['Thermodynamics', 'Fluid Mechanics', 'Machine Design', 'Manufacturing', 'Heat Transfer', 'Robotics', 'CAD/CAM', 'Automotive'],
    'Civil': ['Structural Analysis', 'Fluid Mechanics', 'Surveying', 'Geotech', 'Transportation', 'Environmental', 'Construction', 'Town Planning']
  }

  const electivesA = ['Intro to AI', 'Blockchain Basics', 'Climate Tech', 'Quantum Computing', 'Data Privacy']
  const electivesB = ['Photography', 'Business Management', 'Psychology', 'Financial Literacy', 'Public Speaking']

  branches.forEach(branch => {
    for (let sem = 1; sem <= 8; sem++) {
      // 4 Core courses
      for (let i = 0; i < 4; i++) {
        const coreName = `${branchCores[branch][i % 8]} - Part ${sem}`
        catalog.push({ id: id++, type: 'core', courseCode: `${branch.substring(0,2).toUpperCase()}${sem}0${i+1}`, courseName: coreName, facultyName: 'Dr. Smith', credits: Math.floor(Math.random() * 4) + 1, department: branch, semester: String(sem) })
      }
      // 1 Aptitude
      catalog.push({ id: id++, type: 'aptitude', courseCode: `APT${sem}01`, courseName: `Aptitude & Soft Skills ${sem}`, facultyName: 'Prof. Johnson', credits: 2, department: branch, semester: String(sem) })
      // 1 Project
      catalog.push({ id: id++, type: 'project', courseCode: `PRJ${sem}01`, courseName: `Semester ${sem} Project`, facultyName: 'Dr. Guide', credits: 4, department: branch, semester: String(sem) })
      
      // Elective A pool (5 options)
      electivesA.forEach((ea, i) => {
        catalog.push({ id: id++, type: 'elective_a', courseCode: `ELA${sem}0${i+1}`, courseName: ea, facultyName: 'Guest Lecturer', credits: 3, department: branch, semester: String(sem) })
      })
      // Elective B pool (5 options)
      electivesB.forEach((eb, i) => {
        catalog.push({ id: id++, type: 'elective_b', courseCode: `ELB${sem}0${i+1}`, courseName: eb, facultyName: 'Guest Lecturer', credits: 3, department: branch, semester: String(sem) })
      })
    }
  })

  saveCatalog(catalog)
  return catalog
}

export function getCatalog(department, semester) {
  const catalog = loadCatalog() || seedCatalog()
  if (!department || !semester) return Promise.resolve(catalog)
  return Promise.resolve(catalog.filter(c => c.department === department && c.semester === semester))
}

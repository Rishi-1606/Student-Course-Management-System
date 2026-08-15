import { loadStudents, saveStudents, loadCourses, saveCourses } from './localStorage'

// Generate the next auto-increment ID from an array of records
function nextId(items) {
  return items.length === 0 ? 1 : Math.max(...items.map((item) => item.id)) + 1
}

export function getStudents() {
  return Promise.resolve(loadStudents())
}

export function createStudent(student) {
  const students = loadStudents()
  const newStudent = { ...student, id: nextId(students) }
  saveStudents([...students, newStudent])
  return Promise.resolve(newStudent)
}

export function getCourses(studentId) {
  const courses = loadCourses()
  return Promise.resolve(courses.filter((course) => course.studentId === studentId))
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
  const courses = loadCourses()
  saveCourses(courses.filter((course) => course.id !== courseId))
  return Promise.resolve()
}

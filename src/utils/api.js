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
    (s) => s.prn?.toLowerCase() === identifier.toLowerCase() && s.password === password
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

const CATALOG_VERSION = 2 // bump this to force re-seed with new data

export function seedCatalog() {
  const existing = loadCatalog()
  const storedVersion = parseInt(localStorage.getItem('scms.catalog.version') || '0')
  if (existing && storedVersion === CATALOG_VERSION) return existing

  const catalog = []
  let id = 1

  const BRANCH_CODE = {
    'Computer Science': 'CS',
    'Information Technology': 'IT',
    'Electronics': 'EC',
    'Mechanical': 'ME',
    'Civil': 'CE',
  }

  // 4 unique subjects for each of 8 semesters, per branch
  const BRANCH_CORES = {
    'Computer Science': [
      ['Programming Fundamentals', 'Discrete Mathematics', 'Digital Logic Design', 'Problem Solving Techniques'],
      ['Data Structures', 'Object-Oriented Programming', 'Computer Organization', 'Linear Algebra'],
      ['Algorithms & Complexity', 'Operating Systems', 'Database Management Systems', 'Computer Networks'],
      ['Software Engineering', 'Theory of Computation', 'Compiler Design', 'Web Technologies'],
      ['Artificial Intelligence', 'Machine Learning', 'Information Security', 'Cloud Computing'],
      ['Deep Learning', 'Big Data Analytics', 'Distributed Systems', 'Mobile App Development'],
      ['Natural Language Processing', 'Computer Vision', 'Blockchain Technology', 'IoT Systems'],
      ['Software Architecture', 'Research Methodology', 'Emerging Technologies', 'Ethics in Computing'],
    ],
    'Information Technology': [
      ['IT Fundamentals', 'Mathematics for IT', 'Computer Hardware', 'Communication Skills'],
      ['Web Design (HTML/CSS/JS)', 'Database Concepts', 'Networking Basics', 'OOP with Java'],
      ['System Analysis & Design', 'PHP & MySQL', 'Linux Administration', 'Data Communication'],
      ['Software Testing & QA', 'ERP Systems', 'Network Security', 'Advanced Web Development'],
      ['Cloud Computing', 'Big Data Technologies', 'Mobile Computing', 'E-Commerce Technologies'],
      ['Data Analytics', 'DevOps Practices', 'IT Project Management', 'Business Intelligence'],
      ['IT Service Management', 'Digital Marketing', 'Cybersecurity Operations', 'AI for IT'],
      ['IT Governance & Compliance', 'Advanced Database Systems', 'Research & Innovation', 'Professional Ethics in IT'],
    ],
    'Electronics': [
      ['Circuit Analysis', 'Engineering Mathematics I', 'Physics of Materials', 'Engineering Drawing'],
      ['Electronic Devices & Circuits', 'Engineering Mathematics II', 'Digital Electronics', 'Workshop Practice'],
      ['Signals & Systems', 'Microprocessors & Assembly', 'Analog Circuits', 'Electromagnetic Theory'],
      ['Control Systems', 'Communication Engineering', 'VLSI Design', 'Digital Signal Processing'],
      ['Wireless Communication', 'Embedded Systems', 'Power Electronics', 'Microcontrollers & Applications'],
      ['RF & Microwave Engineering', 'Antenna & Wave Propagation', 'Digital Image Processing', 'Industrial Electronics'],
      ['Satellite Communication', 'Optical Fiber Communication', 'Robotics & Automation', 'FPGA Design'],
      ['Advanced VLSI Systems', 'Research Methodology', 'Emerging Trends in Electronics', 'Professional Ethics'],
    ],
    'Mechanical': [
      ['Engineering Mechanics', 'Engineering Mathematics I', 'Engineering Drawing', 'Material Science'],
      ['Thermodynamics I', 'Engineering Mathematics II', 'Manufacturing Processes', 'Workshop Technology'],
      ['Fluid Mechanics', 'Machine Drawing', 'Kinematics of Machinery', 'Material Testing & Metallurgy'],
      ['Heat Transfer', 'Design of Machine Elements', 'Dynamics of Machinery', 'Manufacturing Technology'],
      ['Industrial Engineering', 'Refrigeration & Air Conditioning', 'Finite Element Analysis', 'Mechatronics'],
      ['CAD/CAM & CNC', 'Robotics & Automation', 'Power Plant Engineering', 'Tool & Die Design'],
      ['Operations Research', 'Automobile Engineering', 'Non-Destructive Testing', 'Product Design & Development'],
      ['Industrial Management', 'Research Methodology', 'Renewable Energy Systems', 'Professional Ethics'],
    ],
    'Civil': [
      ['Engineering Mechanics', 'Engineering Mathematics I', 'Engineering Drawing', 'Building Materials'],
      ['Structural Analysis I', 'Engineering Mathematics II', 'Surveying I', 'Fluid Mechanics I'],
      ['Structural Analysis II', 'Surveying II', 'Concrete Technology', 'Hydraulics & Hydraulic Machines'],
      ['Design of RCC Structures', 'Geotechnical Engineering', 'Transportation Engineering', 'Environmental Engineering'],
      ['Design of Steel Structures', 'Foundation Engineering', 'Hydrology & Water Resources', 'Traffic Engineering'],
      ['Construction Management', 'Town & Country Planning', 'Remote Sensing & GIS', 'Water Supply Engineering'],
      ['Bridge Engineering', 'Earthquake Engineering', 'Cost Estimation & Valuation', 'Pavement Design'],
      ['Project Management', 'Research Methodology', 'Sustainable Construction', 'Professional Ethics'],
    ],
  }

  // Aptitude course varies progressively by semester
  const APTITUDE_BY_SEM = [
    'Verbal Reasoning & Communication',
    'Quantitative Aptitude I',
    'Logical Reasoning',
    'Quantitative Aptitude II',
    'Critical Thinking & Problem Solving',
    'Analytical Skills & Data Interpretation',
    'Communication & Presentation Skills',
    'Interview Preparation & Soft Skills',
  ]

  // Project complexity grows with each semester
  const PROJECT_BY_SEM = [
    'Mini Project I – Individual',
    'Mini Project II – Team',
    'Lab-Based Technical Project',
    'Mid-Level Domain Project',
    'Domain-Specific Applied Project',
    'Industry-Oriented Capstone Project',
    'Research-Based Project',
    'Major Final Year Project',
  ]

  // Elective A: Trending tech/world topics — different for each semester
  const ELECTIVES_A = [
    ['Intro to AI', 'Web Design Basics', 'Python Programming Basics', 'Data Literacy', 'Digital Life Skills'],
    ['Blockchain Basics', 'Cybersecurity Awareness', 'IoT Fundamentals', 'Cloud Basics', 'AR/VR Introduction'],
    ['Machine Learning Basics', 'Data Science Essentials', 'Mobile App Design', 'DevOps Basics', 'UI/UX Design'],
    ['Deep Learning', 'Network Security', 'Full Stack Development', 'Cloud Architecture', 'Quantum Computing Intro'],
    ['Advanced AI Applications', 'Big Data Technologies', 'Microservices Architecture', 'Edge Computing', 'Digital Transformation'],
    ['Natural Language Processing', 'Computer Vision Basics', 'Blockchain Development', 'Data Engineering', 'Cyber Forensics'],
    ['AI Ethics & Governance', 'Autonomous Systems', 'Extended Reality (XR)', 'Fintech & Digital Payments', 'Space Technology'],
    ['Research Frontiers in AI', 'Emerging Tech Trends', 'Tech Entrepreneurship', 'Digital Policy & Law', 'Climate Technology'],
  ]

  // Elective B: Open/extra-curricular — different for each semester
  const ELECTIVES_B = [
    ['Photography', 'Creative Writing', 'Music Appreciation', 'Basic Personal Finance', 'Public Speaking'],
    ['Drawing & Sketching', 'Environmental Awareness', 'Yoga & Wellness', 'Video Editing', 'Social Media Marketing'],
    ['Business Communication', 'Psychology Basics', 'Entrepreneurship Basics', 'Sports & Fitness', 'Travel & Tourism'],
    ['Financial Literacy', 'Leadership Skills', 'Graphic Design', 'Film Studies', 'Cultural Studies'],
    ['Business Management', 'Philosophy', 'Project Management Basics', 'Cooking & Nutrition', 'French Language'],
    ['Marketing Fundamentals', 'Law for Engineers', 'Startup Ecosystem', 'Digital Art', 'German Language'],
    ['Corporate Governance', 'Ethics & Society', 'Innovation Management', 'Media Studies', 'Spanish Language'],
    ['Career Planning', 'Interview Skills', 'Negotiation & Persuasion', 'Personality Development', 'Japanese Language'],
  ]

  const FACULTY = [
    'Dr. Sharma', 'Prof. Mehta', 'Dr. Kumar', 'Prof. Joshi',
    'Dr. Patel', 'Prof. Reddy', 'Dr. Singh', 'Prof. Nair',
  ]
  const CORE_CREDITS = [3, 4, 3, 4] // alternating credits for 4 core subjects

  Object.keys(BRANCH_CORES).forEach((branch) => {
    const code = BRANCH_CODE[branch]
    for (let semIdx = 0; semIdx < 8; semIdx++) {
      const sem = String(semIdx + 1)
      const cores = BRANCH_CORES[branch][semIdx]

      // 4 Core courses — unique per branch & semester
      cores.forEach((name, i) => {
        catalog.push({
          id: id++,
          type: 'core',
          courseCode: `${code}${sem}0${i + 1}`,
          courseName: name,
          facultyName: FACULTY[(semIdx * 4 + i) % FACULTY.length],
          credits: CORE_CREDITS[i],
          department: branch,
          semester: sem,
        })
      })

      // 1 Aptitude — semester-specific
      catalog.push({
        id: id++,
        type: 'aptitude',
        courseCode: `APT${sem}01`,
        courseName: APTITUDE_BY_SEM[semIdx],
        facultyName: 'Prof. Johnson',
        credits: 2,
        department: branch,
        semester: sem,
      })

      // 1 Project — grows in complexity by semester
      catalog.push({
        id: id++,
        type: 'project',
        courseCode: `${code}${sem}PR`,
        courseName: PROJECT_BY_SEM[semIdx],
        facultyName: 'Dr. Guide',
        credits: 4,
        department: branch,
        semester: sem,
      })

      // 5 Elective A options — semester-specific trending topics
      ELECTIVES_A[semIdx].forEach((name, i) => {
        catalog.push({
          id: id++,
          type: 'elective_a',
          courseCode: `ELA${sem}0${i + 1}`,
          courseName: name,
          facultyName: 'Guest Lecturer',
          credits: 3,
          department: branch,
          semester: sem,
        })
      })

      // 5 Elective B options — semester-specific open courses
      ELECTIVES_B[semIdx].forEach((name, i) => {
        catalog.push({
          id: id++,
          type: 'elective_b',
          courseCode: `ELB${sem}0${i + 1}`,
          courseName: name,
          facultyName: 'Guest Lecturer',
          credits: 2,
          department: branch,
          semester: sem,
        })
      })
    }
  })

  saveCatalog(catalog)
  localStorage.setItem('scms.catalog.version', String(CATALOG_VERSION))
  return catalog
}

export function getCatalog(department, semester) {
  const catalog = loadCatalog() || seedCatalog()
  if (!department || !semester) return Promise.resolve(catalog)
  return Promise.resolve(catalog.filter((c) => c.department === department && c.semester === semester))
}

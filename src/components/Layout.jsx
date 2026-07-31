import { NavLink } from 'react-router-dom'

function Layout({ children }) {
  return (
    <div className="app">
      <header className="header">
        <h1>Student Course Management System</h1>
        <p>Manage student registration and course enrollments</p>
        <nav className="navigation" aria-label="Main navigation">
          <NavLink to="/" end>Dashboard</NavLink>
          <NavLink to="/register-student">Student</NavLink>
          <NavLink to="/courses">Courses</NavLink>
        </nav>
      </header>
      <main className="main">{children}</main>
    </div>
  )
}

export default Layout

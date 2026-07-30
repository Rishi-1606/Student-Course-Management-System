function Layout({ children }) {
  return (
    <div className="app">
      <header className="header">
        <h1>Student Course Management System</h1>
        <p>Manage student registration and course enrollments</p>
      </header>
      <main className="main">{children}</main>
    </div>
  )
}

export default Layout

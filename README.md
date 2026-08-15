# Student Course Management System

A React application for registering one student and managing that student's courses.

## Features

- Student registration with inline validation
- Course creation, search, editing, and deletion
- Duplicate course-code prevention
- Local Storage persistence across browser refreshes
- Dashboard, student registration, and course-management routes

## Run locally

1. Install dependencies with `npm install`.
2. Start the development server with `npm run dev`.
3. Open `http://localhost:5173`.

The development server deliberately uses port `5173`. If that port is busy, stop
the other server before starting this project. Browser Local Storage is scoped to
the full origin, so changing the port (for example, from `5173` to `5174`) makes
the saved records unavailable at the new address.

## Available routes

- `/` - Dashboard
- `/register-student` - Register or replace student information
- `/courses` - Add, search, edit, and delete courses

## Database setup

Start **Apache** and **MySQL** in the XAMPP Control Panel, then run `npm run dev`.
This project expects XAMPP MySQL on port `3307` to avoid a conflict with another
MySQL service using the standard port `3306`.
The API automatically creates the `student_course_management` database and its
tables on the first request. This requires the normal XAMPP MySQL credentials
(`root` with an empty password). Change them in `api/index.php` if yours differ.

Student and course records are stored in MySQL, so closing the browser or the
development server does not remove them.

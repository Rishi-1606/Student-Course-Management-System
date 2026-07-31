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
3. Open the URL shown by Vite, normally `http://localhost:5173`.

## Available routes

- `/` - Dashboard
- `/register-student` - Register or replace student information
- `/courses` - Add, search, edit, and delete courses

## Persistence

The application stores registered data in browser Local Storage. To clear it, use the browser developer tools for the app's origin and remove these keys:

- `student-course-management.student`
- `student-course-management.courses`

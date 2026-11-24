# PROJECT: UniConnect – University Management & Student Collaboration Desktop Application

## 1. Project Overview

Develop a complete, modern, professional desktop application named **UniConnect**.

UniConnect is a centralized university platform designed to connect students, teachers, and university administrators in one system.

The main purpose of this application is to make university activities easier by providing a single platform for academic management, communication, announcements, study resources, assignments, events, and student information.

The application must be a fully functional desktop application, not just a static UI design or website.

The application should have a clean, modern, attractive, and professional interface that is easy to understand and navigate.

## 2. Project Folder Structure

The project directory is:

```
UniConnect/
├── UniConnect-Documentation/
│   ├── README.md
│   ├── PRODUCT_SPECIFICATION.md
│   ├── FEATURES.md
│   ├── UI_UX_GUIDELINES.md
│   ├── DATABASE_SCHEMA.md
│   ├── USER_ROLES.md
│   ├── DEVELOPMENT_ROADMAP.md
│   └── ANTIGRAVITY_PROMPT.md
└── UniConnect-App/
```

Before starting development:
1. Read all documentation files.
2. Understand the project requirements.
3. Complete the documentation files with proper descriptions and technical details.
4. Keep the documentation updated as development progresses.
5. Create the actual application source code in a separate application directory inside UniConnect.
6. Do not put the entire application source code inside the documentation folder.

## 3. Application Type and Technology

Build UniConnect as a desktop application.

Preferred technologies:
- Electron for desktop application development.
- React for the user interface.
- TypeScript for application logic.
- Tailwind CSS for styling.
- SQLite for local database storage.
- Use secure Electron architecture and proper communication between the frontend and backend.

The application should be installable and runnable on Windows.
Organize the source code into clean, reusable, and maintainable components.

## 4. User Roles

The application must support three main user roles:
1. **Student**
2. **Teacher**
3. **Administrator**

Each role must have different permissions. Users should only access the features allowed for their role.

## 5. Main Application Modules

1. **Authentication System** (Login, registration, role-based auth, secure storage, logout, validation).
2. **Dashboard** (Role-specific dashboards with KPIs, widgets, deadlines, announcements, schedules).
3. **Student Management** (Administrator view, record creation, editing, enrollment details).
4. **Course Management** (Course code, title, department, assigned faculty, credits, student viewing).
5. **Assignment Management** (Teacher creation, deadlines, student submission, grading and feedback).
6. **Study Resources** (Dedicated learning materials repository with upload and download).
7. **Announcements** (Targeted publication by admins and teachers with priority badges).
8. **Timetable Management** (Weekly grid matrix with courses, teachers, classrooms, and time slots).
9. **Communication System** (Direct messaging, message threads, search, timestamps, unread badges).
10. **Events and Activities** (Campus activities, calendar, RSVPs, organizer info).
11. **Notifications** (System alerts for assignments, grades, announcements, and messages).
12. **User Profile and Settings** (Personal info, password changes, preferences, logout).

## 6. Functional & Quality Mandates

- **Every visible button, menu, form, and interactive element must work.**
- No non-functional placeholder buttons.
- Realistic database storage using SQLite that persists across application restarts.
- Strict security: secure Electron settings (context isolation, no raw SQL in renderer), hashed passwords, role-based permission validation.
- Standalone Windows installer: package into `UniConnect-Setup.exe` so users can run it without opening VS Code or a terminal.

# UniConnect – User Roles & Role-Based Access Control (RBAC)

This document defines the user personas, permission matrices, navigation privileges, and security boundaries implemented in **UniConnect**.

---

## 1. Role Personas & Scopes

### 1.1 Student Persona
- **Primary Goal**: Track course obligations, submit assignments on time, access study materials, inspect lecture timetables, review grades, and communicate with instructors and classmates.
- **Scope**: Restricted strictly to their own enrolled courses, their own submissions and grades, and public campus announcements/events.

### 1.2 Teacher / Faculty Persona
- **Primary Goal**: Manage assigned course cohorts, upload lecture resources, publish assignments and deadlines, grade student submissions with qualitative feedback, post course announcements, and maintain office-hour communications.
- **Scope**: Scoped to courses they are assigned to teach. Unrestricted access to submissions and student rosters within their assigned courses.

### 1.3 Administrator Persona
- **Primary Goal**: Oversee institution-wide academic operations, manage student and faculty accounts, configure academic departments, create courses, assign teachers to courses, manage master timetables, and publish university-wide announcements.
- **Scope**: Global system governance across all departments, courses, and user directories.

---

## 2. Granular Permission Matrix

| Module / Operation | Student | Teacher | Administrator |
| :--- | :---: | :---: | :---: |
| **Authentication & Profiles** |
| Register new account | ✅ | ✅ | ✅ |
| Login / Logout | ✅ | ✅ | ✅ |
| View own profile | ✅ | ✅ | ✅ |
| Edit own profile (phone, bio, avatar) | ✅ | ✅ | ✅ |
| Change own password | ✅ | ✅ | ✅ |
| **Dashboard** |
| View Student Dashboard (urgent tasks, today's classes) | ✅ | ❌ | ❌ |
| View Teacher Dashboard (pending grading, active courses) | ❌ | ✅ | ❌ |
| View Admin Dashboard (system stats, department metrics) | ❌ | ❌ | ✅ |
| **Student Management** |
| View global student directory | ❌ | ❌ | ✅ |
| Add new student record | ❌ | ❌ | ✅ |
| Edit student record (department, semester, status) | ❌ | ❌ | ✅ |
| Remove / Deactivate student | ❌ | ❌ | ✅ |
| View enrolled student roster for assigned course | ❌ | ✅ | ✅ |
| **Course Management** |
| View enrolled courses list | ✅ | ❌ | ❌ |
| View assigned teaching courses | ❌ | ✅ | ❌ |
| Create new course (code, title, credits, department) | ❌ | ❌ | ✅ |
| Edit course metadata | ❌ | ❌ | ✅ |
| Assign / Reassign faculty teacher to course | ❌ | ❌ | ✅ |
| Delete course | ❌ | ❌ | ✅ |
| **Assignments & Grading** |
| View assignment guidelines & due dates | ✅ | ✅ | ✅ |
| Create new assignment | ❌ | ✅ | ✅ |
| Edit / Delete existing assignment | ❌ | ✅ (own) | ✅ (all) |
| Submit solution (file attachment + text) | ✅ | ❌ | ❌ |
| View student submissions | ❌ | ✅ (own course) | ✅ (all) |
| Grade submission (assign marks + feedback) | ❌ | ✅ (own course) | ✅ (all) |
| View received marks & feedback remarks | ✅ (own) | ✅ | ✅ |
| **Study Materials** |
| Download & view study materials | ✅ | ✅ | ✅ |
| Upload lecture notes / slides / PDFs | ❌ | ✅ | ✅ |
| Delete study materials | ❌ | ✅ (own) | ✅ (all) |
| **Announcements** |
| Read announcements | ✅ | ✅ | ✅ |
| Publish course / department announcement | ❌ | ✅ | ✅ |
| Publish university-wide announcement | ❌ | ❌ | ✅ |
| Delete announcement | ❌ | ✅ (own) | ✅ (all) |
| **Timetable & Scheduling** |
| View personal timetable (enrolled classes) | ✅ | ❌ | ❌ |
| View faculty timetable (assigned classes) | ❌ | ✅ | ❌ |
| View master timetable (all courses) | ❌ | ❌ | ✅ |
| Create / Modify timetable slots | ❌ | ❌ | ✅ |
| Delete timetable slots | ❌ | ❌ | ✅ |
| **Internal Messaging** |
| Initiate message to teacher | ✅ | ✅ | ✅ |
| Initiate message to student | ✅ | ✅ | ✅ |
| Initiate message to administrator | ✅ | ✅ | ✅ |
| View personal message threads | ✅ | ✅ | ✅ |
| **Events & Activities** |
| View upcoming university events | ✅ | ✅ | ✅ |
| RSVP / Mark attendance interest | ✅ | ✅ | ✅ |
| Create new campus event | ❌ | ✅ | ✅ |
| Edit / Delete campus event | ❌ | ✅ (own) | ✅ (all) |
| **Notifications** |
| Receive role-relevant alerts | ✅ | ✅ | ✅ |
| Clear / Mark notifications as read | ✅ | ✅ | ✅ |

---

## 3. Security & Enforcement Mechanisms

1. **Frontend Route Guards**: The sidebar navigation dynamically renders only permissible links. If a student attempts to navigate directly to an administrative route, the router redirects them back to their assigned dashboard.
2. **Backend IPC Channel Validation**: All IPC channels verifying data mutations validate the caller's session role before executing SQL statements. For example, `assignments:grade` verifies that the requesting user has the `teacher` or `admin` role and is authorized to grade the specific course.
3. **Foreign Key Integrity**: Operations on course submissions enforce student-specific identity matching so students can never tamper with or view peer submissions.

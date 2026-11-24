# UniConnect – Product Specification Document

## 1. Executive Summary

**UniConnect** is a comprehensive, standalone desktop software application engineered specifically for universities, colleges, and academic institutions. Its primary mission is to unify the academic ecosystem into a centralized digital hub connecting **Students**, **Teachers/Faculty**, and **Academic Administrators**.

By bringing together academic record-keeping, course management, assignment delivery, grading workflows, resource distribution, scheduling, communication, and event management into one desktop client, UniConnect eliminates the latency, confusion, and security risks associated with juggling fragmented web applications.

---

## 2. Product Objectives & Target Audience

### 2.1 Objectives
1. **Consolidated Academic Hub**: Replace disparate tools (email, messaging apps, legacy LMS, physical noticeboards) with a single unified desktop interface.
2. **Deterministic Reliability & Offline Readiness**: Store data in a robust local SQLite database ensuring uninterrupted local operations, rapid data queries, and persistent state.
3. **Streamlined Academic Lifecycle**: Enable faculty to distribute coursework, track submissions, and release grades with actionable feedback in minutes.
4. **Enhanced Communication**: Provide direct, monitored communication channels between faculty and students without exposing private contact info.
5. **Operational Efficiency for Administrators**: Provide high-level university dashboards, department governance, course allocations, and global broadcasting tools.

### 2.2 Target Audience
- **University Students**: Enrolled in undergraduate and postgraduate programs seeking a clean, intuitive platform to track deadlines, courses, notes, and schedules.
- **Faculty / Teachers / Professors**: Academic staff managing multiple course cohorts, delivering lecture materials, grading assignments, and tracking student submissions.
- **University Administrators / Registrars**: Academic leadership managing faculty allocations, department structures, student enrollments, timetable schedules, and campus announcements.

---

## 3. System Architecture & Technical Specifications

```mermaid
flowchart TD
    subgraph Windows_Desktop [Windows Desktop Environment]
        subgraph Electron_Main [Electron Main Process]
            MainTS["main.ts (Lifecycle & Window)"]
            IPC_Router["IPC Handler Router"]
            DB_Service["SQLite Database Service (sql.js / fs)"]
            File_Storage["Local Storage Manager (%APPDATA%)"]
            
            MainTS --> IPC_Router
            IPC_Router --> DB_Service
            IPC_Router --> File_Storage
        end
        
        subgraph Preload_Boundary [Preload Context Isolation Bridge]
            PreloadTS["preload.ts (contextBridge.exposeInMainWorld)"]
        end
        
        subgraph React_Renderer [React Renderer Process (UI)]
            AppRoot["React 18 Root (App.tsx)"]
            AuthCtx["Auth & Session Context"]
            Router["View & Role Router"]
            Modules["Core Functional Modules (12 Modules)"]
            Tailwind["Tailwind CSS & Lucide Icons"]
            
            AppRoot --> AuthCtx
            AppRoot --> Router
            Router --> Modules
            Modules --> Tailwind
        end
    end
    
    React_Renderer <-->|window.api (Safe IPC)| Preload_Boundary
    Preload_Boundary <-->|ipcRenderer / ipcMain| Electron_Main
    DB_Service <-->|Read / Write| Disk_DB[("uniconnect.sqlite (Persistent Disk Storage)")]
    File_Storage <-->|Uploads / Downloads| Disk_Files[("App Data / Uploads")]
```

### 3.1 Architecture Highlights
- **Context Isolation & Security**: `contextIsolation: true`, `nodeIntegration: false`, and `sandbox: false` (to allow preload bridge). Database calls are strictly handled via IPC, preventing SQL injection from renderer or direct raw execution.
- **Persistent Local Database**: Utilizes an embedded SQLite database persisted into the Windows `%APPDATA%\uniconnect\uniconnect.sqlite` directory.
- **Type-Safe IPC Contracts**: All data transfer objects (DTOs), queries, and mutations are defined in shared TypeScript interfaces.
- **Fast Development & Production Builds**: Vite provides instant hot-module replacement (HMR), while Electron Builder packages the output into a Windows NSIS installer.

---

## 4. Module-by-Module Functional Specifications

### 4.1 Module 1: Authentication & Access Control
- **Functional Requirements**:
  - Secure credential-based login supporting email and password authentication.
  - Registration form allowing new users to sign up, select their academic role (Student, Teacher, Admin), and choose their department.
  - Password hashing simulation using industry standard salt-hashing algorithms before storing into SQLite.
  - Role-based routing: Immediately after login, redirects the user to their designated dashboard with role-specific navigation privileges.
  - Session persistence: User session is cached in local storage so application reopens do not force repeated logins unless explicitly logged out.
  - Comprehensive input validation: Email format checks, password length criteria, mandatory fields, and friendly inline error feedback.

### 4.2 Module 2: Role-Based Dashboards
- **Student Dashboard**:
  - Personalized welcome banner showing student name, department, and semester.
  - Quick metric cards: Enrolled Courses, Pending Assignments, Today's Classes, Unread Messages.
  - Urgent Deadlines widget displaying assignments due within the next 48 hours with direct submission shortcuts.
  - Today's Timetable preview card showing upcoming classes, instructors, and rooms.
  - Latest University Announcements feed.
- **Teacher Dashboard**:
  - Overview cards: Active Courses, Total Students Enrolled, Pending Submissions to Grade, Published Materials.
  - Quick Action shortcuts: "Create Assignment", "Upload Study Material", "Post Announcement".
  - Recent Submissions table awaiting grading with quick grade modal trigger.
  - Upcoming class schedule for the current day.
- **Administrator Dashboard**:
  - University overview metrics: Total Students, Total Faculty, Total Departments, Active Courses.
  - Department distribution chart and system activity summary.
  - Quick management links: "Add Student", "Add Course", "Broadcast Announcement", "Create Event".
  - Recent system-wide audit activity log.

### 4.3 Module 3: Student Management
- **Functional Requirements**:
  - Comprehensive student directory viewable by Administrators.
  - Student profile fields: Student ID/Roll number, Full Name, Email, Department, Current Semester, Degree Program, Phone Number, Enrollment Date, and Status (Active/Inactive).
  - Search and filter students by department, semester, and name/ID.
  - Modal workflows for: Adding a new student, editing an existing student record, and removing/deactivating a student with confirmation.
  - Students can view their personal academic record, enrolled subjects, and credit progress in their Profile/Academics tab.

### 4.4 Module 4: Course & Subject Management
- **Functional Requirements**:
  - Course metadata: Course Code (e.g., `CS-301`), Course Title, Credit Hours, Department, Assigned Teacher, Semester, Syllabus Description, and Enrolled Count.
  - Administrator capabilities: Create new courses, assign faculty instructors, update course details, and delete courses.
  - Teacher view: View assigned teaching courses, list of enrolled students, course syllabus, and shortcuts to associated assignments/materials.
  - Student view: Browse enrolled courses, view syllabus details, instructor contact info, and course progress.

### 4.5 Module 5: Assignment Management & Grading Hub
- **Teacher Capabilities**:
  - Create new assignments: Title, description/instructions, target course, due date & time, maximum marks, and optional attachment file.
  - Edit or delete published assignments.
  - Submissions review panel: Filter submissions by course and assignment, view student submission timestamp, read submission text or download attached file, enter numeric marks, and provide written feedback.
  - Status indicators: Pending, Submitted, Graded, Overdue.
- **Student Capabilities**:
  - Browse assignments organized by: All, Pending, Submitted, and Graded.
  - Detailed assignment view with instructions, due date countdown, and max points.
  - File submission dialog: Attach solution documents (PDF, DOCX, ZIP, code files) and optional comments/submission notes.
  - View published marks, percentage, and instructor feedback remarks.

### 4.6 Module 6: Study Resources & Digital Library
- **Functional Requirements**:
  - Teachers can upload study materials tagged with: Title, Description, Course, Document Type (Lecture Notes, Slide Deck, Reference PDF, Code Archive), and File Attachment.
  - Filterable resource catalog: Search by title, filter by course or material type.
  - File metadata display: File name, file size (formatted in KB/MB), upload date, and instructor name.
  - Download functionality: One-click download or open file locally.
  - Admin/Teacher delete capability for obsolete materials.

### 4.7 Module 7: University Announcements
- **Functional Requirements**:
  - Publishing authority: Administrators (university-wide or targeted) and Teachers (course/department specific).
  - Announcement fields: Title, rich text description, priority level (Urgent/High, Information/Normal, Low), target audience (All University, Students Only, Faculty Only), author name, and publication date.
  - Searchable and categorized announcement feed with priority badges and unread indicator.
  - Edit and delete controls for authors and administrators.

### 4.8 Module 8: Timetable & Schedule Management
- **Functional Requirements**:
  - Structured weekly schedule view spanning Monday through Friday (or Saturday).
  - Schedule item attributes: Course Code, Course Title, Teacher/Instructor, Classroom/Laboratory Room number, Day of Week, Start Time, and End Time.
  - Filterable by department, semester, and teacher.
  - Administrator creation & update modal: Conflict prevention checking (room and teacher availability).
  - Student view: Auto-filtered to only display classes for their enrolled courses.
  - Teacher view: Auto-filtered to display their teaching commitments for the week.

### 4.9 Module 9: Internal Communication & Direct Messaging
- **Functional Requirements**:
  - In-app 1-on-1 messaging interface between Students and Teachers, and among Students/Faculty.
  - Conversation list showing contacts, last message snippet, timestamp, and unread count badge.
  - Real-time message thread view with sent/received speech bubble distinction and precise time stamps.
  - Search conversation by participant name.
  - New conversation modal: Quickly start a chat with any teacher, classmate, or administrator.
  - Message persistence in SQLite database.

### 4.10 Module 10: Events & Campus Activities
- **Functional Requirements**:
  - University calendar and event listing: Academic seminars, club activities, sports matches, workshops, and exam schedules.
  - Event details: Title, description, date, start time, end time, venue/location, category (Academic, Cultural, Sports, Career), and organizing department.
  - Administrators and Faculty can create, edit, and delete events.
  - Students can view upcoming events, filter by category, and mark attendance/RSVP interest.

### 4.11 Module 11: Notification Center
- **Functional Requirements**:
  - Global notification bell in Top Navigation Bar with live unread counter badge.
  - Interactive notification dropdown drawer showing recent events:
    - New assignment published.
    - Assignment graded with score.
    - New university announcement posted.
    - Incoming message received.
    - Upcoming deadline within 24 hours.
  - One-click "Mark All as Read" and item dismissal.
  - Direct deep-linking: Clicking a notification navigates straight to the relevant module/item.

### 4.12 Module 12: User Profile & Application Settings
- **Functional Requirements**:
  - User profile overview: Avatar photo, full name, email, role, department, semester (for students), contact phone, and join date.
  - Edit profile modal: Update contact number, bio, and change avatar avatar/presets.
  - Security settings: Password update with current password validation and new password confirmation.
  - App preferences: Notification toggles (Assignments, Messages, Announcements), UI density options, and clean desktop logout.

---

## 5. Non-Functional Requirements

### 5.1 Performance & Responsiveness
- Instantaneous screen transitions with zero screen flickering.
- Sub-50ms query response time on local SQLite database operations.
- Application cold boot under 2 seconds on modern Windows machines.

### 5.2 Reliability & Data Integrity
- Atomic transactions for multi-record operations (e.g., student enrollment, assignment submission).
- Foreign key constraints enforced on all relational tables with cascade rules where appropriate.
- Automatic database backup and state synchronization on application exit.

### 5.3 Security & Compliance
- Passwords stored as cryptographically hashed digests; plain-text passwords never persisted or logged.
- Strict IPC whitelisting: The renderer cannot execute arbitrary shell commands or direct SQL strings.
- File upload sanitization: Uploaded assets are organized in safe app data subdirectories with normalized filenames.

### 5.4 Usability & Aesthetics
- Clean SaaS aesthetic following modern design standards (rounded cards, soft shadows, clear visual hierarchy).
- Responsive window resizing: Adapts seamlessly to 1280x720, 1920x1080, and high-DPI scaling.
- Accessible color contrasts compliant with WCAG AA guidelines.

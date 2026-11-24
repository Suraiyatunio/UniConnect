# UniConnect – Feature Specifications & User Flow Documentation

This document specifies all features implemented in **UniConnect**, their operational mechanics, role-based availability, and end-to-end user journeys.

---

## 1. Feature Availability Matrix

The matrix below maps application features against user permissions for **Students**, **Teachers**, and **Administrators**:

| Feature / Capability | Student | Teacher | Administrator | Description |
| :--- | :---: | :---: | :---: | :--- |
| **Authentication & Profile** |
| Register new account | ✅ | ✅ | ✅ | Create new profile with role, email, and password |
| Login & Session persistence | ✅ | ✅ | ✅ | Access platform and stay logged in across app launches |
| View & Edit personal profile | ✅ | ✅ | ✅ | Edit phone, bio, and choose avatar |
| Change account password | ✅ | ✅ | ✅ | Secure password change with verification |
| **Dashboard** |
| Role-specific KPI metrics | ✅ | ✅ | ✅ | View tailored statistics based on role |
| Schedule & Deadlines preview | ✅ | ✅ | ❌ | Preview classes and upcoming tasks |
| System activity overview | ❌ | ❌ | ✅ | University-wide summary statistics |
| **Student Management** |
| View student directory | ❌ | Partial | ✅ | View enrolled students vs. global student registry |
| Add / Edit / Remove students | ❌ | ❌ | ✅ | Full CRUD operations on student profiles |
| View own academic record | ✅ | ❌ | ❌ | View semester, program, and enrolled credits |
| **Course Management** |
| Browse enrolled courses | ✅ | ❌ | ❌ | View course details, instructor, and syllabus |
| Manage assigned courses | ❌ | ✅ | ❌ | View courses taught and student rosters |
| Create / Edit / Delete courses | ❌ | ❌ | ✅ | Global course catalog management |
| Assign teachers to courses | ❌ | ❌ | ✅ | Associate faculty members with courses |
| **Assignments & Grading** |
| View course assignments | ✅ | ✅ | ✅ | Browse assignments filtered by course |
| Create / Edit assignments | ❌ | ✅ | ✅ | Publish assignments with deadline and points |
| Submit assignment solution | ✅ | ❌ | ❌ | Submit answer text and attach solution files |
| Grade submissions & feedback | ❌ | ✅ | ✅ | Input numeric score and evaluation feedback |
| View grades & remarks | ✅ | ✅ | ✅ | Review released scores and instructor feedback |
| **Study Resources** |
| Browse & download resources | ✅ | ✅ | ✅ | Access lecture slides, notes, PDFs, and guides |
| Upload new study materials | ❌ | ✅ | ✅ | Upload documents tagged with course and type |
| Delete study materials | ❌ | ✅ (own) | ✅ (all) | Remove outdated or incorrect documents |
| **Announcements** |
| Read announcements | ✅ | ✅ | ✅ | View broadcasts with priority badges |
| Publish announcements | ❌ | ✅ (dept) | ✅ (global) | Broadcast urgent notices to audience groups |
| Delete announcements | ❌ | ✅ (own) | ✅ (all) | Revoke published announcements |
| **Timetable & Scheduling** |
| View weekly timetable | ✅ (enrolled) | ✅ (teaching) | ✅ (full) | Interactive weekly matrix of classes |
| Add / Edit timetable slots | ❌ | ❌ | ✅ | Configure day, room, instructor, and time slot |
| Conflict detection | ❌ | ❌ | ✅ | Prevent double-booking rooms or instructors |
| **Internal Messaging** |
| Send & receive 1-on-1 messages | ✅ | ✅ | ✅ | Communicate with students, teachers, and admins |
| Search conversations | ✅ | ✅ | ✅ | Filter chat threads by contact name |
| Real-time unread badges | ✅ | ✅ | ✅ | Instant visual notification for new messages |
| **Events & Activities** |
| View university events | ✅ | ✅ | ✅ | Browse upcoming seminars, sports, and workshops |
| Create / Manage events | ❌ | ✅ | ✅ | Schedule events with venue and organizer details |
| RSVP / Mark interest | ✅ | ✅ | ✅ | Indicate intention to attend campus events |
| **Notification Center** |
| In-app notification feed | ✅ | ✅ | ✅ | Real-time alerts for academic updates |
| Mark notifications read | ✅ | ✅ | ✅ | Dismiss or clear all unread alerts |

---

## 2. End-to-End User Workflows

### 2.1 Workflow A: Assignment Lifecycle (Publish -> Submit -> Grade)

```mermaid
sequenceDiagram
    autonumber
    actor Teacher as Faculty (Prof. Eleanor)
    actor Student as Student (Alex Johnson)
    participant App as UniConnect Desktop
    participant DB as SQLite Database

    Teacher->>App: Clicks "Create Assignment" on Course CS-301
    Teacher->>App: Fills Title, Deadline (Friday 23:59), Max Score (100) & Attaches Spec PDF
    App->>DB: INSERT INTO assignments (...)
    DB-->>App: Success Confirmation
    App->>DB: INSERT INTO notifications (target=students enrolled in CS-301)
    
    Student->>App: Logs in / Opens Assignments Module
    App->>DB: SELECT * FROM assignments WHERE course_id IN (...)
    DB-->>Student: Displays "CS-301: Final Project" with countdown badge
    Student->>App: Clicks "Submit Assignment", attaches `Project_Code.zip`, inputs comments
    App->>DB: INSERT INTO submissions (assignment_id, student_id, file_path, status='Submitted')
    App-->>Student: Toast "Assignment submitted successfully!"
    
    Teacher->>App: Opens Assignment Review Panel
    App->>DB: SELECT * FROM submissions WHERE assignment_id = ...
    Teacher->>App: Inspects submission, inputs Marks: 95, Feedback: "Excellent architecture!"
    Teacher->>App: Clicks "Release Grade"
    App->>DB: UPDATE submissions SET marks=95, feedback=..., status='Graded'
    App->>DB: INSERT INTO notifications (user_id=Alex, "Your assignment was graded: 95/100")
    
    Student->>App: Receives notification bell badge, views 95/100 score and instructor feedback
```

---

### 2.2 Workflow B: Course & Timetable Configuration by Administrator

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Administrator (Dr. Vance)
    participant UI as UniConnect UI
    participant Backend as Electron IPC & Database

    Admin->>UI: Navigates to "Course Management"
    Admin->>UI: Clicks "Add New Course" (e.g., CS-402 Cloud Computing)
    Admin->>UI: Assigns Teacher: Prof. Eleanor, Credits: 4, Dept: Computer Science
    UI->>Backend: invoke('courses:create', courseData)
    Backend-->>UI: Course created and saved to database
    
    Admin->>UI: Navigates to "Timetable Management"
    Admin->>UI: Clicks "Add Timetable Slot"
    Admin->>UI: Selects CS-402, Day: Tuesday, Time: 10:00 - 11:30, Room: Lab 3
    UI->>Backend: invoke('timetable:create', slotData)
    Backend-->>UI: Schedule persisted
    UI-->>Admin: Visual slot appears on Tuesday grid
```

---

### 2.3 Workflow C: Peer & Faculty Messaging

```mermaid
sequenceDiagram
    autonumber
    actor Student as Student (Alex)
    actor Teacher as Teacher (Prof. Eleanor)
    participant UI as UniConnect UI
    participant DB as SQLite Database

    Student->>UI: Opens Messages tab, clicks "New Chat"
    Student->>UI: Selects Prof. Eleanor Hayes from contact directory
    Student->>UI: Types "Hello Professor, could we clarify requirement 3 of the project?"
    UI->>DB: INSERT INTO messages (sender_id, receiver_id, content, created_at)
    UI-->>Student: Message rendered in blue speech bubble with "Sent" status
    
    Teacher->>UI: Opens UniConnect Messages tab
    UI->>DB: SELECT * FROM messages WHERE receiver_id = Eleanor
    DB-->>UI: Returns thread with unread indicator
    Teacher->>UI: Types "Sure Alex, requirement 3 allows using either SQL or NoSQL."
    UI->>DB: INSERT INTO messages (...)
    UI-->>Teacher: Message sent
    Student->>UI: Thread updates with professor's response
```

---

## 3. Detailed Acceptance Criteria

To ensure reliable, professional desktop software, every interactive component adheres to strict criteria:

1. **Authentication**:
   - Empty email or password triggers immediate inline validation without backend calls.
   - Invalid credentials display friendly error alerts ("Invalid email or password").
   - Successful login seamlessly transitions to the designated dashboard with zero latency.
2. **Data Mutations (CRUD)**:
   - Creating a record (course, assignment, announcement, event) immediately updates the active UI table/grid without requiring an app reload.
   - Deleting a record always prompts a modal confirmation ("Are you sure you want to delete this course? This action cannot be undone.").
   - Editing preserves unchanged values and immediately reflects updated attributes.
3. **File Management**:
   - File attachment dialogs accept standard file types (`.pdf`, `.docx`, `.pptx`, `.zip`, `.png`, `.jpg`).
   - Uploaded files are copied into the persistent application directory and can be opened or downloaded anytime.
4. **Search & Filters**:
   - Real-time search bars instantly filter table rows and card lists as the user types.
   - Multi-criteria dropdowns (e.g., Filter by Department + Semester) function concurrently.

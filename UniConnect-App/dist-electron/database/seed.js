"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDatabase = void 0;
const seedDatabase = (db) => {
    // Check if users already exist
    const res = db.exec("SELECT COUNT(*) as cnt FROM users");
    if (res.length > 0 && res[0].values[0][0] > 0) {
        return; // already seeded
    }
    // 1. Departments
    db.run(`
    INSERT INTO departments (id, code, name, description, head_of_dept) VALUES
    ('dept-1', 'CS', 'Computer Science', 'Department of Computer Science & Information Technology', 'Dr. Alan Turing'),
    ('dept-2', 'SE', 'Software Engineering', 'Department of Software Engineering and Quality Assurance', 'Dr. Margaret Hamilton'),
    ('dept-3', 'EE', 'Electrical Engineering', 'Department of Electrical & Computer Engineering', 'Dr. Nikola Tesla'),
    ('dept-4', 'BBA', 'Business Administration', 'School of Business & Management Sciences', 'Dr. Peter Drucker');
  `);
    // 2. Users (Admin, Teachers, Students)
    // Simple deterministic hash simulation: 'hashed_' + password
    const hash = (pwd) => 'hashed_' + pwd;
    db.run(`
    INSERT INTO users (id, email, password_hash, full_name, role, avatar_url, phone, department_id, student_id, semester, program, bio) VALUES
    (1, 'admin@uniconnect.edu', '${hash('Admin@123')}', 'Dr. Arthur Vance', 'admin', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', '+1 (555) 019-2834', 'dept-1', NULL, NULL, NULL, 'University Academic Registrar & Systems Administrator'),
    (2, 'teacher@uniconnect.edu', '${hash('Teacher@123')}', 'Prof. Eleanor Hayes', 'teacher', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', '+1 (555) 012-4920', 'dept-1', NULL, NULL, NULL, 'Professor of Computer Science & Algorithms Specialist'),
    (3, 'prof.marcus@uniconnect.edu', '${hash('Teacher@123')}', 'Prof. Marcus Brody', 'teacher', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', '+1 (555) 018-9321', 'dept-1', NULL, NULL, NULL, 'Associate Professor in Database Systems & Distributed Architecture'),
    (4, 'student@uniconnect.edu', '${hash('Student@123')}', 'Alex Johnson', 'student', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', '+1 (555) 017-8821', 'dept-1', 'STD-2024-001', 5, 'BS Computer Science', 'Senior student focusing on Systems Programming and Cloud Computing.'),
    (5, 'sarah@uniconnect.edu', '${hash('Student@123')}', 'Sarah Miller', 'student', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', '+1 (555) 014-7712', 'dept-2', 'STD-2024-042', 3, 'BS Software Engineering', 'Software engineering sophomore passionate about UI/UX and Full Stack Web.'),
    (6, 'david@uniconnect.edu', '${hash('Student@123')}', 'David Kim', 'student', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', '+1 (555) 016-3390', 'dept-1', 'STD-2024-089', 5, 'BS Computer Science', 'Passionate about distributed algorithms, robotics, and cyber security.');
  `);
    // 3. Courses
    db.run(`
    INSERT INTO courses (id, code, title, description, credits, department_id, teacher_id, semester) VALUES
    ('crs-101', 'CS-301', 'Data Structures & Algorithms', 'In-depth study of asymptotic complexity, trees, graphs, greedy algorithms, and dynamic programming.', 4, 'dept-1', 2, 5),
    ('crs-102', 'CS-402', 'Cloud Computing & DevOps', 'Architecting resilient cloud native applications using Docker, Kubernetes, CI/CD, and microservices.', 3, 'dept-1', 2, 5),
    ('crs-103', 'CS-204', 'Database Systems', 'Relational database design, relational algebra, SQL optimization, transactions, and ACID guarantees.', 3, 'dept-1', 3, 5),
    ('crs-104', 'SE-310', 'Software Architecture', 'Design patterns, component-based engineering, micro-frontends, and enterprise software architecture.', 3, 'dept-2', 2, 3),
    ('crs-105', 'EE-101', 'Digital Logic Design', 'Boolean algebra, combinational circuits, sequential flip-flops, state machines, and FPGA basics.', 4, 'dept-3', 3, 1);
  `);
    // 4. Enrollments (Alex & Sarah)
    db.run(`
    INSERT INTO enrollments (id, student_id, course_id, status) VALUES
    ('enr-1', 4, 'crs-101', 'active'),
    ('enr-2', 4, 'crs-102', 'active'),
    ('enr-3', 4, 'crs-103', 'active'),
    ('enr-4', 5, 'crs-101', 'active'),
    ('enr-5', 5, 'crs-104', 'active'),
    ('enr-6', 6, 'crs-101', 'active'),
    ('enr-7', 6, 'crs-102', 'active');
  `);
    // 5. Assignments
    db.run(`
    INSERT INTO assignments (id, course_id, teacher_id, title, description, deadline, max_points, attachment_name) VALUES
    ('asg-1', 'crs-101', 2, 'Assignment 3: Graph Traversal & Dijkstra Algorithm', 'Implement Dijkstra and A* graph search in TypeScript or Python. Include unit tests with edge cases.', datetime('now', '+3 days'), 100, 'Assignment_3_Specification.pdf'),
    ('asg-2', 'crs-102', 2, 'Project Milestone 2: Docker Containerization', 'Containerize a 3-tier web application using multi-stage Dockerfiles and deploy using Docker Compose.', datetime('now', '+5 days'), 100, 'DevOps_Milestone2_Guide.pdf'),
    ('asg-3', 'crs-103', 3, 'Case Study: Database Normalization to BCNF', 'Analyze the provided legacy hospital management schema and normalize to Boyce-Codd Normal Form.', datetime('now', '-2 days'), 100, 'Legacy_Hospital_Schema.pdf');
  `);
    // 6. Submissions
    db.run(`
    INSERT INTO submissions (id, assignment_id, student_id, submission_text, file_name, marks, feedback, status, submitted_at, graded_at) VALUES
    ('sub-1', 'asg-3', 4, 'Attached complete relational decomposition and functional dependency proofs up to BCNF.', 'Alex_Johnson_BCNF_Normalization.pdf', 94, 'Superb work Alex! Clear functional dependency analysis and clean decomposition.', 'Graded', datetime('now', '-3 days'), datetime('now', '-1 day')),
    ('sub-2', 'asg-1', 4, 'Completed implementation of Dijkstra and A* pathfinding with 100% test coverage.', 'Alex_Johnson_HW3_Graphs.zip', NULL, NULL, 'Submitted', datetime('now', '-1 hour'), NULL);
  `);
    // 7. Study Materials
    db.run(`
    INSERT INTO study_materials (id, course_id, teacher_id, title, description, file_type, file_path, file_name, file_size) VALUES
    ('mat-1', 'crs-101', 2, 'Lecture 08: Graph Algorithms & Minimum Spanning Trees', 'Comprehensive slides covering Prim and Kruskal MST algorithms.', 'Slides', 'lecture_08_graphs.pptx', 'Lecture_08_Graphs.pptx', 4500000),
    ('mat-2', 'crs-101', 2, 'Algorithm Complexity Cheat Sheet', 'Quick reference for Big-O complexities of standard sorting and search algorithms.', 'PDF', 'big_o_cheatsheet.pdf', 'Big_O_CheatSheet.pdf', 850000),
    ('mat-3', 'crs-102', 2, 'Container Architecture & Kubernetes Fundamentals', 'Official lecture notes on container namespaces, cgroups, and pod topologies.', 'PDF', 'k8s_architecture_guide.pdf', 'K8s_Architecture_Guide.pdf', 6200000),
    ('mat-4', 'crs-103', 3, 'Relational Algebra & Advanced SQL Query Optimization', 'Detailed notes on query execution plans, indexes, and B-Tree indexing.', 'Document', 'advanced_sql_optimization.docx', 'Advanced_SQL_Optimization.docx', 1200000);
  `);
    // 8. Announcements
    db.run(`
    INSERT INTO announcements (id, title, content, author_id, target_audience, priority, created_at) VALUES
    ('anc-1', 'Fall Semester 2026 Midterm Examination Schedule', 'The official examination timetable for Fall 2026 is now finalized. Midterm week will commence from Monday, December 15th. Check individual course pages for exact hall allocations.', 1, 'all', 'Urgent', datetime('now', '-2 days')),
    ('anc-2', 'UniConnect 48-Hour Annual Hackathon Registration Open', 'Registrations for the University Annual Hackathon are officially open. Form teams of 3 to 4 students. Great prizes, industry mentors, and internship opportunities await!', 1, 'students', 'Normal', datetime('now', '-4 days')),
    ('anc-3', 'Faculty Research & Curriculum Development Meeting', 'There will be a mandatory faculty symposium this Thursday at 3:00 PM in the Faculty Council Boardroom to discuss new AI electives.', 1, 'teachers', 'Normal', datetime('now', '-5 days'));
  `);
    // 9. Timetable
    db.run(`
    INSERT INTO timetables (id, course_id, teacher_id, day_of_week, start_time, end_time, room) VALUES
    ('tt-1', 'crs-101', 2, 'Monday', '09:00', '10:30', 'Room 302 (Auditorium A)'),
    ('tt-2', 'crs-103', 3, 'Monday', '11:00', '12:30', 'Room 105 (Science Wing)'),
    ('tt-3', 'crs-102', 2, 'Tuesday', '10:00', '11:30', 'Lab 4 (Cloud Systems Lab)'),
    ('tt-4', 'crs-101', 2, 'Wednesday', '09:00', '10:30', 'Room 302 (Auditorium A)'),
    ('tt-5', 'crs-104', 2, 'Wednesday', '13:00', '14:30', 'Room 208 (Software Lab)'),
    ('tt-6', 'crs-102', 2, 'Thursday', '14:00', '15:30', 'Lab 4 (Cloud Systems Lab)'),
    ('tt-7', 'crs-103', 3, 'Friday', '10:00', '11:30', 'Room 105 (Science Wing)');
  `);
    // 10. Messages
    db.run(`
    INSERT INTO messages (id, sender_id, receiver_id, content, is_read, created_at) VALUES
    ('msg-1', 2, 4, 'Hello Alex, great progress on your database normalization assignment. Remember that project milestone 2 is due Friday.', 1, datetime('now', '-1 day')),
    ('msg-2', 4, 2, 'Thank you Professor Hayes! I have completed the Docker containerization and will submit the project tonight.', 1, datetime('now', '-20 hours')),
    ('msg-3', 2, 4, 'Sounds fantastic! Let me know if you run into any multi-stage build issues.', 0, datetime('now', '-18 hours')),
    ('msg-4', 5, 4, 'Hey Alex, are we studying together for the algorithms exam this Wednesday?', 0, datetime('now', '-2 hours'));
  `);
    // 11. Events
    db.run(`
    INSERT INTO events (id, title, description, event_date, start_time, end_time, location, organizer_id, category) VALUES
    ('evt-1', 'UniHack 2026: 48-Hour Innovation Marathon', 'Join 300+ students building breakthrough AI, web3, and cloud applications with industry mentors.', '2026-12-05', '09:00', '18:00', 'Campus Innovation Center', 1, 'Academic'),
    ('evt-2', 'Fall Tech Career Fair & Industry Mixer', 'Meet top engineering recruiters from Google, Microsoft, Amazon, and leading startups hiring for internships.', '2026-12-10', '11:00', '16:00', 'University Main Gymnasium', 1, 'Career'),
    ('evt-3', 'Guest Lecture: Modern Microkernel Architectures', 'Distinguished lecture by leading operating systems architects exploring seL4 and formal verification.', '2026-12-14', '14:00', '16:00', 'Auditorium Hall B', 2, 'Academic');
  `);
    // 12. Notifications
    db.run(`
    INSERT INTO notifications (id, user_id, title, message, type, link, is_read, created_at) VALUES
    ('notif-1', 4, 'Grade Released', 'Prof. Marcus Brody published your grade for Case Study: Database Normalization (94/100).', 'grade', 'assignments', 0, datetime('now', '-1 day')),
    ('notif-2', 4, 'New Announcement', 'Midterm examination schedule for Fall 2026 has been published.', 'announcement', 'announcements', 0, datetime('now', '-2 days')),
    ('notif-3', 4, 'Assignment Reminder', 'Assignment 3: Graph Traversal is due in 3 days.', 'assignment', 'assignments', 1, datetime('now', '-3 days')),
    ('notif-4', 2, 'New Submission Received', 'Alex Johnson submitted Assignment 3: Graph Traversal.', 'assignment', 'assignments', 0, datetime('now', '-1 hour'));
  `);
};
exports.seedDatabase = seedDatabase;

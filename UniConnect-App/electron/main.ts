import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import fs from 'fs';
import { initDatabase, queryAll, queryOne, run, persistDatabase } from './database';

let mainWindow: BrowserWindow | null = null;
let currentSessionUser: any = null;

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1320,
    height: 840,
    minWidth: 1080,
    minHeight: 700,
    title: 'UniConnect – University Management & Student Collaboration',
    backgroundColor: '#0F172A',
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    // Open DevTools in dev mode if needed
    // mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App lifecycle
app.whenReady().then(async () => {
  try {
    await initDatabase();
    registerIpcHandlers();
    createWindow();
  } catch (err) {
    console.error('Initialization error:', err);
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  persistDatabase();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  persistDatabase();
});

// Register all IPC Handlers
function registerIpcHandlers() {
  // 1. Auth Handlers
  ipcMain.handle('auth:login', async (_, { email, password }) => {
    const user = queryOne<any>(
      `SELECT u.*, d.name as department_name, d.code as department_code 
       FROM users u 
       LEFT JOIN departments d ON u.department_id = d.id 
       WHERE u.email = ?`,
      [email]
    );

    if (!user) {
      return { success: false, error: 'User not found with this email' };
    }

    const expectedHash = 'hashed_' + password;
    if (user.password_hash !== expectedHash && user.password_hash !== password) {
      return { success: false, error: 'Incorrect password entered' };
    }

    // Clean user object (don't expose password hash)
    const { password_hash, ...safeUser } = user;
    currentSessionUser = safeUser;
    return { success: true, user: safeUser };
  });

  ipcMain.handle('auth:register', async (_, data) => {
    const existing = queryOne('SELECT id FROM users WHERE email = ?', [data.email]);
    if (existing) {
      return { success: false, error: 'An account with this email already exists' };
    }

    const passwordHash = 'hashed_' + data.password;
    const studentId = data.role === 'student' ? 'STD-' + Date.now().toString().slice(-6) : null;
    const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.fullName)}`;

    run(
      `INSERT INTO users (email, password_hash, full_name, role, avatar_url, phone, department_id, student_id, semester, program, bio)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.email,
        passwordHash,
        data.fullName,
        data.role,
        avatarUrl,
        data.phone || '',
        data.departmentId || 'dept-1',
        studentId,
        data.semester || 1,
        data.program || (data.role === 'student' ? 'BS Computer Science' : null),
        data.bio || '',
      ]
    );

    const newUser = queryOne<any>(
      `SELECT u.*, d.name as department_name, d.code as department_code 
       FROM users u 
       LEFT JOIN departments d ON u.department_id = d.id 
       WHERE u.email = ?`,
      [data.email]
    );

    const { password_hash, ...safeUser } = newUser;
    currentSessionUser = safeUser;
    return { success: true, user: safeUser };
  });

  ipcMain.handle('auth:logout', async () => {
    currentSessionUser = null;
    return { success: true };
  });

  ipcMain.handle('auth:getCurrentUser', async () => {
    return currentSessionUser;
  });

  // 2. Dashboard Handlers
  ipcMain.handle('dashboard:getStats', async (_, { role, userId }) => {
    if (role === 'student') {
      const coursesCount = queryOne<any>(
        'SELECT COUNT(*) as count FROM enrollments WHERE student_id = ? AND status = "active"',
        [userId]
      )?.count || 0;

      const pendingAssignmentsCount = queryOne<any>(
        `SELECT COUNT(*) as count FROM assignments a
         JOIN enrollments e ON a.course_id = e.course_id
         LEFT JOIN submissions s ON a.id = s.assignment_id AND s.student_id = ?
         WHERE e.student_id = ? AND (s.id IS NULL OR s.status = 'Late') AND a.deadline >= datetime('now')`,
        [userId, userId]
      )?.count || 0;

      const unreadMessagesCount = queryOne<any>(
        'SELECT COUNT(*) as count FROM messages WHERE receiver_id = ? AND is_read = 0',
        [userId]
      )?.count || 0;

      const urgentTasks = queryAll<any>(
        `SELECT a.*, c.title as course_title, c.code as course_code,
                s.status as submission_status, s.marks, s.feedback
         FROM assignments a
         JOIN courses c ON a.course_id = c.id
         JOIN enrollments e ON a.course_id = e.course_id
         LEFT JOIN submissions s ON a.id = s.assignment_id AND s.student_id = ?
         WHERE e.student_id = ? AND (s.id IS NULL OR s.status != 'Graded')
         ORDER BY a.deadline ASC LIMIT 4`,
        [userId, userId]
      );

      return {
        coursesCount,
        pendingAssignmentsCount,
        unreadMessagesCount,
        urgentTasks,
      };
    } else if (role === 'teacher') {
      const activeCoursesCount = queryOne<any>(
        'SELECT COUNT(*) as count FROM courses WHERE teacher_id = ?',
        [userId]
      )?.count || 0;

      const totalStudentsCount = queryOne<any>(
        `SELECT COUNT(DISTINCT e.student_id) as count FROM enrollments e
         JOIN courses c ON e.course_id = c.id
         WHERE c.teacher_id = ?`,
        [userId]
      )?.count || 0;

      const pendingGradingCount = queryOne<any>(
        `SELECT COUNT(*) as count FROM submissions s
         JOIN assignments a ON s.assignment_id = a.id
         WHERE a.teacher_id = ? AND s.status = 'Submitted'`,
        [userId]
      )?.count || 0;

      const studyMaterialsCount = queryOne<any>(
        'SELECT COUNT(*) as count FROM study_materials WHERE teacher_id = ?',
        [userId]
      )?.count || 0;

      const recentSubmissions = queryAll<any>(
        `SELECT s.*, a.title as assignment_title, c.code as course_code, u.full_name as student_name
         FROM submissions s
         JOIN assignments a ON s.assignment_id = a.id
         JOIN courses c ON a.course_id = c.id
         JOIN users u ON s.student_id = u.id
         WHERE a.teacher_id = ?
         ORDER BY s.submitted_at DESC LIMIT 5`,
        [userId]
      );

      return {
        activeCoursesCount,
        totalStudentsCount,
        pendingGradingCount,
        studyMaterialsCount,
        recentSubmissions,
      };
    } else {
      // Admin stats
      const totalStudents = queryOne<any>('SELECT COUNT(*) as count FROM users WHERE role = "student"')?.count || 0;
      const totalTeachers = queryOne<any>('SELECT COUNT(*) as count FROM users WHERE role = "teacher"')?.count || 0;
      const totalCourses = queryOne<any>('SELECT COUNT(*) as count FROM courses')?.count || 0;
      const totalDepartments = queryOne<any>('SELECT COUNT(*) as count FROM departments')?.count || 0;

      const departmentBreakdown = queryAll<any>(
        `SELECT d.name, d.code, COUNT(u.id) as student_count
         FROM departments d
         LEFT JOIN users u ON d.id = u.department_id AND u.role = 'student'
         GROUP BY d.id`
      );

      return {
        totalStudents,
        totalTeachers,
        totalCourses,
        totalDepartments,
        departmentBreakdown,
      };
    }
  });

  ipcMain.handle('dashboard:getTodaySchedule', async (_, { role, userId }) => {
    // Current day of week
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = days[new Date().getDay()] || 'Monday';

    if (role === 'student') {
      return queryAll<any>(
        `SELECT t.*, c.title as course_title, c.code as course_code, u.full_name as teacher_name
         FROM timetables t
         JOIN courses c ON t.course_id = c.id
         JOIN enrollments e ON c.id = e.course_id
         LEFT JOIN users u ON t.teacher_id = u.id
         WHERE e.student_id = ? AND (t.day_of_week = ? OR t.day_of_week = 'Monday')
         ORDER BY t.start_time ASC`,
        [userId, currentDay]
      );
    } else if (role === 'teacher') {
      return queryAll<any>(
        `SELECT t.*, c.title as course_title, c.code as course_code
         FROM timetables t
         JOIN courses c ON t.course_id = c.id
         WHERE t.teacher_id = ? AND (t.day_of_week = ? OR t.day_of_week = 'Monday')
         ORDER BY t.start_time ASC`,
        [userId, currentDay]
      );
    } else {
      return queryAll<any>(
        `SELECT t.*, c.title as course_title, c.code as course_code, u.full_name as teacher_name
         FROM timetables t
         JOIN courses c ON t.course_id = c.id
         LEFT JOIN users u ON t.teacher_id = u.id
         WHERE t.day_of_week = ? OR t.day_of_week = 'Monday'
         ORDER BY t.start_time ASC LIMIT 6`,
        [currentDay]
      );
    }
  });

  // 3. Student Management
  ipcMain.handle('students:getAll', async () => {
    return queryAll<any>(
      `SELECT u.id, u.email, u.full_name, u.role, u.avatar_url, u.phone, 
              u.student_id, u.semester, u.program, u.department_id,
              d.name as department_name, d.code as department_code,
              (SELECT COUNT(*) FROM enrollments e WHERE e.student_id = u.id) as enrolled_courses_count
       FROM users u
       LEFT JOIN departments d ON u.department_id = d.id
       WHERE u.role = 'student'
       ORDER BY u.id DESC`
    );
  });

  ipcMain.handle('students:create', async (_, data) => {
    const studentId = 'STD-' + Date.now().toString().slice(-6);
    const passwordHash = 'hashed_' + (data.password || 'Student@123');
    const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.fullName)}`;

    run(
      `INSERT INTO users (email, password_hash, full_name, role, avatar_url, phone, department_id, student_id, semester, program, bio)
       VALUES (?, ?, ?, 'student', ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.email,
        passwordHash,
        data.fullName,
        avatarUrl,
        data.phone || '',
        data.departmentId,
        studentId,
        data.semester || 1,
        data.program || 'BS Computer Science',
        data.bio || '',
      ]
    );
    return { success: true };
  });

  ipcMain.handle('students:update', async (_, data) => {
    run(
      `UPDATE users 
       SET full_name = ?, email = ?, phone = ?, department_id = ?, semester = ?, program = ?, updated_at = datetime('now')
       WHERE id = ?`,
      [data.fullName, data.email, data.phone, data.departmentId, data.semester, data.program, data.id]
    );
    return { success: true };
  });

  ipcMain.handle('students:delete', async (_, id) => {
    run('DELETE FROM users WHERE id = ? AND role = "student"', [id]);
    return { success: true };
  });

  // 4. Departments
  ipcMain.handle('departments:getAll', async () => {
    return queryAll<any>('SELECT * FROM departments ORDER BY name ASC');
  });

  // 5. Courses
  ipcMain.handle('courses:getAll', async (_, params) => {
    let sql = `
      SELECT c.*, d.name as department_name, d.code as department_code,
             u.full_name as teacher_name, u.email as teacher_email,
             (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id) as enrolled_count
      FROM courses c
      LEFT JOIN departments d ON c.department_id = d.id
      LEFT JOIN users u ON c.teacher_id = u.id
    `;
    const queryParams: any[] = [];

    if (params?.studentId) {
      sql += ` JOIN enrollments en ON c.id = en.course_id WHERE en.student_id = ? `;
      queryParams.push(params.studentId);
    } else if (params?.teacherId) {
      sql += ` WHERE c.teacher_id = ? `;
      queryParams.push(params.teacherId);
    }

    sql += ` ORDER BY c.code ASC `;
    return queryAll<any>(sql, queryParams);
  });

  ipcMain.handle('courses:create', async (_, data) => {
    const id = 'crs-' + Date.now().toString().slice(-6);
    run(
      `INSERT INTO courses (id, code, title, description, credits, department_id, teacher_id, semester)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, data.code, data.title, data.description || '', data.credits || 3, data.departmentId, data.teacherId || null, data.semester || 1]
    );
    return { success: true, id };
  });

  ipcMain.handle('courses:update', async (_, data) => {
    run(
      `UPDATE courses 
       SET code = ?, title = ?, description = ?, credits = ?, department_id = ?, teacher_id = ?, semester = ?
       WHERE id = ?`,
      [data.code, data.title, data.description, data.credits, data.departmentId, data.teacherId, data.semester, data.id]
    );
    return { success: true };
  });

  ipcMain.handle('courses:delete', async (_, id) => {
    run('DELETE FROM courses WHERE id = ?', [id]);
    return { success: true };
  });

  ipcMain.handle('courses:enroll', async (_, { studentId, courseId }) => {
    const existing = queryOne('SELECT id FROM enrollments WHERE student_id = ? AND course_id = ?', [studentId, courseId]);
    if (existing) return { success: false, error: 'Already enrolled in this course' };

    const id = 'enr-' + Date.now();
    run('INSERT INTO enrollments (id, student_id, course_id) VALUES (?, ?, ?)', [id, studentId, courseId]);
    return { success: true };
  });

  // 6. Assignments & Submissions
  ipcMain.handle('assignments:getAll', async (_, params) => {
    let sql = `
      SELECT a.*, c.title as course_title, c.code as course_code, u.full_name as teacher_name,
             (SELECT COUNT(*) FROM submissions s WHERE s.assignment_id = a.id) as submission_count
      FROM assignments a
      JOIN courses c ON a.course_id = c.id
      LEFT JOIN users u ON a.teacher_id = u.id
    `;
    const queryParams: any[] = [];

    if (params?.studentId) {
      sql = `
        SELECT a.*, c.title as course_title, c.code as course_code, u.full_name as teacher_name,
               s.id as submission_id, s.submission_text, s.file_name as submission_file,
               s.marks, s.feedback, s.status as submission_status, s.submitted_at
        FROM assignments a
        JOIN courses c ON a.course_id = c.id
        JOIN enrollments e ON a.course_id = e.course_id
        LEFT JOIN users u ON a.teacher_id = u.id
        LEFT JOIN submissions s ON a.id = s.assignment_id AND s.student_id = ?
        WHERE e.student_id = ?
      `;
      queryParams.push(params.studentId, params.studentId);
    } else if (params?.teacherId) {
      sql += ` WHERE a.teacher_id = ? `;
      queryParams.push(params.teacherId);
    }

    sql += ` ORDER BY a.deadline ASC `;
    const assignments = queryAll<any>(sql, queryParams);

    // If teacher or admin, also attach submissions array
    if (params?.teacherId || (!params?.studentId && !params?.teacherId)) {
      for (const asg of assignments) {
        asg.submissions = queryAll<any>(
          `SELECT s.*, u.full_name as student_name, u.email as student_email, u.student_id as student_roll
           FROM submissions s
           JOIN users u ON s.student_id = u.id
           WHERE s.assignment_id = ?
           ORDER BY s.submitted_at DESC`,
          [asg.id]
        );
      }
    }

    return assignments;
  });

  ipcMain.handle('assignments:create', async (_, data) => {
    const id = 'asg-' + Date.now().toString().slice(-6);
    run(
      `INSERT INTO assignments (id, course_id, teacher_id, title, description, deadline, max_points, attachment_name)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, data.courseId, data.teacherId, data.title, data.description, data.deadline, data.maxPoints || 100, data.attachmentName || null]
    );

    // Create notifications for enrolled students
    const enrolledStudents = queryAll<any>('SELECT student_id FROM enrollments WHERE course_id = ?', [data.courseId]);
    for (const student of enrolledStudents) {
      run(
        `INSERT INTO notifications (id, user_id, title, message, type, link)
         VALUES (?, ?, ?, ?, 'assignment', 'assignments')`,
        ['notif-' + Date.now() + '-' + student.student_id, student.student_id, 'New Assignment Posted', `New assignment "${data.title}" was posted.`]
      );
    }

    return { success: true, id };
  });

  ipcMain.handle('assignments:submit', async (_, data) => {
    const existing = queryOne('SELECT id FROM submissions WHERE assignment_id = ? AND student_id = ?', [data.assignmentId, data.studentId]);
    if (existing) {
      run(
        `UPDATE submissions 
         SET submission_text = ?, file_name = ?, submitted_at = datetime('now'), status = 'Submitted'
         WHERE id = ?`,
        [data.submissionText, data.fileName || null, (existing as any).id]
      );
      return { success: true };
    }

    const id = 'sub-' + Date.now().toString().slice(-6);
    run(
      `INSERT INTO submissions (id, assignment_id, student_id, submission_text, file_name, status)
       VALUES (?, ?, ?, ?, ?, 'Submitted')`,
      [id, data.assignmentId, data.studentId, data.submissionText, data.fileName || null]
    );

    // Notify teacher
    const asg = queryOne<any>('SELECT teacher_id, title FROM assignments WHERE id = ?', [data.assignmentId]);
    if (asg) {
      run(
        `INSERT INTO notifications (id, user_id, title, message, type, link)
         VALUES (?, ?, ?, ?, 'assignment', 'assignments')`,
        ['notif-' + Date.now(), asg.teacher_id, 'New Submission Received', `A student submitted work for "${asg.title}".`]
      );
    }

    return { success: true, id };
  });

  ipcMain.handle('assignments:grade', async (_, { submissionId, marks, feedback }) => {
    run(
      `UPDATE submissions 
       SET marks = ?, feedback = ?, status = 'Graded', graded_at = datetime('now')
       WHERE id = ?`,
      [marks, feedback, submissionId]
    );

    const sub = queryOne<any>(
      `SELECT s.student_id, a.title 
       FROM submissions s 
       JOIN assignments a ON s.assignment_id = a.id 
       WHERE s.id = ?`,
      [submissionId]
    );

    if (sub) {
      run(
        `INSERT INTO notifications (id, user_id, title, message, type, link)
         VALUES (?, ?, ?, ?, 'grade', 'assignments')`,
        ['notif-' + Date.now(), sub.student_id, 'Grade Released', `Your submission for "${sub.title}" was graded: ${marks} marks.`]
      );
    }

    return { success: true };
  });

  ipcMain.handle('assignments:delete', async (_, id) => {
    run('DELETE FROM assignments WHERE id = ?', [id]);
    return { success: true };
  });

  // 7. Study Materials
  ipcMain.handle('materials:getAll', async (_, params) => {
    let sql = `
      SELECT m.*, c.title as course_title, c.code as course_code, u.full_name as teacher_name
      FROM study_materials m
      JOIN courses c ON m.course_id = c.id
      LEFT JOIN users u ON m.teacher_id = u.id
    `;
    const queryParams: any[] = [];
    if (params?.courseId) {
      sql += ' WHERE m.course_id = ? ';
      queryParams.push(params.courseId);
    }
    sql += ' ORDER BY m.uploaded_at DESC ';
    return queryAll<any>(sql, queryParams);
  });

  ipcMain.handle('materials:upload', async (_, data) => {
    const id = 'mat-' + Date.now().toString().slice(-6);
    run(
      `INSERT INTO study_materials (id, course_id, teacher_id, title, description, file_type, file_path, file_name, file_size)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, data.courseId, data.teacherId, data.title, data.description || '', data.fileType || 'PDF', data.filePath || '', data.fileName, data.fileSize || 1024 * 500]
    );
    return { success: true, id };
  });

  ipcMain.handle('materials:delete', async (_, id) => {
    run('DELETE FROM study_materials WHERE id = ?', [id]);
    return { success: true };
  });

  // 8. Announcements
  ipcMain.handle('announcements:getAll', async (_, audience) => {
    let sql = `
      SELECT a.*, u.full_name as author_name, u.role as author_role
      FROM announcements a
      LEFT JOIN users u ON a.author_id = u.id
    `;
    const params: any[] = [];
    if (audience && audience !== 'all') {
      sql += ` WHERE a.target_audience = 'all' OR a.target_audience = ? `;
      params.push(audience);
    }
    sql += ` ORDER BY a.created_at DESC `;
    return queryAll<any>(sql, params);
  });

  ipcMain.handle('announcements:create', async (_, data) => {
    const id = 'anc-' + Date.now().toString().slice(-6);
    run(
      `INSERT INTO announcements (id, title, content, author_id, target_audience, priority)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, data.title, data.content, data.authorId, data.targetAudience || 'all', data.priority || 'Normal']
    );

    // Notify all or targeted users
    let userQuery = 'SELECT id FROM users';
    if (data.targetAudience === 'students') userQuery = 'SELECT id FROM users WHERE role = "student"';
    if (data.targetAudience === 'teachers') userQuery = 'SELECT id FROM users WHERE role = "teacher"';

    const usersToNotify = queryAll<any>(userQuery);
    for (const u of usersToNotify) {
      run(
        `INSERT INTO notifications (id, user_id, title, message, type, link)
         VALUES (?, ?, ?, ?, 'announcement', 'announcements')`,
        ['notif-' + Date.now() + '-' + u.id, u.id, 'Announcement: ' + data.title, data.content.slice(0, 100), 'announcement', 'announcements']
      );
    }

    return { success: true, id };
  });

  ipcMain.handle('announcements:delete', async (_, id) => {
    run('DELETE FROM announcements WHERE id = ?', [id]);
    return { success: true };
  });

  // 9. Timetable
  ipcMain.handle('timetable:getAll', async (_, params) => {
    let sql = `
      SELECT t.*, c.title as course_title, c.code as course_code, u.full_name as teacher_name
      FROM timetables t
      JOIN courses c ON t.course_id = c.id
      LEFT JOIN users u ON t.teacher_id = u.id
    `;
    const queryParams: any[] = [];
    if (params?.studentId) {
      sql += ` JOIN enrollments e ON c.id = e.course_id WHERE e.student_id = ? `;
      queryParams.push(params.studentId);
    } else if (params?.teacherId) {
      sql += ` WHERE t.teacher_id = ? `;
      queryParams.push(params.teacherId);
    }
    sql += ` ORDER BY CASE t.day_of_week 
             WHEN 'Monday' THEN 1 
             WHEN 'Tuesday' THEN 2 
             WHEN 'Wednesday' THEN 3 
             WHEN 'Thursday' THEN 4 
             WHEN 'Friday' THEN 5 
             WHEN 'Saturday' THEN 6 
             ELSE 7 END, t.start_time ASC `;
    return queryAll<any>(sql, queryParams);
  });

  ipcMain.handle('timetable:create', async (_, data) => {
    const id = 'tt-' + Date.now().toString().slice(-6);
    run(
      `INSERT INTO timetables (id, course_id, teacher_id, day_of_week, start_time, end_time, room)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, data.courseId, data.teacherId || null, data.dayOfWeek, data.startTime, data.endTime, data.room]
    );
    return { success: true, id };
  });

  ipcMain.handle('timetable:delete', async (_, id) => {
    run('DELETE FROM timetables WHERE id = ?', [id]);
    return { success: true };
  });

  // 10. Messages & Communication
  ipcMain.handle('messages:getContacts', async (_, currentUserId) => {
    const contacts = queryAll<any>(
      `SELECT u.id, u.full_name, u.email, u.role, u.avatar_url,
              (SELECT content FROM messages m 
               WHERE (m.sender_id = u.id AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = u.id)
               ORDER BY m.created_at DESC LIMIT 1) as last_message,
              (SELECT created_at FROM messages m 
               WHERE (m.sender_id = u.id AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = u.id)
               ORDER BY m.created_at DESC LIMIT 1) as last_message_time,
              (SELECT COUNT(*) FROM messages m 
               WHERE m.sender_id = u.id AND m.receiver_id = ? AND m.is_read = 0) as unread_count
       FROM users u
       WHERE u.id != ?
       ORDER BY last_message_time DESC NULLS LAST, u.full_name ASC`,
      [currentUserId, currentUserId, currentUserId, currentUserId, currentUserId, currentUserId]
    );
    return contacts;
  });

  ipcMain.handle('messages:getThread', async (_, { user1, user2 }) => {
    // Mark messages from user2 to user1 as read
    run('UPDATE messages SET is_read = 1 WHERE sender_id = ? AND receiver_id = ?', [user2, user1]);

    return queryAll<any>(
      `SELECT m.*, u.full_name as sender_name, u.avatar_url as sender_avatar
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE (m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?)
       ORDER BY m.created_at ASC`,
      [user1, user2, user2, user1]
    );
  });

  ipcMain.handle('messages:send', async (_, { senderId, receiverId, content }) => {
    const id = 'msg-' + Date.now().toString().slice(-6);
    run(
      'INSERT INTO messages (id, sender_id, receiver_id, content) VALUES (?, ?, ?, ?)',
      [id, senderId, receiverId, content]
    );

    // Notify receiver
    const sender = queryOne<any>('SELECT full_name FROM users WHERE id = ?', [senderId]);
    run(
      `INSERT INTO notifications (id, user_id, title, message, type, link)
       VALUES (?, ?, ?, ?, 'message', 'messages')`,
      ['notif-' + Date.now(), receiverId, 'New Message from ' + (sender?.full_name || 'User'), content.slice(0, 80)]
    );

    return { success: true, id };
  });

  // 11. Events
  ipcMain.handle('events:getAll', async () => {
    return queryAll<any>(
      `SELECT e.*, u.full_name as organizer_name
       FROM events e
       LEFT JOIN users u ON e.organizer_id = u.id
       ORDER BY e.event_date ASC, e.start_time ASC`
    );
  });

  ipcMain.handle('events:create', async (_, data) => {
    const id = 'evt-' + Date.now().toString().slice(-6);
    run(
      `INSERT INTO events (id, title, description, event_date, start_time, end_time, location, organizer_id, category)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, data.title, data.description, data.eventDate, data.startTime, data.endTime, data.location, data.organizerId || null, data.category || 'Academic']
    );
    return { success: true, id };
  });

  ipcMain.handle('events:delete', async (_, id) => {
    run('DELETE FROM events WHERE id = ?', [id]);
    return { success: true };
  });

  // 12. Notifications
  ipcMain.handle('notifications:getAll', async (_, userId) => {
    return queryAll<any>(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20',
      [userId]
    );
  });

  ipcMain.handle('notifications:markRead', async (_, id) => {
    run('UPDATE notifications SET is_read = 1 WHERE id = ?', [id]);
    return { success: true };
  });

  ipcMain.handle('notifications:markAllRead', async (_, userId) => {
    run('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [userId]);
    return { success: true };
  });

  // 13. Profile & Settings
  ipcMain.handle('profile:update', async (_, data) => {
    run(
      `UPDATE users 
       SET full_name = ?, phone = ?, bio = ?, avatar_url = ?, updated_at = datetime('now')
       WHERE id = ?`,
      [data.fullName, data.phone, data.bio, data.avatarUrl, data.id]
    );

    const updated = queryOne<any>(
      `SELECT u.*, d.name as department_name, d.code as department_code 
       FROM users u 
       LEFT JOIN departments d ON u.department_id = d.id 
       WHERE u.id = ?`,
      [data.id]
    );
    const { password_hash, ...safeUser } = updated;
    currentSessionUser = safeUser;
    return { success: true, user: safeUser };
  });

  ipcMain.handle('profile:changePassword', async (_, { userId, currentPassword, newPassword }) => {
    const user = queryOne<any>('SELECT password_hash FROM users WHERE id = ?', [userId]);
    if (!user) return { success: false, error: 'User not found' };

    const expectedCurrentHash = 'hashed_' + currentPassword;
    if (user.password_hash !== expectedCurrentHash && user.password_hash !== currentPassword) {
      return { success: false, error: 'Current password is incorrect' };
    }

    const newHash = 'hashed_' + newPassword;
    run('UPDATE users SET password_hash = ?, updated_at = datetime("now") WHERE id = ?', [newHash, userId]);
    return { success: true };
  });

  // 14. Dialogs
  ipcMain.handle('dialog:openFile', async (_, options) => {
    if (!mainWindow) return { canceled: true };
    return dialog.showOpenDialog(mainWindow, options);
  });
}

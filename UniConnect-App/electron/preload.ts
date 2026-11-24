import { contextBridge, ipcRenderer } from 'electron';

export const api = {
  // Auth
  login: (credentials: { email: string; password: string }) =>
    ipcRenderer.invoke('auth:login', credentials),
  register: (data: any) => ipcRenderer.invoke('auth:register', data),
  logout: () => ipcRenderer.invoke('auth:logout'),
  getCurrentUser: () => ipcRenderer.invoke('auth:getCurrentUser'),

  // Dashboard
  getStats: (role: string, userId: number) =>
    ipcRenderer.invoke('dashboard:getStats', { role, userId }),
  getTodaySchedule: (role: string, userId: number) =>
    ipcRenderer.invoke('dashboard:getTodaySchedule', { role, userId }),

  // Students
  getStudents: () => ipcRenderer.invoke('students:getAll'),
  createStudent: (data: any) => ipcRenderer.invoke('students:create', data),
  updateStudent: (data: any) => ipcRenderer.invoke('students:update', data),
  deleteStudent: (id: number) => ipcRenderer.invoke('students:delete', id),

  // Departments
  getDepartments: () => ipcRenderer.invoke('departments:getAll'),

  // Courses
  getCourses: (params?: { studentId?: number; teacherId?: number }) =>
    ipcRenderer.invoke('courses:getAll', params),
  createCourse: (data: any) => ipcRenderer.invoke('courses:create', data),
  updateCourse: (data: any) => ipcRenderer.invoke('courses:update', data),
  deleteCourse: (id: string) => ipcRenderer.invoke('courses:delete', id),
  enrollStudent: (studentId: number, courseId: string) =>
    ipcRenderer.invoke('courses:enroll', { studentId, courseId }),

  // Assignments
  getAssignments: (params?: { courseId?: string; studentId?: number; teacherId?: number }) =>
    ipcRenderer.invoke('assignments:getAll', params),
  createAssignment: (data: any) => ipcRenderer.invoke('assignments:create', data),
  submitAssignment: (data: any) => ipcRenderer.invoke('assignments:submit', data),
  gradeSubmission: (data: any) => ipcRenderer.invoke('assignments:grade', data),
  deleteAssignment: (id: string) => ipcRenderer.invoke('assignments:delete', id),

  // Study Materials
  getMaterials: (params?: { courseId?: string }) =>
    ipcRenderer.invoke('materials:getAll', params),
  uploadMaterial: (data: any) => ipcRenderer.invoke('materials:upload', data),
  deleteMaterial: (id: string) => ipcRenderer.invoke('materials:delete', id),

  // Announcements
  getAnnouncements: (audience?: string) =>
    ipcRenderer.invoke('announcements:getAll', audience),
  createAnnouncement: (data: any) => ipcRenderer.invoke('announcements:create', data),
  deleteAnnouncement: (id: string) => ipcRenderer.invoke('announcements:delete', id),

  // Timetable
  getTimetable: (params?: { studentId?: number; teacherId?: number }) =>
    ipcRenderer.invoke('timetable:getAll', params),
  createTimetableSlot: (data: any) => ipcRenderer.invoke('timetable:create', data),
  deleteTimetableSlot: (id: string) => ipcRenderer.invoke('timetable:delete', id),

  // Messages
  getContacts: (currentUserId: number) =>
    ipcRenderer.invoke('messages:getContacts', currentUserId),
  getThread: (user1: number, user2: number) =>
    ipcRenderer.invoke('messages:getThread', { user1, user2 }),
  sendMessage: (data: { senderId: number; receiverId: number; content: string }) =>
    ipcRenderer.invoke('messages:send', data),

  // Events
  getEvents: () => ipcRenderer.invoke('events:getAll'),
  createEvent: (data: any) => ipcRenderer.invoke('events:create', data),
  deleteEvent: (id: string) => ipcRenderer.invoke('events:delete', id),

  // Notifications
  getNotifications: (userId: number) =>
    ipcRenderer.invoke('notifications:getAll', userId),
  markNotificationRead: (id: string) =>
    ipcRenderer.invoke('notifications:markRead', id),
  markAllNotificationsRead: (userId: number) =>
    ipcRenderer.invoke('notifications:markAllRead', userId),

  // Profile & Settings
  updateProfile: (data: any) => ipcRenderer.invoke('profile:update', data),
  changePassword: (data: any) => ipcRenderer.invoke('profile:changePassword', data),

  // File dialogs
  showOpenDialog: (options: any) => ipcRenderer.invoke('dialog:openFile', options),
};

contextBridge.exposeInMainWorld('api', api);

import { 
  User, Department, Course, Assignment, StudyMaterial, 
  Announcement, TimetableSlot, Contact, Message, UniversityEvent, NotificationItem 
} from '../types';

declare global {
  interface Window {
    api?: any;
  }
}

const api = window.api || {
  // Fallback mock if running outside Electron
  login: async () => ({ success: false, error: 'Desktop Electron environment not detected' }),
  getCurrentUser: async () => null,
  getStats: async () => ({}),
  getTodaySchedule: async () => [],
  getStudents: async () => [],
  getDepartments: async () => [],
  getCourses: async () => [],
  getAssignments: async () => [],
  getMaterials: async () => [],
  getAnnouncements: async () => [],
  getTimetable: async () => [],
  getContacts: async () => [],
  getThread: async () => [],
  sendMessage: async () => ({ success: false }),
  getEvents: async () => [],
  getNotifications: async () => [],
  markNotificationRead: async () => ({ success: false }),
  markAllNotificationsRead: async () => ({ success: false }),
};

export const ApiService = {
  // Auth
  login: (credentials: { email: string; password: string }) => api.login(credentials),
  register: (data: any) => api.register(data),
  logout: () => api.logout(),
  getCurrentUser: (): Promise<User | null> => api.getCurrentUser(),

  // Dashboard
  getStats: (role: string, userId: number) => api.getStats(role, userId),
  getTodaySchedule: (role: string, userId: number) => api.getTodaySchedule(role, userId),

  // Students
  getStudents: (): Promise<User[]> => api.getStudents(),
  createStudent: (data: any) => api.createStudent(data),
  updateStudent: (data: any) => api.updateStudent(data),
  deleteStudent: (id: number) => api.deleteStudent(id),

  // Departments
  getDepartments: (): Promise<Department[]> => api.getDepartments(),

  // Courses
  getCourses: (params?: { studentId?: number; teacherId?: number }): Promise<Course[]> =>
    api.getCourses(params),
  createCourse: (data: any) => api.createCourse(data),
  updateCourse: (data: any) => api.updateCourse(data),
  deleteCourse: (id: string) => api.deleteCourse(id),
  enrollStudent: (studentId: number, courseId: string) =>
    api.enrollStudent(studentId, courseId),

  // Assignments
  getAssignments: (params?: { courseId?: string; studentId?: number; teacherId?: number }): Promise<Assignment[]> =>
    api.getAssignments(params),
  createAssignment: (data: any) => api.createAssignment(data),
  submitAssignment: (data: any) => api.submitAssignment(data),
  gradeSubmission: (data: { submissionId: string; marks: number; feedback: string }) =>
    api.gradeSubmission(data),
  deleteAssignment: (id: string) => api.deleteAssignment(id),

  // Study Materials
  getMaterials: (params?: { courseId?: string }): Promise<StudyMaterial[]> =>
    api.getMaterials(params),
  uploadMaterial: (data: any) => api.uploadMaterial(data),
  deleteMaterial: (id: string) => api.deleteMaterial(id),

  // Announcements
  getAnnouncements: (audience?: string): Promise<Announcement[]> =>
    api.getAnnouncements(audience),
  createAnnouncement: (data: any) => api.createAnnouncement(data),
  deleteAnnouncement: (id: string) => api.deleteAnnouncement(id),

  // Timetable
  getTimetable: (params?: { studentId?: number; teacherId?: number }): Promise<TimetableSlot[]> =>
    api.getTimetable(params),
  createTimetableSlot: (data: any) => api.createTimetableSlot(data),
  deleteTimetableSlot: (id: string) => api.deleteTimetableSlot(id),

  // Messages
  getContacts: (currentUserId: number): Promise<Contact[]> =>
    api.getContacts(currentUserId),
  getThread: (user1: number, user2: number): Promise<Message[]> =>
    api.getThread(user1, user2),
  sendMessage: (data: { senderId: number; receiverId: number; content: string }) =>
    api.sendMessage(data),

  // Events
  getEvents: (): Promise<UniversityEvent[]> => api.getEvents(),
  createEvent: (data: any) => api.createEvent(data),
  deleteEvent: (id: string) => api.deleteEvent(id),

  // Notifications
  getNotifications: (userId: number): Promise<NotificationItem[]> =>
    api.getNotifications(userId),
  markNotificationRead: (id: string) => api.markNotificationRead(id),
  markAllNotificationsRead: (userId: number) => api.markAllNotificationsRead(userId),

  // Profile
  updateProfile: (data: any) => api.updateProfile(data),
  changePassword: (data: any) => api.changePassword(data),

  // Dialogs
  showOpenDialog: (options: any) => api.showOpenDialog(options),
};

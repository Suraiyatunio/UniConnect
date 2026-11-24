"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
const electron_1 = require("electron");
exports.api = {
    // Auth
    login: (credentials) => electron_1.ipcRenderer.invoke('auth:login', credentials),
    register: (data) => electron_1.ipcRenderer.invoke('auth:register', data),
    logout: () => electron_1.ipcRenderer.invoke('auth:logout'),
    getCurrentUser: () => electron_1.ipcRenderer.invoke('auth:getCurrentUser'),
    // Dashboard
    getStats: (role, userId) => electron_1.ipcRenderer.invoke('dashboard:getStats', { role, userId }),
    getTodaySchedule: (role, userId) => electron_1.ipcRenderer.invoke('dashboard:getTodaySchedule', { role, userId }),
    // Students
    getStudents: () => electron_1.ipcRenderer.invoke('students:getAll'),
    createStudent: (data) => electron_1.ipcRenderer.invoke('students:create', data),
    updateStudent: (data) => electron_1.ipcRenderer.invoke('students:update', data),
    deleteStudent: (id) => electron_1.ipcRenderer.invoke('students:delete', id),
    // Departments
    getDepartments: () => electron_1.ipcRenderer.invoke('departments:getAll'),
    // Courses
    getCourses: (params) => electron_1.ipcRenderer.invoke('courses:getAll', params),
    createCourse: (data) => electron_1.ipcRenderer.invoke('courses:create', data),
    updateCourse: (data) => electron_1.ipcRenderer.invoke('courses:update', data),
    deleteCourse: (id) => electron_1.ipcRenderer.invoke('courses:delete', id),
    enrollStudent: (studentId, courseId) => electron_1.ipcRenderer.invoke('courses:enroll', { studentId, courseId }),
    // Assignments
    getAssignments: (params) => electron_1.ipcRenderer.invoke('assignments:getAll', params),
    createAssignment: (data) => electron_1.ipcRenderer.invoke('assignments:create', data),
    submitAssignment: (data) => electron_1.ipcRenderer.invoke('assignments:submit', data),
    gradeSubmission: (data) => electron_1.ipcRenderer.invoke('assignments:grade', data),
    deleteAssignment: (id) => electron_1.ipcRenderer.invoke('assignments:delete', id),
    // Study Materials
    getMaterials: (params) => electron_1.ipcRenderer.invoke('materials:getAll', params),
    uploadMaterial: (data) => electron_1.ipcRenderer.invoke('materials:upload', data),
    deleteMaterial: (id) => electron_1.ipcRenderer.invoke('materials:delete', id),
    // Announcements
    getAnnouncements: (audience) => electron_1.ipcRenderer.invoke('announcements:getAll', audience),
    createAnnouncement: (data) => electron_1.ipcRenderer.invoke('announcements:create', data),
    deleteAnnouncement: (id) => electron_1.ipcRenderer.invoke('announcements:delete', id),
    // Timetable
    getTimetable: (params) => electron_1.ipcRenderer.invoke('timetable:getAll', params),
    createTimetableSlot: (data) => electron_1.ipcRenderer.invoke('timetable:create', data),
    deleteTimetableSlot: (id) => electron_1.ipcRenderer.invoke('timetable:delete', id),
    // Messages
    getContacts: (currentUserId) => electron_1.ipcRenderer.invoke('messages:getContacts', currentUserId),
    getThread: (user1, user2) => electron_1.ipcRenderer.invoke('messages:getThread', { user1, user2 }),
    sendMessage: (data) => electron_1.ipcRenderer.invoke('messages:send', data),
    // Events
    getEvents: () => electron_1.ipcRenderer.invoke('events:getAll'),
    createEvent: (data) => electron_1.ipcRenderer.invoke('events:create', data),
    deleteEvent: (id) => electron_1.ipcRenderer.invoke('events:delete', id),
    // Notifications
    getNotifications: (userId) => electron_1.ipcRenderer.invoke('notifications:getAll', userId),
    markNotificationRead: (id) => electron_1.ipcRenderer.invoke('notifications:markRead', id),
    markAllNotificationsRead: (userId) => electron_1.ipcRenderer.invoke('notifications:markAllRead', userId),
    // Profile & Settings
    updateProfile: (data) => electron_1.ipcRenderer.invoke('profile:update', data),
    changePassword: (data) => electron_1.ipcRenderer.invoke('profile:changePassword', data),
    // File dialogs
    showOpenDialog: (options) => electron_1.ipcRenderer.invoke('dialog:openFile', options),
};
electron_1.contextBridge.exposeInMainWorld('api', exports.api);

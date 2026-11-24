export type UserRole = 'student' | 'teacher' | 'admin';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  phone?: string;
  department_id?: string;
  department_name?: string;
  department_code?: string;
  student_id?: string;
  semester?: number;
  program?: string;
  bio?: string;
  created_at?: string;
}

export interface Department {
  id: string;
  code: string;
  name: string;
  description?: string;
  head_of_dept?: string;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  description: string;
  credits: number;
  department_id: string;
  department_name?: string;
  department_code?: string;
  teacher_id?: number;
  teacher_name?: string;
  teacher_email?: string;
  semester: number;
  enrolled_count?: number;
}

export interface Submission {
  id: string;
  assignment_id: string;
  student_id: number;
  student_name?: string;
  student_email?: string;
  student_roll?: string;
  submission_text?: string;
  file_name?: string;
  marks?: number;
  feedback?: string;
  status: 'Submitted' | 'Graded' | 'Late';
  submitted_at: string;
  graded_at?: string;
}

export interface Assignment {
  id: string;
  course_id: string;
  course_title?: string;
  course_code?: string;
  teacher_id: number;
  teacher_name?: string;
  title: string;
  description: string;
  deadline: string;
  max_points: number;
  attachment_name?: string;
  submission_count?: number;
  // Student view fields:
  submission_id?: string;
  submission_text?: string;
  submission_file?: string;
  submission_status?: 'Submitted' | 'Graded' | 'Late';
  marks?: number;
  feedback?: string;
  submitted_at?: string;
  // Teacher view fields:
  submissions?: Submission[];
}

export interface StudyMaterial {
  id: string;
  course_id: string;
  course_title?: string;
  course_code?: string;
  teacher_id: number;
  teacher_name?: string;
  title: string;
  description?: string;
  file_type: 'PDF' | 'Slides' | 'Document' | 'Code' | 'Other';
  file_name: string;
  file_size: number;
  uploaded_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  author_id: number;
  author_name?: string;
  author_role?: string;
  target_audience: 'all' | 'students' | 'teachers';
  priority: 'Urgent' | 'Normal' | 'Low';
  created_at: string;
}

export interface TimetableSlot {
  id: string;
  course_id: string;
  course_title?: string;
  course_code?: string;
  teacher_id?: number;
  teacher_name?: string;
  day_of_week: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  start_time: string;
  end_time: string;
  room: string;
}

export interface Message {
  id: string;
  sender_id: number;
  receiver_id: number;
  sender_name?: string;
  sender_avatar?: string;
  content: string;
  is_read: number;
  created_at: string;
}

export interface Contact {
  id: number;
  full_name: string;
  email: string;
  role: UserRole;
  avatar_url?: string;
  last_message?: string;
  last_message_time?: string;
  unread_count?: number;
}

export interface UniversityEvent {
  id: string;
  title: string;
  description: string;
  event_date: string;
  start_time: string;
  end_time: string;
  location: string;
  organizer_id?: number;
  organizer_name?: string;
  category: 'Academic' | 'Cultural' | 'Sports' | 'Workshop' | 'Career';
  created_at?: string;
}

export interface NotificationItem {
  id: string;
  user_id: number;
  title: string;
  message: string;
  type: 'assignment' | 'grade' | 'announcement' | 'message' | 'event' | 'system';
  link?: string;
  is_read: number;
  created_at: string;
}

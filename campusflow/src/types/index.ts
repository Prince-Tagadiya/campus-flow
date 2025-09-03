export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  createdAt: Date;
  photoURL?: string;
  semester?: string;
  storageUsed?: number;
  storageLimit?: number;
  phone?: string;
  college?: string;
  course?: string;
  year?: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  studentId: string;
  createdAt: Date;
}

export interface Assignment {
  id: string;
  studentId: string;
  title: string;
  subjectId: string;
  subjectName: string;
  pdfUrl: string;
  deadline: Date;
  status: 'pending' | 'completed';
  createdAt: Date;
  priority: 'low' | 'medium' | 'high';
  fileSize?: number;
  description?: string;
  submissionType: 'assignment' | 'tutorial';
  studyReminderTime?: Date;
  submissionReminderTime?: Date;
}

export interface Exam {
  id: string;
  studentId: string;
  subjectId: string;
  subjectName: string;
  examType: 'lecture' | 'mid' | 'final';
  examDate: Date;
  startTime: string;
  endTime: string;
  room?: string;
  notes?: string;
  createdAt: Date;
}

export interface Material {
  id: string;
  studentId: string;
  subjectId: string;
  subjectName: string;
  title: string;
  description?: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  createdAt: Date;
}

export interface Notification {
  id: string;
  studentId: string;
  title: string;
  message: string;
  type: 'assignment' | 'exam' | 'reminder' | 'general';
  isRead: boolean;
  createdAt: Date;
  scheduledFor?: Date;
}

export interface Payment {
  id: string;
  studentId: string;
  amount: number;
  date: Date;
  method: string;
  status: 'pending' | 'completed' | 'failed';
}

export interface DashboardCard {
  id: string;
  type:
    | 'assignments'
    | 'deadlines'
    | 'account'
    | 'customization'
    | 'exams'
    | 'storage'
    | 'materials'
    | 'notifications';
  title: string;
  description: string;
  icon: string;
  enabled: boolean;
  order: number;
  size?: 's' | 'm' | 'l';
}

export interface StorageInfo {
  used: number;
  limit: number;
  percentage: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'faculty' | 'admin' | 'parent';
  createdAt: Date;
  photoURL?: string;
  semester?: string;
  storageUsed?: number;
  storageLimit?: number;
  phone?: string;
  college?: string;
  course?: string;
  year?: string;
  branch?: string;
  studentId?: string; // For parent role - links to their child
  parentId?: string; // For student role - links to their parent
  
  // Student specific comprehensive details
  enrollmentNumber?: string;
  rollNumber?: string;
  admissionYear?: number;
  currentSemester?: number;
  section?: string;
  dateOfBirth?: Date;
  gender?: 'Male' | 'Female' | 'Other';
  bloodGroup?: string;
  
  // Address Information
  address?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
  };
  
  // Emergency Contact
  emergencyContact?: {
    name?: string;
    relation?: string;
    phone?: string;
    email?: string;
  };
  
  // Parent/Guardian Details
  parentDetails?: {
    fatherName?: string;
    fatherPhone?: string;
    fatherEmail?: string;
    fatherOccupation?: string;
    motherName?: string;
    motherPhone?: string;
    motherEmail?: string;
    motherOccupation?: string;
    guardianName?: string;
    guardianPhone?: string;
    guardianEmail?: string;
    guardianRelation?: string;
  };
  
  // Academic Background
  academicDetails?: {
    previousSchool?: string;
    previousQualification?: string;
    percentage?: number;
    board?: string;
    yearOfPassing?: number;
  };
  
  // Medical Information
  medicalDetails?: {
    allergies?: string;
    medications?: string;
    medicalConditions?: string;
    emergencyMedicalInfo?: string;
  };
  
  // Document Information
  documents?: {
    aadharNumber?: string;
    panNumber?: string;
    passportNumber?: string;
    drivingLicense?: string;
  };
  
  // Additional Information
  additionalInfo?: {
    hobbies?: string;
    achievements?: string;
    specialSkills?: string;
    notes?: string;
  };
  
  // Course Information
  courseInfo?: {
    courseId?: string;
    courseName?: string;
    courseCode?: string;
    branchId?: string;
    branchName?: string;
    subjects?: SemesterSubject[];
  };
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
  submissionType: 'assignment' | 'tutorial' | 'project' | 'exam';
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

export interface StudyFolder {
  id: string;
  studentId: string;
  name: string;
  parentId?: string; // null for root folders (subjects)
  subjectId?: string; // for subject folders
  createdAt: Date;
  color?: string;
}

export interface StudyFile {
  id: string;
  studentId: string;
  name: string;
  folderId: string;
  subjectId: string;
  subjectName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  description?: string;
  createdAt: Date;
  modifiedAt: Date;
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

export interface StorageInfo {
  used: number;
  limit: number;
  percentage: number;
}

// Academic Widgets
export interface SubjectProgress {
  subjectId: string;
  subjectName: string;
  completed: number;
  pending: number;
  total: number;
  progressPercentage: number;
}

export interface StudySession {
  id: string;
  studentId: string;
  subjectId: string;
  subjectName: string;
  duration: number; // in minutes
  date: Date;
  notes?: string;
}

export interface GPA {
  currentGPA: number;
  totalCredits: number;
  semesterGPA?: number;
  lastUpdated: Date;
}

export interface Grade {
  id: string;
  studentId: string;
  subjectId: string;
  subjectName: string;
  assignmentId?: string;
  examId?: string;
  marks: number;
  maxMarks: number;
  grade: string;
  semester: string;
  createdAt: Date;
}

// Productivity Widgets
export interface PomodoroSession {
  id: string;
  studentId: string;
  duration: number; // in minutes
  type: 'work' | 'break';
  subjectId?: string;
  subjectName?: string;
  completedAt: Date;
}

export interface TodoItem {
  id: string;
  studentId: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  createdAt: Date;
}

export interface Streak {
  type: 'assignments' | 'study' | 'pomodoro';
  currentStreak: number;
  longestStreak: number;
  lastActivity: Date;
}

export interface WeeklySummary {
  week: string;
  assignmentsCompleted: number;
  studyHours: number;
  pomodoroSessions: number;
  examsAttempted: number;
  averageGrade?: number;
}

// Schedule & Events
export interface Timetable {
  id: string;
  studentId: string;
  subjectId: string;
  subjectName: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string;
  endTime: string;
  room: string;
  instructor?: string;
  type: 'lecture' | 'lab' | 'tutorial';
}

export interface Event {
  id: string;
  studentId: string;
  title: string;
  description?: string;
  date: Date;
  type: 'academic' | 'social' | 'personal';
  location?: string;
  isRecurring: boolean;
}

// Smart Widgets
export interface MotivationQuote {
  id: string;
  text: string;
  author: string;
  category: 'academic' | 'motivation' | 'success';
  date: Date;
}

export interface QuickNote {
  id: string;
  studentId: string;
  content: string;
  color: string;
  position: { x: number; y: number };
  createdAt: Date;
}

export interface AISuggestion {
  id: string;
  studentId: string;
  type: 'study' | 'assignment' | 'exam' | 'break';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  relatedSubjectId?: string;
  relatedSubjectName?: string;
  createdAt: Date;
  isRead: boolean;
}

// Attendance System Types
export interface AttendanceSession {
  id: string;
  facultyId: string;
  courseId: string;
  courseName: string;
  sectionId?: string;
  startedAt: Date;
  endsAt: Date;
  currentCode: string;
  lastCodeAt: Date;
  isActive: boolean;
  totalStudents: number;
  presentStudents: number;
  createdAt: Date;
}

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  studentId: string;
  studentName: string;
  scannedAt: Date;
  status: 'present' | 'late' | 'absent';
  notes?: string;
}

export interface StudentAttendance {
  studentId: string;
  studentName: string;
  totalSessions: number;
  presentSessions: number;
  absentSessions: number;
  attendancePercentage: number;
  lastAttendance?: Date;
  courseId: string;
  courseName: string;
  subjectId?: string;
  subjectName?: string;
  semester?: number;
}


export interface Branch {
  id: string;
  name: string;
  code: string;
  description?: string;
  createdAt: Date;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  description?: string;
  duration: number; // in semesters
  branchId: string;
  branchName: string;
  totalStudents?: number;
  createdAt: Date;
}

export interface SemesterSubject {
  id: string;
  courseId: string;
  semester: number;
  subjectName: string;
  subjectCode: string;
  credits: number;
  isElective: boolean;
  prerequisites?: string[];
  createdAt: Date;
}

export interface StudentCourse {
  id: string;
  studentId: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  branchId: string;
  branchName: string;
  currentSemester: number;
  admissionYear: number;
  subjects: SemesterSubject[];
  createdAt: Date;
}

export interface StudentScore {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseName: string;
  assignmentId?: string;
  examId?: string;
  marks: number;
  maxMarks: number;
  grade: string;
  semester: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ParentNotification {
  id: string;
  parentId: string;
  studentId: string;
  studentName: string;
  type: 'attendance' | 'score' | 'general';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  threshold?: number; // For attendance percentage alerts
}

// Updated DashboardCard type
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
    | 'notifications'
    | 'upcoming-deadlines'
    | 'subject-progress'
    | 'study-hours'
    | 'gpa-snapshot'
    | 'pomodoro-timer'
    | 'todo-list'
    | 'streak-tracker'
    | 'weekly-summary'
    | 'timetable'
    | 'next-lecture'
    | 'event-countdown'
    | 'latest-notifications'
    | 'urgent-alerts'
    | 'storage-bar'
    | 'recent-uploads'
    | 'motivation-quote'
    | 'quick-notes'
    | 'ai-suggestions'
    | 'attendance'
    | 'scores'
    | 'courses';
  title: string;
  description: string;
  icon: string;
  enabled: boolean;
  order: number;
  size?: 's' | 'm' | 'l';
}

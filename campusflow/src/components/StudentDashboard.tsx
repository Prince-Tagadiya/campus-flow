import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, setDoc, collection, addDoc, updateDoc, deleteDoc, getDocs, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-grid-layout/css/styles.css';
import {
  ClockIcon,
  UserIcon,
  PlusIcon,
  DocumentTextIcon,
  CheckIcon,
  Bars3Icon,
  XMarkIcon,
  CloudIcon,
  BookOpenIcon,
  ChartBarIcon,
  BellIcon,
} from '@heroicons/react/24/outline';
import {
  Assignment,
  Exam,
  StorageInfo,
  Subject,
  Material,
  Notification,
  DashboardCard,
  SubjectProgress,
  StudySession,
  GPA,
  Grade,
  PomodoroSession,
  TodoItem,
  Streak,
  WeeklySummary,
  Timetable,
  Event,
  MotivationQuote,
  QuickNote,
  AISuggestion,
} from '../types';
import { motion } from 'framer-motion';

// (RGL styles removed)

const StudentDashboard: React.FC = () => {
  const { currentUser, logout } = useAuth();
  
  // (RGL style injection removed)
  const [assignments, setAssignments] = useState<Assignment[]>([
    {
      id: '1',
      studentId: '1',
      title: 'Physics Lab Report',
      subjectId: '2',
      subjectName: 'Physics',
      pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      status: 'pending',
      createdAt: new Date(),
      priority: 'high',
      fileSize: 2.5,
      submissionType: 'assignment',
    },
    {
      id: '2',
      studentId: '1',
      title: 'Mathematics Assignment',
      subjectId: '1',
      subjectName: 'Mathematics',
      pdfUrl: 'https://www.africau.edu/images/default/sample.pdf',
      deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      status: 'completed',
      createdAt: new Date(),
      priority: 'medium',
      fileSize: 1.8,
      submissionType: 'assignment',
    },
    {
      id: '3',
      studentId: '1',
      title: 'Chemistry Problem Set',
      subjectId: '3',
      subjectName: 'Chemistry',
      pdfUrl: 'https://www.learningcontainer.com/wp-content/uploads/2019/09/sample-pdf-file.pdf',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: 'pending',
      createdAt: new Date(),
      priority: 'high',
      fileSize: 1.2,
      submissionType: 'assignment',
    },
    {
      id: '4',
      studentId: '1',
      title: 'English Essay',
      subjectId: '4',
      subjectName: 'English',
      pdfUrl: '',
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      status: 'pending',
      createdAt: new Date(),
      priority: 'low',
      fileSize: 0.8,
      submissionType: 'assignment',
    },
    {
      id: '5',
      studentId: '1',
      title: 'Computer Science Project',
      subjectId: '5',
      subjectName: 'Computer Science',
      pdfUrl: 'https://www.orimi.com/pdf-test.pdf',
      deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      status: 'pending',
      createdAt: new Date(),
      priority: 'medium',
      fileSize: 3.1,
      submissionType: 'assignment',
    },
  ]);

  // UI state: assignment priority filter
  const [assignmentFilter, setAssignmentFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [exams, setExams] = useState<Exam[]>([
    {
      id: '1',
      studentId: '1',
      subjectId: '1',
      subjectName: 'Mathematics',
      examType: 'mid',
      examDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      startTime: '09:00',
      endTime: '11:00',
      room: 'Room 101',
      notes: 'Bring calculator',
      createdAt: new Date(),
    },
    {
      id: '2',
      studentId: '1',
      subjectId: '2',
      subjectName: 'Physics',
      examType: 'final',
      examDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      startTime: '14:00',
      endTime: '16:00',
      room: 'Room 205',
      notes: 'Closed book exam',
      createdAt: new Date(),
    },
  ]);
  const [subjects, setSubjects] = useState<Subject[]>([
    {
      id: '1',
      name: 'Mathematics',
      code: 'MATH101',
      studentId: '1',
      createdAt: new Date(),
    },
    {
      id: '2',
      name: 'Physics',
      code: 'PHYS101',
      studentId: '1',
      createdAt: new Date(),
    },
    {
      id: '3',
      name: 'Chemistry',
      code: 'CHEM101',
      studentId: '1',
      createdAt: new Date(),
    },
    {
      id: '4',
      name: 'English',
      code: 'ENG101',
      studentId: '1',
      createdAt: new Date(),
    },
    {
      id: '5',
      name: 'Computer Science',
      code: 'CS101',
      studentId: '1',
      createdAt: new Date(),
    },
  ]);
  const [materials] = useState<Material[]>([
    {
      id: '1',
      studentId: '1',
      subjectId: '1',
      subjectName: 'Mathematics',
      title: 'Calculus Notes',
      description: 'Comprehensive notes on calculus',
      fileUrl: '',
      fileSize: 2.5,
      fileType: 'pdf',
      createdAt: new Date(),
    },
  ]);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      studentId: '1',
      title: 'Assignment Due Soon',
      message: 'Your Physics assignment is due in 2 days',
      type: 'assignment',
      isRead: false,
      createdAt: new Date(),
    },
  ]);
  const [nextDeadline, setNextDeadline] = useState<Assignment | null>(null);
  const [nextExam, setNextExam] = useState<Exam | null>(null);
  const [daysUntilDeadline, setDaysUntilDeadline] = useState<number>(0);
  const [daysUntilExam, setDaysUntilExam] = useState<number>(0);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showExamModal, setShowExamModal] = useState(false);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showEditExamModal, setShowEditExamModal] = useState(false);
  const [showSubjectsModal, setShowSubjectsModal] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [customizeMode, setCustomizeMode] = useState(false);
  const [cards, setCards] = useState<DashboardCard[]>([
    /*
    🎯 NEW DASHBOARD LAYOUT - Row-Based Organization
    
    🟠 Row 1 – Smart Overview (Hero Section)
    1. 🤖 AI Assistant (Order: 1, Size: L) - Full-width, spans all 3 columns
    
    📅 Row 2 – Deadlines & Exams
    2. ⏰ Upcoming Deadlines (Order: 2, Size: M)
    3. 📚 Upcoming Exams (Order: 3, Size: M) 
    4. 📊 Academic Overview (Order: 4, Size: M)
    
    📚 Row 3 – Academic Details
    5. 📝 Upcoming Assignments (Order: 5, Size: L) - Spans 2 columns
    6. 📖 Next Exam (Order: 6, Size: S)
    7. 🕐 Next Deadline (Order: 7, Size: S)
    
    ⚡ Row 4 – Productivity Zone
    8. ✅ Today's To-Do (Order: 8, Size: M)
    9. ⏱ Pomodoro Timer (Order: 9, Size: M)
    10. 📈 Weekly Summary (Order: 10, Size: M)
    
    🎯 Row 5 – Motivation & Habits
    11. 🔥 Streak Tracker (Order: 11, Size: S)
    12. 💪 Daily Motivation (Order: 12, Size: S)
    
    ⚙️ Row 6 – System Info & Alerts
    13. 🔔 Notifications (Order: 13, Size: M)
    14. 💾 Storage Usage (Order: 14, Size: M)
    */
    
    // 🟠 Row 1 – Smart Overview (Hero Section)
    {
      id: 'ai-suggestions',
      type: 'ai-suggestions' as any,
      title: 'AI Assistant',
      description: 'Smart study recommendations',
      icon: 'BellIcon',
      enabled: true,
      order: 1,
      size: 'l',
    },
    
    // 📅 Row 2 – Deadlines & Exams
    {
      id: 'upcoming-deadlines',
      type: 'upcoming-deadlines' as any,
      title: 'Upcoming Deadlines',
      description: 'Next 3 assignments/exams with countdown',
      icon: 'ClockIcon',
      enabled: true,
      order: 2,
      size: 'm',
    },
    {
      id: 'upcoming-exams',
      type: 'upcoming-exams' as any,
      title: 'Upcoming Exams',
      description: 'All exams with days left and gaps',
      icon: 'BookOpenIcon',
      enabled: true,
      order: 3,
      size: 'm',
    },
    {
      id: 'quick-stats',
      type: 'assignments',
      title: 'Academic Overview',
      description: 'Quick access to assignments and exams',
      icon: 'ChartBarIcon',
      enabled: true,
      order: 4,
      size: 'm',
    },
    
    // 📚 Row 3 – Academic Details
    {
      id: 'welcome',
      type: 'customization',
      title: 'Upcoming Assignments',
      description: 'Your pending assignments',
      icon: 'DocumentTextIcon',
      enabled: true,
      order: 5,
      size: 'l',
    },
    {
      id: 'next-exam',
      type: 'exams',
      title: 'Next Exam',
      description: 'Shows the next exam info',
      icon: 'BookOpenIcon',
      enabled: true,
      order: 6,
      size: 's',
    },
    {
      id: 'deadlines',
      type: 'deadlines',
      title: 'Next Deadline',
      description: 'Shows the nearest assignment deadline',
      icon: 'ClockIcon',
      enabled: true,
      order: 7,
      size: 's',
    },
    
    // ⚡ Row 4 – Productivity Zone
    {
      id: 'todo-list',
      type: 'todo-list' as any,
      title: 'Today\'s To-Do',
      description: 'Tasks/reminders added by student',
      icon: 'CheckIcon',
      enabled: true,
      order: 8,
      size: 'm',
    },
    {
      id: 'pomodoro-timer',
      type: 'pomodoro-timer' as any,
      title: 'Pomodoro Timer',
      description: 'Built-in focus timer with session logs',
      icon: 'ClockIcon',
      enabled: true,
      order: 9,
      size: 'm',
    },
    {
      id: 'weekly-summary',
      type: 'weekly-summary' as any,
      title: 'Weekly Summary',
      description: 'Auto-summary of completed work',
      icon: 'ChartBarIcon',
      enabled: true,
      order: 10,
      size: 'm',
    },
    
    // 🎯 Row 5 – Motivation & Habits
    {
      id: 'streak-tracker',
      type: 'streak-tracker' as any,
      title: 'Streak Tracker',
      description: 'Assignment completion streaks',
      icon: 'ChartBarIcon',
      enabled: true,
      order: 11,
      size: 's',
    },
    {
      id: 'motivation-quote',
      type: 'motivation-quote' as any,
      title: 'Daily Motivation',
      description: 'Student-focused motivational quotes',
      icon: 'BookOpenIcon',
      enabled: true,
      order: 12,
      size: 's',
    },
    
    // ⚙️ Row 6 – System Info & Alerts
    {
      id: 'notifications',
      type: 'notifications',
      title: 'Notifications',
      description: 'Recent notifications',
      icon: 'BellIcon',
      enabled: true,
      order: 13,
      size: 'm',
    },
    {
      id: 'storage',
      type: 'storage',
      title: 'Storage Usage',
      description: 'Usage of storage',
      icon: 'CloudIcon',
      enabled: true,
      order: 14,
      size: 'm',
    },
  ]);

  const cardsKey = currentUser ? `cf_${currentUser.id}_cards` : undefined;

  useEffect(() => {
    if (!cardsKey) return;
    try {
      const raw = localStorage.getItem(cardsKey);
      if (raw) {
        const parsed = JSON.parse(raw) as DashboardCard[];
        // simple sanity: ensure required ids exist; if missing, merge defaults
        const byId: Record<string, DashboardCard> = {};
        for (const c of parsed) byId[c.id] = c;
        const merged = cards.map((c) => byId[c.id] || c);
        // include any new cards not in defaults
        const extras = parsed.filter((p) => !merged.find((m) => m.id === p.id));
        setCards([...merged, ...extras].sort((a, b) => a.order - b.order));
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardsKey]);


  useEffect(() => {
    if (!cardsKey) return;
    try {
      localStorage.setItem(cardsKey, JSON.stringify(cards));
    } catch {}
  }, [cards, cardsKey]);

  const toggleCard = (id: string) => {
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c))
    );
  };

  // replaced by drag-and-drop
  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    subjectId: '',
    submissionType: 'assignment' as 'assignment' | 'tutorial',
    deadline: '',
    pdfFile: null as File | null,
  });
  const [examForm, setExamForm] = useState({
    subjectId: '',
    examType: 'lecture' as 'lecture' | 'mid' | 'final',
    examDate: '',
    startTime: '',
    endTime: '',
    room: '',
    notes: '',
  });
  const [storageInfo, setStorageInfo] = useState<StorageInfo>({
    used: 0,
    limit: 1000, // 1GB in MB
    percentage: 0,
  });

  // New widget data
  const [subjectProgress, setSubjectProgress] = useState<SubjectProgress[]>([
    { subjectId: '1', subjectName: 'Mathematics', completed: 8, pending: 4, total: 12, progressPercentage: 67 },
    { subjectId: '2', subjectName: 'Physics', completed: 6, pending: 6, total: 12, progressPercentage: 50 },
    { subjectId: '3', subjectName: 'Chemistry', completed: 10, pending: 2, total: 12, progressPercentage: 83 },
    { subjectId: '4', subjectName: 'English', completed: 5, pending: 3, total: 8, progressPercentage: 63 },
    { subjectId: '5', subjectName: 'Computer Science', completed: 7, pending: 5, total: 12, progressPercentage: 58 },
  ]);

  const [studySessions, setStudySessions] = useState<StudySession[]>([
    { id: '1', studentId: '1', subjectId: '1', subjectName: 'Mathematics', duration: 120, date: new Date(), notes: 'Calculus practice' },
    { id: '2', studentId: '1', subjectId: '2', subjectName: 'Physics', duration: 90, date: new Date(Date.now() - 24 * 60 * 60 * 1000), notes: 'Mechanics problems' },
    { id: '3', studentId: '1', subjectId: '3', subjectName: 'Chemistry', duration: 60, date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), notes: 'Organic chemistry' },
  ]);

  const [gpa, setGpa] = useState<GPA>({
    currentGPA: 3.7,
    totalCredits: 45,
    semesterGPA: 3.8,
    lastUpdated: new Date(),
  });

  const [grades, setGrades] = useState<Grade[]>([
    { id: '1', studentId: '1', subjectId: '1', subjectName: 'Mathematics', marks: 85, maxMarks: 100, grade: 'A-', semester: 'Fall 2024', createdAt: new Date() },
    { id: '2', studentId: '1', subjectId: '2', subjectName: 'Physics', marks: 78, maxMarks: 100, grade: 'B+', semester: 'Fall 2024', createdAt: new Date() },
    { id: '3', studentId: '1', subjectId: '3', subjectName: 'Chemistry', marks: 92, maxMarks: 100, grade: 'A', semester: 'Fall 2024', createdAt: new Date() },
  ]);

  const [pomodoroSessions, setPomodoroSessions] = useState<PomodoroSession[]>([
    { id: '1', studentId: '1', duration: 25, type: 'work', subjectId: '1', subjectName: 'Mathematics', completedAt: new Date() },
    { id: '2', studentId: '1', duration: 5, type: 'break', completedAt: new Date() },
    { id: '3', studentId: '1', duration: 25, type: 'work', subjectId: '2', subjectName: 'Physics', completedAt: new Date() },
  ]);

  const [todos, setTodos] = useState<TodoItem[]>([
    { id: '1', studentId: '1', title: 'Complete Math assignment', description: 'Due tomorrow', completed: false, priority: 'high', dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), createdAt: new Date() },
    { id: '2', studentId: '1', title: 'Study for Physics exam', description: 'Midterm next week', completed: false, priority: 'medium', dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), createdAt: new Date() },
    { id: '3', studentId: '1', title: 'Review Chemistry notes', description: 'Lab report preparation', completed: true, priority: 'low', createdAt: new Date() },
  ]);

  const [streaks, setStreaks] = useState<Streak[]>([
    { type: 'assignments', currentStreak: 5, longestStreak: 12, lastActivity: new Date() },
    { type: 'study', currentStreak: 3, longestStreak: 8, lastActivity: new Date() },
    { type: 'pomodoro', currentStreak: 7, longestStreak: 15, lastActivity: new Date() },
  ]);

  const [weeklySummary, setWeeklySummary] = useState<WeeklySummary>({
    week: 'Week 8',
    assignmentsCompleted: 4,
    studyHours: 28,
    pomodoroSessions: 12,
    examsAttempted: 1,
    averageGrade: 85,
  });

  const [timetable, setTimetable] = useState<Timetable[]>([
    { id: '1', studentId: '1', subjectId: '1', subjectName: 'Mathematics', dayOfWeek: 1, startTime: '09:00', endTime: '10:30', room: 'A-101', instructor: 'Dr. Smith', type: 'lecture' },
    { id: '2', studentId: '1', subjectId: '2', subjectName: 'Physics', dayOfWeek: 1, startTime: '11:00', endTime: '12:30', room: 'B-202', instructor: 'Prof. Johnson', type: 'lecture' },
    { id: '3', studentId: '1', subjectId: '3', subjectName: 'Chemistry', dayOfWeek: 2, startTime: '10:00', endTime: '11:30', room: 'C-303', instructor: 'Dr. Brown', type: 'lab' },
  ]);

  const [events, setEvents] = useState<Event[]>([
    { id: '1', studentId: '1', title: 'Midterm Exams', description: 'All subjects', date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), type: 'academic', location: 'Main Campus', isRecurring: false },
    { id: '2', studentId: '1', title: 'Science Fair', description: 'Annual science exhibition', date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), type: 'social', location: 'Auditorium', isRecurring: true },
  ]);

  const [motivationQuotes, setMotivationQuotes] = useState<MotivationQuote[]>([
    { id: '1', text: 'Success is not final, failure is not fatal: it is the courage to continue that counts.', author: 'Winston Churchill', category: 'motivation', date: new Date() },
    { id: '2', text: 'The future belongs to those who believe in the beauty of their dreams.', author: 'Eleanor Roosevelt', category: 'success', date: new Date() },
  ]);

  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([
    { id: '1', studentId: '1', type: 'study', title: 'Revise Calculus', description: '2 days left for Mathematics exam', priority: 'high', relatedSubjectId: '1', relatedSubjectName: 'Mathematics', createdAt: new Date(), isRead: false },
    { id: '2', studentId: '1', type: 'assignment', title: 'Complete Physics Lab Report', description: 'Due in 3 days', priority: 'medium', relatedSubjectId: '2', relatedSubjectName: 'Physics', createdAt: new Date(), isRead: false },
    { id: '3', studentId: '1', type: 'break', title: 'Take a Study Break', description: 'You\'ve been studying for 2 hours straight', priority: 'low', createdAt: new Date(), isRead: true },
  ]);

  // Real-time state
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const handleRefreshAi = () => {
    setIsAiGenerating(true);
    setTimeout(() => {
      const newSuggestion: AISuggestion = {
        id: Date.now().toString(),
        studentId: '1',
        type: 'study',
        title: 'Refreshed Tip',
        description: 'AI refreshed your suggestions based on recent activity.',
        priority: 'medium',
        createdAt: new Date(),
        isRead: false,
      };
      setAiSuggestions(prev => [newSuggestion, ...prev.slice(0, 4)]);
      setIsAiGenerating(false);
    }, 1200);
  };
  const [currentTime, setCurrentTime] = useState(new Date());
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60); // 25 minutes in seconds
  const [isPomodoroRunning, setIsPomodoroRunning] = useState(false);
  const [isPomodoroMinimized, setIsPomodoroMinimized] = useState(false);

  // Real-time updates
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Pomodoro timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPomodoroRunning && pomodoroTime > 0) {
      interval = setInterval(() => {
        setPomodoroTime(time => time - 1);
      }, 1000);
    } else if (pomodoroTime === 0) {
      setIsPomodoroRunning(false);
      // Add notification or sound here
    }
    return () => clearInterval(interval);
  }, [isPomodoroRunning, pomodoroTime]);

  // AI suggestion generation simulation
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.1) { // 10% chance every interval
        setIsAiGenerating(true);
        setTimeout(() => {
          const newSuggestion: AISuggestion = {
            id: Date.now().toString(),
            studentId: '1',
            type: 'study',
            title: 'New Study Tip',
            description: 'Consider reviewing your notes from last week',
            priority: 'medium',
            createdAt: new Date(),
            isRead: false,
          };
          setAiSuggestions(prev => [newSuggestion, ...prev.slice(0, 4)]);
          setIsAiGenerating(false);
        }, 2000);
      }
    }, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Navigation items
  const navigationItems = [
    { id: 'dashboard', name: 'Dashboard', icon: ChartBarIcon },
    { id: 'assignments', name: 'Assignments', icon: DocumentTextIcon },
    { id: 'exams', name: 'Exams', icon: BookOpenIcon },
    { id: 'subjects', name: 'Subjects', icon: BookOpenIcon },
    { id: 'materials', name: 'Materials', icon: DocumentTextIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'storage', name: 'Storage', icon: CloudIcon },
    { id: 'account', name: 'Account', icon: UserIcon },
  ];

  // Firebase functions for subjects
  const loadSubjectsFromFirebase = useCallback(async () => {
    if (!currentUser?.id) return;
    
    try {
      const subjectsQuery = query(
        collection(db, 'subjects'),
        where('studentId', '==', currentUser.id)
      );
      
      const unsubscribe = onSnapshot(subjectsQuery, (snapshot) => {
        const subjectsData: Subject[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          subjectsData.push({
            id: doc.id,
            name: data.name,
            code: data.code,
            studentId: data.studentId,
            createdAt: data.createdAt.toDate(),
          });
        });
        setSubjects(subjectsData);
      });
      
      return unsubscribe;
    } catch (error) {
      console.error('Error loading subjects:', error);
    }
  }, [currentUser?.id]);

  // Initialize data
  useEffect(() => {
    // Calculate storage usage
    const totalSize = assignments.reduce(
      (sum, assignment) => sum + (assignment.fileSize || 0),
      0
    );
    const percentage = (totalSize / storageInfo.limit) * 100;
    setStorageInfo({
      used: totalSize,
      limit: storageInfo.limit,
      percentage: Math.min(percentage, 100),
    });

    // Find next deadline
    const pendingAssignments = assignments.filter(
      (a) => a.status === 'pending'
    );
    if (pendingAssignments.length > 0) {
      const next = pendingAssignments.reduce((prev, current) =>
        prev.deadline < current.deadline ? prev : current
      );
      setNextDeadline(next);

      const days = Math.ceil(
        (next.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      setDaysUntilDeadline(days);
    }

    // Find next exam
    const upcomingExams = exams.filter((e) => e.examDate > new Date());
    if (upcomingExams.length > 0) {
      const next = upcomingExams.reduce((prev, current) =>
        prev.examDate < current.examDate ? prev : current
      );
      setNextExam(next);

      const days = Math.floor(
        (next.examDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      setDaysUntilExam(days);
    }
  }, [assignments, exams, storageInfo.limit]);

  // Load subjects from Firebase
  useEffect(() => {
    if (currentUser?.id) {
      const unsubscribe = loadSubjectsFromFirebase();
      return () => {
        if (unsubscribe) {
          unsubscribe.then(unsub => unsub && unsub());
        }
      };
    }
  }, [currentUser?.id, loadSubjectsFromFirebase]);

  // Load assignments from Firebase
  useEffect(() => {
    if (currentUser?.id) {
      const assignmentsQuery = query(
        collection(db, 'assignments'),
        where('studentId', '==', currentUser.id)
      );
      
      const unsubscribe = onSnapshot(assignmentsQuery, (snapshot) => {
        const assignmentsData: Assignment[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          assignmentsData.push({
            id: doc.id,
            studentId: data.studentId,
            title: data.title,
            subjectId: data.subjectId,
            subjectName: data.subjectName,
            pdfUrl: data.pdfUrl || '',
            deadline: data.deadline.toDate(),
            status: data.status,
            createdAt: data.createdAt.toDate(),
            priority: data.priority,
            fileSize: data.fileSize || 0,
            submissionType: data.submissionType,
          });
        });
        setAssignments(assignmentsData);
      });
      
      return () => unsubscribe();
    }
  }, [currentUser?.id]);

  // Load exams from Firebase
  useEffect(() => {
    if (currentUser?.id) {
      const examsQuery = query(
        collection(db, 'exams'),
        where('studentId', '==', currentUser.id)
      );
      
      const unsubscribe = onSnapshot(examsQuery, (snapshot) => {
        const examsData: Exam[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          examsData.push({
            id: doc.id,
            studentId: data.studentId,
            subjectId: data.subjectId,
            subjectName: data.subjectName,
            examType: data.examType,
            examDate: data.examDate.toDate(),
            startTime: data.startTime,
            endTime: data.endTime,
            room: data.room,
            notes: data.notes,
            createdAt: data.createdAt.toDate(),
          });
        });
        setExams(examsData);
      });
      
      return () => unsubscribe();
    }
  }, [currentUser?.id]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Semester-aware persistence (local backup per semester)
  const getSemesterKey = (userId: string, semester: string) =>
    `cf_${userId}_sem_${semester.replace(/\s+/g, '_')}`;

  const loadSemesterData = (userId: string, semester: string) => {
    try {
      const key = getSemesterKey(userId, semester);
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as {
        assignments: Assignment[];
        exams: Exam[];
      };
      // revive dates
      const reviveDate = (d: any) => new Date(d);
      parsed.assignments = parsed.assignments.map((a) => ({
        ...a,
        createdAt: reviveDate(a.createdAt as any),
        deadline: reviveDate(a.deadline as any),
      }));
      parsed.exams = parsed.exams.map((e) => ({
        ...e,
        createdAt: reviveDate(e.createdAt as any),
        examDate: reviveDate(e.examDate as any),
      }));
      return parsed;
    } catch {
      return null;
    }
  };

  const saveSemesterData = (
    userId: string,
    semester: string,
    data: { assignments: Assignment[]; exams: Exam[] }
  ) => {
    try {
      const key = getSemesterKey(userId, semester);
      localStorage.setItem(
        key,
        JSON.stringify({ assignments: data.assignments, exams: data.exams })
      );
    } catch {
      // ignore quota errors
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    if (!currentUser?.id) return;
    
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      try {
        await deleteDoc(doc(db, 'assignments', id));
        setAssignments(assignments.filter((a) => a.id !== id));
      } catch (error) {
        console.error('Error deleting assignment:', error);
        alert('Failed to delete assignment. Please try again.');
      }
    }
  };

  const handleDeleteExam = async (id: string) => {
    if (!currentUser?.id) return;
    
    if (window.confirm('Are you sure you want to delete this exam?')) {
      try {
        await deleteDoc(doc(db, 'exams', id));
        setExams(exams.filter((e) => e.id !== id));
      } catch (error) {
        console.error('Error deleting exam:', error);
        alert('Failed to delete exam. Please try again.');
      }
    }
  };

  const handleToggleAssignmentStatus = async (id: string) => {
    if (!currentUser?.id) return;
    
    try {
      const assignment = assignments.find(a => a.id === id);
      if (assignment) {
        const newStatus = assignment.status === 'completed' ? 'pending' : 'completed';
        
        await updateDoc(doc(db, 'assignments', id), {
          status: newStatus
        });
        
        setAssignments(
          assignments.map((a) =>
            a.id === id
              ? { ...a, status: newStatus }
              : a
          )
        );
      }
    } catch (error) {
      console.error('Error updating assignment status:', error);
      alert('Failed to update assignment status. Please try again.');
    }
  };

  const handleAddAssignment = async (
    assignment: Omit<Assignment, 'id' | 'studentId' | 'createdAt'>
  ) => {
    if (!currentUser?.id) return;
    
    try {
      const newAssignment = {
        ...assignment,
        studentId: currentUser.id,
        createdAt: new Date(),
      };
      
      const docRef = await addDoc(collection(db, 'assignments'), newAssignment);
      
      const newAssignmentWithId: Assignment = {
        ...newAssignment,
        id: docRef.id,
      };
      
      setAssignments([...assignments, newAssignmentWithId]);
      setShowUploadModal(false);
    } catch (error) {
      console.error('Error adding assignment:', error);
      alert('Failed to add assignment. Please try again.');
    }
  };

  const handleAddExam = async (
    exam: Omit<Exam, 'id' | 'studentId' | 'createdAt'>
  ) => {
    if (!currentUser?.id) return;
    
    try {
      const newExam = {
        ...exam,
        studentId: currentUser.id,
        createdAt: new Date(),
      };
      
      const docRef = await addDoc(collection(db, 'exams'), newExam);
      
      const newExamWithId: Exam = {
        ...newExam,
        id: docRef.id,
      };
      
      setExams([...exams, newExamWithId]);
      setShowExamModal(false);
    } catch (error) {
      console.error('Error adding exam:', error);
      alert('Failed to add exam. Please try again.');
    }
  };

  const handleAddSubject = async (name: string, code: string) => {
    if (!currentUser?.id) return;
    
    try {
      const newSubject = {
        name,
        code,
        studentId: currentUser.id,
        createdAt: new Date(),
      };
      
      const docRef = await addDoc(collection(db, 'subjects'), newSubject);
      
      // Auto-select the new subject in the current form if we're adding from a form
      if (showUploadModal) {
        setAssignmentForm(prev => ({ ...prev, subjectId: docRef.id }));
      } else if (showExamModal || showEditExamModal) {
        setExamForm(prev => ({ ...prev, subjectId: docRef.id }));
      }
      
      setShowSubjectsModal(false);
    } catch (error) {
      console.error('Error adding subject:', error);
      alert('Failed to add subject. Please try again.');
    }
  };

  const handleDeleteSubject = async (id: string) => {
    if (!currentUser?.id) return;
    
    if (window.confirm('Are you sure you want to delete this subject? This will also remove all related assignments and exams.')) {
      try {
        // Delete the subject
        await deleteDoc(doc(db, 'subjects', id));
        
        // Remove related assignments and exams
        setAssignments(assignments.filter(a => a.subjectId !== id));
        setExams(exams.filter(e => e.subjectId !== id));
      } catch (error) {
        console.error('Error deleting subject:', error);
        alert('Failed to delete subject. Please try again.');
      }
    }
  };

  const handleImportExamData = async () => {
    if (!currentUser?.id) return;
    
    const examData = [
      {
        courseCode: '202003402',
        courseName: 'FUNDAMENTALS OF ECONOMICS AND BUSINESS MANAGEMENT',
        examDate: '2025-09-19',
        startTime: '09:30',
        endTime: '10:30'
      },
      {
        courseCode: '202230302',
        courseName: 'SIGNALS SYSTEMS AND APPLICATIONS',
        examDate: '2025-09-19',
        startTime: '14:00',
        endTime: '15:00'
      },
      {
        courseCode: '202230301',
        courseName: 'DISCRETE MATHEMATICS AND APPLICATIONS',
        examDate: '2025-09-20',
        startTime: '09:30',
        endTime: '10:30'
      },
      {
        courseCode: '202230303',
        courseName: 'DIGITAL COMPUTER ORGANIZATION',
        examDate: '2025-09-20',
        startTime: '09:30',
        endTime: '10:30'
      },
      {
        courseCode: '202003403',
        courseName: 'INDIAN ETHOS AND VALUE EDUCATION',
        examDate: '2025-09-22',
        startTime: '14:00',
        endTime: '15:00'
      },
      {
        courseCode: '202230304',
        courseName: 'DATA STRUCTURES AND ALGORITHMS',
        examDate: '2025-09-22',
        startTime: '09:30',
        endTime: '10:30'
      }
    ];

    try {
      console.log('Starting data import...');
      
      // First add subjects
      const subjects = [];
      for (const exam of examData) {
        const subject = {
          name: exam.courseName,
          code: exam.courseCode,
          studentId: currentUser.id,
          createdAt: new Date(),
        };
        
        console.log(`Adding subject: ${exam.courseName}`);
        const subjectRef = await addDoc(collection(db, 'subjects'), subject);
        subjects.push({ ...subject, id: subjectRef.id });
        console.log(`✅ Subject added with ID: ${subjectRef.id}`);
      }
      
      // Now add the exams
      for (const exam of examData) {
        const subject = subjects.find(s => s.code === exam.courseCode);
        if (subject) {
          const examData = {
            studentId: currentUser.id,
            subjectId: subject.id,
            subjectName: subject.name,
            examType: 'mid', // Mid exam as specified
            examDate: new Date(exam.examDate),
            startTime: exam.startTime,
            endTime: exam.endTime,
            room: 'TBD', // Room to be determined
            notes: `Mid Exam - ${exam.startTime} to ${exam.endTime}`,
            createdAt: new Date(),
          };
          
          console.log(`Adding exam: ${exam.courseName}`);
          const examRef = await addDoc(collection(db, 'exams'), examData);
          console.log(`✅ Exam added with ID: ${examRef.id}`);
        }
      }
      
      alert('🎉 Data import completed successfully!');
      console.log('🎉 Data import completed successfully!');
      console.log(`Added ${subjects.length} subjects and ${examData.length} exams`);
      
          } catch (error) {
        console.error('Error importing data:', error);
        alert('Error importing data: ' + (error as Error).message);
      }
  };

  const handleEditExam = (exam: Exam) => {
    setEditingExam(exam);
    setExamForm({
      subjectId: exam.subjectId,
      examType: exam.examType,
      examDate: exam.examDate.toISOString().split('T')[0],
      startTime: exam.startTime,
      endTime: exam.endTime,
      room: exam.room || '',
      notes: exam.notes || '',
    });
    setShowEditExamModal(true);
  };

  const handleUpdateExam = async () => {
    if (!editingExam || !currentUser?.id) return;
    
    try {
      const subject = subjects.find(s => s.id === examForm.subjectId);
      if (subject) {
        const updatedExam: Exam = {
          ...editingExam,
          subjectId: examForm.subjectId,
          subjectName: subject.name,
          examType: examForm.examType,
          examDate: new Date(examForm.examDate),
          startTime: examForm.startTime,
          endTime: examForm.endTime,
          room: examForm.room || undefined,
          notes: examForm.notes || undefined,
        };
        
        // Update in Firebase
        await updateDoc(doc(db, 'exams', editingExam.id), {
          subjectId: examForm.subjectId,
          subjectName: subject.name,
          examType: examForm.examType,
          examDate: new Date(examForm.examDate),
          startTime: examForm.startTime,
          endTime: examForm.endTime,
          room: examForm.room || null,
          notes: examForm.notes || null,
        });
        
        // Update local state
        setExams(exams.map(e => e.id === editingExam.id ? updatedExam : e));
        setShowEditExamModal(false);
        setEditingExam(null);
        setExamForm({
          subjectId: '',
          examType: 'lecture',
          examDate: '',
          startTime: '',
          endTime: '',
          room: '',
          notes: '',
        });
      }
    } catch (error) {
      console.error('Error updating exam:', error);
      alert('Failed to update exam. Please try again.');
    }
  };

  const handleChangeSemester = async () => {
    const newSemester = prompt('Enter new semester (e.g., Fall 2024):');
    if (!newSemester || !currentUser) return;

    const currentSemester = currentUser.semester || 'Default';
    const userId = currentUser.id;

    // Backup current data into localStorage under current semester
    saveSemesterData(userId, currentSemester, { assignments, exams });

    // Try to load data for the new semester; if none, start fresh
    const existing = loadSemesterData(userId, newSemester);
    if (existing) {
      setAssignments(existing.assignments);
      setExams(existing.exams);
    } else {
      setAssignments([]);
      setExams([]);
    }

    // Persist semester change to Firestore user profile (merge)
    try {
      await setDoc(
        doc(db, 'users', userId),
        { semester: newSemester },
        { merge: true }
      );
    } catch (e) {
      // non-blocking: still keep UI state updated
    }
  };

  // Account actions
  const exportData = () => {
    try {
      const payload = {
        user: currentUser,
        assignments,
        exams,
        exportedAt: new Date().toISOString(),
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: 'application/json;charset=utf-8',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'campusflow-export.json';
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('Failed to export data.');
    }
  };

  const downloadAllFiles = () => {
    // Placeholder: files are not stored; this triggers export for now
    exportData();
  };

  const changePassword = () => {
    alert('Password changes are managed by your sign-in provider (Google).');
  };

  const deleteAccount = () => {
    alert('Account deletion is not yet implemented. Contact support.');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStorageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const calculateAutoPriority = (deadline: string): 'low' | 'medium' | 'high' => {
    if (!deadline) return 'medium';
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const daysUntilDeadline = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilDeadline <= 2) return 'high';
    if (daysUntilDeadline <= 7) return 'medium';
    return 'low';
  };

  const getTotalUsedStorage = () => {
    return assignments.reduce((total, assignment) => total + (assignment.fileSize || 0), 0);
  };

  const getRemainingStorage = () => {
    return storageInfo.limit - getTotalUsedStorage();
  };

  const renderDashboard = () => {
    const ResponsiveGridLayout = WidthProvider(Responsive);
    const ordered = [...cards].sort((a, b) => a.order - b.order).filter((c) => c.enabled);

    return (
      <div className="space-y-6">
        {/* Top info bar */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          <div 
            className="p-4 rounded-lg bg-white border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => setCurrentPage('assignments')}
          >
            <p className="text-sm text-gray-600">Pending Assignments</p>
            <p className="text-2xl font-bold text-gray-900">{assignments.filter(a => a.status === 'pending').length}</p>
            <p className="text-xs text-gray-500 mt-1">Click to view all</p>
          </div>
          <div 
            className="p-4 rounded-lg bg-white border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => setCurrentPage('exams')}
          >
            <p className="text-sm text-gray-600">Next Exam</p>
            <p className="text-2xl font-bold text-gray-900">{daysUntilExam > 0 ? `${daysUntilExam} days` : '—'}</p>
            {nextExam && (
              <p className="text-xs text-gray-500 mt-1">{nextExam.subjectName}</p>
            )}
            <p className="text-xs text-gray-500">Click to view all</p>
          </div>
          <div 
            className="p-4 rounded-lg bg-white border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => setCurrentPage('subjects')}
          >
            <p className="text-sm text-gray-600">Total Subjects</p>
            <p className="text-2xl font-bold text-gray-900">{subjects.length}</p>
            <p className="text-xs text-gray-500 mt-1">Click to manage</p>
          </div>
          <div 
            className="p-4 rounded-lg bg-white border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => setCurrentPage('storage')}
          >
            <p className="text-sm text-gray-600">Storage Used</p>
            <p className="text-2xl font-bold text-gray-900">{storageInfo.percentage.toFixed(0)}%</p>
            <p className="text-xs text-gray-500 mt-1">Click to manage</p>
          </div>
        </div>

        {/* Header with Edit Mode Toggle */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {currentUser?.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-gray-600">Here is your dashboard overview.</p>
          </div>
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isEditMode 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isEditMode ? 'Save Layout' : 'Rearrange Widgets'}
          </button>
        </div>

        {/* Draggable Grid Layout */}
        <ResponsiveGridLayout
          className="layout"
          layouts={{ lg: widgetLayout }}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={100}
          isDraggable={isEditMode}
          isResizable={isEditMode}
          onLayoutChange={handleLayoutChange}
          margin={[16, 16]}
        >
          {ordered.map((c) => (
            <div key={c.id} className="overflow-hidden">
              {renderCardById(c)}
            </div>
          ))}
        </ResponsiveGridLayout>
      </div>
    );
  };

  const renderCardById = (c: DashboardCard) => {
    if (c.id === 'deadlines' && nextDeadline) {
      return (
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-8 rounded-xl h-full flex flex-col justify-between shadow-lg">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-3">⏰ Next Deadline</h2>
              <p className="text-orange-100 text-base mb-2 truncate">{nextDeadline.title}</p>
              <p className="text-orange-200 text-sm">{nextDeadline.subjectName}</p>
            </div>
            <div className="text-right ml-6">
              <div className="text-4xl font-bold">{daysUntilDeadline}</div>
              <div className="text-orange-100 text-sm">days left</div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className={`px-4 py-2 rounded-full text-sm font-semibold bg-white bg-opacity-20 text-white`}>
              {nextDeadline.priority.toUpperCase()} PRIORITY
            </span>
            <button 
              onClick={() => setCurrentPage('assignments')}
              className="text-orange-100 hover:text-white text-sm font-medium hover:underline"
            >
              View All →
            </button>
          </div>
        </div>
      );
    }

    if (c.id === 'next-exam' && nextExam) {
      return (
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-8 rounded-xl h-full flex flex-col justify-between shadow-lg">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-3">📚 Next Exam</h2>
              <p className="text-blue-100 text-base mb-2">{nextExam.subjectName}</p>
              <p className="text-blue-200 text-sm mb-1">{nextExam.examDate.toLocaleDateString()}</p>
              <p className="text-blue-200 text-sm">{nextExam.startTime} - {nextExam.endTime}</p>
            </div>
            <div className="text-right ml-6">
              <div className="text-4xl font-bold">{daysUntilExam}</div>
              <div className="text-blue-100 text-sm">days left</div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="px-4 py-2 rounded-full text-sm font-semibold bg-white bg-opacity-20 text-white">
              {nextExam.examType.toUpperCase()}
            </span>
            <button 
              onClick={() => setCurrentPage('exams')}
              className="text-blue-100 hover:text-white text-sm font-medium hover:underline"
            >
              View All →
            </button>
          </div>
        </div>
      );
    }

    if (c.id === 'quick-stats') {
      const pendingCount = assignments.filter((a) => a.status === 'pending').length;
      const completedCount = assignments.filter((a) => a.status === 'completed').length;
      return (
        <div className="h-full flex flex-col p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <ChartBarIcon className="w-6 h-6 mr-2 text-blue-600" />
            Academic Overview
          </h3>
          <div className="grid grid-cols-2 gap-4 flex-1 overflow-y-auto max-h-80">
            <button 
              onClick={() => setCurrentPage('assignments')}
              className="flex flex-col items-center justify-center p-4 bg-white rounded-xl hover:shadow-md transition-all duration-300 hover:scale-105 border border-blue-100"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                <DocumentTextIcon className="w-5 h-5 text-blue-600" />
              </div>
                <p className="text-2xl font-bold text-gray-900">{assignments.length}</p>
              <p className="text-xs text-gray-600 text-center">Total Assignments</p>
            </button>
            <button 
              onClick={() => setCurrentPage('assignments')}
              className="flex flex-col items-center justify-center p-4 bg-white rounded-xl hover:shadow-md transition-all duration-300 hover:scale-105 border border-orange-100"
            >
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mb-2">
                <ClockIcon className="w-5 h-5 text-orange-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
              <p className="text-xs text-gray-600 text-center">Pending</p>
            </button>
            <button 
              onClick={() => setCurrentPage('assignments')}
              className="flex flex-col items-center justify-center p-4 bg-white rounded-xl hover:shadow-md transition-all duration-300 hover:scale-105 border border-green-100"
            >
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-2">
                <CheckIcon className="w-5 h-5 text-green-600" />
            </div>
              <p className="text-2xl font-bold text-gray-900">{completedCount}</p>
              <p className="text-xs text-gray-600 text-center">Completed</p>
            </button>
            <button 
              onClick={() => setCurrentPage('exams')}
              className="flex flex-col items-center justify-center p-4 bg-white rounded-xl hover:shadow-md transition-all duration-300 hover:scale-105 border border-purple-100"
            >
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-2">
                <BookOpenIcon className="w-5 h-5 text-purple-600" />
          </div>
              <p className="text-2xl font-bold text-gray-900">{exams.length}</p>
              <p className="text-xs text-gray-600 text-center">Exams</p>
            </button>
            <button 
              onClick={() => setCurrentPage('subjects')}
              className="flex flex-col items-center justify-center p-4 bg-white rounded-xl hover:shadow-md transition-all duration-300 hover:scale-105 border border-indigo-100"
            >
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mb-2">
                <BookOpenIcon className="w-5 h-5 text-indigo-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{subjects.length}</p>
              <p className="text-xs text-gray-600 text-center">Subjects</p>
            </button>
          </div>
        </div>
      );
    }

    if (c.id === 'exams') {
      const upcomingExams = exams
        .filter((e) => e.examDate > new Date())
        .sort((a, b) => a.examDate.getTime() - b.examDate.getTime())
        .slice(0, 3);
      return (
        <div className="card cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setCurrentPage('exams')}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Exams</h3>
          {upcomingExams.length === 0 ? (
            <p className="text-sm text-gray-500">No upcoming exams.</p>
          ) : (
            <div className="space-y-3">
              {upcomingExams.map((exam) => {
                const days = Math.ceil((exam.examDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                return (
                  <div key={exam.id} className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{exam.subjectName}</p>
                        <p className="text-xs text-gray-600">{exam.examType.toUpperCase()} • {exam.examDate.toLocaleDateString()}</p>
                        <p className="text-xs text-gray-500">{exam.startTime} - {exam.endTime} • {exam.room}</p>
                      </div>
                      <span className="text-sm font-semibold text-blue-600">{days} days</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    if (c.id === 'materials') {
      const recentMaterials = materials
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 3);
      return (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Materials</h3>
          {recentMaterials.length === 0 ? (
            <p className="text-sm text-gray-500">No materials uploaded.</p>
          ) : (
            <div className="space-y-3">
              {recentMaterials.map((material) => (
                <div key={material.id} className="p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{material.title}</p>
                      <p className="text-xs text-gray-600">{material.subjectName}</p>
                      <p className="text-xs text-gray-500">{material.fileType.toUpperCase()} • {formatFileSize(material.fileSize * 1024 * 1024)}</p>
                    </div>
                    <span className="text-xs text-gray-500">{material.createdAt.toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (c.id === 'storage') {
      return (
        <div className="card h-full flex flex-col p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Storage Usage</h3>
            <span className={`text-sm font-medium px-3 py-1 rounded-full ${getStorageColor(storageInfo.percentage)}`}>
              {storageInfo.percentage.toFixed(1)}%
            </span>
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <div className="w-full bg-gray-200 rounded-full h-4 mb-6">
            <div
                className={`h-4 rounded-full transition-all duration-300 ${
                storageInfo.percentage >= 90
                  ? 'bg-red-500'
                  : storageInfo.percentage >= 75
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
              }`}
              style={{ width: `${storageInfo.percentage}%` }}
            ></div>
          </div>
            <div className="text-center">
              <p className="text-base text-gray-600 font-medium">
            {formatFileSize(storageInfo.used * 1024 * 1024)} / {formatFileSize(storageInfo.limit * 1024 * 1024)}
          </p>
              <p className="text-sm text-gray-500 mt-2">
                {formatFileSize((storageInfo.limit - storageInfo.used) * 1024 * 1024)} remaining
          </p>
            </div>
          </div>
        </div>
      );
    }

    if (c.id === 'notifications') {
      const unreadCount = notifications.filter(n => !n.isRead).length;
      
      const handleMarkAsRead = (notificationId: string) => {
        setNotifications(notifications.map(n => 
          n.id === notificationId ? { ...n, isRead: true } : n
        ));
      };

      return (
        <div className="h-full flex flex-col p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center">
              <BellIcon className="w-6 h-6 mr-2 text-blue-600" />
              Notifications
            </h3>
            <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border">
              {unreadCount} unread
            </span>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto max-h-64">
            {notifications.slice(0, 5).map((n) => (
              <div 
                key={n.id} 
                className={`p-3 rounded-lg transition-all duration-300 cursor-pointer hover:shadow-md ${
                  !n.isRead ? 'bg-orange-50 border-l-4 border-orange-400 hover:bg-orange-100' : 'bg-white hover:bg-gray-50'
                }`}
                onClick={() => handleMarkAsRead(n.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate text-sm">{n.title}</p>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{n.message}</p>
                    <p className="text-xs text-gray-500 mt-2">{n.createdAt.toLocaleDateString()}</p>
                  </div>
                  {!n.isRead && (
                    <div className="w-2 h-2 bg-orange-500 rounded-full ml-2 mt-1 flex-shrink-0 animate-pulse"></div>
                  )}
                </div>
              </div>
            ))}
            {notifications.length === 0 && (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <BellIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No notifications</p>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (c.id === 'welcome') {
      const upcoming = assignments
        .filter((a) => a.status === 'pending')
        .sort((a, b) => a.deadline.getTime() - b.deadline.getTime());
      return (
        <div className="card h-full flex flex-col p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Upcoming Assignments</h3>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{upcoming.length} pending</span>
          </div>
          {upcoming.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-sm text-gray-500 text-center">No pending assignments.</p>
            </div>
          ) : (
            <div className="flex-1 space-y-3 overflow-y-auto pr-2 max-h-80">
              {upcoming.map((a) => {
                const days = Math.ceil((a.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                const priority = days <= 2 ? 'high' : days <= 5 ? 'medium' : 'low';
                return (
                  <div 
                    key={a.id} 
                    className={`flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-all duration-200 ${
                      a.pdfUrl ? 'hover:shadow-md hover:scale-[1.01]' : ''
                    }`}
                    onClick={() => {
                      if (a.pdfUrl) {
                        window.open(a.pdfUrl, '_blank');
                      }
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate text-sm">{a.title}</p>
                      <p className="text-xs text-gray-600 truncate mt-1">{a.subjectName} • {a.deadline.toLocaleDateString()}</p>
                      <p className={`text-xs mt-1 ${a.pdfUrl ? 'text-green-600' : 'text-gray-500'}`}>
                        {a.pdfUrl ? '📄 Click to view PDF' : 'No file attached'}
                      </p>
                    </div>
                    <div className="flex flex-col items-end space-y-1 ml-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(priority)}`}>
                      {priority.toUpperCase()}
                    </span>
                      <span className="text-xs text-gray-500 font-medium">{days}d left</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    // Academic Widgets
    if (c.id === 'upcoming-deadlines') {
      const upcomingDeadlines = [
        ...assignments.filter(a => a.status === 'pending').slice(0, 2),
        ...exams.filter(e => e.examDate > new Date()).slice(0, 1)
      ].sort((a, b) => {
        const aDate = 'deadline' in a ? a.deadline : a.examDate;
        const bDate = 'deadline' in b ? b.deadline : b.examDate;
        return aDate.getTime() - bDate.getTime();
      }).slice(0, 3);

      return (
        <div className="h-full flex flex-col p-6 bg-gradient-to-br from-red-50 to-orange-50 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <ClockIcon className="w-6 h-6 mr-2 text-red-600" />
            Upcoming Deadlines
          </h3>
          <div className="flex-1 space-y-3 overflow-y-auto max-h-64">
            {upcomingDeadlines.map((item, index) => {
              const isAssignment = 'deadline' in item;
              const daysLeft = Math.ceil(((isAssignment ? item.deadline : item.examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              return (
                <div key={index} className="p-3 bg-white rounded-lg border border-red-100 hover:shadow-md transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{isAssignment ? item.title : `${item.examType.toUpperCase()} Exam`}</p>
                      <p className="text-xs text-gray-600">{item.subjectName}</p>
                      <p className="text-xs text-gray-500">{isAssignment ? 'Assignment' : 'Exam'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-red-600">{daysLeft}d</p>
                      <p className="text-xs text-gray-500">left</p>
                    </div>
                  </div>
                </div>
              );
            })}
            {upcomingDeadlines.length === 0 && (
              <div className="text-center py-8">
                <ClockIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No upcoming deadlines</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (c.id === 'upcoming-exams') {
      const upcomingExams = exams
        .filter(e => e.examDate > new Date())
        .sort((a, b) => {
          const aDate = new Date(a.examDate.getFullYear(), a.examDate.getMonth(), a.examDate.getDate()).getTime();
          const bDate = new Date(b.examDate.getFullYear(), b.examDate.getMonth(), b.examDate.getDate()).getTime();
          if (aDate !== bDate) return aDate - bDate;
          const [aH, aM] = (a.startTime || '00:00').split(':').map(Number);
          const [bH, bM] = (b.startTime || '00:00').split(':').map(Number);
          return aH !== bH ? aH - bH : aM - bM;
        });

      const calculateGap = (currentIndex: number) => {
        if (currentIndex === 0) return null;
        const current = upcomingExams[currentIndex];
        const previous = upcomingExams[currentIndex - 1];
        const sameDay = current.examDate.toDateString() === previous.examDate.toDateString();
        if (sameDay) {
          const [prevEndH, prevEndM] = (previous.endTime || '00:00').split(':').map(Number);
          const [currStartH, currStartM] = (current.startTime || '00:00').split(':').map(Number);
          const prevEnd = new Date(previous.examDate);
          prevEnd.setHours(prevEndH, prevEndM, 0, 0);
          const currStart = new Date(current.examDate);
          currStart.setHours(currStartH, currStartM, 0, 0);
          const diffMs = currStart.getTime() - prevEnd.getTime();
          const hours = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));
          const minutes = Math.max(0, Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60)));
          return { type: 'hours', label: `Gap: ${hours}h ${minutes}m` } as const;
        }
        const dayDiff = Math.ceil((current.examDate.getTime() - previous.examDate.getTime()) / (1000 * 60 * 60 * 24));
        return { type: 'days', label: `Gap: ${dayDiff} days` } as const;
      };

  return (
        <div className="h-full flex flex-col p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <BookOpenIcon className="w-6 h-6 mr-2 text-purple-600" />
            Upcoming Exams
          </h3>
          <div className="flex-1 space-y-4 overflow-y-auto max-h-80">
            {upcomingExams.map((exam, index) => {
              const daysLeft = Math.ceil((exam.examDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              const gap = calculateGap(index);
              
              return (
                <div key={exam.id} className="space-y-2">
                  {gap && (
                    <div className="text-center">
                      <div className="inline-flex items-center px-3 py-1 bg-gray-100 rounded-full">
                        <span className="text-xs text-gray-600">{gap.label}</span>
        </div>
                    </div>
                  )}
                  <div className="p-4 bg-white rounded-lg border border-purple-100 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{exam.examType.toUpperCase()} Exam</p>
                        <p className="text-sm text-gray-600">{exam.subjectName}</p>
                        <p className="text-xs text-gray-500">{exam.examDate.toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-purple-600">{daysLeft}</p>
                        <p className="text-xs text-gray-500">days left</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {upcomingExams.length === 0 && (
              <div className="text-center py-8">
                <BookOpenIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No upcoming exams</p>
              </div>
            )}
          </div>
        </div>
      );
    }



    // Productivity Widgets
    if (c.id === 'pomodoro-timer') {
      const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      };

      const handleStart = () => {
        setIsPomodoroRunning(!isPomodoroRunning);
      };

      const handleReset = () => {
        setIsPomodoroRunning(false);
        setPomodoroTime(25 * 60);
      };

  return (
        <div className="h-full flex flex-col p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center">
              <ClockIcon className="w-6 h-6 mr-2 text-blue-600" />
              Pomodoro Timer
            </h3>
            <button
              onClick={() => setIsPomodoroMinimized(!isPomodoroMinimized)}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
            >
              {isPomodoroMinimized ? '🔽' : '🔼'}
            </button>
          </div>
          {isPomodoroMinimized ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${
                  isPomodoroRunning 
                    ? 'bg-gradient-to-r from-green-100 to-emerald-100 ring-2 ring-green-200 animate-pulse' 
                    : 'bg-gradient-to-r from-blue-100 to-indigo-100'
                }`}>
                  <span className={`text-lg font-bold transition-colors duration-300 ${
                    isPomodoroRunning ? 'text-green-600' : 'text-blue-600'
                  }`}>
                    {formatTime(pomodoroTime)}
                  </span>
                </div>
                <div className="flex space-x-1">
                  <button 
                    onClick={handleStart}
                    className={`px-3 py-1 rounded text-xs font-medium transition-all duration-300 ${
                      isPomodoroRunning 
                        ? 'bg-red-600 hover:bg-red-700 text-white' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {isPomodoroRunning ? 'Pause' : 'Start'}
                  </button>
                  <button 
                    onClick={handleReset}
                    className="px-3 py-1 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded text-xs font-medium transition-colors duration-300"
                  >
                    Reset
                  </button>
                </div>
              </div>
              <button
                onClick={handleRefreshAi}
                disabled={isAiGenerating}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                  isAiGenerating
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200'
                }`}
                title="Refresh AI suggestions"
              >
                {isAiGenerating ? 'Refreshing…' : 'Refresh'}
              </button>
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-center space-y-4">
              <div className="text-center">
                <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center mb-4 transition-all duration-300 ${
                  isPomodoroRunning 
                    ? 'bg-gradient-to-r from-green-100 to-emerald-100 ring-4 ring-green-200 animate-pulse' 
                    : 'bg-gradient-to-r from-blue-100 to-indigo-100'
                }`}>
                  <span className={`text-2xl font-bold transition-colors duration-300 ${
                    isPomodoroRunning ? 'text-green-600' : 'text-blue-600'
                  }`}>
                    {formatTime(pomodoroTime)}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {isPomodoroRunning ? 'Focus Session Active' : 'Ready to Focus'}
                </p>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={handleStart}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-300 ${
                    isPomodoroRunning 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {isPomodoroRunning ? 'Pause' : 'Start'}
                </button>
                <button 
                  onClick={handleReset}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-300"
                >
                  Reset
                </button>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Sessions today: {pomodoroSessions.length}</p>
                {isPomodoroRunning && (
                  <div className="mt-2 flex justify-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
                  </div>
                )}
              </div>
            </div>
          )}
    </div>
  );
    }

    if (c.id === 'todo-list') {
      return (
        <div className="h-full flex flex-col p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center">
              <CheckIcon className="w-6 h-6 mr-2 text-green-600" />
              Today's To-Do
            </h3>
            <div className="text-sm text-gray-600">
              {todos.filter(t => t.completed).length}/{todos.length}
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${todos.length > 0 ? (todos.filter(t => t.completed).length / todos.length) * 100 : 0}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {Math.round(todos.length > 0 ? (todos.filter(t => t.completed).length / todos.length) * 100 : 0)}% complete
            </p>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto">
            {todos.map((todo, index) => (
              <div 
                key={todo.id} 
                className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 hover:shadow-md ${
                  todo.completed 
                    ? 'bg-green-100 border border-green-200' 
                    : 'bg-white border border-gray-200 hover:border-green-300'
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => {
                    setTodos(todos.map(t => 
                      t.id === todo.id ? { ...t, completed: !t.completed } : t
                    ));
                  }}
                  className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                />
                <div className="flex-1">
                  <p className={`text-sm font-medium transition-all duration-300 ${
                    todo.completed ? 'line-through text-gray-500' : 'text-gray-900'
                  }`}>
                    {todo.title}
                  </p>
                  {todo.description && (
                    <p className="text-xs text-gray-500 mt-1">{todo.description}</p>
                  )}
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  todo.priority === 'high' ? 'bg-red-100 text-red-800' :
                  todo.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {todo.priority}
                </span>
              </div>
            ))}
            
            {todos.length === 0 && (
              <div className="text-center py-8">
                <CheckIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No tasks yet. Add one below!</p>
              </div>
            )}
          </div>
          
          <button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300 mt-4 shadow-md hover:shadow-lg">
            + Add Task
          </button>
        </div>
      );
    }

    if (c.id === 'streak-tracker') {
      const assignmentStreak = streaks.find(s => s.type === 'assignments');
      return (
        <div className="card h-full flex flex-col p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Streak Tracker</h3>
          <div className="flex-1 flex flex-col justify-center space-y-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-600">{assignmentStreak?.currentStreak || 0}</p>
              <p className="text-sm text-gray-600">Day Streak</p>
            </div>
            <div className="space-y-2">
              {streaks.map((streak) => (
                <div key={streak.type} className="flex justify-between text-sm">
                  <span className="capitalize">{streak.type}</span>
                  <span className="font-medium">{streak.currentStreak} days</span>
                </div>
              ))}
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Keep it up! 🔥</p>
            </div>
          </div>
        </div>
      );
    }

    if (c.id === 'weekly-summary') {
      return (
        <div className="card h-full flex flex-col p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Weekly Summary</h3>
          <div className="flex-1 space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">{weeklySummary.week}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-lg font-bold text-blue-600">{weeklySummary.assignmentsCompleted}</p>
                <p className="text-xs text-gray-600">Assignments</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-lg font-bold text-green-600">{weeklySummary.studyHours}h</p>
                <p className="text-xs text-gray-600">Study Hours</p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <p className="text-lg font-bold text-purple-600">{weeklySummary.pomodoroSessions}</p>
                <p className="text-xs text-gray-600">Pomodoro</p>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <p className="text-lg font-bold text-orange-600">{weeklySummary.examsAttempted}</p>
                <p className="text-xs text-gray-600">Exams</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Smart Widgets
    if (c.id === 'motivation-quote') {
      const todayQuote = motivationQuotes[0];
      return (
        <div className="card h-full flex flex-col p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Daily Motivation</h3>
          <div className="flex-1 flex flex-col justify-center">
            <div className="text-center space-y-4">
              <p className="text-sm italic text-gray-700">"{todayQuote.text}"</p>
              <p className="text-xs text-gray-500">- {todayQuote.author}</p>
              <button className="text-xs text-blue-600 hover:text-blue-800">
                New Quote
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (c.id === 'ai-suggestions') {
      const unreadSuggestions = aiSuggestions.filter(s => !s.isRead);
      return (
        <div className="h-full flex flex-col p-6 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 rounded-lg shadow-lg relative overflow-hidden">
          {/* Rainbow animated background */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-r from-orange-400 to-red-400 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full blur-xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full blur-xl animate-pulse delay-500"></div>
            <div className="absolute top-1/4 right-1/4 w-20 h-20 bg-gradient-to-r from-orange-300 to-pink-300 rounded-full blur-xl animate-pulse delay-700"></div>
            <div className="absolute bottom-1/4 left-1/4 w-18 h-18 bg-gradient-to-r from-yellow-300 to-orange-300 rounded-full blur-xl animate-pulse delay-300"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 rounded-lg flex items-center justify-center animate-pulse">
                    <BellIcon className="w-7 h-7 text-white" />
                  </div>
                  {isAiGenerating && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-400 rounded-full animate-ping"></div>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                    AI Assistant
                  </h3>
                  <p className="text-sm text-gray-600">
                    {isAiGenerating ? 'Generating insights...' : 'Smart study recommendations'}
                  </p>
                </div>
              </div>
              {isAiGenerating && (
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce delay-200"></div>
                </div>
              )}
            </div>
            
            <div className="flex-1 space-y-3 overflow-y-auto pr-2">
              {unreadSuggestions.slice(0, 3).map((suggestion, index) => (
                <div 
                  key={suggestion.id} 
                  className="p-4 bg-white/80 backdrop-blur-sm rounded-lg border border-orange-100 hover:border-orange-200 transition-all duration-300 hover:shadow-md hover:scale-[1.02]"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <p className="font-semibold text-gray-900">{suggestion.title}</p>
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{suggestion.description}</p>
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                          suggestion.priority === 'high' ? 'bg-red-100 text-red-800 border border-red-200' :
                          suggestion.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                          'bg-green-100 text-green-800 border border-green-200'
                        }`}>
                          {suggestion.priority}
                        </span>
                        {suggestion.relatedSubjectName && (
                          <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200 rounded-full">
                            {suggestion.relatedSubjectName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {unreadSuggestions.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-orange-100 to-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BellIcon className="w-8 h-8 text-orange-400" />
                  </div>
                  <p className="text-gray-500">All caught up! AI will suggest new tips soon.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

// (Removed RGL component)



function getCardSpanClass(size: 's' | 'm' | 'l' = 's') {
  switch (size) {
    case 'l':
      return 'md:col-span-2 xl:col-span-2 2xl:col-span-2';
    case 'm':
      return 'md:col-span-1 xl:col-span-1 2xl:col-span-1';
    default:
      return 'md:col-span-1 xl:col-span-1 2xl:col-span-1';
  }
}

function getCardHeightClass(size: 's' | 'm' | 'l' = 's') {
  switch (size) {
    case 'l':
      return 'h-[32rem]';
    case 'm':
      return 'h-64';
    default:
      return 'h-56';
  }
}

function sizeToRowClass(size: 's' | 'm' | 'l' = 's') {
  switch (size) {
    case 'l':
      return 'row-span-3';
    case 'm':
      return 'row-span-2';
    default:
      return 'row-span-1';
  }
}

function CardWithRemove({ card, onRemove, children }: { card: DashboardCard; onRemove: () => void; children: React.ReactNode }) {
  return (
    <div className="relative group">
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button onClick={onRemove} className="px-2 py-1 text-xs bg-red-500 text-white rounded">Remove</button>
      </div>
      {children}
    </div>
  );
}

  // helper components defined below

  const renderAssignments = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Assignments</h1>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowUploadModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Add Assignment</span>
          </button>
        </div>
      </div>

      {/* Priority Filter */}
      <div className="flex space-x-2">
        {([['all','All'], ['high','High Priority'], ['medium','Medium Priority'], ['low','Low Priority']] as const).map(([key,label]) => (
          <button
            key={key}
            onClick={() => setAssignmentFilter(key)}
            className={`px-4 py-2 rounded-lg font-medium ${assignmentFilter === key ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            {label}
        </button>
        ))}
      </div>

      <div className="card">
        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-white z-10">
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">
                  Title
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">
                  Subject
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">
                  Priority
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">
                  Deadline
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">
                  Status
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">
                  File Size
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {assignments
                .filter(a => assignmentFilter === 'all' ? true : a.priority === assignmentFilter)
                .slice()
                .sort((a, b) => {
                  // Pending first, then by earliest deadline
                  const aCompleted = a.status === 'completed' ? 1 : 0;
                  const bCompleted = b.status === 'completed' ? 1 : 0;
                  if (aCompleted !== bCompleted) return aCompleted - bCompleted;
                  const aTime = a.deadline ? a.deadline.getTime() : Number.MAX_SAFE_INTEGER;
                  const bTime = b.deadline ? b.deadline.getTime() : Number.MAX_SAFE_INTEGER;
                  return aTime - bTime;
                })
                .map((assignment) => (
                <tr
                  key={assignment.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <DocumentTextIcon className="w-5 h-5 text-gray-400" />
                      <span className="font-medium text-gray-900">
                        {assignment.title}
                      </span>
                      {assignment.pdfUrl && (
                        <span className="text-xs text-green-600">📄</span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-700">
                    {assignment.subjectName}
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(
                        assignment.priority
                      )}`}
                    >
                      {assignment.priority.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-gray-700">
                    {assignment.deadline.toLocaleDateString()}
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        assignment.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {assignment.status === 'completed'
                        ? 'Completed'
                        : 'Pending'}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-gray-700">
                    {assignment.fileSize
                      ? formatFileSize(assignment.fileSize * 1024 * 1024)
                      : 'N/A'}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex space-x-2">
                      {assignment.pdfUrl ? (
                        <button 
                          onClick={() => window.open(assignment.pdfUrl, '_blank')}
                          className="text-primary hover:text-orange-600 text-sm font-medium"
                        >
                          View PDF
                      </button>
                      ) : (
                        <span className="text-gray-400 text-sm">No PDF</span>
                      )}
                      <button
                        onClick={() =>
                          handleToggleAssignmentStatus(assignment.id)
                        }
                        className={`text-sm font-medium ${
                          assignment.status === 'pending'
                            ? 'text-green-600 hover:text-green-700'
                            : 'text-yellow-600 hover:text-yellow-700'
                        }`}
                      >
                        {assignment.status === 'pending'
                          ? 'Mark Complete'
                          : 'Mark Pending'}
                      </button>
                      <button
                        onClick={() => handleDeleteAssignment(assignment.id)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderExams = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Exams</h1>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowExamModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Add Exam</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exams.map((exam) => {
          const daysUntil = Math.ceil(
            (exam.examDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          );
          const isPast = exam.examDate < new Date();

          return (
            <div key={exam.id} className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {exam.subjectName}
                </h3>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    isPast
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {isPast ? 'Completed' : `${daysUntil} days`}
                </span>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <p>
                  <strong>Date:</strong> {exam.examDate.toLocaleDateString()}
                </p>
                <p>
                  <strong>Time:</strong> {exam.startTime} - {exam.endTime}
                </p>
                {exam.room && (
                  <p>
                    <strong>Room:</strong> {exam.room}
                  </p>
                )}
                {exam.notes && (
                  <p>
                    <strong>Notes:</strong> {exam.notes}
                  </p>
                )}
              </div>
              <div className="mt-4 flex space-x-2">
                <button 
                  onClick={() => handleEditExam(exam)}
                  className="text-primary hover:text-orange-600 text-sm font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteExam(exam.id)}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // Widget layout state
  const [widgetLayout, setWidgetLayout] = useState([
    { i: 'welcome', x: 0, y: 0, w: 6, h: 3 },
    { i: 'next-exam', x: 6, y: 0, w: 3, h: 3 },
    { i: 'deadlines', x: 9, y: 0, w: 3, h: 3 },
    { i: 'quick-stats', x: 0, y: 3, w: 4, h: 3 },
    { i: 'todo-list', x: 4, y: 3, w: 4, h: 3 },
    { i: 'pomodoro-timer', x: 8, y: 3, w: 4, h: 3 },
    { i: 'weekly-summary', x: 0, y: 6, w: 4, h: 3 },
    { i: 'streak-tracker', x: 4, y: 6, w: 2, h: 3 },
    { i: 'motivation-quote', x: 6, y: 6, w: 2, h: 3 },
    { i: 'notifications', x: 8, y: 6, w: 4, h: 3 },
    { i: 'storage', x: 0, y: 9, w: 6, h: 3 },
  ]);

  const [isEditMode, setIsEditMode] = useState(false);

  const handleLayoutChange = (newLayout: any) => {
    setWidgetLayout(newLayout);
  };

  const renderSubjects = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Subjects</h1>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowSubjectsModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Add Subject</span>
          </button>
          <button
            onClick={handleImportExamData}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
          >
            <span>📥 Import Exam Data</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((subject) => (
          <div key={subject.id} className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {subject.name}
              </h3>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {subject.code}
              </span>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                <strong>Code:</strong> {subject.code}
              </p>
              <p>
                <strong>Added:</strong> {subject.createdAt.toLocaleDateString()}
              </p>
              <p>
                <strong>Assignments:</strong> {assignments.filter(a => a.subjectId === subject.id).length}
              </p>
              <p>
                <strong>Exams:</strong> {exams.filter(e => e.subjectId === subject.id).length}
              </p>
            </div>
            <div className="mt-4 flex space-x-2">
              <button 
                onClick={() => handleDeleteSubject(subject.id)}
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStorage = () => (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Storage Management</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Storage Overview
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Used Space</span>
              <span className="font-semibold">
                {formatFileSize(storageInfo.used * 1024 * 1024)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Available Space</span>
              <span className="font-semibold">
                {formatFileSize(
                  (storageInfo.limit - storageInfo.used) * 1024 * 1024
                )}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Total Space</span>
              <span className="font-semibold">
                {formatFileSize(storageInfo.limit * 1024 * 1024)}
              </span>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Usage</span>
              <span
                className={`text-sm font-medium ${getStorageColor(
                  storageInfo.percentage
                )}`}
              >
                {storageInfo.percentage.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-300 ${
                  storageInfo.percentage >= 90
                    ? 'bg-red-500'
                    : storageInfo.percentage >= 75
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
                }`}
                style={{ width: `${storageInfo.percentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Storage by Assignment
          </h3>
          <div className="space-y-3">
            {assignments.map((assignment) => (
              <div
                key={assignment.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {assignment.title}
                  </p>
                  <p className="text-sm text-gray-600">
                    {assignment.subjectName}
                  </p>
                </div>
                <span className="text-sm text-gray-600">
                  {assignment.fileSize
                    ? formatFileSize(assignment.fileSize * 1024 * 1024)
                    : 'N/A'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderMaterials = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Study Materials</h1>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowMaterialModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Add Material</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {materials.map((material) => (
          <div key={material.id} className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {material.title}
              </h3>
              <span className="text-xs text-gray-500">
                {material.fileType.toUpperCase()}
              </span>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                <strong>Subject:</strong> {material.subjectName}
              </p>
              <p>
                <strong>Size:</strong>{' '}
                {formatFileSize(material.fileSize * 1024 * 1024)}
              </p>
              {material.description && (
                <p>
                  <strong>Description:</strong> {material.description}
                </p>
              )}
            </div>
            <div className="mt-4 flex space-x-2">
              <button className="text-primary hover:text-orange-600 text-sm font-medium">
                Download
              </button>
              <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
        <button className="btn-secondary">Mark All as Read</button>
      </div>

      <div className="space-y-4">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`card ${
              !notification.isRead ? 'border-l-4 border-primary' : ''
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {notification.title}
                </h3>
                <p className="text-gray-600 mt-1">{notification.message}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {notification.createdAt.toLocaleDateString()} at{' '}
                  {notification.createdAt.toLocaleTimeString()}
                </p>
              </div>
              <div className="flex space-x-2">
                {!notification.isRead && (
                  <button className="text-primary hover:text-orange-600 text-sm font-medium">
                    Mark Read
                  </button>
                )}
                <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAccount = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
        <button
          onClick={() => setShowProfileModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <UserIcon className="w-5 h-5" />
          <span>Edit Profile</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Profile Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                value={currentUser?.name || ''}
                className="input-field"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={currentUser?.email || ''}
                className="input-field"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <input
                type="text"
                value={currentUser?.phone || 'Not set'}
                className="input-field"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                College/University
              </label>
              <input
                type="text"
                value={currentUser?.college || 'Not set'}
                className="input-field"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course/Program
              </label>
              <input
                type="text"
                value={currentUser?.course || 'Not set'}
                className="input-field"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year
              </label>
              <input
                type="text"
                value={currentUser?.year || 'Not set'}
                className="input-field"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Semester
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={currentUser?.semester || 'Not set'}
                  className="input-field flex-1"
                  readOnly
                />
                <button onClick={handleChangeSemester} className="btn-primary">
                  Change
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Account Actions
          </h3>
          <div className="space-y-3">
            <button onClick={exportData} className="w-full btn-secondary">Export Data</button>
            <button onClick={downloadAllFiles} className="w-full btn-secondary">Download All Files</button>
            <button onClick={changePassword} className="w-full btn-secondary">Change Password</button>
            <button onClick={deleteAccount} className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg">Delete Account</button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Priority Thresholds
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                High Priority (days remaining)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value="2"
                className="input-field"
                readOnly
              />
              <p className="text-xs text-gray-500 mt-1">
                Assignments due within this many days will be marked as High Priority
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Medium Priority (days remaining)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value="5"
                className="input-field"
                readOnly
              />
              <p className="text-xs text-gray-500 mt-1">
                Assignments due within this many days will be marked as Medium Priority
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Low Priority (days remaining)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value="30"
                className="input-field"
                readOnly
              />
              <p className="text-xs text-gray-500 mt-1">
                Assignments due within this many days will be marked as Low Priority
              </p>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Priority thresholds are automatically calculated based on assignment deadlines.
            </p>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Dashboard Customization
          </h3>
          <div className="space-y-4">
            <button
              onClick={() => setCustomizeMode(!customizeMode)}
              className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                customizeMode
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-primary text-white hover:bg-primary-dark'
                }`}
            >
              {customizeMode ? 'Exit Customize Mode' : 'Enter Customize Mode'}
            </button>
            <p className="text-sm text-gray-600">
              Customize mode allows you to add, remove, and reorder dashboard widgets.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return renderDashboard();
      case 'assignments':
        return renderAssignments();
      case 'exams':
        return renderExams();
      case 'subjects':
        return renderSubjects();
      case 'materials':
        return renderMaterials();
      case 'notifications':
        return renderNotifications();
      case 'storage':
        return renderStorage();
      case 'account':
        return renderAccount();
      case 'settings':
        return renderSettings();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 lg:relative flex flex-col ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-orange-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="text-xl font-bold text-gray-900">ampusFlow</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 mt-4 px-4">
          <ul className="space-y-2">
            {navigationItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => {
                    setCurrentPage(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    currentPage === item.id
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-auto p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <UserIcon className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 lg:ml-0">
        {/* Top navigation */}
        <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                  aria-label="Open menu"
                >
                  <Bars3Icon className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-semibold text-gray-900">
                  {
                    navigationItems.find((item) => item.id === currentPage)
                      ?.name
                  }
                </h2>
              </div>

              <div className="flex items-center space-x-4">
                <div className="relative">
                  <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <img
                      src={
                        currentUser?.photoURL ||
                        'https://via.placeholder.com/32'
                      }
                      alt="Profile"
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="text-sm font-medium text-gray-700 hidden sm:block">
                      {currentUser?.name}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Page content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderContent()}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
              Add New Assignment
            </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
            <form
                className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                const subject = subjects.find(
                  (s) => s.id === assignmentForm.subjectId
                );
                if (subject) {
                  const autoPriority = calculateAutoPriority(assignmentForm.deadline);
                  const fileSize = assignmentForm.pdfFile ? assignmentForm.pdfFile.size / (1024 * 1024) : 0; // Convert to MB
                  
                  handleAddAssignment({
                    title: assignmentForm.title,
                    subjectId: assignmentForm.subjectId,
                    subjectName: subject.name,
                    pdfUrl: assignmentForm.pdfFile ? URL.createObjectURL(assignmentForm.pdfFile) : '',
                    deadline: new Date(assignmentForm.deadline),
                    status: 'pending',
                    priority: autoPriority,
                    fileSize: fileSize,
                    submissionType: assignmentForm.submissionType,
                  });
                }
              }}
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assignment Title
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter assignment title"
                  value={assignmentForm.title}
                  onChange={(e) =>
                    setAssignmentForm({
                      ...assignmentForm,
                      title: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                                  <select
                    className="input-field"
                    value={assignmentForm.subjectId}
                    onChange={(e) => {
                      if (e.target.value === 'add-new') {
                        setShowSubjectsModal(true);
                      } else {
                        setAssignmentForm({
                          ...assignmentForm,
                          subjectId: e.target.value,
                        });
                      }
                    }}
                    required
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                    <option value="add-new">+ Add New Subject</option>
                  </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Submission Type
                </label>
                <select
                  className="input-field"
                  value={assignmentForm.submissionType}
                  onChange={(e) =>
                    setAssignmentForm({
                      ...assignmentForm,
                      submissionType: e.target.value as
                        | 'assignment'
                        | 'tutorial',
                    })
                  }
                >
                  <option value="assignment">Assignment</option>
                  <option value="tutorial">Tutorial</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PDF File (Optional)
                </label>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept=".pdf"
                  className="input-field"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                    setAssignmentForm({
                      ...assignmentForm,
                        pdfFile: file,
                      });
                    }}
                  />
                  {assignmentForm.pdfFile && (
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-green-800">
                            {assignmentForm.pdfFile.name}
                          </p>
                          <p className="text-xs text-green-600">
                            Size: {formatFileSize(assignmentForm.pdfFile.size)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setAssignmentForm({
                            ...assignmentForm,
                            pdfFile: null,
                          })}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deadline
                </label>
                <input
                  type="date"
                  className="input-field"
                  value={assignmentForm.deadline}
                  onChange={(e) =>
                    setAssignmentForm({
                      ...assignmentForm,
                      deadline: e.target.value,
                    })
                  }
                  required
                />
                {assignmentForm.deadline && (
                  <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs text-blue-800">
                      <span className="font-medium">Auto Priority:</span> 
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(calculateAutoPriority(assignmentForm.deadline))}`}>
                        {calculateAutoPriority(assignmentForm.deadline).toUpperCase()}
                      </span>
                    </p>
              </div>
                )}
              </div>
              
              {/* Storage Information */}
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Storage Information</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Used:</span>
                    <span className="font-medium">{formatFileSize(getTotalUsedStorage() * 1024 * 1024)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Available:</span>
                    <span className="font-medium">{formatFileSize(getRemainingStorage() * 1024 * 1024)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-medium">{formatFileSize(storageInfo.limit * 1024 * 1024)}</span>
                  </div>
                  {assignmentForm.pdfFile && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">New file:</span>
                        <span className="font-medium text-green-600">{formatFileSize(assignmentForm.pdfFile.size)}</span>
                      </div>
                      <div className="flex justify-between col-span-2">
                        <span className="text-gray-600">After upload:</span>
                        <span className="font-medium">
                          {formatFileSize((getTotalUsedStorage() + (assignmentForm.pdfFile.size / (1024 * 1024))) * 1024 * 1024)}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </form>
            </div>
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadModal(false);
                    setAssignmentForm({
                      title: '',
                      subjectId: '',
                      submissionType: 'assignment',
                      deadline: '',
                      pdfFile: null,
                    });
                  }}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  onClick={(e) => {
                    e.preventDefault();
                    const subject = subjects.find(
                      (s) => s.id === assignmentForm.subjectId
                    );
                    if (subject) {
                      const autoPriority = calculateAutoPriority(assignmentForm.deadline);
                      const fileSize = assignmentForm.pdfFile ? assignmentForm.pdfFile.size / (1024 * 1024) : 0;
                      
                      handleAddAssignment({
                        title: assignmentForm.title,
                        subjectId: assignmentForm.subjectId,
                        subjectName: subject.name,
                        pdfUrl: assignmentForm.pdfFile ? URL.createObjectURL(assignmentForm.pdfFile) : '',
                        deadline: new Date(assignmentForm.deadline),
                        status: 'pending',
                        priority: autoPriority,
                        fileSize: fileSize,
                        submissionType: assignmentForm.submissionType,
                      });
                      setShowUploadModal(false);
                      setAssignmentForm({
                        title: '',
                        subjectId: '',
                        submissionType: 'assignment',
                        deadline: '',
                        pdfFile: null,
                      });
                    }
                  }}
                  className="flex-1 btn-primary"
                >
                  Add Assignment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Exam Modal */}
      {showExamModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Add New Exam
            </h3>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                const subject = subjects.find(
                  (s) => s.id === examForm.subjectId
                );
                if (subject) {
                  handleAddExam({
                    subjectId: examForm.subjectId,
                    subjectName: subject.name,
                    examType: examForm.examType,
                    examDate: new Date(examForm.examDate),
                    startTime: examForm.startTime,
                    endTime: examForm.endTime,
                    room: examForm.room || undefined,
                    notes: examForm.notes || undefined,
                  });
                }
              }}
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <select
                  className="input-field"
                  value={examForm.subjectId}
                  onChange={(e) => {
                    if (e.target.value === 'add-new') {
                      setShowSubjectsModal(true);
                    } else {
                      setExamForm({ ...examForm, subjectId: e.target.value });
                    }
                  }}
                  required
                >
                  <option value="">Select Subject</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                  <option value="add-new">+ Add New Subject</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Exam Type
                </label>
                <select
                  className="input-field"
                  value={examForm.examType}
                  onChange={(e) =>
                    setExamForm({
                      ...examForm,
                      examType: e.target.value as 'lecture' | 'mid' | 'final',
                    })
                  }
                >
                  <option value="lecture">Lecture Exam</option>
                  <option value="mid">Mid Exam</option>
                  <option value="final">Final Exam</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Exam Date
                </label>
                <input
                  type="date"
                  className="input-field"
                  value={examForm.examDate}
                  onChange={(e) =>
                    setExamForm({ ...examForm, examDate: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time
                  </label>
                  <input
                    type="time"
                    className="input-field"
                    value={examForm.startTime}
                    onChange={(e) =>
                      setExamForm({ ...examForm, startTime: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    className="input-field"
                    value={examForm.endTime}
                    onChange={(e) =>
                      setExamForm({ ...examForm, endTime: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Room (Optional)
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter room number"
                  value={examForm.room}
                  onChange={(e) =>
                    setExamForm({ ...examForm, room: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  className="input-field"
                  rows={3}
                  placeholder="Enter any notes"
                  value={examForm.notes}
                  onChange={(e) =>
                    setExamForm({ ...examForm, notes: e.target.value })
                  }
                ></textarea>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowExamModal(false);
                    setExamForm({
                      subjectId: '',
                      examType: 'lecture',
                      examDate: '',
                      startTime: '',
                      endTime: '',
                      room: '',
                      notes: '',
                    });
                  }}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  Add Exam
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Material Modal */}
      {showMaterialModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Add Study Material
            </h3>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <select 
                  className="input-field"
                  onChange={(e) => {
                    if (e.target.value === 'add-new') {
                      setShowSubjectsModal(true);
                    }
                  }}
                >
                  <option value="">Select Subject</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                  <option value="add-new">+ Add New Subject</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Material Title
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter material title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  className="input-field"
                  rows={3}
                  placeholder="Enter description"
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload File
                </label>
                <input type="file" className="input-field" />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowMaterialModal(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  Add Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Exam Modal */}
      {showEditExamModal && editingExam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Edit Exam
            </h3>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdateExam();
              }}
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <select
                  className="input-field"
                  value={examForm.subjectId}
                  onChange={(e) => {
                    if (e.target.value === 'add-new') {
                      setShowSubjectsModal(true);
                    } else {
                      setExamForm({ ...examForm, subjectId: e.target.value });
                    }
                  }}
                  required
                >
                  <option value="">Select Subject</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                  <option value="add-new">+ Add New Subject</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Exam Type
                </label>
                <select
                  className="input-field"
                  value={examForm.examType}
                  onChange={(e) =>
                    setExamForm({
                      ...examForm,
                      examType: e.target.value as 'lecture' | 'mid' | 'final',
                    })
                  }
                >
                  <option value="lecture">Lecture Exam</option>
                  <option value="mid">Mid Exam</option>
                  <option value="final">Final Exam</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Exam Date
                </label>
                <input
                  type="date"
                  className="input-field"
                  value={examForm.examDate}
                  onChange={(e) =>
                    setExamForm({ ...examForm, examDate: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time
                  </label>
                  <input
                    type="time"
                    className="input-field"
                    value={examForm.startTime}
                    onChange={(e) =>
                      setExamForm({ ...examForm, startTime: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    className="input-field"
                    value={examForm.endTime}
                    onChange={(e) =>
                      setExamForm({ ...examForm, endTime: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Room (Optional)
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter room number"
                  value={examForm.room}
                  onChange={(e) =>
                    setExamForm({ ...examForm, room: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  className="input-field"
                  rows={3}
                  placeholder="Enter any notes"
                  value={examForm.notes}
                  onChange={(e) =>
                    setExamForm({ ...examForm, notes: e.target.value })
                  }
                ></textarea>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditExamModal(false);
                    setEditingExam(null);
                    setExamForm({
                      subjectId: '',
                      examType: 'lecture',
                      examDate: '',
                      startTime: '',
                      endTime: '',
                      room: '',
                      notes: '',
                    });
                  }}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  Update Exam
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subjects Modal */}
      {showSubjectsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Add New Subject
            </h3>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const name = formData.get('name') as string;
                const code = formData.get('code') as string;
                if (name && code) {
                  handleAddSubject(name, code);
                }
              }}
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject Name
                </label>
                <input
                  type="text"
                  name="name"
                  className="input-field"
                  placeholder="Enter subject name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject Code
                </label>
                <input
                  type="text"
                  name="code"
                  className="input-field"
                  placeholder="Enter subject code (e.g., MATH101)"
                  required
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowSubjectsModal(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  Add Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Edit Profile
            </h3>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    defaultValue={currentUser?.name || ''}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="text"
                    defaultValue={currentUser?.phone || ''}
                    className="input-field"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  College/University
                </label>
                <input
                  type="text"
                  defaultValue={currentUser?.college || ''}
                  className="input-field"
                  placeholder="Enter college/university name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course/Program
                  </label>
                  <input
                    type="text"
                    defaultValue={currentUser?.course || ''}
                    className="input-field"
                    placeholder="Enter course/program"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Year
                  </label>
                  <input
                    type="text"
                    defaultValue={currentUser?.year || ''}
                    className="input-field"
                    placeholder="Enter year"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Semester
                </label>
                <input
                  type="text"
                  defaultValue={currentUser?.semester || ''}
                  className="input-field"
                  placeholder="e.g., Fall 2024"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;

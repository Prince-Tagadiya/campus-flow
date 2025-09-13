import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import introJs from 'intro.js';
import 'intro.js/minified/introjs.min.css';
import { useAuth } from '../contexts/AuthContext';
import { doc, setDoc, collection, addDoc, updateDoc, deleteDoc, getDocs, query, where, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { saveFileBlob, createObjectUrlFromIdb, deleteFileBlob } from '../services/localFileStore';
import { db, storage } from '../firebase/config';
import CustomPopup from './CustomPopup';
import AIAssignmentModal from './AIAssignmentModal';
import { AIService, AIExtractedAssignment } from '../services/aiService';
import MissingInfoModal from './MissingInfoModal';
import { PDFService } from '../services/pdfService';
import { OCRService } from '../services/ocrService';
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
  Clock,
  User,
  Plus,
  FileText,
  Check,
  Menu,
  X,
  Cloud,
  BookOpen,
  BarChart3,
  Bell,
  Target,
  TrendingUp,
  Calendar,
  Zap,
  BookMarked,
  GraduationCap,
  Brain,
  Lightbulb,
  Timer,
  HardDrive,
  Activity,
  Award,
  MessageSquare,
  Folder,
  FolderOpen,
  File,
  Upload,
  Download,
  Trash2,
  Edit,
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  List,
  Search,
  MoreVertical,
  Lock,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import {
  Assignment,
  Exam,
  StorageInfo,
  Subject,
  Material,
  StudyFolder,
  StudyFile,
  Notification as NotificationType,
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
  StudentAttendance,
  SemesterSubject,
} from '../types';
import { motion } from 'framer-motion';
import MobileStudentDashboard from './MobileStudentDashboard';

// (RGL styles removed)

const StudentDashboard: React.FC = () => {
  const { currentUser, logout } = useAuth();
  
  // Mobile detection
  const [isMobile, setIsMobile] = useState(false);
  const [attendance, setAttendance] = useState<StudentAttendance[]>([]);
  const [courseInfo, setCourseInfo] = useState<{
    courseId?: string;
    courseName?: string;
    courseCode?: string;
    branchId?: string;
    branchName?: string;
    subjects?: SemesterSubject[];
  } | undefined>();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load course info and attendance data
  useEffect(() => {
    if (currentUser?.courseInfo) {
      setCourseInfo(currentUser.courseInfo);
    }
    
    // Mock attendance data for now
    setAttendance([
      {
        studentId: currentUser?.id || '1',
        studentName: currentUser?.name || 'Student',
        totalSessions: 20,
        presentSessions: 18,
        absentSessions: 2,
        attendancePercentage: 90,
        lastAttendance: new Date(),
        courseId: 'btech-cse',
        courseName: 'Bachelor of Technology - Computer Science and Engineering'
      }
    ]);
  }, [currentUser]);

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

  // UI state: assignment filters and sorting
  const [assignmentFilter, setAssignmentFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'deadline' | 'subject' | 'priority' | 'status' | 'title'>('deadline');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [exams, setExams] = useState<Exam[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
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

  // File Manager States
  const [studyFolders, setStudyFolders] = useState<StudyFolder[]>([]);
  const [studyFiles, setStudyFiles] = useState<StudyFile[]>([
    {
      id: 'file1',
      studentId: '1',
      name: 'Calculus Chapter 1.pdf',
      folderId: '',
      subjectId: '1',
      subjectName: 'Mathematics',
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      fileSize: 2.5,
      fileType: 'pdf',
      description: 'Introduction to calculus concepts',
      createdAt: new Date(),
      modifiedAt: new Date(),
    },
    {
      id: 'file2',
      studentId: '1',
      name: 'Physics Lab Report.docx',
      folderId: '',
      subjectId: '2',
      subjectName: 'Physics',
      fileUrl: 'https://www.africau.edu/images/default/sample.pdf',
      fileSize: 1.8,
      fileType: 'docx',
      description: 'Lab report on mechanics',
      createdAt: new Date(),
      modifiedAt: new Date(),
    },
  ]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [fileSortBy, setFileSortBy] = useState<'name' | 'date' | 'size'>('name');
  const [fileSortOrder, setFileSortOrder] = useState<'asc' | 'desc'>('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [showUploadFileModal, setShowUploadFileModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadFileDescription, setUploadFileDescription] = useState('');
  
  // AI Assignment states
  const [showAIAssignmentModal, setShowAIAssignmentModal] = useState(false);
  const [aiExtractedData, setAiExtractedData] = useState<AIExtractedAssignment | null>(null);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [aiStage, setAiStage] = useState<'idle' | 'uploading' | 'analyzing' | 'completing' | 'done'>('idle');
  const [aiStageMessage, setAiStageMessage] = useState('');
  const [aiSubjectNote, setAiSubjectNote] = useState<'missing' | 'added' | null>(null);
  const [aiTypingShown, setAiTypingShown] = useState('');
  const [aiTypingTarget, setAiTypingTarget] = useState('');
  const [aiPdfFile, setAiPdfFile] = useState<File | null>(null);
  
  // Context Menu States
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    item: { type: 'file' | 'folder', data: StudyFile | StudyFolder } | null;
  }>({
    visible: false,
    x: 0,
    y: 0,
    item: null,
  });
  const [notifications, setNotifications] = useState<NotificationType[]>([
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
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [daysUntilDeadline, setDaysUntilDeadline] = useState<number>(0);
  const [daysUntilExam, setDaysUntilExam] = useState<number>(0);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showExamModal, setShowExamModal] = useState(false);
  const [showExamAIModal, setShowExamAIModal] = useState(false);
  const [aiExamFile, setAiExamFile] = useState<File | null>(null);
  const [parsedExams, setParsedExams] = useState<Array<{ subjectName: string; examDate: string; startTime: string; endTime: string }>>([]);
  const [parsedExamSubjectIds, setParsedExamSubjectIds] = useState<string[]>([]);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showEditExamModal, setShowEditExamModal] = useState(false);
  const [showSubjectsModal, setShowSubjectsModal] = useState(false);
  const [showCustomAlert, setShowCustomAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '', type: 'info' as 'success' | 'error' | 'warning' | 'info', onConfirm: () => {} });
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [customizeMode, setCustomizeMode] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradePlan, setUpgradePlan] = useState<{ id: 'free' | 'plus' | 'pro'; name: string; limit: number; price: string } | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'auth' | 'processing' | 'success'>('idle');
  const [showUpgradeTour, setShowUpgradeTour] = useState(false);
  const examAIFileInputRef = useRef<HTMLInputElement | null>(null);
  const aiAssignmentFileInputRef = useRef<HTMLInputElement | null>(null);
  const ocrTestFileInputRef = useRef<HTMLInputElement | null>(null);

  const handleStartUpgrade = (plan: { id: 'free' | 'plus' | 'pro'; name: string; limit: number; price: string }) => {
    setUpgradePlan(plan);
    setPaymentStatus('idle');
    setShowUpgradeModal(true);
  };

  // Navigation items
  const navigationItems = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
    { id: 'assignments', name: 'Assignments', icon: FileText },
    { id: 'exams', name: 'Exams', icon: BookOpen },
    { id: 'subjects', name: 'Subjects', icon: GraduationCap },
    { id: 'materials', name: 'Materials', icon: BookMarked },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'storage', name: 'Storage', icon: Cloud },
    { id: 'account', name: 'Account', icon: User },
    { id: 'pricing', name: 'Upgrade', icon: Cloud },
  ];

  // Custom notification and modal states
  const [showCustomNotification, setShowCustomNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState<'success' | 'error' | 'warning' | 'info'>('info');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmModalData, setConfirmModalData] = useState<{
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
    onConfirm: () => void;
    type: 'danger' | 'warning' | 'info';
  } | null>(null);
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
      id: 'pomodoro-timer',
      type: 'pomodoro-timer' as any,
      title: 'Pomodoro Timer',
      description: 'Built-in focus timer with session logs',
      icon: 'ClockIcon',
      enabled: true,
      order: 8,
      size: 'm',
    },
    {
      id: 'weekly-summary',
      type: 'weekly-summary' as any,
      title: 'Weekly Summary',
      description: 'Auto-summary of completed work',
      icon: 'ChartBarIcon',
      enabled: true,
      order: 9,
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
      order: 10,
      size: 's',
    },
    {
      id: 'motivation-quote',
      type: 'motivation-quote' as any,
      title: 'Daily Motivation',
      description: 'Student-focused motivational quotes',
      icon: 'BookOpenIcon',
      enabled: true,
      order: 11,
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
      order: 12,
      size: 'm',
    },
    {
      id: 'storage',
      type: 'storage',
      title: 'Storage Usage',
      description: 'Usage of storage',
      icon: 'CloudIcon',
      enabled: true,
      order: 13,
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

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load course info and attendance data
  useEffect(() => {
    if (currentUser?.courseInfo) {
      setCourseInfo(currentUser.courseInfo);
    }
    
    // Mock attendance data for now
    setAttendance([
      {
        studentId: currentUser?.id || '1',
        studentName: currentUser?.name || 'Student',
        totalSessions: 20,
        presentSessions: 18,
        absentSessions: 2,
        attendancePercentage: 90,
        lastAttendance: new Date(),
        courseId: 'btech-cse',
        courseName: 'Bachelor of Technology - Computer Science and Engineering'
      }
    ]);
  }, [currentUser]);

  const toggleCard = (id: string) => {
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c))
    );
  };

  // replaced by drag-and-drop
  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    subjectId: '',
    submissionType: 'assignment' as 'assignment' | 'tutorial' | 'project' | 'exam',
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
  const isPlusPlan = storageInfo.limit >= 10000 && storageInfo.limit < 100000;
  const isProPlan = storageInfo.limit >= 100000;
  const isUpgraded = storageInfo.limit > 1000;

  // Ensure Exam AI modal opens reliably and clears any interfering UI
  const openExamAIFilePicker = useCallback(() => {
    console.debug('[Exam AI] Button clicked: openExamAIFilePicker');
    try {
      setContextMenu({ visible: false, x: 0, y: 0, item: null });
    } catch {}
    console.debug('[Exam AI] Closing other UI and switching to Exams page');
    setCurrentPage('exams');
    setAiExamFile(null);
    setParsedExams([]);
    setParsedExamSubjectIds([]);
    setShowExamModal(false);
    setShowExamAIModal(true);
    // Robustly wait until the modal mounts and input ref is ready
    let attempts = 0;
    const maxAttempts = 40; // ~4s
    const tryClick = () => {
      const input = examAIFileInputRef.current;
      console.debug('[Exam AI] Checking for file input ref...', { attempts });
      if (input) {
        input.value = '';
        console.debug('[Exam AI] File input found. Programmatically clicking.');
        input.click();
        return;
      }
      attempts += 1;
      if (attempts < maxAttempts) {
        setTimeout(tryClick, 100);
      } else {
        console.error('[Exam AI] Failed to find file input after waiting.');
      }
    };
    setTimeout(tryClick, 50);
  }, []);

  const handleExamAIFileSelected = useCallback(async (file: File | null) => {
    console.debug('[Exam AI] File selected handler fired', { hasFile: !!file });
    if (!file) {
      console.warn('[Exam AI] No file selected or selection was cancelled');
      return;
    }
    setAiExamFile(file);
    try {
      console.debug('[Exam AI] Starting text extraction from file', { name: file.name, size: file.size, type: file.type });
      const text = await AIService.extractTextFromFile(file);
      console.debug('[Exam AI] Text extraction complete', { length: text?.length });
      console.debug('[Exam AI] Starting exam schedule extraction');
      const exams = await AIService.extractExamSchedule(text);
      console.debug('[Exam AI] Exam extraction complete', { count: exams?.length });
      if (!Array.isArray(exams) || exams.length === 0) {
        console.warn('[Exam AI] No exams detected from extracted text');
        showCustomAlertPopup('AI Parse', 'Could not detect exam entries. Please try a clearer file.', 'warning');
        return;
      }
      setParsedExams(exams);
      setParsedExamSubjectIds(new Array(exams.length).fill(''));
      setShowExamAIModal(true);
      showCustomNotificationMessage(`Parsed ${exams.length} exam(s). Please verify details.`, 'info');
    } catch (e) {
      console.error('[Exam AI] Error during AI processing', e);
      showCustomAlertPopup('AI Error', 'Failed to read timetable. Try another file.', 'error');
    }
  }, []);

  // Simple OCR test flow (images only)
  const openOcrTestPicker = useCallback(() => {
    console.debug('[OCR Test] Open picker requested');
    setCurrentPage('exams');
    setShowExamAIModal(false);
    setTimeout(() => {
      const input = ocrTestFileInputRef.current;
      if (input) {
        input.value = '';
        input.click();
      } else {
        console.warn('[OCR Test] File input ref not ready');
      }
    }, 50);
  }, []);

  const handleOcrTestFileSelected = useCallback(async (file: File | null) => {
    console.debug('[OCR Test] File selected', { hasFile: !!file });
    if (!file) return;
    const validation = OCRService.validateImageFile(file);
    if (!validation.valid) {
      showCustomAlertPopup('OCR', validation.error || 'Invalid image file', 'warning');
      return;
    }
    try {
      showCustomNotificationMessage('Running OCR on image...', 'info');
      const result = await OCRService.extractTextFromImage(file);
      const preview = (result.text || '').slice(0, 140).replace(/\s+/g, ' ').trim();
      showCustomAlertPopup('OCR Result', `Conf: ${(result.confidence * 100).toFixed(0)}%\nTime: ${result.processingTime}ms\nText: ${preview}${result.text.length > 140 ? '…' : ''}`, 'info');
    } catch (e) {
      console.error('[OCR Test] Failed', e);
      showCustomAlertPopup('OCR Error', 'Failed to extract text. Try a clearer image.', 'error');
    }
  }, []);

  // Assignment AI picker for more reliable triggering
  const openAssignmentAIFilePicker = useCallback(() => {
    if (isProcessingAI) return;
    const input = aiAssignmentFileInputRef.current;
    if (input) {
      input.value = '';
      input.click();
    }
  }, [isProcessingAI]);

  // Load upgraded plan limit from localStorage on mount
  useEffect(() => {
    try {
      const savedLimit = localStorage.getItem('cf_plan_limit');
      if (savedLimit) {
        const parsed = parseInt(savedLimit, 10);
        if (!Number.isNaN(parsed) && parsed > 0) {
          setStorageInfo((s) => ({ ...s, limit: parsed }));
        }
      }
    } catch {}
  }, []);

  // First-login tour (only show once per user)
  useEffect(() => {
    try {
      const hasSeenTour = localStorage.getItem('cf_seen_first_tour');
      if (!hasSeenTour) {
        setTimeout(() => {
          introJs().setOptions({
            steps: [
              { element: '#tour-app-brand', intro: "Welcome to CampusFlow! Let's take a quick tour." },
              { element: '#tour-nav-dashboard', intro: 'Your dashboard overview and insights.' },
              { element: '#tour-nav-assignments', intro: 'Manage your assignments and submissions.' },
              { element: '#tour-nav-exams', intro: 'Track exams and schedules.' },
              { element: '#tour-nav-storage', intro: 'See storage usage and upgrade if needed.' },
              { element: '#tour-profile', intro: 'Access your profile and account.' },
            ],
            showBullets: false,
            showProgress: true,
          }).start();
          localStorage.setItem('cf_seen_first_tour', '1');
        }, 600);
      }
    } catch {}
  }, []);

  // Post-upgrade tour effect
  useEffect(() => {
    if (showUpgradeTour && isUpgraded) {
      try {
        const seen = localStorage.getItem('cf_seen_upgrade_tour') === '1';
        if (!seen) {
          setTimeout(() => {
            try {
              const tour = introJs();
              tour.setOptions({
                steps: [
                  { element: '#tour-nav-dashboard', intro: 'New AI Assistant added on your dashboard.' },
                  { element: '#tour-nav-assignments', intro: 'Use AI to extract assignment details.' },
                  { element: '#tour-nav-storage', intro: 'Enjoy your increased storage here.' }
                ],
                showBullets: false,
                showProgress: true,
              });
              tour.onchange((el: Element) => {
                if (el && el.id === 'tour-nav-dashboard') setCurrentPage('dashboard');
                if (el && el.id === 'tour-nav-assignments') setCurrentPage('assignments');
                if (el && el.id === 'tour-nav-storage') setCurrentPage('storage');
              });
              tour.start();
              localStorage.setItem('cf_seen_upgrade_tour', '1');
            } catch {}
          }, 800);
        }
      } catch {}
    }
  }, [showUpgradeTour, isUpgraded]);

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
  const [currentQuote, setCurrentQuote] = useState<MotivationQuote | null>(null);
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);

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
  const [pomodoroTime, setPomodoroTime] = useState(25); // 25 minutes
  const [currentPomodoroTime, setCurrentPomodoroTime] = useState(25); // Current countdown time
  const [isPomodoroRunning, setIsPomodoroRunning] = useState(false);
  const [isPomodoroMinimized, setIsPomodoroMinimized] = useState(false);
  const [pomodoroInterval, setPomodoroInterval] = useState<NodeJS.Timeout | null>(null);
  const [showTimePopup, setShowTimePopup] = useState(false);
  const [customMinutes, setCustomMinutes] = useState(25);
  const [customSeconds, setCustomSeconds] = useState(0);
  const [showStreakAnimation, setShowStreakAnimation] = useState(false);
  const [streakIncrement, setStreakIncrement] = useState(0);
  const [lastLoginDate, setLastLoginDate] = useState<string>('');
  const [showMotivationAnimation, setShowMotivationAnimation] = useState(false);

  // Fetch motivational quote from API
  const fetchMotivationalQuote = async () => {
    setIsLoadingQuote(true);
    try {
      // Using quotable.io API for inspirational quotes
      const response = await fetch('https://api.quotable.io/random?tags=motivational,inspirational,success');
      const data = await response.json();
      
      const newQuote: MotivationQuote = {
        id: Date.now().toString(),
        text: data.content,
        author: data.author,
        category: 'motivation',
        date: new Date()
      };
      
      setCurrentQuote(newQuote);
      return newQuote;
    } catch (error) {
      // Fallback to local quotes if API fails
      const fallbackQuote = motivationQuotes[Math.floor(Math.random() * motivationQuotes.length)];
      setCurrentQuote(fallbackQuote);
      return fallbackQuote;
    } finally {
      setIsLoadingQuote(false);
    }
  };

  // Notification functions
  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  const showNotification = (title: string, body: string, icon?: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: icon || '/logo192.png',
        badge: '/logo192.png',
        tag: 'pomodoro-timer',
        requireInteraction: true
      });
    }
  };

  const motivationalMessages = [
    "🎉 Great job! You've completed your focus session!",
    "🌟 Excellent work! Time for a well-deserved break!",
    "💪 You're doing amazing! Keep up the great focus!",
    "🚀 Fantastic! Your productivity is on fire!",
    "⭐ Outstanding! You've mastered the art of focus!",
    "🔥 Incredible! You're unstoppable today!",
    "🎯 Perfect! You've achieved your goal!",
    "✨ Wonderful! Your dedication is inspiring!"
  ];

  const getRandomMotivation = () => {
    return motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
  };

  // Pomodoro Timer functions
  const togglePomodoro = () => {
    if (isPomodoroRunning) {
      // Pause timer
      if (pomodoroInterval) {
        clearInterval(pomodoroInterval);
        setPomodoroInterval(null);
      }
      setIsPomodoroRunning(false);
    } else {
      // Request notification permission when starting timer
      requestNotificationPermission();
      
      // Start timer
      setIsPomodoroRunning(true);
      const interval = setInterval(() => {
        setCurrentPomodoroTime(prev => {
          if (prev <= 1) {
            // Timer finished
            clearInterval(interval);
            setPomodoroInterval(null);
            setIsPomodoroRunning(false);
            
            // Show completion notification
            showNotification(
              "🍅 Pomodoro Complete!",
              getRandomMotivation()
            );
            
            // Reset to selected time
            setCurrentPomodoroTime(pomodoroTime);
            return pomodoroTime;
          }
          
          // Show notifications for remaining time
          if (prev === 300) { // 5 minutes remaining
            showNotification(
              "⏰ 5 Minutes Left!",
              "You're doing great! Keep up the focus! 💪"
            );
          } else if (prev === 60) { // 1 minute remaining
            showNotification(
              "⏰ 1 Minute Left!",
              "Almost there! You've got this! 🚀"
            );
          }
          
          return prev - 1;
        });
      }, 1000);
      setPomodoroInterval(interval);
    }
  };

  const resetPomodoro = () => {
    if (pomodoroInterval) {
      clearInterval(pomodoroInterval);
      setPomodoroInterval(null);
    }
    setIsPomodoroRunning(false);
    setPomodoroTime(25); // Reset to default 25 minutes
    setCurrentPomodoroTime(25); // Reset current time
  };

  const openTimePopup = () => {
    if (!isPomodoroRunning) {
      setCustomMinutes(Math.floor(pomodoroTime / 60));
      setCustomSeconds(pomodoroTime % 60);
      setShowTimePopup(true);
    }
  };

  const applyCustomTime = () => {
    const totalSeconds = customMinutes * 60 + customSeconds;
    if (totalSeconds > 0 && totalSeconds <= 3600) { // Max 1 hour
      setPomodoroTime(totalSeconds);
      setCurrentPomodoroTime(totalSeconds);
      setShowTimePopup(false);
    }
  };

  const closeTimePopup = () => {
    setShowTimePopup(false);
  };

  // Daily login tracking functions
  const getTodayString = () => {
    return new Date().toDateString();
  };

  const checkAndUpdateStreak = () => {
    const today = getTodayString();
    const storedLastLogin = localStorage.getItem('lastLoginDate');
    const currentStreak = parseInt(localStorage.getItem('currentStreak') || '0');
    const longestStreak = parseInt(localStorage.getItem('longestStreak') || '0');

    // If it's a new day
    if (storedLastLogin !== today) {
      // Check if it's consecutive (yesterday)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = yesterday.toDateString();

      let newStreak = currentStreak;
      
      if (storedLastLogin === yesterdayString) {
        // Consecutive day - increment streak
        newStreak = currentStreak + 1;
        setStreakIncrement(1);
        setShowStreakAnimation(true);
        
        // Show streak notification
        showNotification(
          "🔥 Streak Updated!",
          `Amazing! You're on a ${newStreak} day streak! Keep it up! 🚀`
        );
      } else if (storedLastLogin && storedLastLogin !== yesterdayString) {
        // Streak broken - reset to 1
        newStreak = 1;
        setStreakIncrement(1);
        setShowStreakAnimation(true);
        
        showNotification(
          "🎯 New Streak Started!",
          "Welcome back! Starting fresh with a 1 day streak! 💪"
        );
      } else {
        // First time user
        newStreak = 1;
        setStreakIncrement(1);
        setShowStreakAnimation(true);
        
        showNotification(
          "🌟 Welcome!",
          "Welcome to CampusFlow! Starting your journey with a 1 day streak! 🎉"
        );
      }

      // Update longest streak if needed
      const newLongestStreak = Math.max(longestStreak, newStreak);

      // Save to localStorage
      localStorage.setItem('lastLoginDate', today);
      localStorage.setItem('currentStreak', newStreak.toString());
      localStorage.setItem('longestStreak', newLongestStreak.toString());

      // Update state
      setLastLoginDate(today);
      setStreaks(prev => prev.map(streak => 
        streak.type === 'study' 
          ? { ...streak, currentStreak: newStreak, longestStreak: newLongestStreak, lastActivity: new Date() }
          : streak
      ));

      // Hide animation after 3 seconds
      setTimeout(() => {
        setShowStreakAnimation(false);
        setStreakIncrement(0);
      }, 3000);
    }
  };

  const getCurrentStreak = () => {
    return parseInt(localStorage.getItem('currentStreak') || '0');
  };

  const getLongestStreak = () => {
    return parseInt(localStorage.getItem('longestStreak') || '0');
  };

  // Update current time when pomodoro time changes
  useEffect(() => {
    if (!isPomodoroRunning) {
      setCurrentPomodoroTime(pomodoroTime);
    }
  }, [pomodoroTime, isPomodoroRunning]);

  // Real-time updates
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Check streak on component mount
  useEffect(() => {
    checkAndUpdateStreak();
  }, []);

  // Fetch initial motivational quote
  useEffect(() => {
    fetchMotivationalQuote();
  }, []);

  // Cleanup Pomodoro timer on unmount
  useEffect(() => {
    return () => {
      if (pomodoroInterval) {
        clearInterval(pomodoroInterval);
      }
    };
  }, [pomodoroInterval]);


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
      showCustomAlertPopup('Error', 'Failed to load subjects. Please refresh the page.', 'error');
    }
  }, [currentUser?.id]);

  // Firebase functions for study files
  const loadStudyFilesFromFirebase = useCallback(async () => {
    if (!currentUser?.id) return;
    
    try {
      const studyFilesQuery = query(
        collection(db, 'studyFiles'),
        where('studentId', '==', currentUser.id)
      );
      
      const unsubscribe = onSnapshot(studyFilesQuery, (snapshot) => {
        const studyFilesData: StudyFile[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          studyFilesData.push({
            id: doc.id,
            studentId: data.studentId,
            name: data.name,
            folderId: data.folderId,
            subjectId: data.subjectId,
            subjectName: data.subjectName,
            fileUrl: data.fileUrl,
            fileSize: data.fileSize,
            fileType: data.fileType,
            description: data.description,
            createdAt: data.createdAt?.toDate() || new Date(),
            modifiedAt: data.modifiedAt?.toDate() || new Date(),
          });
        });
        setStudyFiles(studyFilesData);
      });
      
      return unsubscribe;
    } catch (error) {
      showCustomAlertPopup('Error', 'Failed to load study files. Please refresh the page.', 'error');
    }
  }, [currentUser?.id]);

  // Firebase functions for study folders
  const loadStudyFoldersFromFirebase = useCallback(async () => {
    if (!currentUser?.id) return;
    
    try {
      const studyFoldersQuery = query(
        collection(db, 'studyFolders'),
        where('studentId', '==', currentUser.id)
      );
      
      const unsubscribe = onSnapshot(studyFoldersQuery, (snapshot) => {
        const studyFoldersData: StudyFolder[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          studyFoldersData.push({
            id: doc.id,
            studentId: data.studentId,
            name: data.name,
            parentId: data.parentId,
            subjectId: data.subjectId,
            createdAt: data.createdAt?.toDate() || new Date(),
            color: data.color,
          });
        });
        setStudyFolders(studyFoldersData);
      });
      
      return unsubscribe;
    } catch (error) {
      showCustomAlertPopup('Error', 'Failed to load study folders. Please refresh the page.', 'error');
    }
  }, [currentUser?.id]);

  // Initialize data
  useEffect(() => {
    // Calculate storage usage
    const assignmentSize = assignments.reduce(
      (sum, assignment) => sum + (assignment.fileSize || 0),
      0
    );
    const studyFileSize = studyFiles.reduce(
      (sum, file) => sum + (file.fileSize || 0),
      0
    );
    const totalSize = assignmentSize + studyFileSize;
    setStorageInfo((prev) => {
      const limit = prev.limit; // preserve current limit (may be upgraded from localStorage)
      const percentage = (totalSize / limit) * 100;
      return {
        used: totalSize,
        limit,
        percentage: Math.min(percentage, 100),
      };
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
  }, [assignments, exams, studyFiles, storageInfo.limit]);

  // Seed default folders and a sample PDF for all users (local-only if cloud disabled)
  useEffect(() => {
    if (!currentUser?.id) return;
    const hasAnyFolder = studyFolders.length > 0;
    const hasAnyFile = studyFiles.length > 0;
    if (hasAnyFolder || hasAnyFile) return;

    const forceLocal = (() => { try { return localStorage.getItem('LOCAL_FILE_MODE') === '1'; } catch { return false; } })();
    const tempOnly = (() => { try { return localStorage.getItem('LOCAL_TEMP_MODE') === '1'; } catch { return false; } })();

    // Create a couple of default folders
    const now = new Date();
    const defaultFolders: StudyFolder[] = [
      { id: `local-folder-${Date.now()}-1`, studentId: currentUser.id, name: 'Materials', createdAt: now, color: '#E5E7EB' },
      { id: `local-folder-${Date.now()}-2`, studentId: currentUser.id, name: 'Lectures', createdAt: now, color: '#DBEAFE' },
      { id: `local-folder-${Date.now()}-3`, studentId: currentUser.id, name: 'Notes', createdAt: now, color: '#FEF3C7' },
    ];

    // Add a sample PDF that points to a public test PDF (no billing needed)
    const sampleUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
    const firstSubjectId = subjects[0]?.id || '';
    const firstSubjectName = subjects[0]?.name || '';
    const sampleFile: StudyFile = {
      id: `local-sample-${Date.now()}`,
      studentId: currentUser.id,
      name: 'Welcome-Sample.pdf',
      folderId: defaultFolders[0].id,
      subjectId: firstSubjectId,
      subjectName: firstSubjectName,
      fileUrl: sampleUrl,
      fileSize: 0.12, // approximate MB
      fileType: 'pdf',
      createdAt: now,
      modifiedAt: now,
    };

    setStudyFolders(defaultFolders);
    setStudyFiles([sampleFile]);

    // Optionally persist locally across refresh if not temp-only and local mode is on
    if (forceLocal && !tempOnly) {
      try {
        const keyF = `localStudyFolders:${currentUser.id}`;
        localStorage.setItem(keyF, JSON.stringify(defaultFolders));
        const keyFi = `localStudyFiles:${currentUser.id}`;
        localStorage.setItem(keyFi, JSON.stringify([sampleFile]));
      } catch {}
    }
  }, [currentUser?.id, studyFolders.length, studyFiles.length, subjects]);

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

  // Load study files from Firebase
  useEffect(() => {
    if (currentUser?.id) {
      const unsubscribe = loadStudyFilesFromFirebase();
      return () => {
        if (unsubscribe) {
          unsubscribe.then(unsub => unsub && unsub());
        }
      };
    }
  }, [currentUser?.id, loadStudyFilesFromFirebase]);

  // Load study folders from Firebase
  useEffect(() => {
    if (currentUser?.id) {
      const unsubscribe = loadStudyFoldersFromFirebase();
      return () => {
        if (unsubscribe) {
          unsubscribe.then(unsub => unsub && unsub());
        }
      };
    }
  }, [currentUser?.id, loadStudyFoldersFromFirebase]);

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

  // Load notifications from Firebase
  useEffect(() => {
    if (currentUser?.id) {
      const notificationsQuery = query(
        collection(db, 'notifications'),
        where('studentId', '==', currentUser.id)
      );
      
      const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
        const notificationsData: NotificationType[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          notificationsData.push({
            id: doc.id,
            studentId: data.studentId,
            title: data.title,
            message: data.message,
            type: data.type,
            isRead: data.isRead,
            createdAt: data.createdAt.toDate(),
          });
        });
        setNotifications(notificationsData);
      });
      
      return () => unsubscribe();
    }
  }, [currentUser?.id]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      showCustomAlertPopup('Error', 'Failed to log out. Please try again.', 'error');
    }
  };

  // Semester-aware persistence (local storage per semester)
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
        showCustomAlertPopup('Error', 'Failed to delete assignment. Please try again.', 'error');
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
        showCustomAlertPopup('Error', 'Failed to delete exam. Please try again.', 'error');
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
      showCustomAlertPopup('Error', 'Failed to update assignment status. Please try again.', 'error');
    }
  };

  const handleDuplicateAssignment = async (assignment: Assignment) => {
    if (!currentUser?.id) return;
    
    try {
      const duplicatedAssignment: Omit<Assignment, 'id'> = {
        ...assignment,
        title: `${assignment.title} (Copy)`,
        status: 'pending',
        createdAt: new Date(),
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Set deadline to 7 days from now
      };
      
      const docRef = await addDoc(collection(db, 'assignments'), duplicatedAssignment);
      
      const newAssignmentWithId: Assignment = {
        ...duplicatedAssignment,
        id: docRef.id,
      };
      
      setAssignments([...assignments, newAssignmentWithId]);
      showCustomNotificationMessage('Assignment duplicated successfully!', 'success');
    } catch (error) {
      showCustomAlertPopup('Error', 'Failed to duplicate assignment. Please try again.', 'error');
    }
  };
  const handleEditAssignment = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    // Pre-fill the form with existing assignment data
    setAssignmentForm({
      title: assignment.title,
      subjectId: assignment.subjectId,
      submissionType: assignment.submissionType,
      deadline: assignment.deadline.toISOString().split('T')[0], // Format date for input
      pdfFile: null, // Don't pre-fill file, user can upload new one
    });
    setShowUploadModal(true);
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
      setEditingAssignment(null);
      setAssignmentForm({
        title: '',
        subjectId: '',
        submissionType: 'assignment',
        deadline: '',
        pdfFile: null,
      });
    } catch (error) {
      showCustomAlertPopup('Error', 'Failed to add assignment. Please try again.', 'error');
    }
  };

  const handleUpdateAssignment = async (
    assignmentId: string,
    updatedAssignment: Omit<Assignment, 'id' | 'studentId' | 'createdAt'>
  ) => {
    if (!currentUser?.id) return;
    
    try {
      console.log('Updating assignment:', assignmentId, updatedAssignment);
      
      // Find the existing assignment to preserve its original creation date
      const existingAssignment = assignments.find(a => a.id === assignmentId);
      if (!existingAssignment) {
        console.error('Assignment not found:', assignmentId);
        showCustomAlertPopup('Error', 'Assignment not found. Please try again.', 'error');
        return;
      }
      
      const assignmentToUpdate = {
        ...updatedAssignment,
        studentId: currentUser.id,
        createdAt: existingAssignment.createdAt, // Preserve original creation date
      };
      
      console.log('Assignment data to update:', assignmentToUpdate);
      
      // Validate required fields
      if (!assignmentToUpdate.title || !assignmentToUpdate.subjectId) {
        showCustomAlertPopup('Error', 'Please fill in all required fields.', 'error');
        return;
      }
      
      await updateDoc(doc(db, 'assignments', assignmentId), assignmentToUpdate);
      
      setAssignments(prevAssignments => 
        prevAssignments.map(a => 
          a.id === assignmentId ? { ...assignmentToUpdate, id: assignmentId } : a
        )
      );
      setShowUploadModal(false);
      setEditingAssignment(null);
      setAssignmentForm({
        title: '',
        subjectId: '',
        submissionType: 'assignment',
        deadline: '',
        pdfFile: null,
      });
      showCustomNotificationMessage('Assignment updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating assignment:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      showCustomAlertPopup('Error', `Failed to update assignment: ${errorMessage}`, 'error');
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
      showCustomAlertPopup('Error', 'Failed to add exam. Please try again.', 'error');
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
      showCustomAlertPopup('Error', 'Failed to add subject. Please try again.', 'error');
    }
  };

  const handleEditSubject = async (id: string, name: string, code: string) => {
    if (!currentUser?.id) return;
    
    try {
      const subjectToUpdate = {
        name,
        code,
        studentId: currentUser.id,
        createdAt: subjects.find(s => s.id === id)?.createdAt || new Date(),
      };
      
      await updateDoc(doc(db, 'subjects', id), subjectToUpdate);
      setSubjects(subjects.map(s => s.id === id ? { ...subjectToUpdate, id } : s));
      showCustomNotificationMessage('Subject updated successfully!', 'success');
    } catch (error) {
      showCustomAlertPopup('Error', 'Failed to update subject. Please try again.', 'error');
    }
  };

  const handleDeleteSubject = async (id: string) => {
    if (!currentUser?.id) return;
    
    const subject = subjects.find(s => s.id === id);
    if (!subject) return;
    
    showConfirmDialog(
      'Delete Subject',
      `Are you sure you want to delete "${subject.name}"? This will also remove all related assignments and exams.`,
      async () => {
        try {
          // Delete the subject
          await deleteDoc(doc(db, 'subjects', id));
          
          // Remove related assignments and exams
          setAssignments(assignments.filter(a => a.subjectId !== id));
          setExams(exams.filter(e => e.subjectId !== id));
          
          showCustomNotificationMessage('Subject deleted successfully!', 'success');
        } catch (error) {
          showCustomAlertPopup('Error', 'Failed to delete subject. Please try again.', 'error');
        }
      },
      'danger',
      'Delete Subject',
      'Cancel'
    );
  };

  const handleMarkNotificationAsRead = async (notificationId: string) => {
    if (!currentUser?.id) return;
    
    try {
      // Update in Firebase
      await updateDoc(doc(db, 'notifications', notificationId), {
        isRead: true,
      });
      
      // Update local state
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      ));
      
      showCustomNotificationMessage('Notification marked as read', 'success');
    } catch (error) {
      showCustomAlertPopup('Error', 'Failed to mark notification as read. Please try again.', 'error');
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    if (!currentUser?.id) return;
    
    const notification = notifications.find(n => n.id === notificationId);
    if (!notification) return;
    
    showConfirmDialog(
      'Delete Notification',
      `Are you sure you want to delete the notification "${notification.title}"?`,
      async () => {
        try {
          // Delete from Firebase
          await deleteDoc(doc(db, 'notifications', notificationId));
          
          // Remove from local state
          setNotifications(notifications.filter(n => n.id !== notificationId));
          
          showCustomNotificationMessage('Notification deleted successfully!', 'success');
        } catch (error) {
          showCustomAlertPopup('Error', 'Failed to delete notification. Please try again.', 'error');
        }
      },
      'warning',
      'Delete',
      'Cancel'
    );
  };

  const handleMarkAllNotificationsAsRead = async () => {
    if (!currentUser?.id) return;
    
    try {
      // Get all unread notifications
      const unreadNotifications = notifications.filter(n => !n.isRead);
      
      // Update all unread notifications in Firebase
      const updatePromises = unreadNotifications.map(notification =>
        updateDoc(doc(db, 'notifications', notification.id), {
          isRead: true,
        })
      );
      
      await Promise.all(updatePromises);
      
      // Update local state
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      
      showCustomNotificationMessage('All notifications marked as read!', 'success');
    } catch (error) {
      showCustomAlertPopup('Error', 'Failed to mark all notifications as read. Please try again.', 'error');
    }
  };

  const getUnreadNotificationCount = () => {
    return notifications.filter(n => !n.isRead).length;
  };

  // Custom notification functions
  const showCustomNotificationMessage = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowCustomNotification(true);
    
    // Auto hide after 4 seconds
    setTimeout(() => {
      setShowCustomNotification(false);
    }, 4000);
  };

  const showCustomAlertPopup = (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info', onConfirm?: () => void) => {
    setAlertConfig({ title, message, type, onConfirm: onConfirm || (() => setShowCustomAlert(false)) });
    setShowCustomAlert(true);
  };

  const showConfirmDialog = (
    title: string,
    message: string,
    onConfirm: () => void,
    type: 'danger' | 'warning' | 'info' = 'warning',
    confirmText: string = 'Confirm',
    cancelText: string = 'Cancel'
  ) => {
    setConfirmModalData({
      title,
      message,
      confirmText,
      cancelText,
      onConfirm,
      type,
    });
    setShowConfirmModal(true);
  };

  const handleConfirmModalConfirm = () => {
    if (confirmModalData) {
      confirmModalData.onConfirm();
      setShowConfirmModal(false);
      setConfirmModalData(null);
    }
  };

  const handleConfirmModalCancel = () => {
    setShowConfirmModal(false);
    setConfirmModalData(null);
  };

  const handleDeleteAssignmentFile = async (assignmentId: string) => {
    if (!currentUser?.id) return;
    
    const assignment = assignments.find(a => a.id === assignmentId);
    if (!assignment) return;
    
    showConfirmDialog(
      'Delete File',
      `Are you sure you want to delete the PDF file for "${assignment.title}"? This action cannot be undone.`,
      async () => {
        try {
          // Update assignment to remove file
          await updateDoc(doc(db, 'assignments', assignmentId), {
            pdfUrl: null,
            fileSize: 0,
          });
          
          // Update local state
          setAssignments(assignments.map(a => 
            a.id === assignmentId 
              ? { ...a, pdfUrl: '', fileSize: 0 }
              : a
          ));
          
          showCustomNotificationMessage('File deleted successfully!', 'success');
        } catch (error) {
          showCustomAlertPopup('Error', 'Failed to delete file. Please try again.', 'error');
        }
      },
      'danger',
      'Delete File',
      'Cancel'
    );
  };

  const getSortedAssignmentsBySize = () => {
    return assignments
      .filter(a => a.fileSize && a.fileSize > 0)
      .sort((a, b) => (b.fileSize || 0) - (a.fileSize || 0));
  };

  const getSortedFilesBySize = () => {
    const assignmentFiles = assignments
      .filter(a => a.fileSize && a.fileSize > 0)
      .map(a => ({
        id: a.id,
        name: a.title,
        size: a.fileSize || 0,
        type: 'assignment',
        subjectName: a.subjectName,
        createdAt: a.createdAt,
        fileType: 'pdf'
      }));

    const studyFilesList = studyFiles.map(f => ({
      id: f.id,
      name: f.name,
      size: f.fileSize || 0,
      type: 'study',
      subjectName: f.subjectName,
      createdAt: f.createdAt,
      fileType: f.fileType
    }));

    return [...assignmentFiles, ...studyFilesList]
      .sort((a, b) => b.size - a.size);
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
      // First add subjects
      const subjects = [];
      for (const exam of examData) {
        const subject = {
          name: exam.courseName,
          code: exam.courseCode,
          studentId: currentUser.id,
          createdAt: new Date(),
        };
        
        const subjectRef = await addDoc(collection(db, 'subjects'), subject);
        subjects.push({ ...subject, id: subjectRef.id });
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
          
          const examRef = await addDoc(collection(db, 'exams'), examData);
        }
      }
      
      showCustomAlertPopup('Success', `Data import completed successfully! Added ${subjects.length} subjects and ${examData.length} exams.`, 'success');
      
          } catch (error) {
        showCustomAlertPopup('Error', 'Error importing data: ' + (error as Error).message, 'error');
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
      showCustomAlertPopup('Error', 'Failed to update exam. Please try again.', 'error');
    }
  };

  const handleChangeSemester = async () => {
    const newSemester = prompt('Enter new semester (e.g., Fall 2024):');
    if (!newSemester || !currentUser) return;

    const currentSemester = currentUser.semester || 'Default';
    const userId = currentUser.id;

    // Save current data into localStorage under current semester
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




  // AI Assignment Functions
  const handleAIAssignmentUpload = async (file: File) => {
    try {
      setIsProcessingAI(true);
      setAiStage('uploading');
      setAiStageMessage('Uploading...');
      setAiSubjectNote(null);
      
      // Validate file (PDF or image)
      const validation = PDFService.validateFile(file);
      if (!validation.valid) {
        showCustomAlertPopup('Error', validation.error || 'Invalid file', 'error');
        return;
      }

      setAiPdfFile(file);
      
      // Extract text from file (PDF or image)
      setAiStage('analyzing');
      setAiStageMessage('Analyzing with Campus Intelligence...');
      const rawText = await PDFService.extractTextFromFile(file);
      
      // Extract assignment details using AI
      const subjectHints = subjects
        .map((s) => [s.name, s.code].filter(Boolean).join(' | '))
        .filter(Boolean)
        .join('\n');
      const enrichedText = `SUBJECT CATALOG (name | code):\n${subjectHints}\n\nDOCUMENT:\n${rawText}`;
      const extractedData = await AIService.extractAssignmentDetails(enrichedText);

      // Infer/adjust subject from existing subjects
      let inferredSubjectName: string | undefined;
      if (subjects && subjects.length > 0) {
        const textLower = rawText.toLowerCase();
        const scored = subjects.map((s) => {
          const nameHit = s.name ? textLower.indexOf(s.name.toLowerCase()) : -1;
          const codeHit = s.code ? textLower.indexOf(s.code.toLowerCase()) : -1;
          let score = 0;
          if (nameHit >= 0) score += 100 + (s.name?.length || 0);
          if (codeHit >= 0) score += 80 + (s.code?.length || 0);
          // soft match to AI subject text if present
          if (extractedData.subject) {
            const aiLower = extractedData.subject.toLowerCase();
            if (s.name.toLowerCase().includes(aiLower) || (s.code && s.code.toLowerCase().includes(aiLower))) {
              score += 120;
            }
          }
          return { subject: s, score };
        }).filter(x => x.score > 0).sort((a, b) => b.score - a.score);
        if ((!extractedData.subject || extractedData.subject.trim() === '') && scored.length > 0) {
          inferredSubjectName = scored[0].subject.name;
        } else if (extractedData.subject && scored.length > 0) {
          // If AI subject is slightly different, prefer nearest known subject instead of asking
          inferredSubjectName = scored[0].subject.name;
        }
      }

      // If AI provided a subject (or we inferred one) but it doesn't match existing subjects, mark subject as missing
      let needsSubject = false;
      const subjectCandidate = (inferredSubjectName || extractedData.subject || '').trim();
      if (subjectCandidate) {
        const lowered = subjectCandidate.toLowerCase();
        const match = subjects.some(s => {
          const nameLower = s.name.toLowerCase();
          const codeLower = (s.code || '').toLowerCase();
          return (
            nameLower.includes(lowered) ||
            lowered.includes(nameLower) ||
            (codeLower && codeLower.includes(lowered)) ||
            (codeLower && lowered.includes(codeLower))
          );
        });
        if (!match) {
          // If we still didn't match, ask user
          needsSubject = true;
        }
      } else {
        needsSubject = true;
      }

      const enforcedMissing = new Set<string>(extractedData.missingFields || []);
      if (needsSubject) {
        enforcedMissing.add('subject');
      } else {
        enforcedMissing.delete('subject');
      }
      // Normalize deadline to ISO first, then decide whether to ask for it
      const normalizeToISO = (input: string): string => {
        if (!input) return '';
        const trimmed = input.trim();
        // Already ISO
        if (/^(\d{4})-(\d{2})-(\d{2})$/.test(trimmed)) return trimmed;
        // dd/mm/yyyy or d/m/yyyy
        const dmy = trimmed.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
        if (dmy) {
          const day = parseInt(dmy[1], 10);
          const month = parseInt(dmy[2], 10);
          const year = parseInt(dmy[3].length === 2 ? (parseInt(dmy[3], 10) + 2000).toString() : dmy[3], 10);
          if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && year >= 1900) {
            const iso = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            // Validate constructed date
            const dateObj = new Date(iso);
            if (!isNaN(dateObj.getTime())) return iso;
          }
        }
        // Try native Date parser as last resort (handles named months)
        const fallback = new Date(trimmed);
        if (!isNaN(fallback.getTime())) return fallback.toISOString().split('T')[0];
        return '';
      };

      const normalizedDeadline = normalizeToISO(extractedData.deadline || '');
      if (!normalizedDeadline) {
        enforcedMissing.add('deadline');
      } else {
        enforcedMissing.delete('deadline');
      }
      const finalData = { ...extractedData, subject: inferredSubjectName || extractedData.subject, deadline: normalizedDeadline, missingFields: Array.from(enforcedMissing) };

      setAiStage('completing');
      setAiStageMessage('Completing Details...');
      setAiTypingTarget(`Subject: ${finalData.subject || '—'}  •  Title: ${finalData.title}  •  Deadline: ${finalData.deadline || '—'}`);

      // Ensure overlay hides before showing any modal (avoid stacking)
      setAiStage('idle');
      setAiStageMessage('');
      setIsProcessingAI(false);
      setAiExtractedData(finalData);
      const openDelay = 450; // smooth transition between overlay and modal
      if (finalData.missingFields && finalData.missingFields.length > 0) {
        setShowAIAssignmentModal(false);
        setTimeout(() => setShowMissingInfoModal(true), openDelay);
      } else {
        setShowMissingInfoModal(false);
        setTimeout(() => setShowAIAssignmentModal(true), openDelay);
      }
      
    } catch (error) {
      console.error('Error processing AI assignment:', error);
      showCustomAlertPopup('Error', 'Failed to process file. Please try again or enter details manually.', 'error');
    } finally {
      setIsProcessingAI(false);
      setAiStage('done');
      setAiStageMessage('Done 🎉');
      setTimeout(() => {
        setAiStage('idle');
        setAiStageMessage('');
        setAiSubjectNote(null);
        setAiTypingTarget('');
      }, 900);
    }
  };

  const handleAIAssignmentConfirm = async (data: AIExtractedAssignment) => {
    try {
      if (!currentUser?.id) return;

      // Find matching subject
      let subjectId = '';
      let subjectName = '';
      
      if (data.subject) {
        const matchingSubject = subjects.find(s => 
          s.name.toLowerCase().includes(data.subject!.toLowerCase()) ||
          s.code.toLowerCase().includes(data.subject!.toLowerCase())
        );
        
        if (matchingSubject) {
          subjectId = matchingSubject.id;
          subjectName = matchingSubject.name;
        } else {
          // Use first subject as fallback
          subjectId = subjects[0]?.id || '';
          subjectName = subjects[0]?.name || '';
        }
      } else {
        subjectId = subjects[0]?.id || '';
        subjectName = subjects[0]?.name || '';
      }

      // Create assignment from AI data
      const newAssignment = {
        title: data.title,
        subjectId: subjectId,
        subjectName: subjectName,
        pdfUrl: aiPdfFile ? URL.createObjectURL(aiPdfFile) : '',
        deadline: data.deadline ? new Date(data.deadline) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default to 1 week
        status: 'pending' as const,
        priority: data.priority || 'medium',
        fileSize: aiPdfFile ? aiPdfFile.size / (1024 * 1024) : 0, // store in MB to match formatFileSize usage
        submissionType: data.submissionType || 'assignment',
        studentId: currentUser.id,
        createdAt: new Date(),
      };

      // Add to database
      const docRef = await addDoc(collection(db, 'assignments'), newAssignment);
      const assignmentWithId = { ...newAssignment, id: docRef.id };

      // Rely on Firestore onSnapshot to update local state (avoid duplicates)

      // Reset AI states
      setAiExtractedData(null);
      setAiPdfFile(null);
      setShowAIAssignmentModal(false);

      showCustomNotificationMessage('Assignment created successfully using AI!', 'success');

    } catch (error) {
      console.error('Error creating AI assignment:', error);
      showCustomAlertPopup('Error', 'Failed to create assignment. Please try again.', 'error');
    }
  };

  const handleAIAssignmentEdit = () => {
    // Close AI modal and open regular assignment modal with pre-filled data
    setShowAIAssignmentModal(false);
    setShowUploadModal(true);
    
    // Pre-fill the form with AI data
    if (aiExtractedData) {
      setAssignmentForm({
        title: aiExtractedData.title,
        subjectId: subjects.find(s => s.name.toLowerCase().includes(aiExtractedData.subject?.toLowerCase() || ''))?.id || subjects[0]?.id || '',
        submissionType: aiExtractedData.submissionType || 'assignment',
        deadline: aiExtractedData.deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        pdfFile: aiPdfFile,
      });
    }
  };

  // Missing Info modal state and submit
  const [showMissingInfoModal, setShowMissingInfoModal] = useState(false);
  const handleMissingInfoSubmit = (fixed: AIExtractedAssignment) => {
    setAiExtractedData(fixed);
    setShowMissingInfoModal(false);
    setShowAIAssignmentModal(true);
  };
  const handleClearAllData = async () => {
    if (!currentUser?.id) return;
    
    const userId = currentUser.id; // Capture user ID before callback
    
    showCustomAlertPopup(
      'Clear All Data',
      'Are you sure you want to clear all your data and load only the new ICT course data? This action cannot be undone.',
      'warning',
      async () => {
        try {
          console.log('Clearing all existing data for user:', userId);
          
          // Clear assignments
          const assignmentsQuery = query(collection(db, 'assignments'), where('studentId', '==', userId));
          const assignmentsSnapshot = await getDocs(assignmentsQuery);
          await Promise.all(assignmentsSnapshot.docs.map(doc => deleteDoc(doc.ref)));

          // Clear exams
          const examsQuery = query(collection(db, 'exams'), where('studentId', '==', userId));
          const examsSnapshot = await getDocs(examsQuery);
          await Promise.all(examsSnapshot.docs.map(doc => deleteDoc(doc.ref)));

          // Clear subjects
          const subjectsQuery = query(collection(db, 'subjects'), where('studentId', '==', userId));
          const subjectsSnapshot = await getDocs(subjectsQuery);
          await Promise.all(subjectsSnapshot.docs.map(doc => deleteDoc(doc.ref)));

          // Clear study files
          const studyFilesQuery = query(collection(db, 'studyFiles'), where('studentId', '==', userId));
          const studyFilesSnapshot = await getDocs(studyFilesQuery);
          await Promise.all(studyFilesSnapshot.docs.map(doc => deleteDoc(doc.ref)));

          // Clear study folders
          const studyFoldersQuery = query(collection(db, 'studyFolders'), where('studentId', '==', userId));
          const studyFoldersSnapshot = await getDocs(studyFoldersQuery);
          await Promise.all(studyFoldersSnapshot.docs.map(doc => deleteDoc(doc.ref)));

          // Clear notifications
          const notificationsQuery = query(collection(db, 'notifications'), where('studentId', '==', userId));
          const notificationsSnapshot = await getDocs(notificationsQuery);
          await Promise.all(notificationsSnapshot.docs.map(doc => deleteDoc(doc.ref)));

          console.log('Loading new ICT course data...');
          
          // Load new ICT subjects
          const newSubjects = [
            {
              name: 'FUNDAMENTALS OF ECONOMICS AND BUSINESS MANAGEMENT',
              code: '202003402',
              studentId: userId,
              createdAt: new Date(),
            },
            {
              name: 'SIGNALS SYSTEMS AND APPLICATIONS',
              code: '202230302',
              studentId: userId,
              createdAt: new Date(),
            },
            {
              name: 'DISCRETE MATHEMATICS AND APPLICATIONS',
              code: '202230301',
              studentId: userId,
              createdAt: new Date(),
            },
            {
              name: 'DIGITAL COMPUTER ORGANIZATION',
              code: '202230303',
              studentId: userId,
              createdAt: new Date(),
            },
            {
              name: 'INDIAN ETHOS AND VALUE EDUCATION',
              code: '202003403',
              studentId: userId,
              createdAt: new Date(),
            },
            {
              name: 'DATA STRUCTURES AND ALGORITHMS',
              code: '202230304',
              studentId: userId,
              createdAt: new Date(),
            },
          ];
          
          // Add subjects to database
          const subjectPromises = newSubjects.map(subject => addDoc(collection(db, 'subjects'), subject));
          const subjectDocs = await Promise.all(subjectPromises);
          
          // Load new ICT exams
          const newExams = [
            {
              subjectId: subjectDocs[0].id,
              subjectName: 'FUNDAMENTALS OF ECONOMICS AND BUSINESS MANAGEMENT',
              examType: 'mid',
              examDate: new Date('2025-09-19'),
              startTime: '09:30',
              endTime: '10:30',
              room: 'TBA',
              notes: 'Course Code: 202003402',
              studentId: userId,
              createdAt: new Date(),
            },
            {
              subjectId: subjectDocs[1].id,
              subjectName: 'SIGNALS SYSTEMS AND APPLICATIONS',
              examType: 'mid',
              examDate: new Date('2025-09-19'),
              startTime: '14:00',
              endTime: '15:00',
              room: 'TBA',
              notes: 'Course Code: 202230302',
              studentId: userId,
              createdAt: new Date(),
            },
            {
              subjectId: subjectDocs[2].id,
              subjectName: 'DISCRETE MATHEMATICS AND APPLICATIONS',
              examType: 'mid',
              examDate: new Date('2025-09-20'),
              startTime: '09:30',
              endTime: '10:30',
              room: 'TBA',
              notes: 'Course Code: 202230301',
              studentId: userId,
              createdAt: new Date(),
            },
            {
              subjectId: subjectDocs[3].id,
              subjectName: 'DIGITAL COMPUTER ORGANIZATION',
              examType: 'mid',
              examDate: new Date('2025-09-20'),
              startTime: '09:30',
              endTime: '10:30',
              room: 'TBA',
              notes: 'Course Code: 202230303',
              studentId: userId,
              createdAt: new Date(),
            },
            {
              subjectId: subjectDocs[4].id,
              subjectName: 'INDIAN ETHOS AND VALUE EDUCATION',
              examType: 'mid',
              examDate: new Date('2025-09-22'),
              startTime: '14:00',
              endTime: '15:00',
              room: 'TBA',
              notes: 'Course Code: 202003403',
              studentId: userId,
              createdAt: new Date(),
            },
            {
              subjectId: subjectDocs[5].id,
              subjectName: 'DATA STRUCTURES AND ALGORITHMS',
              examType: 'mid',
              examDate: new Date('2025-09-22'),
              startTime: '09:30',
              endTime: '10:30',
              room: 'TBA',
              notes: 'Course Code: 202230304',
              studentId: userId,
              createdAt: new Date(),
            },
          ];
          
          // Add exams to database
          const examPromises = newExams.map(exam => addDoc(collection(db, 'exams'), exam));
          await Promise.all(examPromises);

          // Reset local state
          setAssignments([]);
          setExams([]);
          setSubjects([]);
          setStudyFiles([]);
          setStudyFolders([]);
          setNotifications([]);

          console.log('Data cleared and new ICT course data loaded successfully!');
          showCustomNotificationMessage('All data cleared and new ICT course data loaded successfully!', 'success');
        } catch (error) {
          console.error('Error clearing and loading data:', error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          console.error('Full error details:', error);
          showCustomAlertPopup('Error', `Failed to clear and load data: ${errorMessage}. Check console for details.`, 'error');
        }
      }
    );
  };


  const changePassword = () => {
    showCustomAlertPopup('Info', 'Password changes are managed by your sign-in provider (Google).', 'info');
  };

  const deleteAccount = () => {
    showCustomAlertPopup('Info', 'Account deletion is not yet implemented. Contact support.', 'info');
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
    const assignmentStorage = assignments.reduce((total, assignment) => total + (assignment.fileSize || 0), 0);
    const studyFileStorage = studyFiles.reduce((total, file) => total + (file.fileSize || 0), 0);
    return assignmentStorage + studyFileStorage;
  };

  const getRemainingStorage = () => {
    return storageInfo.limit - getTotalUsedStorage();
  };

  // Return mobile dashboard for small screens
  if (isMobile) {
    return (
      <MobileStudentDashboard
        assignments={assignments}
        exams={exams}
        subjects={subjects}
        attendance={attendance}
        courseInfo={courseInfo}
      />
    );
  }

  const renderDashboard = () => {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Main content */}
        <div className="w-full">
          {/* Dashboard Grid Layout */}
          <div className="p-6">
            {/* Welcome Header */}
        <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome back, {currentUser?.name?.split(' ')[0]}! 👋
                </h1>
                <p className="text-gray-600">Here is your dashboard overview.</p>
              </div>
              
              {/* Streak Badge */}
              {getCurrentStreak() > 0 && (
                <div className="flex items-center space-x-2 bg-gradient-to-r from-orange-100 to-orange-200 px-4 py-2 rounded-full border-2 border-orange-300">
                  <span className="text-2xl">🔥</span>
                  <div className="text-center">
                    <div className="text-lg font-bold text-orange-700">{getCurrentStreak()}</div>
                    <div className="text-xs text-orange-600">day streak</div>
                  </div>
                </div>
              )}
            </div>
        </div>

            {/* Row 1: Dashboard Overview (6) + AI Assistant (6) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
              {/* Dashboard Overview */}
              <div className="lg:col-span-6">
                <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg hover:border-orange-400 border border-gray-200 transition-all duration-300 h-80 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center">
                      <BarChart3 className="w-6 h-6 mr-2 text-orange-500" />
                      Dashboard Overview
                    </h2>
                  </div>
                  <div className="grid grid-cols-2 gap-4 flex-1 overflow-y-auto max-h-48">
                    <div className="text-center p-4 bg-orange-50 rounded-xl flex flex-col justify-center">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <FileText className="w-6 h-6 text-orange-600" />
                      </div>
            <p className="text-2xl font-bold text-gray-900">{assignments.filter(a => a.status === 'pending').length}</p>
                      <p className="text-sm text-gray-600">Pending</p>
          </div>
                    <div className="text-center p-4 bg-blue-50 rounded-xl flex flex-col justify-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <BookOpen className="w-6 h-6 text-blue-600" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{exams.length}</p>
                      <p className="text-sm text-gray-600">Exams</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-xl flex flex-col justify-center">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <Check className="w-6 h-6 text-green-600" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{assignments.filter(a => a.status === 'completed').length}</p>
                      <p className="text-sm text-gray-600">Completed</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-xl flex flex-col justify-center">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <GraduationCap className="w-6 h-6 text-purple-600" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{subjects.length}</p>
                      <p className="text-sm text-gray-600">Subjects</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Assistant */}
              <div className="lg:col-span-6">
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl shadow-md p-6 hover:shadow-lg hover:border-orange-400 border border-orange-200 transition-all duration-300 h-80 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center">
                      <Brain className="w-6 h-6 mr-2 text-orange-500" />
                      AI Assistant
                    </h2>
                  </div>
                  <div className="space-y-3 flex-1 overflow-y-auto">
                    <div className="p-3 bg-white rounded-lg border border-orange-100">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm">Review Calculus Notes</p>
                          <p className="text-xs text-gray-600 mt-1">Based on your upcoming exam</p>
                        </div>
                        <span className="px-2 py-1 text-xs font-medium rounded-full border bg-red-100 text-red-800 border-red-200">
                          high
                        </span>
                      </div>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-orange-100">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm">Take a Study Break</p>
                          <p className="text-xs text-gray-600 mt-1">You've been studying for 2 hours</p>
                        </div>
                        <span className="px-2 py-1 text-xs font-medium rounded-full border bg-yellow-100 text-yellow-800 border-yellow-200">
                          medium
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2: Pending Assignments (4) + Next Exam (4) + Streak Tracker (4) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 mb-6">
              {/* Pending Assignments */}
              <div className="md:col-span-1 lg:col-span-4">
                <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg hover:border-orange-400 border border-gray-200 transition-all duration-300 h-64 flex flex-col">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center mb-4">
                    <FileText className="w-5 h-5 mr-2 text-orange-500" />
                    Pending Assignments
                  </h2>
                  <div className="space-y-3 flex-1 overflow-y-auto">
                    {assignments.filter(a => a.status === 'pending').slice(0, 4).map((assignment) => {
                      const daysLeft = Math.ceil((assignment.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return (
                        <div key={assignment.id} className="p-3 bg-orange-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 text-sm">{assignment.title}</p>
                              <p className="text-xs text-gray-600">{assignment.subjectName}</p>
                              {assignment.pdfUrl && (
                                <button 
                                  onClick={() => window.open(assignment.pdfUrl, '_blank')}
                                  className="mt-1 text-xs text-blue-600 hover:text-blue-800 underline"
                                >
                                  📄 View File
                                </button>
                              )}
                            </div>
                            <span className="text-sm font-semibold text-orange-600">{daysLeft}d</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Next Exam */}
              <div className="md:col-span-1 lg:col-span-4">
                <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-lg p-6 hover:shadow-xl hover:border-blue-400 border-2 border-blue-200 transition-all duration-300 h-64 flex flex-col">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center mb-4">
                    <BookOpen className="w-5 h-5 mr-2 text-blue-500" />
                    Next Exam
                  </h2>
                  <div className="flex-1 overflow-y-auto">
                    {(() => {
                      // Find the next upcoming exam
                      const now = new Date();
                      const upcomingExams = exams.filter(exam => exam.examDate > now);
                      const nextExam = upcomingExams.length > 0 
                        ? upcomingExams.sort((a, b) => a.examDate.getTime() - b.examDate.getTime())[0]
                        : null;
                      
                      return nextExam ? (
                        <div className="text-center w-full space-y-3 py-2">
                          {/* Days Left Circle */}
                          <div className="relative">
                            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center shadow-lg border-2 border-blue-300">
                              <div className="text-center">
                                <div className="text-lg font-bold text-blue-700">
                                  {Math.ceil((nextExam.examDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))}
                                </div>
                                <div className="text-xs text-blue-600 font-medium">days</div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Exam Details */}
                          <div className="bg-white rounded-lg p-2 shadow-md border border-blue-200">
                            <p className="font-semibold text-gray-900 text-xs mb-1 leading-tight break-words" title={nextExam.subjectName}>
                              {nextExam.subjectName}
                            </p>
                            <p className="text-xs text-gray-600 mb-1 font-medium">
                              {nextExam.examDate.toLocaleDateString('en-US', { 
                                weekday: 'short', 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </p>
                            <div className="flex items-center justify-center space-x-1">
                              <span className="text-xs text-blue-600 font-medium">⏰</span>
                              <span className="text-xs text-gray-700 font-medium">{nextExam.startTime} - {nextExam.endTime}</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <div className="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-3">
                            <span className="text-xl text-gray-400">📚</span>
                          </div>
                          <p className="text-gray-500 text-sm">No upcoming exams</p>
                          <p className="text-gray-400 text-xs mt-1">You're all caught up!</p>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Streak Tracker */}
              <div className="md:col-span-1 lg:col-span-4">
                <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg hover:border-orange-400 border border-gray-200 transition-all duration-300 h-64 flex flex-col">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center mb-4">
                    <TrendingUp className="w-5 h-5 mr-2 text-orange-500" />
                    Streak Tracker
                  </h2>
                  <div className="flex-1 flex flex-col justify-center items-center relative">
                    <div className={`w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-4 transition-all duration-500 ${
                      showStreakAnimation ? 'scale-125 animate-pulse' : 'scale-100'
                    }`}>
                      <span className="text-3xl font-bold text-orange-600">{getCurrentStreak()}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Current Streak</p>
                    <p className="text-xs text-gray-500 mb-4">Longest: {getLongestStreak()} days</p>
                    <div className="w-full">
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-orange-400 to-orange-600 h-3 rounded-full transition-all duration-1000"
                          style={{ 
                            width: `${Math.min(100, (getCurrentStreak() / Math.max(getLongestStreak(), 1)) * 100)}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                    {showStreakAnimation && (
                      <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                        +{streakIncrement}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Row 3: Daily Motivation (12) - Full width */}
            <div className="grid grid-cols-1 gap-6 mb-6">
              {/* Daily Motivation */}
              <div className="col-span-1">
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 text-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl hover:border-orange-300 transition-all duration-300 h-64 flex flex-col">
                  <h2 className="text-lg font-bold mb-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="mr-2">💪</span>
                      Daily Motivation
                    </div>
                    <button 
                      onClick={async () => {
                        // Trigger animation
                        setShowMotivationAnimation(true);
                        
                        // Fetch new motivational quote from API
                        await fetchMotivationalQuote();
                        
                        // Reset animation after animation completes
                        setTimeout(() => {
                          setShowMotivationAnimation(false);
                        }, 800);
                      }}
                      className="text-xs text-orange-600 hover:text-orange-700 underline disabled:opacity-50"
                      disabled={isLoadingQuote}
                    >
                      {isLoadingQuote ? 'loading...' : 'refresh'}
                    </button>
                  </h2>
                  <div className="flex-1 flex flex-col justify-center items-center text-center">
                    <div className={`transition-all duration-500 ${showMotivationAnimation ? 'animate-fade-in' : ''}`}>
                      <p className="text-lg font-medium mb-4 leading-relaxed text-gray-700">
                        "{currentQuote?.text || motivationQuotes[0]?.text}"
                      </p>
                      <p className="text-sm text-orange-600 font-medium">
                        - {currentQuote?.author || motivationQuotes[0]?.author}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 4: Upcoming Exams (6) + Pomodoro Timer (3) + Storage Usage (3) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
              {/* Upcoming Exams */}
              <div className="lg:col-span-6">
                <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg hover:border-orange-400 border border-gray-200 transition-all duration-300 h-64 flex flex-col">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center mb-4">
                    <BookOpen className="w-5 h-5 mr-2 text-orange-500" />
                    Upcoming Exams
                  </h2>
                  <div className="space-y-3 flex-1 overflow-y-auto">
                    {(() => {
                      // Sort exams by date, then by time
                      const sortedExams = exams
                        .filter(e => e.examDate > new Date())
                        .sort((a, b) => {
                          const aDate = new Date(a.examDate.getFullYear(), a.examDate.getMonth(), a.examDate.getDate()).getTime();
                          const bDate = new Date(b.examDate.getFullYear(), b.examDate.getMonth(), b.examDate.getDate()).getTime();
                          if (aDate !== bDate) return aDate - bDate;
                          const [aH, aM] = (a.startTime || '00:00').split(':').map(Number);
                          const [bH, bM] = (b.startTime || '00:00').split(':').map(Number);
                          return aH !== bH ? aH - bH : aM - bM;
                        })
                        .slice(0, 4);

                      // Calculate gap between exams
                      const calculateGap = (currentIndex: number) => {
                        if (currentIndex === 0) return null;
                        const current = sortedExams[currentIndex];
                        const previous = sortedExams[currentIndex - 1];
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
                          return { type: 'hours', label: `${hours}h ${minutes}m gap` };
                        }
                        
                        const dayDiff = Math.ceil((current.examDate.getTime() - previous.examDate.getTime()) / (1000 * 60 * 60 * 24));
                        return { type: 'days', label: `${dayDiff}d gap` };
                      };

                      return sortedExams.map((exam, index) => {
                        const daysLeft = Math.ceil((exam.examDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                        const gap = calculateGap(index);
                        
                        return (
                          <div key={exam.id} className="space-y-2">
                            {gap && (
                              <div className="text-center">
                                <div className="inline-flex items-center px-2 py-1 bg-orange-200 rounded-full">
                                  <span className="text-xs text-orange-700 font-medium">{gap.label}</span>
                                </div>
                              </div>
                            )}
                            <div 
                              className="p-3 bg-orange-50 rounded-lg border border-orange-200 hover:shadow-md hover:border-orange-300 transition-all duration-300 cursor-pointer"
                              onClick={() => setCurrentPage('exams')}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <p className="font-semibold text-gray-900 text-sm">{exam.subjectName}</p>
                                  <p className="text-xs text-gray-600 mb-1">
                                    {exam.examDate.toLocaleDateString('en-US', { 
                                      weekday: 'short', 
                                      month: 'short', 
                                      day: 'numeric' 
                                    })}
                                  </p>
                                  <div className="flex items-center space-x-1">
                                    <span className="text-xs text-orange-600">⏰</span>
                                    <span className="text-xs text-gray-500">{exam.startTime} - {exam.endTime}</span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                                    <span className="text-sm font-bold text-orange-600">{daysLeft}</span>
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1">days</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      });
                    })()}
                    {exams.filter(e => e.examDate > new Date()).length === 0 && (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-3">
                          <span className="text-2xl text-gray-400">📚</span>
                        </div>
                        <p className="text-gray-500 text-sm">No upcoming exams</p>
                        <p className="text-gray-400 text-xs mt-1">You're all caught up!</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Pomodoro Timer */}
              <div className="lg:col-span-3">
                <div className="bg-gradient-to-br from-white to-orange-50 rounded-2xl shadow-lg p-4 hover:shadow-xl hover:border-orange-400 border-2 border-orange-200 transition-all duration-300 h-64 flex flex-col">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center mb-3">
                    <Timer className="w-5 h-5 mr-2 text-orange-500" />
                    Pomodoro Timer
                  </h2>
                  
                  {/* Circular Timer with Progress */}
                  <div className="flex-1 flex items-center justify-center relative">
                    <div className="relative">
                      {/* Outer Progress Ring */}
                      <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                        {/* Background Circle */}
                        <circle
                          cx="60"
                          cy="60"
                          r="50"
                          stroke="#f3f4f6"
                          strokeWidth="8"
                          fill="none"
                        />
                        {/* Progress Circle */}
                        <circle
                          cx="60"
                          cy="60"
                          r="50"
                          stroke="url(#gradient)"
                          strokeWidth="8"
                          fill="none"
                          strokeLinecap="round"
                          strokeDasharray={`${2 * Math.PI * 50}`}
                          strokeDashoffset={`${2 * Math.PI * 50 * (1 - ((pomodoroTime - currentPomodoroTime) / pomodoroTime))}`}
                          className="transition-all duration-1000 ease-in-out"
                        />
                        <defs>
                          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#f97316" />
                            <stop offset="100%" stopColor="#ea580c" />
                          </linearGradient>
                        </defs>
                      </svg>
                      
                      {/* Timer Display */}
                      <div 
                        className={`absolute inset-0 flex items-center justify-center cursor-pointer transition-all duration-300 ${
                          isPomodoroRunning 
                            ? 'animate-pulse' 
                            : 'hover:scale-105'
                        }`}
                        onClick={openTimePopup}
                        title={isPomodoroRunning ? "Timer is running" : "Click to set custom time"}
                      >
                        <div className="text-center">
                          <div className="text-xs text-orange-700 font-medium mb-1">TIMER</div>
                          <div className="text-xl font-bold text-orange-800">
                            {Math.floor(currentPomodoroTime / 60).toString().padStart(2, '0')}:{(currentPomodoroTime % 60).toString().padStart(2, '0')}
                          </div>
                          <div className="text-xs text-orange-600 mt-1">M:S</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Bottom Control Buttons */}
                  <div className="flex space-x-2 mt-2">
                    <button 
                      onClick={togglePomodoro}
                      className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all duration-300 transform hover:scale-105 shadow-md ${
                        isPomodoroRunning 
                          ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                          : 'bg-orange-500 hover:bg-orange-600 text-white'
                      }`}
                    >
                      <span className="flex items-center justify-center space-x-1">
                        <span>{isPomodoroRunning ? '⏸️' : '▶️'}</span>
                        <span className="text-xs">{isPomodoroRunning ? 'Pause' : 'Start'}</span>
                      </span>
                    </button>
                    <button 
                      onClick={resetPomodoro}
                      className="flex-1 bg-orange-400 hover:bg-orange-500 text-white py-2.5 px-3 rounded-lg text-sm font-semibold transition-all duration-300 transform hover:scale-105 shadow-md"
                    >
                      <span className="flex items-center justify-center space-x-1">
                        <span>🔄</span>
                        <span className="text-xs">Reset</span>
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Streak Animation Overlay */}
              {showStreakAnimation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-2xl shadow-2xl p-8 w-96 max-w-sm mx-4 text-center animate-bounce">
                    <div className="text-6xl mb-4">🔥</div>
                    <h2 className="text-2xl font-bold text-orange-600 mb-2">Streak Updated!</h2>
                    <div className="text-4xl font-bold text-orange-700 mb-2">
                      +{streakIncrement}
                    </div>
                    <p className="text-gray-600 mb-4">
                      {getCurrentStreak()} day streak!
                    </p>
                    <div className="text-sm text-gray-500">
                      Keep up the great work! 🚀
                    </div>
                  </div>
                </div>
              )}

              {/* Time Setting Popup Modal */}
              {showTimePopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-2xl shadow-2xl p-6 w-96 max-w-sm mx-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-900 flex items-center">
                        <Timer className="w-6 h-6 mr-2 text-orange-500" />
                        Set Timer Duration
                      </h3>
                      <button
                        onClick={closeTimePopup}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-4">Set your custom timer duration</p>
                      </div>
                      
                      <div className="flex items-center justify-center space-x-4">
                        <div className="text-center">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Minutes</label>
                          <input
                            type="number"
                            min="0"
                            max="59"
                            value={customMinutes}
                            onChange={(e) => setCustomMinutes(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
                            className="w-20 px-3 py-2 border-2 border-orange-300 rounded-lg text-center font-bold text-orange-700 focus:border-orange-500 focus:outline-none"
                          />
                        </div>
                        
                        <div className="text-2xl font-bold text-gray-400">:</div>
                        
                        <div className="text-center">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Seconds</label>
                          <input
                            type="number"
                            min="0"
                            max="59"
                            value={customSeconds}
                            onChange={(e) => setCustomSeconds(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
                            className="w-20 px-3 py-2 border-2 border-orange-300 rounded-lg text-center font-bold text-orange-700 focus:border-orange-500 focus:outline-none"
                          />
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-sm text-gray-500">
                          Total: {customMinutes}m {customSeconds}s
                        </p>
                      </div>
                      
                      <div className="flex space-x-3">
                        <button
                          onClick={closeTimePopup}
                          className="flex-1 py-2 px-4 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-medium transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={applyCustomTime}
                          disabled={customMinutes === 0 && customSeconds === 0}
                          className="flex-1 py-2 px-4 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Storage Usage */}
              <div className="lg:col-span-3">
                <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg hover:border-orange-400 border border-gray-200 transition-all duration-300 h-64 flex flex-col">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center mb-4">
                    <HardDrive className="w-5 h-5 mr-2 text-orange-500" />
                    Storage Usage
                  </h2>
                  <div className="flex-1 flex flex-col justify-center items-center">
                    <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                      <span className="text-2xl font-bold text-orange-600">{storageInfo.percentage.toFixed(1)}%</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2 text-center">
                      {formatFileSize(storageInfo.used * 1024 * 1024)} / {formatFileSize(storageInfo.limit * 1024 * 1024)}
                    </p>
                    <div className="w-full">
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-orange-500 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${storageInfo.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
        </div>

            {/* Row 5: Weekly Summary (6) + Academic Overview (6) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
              {/* Weekly Summary */}
              <div className="lg:col-span-6">
                <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg hover:border-orange-400 border border-gray-200 transition-all duration-300 h-64 flex flex-col">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center mb-4">
                    <Activity className="w-5 h-5 mr-2 text-orange-500" />
                    Weekly Summary
                  </h2>
                  <div className="grid grid-cols-2 gap-4 flex-1 overflow-y-auto max-h-40">
                    <div className="text-center p-3 bg-green-50 rounded-lg flex flex-col justify-center">
                      <p className="text-2xl font-bold text-green-600">8</p>
                      <p className="text-xs text-gray-600">Completed</p>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg flex flex-col justify-center">
                      <p className="text-2xl font-bold text-blue-600">32h</p>
                      <p className="text-xs text-gray-600">Study Hours</p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg flex flex-col justify-center">
                      <p className="text-2xl font-bold text-purple-600">2</p>
                      <p className="text-xs text-gray-600">Exams Taken</p>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg flex flex-col justify-center">
                      <p className="text-2xl font-bold text-orange-600">85%</p>
                      <p className="text-xs text-gray-600">Average Grade</p>
                    </div>
                  </div>
                </div>
        </div>

              {/* Academic Overview */}
              <div className="lg:col-span-6">
                <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg hover:border-orange-400 border border-gray-200 transition-all duration-300 h-64 flex flex-col">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center mb-4">
                    <Award className="w-5 h-5 mr-2 text-orange-500" />
                    Academic Overview
                  </h2>
                  <div className="space-y-4 flex-1 overflow-y-auto">
                    {subjects.map((subject) => {
                      const subjectAssignments = assignments.filter(a => a.subjectId === subject.id);
                      const completed = subjectAssignments.filter(a => a.status === 'completed').length;
                      const total = subjectAssignments.length;
                      const percentage = total > 0 ? (completed / total) * 100 : 0;
                      
                      return (
                        <div key={subject.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-900">{subject.name}</span>
                            <span className="text-sm text-gray-600">{completed}/{total}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Row 6: Notifications (12) */}
            <div className="grid grid-cols-1 gap-6">
              <div className="col-span-full">
                <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg hover:border-orange-400 border border-gray-200 transition-all duration-300 h-64 flex flex-col">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center mb-4">
                    <Bell className="w-5 h-5 mr-2 text-orange-500" />
                    Notifications
                  </h2>
                  <div className="space-y-3 flex-1 overflow-y-auto">
                    {notifications.slice(0, 6).map((notification) => (
                      <div key={notification.id} className={`p-3 rounded-lg border-l-4 ${
                        !notification.isRead 
                          ? 'bg-orange-50 border-orange-400' 
                          : 'bg-gray-50 border-gray-300'
                      }`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{notification.title}</p>
                            <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-2">{notification.createdAt.toLocaleDateString()}</p>
                          </div>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-orange-500 rounded-full ml-2 mt-1"></div>
                          )}
                        </div>
              </div>
            ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>
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
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl h-full flex flex-col shadow-lg">
          <div className="text-center mb-4">
            <h2 className="text-lg font-bold mb-3 flex items-center justify-center">
              <span className="mr-2">📚</span>
              Next Exam
            </h2>
            
            {/* Days Left Circle */}
            <div className="relative mb-3">
              <div className="w-16 h-16 mx-auto bg-white bg-opacity-20 rounded-full flex items-center justify-center shadow-lg border-2 border-white border-opacity-30">
                <div className="text-center">
                  <div className="text-xl font-bold">{daysUntilExam}</div>
                  <div className="text-xs font-medium">days</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Exam Details - Scrollable */}
          <div className="flex-1 overflow-y-auto">
            <div className="bg-white bg-opacity-10 rounded-lg p-3 backdrop-blur-sm">
              <p className="font-bold text-sm mb-2 leading-tight break-words" title={nextExam.subjectName}>
                {nextExam.subjectName}
              </p>
              <p className="text-blue-100 text-xs mb-2 font-medium">
                {nextExam.examDate.toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </p>
              <div className="flex items-center justify-center space-x-1">
                <span className="text-blue-200 text-xs">⏰</span>
                <span className="text-blue-100 text-xs font-medium">{nextExam.startTime} - {nextExam.endTime}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-4">
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
      const unreadCount = getUnreadNotificationCount();
      
      return (
        <div className="h-full flex flex-col p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center">
              <BellIcon className="w-6 h-6 mr-2 text-blue-600" />
              Notifications
            </h3>
            <span className={`text-sm px-3 py-1 rounded-full border ${
              unreadCount > 0 
                ? 'bg-red-500 text-white border-red-500' 
                : 'text-gray-500 bg-white border-gray-200'
            }`}>
              {unreadCount} unread
            </span>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto max-h-64 pr-2">
            {notifications.slice(0, 5).map((n) => (
              <div 
                key={n.id} 
                className={`p-3 rounded-lg transition-all duration-300 cursor-pointer hover:shadow-md ${
                  !n.isRead ? 'bg-orange-50 border-l-4 border-orange-400 hover:bg-orange-100' : 'bg-white hover:bg-gray-50'
                }`}
                onClick={() => handleMarkNotificationAsRead(n.id)}
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
          {notifications.length > 5 && (
            <button 
              onClick={() => setCurrentPage('notifications')}
              className="w-full mt-4 text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View All ({notifications.length})
            </button>
          )}
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
                        {a.pdfUrl ? '📄 Click to view file' : 'No file attached'}
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
          <div className="flex-1 space-y-3 overflow-y-auto max-h-64 pr-2">
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
        <div className="h-full flex flex-col p-6 bg-white rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <BookOpenIcon className="w-6 h-6 mr-2 text-orange-600" />
            Upcoming Exams
          </h3>
          <div className="flex-1 space-y-4 overflow-y-auto max-h-80 pr-2">
            {upcomingExams.map((exam, index) => {
              const daysLeft = Math.ceil((exam.examDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              const gap = calculateGap(index);
              
              return (
                <div key={exam.id} className="space-y-2">
                  {gap && (
                    <div className="text-center">
                      <div className="inline-flex items-center px-3 py-1 bg-orange-200 rounded-full">
                        <span className="text-xs text-orange-700">{gap.label}</span>
                      </div>
                    </div>
                  )}
                  <div 
                    className="p-4 bg-orange-50 rounded-lg border border-orange-200 hover:shadow-md hover:border-orange-300 transition-all duration-300 cursor-pointer"
                    onClick={() => setCurrentPage('exams')}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{exam.examType.toUpperCase()} Exam</p>
                        <p className="text-sm text-gray-600">{exam.subjectName}</p>
                        <p className="text-xs text-gray-500">{exam.examDate.toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-orange-600">{daysLeft}</p>
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
        <div className="h-full flex flex-col p-6 bg-gradient-to-br from-white to-orange-50 rounded-lg shadow-lg border-2 border-orange-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center">
              <Timer className="w-6 h-6 mr-2 text-orange-500" />
              Pomodoro Timer
            </h3>
            <button
              onClick={() => setIsPomodoroMinimized(!isPomodoroMinimized)}
              className="p-1 hover:bg-orange-100 rounded transition-colors text-orange-600"
            >
              {isPomodoroMinimized ? '🔽' : '🔼'}
            </button>
          </div>
          {isPomodoroMinimized ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${
                  isPomodoroRunning 
                    ? 'bg-gradient-to-r from-orange-200 to-orange-300 ring-2 ring-orange-400 animate-pulse' 
                    : 'bg-gradient-to-r from-orange-100 to-orange-200'
                }`}>
                  <span className={`text-lg font-bold transition-colors duration-300 ${
                    isPomodoroRunning ? 'text-orange-700' : 'text-orange-600'
                  }`}>
                    {formatTime(pomodoroTime)}
                  </span>
                </div>
                <div className="flex space-x-1">
                  <button 
                    onClick={handleStart}
                    className={`px-3 py-1 rounded text-xs font-medium transition-all duration-300 ${
                      isPomodoroRunning 
                        ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                        : 'bg-orange-500 hover:bg-orange-600 text-white'
                    }`}
                  >
                    {isPomodoroRunning ? 'Pause' : 'Start'}
                  </button>
                  <button 
                    onClick={handleReset}
                    className="px-3 py-1 bg-orange-400 hover:bg-orange-500 text-white rounded text-xs font-medium transition-colors duration-300"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-center space-y-4">
              {/* Circular Timer with Progress */}
              <div className="flex items-center justify-center relative">
                <div className="relative">
                  {/* Outer Progress Ring */}
                  <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                    {/* Background Circle */}
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      stroke="#f3f4f6"
                      strokeWidth="8"
                      fill="none"
                    />
                    {/* Progress Circle */}
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      stroke="url(#gradient2)"
                      strokeWidth="8"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 50}`}
                      strokeDashoffset={`${2 * Math.PI * 50 * (1 - ((pomodoroTime - (pomodoroTime % 60)) / pomodoroTime))}`}
                      className="transition-all duration-1000 ease-in-out"
                    />
                    <defs>
                      <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#f97316" />
                        <stop offset="100%" stopColor="#ea580c" />
                      </linearGradient>
                    </defs>
                  </svg>
                  
                  {/* Timer Display */}
                  <div 
                    className={`absolute inset-0 flex items-center justify-center cursor-pointer transition-all duration-300 ${
                      isPomodoroRunning 
                        ? 'animate-pulse' 
                        : 'hover:scale-105'
                    }`}
                    onClick={openTimePopup}
                    title={isPomodoroRunning ? "Timer is running" : "Click to set custom time"}
                  >
                    <div className="text-center">
                      <div className="text-xs text-orange-700 font-medium mb-1">TIMER</div>
                      <div className="text-xl font-bold text-orange-800">
                        {formatTime(pomodoroTime)}
                      </div>
                      <div className="text-xs text-orange-600 mt-1">M:S</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 text-center">
                {isPomodoroRunning ? 'Focus Session Active' : 'Click timer to change time'}
              </p>
              
              {/* Bottom Control Buttons */}
              <div className="flex space-x-2">
                <button 
                  onClick={handleStart}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-300 ${
                    isPomodoroRunning 
                      ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                      : 'bg-orange-500 hover:bg-orange-600 text-white'
                  }`}
                >
                  {isPomodoroRunning ? 'Pause' : 'Start'}
                </button>
                <button 
                  onClick={handleReset}
                  className="flex-1 bg-orange-400 hover:bg-orange-500 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-300"
                >
                  Reset
                </button>
              </div>
              
              <div className="text-center">
                <p className="text-xs text-gray-500">Sessions today: {pomodoroSessions.length}</p>
                {isPomodoroRunning && (
                  <div className="mt-2 flex justify-center">
                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-ping"></div>
                  </div>
                )}
              </div>
            </div>
          )}
    </div>
  );
    }

    if (c.id === 'streak-tracker') {
      const currentStreak = getCurrentStreak();
      const longestStreak = getLongestStreak();
      
      return (
        <div className="card h-full flex flex-col p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">🔥</span>
            Streak Tracker
          </h3>
          <div className="flex-1 flex flex-col justify-center space-y-4">
            <div className="text-center relative">
              <div className={`text-4xl font-bold text-orange-600 transition-all duration-500 ${
                showStreakAnimation ? 'scale-150 animate-bounce' : 'scale-100'
              }`}>
                {currentStreak}
              </div>
              <p className="text-sm text-gray-600 mt-2">Current Streak</p>
              {showStreakAnimation && (
                <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                  +{streakIncrement}
                </div>
              )}
            </div>
            
            <div className="bg-orange-50 rounded-lg p-3 text-center">
              <p className="text-sm text-gray-600">Longest</p>
              <p className="text-lg font-bold text-orange-700">{longestStreak} days</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>📚 Study Streak</span>
                <span className="font-medium">{currentStreak} days</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>📅 Login Streak</span>
                <span className="font-medium">{currentStreak} days</span>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-xs text-gray-500">
                {currentStreak > 0 ? "Keep it up! 🔥" : "Start your streak today! 🚀"}
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (c.id === 'weekly-summary') {
      return (
        <div className="card h-full flex flex-col p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Weekly Summary</h3>
          <div className="flex-1 space-y-4 overflow-y-auto max-h-64">
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
      <div className="flex items-center justify-end">
        <div className="flex space-x-3">
          <button
            onClick={() => setShowUploadModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Add Assignment</span>
          </button>
          
          <div className="relative">
            <button
              onClick={openAssignmentAIFilePicker}
              className={`btn-secondary flex items-center space-x-2 ${isProcessingAI ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isProcessingAI}
            >
              {isProcessingAI ? (
                <>
                  <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Add with AI</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Filters and Sorting */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters & Sorting
          </h2>
          <button
            onClick={() => {
              setAssignmentFilter('all');
              setSubjectFilter('all');
              setStatusFilter('all');
              setSortBy('deadline');
              setSortOrder('asc');
            }}
            className="text-sm text-gray-500 hover:text-primary transition-colors duration-200"
          >
            Clear All
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
          {/* Priority Filter */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Priority
            </label>
            <div className="space-y-2">
              {([['all','All'], ['high','High Priority'], ['medium','Medium Priority'], ['low','Low Priority']] as const).map(([key,label]) => (
                <button
                  key={key}
                  onClick={() => setAssignmentFilter(key)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    assignmentFilter === key 
                      ? 'bg-gradient-to-r from-primary to-orange-500 text-white shadow-md' 
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {key !== 'all' && (
                      <div className={`w-2 h-2 rounded-full ${
                        key === 'high' ? 'bg-red-500' : 
                        key === 'medium' ? 'bg-yellow-500' : 
                        'bg-green-500'
                      }`} />
                    )}
                    <span>{label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Subject Filter */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Subject
            </label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              <button
                onClick={() => setSubjectFilter('all')}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  subjectFilter === 'all' 
                    ? 'bg-gradient-to-r from-primary to-orange-500 text-white shadow-md' 
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                All Subjects
              </button>
              {subjects.map((subject) => (
                <button
                  key={subject.id}
                  onClick={() => setSubjectFilter(subject.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    subjectFilter === subject.id 
                      ? 'bg-gradient-to-r from-primary to-orange-500 text-white shadow-md' 
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="truncate">{subject.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <div className="space-y-2">
              {([['all','All'], ['pending','Pending'], ['completed','Completed']] as const).map(([key,label]) => (
                <button
                  key={key}
                  onClick={() => setStatusFilter(key)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    statusFilter === key 
                      ? 'bg-gradient-to-r from-primary to-orange-500 text-white shadow-md' 
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {key !== 'all' && (
                      <div className={`w-2 h-2 rounded-full ${
                        key === 'pending' ? 'bg-orange-500' : 'bg-green-500'
                      }`} />
                    )}
                    <span>{label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Sort Options */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Sort Options
            </label>
            <div className="space-y-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary focus:border-transparent bg-white shadow-sm"
              >
                <option value="deadline">Deadline</option>
                <option value="subject">Subject</option>
                <option value="priority">Priority</option>
                <option value="status">Status</option>
                <option value="title">Title</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="w-full px-3 py-2 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 text-sm font-medium flex items-center justify-center space-x-2 border border-gray-200 transition-all duration-200"
              >
                <svg className={`w-4 h-4 transition-transform duration-200 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                </svg>
                <span>{sortOrder === 'asc' ? 'Ascending' : 'Descending'}</span>
              </button>
            </div>
          </div>
        </div>
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
                .filter(a => {
                  // Priority filter
                  const priorityMatch = assignmentFilter === 'all' ? true : a.priority === assignmentFilter;
                  // Subject filter
                  const subjectMatch = subjectFilter === 'all' ? true : a.subjectId === subjectFilter;
                  // Status filter
                  const statusMatch = statusFilter === 'all' ? true : a.status === statusFilter;
                  return priorityMatch && subjectMatch && statusMatch;
                })
                .slice()
                .sort((a, b) => {
                  let comparison = 0;
                  
                  switch (sortBy) {
                    case 'deadline':
                      const aTime = a.deadline ? a.deadline.getTime() : Number.MAX_SAFE_INTEGER;
                      const bTime = b.deadline ? b.deadline.getTime() : Number.MAX_SAFE_INTEGER;
                      comparison = aTime - bTime;
                      break;
                    case 'subject':
                      comparison = a.subjectName.localeCompare(b.subjectName);
                      break;
                    case 'priority':
                      const priorityOrder = { high: 0, medium: 1, low: 2 };
                      comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
                      break;
                    case 'status':
                      const statusOrder = { pending: 0, completed: 1 };
                      comparison = statusOrder[a.status] - statusOrder[b.status];
                      break;
                    case 'title':
                      comparison = a.title.localeCompare(b.title);
                      break;
                    default:
                      comparison = 0;
                  }
                  
                  return sortOrder === 'asc' ? comparison : -comparison;
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
                    <div className="flex flex-wrap gap-2">
                      {assignment.pdfUrl ? (
                        <button 
                          onClick={() => window.open(assignment.pdfUrl, '_blank')}
                          className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium hover:bg-blue-200 transition-colors"
                        >
                          View File
                        </button>
                      ) : (
                        <span className="text-gray-400 text-xs">No file</span>
                      )}
                      <button
                        onClick={() => handleEditAssignment(assignment)}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium hover:bg-gray-200 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDuplicateAssignment(assignment)}
                        className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium hover:bg-green-200 transition-colors"
                      >
                        Duplicate
                      </button>
                      <button
                        onClick={() =>
                          handleToggleAssignmentStatus(assignment.id)
                        }
                        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                          assignment.status === 'pending'
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                        }`}
                      >
                        {assignment.status === 'pending'
                          ? 'Mark Complete'
                          : 'Mark Pending'}
                      </button>
                      <button
                        onClick={() => handleDeleteAssignment(assignment.id)}
                        className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium hover:bg-red-200 transition-colors"
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

  const renderExams = () => {
    // Sort exams by date, then by time
    const sortedExams = exams.sort((a, b) => {
      const aDate = new Date(a.examDate.getFullYear(), a.examDate.getMonth(), a.examDate.getDate()).getTime();
      const bDate = new Date(b.examDate.getFullYear(), b.examDate.getMonth(), b.examDate.getDate()).getTime();
      if (aDate !== bDate) return aDate - bDate;
      const [aH, aM] = (a.startTime || '00:00').split(':').map(Number);
      const [bH, bM] = (b.startTime || '00:00').split(':').map(Number);
      return aH !== bH ? aH - bH : aM - bM;
    });

    // Calculate gap between exams
    const calculateGap = (currentIndex: number) => {
      if (currentIndex === 0) return null;
      const current = sortedExams[currentIndex];
      const previous = sortedExams[currentIndex - 1];
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
        return { type: 'hours', label: `${hours}h ${minutes}m gap` };
      }
      
      const dayDiff = Math.ceil((current.examDate.getTime() - previous.examDate.getTime()) / (1000 * 60 * 60 * 24));
      return { type: 'days', label: `${dayDiff}d gap` };
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-end">
          <div className="flex space-x-3">
            <button
              onClick={() => setShowExamModal(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Add Exam</span>
            </button>
            {/* Removed Exams Add with AI per request */}
            <button
              onClick={openOcrTestPicker}
              className="btn-secondary flex items-center space-x-2"
              title="Run OCR on an image to test extraction"
            >
              <Sparkles className="w-5 h-5" />
              <span>Test OCR</span>
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {sortedExams.map((exam, index) => {
            const daysUntil = Math.ceil(
              (exam.examDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            );
            const isPast = exam.examDate < new Date();
            const gap = calculateGap(index);

            return (
              <div key={exam.id} className="space-y-3">
                {gap && (
                  <div className="text-center">
                    <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full">
                      <span className="text-sm text-blue-600 font-medium">{gap.label}</span>
                    </div>
                  </div>
                )}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl hover:border-blue-300 transition-all duration-300 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {exam.subjectName}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <span className="text-blue-500">📅</span>
                          <span>{exam.examDate.toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-blue-500">⏰</span>
                          <span>{exam.startTime} - {exam.endTime}</span>
                        </div>
                        {exam.room && (
                          <div className="flex items-center space-x-1">
                            <span className="text-blue-500">🏢</span>
                            <span>{exam.room}</span>
                          </div>
                        )}
                      </div>
                      {exam.notes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">
                            <strong>Notes:</strong> {exam.notes}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                        isPast 
                          ? 'bg-gray-100' 
                          : daysUntil <= 7 
                            ? 'bg-red-100' 
                            : daysUntil <= 14 
                              ? 'bg-yellow-100' 
                              : 'bg-green-100'
                      }`}>
                        <span className={`text-lg font-bold ${
                          isPast 
                            ? 'text-gray-600' 
                            : daysUntil <= 7 
                              ? 'text-red-600' 
                              : daysUntil <= 14 
                                ? 'text-yellow-600' 
                                : 'text-green-600'
                        }`}>
                          {isPast ? '✓' : daysUntil}
                        </span>
                      </div>
                      <p className={`text-xs mt-1 font-medium text-center ${
                        isPast 
                          ? 'text-gray-500' 
                          : daysUntil <= 7 
                            ? 'text-red-500' 
                            : daysUntil <= 14 
                              ? 'text-yellow-500' 
                              : 'text-green-500'
                      }`}>
                        {isPast ? 'Completed' : daysUntil === 1 ? 'day left' : 'days left'}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <button 
                      onClick={() => handleEditExam(exam)}
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteExam(exam.id)}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {exams.length === 0 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-4xl text-gray-400">📚</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No exams scheduled</h3>
              <p className="text-gray-500 mb-4">Add your first exam to get started</p>
              <button
                onClick={() => setShowExamModal(true)}
                className="btn-primary flex items-center space-x-2 mx-auto"
              >
                <PlusIcon className="w-5 h-5" />
                <span>Add Exam</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };
  const renderSubjects = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <div className="flex space-x-3">
          <button
            onClick={() => setShowSubjectsModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Add Subject</span>
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
                onClick={() => {
                  setEditingSubject(subject);
                  setShowSubjectsModal(true);
                }}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
              >
                Edit
              </button>
              <button 
                onClick={() => handleDeleteSubject(subject.id)}
                className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
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
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Total Files</span>
              <span className="font-semibold">
                {assignments.filter(a => a.fileSize && a.fileSize > 0).length + studyFiles.length}
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
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Files by Size (Max to Low)
          </h3>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {assignments.filter(a => a.fileSize && a.fileSize > 0).length + studyFiles.length} files
            </span>
          </div>
          
          {getSortedFilesBySize().length === 0 ? (
            <div className="text-center py-8">
              <CloudIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Files</h3>
              <p className="text-gray-600">No files uploaded yet.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {getSortedFilesBySize().map((file) => (
              <div
                key={file.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <div className="flex-shrink-0">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          file.fileType === 'pdf' ? 'bg-red-100' : 
                          file.fileType === 'doc' || file.fileType === 'docx' ? 'bg-blue-100' :
                          file.fileType === 'jpg' || file.fileType === 'jpeg' || file.fileType === 'png' ? 'bg-green-100' :
                          'bg-gray-100'
                        }`}>
                          <span className={`text-xs font-semibold ${
                            file.fileType === 'pdf' ? 'text-red-600' : 
                            file.fileType === 'doc' || file.fileType === 'docx' ? 'text-blue-600' :
                            file.fileType === 'jpg' || file.fileType === 'jpeg' || file.fileType === 'png' ? 'text-green-600' :
                            'text-gray-600'
                          }`}>
                            {file.fileType.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                        <p className="text-sm text-gray-600 truncate">
                          {file.subjectName} • {file.type === 'assignment' ? 'Assignment' : 'Study Material'} • {file.createdAt.toLocaleDateString()}
                  </p>
                </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                                         <span className="text-sm font-semibold text-gray-700">
                       {formatFileSize(file.size * 1024 * 1024)}
                </span>
                    <button
                      onClick={() => {
                        if (file.type === 'assignment') {
                          handleDeleteAssignmentFile(file.id);
                        } else {
                          handleDeleteFile(studyFiles.find(f => f.id === file.id)!);
                        }
                      }}
                      className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                      title="Delete file"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
              </div>
            ))}
          </div>
          )}
        </div>
      </div>
    </div>
  );

  // File Manager Helper Functions
  const getCurrentFolder = () => {
    if (!currentFolderId) return null;
    return studyFolders.find(f => f.id === currentFolderId);
  };

  const getCurrentItems = () => {
    let items: Array<{ type: 'folder' | 'file', data: StudyFolder | StudyFile }> = [];
    
    if (currentFolderId === null) {
      // Show subjects as main folders
      return subjects.map(subject => ({
        type: 'folder' as const,
        data: {
          id: subject.id,
          studentId: subject.studentId,
          name: subject.name,
          parentId: undefined,
          subjectId: subject.id,
          createdAt: subject.createdAt,
          color: '#ff6b35'
        } as StudyFolder
      }));
    } else {
      // Check if currentFolderId is a subject ID
      const isSubject = subjects.some(s => s.id === currentFolderId);
      
      if (isSubject) {
        // Show folders and files for this subject
        const folders = studyFolders.filter(f => f.subjectId === currentFolderId);
        const files = studyFiles.filter(f => f.subjectId === currentFolderId);
        items = [...folders.map(f => ({ type: 'folder' as const, data: f })), ...files.map(f => ({ type: 'file' as const, data: f }))];
      } else {
        // Show folders and files for this specific folder
        const folders = studyFolders.filter(f => f.parentId === currentFolderId);
        const files = studyFiles.filter(f => f.folderId === currentFolderId);
        items = [...folders.map(f => ({ type: 'folder' as const, data: f })), ...files.map(f => ({ type: 'file' as const, data: f }))];
      }
    }
    
    // Apply search filter
    if (searchQuery) {
      items = items.filter(item => 
        item.data.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply sorting
    items.sort((a, b) => {
      let comparison = 0;
      if (fileSortBy === 'name') {
        comparison = a.data.name.localeCompare(b.data.name);
      } else if (fileSortBy === 'date') {
        comparison = new Date(a.data.createdAt).getTime() - new Date(b.data.createdAt).getTime();
      } else if (fileSortBy === 'size' && a.type === 'file' && b.type === 'file') {
        comparison = (a.data as StudyFile).fileSize - (b.data as StudyFile).fileSize;
      }
      return fileSortOrder === 'asc' ? comparison : -comparison;
    });
    
    return items;
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'pdf':
        return <FileText className="w-8 h-8 text-red-500" />;
      case 'doc':
      case 'docx':
        return <FileText className="w-8 h-8 text-blue-500" />;
      case 'ppt':
      case 'pptx':
        return <FileText className="w-8 h-8 text-orange-500" />;
      case 'xls':
      case 'xlsx':
        return <FileText className="w-8 h-8 text-green-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <FileText className="w-8 h-8 text-purple-500" />;
      default:
        return <File className="w-8 h-8 text-gray-500" />;
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim() || !currentUser?.id) return;
    
    try {
      // Determine subject ID based on current folder
      let subjectId = '';
      
      if (currentFolderId === null) {
        // If no folder selected, use first subject
        subjectId = subjects[0]?.id || '';
      } else {
        // Check if currentFolderId is a subject
        const isSubject = subjects.some(s => s.id === currentFolderId);
        if (isSubject) {
          subjectId = currentFolderId;
        } else {
          // Find subject from folder
          const folder = studyFolders.find(f => f.id === currentFolderId);
          subjectId = folder?.subjectId || subjects[0]?.id || '';
        }
      }
      
      const newFolder: Omit<StudyFolder, 'id'> = {
        studentId: currentUser.id,
        name: newFolderName.trim(),
        parentId: currentFolderId || undefined,
        subjectId,
        createdAt: new Date(),
        color: '#ff6b35', // Orange color
      };
      
      const docRef = await addDoc(collection(db, 'studyFolders'), newFolder);
      const folderWithId: StudyFolder = { ...newFolder, id: docRef.id };
      
      setStudyFolders(prev => [...prev, folderWithId]);
      setNewFolderName('');
      setShowCreateFolderModal(false);
      showCustomNotificationMessage('Folder created successfully!', 'success');
    } catch (error) {
      showCustomAlertPopup('Error', 'Failed to create folder. Please try again.', 'error');
    }
  };

  const handleUploadFile = async () => {
    if (!uploadFile || !uploadFileName.trim() || !currentUser?.id) {
      showCustomAlertPopup('Error', 'Please select a file and enter a name.', 'error');
      return;
    }
    
    // Check storage limits
    const fileSize = uploadFile.size / (1024 * 1024); // Convert to MB
    const remainingSpace = getRemainingStorage();
    
    if (fileSize > remainingSpace) {
      showCustomAlertPopup('Storage Error', `File too large! You need ${formatFileSize((fileSize - remainingSpace) * 1024 * 1024)} more space. Current remaining: ${formatFileSize(remainingSpace * 1024 * 1024)}`, 'error');
      return;
    }
    
    try {
      console.log('Starting file upload:', uploadFileName, 'Size:', fileSize, 'MB');
      
      const fileType = uploadFile.name.split('.').pop() || '';
      
      // Try cloud upload first unless local-only mode is enabled
      let fileUrl: string | undefined;
      const forceLocal = (() => { try { return localStorage.getItem('LOCAL_FILE_MODE') === '1'; } catch { return false; } })();
      if (!forceLocal) {
        try {
          const fileName = `${currentUser.id}/${Date.now()}_${uploadFileName.trim()}`;
          const storageRef = ref(storage, `studyFiles/${fileName}`);
          
          console.log('Uploading to storage path:', `studyFiles/${fileName}`);
          const uploadTask = uploadBytesResumable(storageRef, uploadFile);
          await new Promise<void>((resolve, reject) => {
            uploadTask.on('state_changed', undefined, reject, () => resolve());
          });
          console.log('Upload successful, getting download URL...');
          fileUrl = await getDownloadURL(uploadTask.snapshot.ref);
          console.log('File URL obtained:', fileUrl);
        } catch (cloudErr) {
          console.warn('Cloud upload failed, falling back to local storage:', cloudErr);
        }
      }
      if (!fileUrl) {
        // Local fallback: store file as Data URL in localStorage (MVP only)
        fileUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = () => reject(new Error('Failed to read file for local storage'));
          reader.readAsDataURL(uploadFile);
        });
      }
      
      // Determine subject ID based on current folder
      let subjectId = '';
      let subjectName = '';
      
      if (currentFolderId === null) {
        // If no folder selected, use first subject
        subjectId = subjects[0]?.id || '';
        subjectName = subjects[0]?.name || '';
      } else {
        // Check if currentFolderId is a subject
        const isSubject = subjects.some(s => s.id === currentFolderId);
        if (isSubject) {
          subjectId = currentFolderId;
          subjectName = subjects.find(s => s.id === currentFolderId)?.name || '';
        } else {
          // Find subject from folder
          const folder = studyFolders.find(f => f.id === currentFolderId);
          subjectId = folder?.subjectId || subjects[0]?.id || '';
          subjectName = subjects.find(s => s.id === subjectId)?.name || '';
        }
      }
      
      const newFileBase = {
        studentId: currentUser.id,
        name: uploadFileName.trim(),
        folderId: currentFolderId || '',
        subjectId,
        subjectName,
        fileUrl: fileUrl || '',
        fileSize,
        fileType,
        description: uploadFileDescription,
        createdAt: new Date(),
        modifiedAt: new Date(),
      };

      let fileWithId: StudyFile;
      if (fileUrl && fileUrl.startsWith('data:')) {
        // Local-only record (no Firestore write)
        const localId = `local-${Date.now()}`;
        fileWithId = { ...(newFileBase as any), id: localId } as StudyFile;
        // Optionally persist to localStorage unless temp-only mode is enabled
        try {
          const isTempOnly = (() => { try { return localStorage.getItem('LOCAL_TEMP_MODE') === '1'; } catch { return false; } })();
          if (!isTempOnly) {
            const key = `localStudyFiles:${currentUser.id}`;
            const existing = localStorage.getItem(key);
            const arr = existing ? JSON.parse(existing) : [];
            arr.push(fileWithId);
            localStorage.setItem(key, JSON.stringify(arr));
          }
        } catch {}
      } else {
        // Cloud path: write to Firestore as before
        const docRef = await addDoc(collection(db, 'studyFiles'), newFileBase as any);
        fileWithId = { ...(newFileBase as any), id: docRef.id } as StudyFile;
      }

      setStudyFiles(prev => [...prev, fileWithId]);
      
      // Show detailed success message
      const remainingSpace = getRemainingStorage() - fileSize;
      const usagePercentage = Math.round(((getTotalUsedStorage() + fileSize) / storageInfo.limit) * 100);
      
      showCustomNotificationMessage(
        `File uploaded successfully! ${formatFileSize(fileSize * 1024 * 1024)} uploaded. ${formatFileSize(remainingSpace * 1024 * 1024)} remaining (${usagePercentage}% used)`, 
        'success'
      );
      
      setUploadFile(null);
      setUploadFileName('');
      setUploadFileDescription('');
      setShowUploadFileModal(false);
    } catch (error) {
      console.error('Error uploading file:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      // Check for specific Firebase errors
      if (errorMessage.includes('storage/unauthorized')) {
        showCustomAlertPopup('Error', 'You are not authorized to upload files. Please check your permissions.', 'error');
      } else if (errorMessage.includes('storage/object-not-found')) {
        showCustomAlertPopup('Error', 'Storage location not found. Please try again.', 'error');
      } else if (errorMessage.includes('storage/quota-exceeded')) {
        showCustomAlertPopup('Error', 'Storage quota exceeded. Please delete some files and try again.', 'error');
      } else {
        showCustomAlertPopup('Error', `Failed to upload file: ${errorMessage}`, 'error');
      }
    }
  };

  // Context Menu Handlers
  const handleContextMenu = (e: React.MouseEvent, item: { type: 'file' | 'folder', data: StudyFile | StudyFolder }) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      item,
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu({ visible: false, x: 0, y: 0, item: null });
  };

  const handleDownloadFile = (file: StudyFile) => {
    if (file.fileUrl) {
      const link = document.createElement('a');
      link.href = file.fileUrl;
      link.download = file.name;
      link.click();
    }
    handleCloseContextMenu();
  };

  const handleDeleteFile = async (file: StudyFile) => {
    if (window.confirm(`Are you sure you want to delete "${file.name}"?`)) {
      try {
        const isLocal = file.id.startsWith('local-') || (file.fileUrl?.startsWith('data:') ?? false);
        if (isLocal) {
          // Remove from localStorage
          try {
            const key = `localStudyFiles:${file.studentId}`;
            const existing = localStorage.getItem(key);
            if (existing) {
              const arr = JSON.parse(existing).filter((f: any) => f.id !== file.id);
              localStorage.setItem(key, JSON.stringify(arr));
            }
          } catch {}
        } else {
          // Delete from Firebase Storage if it's a Firebase Storage URL
          if (file.fileUrl && file.fileUrl.includes('firebasestorage.googleapis.com')) {
            try {
              const fileRef = ref(storage, file.fileUrl);
              await deleteObject(fileRef);
            } catch (storageError) {
              console.warn('Could not delete file from storage:', storageError);
            }
          }
          // Delete from Firestore
          await deleteDoc(doc(db, 'studyFiles', file.id));
        }
        setStudyFiles(prev => prev.filter(f => f.id !== file.id));
        showCustomNotificationMessage('File deleted successfully!', 'success');
      } catch (error) {
        showCustomAlertPopup('Error', 'Failed to delete file. Please try again.', 'error');
      }
    }
    handleCloseContextMenu();
  };

  const handleDeleteFolder = async (folder: StudyFolder) => {
    if (window.confirm(`Are you sure you want to delete "${folder.name}"? This will also delete all files inside.`)) {
      try {
        // Delete all files in the folder first
        const filesInFolder = studyFiles.filter(f => f.folderId === folder.id);
        for (const file of filesInFolder) {
          await deleteDoc(doc(db, 'studyFiles', file.id));
        }
        
        // Delete the folder
        await deleteDoc(doc(db, 'studyFolders', folder.id));
        
        setStudyFiles(prev => prev.filter(f => f.folderId !== folder.id));
        setStudyFolders(prev => prev.filter(f => f.id !== folder.id));
        showCustomNotificationMessage('Folder deleted successfully!', 'success');
      } catch (error) {
        showCustomAlertPopup('Error', 'Failed to delete folder. Please try again.', 'error');
      }
    }
    handleCloseContextMenu();
  };

  const handleRefresh = () => {
    // Refresh the file manager by re-fetching data
    // For now, we'll just show a success message
    showCustomNotificationMessage('File manager refreshed!', 'success');
  };
  const renderMaterials = () => (
    <div className="h-full flex flex-col bg-gray-50">
      {/* macOS-style Title Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-semibold text-gray-900">Study Materials</h1>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              {currentFolderId && (
                <>
                  <button
                    onClick={() => setCurrentFolderId(null)}
                    className="hover:text-orange-600 transition-colors"
                  >
                    All Subjects
                  </button>
                  <ChevronRight className="w-4 h-4" />
                  <span className="text-orange-600 font-medium">
                    {getCurrentFolder()?.name}
                  </span>
                </>
              )}
            </div>
          </div>
          
          {/* Toolbar */}
          <div className="flex items-center space-x-3">
            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            
            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            
            {/* Sort Dropdown */}
            <select
              value={`${fileSortBy}-${fileSortOrder}`}
              onChange={(e) => {
                const [by, order] = e.target.value.split('-');
                if (by === 'name' || by === 'date' || by === 'size') {
                  setFileSortBy(by);
                }
                if (order === 'asc' || order === 'desc') {
                  setFileSortOrder(order);
                }
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="date-desc">Date Newest</option>
              <option value="date-asc">Date Oldest</option>
              <option value="size-desc">Size Largest</option>
              <option value="size-asc">Size Smallest</option>
            </select>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowCreateFolderModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <Folder className="w-4 h-4" />
              <span>New Folder</span>
            </button>
            <button
              onClick={() => setShowUploadFileModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>Upload File</span>
            </button>
          </div>
          
          <div className="text-sm text-gray-500">
            {getCurrentItems().length} items
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-6 overflow-auto">
        {currentFolderId === null ? (
          // Show subjects as main folders
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {subjects.map((subject) => (
              <div
                key={subject.id}
                onClick={() => setCurrentFolderId(subject.id)}
                className="group cursor-pointer bg-white rounded-xl p-6 border border-gray-200 hover:border-orange-300 hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                    <BookOpen className="w-8 h-8 text-orange-600" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                  {subject.name}
                </h3>
                <p className="text-sm text-gray-500 text-center">
                  {studyFiles.filter(f => f.subjectId === subject.id).length} files
                </p>
              </div>
            ))}
          </div>
        ) : (
          // Show files and folders in current directory
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-2'}>
            {getCurrentItems().map((item) => (
              <div
                key={item.data.id}
                className={`group cursor-pointer bg-white rounded-xl border border-gray-200 hover:border-orange-300 hover:shadow-lg transition-all duration-200 relative ${
                  viewMode === 'list' ? 'flex items-center p-4' : 'p-6'
                }`}
                onClick={() => {
                  if (item.type === 'folder') {
                    setCurrentFolderId(item.data.id);
                  } else if (item.type === 'file') {
                    const file = item.data as StudyFile;
                    if (file.fileUrl) {
                      window.open(file.fileUrl, '_blank');
                    }
                  }
                }}
                onContextMenu={(e) => handleContextMenu(e, item)}
              >
                {viewMode === 'grid' ? (
                  <>
                    {/* Action Buttons - Show on Hover */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="flex space-x-1">
                        {item.type === 'file' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadFile(item.data as StudyFile);
                            }}
                            className="p-1.5 bg-white rounded-lg shadow-sm hover:bg-gray-50 border border-gray-200"
                            title="Download"
                          >
                            <Download className="w-4 h-4 text-gray-600" />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (item.type === 'file') {
                              handleDeleteFile(item.data as StudyFile);
                            } else {
                              handleDeleteFolder(item.data as StudyFolder);
                            }
                          }}
                          className="p-1.5 bg-white rounded-lg shadow-sm hover:bg-red-50 border border-gray-200 hover:border-red-200"
                          title="Delete"
                        >
                          <svg className="w-4 h-4 text-gray-600 hover:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-center mb-4">
                      {item.type === 'folder' ? (
                        <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                          <Folder className="w-8 h-8 text-orange-600" />
                        </div>
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center">
                          {getFileIcon((item.data as StudyFile).fileType)}
                        </div>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">
                      {item.data.name}
                    </h3>
                    {item.type === 'file' && (
                      <p className="text-sm text-gray-500">
                        {formatFileSize((item.data as StudyFile).fileSize * 1024 * 1024)}
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <div className="flex items-center space-x-4 flex-1">
                      {item.type === 'folder' ? (
                        <Folder className="w-6 h-6 text-orange-600" />
                      ) : (
                        getFileIcon((item.data as StudyFile).fileType)
                      )}
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{item.data.name}</h3>
                        {item.type === 'file' && (
                          <p className="text-sm text-gray-500">
                            {formatFileSize((item.data as StudyFile).fileSize * 1024 * 1024)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {item.type === 'file' && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            const file = item.data as StudyFile;
                            if (file.fileUrl) {
                              const link = document.createElement('a');
                              link.href = file.fileUrl;
                              link.download = file.name;
                              link.click();
                            }
                          }}
                          className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                          <Download className="w-4 h-4 text-gray-500" />
                        </button>
                      )}
                      <button 
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
        
        {getCurrentItems().length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Folder className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-500">
              {searchQuery ? 'Try adjusting your search terms' : 'Upload files or create folders to get started'}
            </p>
          </div>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu.visible && contextMenu.item && (
        <div
          className="fixed bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 min-w-[160px]"
          style={{
            left: contextMenu.x,
            top: contextMenu.y,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {contextMenu.item.type === 'file' ? (
            <>
              <button
                onClick={() => {
                  const file = contextMenu.item!.data as StudyFile;
                  if (file.fileUrl) {
                    window.open(file.fileUrl, '_blank');
                  }
                  handleCloseContextMenu();
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <span>Open</span>
              </button>
              <button
                onClick={() => handleDownloadFile(contextMenu.item!.data as StudyFile)}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
              <div className="border-t border-gray-100 my-1"></div>
              <button
                onClick={() => handleDeleteFile(contextMenu.item!.data as StudyFile)}
                className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Delete</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setCurrentFolderId(contextMenu.item!.data.id);
                  handleCloseContextMenu();
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2"
              >
                <Folder className="w-4 h-4" />
                <span>Open</span>
              </button>
              <div className="border-t border-gray-100 my-1"></div>
              <button
                onClick={() => handleDeleteFolder(contextMenu.item!.data as StudyFolder)}
                className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Delete</span>
              </button>
            </>
          )}
        </div>
      )}

      {/* Exam AI Modal (only show on Exams page) */}
      {currentPage === 'exams' && showExamAIModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Add Exams with AI</h3>
              <button onClick={() => setShowExamAIModal(false)} className="text-gray-500 hover:text-gray-700">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload exam timetable (PDF or image)</label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.gif,.bmp,.webp"
                  ref={examAIFileInputRef}
                  onChange={(e) => handleExamAIFileSelected(e.target.files?.[0] || null)}
                  className="input-field"
                />
              </div>
              {parsedExams.length > 0 && (
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">Review and confirm exams</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="text-left text-gray-700">
                          <th className="py-2 pr-3">Subject</th>
                          <th className="py-2 px-3">Date (YYYY-MM-DD)</th>
                          <th className="py-2 px-3">Start (HH:MM)</th>
                          <th className="py-2 px-3">End (HH:MM)</th>
                          <th className="py-2 pl-3">Subject Map</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {parsedExams.map((ex, idx) => (
                          <tr key={idx}>
                            <td className="py-2 pr-3">
                              <input
                                type="text"
                                className="input-field py-2"
                                value={ex.subjectName}
                                onChange={(e) => {
                                  const copy = [...parsedExams];
                                  copy[idx] = { ...copy[idx], subjectName: e.target.value };
                                  setParsedExams(copy);
                                }}
                                placeholder="Subject name"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                className="input-field py-2"
                                value={ex.examDate}
                                onChange={(e) => {
                                  const copy = [...parsedExams];
                                  copy[idx] = { ...copy[idx], examDate: e.target.value };
                                  setParsedExams(copy);
                                }}
                                placeholder="2025-03-21"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                className="input-field py-2"
                                value={ex.startTime}
                                onChange={(e) => {
                                  const copy = [...parsedExams];
                                  copy[idx] = { ...copy[idx], startTime: e.target.value };
                                  setParsedExams(copy);
                                }}
                                placeholder="09:00"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                className="input-field py-2"
                                value={ex.endTime}
                                onChange={(e) => {
                                  const copy = [...parsedExams];
                                  copy[idx] = { ...copy[idx], endTime: e.target.value };
                                  setParsedExams(copy);
                                }}
                                placeholder="11:00"
                              />
                            </td>
                            <td className="py-2 pl-3">
                              {!subjects.some(s => s.name.toLowerCase() === (ex.subjectName || '').toLowerCase()) ? (
                                <select
                                  className="input-field py-2"
                                  value={parsedExamSubjectIds[idx] || ''}
                                  onChange={(e) => {
                                    const copy = [...parsedExamSubjectIds];
                                    copy[idx] = e.target.value;
                                    setParsedExamSubjectIds(copy);
                                  }}
                                >
                                  <option value="">Choose…</option>
                                  {subjects.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                  ))}
                                </select>
                              ) : (
                                <span className="text-xs text-green-700">Auto-matched</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">Tip: Edit any field to correct OCR/AI errors. Map subjects if names differ.</p>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 bg-gray-50 flex gap-3">
              <button
                type="button"
                onClick={() => setShowExamAIModal(false)}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!aiExamFile) {
                    showCustomAlertPopup('AI Upload', 'Please upload a timetable file.', 'warning');
                    return;
                  }
                  try {
                    const text = await AIService.extractTextFromFile(aiExamFile);
                    const exams = await AIService.extractExamSchedule(text);
                    if (exams.length === 0) {
                      showCustomAlertPopup('AI Parse', 'Could not detect exam entries. Please try a clearer file.', 'warning');
                      return;
                    }
                    setParsedExams(exams);
                    setParsedExamSubjectIds(new Array(exams.length).fill(''));
                    showCustomNotificationMessage(`Parsed ${exams.length} exam(s). Please verify subjects.`, 'info');
                  } catch (e) {
                    showCustomAlertPopup('AI Error', 'Failed to read timetable. Try another file.', 'error');
                  }
                }}
                className="flex-1 btn-secondary"
              >
                Parse with AI
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (parsedExams.length === 0) return;
                  // Validate entries
                  const invalid = parsedExams.find(ex => !ex.subjectName || !ex.examDate || !ex.startTime || !ex.endTime);
                  if (invalid) {
                    showCustomAlertPopup('Missing info', 'Please ensure each row has subject, date, start and end time.', 'warning');
                    return;
                  }
                  for (let i = 0; i < parsedExams.length; i++) {
                    const ex = parsedExams[i];
                    let subjectId = subjects.find(s => s.name.toLowerCase() === (ex.subjectName || '').toLowerCase())?.id || parsedExamSubjectIds[i];
                    if (!subjectId) continue;
                    const subject = subjects.find(s => s.id === subjectId);
                    if (!subject) continue;
                    await handleAddExam({
                      subjectId: subject.id,
                      subjectName: subject.name,
                      examType: 'final',
                      examDate: new Date(ex.examDate),
                      startTime: ex.startTime,
                      endTime: ex.endTime,
                      room: '',
                      notes: 'Added via AI timetable',
                    });
                  }
                  setShowExamAIModal(false);
                  setAiExamFile(null);
                  setParsedExams([]);
                  setParsedExamSubjectIds([]);
                  showCustomNotificationMessage('Exams added from timetable.', 'success');
                }}
                className="flex-1 btn-primary"
              >
                Confirm & Add Exams
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Click outside to close context menu */}
      {contextMenu.visible && (
        <div
          className="fixed inset-0 z-40"
          onClick={handleCloseContextMenu}
        />
      )}
      {/* Auto-close Exam AI modal when leaving Exams page */}
      {showExamAIModal && currentPage !== 'exams' && (
        <>{setShowExamAIModal(false)}</>
      )}
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
        <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          {getUnreadNotificationCount() > 0 && (
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
              {getUnreadNotificationCount()} unread
            </span>
          )}
        </div>
        {getUnreadNotificationCount() > 0 && (
          <button 
            onClick={handleMarkAllNotificationsAsRead}
            className="btn-secondary"
          >
            Mark All as Read
          </button>
        )}
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="card text-center py-12">
            <BellIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Notifications</h3>
            <p className="text-gray-600">You're all caught up!</p>
          </div>
        ) : (
          notifications.map((notification) => (
          <div
            key={notification.id}
            className={`card ${
                !notification.isRead ? 'border-l-4 border-primary bg-blue-50' : ''
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {notification.title}
                </h3>
                    {!notification.isRead && (
                      <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                        New
                      </span>
                    )}
                  </div>
                <p className="text-gray-600 mt-1">{notification.message}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {notification.createdAt.toLocaleDateString()} at{' '}
                  {notification.createdAt.toLocaleTimeString()}
                </p>
              </div>
              <div className="flex space-x-2">
                {!notification.isRead && (
                    <button 
                      onClick={() => handleMarkNotificationAsRead(notification.id)}
                      className="text-primary hover:text-orange-600 text-sm font-medium"
                    >
                    Mark Read
                  </button>
                )}
                  <button 
                    onClick={() => handleDeleteNotification(notification.id)}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                  Delete
                </button>
              </div>
            </div>
          </div>
          ))
        )}
      </div>
    </div>
  );
  const renderAccount = () => (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-gray-600 mt-2">Manage your profile, data, and account preferences</p>
        </div>
        <button
          onClick={() => setShowProfileModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <UserIcon className="w-5 h-5" />
          <span>Edit Profile</span>
        </button>
      </div>

      {/* Profile Information */}
      <div className="card">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
            <User className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Profile Information</h3>
            <p className="text-gray-600">Your personal and academic details</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
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
              Email Address
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
              Phone Number
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
              Academic Year
            </label>
            <input
              type="text"
              value={currentUser?.year || 'Not set'}
              className="input-field"
              readOnly
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Semester
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={currentUser?.semester || 'Not set'}
                className="input-field flex-1"
                readOnly
              />
              <button onClick={handleChangeSemester} className="btn-primary">
                Change Semester
              </button>
            </div>
          </div>
        </div>
      </div>


      {/* Storage Information */}
      <div className="card">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
            <HardDrive className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Storage Usage</h3>
            <p className="text-gray-600">Current storage consumption and limits</p>
          </div>
        </div>

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
              {formatFileSize((storageInfo.limit - storageInfo.used) * 1024 * 1024)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Total Space</span>
            <span className="font-semibold">
              {formatFileSize(storageInfo.limit * 1024 * 1024)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Total Files</span>
            <span className="font-semibold">
              {assignments.filter(a => a.fileSize && a.fileSize > 0).length + studyFiles.length}
            </span>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Usage Progress</span>
              <span className={`text-sm font-medium ${getStorageColor(storageInfo.percentage)}`}>
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
      </div>

      {/* Data Management */}
      <div className="card">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
            <HardDrive className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Data Management</h3>
            <p className="text-gray-600">Clear old data and load new ICT course data</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <button 
            onClick={handleClearAllData} 
            className="w-full flex items-center justify-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg transition-colors"
          >
            <Activity className="w-5 h-5" />
            <span>Clear All Data & Load ICT Courses</span>
          </button>
          <p className="text-sm text-gray-500 text-center">
            This will clear all existing data and load only the new ICT course subjects and exams.
          </p>
        </div>
      </div>

      {/* Account Actions */}
      <div className="card">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Danger Zone</h3>
            <p className="text-gray-600">Irreversible actions that affect your account</p>
          </div>
        </div>

        <div className="space-y-4">
          <button 
            onClick={deleteAccount} 
            className="w-full flex items-center justify-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg transition-colors"
          >
            <Trash2 className="w-5 h-5" />
            <span>Delete Account Permanently</span>
          </button>
          <p className="text-sm text-gray-500 text-center">
            This action cannot be undone. All your data will be permanently deleted.
          </p>
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

  const isStorageFull = getRemainingStorage() <= 0;

  const renderContent = () => {
    if (isStorageFull && currentPage !== 'storage') {
      return (
        <div className="p-6 w-full">
          <div className="max-w-2xl mx-auto bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-700 text-sm">
              Your storage is full. Please free up space in Storage or upgrade your plan to continue using CampusFlow.
            </p>
          </div>
          {renderStorage()}
        </div>
      );
    }
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
        return (
          <div className="w-full">
            <div className="flex items-center justify-between p-4">
              <div className="text-sm text-gray-600">
                Storage used: {formatFileSize(getTotalUsedStorage() * 1024 * 1024)} of {formatFileSize(storageInfo.limit * 1024 * 1024)}
              </div>
              <button
                className="px-3 py-1.5 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700"
                onClick={() => setShowUpgradeModal(true)}
              >
                Upgrade Plan
              </button>
            </div>
            {renderStorage()}
          </div>
        );
      case 'account':
        return renderAccount();
      case 'settings':
        return renderSettings();
      case 'pricing':
        return (
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-1">Free</h4>
                <p className="text-sm text-gray-600 mb-3">1 GB storage, basic features</p>
                <div className="text-2xl font-bold mb-4">$0</div>
                <button disabled className={`w-full px-3 py-2 border rounded-md ${!isUpgraded ? 'text-green-600 border-green-300 bg-green-50' : 'text-gray-500'}`}>{!isUpgraded ? 'Current Plan' : 'Switch'}</button>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-1">Student Plus</h4>
                <p className="text-sm text-gray-600 mb-3">10 GB storage, priority support</p>
                <div className="text-2xl font-bold mb-4">$3/mo</div>
                {isPlusPlan ? (
                  <button disabled className="w-full px-3 py-2 border rounded-md text-green-600 border-green-300 bg-green-50">Current Plan</button>
                ) : (
                  <button onClick={() => handleStartUpgrade({ id: 'plus', name: 'Student Plus', limit: 10000, price: '$3/mo' })} className="w-full px-3 py-2 bg-indigo-600 text-white rounded-md">{isUpgraded ? 'Switch' : 'Upgrade'}</button>
                )}
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-1">Student Pro</h4>
                <p className="text-sm text-gray-600 mb-3">100 GB storage, all features</p>
                <div className="text-2xl font-bold mb-4">$7/mo</div>
                {isProPlan ? (
                  <button disabled className="w-full px-3 py-2 border rounded-md text-green-600 border-green-300 bg-green-50">Current Plan</button>
                ) : (
                  <button onClick={() => handleStartUpgrade({ id: 'pro', name: 'Student Pro', limit: 100000, price: '$7/mo' })} className="w-full px-3 py-2 bg-indigo-600 text-white rounded-md">{isUpgraded ? 'Switch' : 'Upgrade'}</button>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">Payments are simulated for testing.</p>
          </div>
        );
      default:
        return renderDashboard();
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Hidden global Exam AI file input to avoid ref timing issues */}
      <input
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.gif,.bmp,.webp"
        ref={examAIFileInputRef}
        onChange={(e) => handleExamAIFileSelected(e.target.files?.[0] || null)}
        style={{ position: 'fixed', left: -9999, width: 1, height: 1, opacity: 0 }}
        aria-hidden="true"
        tabIndex={-1}
      />
      {/* Hidden AI Assignment input */}
      <input
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.gif,.bmp,.webp"
        ref={aiAssignmentFileInputRef}
        onChange={(e) => {
          const f = e.target.files?.[0] || null;
          if (f) handleAIAssignmentUpload(f);
        }}
        style={{ position: 'fixed', left: -9999, width: 1, height: 1, opacity: 0 }}
        aria-hidden="true"
        tabIndex={-1}
      />
      {/* Hidden OCR test input */}
      <input
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/bmp,image/webp"
        ref={ocrTestFileInputRef}
        onChange={(e) => handleOcrTestFileSelected(e.target.files?.[0] || null)}
        style={{ position: 'fixed', left: -9999, width: 1, height: 1, opacity: 0 }}
        aria-hidden="true"
        tabIndex={-1}
      />
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
          <div className="flex items-center space-x-2" id="tour-app-brand">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-orange-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="text-xl font-bold text-gray-900">ampusFlow</span>
          </div>
          <div className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
            {isProPlan ? 'Pro' : isPlusPlan ? 'Plus' : 'Free'}
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
            {(getRemainingStorage() <= 0 ? navigationItems.filter((i) => i.id === 'storage') : navigationItems).map((item) => (
              <li key={item.id}>
                <button
                  id={`tour-nav-${item.id}`}
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
        {/* Storage Full Popup */}
        {getRemainingStorage() <= 0 && currentPage !== 'storage' && currentPage !== 'exams' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Storage is full</h3>
              <p className="text-sm text-gray-700 mb-4">Please free up space in Storage or upgrade your plan to continue. You can also logout and return later.</p>
              <div className="flex items-center justify-end gap-2">
                <button onClick={handleLogout} className="px-3 py-1.5 border rounded-md text-gray-700">Logout</button>
                <button onClick={() => setCurrentPage('storage')} className="px-3 py-1.5 border rounded-md">Go to Storage</button>
                <button onClick={() => setShowUpgradeModal(true)} className="px-3 py-1.5 bg-indigo-600 text-white rounded-md">Upgrade</button>
              </div>
            </div>
          </div>
        )}
        {/* Top navigation */}
        <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <button
                  id="tour-open-menu"
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
                  <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors" id="tour-profile">
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
          {(isProcessingAI || aiStage !== 'idle') && (
            <div className="fixed inset-0 z-[60] pointer-events-none flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 animate-pulse"></div>
              <div className="relative pointer-events-auto w-full max-w-xl mx-4 p-6 rounded-2xl shadow-2xl bg-white/90 border border-purple-200 backdrop-blur">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <span className="animate-bounce">✨</span>
                    <span>Campus Intelligence</span>
                  </div>
                  <div className="text-sm text-gray-600">{aiStageMessage}</div>
                </div>
                {/* Progress bar removed per request; using descriptive stage text below */}
                <div className="min-h-[44px] font-mono text-sm text-gray-800 whitespace-pre-wrap">
                  <span className="text-gray-700">
                    {aiStage === 'uploading' && 'Detecting file…'}
                    {aiStage === 'analyzing' && 'Extracting text and analyzing information…'}
                    {aiStage === 'completing' && 'Completing details…'}
                    {aiStage === 'done' && 'Done 🎉'}
                  </span>
                </div>
                {aiSubjectNote === 'missing' && (
                  <div className="mt-4 text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 text-sm">⚠️ Subject missing – auto-detecting with Campus Intelligence…</div>
                )}
                {aiSubjectNote === 'added' && (
                  <div className="mt-4 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2 text-sm">✅ Subject added successfully.</div>
                )}
                <div className="absolute -top-2 -right-2 text-2xl animate-ping">📚</div>
                <div className="absolute -bottom-3 left-6 text-2xl animate-bounce">✨</div>
                <div className="absolute -top-4 left-10 text-2xl animate-pulse">🪄</div>
              </div>
            </div>
          )}
          {renderContent()}
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Upgrade Plan</h3>
              <button onClick={() => setShowUpgradeModal(false)} className="text-gray-500 hover:text-gray-700">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {!upgradePlan && (
                <>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-1">Free</h4>
                      <p className="text-sm text-gray-600 mb-2">1 GB storage, basic features</p>
                      <div className="text-xl font-bold mb-3">$0</div>
                      <button disabled className="w-full px-3 py-2 border rounded-md text-gray-500">Current Plan</button>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-1">Student Plus</h4>
                      <p className="text-sm text-gray-600 mb-2">10 GB storage, priority support</p>
                      <div className="text-xl font-bold mb-3">$3/mo</div>
                      <button onClick={() => handleStartUpgrade({ id: 'plus', name: 'Student Plus', limit: 10000, price: '$3/mo' })} className="w-full px-3 py-2 bg-indigo-600 text-white rounded-md">Upgrade</button>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-1">Student Pro</h4>
                      <p className="text-sm text-gray-600 mb-2">100 GB storage, all features</p>
                      <div className="text-xl font-bold mb-3">$7/mo</div>
                      <button onClick={() => handleStartUpgrade({ id: 'pro', name: 'Student Pro', limit: 100000, price: '$7/mo' })} className="w-full px-3 py-2 bg-indigo-600 text-white rounded-md">Upgrade</button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">Payments are simulated for testing.</p>
                </>
              )}
              {upgradePlan && (
                <div className="space-y-4">
                  <div className="text-center">
                    <h4 className="text-base font-semibold text-gray-900">{upgradePlan.name}</h4>
                    <p className="text-sm text-gray-600">{upgradePlan.price} • {upgradePlan.limit >= 1000 ? `${Math.round(upgradePlan.limit/1000)} GB` : `${upgradePlan.limit} MB`} storage</p>
                  </div>
                  <div className="space-y-3">
                    <div className={`flex items-center gap-3 p-3 rounded-lg border ${paymentStatus !== 'idle' ? 'border-indigo-200 bg-indigo-50' : 'border-gray-200'}`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${paymentStatus === 'auth' || paymentStatus === 'processing' || paymentStatus === 'success' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">Authenticating user</div>
                        <div className="text-xs text-gray-500">Verifying account...</div>
                      </div>
                      {paymentStatus === 'success' && <CheckIcon className="w-5 h-5 text-green-600" />}
                    </div>
                    <div className={`flex items-center gap-3 p-3 rounded-lg border ${paymentStatus === 'processing' || paymentStatus === 'success' ? 'border-indigo-200 bg-indigo-50' : 'border-gray-200'}`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${paymentStatus === 'processing' || paymentStatus === 'success' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">Confirming payment</div>
                        <div className="text-xs text-gray-500">Processing transaction...</div>
                      </div>
                      {paymentStatus === 'success' && <CheckIcon className="w-5 h-5 text-green-600" />}
                    </div>
                    <div className={`flex items-center gap-3 p-3 rounded-lg border ${paymentStatus === 'success' ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${paymentStatus === 'success' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'}`}>3</div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">All set!</div>
                        <div className="text-xs text-gray-500">Plan activated • Enjoy more storage</div>
                      </div>
                      {paymentStatus === 'success' && <Sparkles className="w-5 h-5 text-green-600" />}
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button onClick={() => { setUpgradePlan(null); setPaymentStatus('idle'); }} className="px-3 py-2 border rounded-md">Back</button>
                    <button
                      onClick={async () => {
                        if (paymentStatus === 'idle') {
                          setPaymentStatus('auth');
                          await new Promise(r => setTimeout(r, 1000));
                          setPaymentStatus('processing');
                          await new Promise(r => setTimeout(r, 1200));
                          setPaymentStatus('success');
                          setStorageInfo((s) => ({ ...s, limit: upgradePlan.limit }));
                          try { localStorage.setItem('cf_plan_limit', String(upgradePlan.limit)); } catch {}
                          showCustomNotificationMessage(`Payment successful! Plan upgraded to ${upgradePlan.name}.`, 'success');
                          setShowUpgradeTour(true);
                          try {
                            localStorage.setItem('cf_seen_upgrade_tour', '0');
                          } catch {}
                          setTimeout(() => {
                            setShowUpgradeModal(false);
                            setUpgradePlan(null);
                            setPaymentStatus('idle');
                            // Close modal; state already updated and persisted
                          }, 1200);
                        }
                      }}
                      className={`px-3 py-2 rounded-md text-white ${paymentStatus === 'idle' ? 'bg-indigo-600 hover:bg-indigo-700' : paymentStatus === 'success' ? 'bg-green-600' : 'bg-indigo-400'}`}
                      disabled={paymentStatus !== 'idle'}
                    >
                      {paymentStatus === 'idle' ? 'Pay now' : paymentStatus === 'auth' ? 'Authenticating...' : paymentStatus === 'processing' ? 'Processing...' : 'Success'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                {editingAssignment ? 'Edit Assignment' : 'Add New Assignment'}
            </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
            <form
                className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                // Form submission is handled by the button onClick, not here
                // This prevents double submission
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
                      setAssignmentForm({
                        ...assignmentForm,
                        subjectId: e.target.value,
                      });
                    }}
                  required
                >
                  <option value="">Select Subject</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
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
                  File (PDF or Image - Optional)
                </label>
                <div className="space-y-2">
                  {/* Show existing PDF when editing */}
                  {editingAssignment && editingAssignment.pdfUrl && !assignmentForm.pdfFile && (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-800">
                            Current PDF: {editingAssignment.title}.pdf
                          </p>
                          <p className="text-xs text-blue-600">
                            Size: {editingAssignment.fileSize ? formatFileSize(editingAssignment.fileSize * 1024 * 1024) : 'Unknown'}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => window.open(editingAssignment.pdfUrl, '_blank')}
                            className="text-blue-500 hover:text-blue-700 text-sm"
                          >
                            View
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.gif,.bmp,.webp"
                  className="input-field"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                    setAssignmentForm({
                      ...assignmentForm,
                        pdfFile: file,
                      });
                    }}
                  />
                  
                  {/* Show new file selection */}
                  {assignmentForm.pdfFile && (
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-green-800">
                            New PDF: {assignmentForm.pdfFile.name}
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
                    setEditingAssignment(null);
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
                {isUpgraded ? (
                  <button
                    type="button" 
                    onClick={(e) => {
                      e.preventDefault();
                      const subject = subjects.find(
                        (s) => s.id === assignmentForm.subjectId
                      );
                      if (subject) {
                        const autoPriority = calculateAutoPriority(assignmentForm.deadline);
                        const fileSize = assignmentForm.pdfFile ? assignmentForm.pdfFile.size / (1024 * 1024) : 0;
                        
                        // Store the editing assignment in a local variable to prevent race conditions
                        const currentEditingAssignment = editingAssignment;
                        
                        if (currentEditingAssignment) {
                          // Update existing assignment
                          handleUpdateAssignment(currentEditingAssignment.id, {
                            title: assignmentForm.title,
                            subjectId: assignmentForm.subjectId,
                            subjectName: subject.name,
                            pdfUrl: assignmentForm.pdfFile ? URL.createObjectURL(assignmentForm.pdfFile) : currentEditingAssignment.pdfUrl,
                            deadline: new Date(assignmentForm.deadline),
                            status: currentEditingAssignment.status, // Keep existing status
                            priority: autoPriority,
                            fileSize: fileSize || currentEditingAssignment.fileSize,
                            submissionType: assignmentForm.submissionType,
                          });
                        } else {
                          // Add new assignment
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
                        
                        setShowUploadModal(false);
                        setEditingAssignment(null);
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
                    {editingAssignment ? 'Update Assignment' : 'Add Assignment'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowUpgradeModal(true)}
                    className="flex-1 btn-primary"
                  >
                    Unlock AI Assistant
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Tour (robot/teacher style) */}
      {showUpgradeTour && isUpgraded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl max-w-md w-full p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                🤖
              </div>
              <h4 className="text-lg font-semibold text-gray-900">Welcome to your upgraded CampusFlow!</h4>
            </div>
            <ul className="text-sm text-gray-700 space-y-2 mb-4 list-disc list-inside">
              <li>New AI Assistant on your dashboard for smart study tips.</li>
              <li>AI-powered Assignment helper: extract details from PDFs and images.</li>
              <li>Priority features and larger storage unlocked.</li>
            </ul>
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => {
                  try { localStorage.setItem('cf_seen_upgrade_tour', '1'); } catch {}
                  setShowUpgradeTour(false);
                }} 
                className="px-3 py-2 border rounded-md"
              >
                Maybe later
              </button>
              <button 
                onClick={() => { 
                  setShowUpgradeTour(false); 
                  setCurrentPage('dashboard'); 
                  try {
                    const tour = introJs();
                    tour.setOptions({
                      steps: [
                        { element: '#tour-nav-dashboard', intro: 'New AI Assistant added on your dashboard.' },
                        { element: '#tour-nav-assignments', intro: 'Use AI to extract assignment details.' },
                        { element: '#tour-nav-storage', intro: 'Enjoy your increased storage here.' }
                      ],
                      showBullets: false,
                      showProgress: true,
                    });
                    tour.onchange((el: Element) => {
                      if (el && el.id === 'tour-nav-dashboard') setCurrentPage('dashboard');
                      if (el && el.id === 'tour-nav-assignments') setCurrentPage('assignments');
                      if (el && el.id === 'tour-nav-storage') setCurrentPage('storage');
                    });
                    tour.start();
                    localStorage.setItem('cf_seen_upgrade_tour', '1');
                  } catch {}
                }} 
                className="px-3 py-2 bg-indigo-600 text-white rounded-md"
              >
                Show me
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Post-upgrade guided tour handled via the modal's Show me button */}

      {/* AI Assignment Modal */}
      {showAIAssignmentModal && aiExtractedData && (
        <AIAssignmentModal
          isOpen={showAIAssignmentModal}
          onClose={() => {
            setShowAIAssignmentModal(false);
            setAiExtractedData(null);
            setAiPdfFile(null);
          }}
          extractedData={aiExtractedData}
          onConfirm={handleAIAssignmentConfirm}
          onEdit={handleAIAssignmentEdit}
        />
      )}

      {/* Missing Info Modal */}
      {showMissingInfoModal && aiExtractedData && (
        <MissingInfoModal
          isOpen={showMissingInfoModal}
          onClose={() => setShowMissingInfoModal(false)}
          missingFields={aiExtractedData.missingFields || []}
          subjects={subjects.map(s => ({ id: s.id, name: s.name, code: s.code }))}
          initialData={aiExtractedData}
          onSubmit={handleMissingInfoSubmit}
        />
      )}
      {/* Exam Modal */}
      {showExamModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Add New Exam</h3>
              <button
                type="button"
                onClick={openExamAIFilePicker}
                className="text-sm px-3 py-1.5 bg-indigo-600 text-white rounded-md"
              >
                Use AI (Upload Timetable)
              </button>
            </div>
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
                  onChange={(e) => setExamForm({ ...examForm, subjectId: e.target.value })}
                  required
                >
                  <option value="">Select Subject</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
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
                >
                  <option value="">Select Subject</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
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

      {/* Create Folder Modal */}
      {showCreateFolderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Create New Folder
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCreateFolder();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Folder Name
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter folder name"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  required
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateFolderModal(false);
                    setNewFolderName('');
                  }}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  Create Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload File Modal */}
      {showUploadFileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Upload File
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUploadFile();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  File Name
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter file name"
                  value={uploadFileName}
                  onChange={(e) => setUploadFileName(e.target.value)}
                  required
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
                  value={uploadFileDescription}
                  onChange={(e) => setUploadFileDescription(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select File
                </label>
                <input
                  type="file"
                  className="input-field"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  required
                />
                {uploadFile && (
                  <div className="mt-2 p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-sm font-medium text-green-800">
                          {uploadFile.name}
                        </p>
                        <p className="text-xs text-green-600">
                          Size: {formatFileSize(uploadFile.size)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setUploadFile(null)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                    
                    {/* Storage Information */}
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Current Usage:</span>
                        <span className="font-medium">{formatFileSize(getTotalUsedStorage() * 1024 * 1024)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">After Upload:</span>
                        <span className="font-medium">{formatFileSize((getTotalUsedStorage() + uploadFile.size / (1024 * 1024)) * 1024 * 1024)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Remaining Space:</span>
                        <span className={`font-medium ${getRemainingStorage() - uploadFile.size / (1024 * 1024) < 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {formatFileSize((getRemainingStorage() - uploadFile.size / (1024 * 1024)) * 1024 * 1024)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            getRemainingStorage() - uploadFile.size / (1024 * 1024) < 0 
                              ? 'bg-red-500' 
                              : (getTotalUsedStorage() + uploadFile.size / (1024 * 1024)) / storageInfo.limit > 0.9 
                                ? 'bg-yellow-500' 
                                : 'bg-green-500'
                          }`}
                          style={{ 
                            width: `${Math.min(((getTotalUsedStorage() + uploadFile.size / (1024 * 1024)) / storageInfo.limit) * 100, 100)}%` 
                          }}
                        ></div>
                      </div>
                      <div className="text-center">
                        <span className="text-xs text-gray-500">
                          {Math.round(((getTotalUsedStorage() + uploadFile.size / (1024 * 1024)) / storageInfo.limit) * 100)}% of storage will be used
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadFileModal(false);
                    setUploadFile(null);
                    setUploadFileName('');
                    setUploadFileDescription('');
                  }}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  Upload File
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
                  onChange={(e) => setExamForm({ ...examForm, subjectId: e.target.value })}
                  required
                >
                  <option value="">Select Subject</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
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
              {editingSubject ? 'Edit Subject' : 'Add New Subject'}
            </h3>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const name = formData.get('name') as string;
                const code = formData.get('code') as string;
                if (name && code) {
                  if (editingSubject) {
                    handleEditSubject(editingSubject.id, name, code);
                    setEditingSubject(null);
                  } else {
                    handleAddSubject(name, code);
                  }
                  setShowSubjectsModal(false);
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
                  defaultValue={editingSubject?.name || ''}
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
                  defaultValue={editingSubject?.code || ''}
                  required
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowSubjectsModal(false);
                    setEditingSubject(null);
                  }}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  {editingSubject ? 'Update Subject' : 'Add Subject'}
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

      {/* Custom Notification */}
      {showCustomNotification && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
          <div className={`rounded-lg shadow-lg p-4 max-w-sm ${
            notificationType === 'success' ? 'bg-green-500 text-white' :
            notificationType === 'error' ? 'bg-red-500 text-white' :
            notificationType === 'warning' ? 'bg-yellow-500 text-white' :
            'bg-blue-500 text-white'
          }`}>
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                {notificationType === 'success' && (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
                {notificationType === 'error' && (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
                {notificationType === 'warning' && (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                )}
                {notificationType === 'info' && (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{notificationMessage}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowCustomNotification(false)}
                className="text-white hover:text-gray-200 focus:outline-none"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Legacy AI Assignment upload popup removed */}

      {/* AI Processing Overlay */}
      {false && isProcessingAI && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">AI Processing</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full animate-pulse bg-blue-500"></div>
                <p className="text-sm font-medium text-gray-700">{aiStageMessage}</p>
              </div>
              {aiStage === 'analyzing' && (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full animate-pulse bg-blue-500"></div>
                  <p className="text-sm font-medium text-gray-700">Analyzing PDF...</p>
                </div>
              )}
              {aiStage === 'completing' && (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full animate-pulse bg-blue-500"></div>
                  <p className="text-sm font-medium text-gray-700">Completing extraction...</p>
                </div>
              )}
              {aiStage === 'done' && (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-green-500"></div>
                  <p className="text-sm font-medium text-gray-700">Extraction completed!</p>
                </div>
              )}
              {aiTypingShown && (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full animate-pulse bg-blue-500"></div>
                  <p className="text-sm font-medium text-gray-700">{aiTypingShown}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
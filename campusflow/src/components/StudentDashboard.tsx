import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
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
} from '../types';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  rectSortingStrategy,
  arrayMove,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const StudentDashboard: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([
    {
      id: '1',
      studentId: '1',
      title: 'Physics Lab Report',
      subjectId: '2',
      subjectName: 'Physics',
      pdfUrl: '',
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
      pdfUrl: '',
      deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      status: 'completed',
      createdAt: new Date(),
      priority: 'medium',
      fileSize: 1.8,
      submissionType: 'assignment',
    },
  ]);
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
  const [subjects] = useState<Subject[]>([
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
  const [notifications] = useState<Notification[]>([
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [customizeMode, setCustomizeMode] = useState(false);
  const [cards, setCards] = useState<DashboardCard[]>([
    {
      id: 'welcome',
      type: 'customization',
      title: 'Welcome',
      description: 'Greeting and overview',
      icon: 'ChartBarIcon',
      enabled: true,
      order: 1,
      size: 's',
    },
    {
      id: 'deadlines',
      type: 'deadlines',
      title: 'Upcoming Deadline',
      description: 'Shows the nearest assignment deadline',
      icon: 'ClockIcon',
      enabled: true,
      order: 2,
      size: 'm',
    },
    {
      id: 'next-exam',
      type: 'exams',
      title: 'Next Exam',
      description: 'Shows the next exam info',
      icon: 'BookOpenIcon',
      enabled: true,
      order: 3,
      size: 'm',
    },
    {
      id: 'quick-stats',
      type: 'assignments',
      title: 'Quick Stats',
      description: 'Assignments and exams stats',
      icon: 'ChartBarIcon',
      enabled: true,
      order: 4,
      size: 'm',
    },
    {
      id: 'storage',
      type: 'storage',
      title: 'Storage Usage',
      description: 'Usage of storage',
      icon: 'CloudIcon',
      enabled: true,
      order: 5,
      size: 's',
    },
    {
      id: 'notifications',
      type: 'notifications',
      title: 'Notifications',
      description: 'Recent notifications',
      icon: 'BellIcon',
      enabled: true,
      order: 6,
      size: 's',
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
    priority: 'medium' as 'low' | 'medium' | 'high',
    deadline: '',
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

  // Navigation items
  const navigationItems = [
    { id: 'dashboard', name: 'Dashboard', icon: ChartBarIcon },
    { id: 'assignments', name: 'Assignments', icon: DocumentTextIcon },
    { id: 'exams', name: 'Exams', icon: BookOpenIcon },
    { id: 'materials', name: 'Materials', icon: DocumentTextIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'storage', name: 'Storage', icon: CloudIcon },
    { id: 'account', name: 'Account', icon: UserIcon },
  ];

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

      const days = Math.ceil(
        (next.examDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      setDaysUntilExam(days);
    }
  }, [assignments, exams, storageInfo.limit]);

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

  const handleDeleteAssignment = (id: string) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      setAssignments(assignments.filter((a) => a.id !== id));
    }
  };

  const handleDeleteExam = (id: string) => {
    if (window.confirm('Are you sure you want to delete this exam?')) {
      setExams(exams.filter((e) => e.id !== id));
    }
  };

  const handleToggleAssignmentStatus = (id: string) => {
    setAssignments(
      assignments.map((a) =>
        a.id === id
          ? { ...a, status: a.status === 'completed' ? 'pending' : 'completed' }
          : a
      )
    );
  };

  const handleAddAssignment = (
    assignment: Omit<Assignment, 'id' | 'studentId' | 'createdAt'>
  ) => {
    const newAssignment: Assignment = {
      ...assignment,
      id: Date.now().toString(),
      studentId: currentUser?.id || '1',
      createdAt: new Date(),
    };
    setAssignments([...assignments, newAssignment]);
    setShowUploadModal(false);
  };

  const handleAddExam = (
    exam: Omit<Exam, 'id' | 'studentId' | 'createdAt'>
  ) => {
    const newExam: Exam = {
      ...exam,
      id: Date.now().toString(),
      studentId: currentUser?.id || '1',
      createdAt: new Date(),
    };
    setExams([...exams, newExam]);
    setShowExamModal(false);
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

  const renderDashboard = () => {
    const ordered = [...cards].sort((a, b) => a.order - b.order).filter((c) => c.enabled);

    return (
      <div className="space-y-6">
        {/* Top info bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
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
            onClick={() => setCurrentPage('storage')}
          >
            <p className="text-sm text-gray-600">Storage Used</p>
            <p className="text-2xl font-bold text-gray-900">{storageInfo.percentage.toFixed(0)}%</p>
            <p className="text-xs text-gray-500 mt-1">Click to manage</p>
          </div>
        </div>

        {/* Customize toolbar */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {currentUser?.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-gray-600">Personalize your dashboard below.</p>
          </div>
          <button
            onClick={() => setCustomizeMode((v) => !v)}
            className={`px-4 py-2 rounded-lg font-medium ${
              customizeMode ? 'bg-gray-200 text-gray-900' : 'btn-primary'
            }`}
          >
            {customizeMode ? 'Done' : 'Customize'}
          </button>
        </div>

        {customizeMode && (
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Dashboard Cards</h3>
            <DndCardList cards={cards} setCards={setCards} toggleCard={toggleCard} />
            {/* Bottom tray for disabled widgets */}
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-gray-800 mb-2">Widget Tray</h4>
              <div className="flex flex-wrap gap-3">
                {cards.filter((c) => !c.enabled).map((c) => (
                  <button
                    key={c.id}
                    onClick={() => toggleCard(c.id)}
                    className="px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm"
                    title="Add to dashboard"
                  >
                    {c.title}
                  </button>
                ))}
                {cards.filter((c) => !c.enabled).length === 0 && (
                  <span className="text-xs text-gray-500">No widgets in tray</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Render enabled cards */}
        {customizeMode ? (
          <VisibleGridDnd cards={cards} setCards={setCards}>
            {ordered.map((c) => (
              <GridSortableCard key={c.id} id={c.id} size={c.size}>
                <CardWithRemove card={c} onRemove={() => toggleCard(c.id)}>
                  {renderCardById(c)}
                </CardWithRemove>
              </GridSortableCard>
            ))}
          </VisibleGridDnd>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 auto-rows-[1fr]">
            {ordered.map((c) => (
              <div key={c.id} className={sizeToRowClass(c.size)}>
                {renderCardById(c)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderCardById = (c: DashboardCard) => {
    if (c.id === 'deadlines' && nextDeadline) {
      return (
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-2">⏰ {daysUntilDeadline} days until deadline</h2>
              <p className="text-orange-100">{nextDeadline.title} - {nextDeadline.subjectName}</p>
              <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-semibold ${getPriorityColor(nextDeadline.priority)}`}>
                {nextDeadline.priority.toUpperCase()} PRIORITY
              </span>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold">{daysUntilDeadline}</div>
              <div className="text-orange-100">days left</div>
            </div>
          </div>
        </div>
      );
    }

    if (c.id === 'next-exam' && nextExam) {
      return (
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-2">📚 {daysUntilExam} days until exam</h2>
              <p className="text-blue-100">{nextExam.subjectName} - {nextExam.examDate.toLocaleDateString()}</p>
              <p className="text-blue-100 text-sm">{nextExam.startTime} - {nextExam.endTime}</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold">{daysUntilExam}</div>
              <div className="text-blue-100">days left</div>
            </div>
          </div>
        </div>
      );
    }

    if (c.id === 'quick-stats') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <DocumentTextIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Assignments</p>
                <p className="text-2xl font-bold text-gray-900">{assignments.length}</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <ClockIcon className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{assignments.filter((a) => a.status === 'pending').length}</p>
              </div>
            </div>
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
        <div className="card">
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
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Storage Usage</h3>
            <span className={`text-sm font-medium ${getStorageColor(storageInfo.percentage)}`}>
              {storageInfo.percentage.toFixed(1)}% used
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                storageInfo.percentage >= 90
                  ? 'bg-red-500'
                  : storageInfo.percentage >= 75
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
              }`}
              style={{ width: `${storageInfo.percentage}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600">
            {formatFileSize(storageInfo.used * 1024 * 1024)} / {formatFileSize(storageInfo.limit * 1024 * 1024)}
          </p>
        </div>
      );
    }

    if (c.id === 'notifications') {
      return (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Notifications</h3>
          <div className="space-y-3">
            {notifications.slice(0, 3).map((n) => (
              <div key={n.id} className={`p-3 rounded-lg ${!n.isRead ? 'bg-orange-50' : 'bg-gray-50'}`}>
                <p className="font-medium text-gray-900">{n.title}</p>
                <p className="text-sm text-gray-600">{n.message}</p>
                <p className="text-xs text-gray-500 mt-1">{n.createdAt.toLocaleDateString()}</p>
              </div>
            ))}
            {notifications.length === 0 && (
              <p className="text-sm text-gray-500">No notifications</p>
            )}
          </div>
        </div>
      );
    }

    if (c.id === 'welcome') {
      return (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Welcome</h3>
          <p className="text-gray-600">Here's what's happening with your academic life today.</p>
        </div>
      );
    }

    return null;
  };

// Sortable wrapper for visible grid
function VisibleGridDnd({
  cards,
  setCards,
  children,
}: {
  cards: DashboardCard[];
  setCards: React.Dispatch<React.SetStateAction<DashboardCard[]>>;
  children: React.ReactNode;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );
  const items = [...cards].filter((c) => c.enabled).sort((a, b) => a.order - b.order);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = items.map((c) => c.id);
    const oldIndex = ids.indexOf(active.id);
    const newIndex = ids.indexOf(over.id);
    const moved = arrayMove(items, oldIndex, newIndex);
    // write back to full list preserving disabled
    setCards((prev) => {
      const byId = new Map(moved.map((c, idx) => [c.id, idx + 1]));
      return prev.map((c) => (byId.has(c.id) ? { ...c, order: byId.get(c.id)! } : c));
    });
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((c) => c.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 auto-rows-[8rem]">
          {children}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function GridSortableCard({ id, size, children }: { id: string; size?: 's' | 'm' | 'l'; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className={`cursor-move ${sizeToRowClass(size)}`}>
      {children}
    </div>
  );
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
        <button className="px-4 py-2 rounded-lg bg-primary text-white font-medium">
          All
        </button>
        <button className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-medium">
          High Priority
        </button>
        <button className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-medium">
          Medium Priority
        </button>
        <button className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-medium">
          Low Priority
        </button>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
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
              {assignments.map((assignment) => (
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
                      <button className="text-primary hover:text-orange-600 text-sm font-medium">
                        View
                      </button>
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
                <button className="text-primary hover:text-orange-600 text-sm font-medium">
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

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return renderDashboard();
      case 'assignments':
        return renderAssignments();
      case 'exams':
        return renderExams();
      case 'materials':
        return renderMaterials();
      case 'notifications':
        return renderNotifications();
      case 'storage':
        return renderStorage();
      case 'account':
        return renderAccount();
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Add New Assignment
            </h3>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                const subject = subjects.find(
                  (s) => s.id === assignmentForm.subjectId
                );
                if (subject) {
                  handleAddAssignment({
                    title: assignmentForm.title,
                    subjectId: assignmentForm.subjectId,
                    subjectName: subject.name,
                    pdfUrl: '',
                    deadline: new Date(assignmentForm.deadline),
                    status: 'pending',
                    priority: assignmentForm.priority,
                    fileSize: 0,
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
                  onChange={(e) =>
                    setAssignmentForm({
                      ...assignmentForm,
                      subjectId: e.target.value,
                    })
                  }
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
                  Priority
                </label>
                <select
                  className="input-field"
                  value={assignmentForm.priority}
                  onChange={(e) =>
                    setAssignmentForm({
                      ...assignmentForm,
                      priority: e.target.value as 'low' | 'medium' | 'high',
                    })
                  }
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
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
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadModal(false);
                    setAssignmentForm({
                      title: '',
                      subjectId: '',
                      submissionType: 'assignment',
                      priority: 'medium',
                      deadline: '',
                    });
                  }}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  Add Assignment
                </button>
              </div>
            </form>
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
                  onChange={(e) =>
                    setExamForm({ ...examForm, subjectId: e.target.value })
                  }
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
                <select className="input-field">
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
// Drag-and-drop customize list components
function DndCardList({
  cards,
  setCards,
  toggleCard,
}: {
  cards: DashboardCard[];
  setCards: React.Dispatch<React.SetStateAction<DashboardCard[]>>;
  toggleCard: (id: string) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const items = [...cards].sort((a, b) => a.order - b.order);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((c) => c.id === active.id);
    const newIndex = items.findIndex((c) => c.id === over.id);
    const reordered = arrayMove(items, oldIndex, newIndex).map((c, idx) => ({
      ...c,
      order: idx + 1,
    }));
    setCards(reordered);
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((c) => c.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {items.map((c) => (
            <SortableCardRow key={c.id} id={c.id} card={c} toggleCard={toggleCard} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function SortableCardRow({
  id,
  card,
  toggleCard,
}: {
  id: string;
  card: DashboardCard;
  toggleCard: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    boxShadow: isDragging ? '0 10px 20px rgba(0,0,0,0.15)' : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-3">
        <div
          {...attributes}
          {...listeners}
          className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
          title="Drag to reorder"
        >
          ::
        </div>
        <input type="checkbox" checked={card.enabled} onChange={() => toggleCard(id)} />
        <span className="font-medium text-gray-900">{card.title}</span>
        <span className="text-xs text-gray-500">{card.description}</span>
      </div>
    </div>
  );
}

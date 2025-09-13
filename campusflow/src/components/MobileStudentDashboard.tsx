import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { StudentAttendanceService } from '../services/studentAttendanceService';
import { 
  UserIcon, 
  AcademicCapIcon, 
  CalendarIcon, 
  ChartBarIcon,
  BookOpenIcon,
  ClockIcon,
  BellIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { 
  Assignment, 
  Exam, 
  Subject, 
  StudentAttendance,
  Course,
  SemesterSubject
} from '../types';

interface MobileStudentDashboardProps {
  assignments: Assignment[];
  exams: Exam[];
  subjects: Subject[];
  attendance: StudentAttendance[];
  courseInfo?: {
    courseId: string;
    courseName: string;
    courseCode: string;
    branchId: string;
    branchName: string;
    subjects: SemesterSubject[];
  };
}

const MobileStudentDashboard: React.FC<MobileStudentDashboardProps> = ({
  assignments,
  exams,
  subjects,
  attendance,
  courseInfo
}) => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [semesterAttendance, setSemesterAttendance] = useState<StudentAttendance[]>([]);
  const [attendanceSummary, setAttendanceSummary] = useState<Record<number, any>>({});

  // Calculate stats
  const pendingAssignments = assignments.filter(a => a.status === 'pending').length;
  const completedAssignments = assignments.filter(a => a.status === 'completed').length;
  const upcomingExams = exams.filter(e => new Date(e.examDate) > new Date()).length;
  const totalSubjects = subjects.length;
  
  // Calculate attendance percentage
  const overallAttendance = attendance.length > 0 
    ? attendance.reduce((sum, att) => sum + att.attendancePercentage, 0) / attendance.length 
    : 0;

  // Load semester-based attendance data
  useEffect(() => {
    if (courseInfo?.subjects && currentUser?.currentSemester) {
      const currentSemesterSubjects = courseInfo.subjects.filter(
        subject => subject.semester === currentUser.currentSemester
      );
      
      // Generate mock attendance data for current semester
      const mockAttendance = StudentAttendanceService.generateMockAttendanceData(
        currentUser.id,
        currentSemesterSubjects
      );
      
      setSemesterAttendance(mockAttendance);
      
      // Generate attendance summary for all semesters
      const allSemesterAttendance = StudentAttendanceService.generateMockAttendanceData(
        currentUser.id,
        courseInfo.subjects
      );
      
      const summary = StudentAttendanceService.getAttendanceBySemesterSummary(allSemesterAttendance);
      setAttendanceSummary(summary);
    }
  }, [courseInfo, currentUser]);

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'assignments', name: 'Assignments', icon: BookOpenIcon },
    { id: 'exams', name: 'Exams', icon: CalendarIcon },
    { id: 'attendance', name: 'Attendance', icon: CheckCircleIcon },
    { id: 'subjects', name: 'Subjects', icon: AcademicCapIcon }
  ];

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const getDaysUntilDeadline = (deadline: Date) => {
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const renderOverview = () => (
    <div className="space-y-4">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center">
            <BookOpenIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-600">Pending</p>
              <p className="text-2xl font-bold text-blue-900">{pendingAssignments}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center">
            <CheckCircleIcon className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-green-600">Completed</p>
              <p className="text-2xl font-bold text-green-900">{completedAssignments}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center">
            <CalendarIcon className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-purple-600">Exams</p>
              <p className="text-2xl font-bold text-purple-900">{upcomingExams}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="flex items-center">
            <ChartBarIcon className="h-8 w-8 text-orange-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-orange-600">Attendance</p>
              <p className="text-2xl font-bold text-orange-900">{Math.round(overallAttendance)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Course Info */}
      {courseInfo && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Course Information</h3>
          <p className="text-sm text-gray-600">{courseInfo.courseName}</p>
          <p className="text-xs text-gray-500">{courseInfo.branchName}</p>
        </div>
      )}

      {/* Recent Assignments */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Recent Assignments</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {assignments.slice(0, 3).map((assignment) => (
            <div key={assignment.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900">{assignment.title}</h4>
                  <p className="text-xs text-gray-500">{assignment.subjectName}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(assignment.priority)}`}>
                    {assignment.priority}
                  </span>
                  <span className="text-xs text-gray-500">
                    {getDaysUntilDeadline(assignment.deadline)} days
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAssignments = () => (
    <div className="space-y-4">
      {assignments.map((assignment) => (
        <div key={assignment.id} className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-medium text-gray-900">{assignment.title}</h3>
            <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(assignment.priority)}`}>
              {assignment.priority}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-2">{assignment.subjectName}</p>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Due: {formatDate(assignment.deadline)}</span>
            <span className={`px-2 py-1 rounded ${
              assignment.status === 'completed' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {assignment.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );

  const renderExams = () => (
    <div className="space-y-4">
      {exams.map((exam) => (
        <div key={exam.id} className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="font-medium text-gray-900 mb-2">{exam.subjectName}</h3>
          <p className="text-sm text-gray-600 mb-2">{exam.examType.toUpperCase()} Exam</p>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{formatDate(exam.examDate)}</span>
            <span>{exam.startTime} - {exam.endTime}</span>
          </div>
          {exam.room && (
            <p className="text-xs text-gray-500 mt-1">Room: {exam.room}</p>
          )}
        </div>
      ))}
    </div>
  );

  const renderAttendance = () => (
    <div className="space-y-4">
      {/* Current Semester Attendance */}
      {currentUser?.currentSemester && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">
            Current Semester {currentUser.currentSemester}
          </h3>
          {semesterAttendance.length > 0 ? (
            <div className="space-y-3">
              {semesterAttendance.map((att) => (
                <div key={att.subjectId} className="bg-white rounded p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 text-sm">{att.subjectName}</h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      att.attendancePercentage >= 75 
                        ? 'bg-green-100 text-green-800'
                        : att.attendancePercentage >= 60
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {Math.round(att.attendancePercentage)}%
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs text-gray-600">
                    <div>
                      <p className="font-medium">{att.presentSessions}</p>
                      <p>Present</p>
                    </div>
                    <div>
                      <p className="font-medium">{att.absentSessions}</p>
                      <p>Absent</p>
                    </div>
                    <div>
                      <p className="font-medium">{att.totalSessions}</p>
                      <p>Total</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-blue-700 text-sm">No attendance data available for current semester.</p>
          )}
        </div>
      )}

      {/* Semester Summary */}
      {Object.keys(attendanceSummary).length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-3">Semester Summary</h3>
          <div className="space-y-2">
            {Object.values(attendanceSummary).map((summary: any) => (
              <div key={summary.semester} className="flex items-center justify-between bg-white p-3 rounded">
                <div>
                  <span className="font-medium text-gray-900">Semester {summary.semester}</span>
                  <span className="text-xs text-gray-500 ml-2">({summary.subjects} subjects)</span>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    summary.attendancePercentage >= 75 
                      ? 'bg-green-100 text-green-800'
                      : summary.attendancePercentage >= 60
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {Math.round(summary.attendancePercentage)}%
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    {summary.presentSessions}/{summary.totalSessions}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Overall Attendance */}
      {attendance.map((att) => (
        <div key={att.studentId} className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-gray-900">{att.courseName}</h3>
            <span className={`px-2 py-1 text-xs rounded-full ${
              att.attendancePercentage >= 75 
                ? 'bg-green-100 text-green-800'
                : att.attendancePercentage >= 60
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {Math.round(att.attendancePercentage)}%
            </span>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center text-xs text-gray-600">
            <div>
              <p className="font-medium">{att.presentSessions}</p>
              <p>Present</p>
            </div>
            <div>
              <p className="font-medium">{att.absentSessions}</p>
              <p>Absent</p>
            </div>
            <div>
              <p className="font-medium">{att.totalSessions}</p>
              <p>Total</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderSubjects = () => (
    <div className="space-y-4">
      {courseInfo?.subjects && courseInfo.subjects.length > 0 ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(semester => {
            const semesterSubjects = courseInfo.subjects.filter(subject => subject.semester === semester);
            if (semesterSubjects.length === 0) return null;
            
            return (
              <div key={semester} className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="font-medium text-gray-900 mb-3">Semester {semester}</h3>
                <div className="space-y-2">
                  {semesterSubjects.map(subject => (
                    <div key={subject.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{subject.subjectName}</p>
                        <p className="text-xs text-gray-500">{subject.subjectCode}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-600">{subject.credits} credits</p>
                        {subject.isElective && (
                          <p className="text-xs text-blue-600">Elective</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <AcademicCapIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No subjects available</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
              <div className="ml-3">
                <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-600">{currentUser?.name}</p>
              </div>
            </div>
            <button className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100">
              <BellIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex flex-col w-64 h-full bg-white">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <nav className="flex-1 px-4 py-4 space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="h-5 w-5 mr-3" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4">
          <nav className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-5 w-5 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'assignments' && renderAssignments()}
        {activeTab === 'exams' && renderExams()}
        {activeTab === 'attendance' && renderAttendance()}
        {activeTab === 'subjects' && renderSubjects()}
      </div>
    </div>
  );
};

export default MobileStudentDashboard;

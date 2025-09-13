import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  UserIcon,
  AcademicCapIcon,
  ChartBarIcon,
  BellIcon,
  EyeIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { StudentAttendance, StudentScore, ParentNotification } from '../types';
import { 
  getStudentAttendance, 
  getStudentScores, 
  getParentNotifications,
  markNotificationAsRead 
} from '../services/attendanceService';

const ParentDashboard: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [studentAttendance, setStudentAttendance] = useState<StudentAttendance[]>([]);
  const [studentScores, setStudentScores] = useState<StudentScore[]>([]);
  const [notifications, setNotifications] = useState<ParentNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');

  useEffect(() => {
    if (currentUser?.studentId) {
      loadStudentData();
    }
  }, [currentUser]);

  const loadStudentData = async () => {
    if (!currentUser?.studentId) return;
    
    setLoading(true);
    try {
      const [attendance, scores, parentNotifications] = await Promise.all([
        getStudentAttendance(currentUser.studentId),
        getStudentScores(currentUser.studentId),
        getParentNotifications(currentUser.id)
      ]);
      
      setStudentAttendance(attendance);
      setStudentScores(scores);
      setNotifications(parentNotifications);
    } catch (error) {
      console.error('Error loading student data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const markNotificationRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getStudentName = () => {
    return studentAttendance[0]?.studentName || 'Your Child';
  };

  const getOverallAttendance = () => {
    if (studentAttendance.length === 0) return 0;
    const total = studentAttendance.reduce((sum, course) => sum + course.attendancePercentage, 0);
    return total / studentAttendance.length;
  };

  const getOverallGPA = () => {
    if (studentScores.length === 0) return 0;
    const gradePoints = studentScores.map(score => {
      const grade = score.grade;
      if (grade === 'A+') return 4.0;
      if (grade === 'A') return 3.7;
      if (grade === 'B+') return 3.3;
      if (grade === 'B') return 3.0;
      if (grade === 'C+') return 2.7;
      if (grade === 'C') return 2.3;
      if (grade === 'D') return 1.0;
      return 0;
    });
    const total = gradePoints.reduce((sum: number, gpa: number) => sum + gpa, 0);
    return total / gradePoints.length;
  };

  const unreadNotifications = notifications.filter(n => !n.isRead).length;

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'attendance', name: 'Attendance', icon: UserIcon },
    { id: 'scores', name: 'Scores', icon: AcademicCapIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading student data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-orange-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                Parent Portal
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <img
                  src={currentUser?.photoURL || 'https://via.placeholder.com/32'}
                  alt="Profile"
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-sm font-medium text-gray-700">
                  {currentUser?.name}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome, {currentUser?.name}! 👨‍👩‍👧‍👦
          </h1>
          <p className="text-gray-600">
            Monitor {getStudentName()}'s academic progress and attendance.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.name}</span>
                {tab.id === 'notifications' && unreadNotifications > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                    {unreadNotifications}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {selectedTab === 'overview' && (
          <div>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="card">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <UserIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Overall Attendance</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {getOverallAttendance().toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <AcademicCapIcon className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Overall GPA</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {getOverallGPA().toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <BellIcon className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Unread Notifications</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {unreadNotifications}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Recent Scores
                </h3>
                <div className="space-y-3">
                  {studentScores.slice(0, 5).map((score) => (
                    <div key={score.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {score.courseName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {score.marks}/{score.maxMarks} marks
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            score.grade === 'A+' || score.grade === 'A'
                              ? 'bg-green-100 text-green-800'
                              : score.grade === 'B+' || score.grade === 'B'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {score.grade}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {score.createdAt.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Course Attendance
                </h3>
                <div className="space-y-3">
                  {studentAttendance.slice(0, 5).map((attendance, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {attendance.courseName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {attendance.presentSessions}/{attendance.totalSessions} sessions
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            attendance.attendancePercentage >= 75
                              ? 'bg-green-100 text-green-800'
                              : attendance.attendancePercentage >= 50
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {attendance.attendancePercentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Attendance Tab */}
        {selectedTab === 'attendance' && (
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Attendance Details
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">
                      Course
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">
                      Present
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">
                      Total
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">
                      Percentage
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {studentAttendance.map((attendance, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4 font-medium text-gray-900">
                        {attendance.courseName}
                      </td>
                      <td className="py-4 px-4 text-gray-700">
                        {attendance.presentSessions}
                      </td>
                      <td className="py-4 px-4 text-gray-700">
                        {attendance.totalSessions}
                      </td>
                      <td className="py-4 px-4 text-gray-700">
                        {attendance.attendancePercentage.toFixed(1)}%
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            attendance.attendancePercentage >= 75
                              ? 'bg-green-100 text-green-800'
                              : attendance.attendancePercentage >= 50
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {attendance.attendancePercentage >= 75 ? 'Good' : 
                           attendance.attendancePercentage >= 50 ? 'Warning' : 'Critical'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Scores Tab */}
        {selectedTab === 'scores' && (
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Academic Scores
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">
                      Course
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">
                      Marks
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">
                      Grade
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {studentScores.map((score) => (
                    <tr key={score.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4 font-medium text-gray-900">
                        {score.courseName}
                      </td>
                      <td className="py-4 px-4 text-gray-700">
                        {score.marks}/{score.maxMarks}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            score.grade === 'A+' || score.grade === 'A'
                              ? 'bg-green-100 text-green-800'
                              : score.grade === 'B+' || score.grade === 'B'
                              ? 'bg-blue-100 text-blue-800'
                              : score.grade === 'C+' || score.grade === 'C'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {score.grade}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-700">
                        {score.createdAt.toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {selectedTab === 'notifications' && (
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Notifications
            </h3>
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border ${
                    notification.isRead 
                      ? 'bg-gray-50 border-gray-200' 
                      : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </h4>
                        {!notification.isRead && (
                          <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1">
                            New
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {notification.createdAt.toLocaleDateString()} at{' '}
                        {notification.createdAt.toLocaleTimeString()}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <button
                        onClick={() => markNotificationRead(notification.id)}
                        className="ml-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {notifications.length === 0 && (
                <div className="text-center py-8">
                  <BellIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No notifications yet</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParentDashboard;

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  QrCodeIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  AcademicCapIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { StudentAttendance, StudentScore } from '../types';
import {
  submitAttendance,
  getStudentAttendance,
  getStudentScores,
} from '../services/attendanceService';

const StudentAttendanceDashboard: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [qrCode, setQrCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [attendance, setAttendance] = useState<StudentAttendance[]>([]);
  const [scores, setScores] = useState<StudentScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('scan');

  useEffect(() => {
    if (currentUser) {
      loadStudentData();
    }
  }, [currentUser]);

  const loadStudentData = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      const [attendanceData, scoresData] = await Promise.all([
        getStudentAttendance(currentUser.id),
        getStudentScores(currentUser.id)
      ]);
      
      setAttendance(attendanceData);
      setScores(scoresData);
    } catch (error) {
      console.error('Error loading student data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrCode.trim() || !currentUser) return;
    
    setSubmitting(true);
    setStatus(null);
    
    try {
      // Parse QR code format: ATT:sessionId:code
      if (!qrCode.startsWith('ATT:')) {
        setStatus('Invalid QR code format');
        return;
      }
      
      const parts = qrCode.split(':');
      if (parts.length !== 3) {
        setStatus('Invalid QR code format');
        return;
      }
      
      const [, sessionId, code] = parts;
      
      const result = await submitAttendance(
        sessionId,
        currentUser.id,
        currentUser.name,
        code
      );
      
      if (result.success) {
        setStatus('✅ Attendance marked successfully!');
        setQrCode('');
        // Refresh attendance data
        await loadStudentData();
      } else {
        setStatus(`❌ ${result.message}`);
      }
    } catch (error: any) {
      setStatus(`❌ Error: ${error.message || 'Failed to submit attendance'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const getOverallAttendance = () => {
    if (attendance.length === 0) return 0;
    const total = attendance.reduce((sum, course) => sum + course.attendancePercentage, 0);
    return total / attendance.length;
  };

  const getOverallGPA = () => {
    if (scores.length === 0) return 0;
    const gradePoints = scores.map(score => {
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

  const tabs = [
    { id: 'scan', name: 'Scan QR', icon: QrCodeIcon },
    { id: 'attendance', name: 'My Attendance', icon: ChartBarIcon },
    { id: 'scores', name: 'My Scores', icon: AcademicCapIcon },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading student dashboard...</p>
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
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                Student Portal
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
            Welcome, {currentUser?.name}! 🎓
          </h1>
          <p className="text-gray-600">
            Scan QR codes for attendance and track your academic progress.
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
              </button>
            ))}
          </nav>
        </div>

        {/* Scan QR Tab */}
        {selectedTab === 'scan' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Mark Attendance
              </h3>
              
              {/* QR Code Scanner Simulation */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border-2 border-dashed border-blue-200 mb-4">
                <div className="text-center">
                  <QrCodeIcon className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    QR Code Scanner
                  </h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Point your camera at the QR code displayed by your faculty
                  </p>
                  <div className="bg-white rounded-lg p-4 border">
                    <p className="text-sm text-gray-600 mb-2">
                      Scanner would open here (camera access required)
                    </p>
                    <div className="bg-gray-100 rounded-lg p-8 text-center">
                      <QrCodeIcon className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Camera view would appear here</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Manual QR Code Input */}
              <div className="border-t pt-4">
                <h5 className="text-sm font-medium text-gray-700 mb-2">
                  Or enter QR code manually:
                </h5>
                <form onSubmit={handleSubmitAttendance} className="space-y-3">
                  <div className="relative">
                    <QrCodeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={qrCode}
                      onChange={(e) => setQrCode(e.target.value)}
                      className="input-field pl-10 w-full"
                      placeholder="Paste QR code data here..."
                      required
                    />
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <span>Format: ATT:sessionId:code</span>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={submitting || !qrCode.trim()}
                    className={`btn-primary w-full ${
                      submitting || !qrCode.trim() ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircleIcon className="w-4 h-4 mr-2" />
                        Submit Attendance
                      </>
                    )}
                  </button>
                </form>
              </div>
              
              {status && (
                <div className={`mt-4 p-3 rounded-lg ${
                  status.includes('✅') 
                    ? 'bg-green-50 border border-green-200 text-green-800'
                    : 'bg-red-50 border border-red-200 text-red-800'
                }`}>
                  {status}
                </div>
              )}
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Stats
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <ChartBarIcon className="w-6 h-6 text-blue-600 mr-3" />
                    <span className="text-sm font-medium text-gray-900">Overall Attendance</span>
                  </div>
                  <span className="text-lg font-bold text-blue-600">
                    {getOverallAttendance().toFixed(1)}%
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <AcademicCapIcon className="w-6 h-6 text-green-600 mr-3" />
                    <span className="text-sm font-medium text-gray-900">Overall GPA</span>
                  </div>
                  <span className="text-lg font-bold text-green-600">
                    {getOverallGPA().toFixed(2)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center">
                    <ClockIcon className="w-6 h-6 text-orange-600 mr-3" />
                    <span className="text-sm font-medium text-gray-900">Courses Enrolled</span>
                  </div>
                  <span className="text-lg font-bold text-orange-600">
                    {attendance.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Attendance Tab */}
        {selectedTab === 'attendance' && (
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              My Attendance
            </h3>
            
            {attendance.length === 0 ? (
              <div className="text-center py-8">
                <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No attendance records found</p>
              </div>
            ) : (
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
                    {attendance.map((course, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4 font-medium text-gray-900">
                          {course.courseName}
                        </td>
                        <td className="py-4 px-4 text-gray-700">
                          {course.presentSessions}
                        </td>
                        <td className="py-4 px-4 text-gray-700">
                          {course.totalSessions}
                        </td>
                        <td className="py-4 px-4 text-gray-700">
                          {course.attendancePercentage.toFixed(1)}%
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              course.attendancePercentage >= 75
                                ? 'bg-green-100 text-green-800'
                                : course.attendancePercentage >= 50
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {course.attendancePercentage >= 75 ? 'Good' : 
                             course.attendancePercentage >= 50 ? 'Warning' : 'Critical'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Scores Tab */}
        {selectedTab === 'scores' && (
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              My Scores
            </h3>
            
            {scores.length === 0 ? (
              <div className="text-center py-8">
                <AcademicCapIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No scores recorded yet</p>
              </div>
            ) : (
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
                    {scores.map((score) => (
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
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentAttendanceDashboard;

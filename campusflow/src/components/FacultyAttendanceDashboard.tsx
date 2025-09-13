import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  PlayIcon,
  StopIcon,
  QrCodeIcon,
  UserGroupIcon,
  ChartBarIcon,
  AcademicCapIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { AttendanceSession, Course, AttendanceRecord } from '../types';
import {
  createAttendanceSession,
  updateSessionCode,
  endAttendanceSession,
  getActiveSessions,
  createCourse,
  getFacultyCourses,
} from '../services/attendanceService';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/config';

const FacultyAttendanceDashboard: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [activeSessions, setActiveSessions] = useState<AttendanceSession[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [sessionDuration, setSessionDuration] = useState<number>(60);
  const [currentSession, setCurrentSession] = useState<AttendanceSession | null>(null);
  const [currentCode, setCurrentCode] = useState<string>('');
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseCode, setNewCourseCode] = useState('');
  const [showNewCourseForm, setShowNewCourseForm] = useState(false);

  const intervalRef = useRef<number | null>(null);
  const sessionTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    loadFacultyData();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (sessionTimeoutRef.current) clearTimeout(sessionTimeoutRef.current);
    };
  }, []);

  const loadFacultyData = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      const [facultyCourses, sessions] = await Promise.all([
        getFacultyCourses(currentUser.id),
        getActiveSessions(currentUser.id)
      ]);
      
      setCourses(facultyCourses);
      setActiveSessions(sessions);
      
      if (sessions.length > 0) {
        setCurrentSession(sessions[0]);
        setCurrentCode(sessions[0].currentCode);
        loadAttendanceRecords(sessions[0].id);
      }
    } catch (error) {
      console.error('Error loading faculty data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadAttendanceRecords = async (sessionId: string) => {
    try {
      const recordsQuery = query(
        collection(db, 'attendanceRecords'),
        where('sessionId', '==', sessionId),
        orderBy('scannedAt', 'desc')
      );
      
      const recordsSnap = await getDocs(recordsQuery);
      const records = recordsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        scannedAt: doc.data().scannedAt?.toDate ? doc.data().scannedAt.toDate() : new Date(doc.data().scannedAt),
      })) as AttendanceRecord[];
      
      setAttendanceRecords(records);
    } catch (error) {
      console.error('Error loading attendance records:', error);
    }
  };

  const createNewCourse = async () => {
    if (!newCourseName || !newCourseCode || !currentUser) return;
    
    try {
      await createCourse(
        newCourseName,
        newCourseCode,
        currentUser.id,
        currentUser.name,
        'Fall 2024', // Default semester
        '2024', // Default year
        'General' // Default branch
      );
      
      setNewCourseName('');
      setNewCourseCode('');
      setShowNewCourseForm(false);
      await loadFacultyData();
    } catch (error) {
      console.error('Error creating course:', error);
      setError('Failed to create course');
    }
  };

  const startAttendanceSession = async () => {
    if (!selectedCourse || !currentUser) return;
    
    const course = courses.find(c => c.id === selectedCourse);
    if (!course) return;
    
    try {
      setError(null);
      const sessionId = await createAttendanceSession(
        currentUser.id,
        course.id,
        course.name,
        sessionDuration
      );
      
      const newSession: AttendanceSession = {
        id: sessionId,
        facultyId: currentUser.id,
        courseId: course.id,
        courseName: course.name,
        startedAt: new Date(),
        endsAt: new Date(Date.now() + sessionDuration * 60 * 1000),
        currentCode: generateCode(),
        lastCodeAt: new Date(),
        isActive: true,
        totalStudents: 0,
        presentStudents: 0,
        createdAt: new Date(),
      };
      
      setCurrentSession(newSession);
      setCurrentCode(newSession.currentCode);
      setAttendanceRecords([]);
      
      // Start code rotation every 3 seconds
      intervalRef.current = window.setInterval(async () => {
        try {
          const newCode = await updateSessionCode(sessionId);
          setCurrentCode(newCode);
        } catch (error) {
          console.error('Error updating code:', error);
        }
      }, 3000);
      
      // Auto-end session after duration
      sessionTimeoutRef.current = window.setTimeout(() => {
        endSession();
      }, sessionDuration * 60 * 1000);
      
      await loadFacultyData();
    } catch (error) {
      console.error('Error starting session:', error);
      setError('Failed to start attendance session');
    }
  };

  const endSession = async () => {
    if (!currentSession) return;
    
    try {
      await endAttendanceSession(currentSession.id);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      if (sessionTimeoutRef.current) {
        clearTimeout(sessionTimeoutRef.current);
        sessionTimeoutRef.current = null;
      }
      
      setCurrentSession(null);
      setCurrentCode('');
      setAttendanceRecords([]);
      await loadFacultyData();
    } catch (error) {
      console.error('Error ending session:', error);
    }
  };

  const generateCode = () => Math.random().toString(36).slice(2, 8).toUpperCase();

  const getQRData = () => {
    if (!currentSession) return '';
    return `ATT:${currentSession.id}:${currentCode}`;
  };

  const handleLogout = async () => {
    try {
      if (currentSession) {
        await endSession();
      }
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading faculty dashboard...</p>
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
                <span className="text-white font-bold text-sm">F</span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                Faculty Dashboard
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
            Welcome, {currentUser?.name}! 👨‍🏫
          </h1>
          <p className="text-gray-600">
            Manage attendance sessions and monitor student progress.
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Course Management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">My Courses</h3>
              <button
                onClick={() => setShowNewCourseForm(!showNewCourseForm)}
                className="btn-primary text-sm"
              >
                Add Course
              </button>
            </div>
            
            {showNewCourseForm && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <input
                    type="text"
                    placeholder="Course Name"
                    value={newCourseName}
                    onChange={(e) => setNewCourseName(e.target.value)}
                    className="input-field"
                  />
                  <input
                    type="text"
                    placeholder="Course Code"
                    value={newCourseCode}
                    onChange={(e) => setNewCourseCode(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div className="flex space-x-2">
                  <button onClick={createNewCourse} className="btn-primary text-sm">
                    Create
                  </button>
                  <button
                    onClick={() => setShowNewCourseForm(false)}
                    className="btn-secondary text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedCourse === course.id
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedCourse(course.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{course.name}</p>
                      <p className="text-sm text-gray-500">{course.code}</p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {course.totalStudents} students
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Attendance Session Control */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Attendance Session
            </h3>
            
            {!currentSession ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Course
                  </label>
                  <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="input-field w-full"
                    disabled={courses.length === 0}
                  >
                    <option value="">Choose a course...</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.name} ({course.code})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Session Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={sessionDuration}
                    onChange={(e) => setSessionDuration(Number(e.target.value))}
                    className="input-field w-full"
                    min="5"
                    max="120"
                  />
                </div>
                
                <button
                  onClick={startAttendanceSession}
                  disabled={!selectedCourse || courses.length === 0}
                  className={`btn-primary w-full ${
                    !selectedCourse || courses.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <PlayIcon className="w-4 h-4 mr-2" />
                  Start Session
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    Active Session: {currentSession.courseName}
                  </h4>
                  <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <ClockIcon className="w-4 h-4 mr-1" />
                      <span>Ends at: {currentSession.endsAt.toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <QrCodeIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Current Code</p>
                  <p className="text-3xl font-mono font-bold text-primary mb-2">
                    {currentCode}
                  </p>
                  <p className="text-xs text-gray-500">QR Data: {getQRData()}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <UserGroupIcon className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                    <p className="text-sm text-blue-600">Present</p>
                    <p className="text-lg font-bold text-blue-900">
                      {attendanceRecords.length}
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <ChartBarIcon className="w-6 h-6 text-green-600 mx-auto mb-1" />
                    <p className="text-sm text-green-600">Total</p>
                    <p className="text-lg font-bold text-green-900">
                      {currentSession.totalStudents}
                    </p>
                  </div>
                </div>

                <button
                  onClick={endSession}
                  className="btn-secondary w-full"
                >
                  <StopIcon className="w-4 h-4 mr-2" />
                  End Session
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Attendance Records */}
        {currentSession && attendanceRecords.length > 0 && (
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Attendance Records
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">
                      Student Name
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">
                      Scanned At
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceRecords.map((record) => (
                    <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4 font-medium text-gray-900">
                        {record.studentName}
                      </td>
                      <td className="py-4 px-4 text-gray-700">
                        {record.scannedAt.toLocaleTimeString()}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            record.status === 'present'
                              ? 'bg-green-100 text-green-800'
                              : record.status === 'late'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FacultyAttendanceDashboard;

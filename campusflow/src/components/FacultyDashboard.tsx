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
  PlusIcon,
  BookOpenIcon,
} from '@heroicons/react/24/outline';
import { AttendanceSession, Course, Branch } from '../types';
import {
  createAttendanceSession,
  updateSessionCode,
  endAttendanceSession,
  getActiveSessions,
  createCourse,
  getFacultyCourses,
  createBranch,
  getBranches,
} from '../services/attendanceService';

const FacultyDashboard: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [activeSessions, setActiveSessions] = useState<AttendanceSession[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [sessionDuration, setSessionDuration] = useState<number>(60);
  const [currentSession, setCurrentSession] = useState<AttendanceSession | null>(null);
  const [currentCode, setCurrentCode] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewCourseForm, setShowNewCourseForm] = useState(false);
  const [showNewBranchForm, setShowNewBranchForm] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newBranchName, setNewBranchName] = useState('');
  const [newBranchCode, setNewBranchCode] = useState('');
  const [newBranchDescription, setNewBranchDescription] = useState('');

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
      const [facultyCourses, sessions, allBranches] = await Promise.all([
        getFacultyCourses(currentUser.id),
        getActiveSessions(currentUser.id),
        getBranches()
      ]);
      
      setCourses(facultyCourses);
      setActiveSessions(sessions);
      setBranches(allBranches);
      
      if (sessions.length > 0) {
        setCurrentSession(sessions[0]);
        setCurrentCode(sessions[0].currentCode);
      }
    } catch (error) {
      console.error('Error loading faculty data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const createNewBranch = async () => {
    if (!newBranchName || !newBranchCode) return;
    
    try {
      await createBranch(newBranchName, newBranchCode, newBranchDescription);
      setNewBranchName('');
      setNewBranchCode('');
      setNewBranchDescription('');
      setShowNewBranchForm(false);
      await loadFacultyData();
    } catch (error) {
      console.error('Error creating branch:', error);
      setError('Failed to create branch');
    }
  };

  const createNewCourse = async () => {
    if (!newCourseName || !newCourseCode || !selectedBranch) return;
    
    try {
      await createCourse(
        newCourseName,
        newCourseCode,
        currentUser!.id,
        currentUser!.name,
        'Fall 2024', // Default semester
        '2024', // Default year
        selectedBranch
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

  const filteredCourses = selectedBranch 
    ? courses.filter(course => course.branchId === selectedBranch)
    : courses;

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

        {/* Branch and Course Management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Branches */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Branches</h3>
              <button
                onClick={() => setShowNewBranchForm(!showNewBranchForm)}
                className="btn-primary text-sm flex items-center space-x-1"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Add Branch</span>
              </button>
            </div>
            
            {showNewBranchForm && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="space-y-3 mb-3">
                  <input
                    type="text"
                    placeholder="Branch Name"
                    value={newBranchName}
                    onChange={(e) => setNewBranchName(e.target.value)}
                    className="input-field"
                  />
                  <input
                    type="text"
                    placeholder="Branch Code"
                    value={newBranchCode}
                    onChange={(e) => setNewBranchCode(e.target.value)}
                    className="input-field"
                  />
                  <input
                    type="text"
                    placeholder="Description (optional)"
                    value={newBranchDescription}
                    onChange={(e) => setNewBranchDescription(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div className="flex space-x-2">
                  <button onClick={createNewBranch} className="btn-primary text-sm">
                    Create
                  </button>
                  <button
                    onClick={() => setShowNewBranchForm(false)}
                    className="btn-secondary text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {branches.map((branch) => (
                <div
                  key={branch.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedBranch === branch.id
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedBranch(branch.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{branch.name}</p>
                      <p className="text-sm text-gray-500">{branch.code}</p>
                    </div>
                    <BookOpenIcon className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Courses */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Courses</h3>
              <button
                onClick={() => setShowNewCourseForm(!showNewCourseForm)}
                className="btn-primary text-sm flex items-center space-x-1"
                disabled={!selectedBranch}
              >
                <PlusIcon className="w-4 h-4" />
                <span>Add Course</span>
              </button>
            </div>
            
            {showNewCourseForm && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="space-y-3 mb-3">
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

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {filteredCourses.map((course) => (
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
                      <p className="text-sm text-gray-500">{course.code} - {course.branchName}</p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {course.totalStudents} students
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Attendance Session Control */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Attendance Session
          </h3>
          
          {!currentSession ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Branch
                  </label>
                  <select
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    className="input-field w-full"
                    disabled={branches.length === 0}
                  >
                    <option value="">Choose a branch...</option>
                    {branches.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name} ({branch.code})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Course
                  </label>
                  <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="input-field w-full"
                    disabled={!selectedBranch || filteredCourses.length === 0}
                  >
                    <option value="">Choose a course...</option>
                    {filteredCourses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.name} ({course.code})
                      </option>
                    ))}
                  </select>
                </div>
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
                disabled={!selectedCourse || !selectedBranch}
                className={`btn-primary w-full ${
                  !selectedCourse || !selectedBranch ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <PlayIcon className="w-4 h-4 mr-2" />
                Start Attendance Session
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

              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <QrCodeIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-600 mb-2">Current QR Code</p>
                <p className="text-4xl font-mono font-bold text-primary mb-2">
                  {currentCode}
                </p>
                <p className="text-xs text-gray-500 mb-4">QR Data: {getQRData()}</p>
                <div className="bg-white rounded-lg p-3 border-2 border-dashed border-gray-300">
                  <p className="text-sm font-medium text-gray-700">Students should scan this QR code</p>
                  <p className="text-xs text-gray-500 mt-1">Code changes every 3 seconds</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-blue-50 rounded-lg p-3">
                  <UserGroupIcon className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                  <p className="text-sm text-blue-600">Present</p>
                  <p className="text-lg font-bold text-blue-900">
                    {currentSession.presentStudents}
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
    </div>
  );
};

export default FacultyDashboard;
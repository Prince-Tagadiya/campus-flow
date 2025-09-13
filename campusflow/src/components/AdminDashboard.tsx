import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  UsersIcon,
  ChartBarIcon,
  BellIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  UserGroupIcon,
  AcademicCapIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline';
import { User } from '../types';
import { collection, onSnapshot, orderBy, query, Timestamp, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { adminCreateUser, adminUpdateUserRole } from '../services/adminService';
import StudentRegistrationForm from './StudentRegistrationForm';
import FacultyRegistrationForm from './FacultyRegistrationForm';

const AdminDashboard: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('users');
  const [creating, setCreating] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<'student' | 'faculty' | 'admin' | 'parent'>('student');
  const [newStudentId, setNewStudentId] = useState('');
  const [newParentId, setNewParentId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [showFacultyForm, setShowFacultyForm] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const list: User[] = snap.docs.map((d) => {
        const data = d.data() as any;
        const createdAt: Date = data.createdAt?.toDate ? (data.createdAt as Timestamp).toDate() : new Date(data.createdAt || Date.now());
        return {
          id: d.id,
          name: data.name || '',
          email: data.email || '',
          role: data.role || 'student',
          createdAt,
          photoURL: data.photoURL,
          studentId: data.studentId,
          parentId: data.parentId,
        } as User;
      });
      setUsers(list);
    });
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    totalUsers: users.length,
    faculty: users.filter(u => u.role === 'faculty').length,
    students: users.filter(u => u.role === 'student').length,
    parents: users.filter(u => u.role === 'parent').length,
    admins: users.filter(u => u.role === 'admin').length,
  };

  const tabs = [
    { id: 'users', name: 'User Management', icon: UsersIcon },
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'attendance', name: 'Attendance System', icon: AcademicCapIcon },
  ];

  const createAccount = async () => {
    setError(null);
    setCreating(true);
    try {
      await adminCreateUser(
        newEmail.trim(), 
        newPassword, 
        newName.trim() || newEmail.split('@')[0], 
        newRole,
        newRole === 'parent' ? newStudentId : undefined,
        newRole === 'student' ? newParentId : undefined
      );
      setNewEmail('');
      setNewPassword('');
      setNewName('');
      setNewRole('student');
      setNewStudentId('');
      setNewParentId('');
    } catch (e: any) {
      setError(e?.message || 'Failed to create account');
    } finally {
      setCreating(false);
    }
  };

  const handleStudentFormSubmit = async (studentData: any) => {
    setCreating(true);
    setError(null);

    try {
      // Create user with comprehensive student data
      await adminCreateUser(
        studentData.email, 
        'student123', // Default password
        studentData.name, 
        'student',
        undefined, // studentId
        undefined, // parentId
        studentData // Pass all comprehensive student data
      );
      
      setShowStudentForm(false);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to create student account');
    } finally {
      setCreating(false);
    }
  };

  const handleFacultyFormSubmit = async (facultyData: any) => {
    setCreating(true);
    setError(null);

    try {
      // Create user with comprehensive faculty data
      await adminCreateUser(
        facultyData.email, 
        'faculty123', // Default password
        facultyData.name, 
        'faculty',
        undefined, // studentId
        undefined, // parentId
        facultyData // Pass all comprehensive faculty data
      );
      
      setShowFacultyForm(false);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to create faculty account');
    } finally {
      setCreating(false);
    }
  };

  const changeRole = async (userId: string, role: 'student' | 'faculty' | 'admin' | 'parent') => {
    try {
      await adminUpdateUserRole(userId, role);
    } catch (e) {
      console.error('Failed to update role', e);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-orange-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                Admin Dashboard
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
            Welcome, Admin! 👨‍💼
          </h1>
          <p className="text-gray-600">
            Manage users, roles, and the attendance system for your college.
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

        {/* Users Tab */}
        {selectedTab === 'users' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Users
                </h3>
                <div className="relative">
                  <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">
                        User
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">
                        Email
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">
                        Role
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">
                        Joined
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3">
                            <img
                              src={user.photoURL || 'https://via.placeholder.com/32'}
                              alt={user.name}
                              className="w-8 h-8 rounded-full"
                            />
                            <div>
                            <span className="font-medium text-gray-900">
                              {user.name}
                            </span>
                              {(user.studentId || user.parentId) && (
                                <p className="text-xs text-gray-500">
                                  {user.studentId ? `Student ID: ${user.studentId}` : `Parent ID: ${user.parentId}`}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-gray-700">
                          {user.email}
                        </td>
                        <td className="py-4 px-4">
                          <select
                            value={user.role}
                            onChange={(e) => changeRole(user.id, e.target.value as any)}
                            className="border border-gray-300 rounded-lg px-2 py-1 text-sm"
                          >
                            <option value="student">student</option>
                            <option value="faculty">faculty</option>
                            <option value="parent">parent</option>
                            <option value="admin">admin</option>
                          </select>
                        </td>
                        <td className="py-4 px-4 text-gray-700">
                          {user.createdAt.toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex space-x-2">
                            <button className="text-primary hover:text-orange-600 text-sm font-medium flex items-center space-x-1">
                              <EyeIcon className="w-4 h-4" />
                              <span>View</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Account</h3>
              {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
              
              <div className="space-y-4">
                <div className="text-center py-4">
                  <h4 className="text-md font-medium text-gray-700 mb-2">Choose Registration Type</h4>
                  <p className="text-sm text-gray-500 mb-6">Select the type of account you want to create</p>
                </div>
                
                <div className="space-y-3">
                  <button 
                    onClick={() => setShowStudentForm(true)}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 px-6 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 hover:scale-105 font-semibold text-lg shadow-lg hover:shadow-xl"
                  >
                    <div className="flex items-center justify-center space-x-3">
                      <span className="text-2xl">📋</span>
                      <div className="text-left">
                        <div>Create Student Profile</div>
                        <div className="text-sm font-normal opacity-90">Comprehensive student registration with all details</div>
                      </div>
                            </div>
                  </button>
                  
                  <button 
                    onClick={() => setShowFacultyForm(true)}
                    className="w-full bg-gradient-to-r from-orange-600 to-pink-600 text-white py-4 px-6 rounded-xl hover:from-orange-700 hover:to-pink-700 transition-all duration-300 hover:scale-105 font-semibold text-lg shadow-lg hover:shadow-xl"
                  >
                    <div className="flex items-center justify-center space-x-3">
                      <span className="text-2xl">👨‍🏫</span>
                      <div className="text-left">
                        <div>Create Faculty Profile</div>
                        <div className="text-sm font-normal opacity-90">Comprehensive faculty registration with professional details</div>
                      </div>
                    </div>
                  </button>
                </div>
                
                <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <p className="text-sm text-orange-800 text-center">
                    <span className="font-semibold">✨ Enhanced Registration Forms</span><br/>
                    Both forms include comprehensive data collection for complete profile management
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Overview Tab */}
        {selectedTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="card">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <UsersIcon className="w-6 h-6 text-blue-600" />
                </div>
          <div>
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <UserGroupIcon className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Students</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.students}</p>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <UserGroupIcon className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Faculty</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.faculty}</p>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <UserPlusIcon className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Parents</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.parents}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Attendance System Tab */}
        {selectedTab === 'attendance' && (
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Attendance System Management
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-md font-semibold text-gray-800 mb-4">System Features</h4>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-center">
                    <AcademicCapIcon className="w-5 h-5 text-green-500 mr-2" />
                    QR Code based attendance scanning
                  </li>
                  <li className="flex items-center">
                    <UserGroupIcon className="w-5 h-5 text-green-500 mr-2" />
                    Real-time attendance tracking
                  </li>
                  <li className="flex items-center">
                    <ChartBarIcon className="w-5 h-5 text-green-500 mr-2" />
                    Automatic attendance percentage calculation
                  </li>
                  <li className="flex items-center">
                    <BellIcon className="w-5 h-5 text-green-500 mr-2" />
                    Parent notifications for low attendance
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-md font-semibold text-gray-800 mb-4">Quick Actions</h4>
                <div className="space-y-3">
                  <button className="btn-primary w-full">
                    View All Sessions
                  </button>
                  <button className="btn-secondary w-full">
                    Generate Reports
                  </button>
                  <button className="btn-secondary w-full">
                    Manage Courses
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Student Registration Form Modal */}
      <StudentRegistrationForm
        isOpen={showStudentForm}
        onClose={() => setShowStudentForm(false)}
        onSubmit={handleStudentFormSubmit}
      />
      
      {/* Faculty Registration Form Modal */}
      <FacultyRegistrationForm
        isOpen={showFacultyForm}
        onClose={() => setShowFacultyForm(false)}
        onSubmit={handleFacultyFormSubmit}
      />
    </div>
  );
};

export default AdminDashboard;
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  UsersIcon,
  ChartBarIcon,
  CreditCardIcon,
  BellIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  UserGroupIcon,
  DocumentTextIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import { User, Assignment, Payment } from '../types';

const AdminDashboard: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('overview');

  // Mock data for demonstration
  useEffect(() => {
    const mockUsers: User[] = [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'student',
        createdAt: new Date('2024-01-15'),
        photoURL: 'https://via.placeholder.com/40',
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'student',
        createdAt: new Date('2024-01-20'),
        photoURL: 'https://via.placeholder.com/40',
      },
      {
        id: '3',
        name: 'Mike Johnson',
        email: 'mike@example.com',
        role: 'student',
        createdAt: new Date('2024-02-01'),
        photoURL: 'https://via.placeholder.com/40',
      },
    ];

    const mockAssignments: Assignment[] = [
      {
        id: '1',
        studentId: '1',
        title: 'Physics Lab Report',
        subjectId: '1',
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
        studentId: '2',
        title: 'Mathematics Assignment',
        subjectId: '2',
        subjectName: 'Mathematics',
        pdfUrl: '',
        deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        status: 'completed',
        createdAt: new Date(),
        priority: 'medium',
        fileSize: 1.8,
        submissionType: 'assignment',
      },
    ];

    const mockPayments: Payment[] = [
      {
        id: '1',
        studentId: '1',
        amount: 99.99,
        date: new Date('2024-01-15'),
        method: 'Credit Card',
        status: 'completed',
      },
      {
        id: '2',
        studentId: '2',
        amount: 99.99,
        date: new Date('2024-01-20'),
        method: 'PayPal',
        status: 'completed',
      },
    ];

    setUsers(mockUsers);
    setAssignments(mockAssignments);
    setPayments(mockPayments);
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
    totalAssignments: assignments.length,
    completedAssignments: assignments.filter((a) => a.status === 'completed')
      .length,
    totalRevenue: payments.reduce((sum, payment) => sum + payment.amount, 0),
    activeUsers: users.filter(
      (user) =>
        new Date().getTime() - user.createdAt.getTime() <
        30 * 24 * 60 * 60 * 1000
    ).length,
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'users', name: 'User Management', icon: UsersIcon },
    { id: 'payments', name: 'Payments', icon: CreditCardIcon },
    { id: 'announcements', name: 'Announcements', icon: BellIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-orange-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                ampusFlow Admin
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <img
                  src={
                    currentUser?.photoURL || 'https://via.placeholder.com/32'
                  }
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
            Manage your CampusFlow platform and monitor student activities.
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

        {/* Overview Tab */}
        {selectedTab === 'overview' && (
          <div>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              <div className="card">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <UsersIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.totalUsers}
                    </p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <UserGroupIcon className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Active Users</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.activeUsers}
                    </p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <DocumentTextIcon className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Assignments</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.totalAssignments}
                    </p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <CalendarIcon className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.completedAssignments}
                    </p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <CreditCardIcon className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${stats.totalRevenue.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Recent Users
                </h3>
                <div className="space-y-3">
                  {users.slice(0, 5).map((user) => (
                    <div key={user.id} className="flex items-center space-x-3">
                      <img
                        src={user.photoURL || 'https://via.placeholder.com/32'}
                        alt={user.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {user.createdAt.toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Recent Payments
                </h3>
                <div className="space-y-3">
                  {payments.slice(0, 5).map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          ${payment.amount.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {payment.method}
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            payment.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {payment.status}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {payment.date.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Management Tab */}
        {selectedTab === 'users' && (
          <div>
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  User Management
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
                              src={
                                user.photoURL ||
                                'https://via.placeholder.com/32'
                              }
                              alt={user.name}
                              className="w-8 h-8 rounded-full"
                            />
                            <span className="font-medium text-gray-900">
                              {user.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-gray-700">
                          {user.email}
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              user.role === 'admin'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-gray-700">
                          {user.createdAt.toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex space-x-2">
                            <button className="text-primary hover:text-orange-600 text-sm font-medium flex items-center space-x-1">
                              <EyeIcon className="w-4 h-4" />
                              <span>View as Student</span>
                            </button>
                            <button className="text-gray-600 hover:text-gray-800 text-sm font-medium">
                              Edit
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
        )}

        {/* Payments Tab */}
        {selectedTab === 'payments' && (
          <div>
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Payment History
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">
                        Student
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">
                        Amount
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">
                        Method
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">
                        Date
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => {
                      const student = users.find(
                        (u) => u.id === payment.studentId
                      );
                      return (
                        <tr
                          key={payment.id}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-3">
                              <img
                                src={
                                  student?.photoURL ||
                                  'https://via.placeholder.com/32'
                                }
                                alt={student?.name}
                                className="w-8 h-8 rounded-full"
                              />
                              <span className="font-medium text-gray-900">
                                {student?.name}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-gray-700 font-semibold">
                            ${payment.amount.toFixed(2)}
                          </td>
                          <td className="py-4 px-4 text-gray-700">
                            {payment.method}
                          </td>
                          <td className="py-4 px-4 text-gray-700">
                            {payment.date.toLocaleDateString()}
                          </td>
                          <td className="py-4 px-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                payment.status === 'completed'
                                  ? 'bg-green-100 text-green-800'
                                  : payment.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {payment.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Announcements Tab */}
        {selectedTab === 'announcements' && (
          <div>
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Broadcast Announcements
                </h3>
                <button className="btn-primary">Send Announcement</button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Announcement Title
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Enter announcement title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    className="input-field"
                    rows={4}
                    placeholder="Enter your announcement message..."
                  />
                </div>
                <div className="flex space-x-3">
                  <button className="btn-secondary">Save Draft</button>
                  <button className="btn-primary">Send to All Students</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

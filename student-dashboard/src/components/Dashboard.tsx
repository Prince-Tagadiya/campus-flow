'use client';

import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { HeroCountdown } from './dashboard/HeroCountdown';
import { AssignmentsCard } from './dashboard/AssignmentsCard';
import { StorageCard } from './dashboard/StorageCard';
import { ProgressCard } from './dashboard/ProgressCard';
import { CalendarCard } from './dashboard/CalendarCard';
import { UploadModal } from './dashboard/UploadModal';
import {
  Assignment,
  StorageUsage,
  ProgressStats,
  CalendarEvent,
} from '@/types';
import { Bell, Settings, LogOut, User, Search } from 'lucide-react';

export function Dashboard() {
  const { data: session } = useSession();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data for demonstration
  useEffect(() => {
    const mockAssignments: Assignment[] = [
      {
        id: '1',
        title: 'Physics Lab Report',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        title: 'Mathematics Assignment',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '3',
        title: 'English Essay',
        dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago (overdue)
        status: 'overdue',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '4',
        title: 'Computer Science Project',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        status: 'submitted',
        fileUrl: '/files/project.pdf',
        fileName: 'project.pdf',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    setAssignments(mockAssignments);
  }, []);

  const filteredAssignments = assignments.filter((assignment) =>
    assignment.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const nearestDeadline = assignments
    .filter((a) => a.status === 'pending')
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())[0];

  const storageUsage: StorageUsage = {
    used: 450,
    total: 500,
    unit: 'MB',
  };

  const progressStats: ProgressStats = {
    submitted: assignments.filter((a) => a.status === 'submitted').length,
    pending: assignments.filter((a) => a.status === 'pending').length,
    total: assignments.length,
  };

  const calendarEvents: CalendarEvent[] = assignments.map((assignment) => ({
    id: assignment.id,
    title: assignment.title,
    date: assignment.dueDate,
    type: 'assignment',
    status: assignment.status,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-2 rounded-lg mr-3">
                <svg
                  className="h-8 w-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">CampusFlow</h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search assignments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent w-64"
                />
              </div>

              <div className="relative">
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Bell className="h-6 w-6" />
                </button>
              </div>

              <div className="relative group">
                <button className="flex items-center space-x-2 text-gray-700 hover:text-gray-900">
                  <img
                    src={session?.user?.image || '/default-avatar.png'}
                    alt="Profile"
                    className="h-8 w-8 rounded-full"
                  />
                  <span className="hidden md:block font-medium">
                    {session?.user?.name}
                  </span>
                </button>

                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <a
                    href="#"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </a>
                  <a
                    href="#"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </a>
                  <button
                    onClick={() => signOut()}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Countdown */}
        <HeroCountdown assignment={nearestDeadline} />

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Assignments Card - Takes 2 columns */}
          <div className="lg:col-span-2">
            <AssignmentsCard
              assignments={filteredAssignments}
              onUploadClick={() => setIsUploadModalOpen(true)}
            />
          </div>

          {/* Right Sidebar */}
          <div className="space-y-8">
            <StorageCard storage={storageUsage} />
            <ProgressCard stats={progressStats} />
            <CalendarCard events={calendarEvents} />
          </div>
        </div>
      </main>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={(assignment) => {
          setAssignments((prev) => [...prev, assignment]);
          setIsUploadModalOpen(false);
        }}
      />
    </div>
  );
}

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
}

export interface Assignment {
  id: string;
  title: string;
  dueDate: Date;
  status: 'pending' | 'submitted' | 'overdue';
  fileUrl?: string;
  fileName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StorageUsage {
  used: number;
  total: number;
  unit: 'MB' | 'GB';
}

export interface ProgressStats {
  submitted: number;
  pending: number;
  total: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: 'assignment' | 'deadline' | 'reminder';
  status?: 'pending' | 'submitted' | 'overdue';
}

export interface DashboardData {
  assignments: Assignment[];
  storageUsage: StorageUsage;
  progressStats: ProgressStats;
  upcomingDeadlines: Assignment[];
  calendarEvents: CalendarEvent[];
}

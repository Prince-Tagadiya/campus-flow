# CampusFlow - Student Management Platform

A modern, responsive student management platform built with React, TypeScript, and Firebase.

## Features

### 🎯 Student Dashboard

- **Interactive Dashboard**: Real-time overview of assignments, exams, and academic progress
- **Advanced Assignment Management**: Add, edit, delete, duplicate assignments with enhanced filtering
- **Smart Filtering System**: Filter by priority, subject, status with modern card-based UI
- **Exam Scheduling**: Manage exam dates, times, and locations with clickable exam cards
- **Subject Management**: Complete CRUD operations for subjects (Create, Read, Update, Delete)
- **Storage Management**: Monitor file storage usage with clean percentage display
- **Study Materials**: Organize and access study resources
- **Real-time Motivational Quotes**: API-powered inspirational quotes with refresh functionality
- **Notifications**: Stay updated with important academic reminders

### 🍔 Responsive Design

- **Mobile-First**: Optimized for all device sizes
- **Hamburger Menu**: Smooth mobile navigation with overlay
- **Modern UI**: Clean, intuitive interface with Tailwind CSS
- **Dark/Light Mode Ready**: Built with accessibility in mind

### 🔐 Authentication

- **Google Sign-In**: Secure authentication with Firebase
- **Role-Based Access**: Student and Admin dashboards
- **Profile Management**: Update personal information

### 📊 Admin Dashboard

- **User Management**: View and manage student accounts
- **Payment Tracking**: Monitor subscription payments
- **Analytics**: Platform usage statistics
- **Announcements**: Broadcast messages to students

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase project setup

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd campusflow
```

2. Install dependencies:

```bash
npm install
```

3. Set up Firebase configuration:

   - Create a Firebase project
   - Enable Authentication (Google provider)
   - Set up Firestore database
   - Update `src/firebase/config.ts` with your Firebase config

4. Start the development server:

```bash
npm start
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Dashboard Functionality

### Student Dashboard Features

#### 📋 Advanced Assignment Management

- **Add New Assignments**: Create assignments with title, subject, priority, and deadline
- **Edit Assignments**: Update existing assignments with pre-filled forms
- **Duplicate Assignments**: Clone assignments with one click
- **Smart Filtering**: Filter by priority (High/Medium/Low), subject, and status
- **Advanced Sorting**: Sort by deadline, subject, priority, status, or title (ascending/descending)
- **Status Management**: Mark assignments as completed or pending
- **PDF Integration**: View attached PDFs directly from assignments
- **Delete with Confirmation**: Remove assignments with safety confirmation
- **File Size Tracking**: Monitor assignment file sizes and storage usage

#### 📚 Enhanced Exam Management

- **Schedule Exams**: Create exams with date, time, and location
- **Exam Types**: Support for lecture, mid-term, and final exams
- **Interactive Exam Cards**: Click any exam to navigate to exam management page
- **Visual Countdown**: Track upcoming exams with day count display
- **Scrollable Content**: Handle long exam names and details gracefully
- **Orange Theme**: Beautiful orange-themed exam widgets
- **Gap Indicators**: Show time gaps between consecutive exams
- **Delete with Confirmation**: Remove exams with safety confirmation

#### 💾 Enhanced Storage Management

- **Visual Progress Bar**: Monitor storage usage with clean percentage display (1 decimal place)
- **Storage Breakdown**: View storage usage by assignment and file type
- **File Size Tracking**: Monitor individual file sizes and total storage limits
- **Color-Coded Alerts**: Visual indicators for storage levels (green/yellow/red)
- **Responsive Design**: Storage widgets adapt to different screen sizes

#### 📖 Study Materials

- Upload and organize study materials
- Categorize by subject
- Track file types and sizes

#### 🔔 Notifications

- View important academic reminders
- Mark notifications as read
- Track notification history

#### 🎓 Subject Management

- **Complete CRUD Operations**: Create, Read, Update, Delete subjects
- **Edit Subjects**: Update subject names and codes with pre-filled forms
- **Subject Statistics**: View assignment and exam counts per subject
- **Modern UI**: Clean card-based layout with edit/delete buttons
- **Form Validation**: Ensure data integrity with proper validation

#### 💪 Daily Motivation

- **Real-time Quotes**: API-powered motivational quotes from quotable.io
- **Refresh Functionality**: Get new quotes with smooth animations
- **Fallback System**: Local quotes when API is unavailable
- **Orange Theme**: Beautiful light orange gradient design
- **Smooth Animations**: Fade-in effects on quote refresh

### Mobile Responsiveness

The dashboard is fully responsive with:

- **Hamburger Menu**: Smooth slide-in navigation on mobile
- **Touch-Friendly**: Optimized for touch interactions
- **Adaptive Layout**: Content adjusts to screen size
- **Overlay Navigation**: Prevents accidental navigation

## 🚀 Latest Updates (v2.0)

### Major UI/UX Improvements
- **Enhanced Filter System**: Modern card-based filtering with color-coded indicators
- **Assignment Duplication**: One-click assignment cloning functionality
- **Real-time Motivational Quotes**: API integration with quotable.io
- **Interactive Exam Cards**: Clickable exam widgets with navigation
- **Subject CRUD Operations**: Complete subject management system
- **Storage Display Fix**: Clean percentage formatting (1 decimal place)
- **Responsive Design**: Improved mobile and tablet experience

### Bug Fixes
- Fixed assignment editing duplication issue
- Resolved Next Exam widget overflow problems
- Improved form state management
- Enhanced error handling and user feedback

### Performance Optimizations
- Better component rendering
- Optimized state management
- Improved loading states
- Enhanced user experience

## Technology Stack

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Auth
- **Database**: Firestore
- **Icons**: Heroicons
- **Build Tool**: Create React App
- **External APIs**: Quotable.io for motivational quotes

## Project Structure

```
src/
├── components/
│   ├── StudentDashboard.tsx    # Main student dashboard
│   ├── AdminDashboard.tsx      # Admin management panel
│   └── LandingPage.tsx         # Landing page
├── contexts/
│   └── AuthContext.tsx         # Authentication context
├── firebase/
│   └── config.ts              # Firebase configuration
├── types/
│   └── index.ts               # TypeScript type definitions
└── App.tsx                    # Main application component
```

## Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## Deployment

The project is ready for deployment to:

- Firebase Hosting
- Vercel
- Netlify
- Any static hosting service

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

---

**CampusFlow** - Empowering students with modern academic management tools.

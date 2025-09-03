# CampusFlow - Student Management Platform

A modern, responsive student management platform built with React, TypeScript, and Firebase.

## Features

### 🎯 Student Dashboard

- **Interactive Dashboard**: Real-time overview of assignments, exams, and academic progress
- **Assignment Management**: Add, edit, delete, and track assignment status
- **Exam Scheduling**: Manage exam dates, times, and locations
- **Storage Management**: Monitor file storage usage and limits
- **Study Materials**: Organize and access study resources
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

#### 📋 Assignment Management

- Add new assignments with title, subject, priority, and deadline
- Mark assignments as completed or pending
- Delete assignments with confirmation
- View assignment details and file sizes

#### 📚 Exam Management

- Schedule exams with date, time, and location
- Add notes and exam type (lecture, mid, final)
- Track upcoming exams with countdown
- Delete exams with confirmation

#### 💾 Storage Management

- Monitor storage usage with visual progress bar
- View storage breakdown by assignment
- Track file sizes and limits

#### 📖 Study Materials

- Upload and organize study materials
- Categorize by subject
- Track file types and sizes

#### 🔔 Notifications

- View important academic reminders
- Mark notifications as read
- Track notification history

### Mobile Responsiveness

The dashboard is fully responsive with:

- **Hamburger Menu**: Smooth slide-in navigation on mobile
- **Touch-Friendly**: Optimized for touch interactions
- **Adaptive Layout**: Content adjusts to screen size
- **Overlay Navigation**: Prevents accidental navigation

## Technology Stack

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Auth
- **Database**: Firestore
- **Icons**: Heroicons
- **Build Tool**: Create React App

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
